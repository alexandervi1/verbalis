from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, List
from dotenv import load_dotenv
import httpx
import json
import os

load_dotenv()

router = APIRouter(prefix="/api")

OLLAMA_URL = "http://localhost:11434"
MODEL = os.getenv("OLLAMA_MODEL", "gemma4:31b-cloud")
MAX_HISTORY = 10

BILINGUAL_RULES = (
    "LANGUAGE RULES (follow strictly):\n"
    "1. Detect the language the user writes in and always respond in that same language.\n"
    "2. Regardless of the response language, always write technical English terms in English "
    "followed by their Spanish translation in parentheses the first time they appear in the response. "
    "Example: 'A merge conflict (conflicto de fusión) occurs when...' or "
    "'Un endpoint (punto de acceso) es la URL donde...'.\n"
    "3. If the user writes in Spanish, respond fully in Spanish but keep all technical terms in English "
    "with their Spanish translation in parentheses on first use.\n"
    "4. If the user writes in English, respond fully in English. You may still add the Spanish "
    "translation in parentheses for key terms to reinforce bilingual learning.\n"
    "5. Your goal is to gradually teach technical English vocabulary, not to replace the user's language. "
    "Never force the user to switch languages.\n"
)

ANTI_HALLUCINATION_RULES = (
    "ACCURACY RULES (follow strictly):\n"
    "1. If you are not fully certain about a definition, a code example, a library name, "
    "or any technical fact, say explicitly: "
    "'No estoy seguro de esto, te recomiendo verificarlo en la documentación oficial' "
    "(or in English: 'I am not fully certain about this — please verify it in the official documentation'). "
    "Never guess or fabricate technical information.\n"
    "2. Never invent library names, function names, API endpoints, or code examples that you are not "
    "certain exist. If you provide a code snippet, only use syntax and APIs you are confident are real "
    "and correct. If in doubt, describe the concept in plain language instead of writing code.\n"
    "3. If the user's question is outside the domain of this career specialization, do not attempt to "
    "answer it. Instead, redirect the user. Example: 'Esa pregunta está fuera del área de Ingeniería "
    "de Software. Te sugiero consultar a un tutor especializado en ese tema.' "
    "Do not answer questions about unrelated fields, general trivia, or topics outside technical "
    "English for engineering.\n"
    "4. If a word or term does not have a real, verifiable technical meaning in software engineering, "
    "you MUST respond that it is not a technical term and redirect the user. Never invent or fabricate "
    "technical meanings for non-technical words. When in doubt, say you are not sure and recommend "
    "checking official documentation. This is a strict rule with no exceptions.\n"
)

SYSTEM_PROMPTS = {
    "software_engineering": (
        "You are a bilingual technical English tutor specialized in Software Engineering. "
        "You help engineering students learn technical English vocabulary used in software development. "
        "Focus on terminology related to programming, software architecture, databases, APIs, "
        "version control, agile methodologies, testing, DevOps, and software design patterns. "
        "Keep responses concise, educational, and relevant to software engineering practice.\n\n"
        + BILINGUAL_RULES
        + "\n"
        + ANTI_HALLUCINATION_RULES
    ),
    "electronics": (
        "You are a bilingual technical English tutor specialized in Electronics Engineering. "
        "You help engineering students learn technical English vocabulary used in electronics. "
        "Focus on terminology related to circuits, microcontrollers, signal processing, "
        "digital and analog electronics, sensors, PCB design, power systems, and embedded systems. "
        "Keep responses concise, educational, and relevant to electronics engineering practice.\n\n"
        + BILINGUAL_RULES
        + "\n"
        + ANTI_HALLUCINATION_RULES
    ),
}

DEFAULT_SYSTEM_PROMPT = (
    "You are a bilingual technical English tutor for engineering students. "
    "Help students learn technical English vocabulary and concepts across engineering disciplines. "
    "Keep responses concise and educational.\n\n"
    + BILINGUAL_RULES
    + "\n"
    + ANTI_HALLUCINATION_RULES
)

sessions: Dict[str, List[dict]] = {}


class ChatRequest(BaseModel):
    message: str
    career: str
    session_id: str


class ClearRequest(BaseModel):
    session_id: str


@router.post("/chat/clear")
async def clear_chat(request: ClearRequest):
    sessions.pop(request.session_id, None)
    return {"status": "ok"}


@router.post("/chat")
async def chat(request: ChatRequest):
    system_prompt = SYSTEM_PROMPTS.get(request.career, DEFAULT_SYSTEM_PROMPT)

    history = sessions.setdefault(request.session_id, [])
    history.append({"role": "user", "content": request.message})

    payload = {
        "model": MODEL,
        "messages": [{"role": "system", "content": system_prompt}] + history[-MAX_HISTORY:],
        "stream": True,
        "options": {"num_ctx": 8192, "temperature": 0.3},
    }

    tokens: List[str] = []

    async def generate():
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", f"{OLLAMA_URL}/api/chat", json=payload) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            data = json.loads(line)
                            token = data.get("message", {}).get("content", "")
                            if token:
                                tokens.append(token)
                                yield token
                            if data.get("done"):
                                break
                        except json.JSONDecodeError:
                            pass
            history.append({"role": "assistant", "content": "".join(tokens)})
            if len(history) > MAX_HISTORY:
                del history[:-MAX_HISTORY]
        except httpx.ConnectError:
            yield "\n[Error: No se puede conectar a Ollama. Asegúrate de que esté corriendo en http://localhost:11434]"
        except httpx.HTTPStatusError as e:
            yield f"\n[Error de Ollama: {e.response.status_code}]"

    return StreamingResponse(generate(), media_type="text/plain")

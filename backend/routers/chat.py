from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, List
import httpx
import json

router = APIRouter(prefix="/api")

OLLAMA_URL = "http://localhost:11434"
MODEL = "gemma3:12b"
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

SYSTEM_PROMPTS = {
    "software_engineering": (
        "You are a bilingual technical English tutor specialized in Software Engineering. "
        "You help engineering students learn technical English vocabulary used in software development. "
        "Focus on terminology related to programming, software architecture, databases, APIs, "
        "version control, agile methodologies, testing, DevOps, and software design patterns. "
        "Keep responses concise, educational, and relevant to software engineering practice.\n\n"
        + BILINGUAL_RULES
    ),
    "electronics": (
        "You are a bilingual technical English tutor specialized in Electronics Engineering. "
        "You help engineering students learn technical English vocabulary used in electronics. "
        "Focus on terminology related to circuits, microcontrollers, signal processing, "
        "digital and analog electronics, sensors, PCB design, power systems, and embedded systems. "
        "Keep responses concise, educational, and relevant to electronics engineering practice.\n\n"
        + BILINGUAL_RULES
    ),
}

DEFAULT_SYSTEM_PROMPT = (
    "You are a bilingual technical English tutor for engineering students. "
    "Help students learn technical English vocabulary and concepts across engineering disciplines. "
    "Keep responses concise and educational.\n\n"
    + BILINGUAL_RULES
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
        "options": {"num_ctx": 8192},
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

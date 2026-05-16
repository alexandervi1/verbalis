from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, dictionary, learning, pdf

app = FastAPI(title="Verbalis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(dictionary.router, prefix="/api/dictionary", tags=["Dictionary"])
app.include_router(learning.router, prefix="/api/learning", tags=["Learning"])
app.include_router(pdf.router, prefix="/api/pdf", tags=["PDF"])


@app.get("/health")
async def health():
    return {"status": "ok"}

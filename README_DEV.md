# Verbalis — Guía de desarrollo local

## Requisitos previos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Python | 3.11 | https://www.python.org |
| Node.js | 18 LTS | https://nodejs.org |
| Ollama | Última | https://ollama.com |
| Modelo Gemma | gemma3:12b | ver paso 1 |

---

## 1. Ollama — modelo de lenguaje

Descarga el modelo:

```bash
ollama pull gemma3:12b
```

Inicia el servidor (por defecto escucha en http://localhost:11434):

```bash
ollama serve
```

Prueba rápida:

```bash
curl http://localhost:11434/api/generate -d '{"model":"gemma3:12b","prompt":"hello","stream":false}'
```

---

## 2. Backend — FastAPI

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Instalar dependencias
pip install fastapi uvicorn httpx

# Correr el servidor
uvicorn main:app --reload --port 8000
```

El backend queda disponible en **http://localhost:8000**

### Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Verificación de estado |
| `POST` | `/api/chat` | Chat con streaming — ver body abajo |
| `POST` | `/api/chat/clear` | Limpia el historial de una sesión |

**Body de `/api/chat`:**
```json
{
  "message": "What is an API?",
  "career": "software_engineering",
  "session_id": "uuid-generado-en-el-frontend"
}
```
La respuesta es `text/plain` en streaming (tokens conforme los genera Ollama).

**Body de `/api/chat/clear`:**
```json
{ "session_id": "uuid-de-la-sesion" }
```

Documentación interactiva (Swagger): http://localhost:8000/docs

---

## 3. Frontend — React + Vite + Tailwind

```bash
cd frontend

# Instalar dependencias
npm install

# Correr el servidor de desarrollo
npm run dev
```

El frontend queda disponible en **http://localhost:5173**

El proxy de Vite redirige `/api/*` → `http://localhost:8000` automáticamente.

---

## 4. Flujo de la aplicación

```
Landing  →  Selección de carrera  →  App principal
  /              /career                /app
```

Desde `/app` el sidebar permite navegar entre:
- **Diccionario** — búsqueda de términos técnicos
- **Chatbot** — chat con gemma3:12b, system prompt bilingüe adaptado a la carrera
- **Objetos de aprendizaje** — lecciones y ejercicios
- **PDF** — visor de documentos técnicos

---

## 5. Variables de configuración

Todas en `backend/main.py`:

| Constante | Valor por defecto | Descripción |
|-----------|-------------------|-------------|
| `OLLAMA_URL` | `http://localhost:11434` | URL del servidor Ollama |
| `MODEL` | `gemma3:12b` | Modelo a usar |
| `MAX_HISTORY` | `10` | Máximo de mensajes del historial enviados a Ollama |
| `num_ctx` | `8192` | Context window en tokens (en `options` del payload) |

Puertos:

| Servicio | Puerto | Dónde cambiar |
|----------|--------|---------------|
| Backend | `8000` | argumento `--port` en uvicorn |
| Frontend | `5173` | `vite.config.js` → `server.port` |

---

## 6. Estructura de carpetas

```
verbalis/
├── backend/
│   ├── main.py              # API FastAPI — chat streaming, memoria de sesión
│   ├── requirements.txt
│   └── venv/                # Entorno virtual (ignorado en git)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── CareerSelect.jsx
│   │   │   └── MainApp.jsx
│   │   └── components/
│   │       ├── Sidebar.jsx
│   │       └── modules/
│   │           ├── Chatbot.jsx        # Streaming, memoria, Markdown, bilingüe
│   │           ├── Dictionary.jsx
│   │           ├── LearningObjects.jsx
│   │           └── PDF.jsx
│   ├── tailwind.config.js   # Incluye animación fade-in-up
│   ├── vite.config.js       # Proxy /api → backend
│   └── package.json
├── inference_rules.json     # Reglas de inferencia
├── software_engineering.json # Ontología base
├── .gitignore
├── README.md
└── README_DEV.md
```

---

## 7. Verificación rápida

Con los tres servicios corriendo (Ollama + backend + frontend):

```bash
# Verificar backend
curl http://localhost:8000/health

# Probar chat (respuesta en streaming)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is an API?", "career": "software_engineering", "session_id": "test-session-1"}'

# Limpiar sesión
curl -X POST http://localhost:8000/api/chat/clear \
  -H "Content-Type: application/json" \
  -d '{"session_id": "test-session-1"}'
```

---

## Notas del equipo

- Los archivos `inference_rules.json` y `software_engineering.json` en la raíz son la base de conocimiento del proyecto. No modificarlos directamente; extender la ontología siguiendo el formato ya establecido.
- El `venv/` del backend está excluido de git. Cada integrante debe crearlo localmente con los pasos del punto 2.
- El historial de sesión del chatbot es **en memoria**: se pierde al reiniciar el backend. Para persistencia real se necesitaría una base de datos.
- La carpeta `.claude/` está excluida de git (configuración del editor).

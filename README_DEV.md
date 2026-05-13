# Verbalis — Guía de desarrollo local

## Requisitos previos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Python | 3.11 | https://www.python.org |
| Node.js | 18 LTS | https://nodejs.org |
| Ollama | Última | https://ollama.com |
| Modelo Gemma | gemma3:12b | ver paso 3 |

---

## 1. Ollama — modelo de lenguaje

Instala Ollama y descarga el modelo:

```bash
ollama pull gemma3:12b
```

Verifica que esté corriendo (por defecto escucha en http://localhost:11434):

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
pip install -r requirements.txt

# Correr el servidor
uvicorn main:app --reload --port 8000
```

El backend queda disponible en **http://localhost:8000**

- `GET  /health`   → `{ "status": "ok" }`
- `POST /api/chat` → `{ "message": "...", "career": "software_engineering" | "electronics" }`

Documentación interactiva (Swagger): http://localhost:8000/docs

---

## 3. Frontend — React + Vite + Tailwind

```bash
cd frontend

# Instalar dependencias de Node
npm install

# Correr el servidor de desarrollo
npm run dev
```

El frontend queda disponible en **http://localhost:5173**

El proxy de Vite redirige `/api/*` → `http://localhost:8000` automáticamente, por lo que no se necesita configuración adicional para la comunicación frontend ↔ backend.

---

## 4. Flujo de la aplicación

```
Landing  →  Selección de carrera  →  App principal
  /              /carreras                /app
```

Desde `/app` el sidebar permite navegar entre:
- **Diccionario** — búsqueda de términos técnicos (placeholder)
- **Chatbot** — chat con gemma3:12b, system prompt adaptado a la carrera elegida
- **Objetos de aprendizaje** — lecciones y ejercicios (placeholder)
- **PDF** — visor de documentos técnicos (placeholder)

---

## 5. Variables de entorno

Por defecto los servicios corren en estos puertos. Si necesitas cambiarlos:

| Variable | Valor por defecto | Dónde cambiar |
|---|---|---|
| Backend port | `8000` | argumento `--port` en uvicorn |
| Frontend port | `5173` | `vite.config.js` → `server.port` |
| Ollama URL | `http://localhost:11434` | `backend/main.py` → `OLLAMA_URL` |
| Modelo | `gemma3:12b` | `backend/main.py` → `MODEL` |

---

## 6. Estructura de carpetas

```
verbalis/
├── backend/
│   ├── main.py              # API FastAPI (health + chat)
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
│   │           ├── Chatbot.jsx
│   │           ├── Dictionary.jsx
│   │           ├── LearningObjects.jsx
│   │           └── PDF.jsx
│   ├── vite.config.js       # Proxy /api → backend
│   └── package.json
├── inference_rules.json     # Reglas de inferencia (no modificar)
├── software_engineering.json # Ontología (no modificar)
└── README_DEV.md
```

---

## 7. Comandos de verificación rápida

Con los tres servicios corriendo (Ollama + backend + frontend):

```bash
# Verificar backend
curl http://localhost:8000/health

# Probar chat desde terminal
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is an API?", "career": "software_engineering"}'
```

---

## Notas del equipo

- Los archivos `inference_rules.json` y `software_engineering.json` en la raíz son la base de conocimiento del proyecto. No modificarlos directamente; extender la ontología siguiendo el formato `version + terms[]` ya establecido.
- El `venv/` del backend está excluido de git. Cada integrante debe crearlo localmente con los pasos del punto 2.

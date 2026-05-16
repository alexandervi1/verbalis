# Guía técnica del equipo — Verbalis

Este documento explica cómo configurar el entorno, agregar tu módulo y trabajar en el proyecto sin pisar el código de los demás.

---

## 1. Clonar el repo y levantar el proyecto

### Clonar

```bash
git clone https://github.com/<usuario>/verbalis.git
cd verbalis
```

### Levantar Ollama (terminal 1)

Instala Ollama desde https://ollama.com, luego:

```bash
ollama serve   # deja esta terminal abierta
```

El modelo por defecto es `gemma4:31b-cloud` — **no requiere descarga**. Si quieres usar un modelo local, ver la sección 7.

### Levantar el backend (terminal 2)

```bash
cd backend

# Crear entorno virtual (solo la primera vez)
python -m venv venv

# Activar — Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Instalar dependencias (solo la primera vez)
pip install -r requirements.txt

# Iniciar el servidor
uvicorn main:app --reload --port 8000
```

Verifica que funciona:
```bash
curl http://localhost:8000/health
# → {"status":"ok"}
```

### Levantar el frontend (terminal 3)

```bash
cd frontend
npm install   # solo la primera vez
npm run dev
```

Abre **http://localhost:5173** en el navegador.

> El proxy de Vite (`vite.config.js`) redirige automáticamente `/api/*` → `http://localhost:8000`, por lo que el frontend y el backend se comunican sin configuración extra.

---

## 2. Crear tu router en `/backend/routers/`

Cada módulo tiene su propio archivo en `routers/`. El diccionario ya está implementado — úsalo como referencia.

> **Referencia:** Ver `backend/routers/dictionary.py` para el patrón completo: carga de ontología por carrera, validación de estructura y manejo de errores.

### Ejemplo para módulos pendientes: `routers/learning.py`

```python
from fastapi import APIRouter, HTTPException, Query
from pathlib import Path
import json

router = APIRouter()

KB_PATH = Path(__file__).parent.parent / "knowledge_base"

@router.get("/terms")
async def get_terms(career: str = Query(...)):
    file_path = KB_PATH / f"{career}.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Carrera '{career}' no encontrada.")
    with open(file_path, encoding="utf-8") as f:
        data = json.load(f)
    return {"terms": data.get("terms", [])}

# Agrega aquí tus endpoints de lecciones, quizes, etc.
```

Los routers no llevan `prefix` propio — el prefijo (`/api/learning`, `/api/pdf`) ya está configurado en `main.py`.

---

## 3. Registrar tu router en `main.py`

`main.py` solo tiene la configuración de la app y los imports de routers. **No pongas lógica de negocio aquí.**

```python
# backend/main.py  — estado actual
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

app.include_router(chat.router,       tags=["Chat"])
app.include_router(dictionary.router, prefix="/api/dictionary", tags=["Dictionary"])
app.include_router(learning.router,   prefix="/api/learning",   tags=["Learning"])
app.include_router(pdf.router,        prefix="/api/pdf",        tags=["PDF"])

@app.get("/health")
async def health():
    return {"status": "ok"}
```

> Los 4 routers ya están registrados. **No necesitas modificar `main.py`** — solo trabaja en tu archivo en `routers/` y tu componente en `frontend/src/components/modules/`.

Verifica que tus rutas quedaron registradas:
```bash
# Con el servidor corriendo:
curl http://localhost:8000/openapi.json | python -m json.tool | grep '"path"'
```

> Avisa en el grupo antes de tocar `main.py`. Es el único archivo que todos comparten.

---

## 4. Crear tu componente en `/frontend/src/components/modules/`

### Estructura mínima

Todos los componentes de módulo reciben la prop `career` con uno de estos valores: `"software_engineering"`, `"electronics_engineering"` o `"civil_engineering"`. Úsala para filtrar el contenido.

> **Referencia:** Ver `frontend/src/components/modules/Dictionary.jsx` para el patrón completo: fetch de la API, estados de carga/error y renderizado de términos.

```jsx
// Estructura mínima para módulos pendientes (LearningObjects, PDF)
import { useState, useEffect } from 'react'

export default function LearningObjects({ career }) {
  const [terms, setTerms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/learning/terms?career=${career}`)
      .then(res => res.json())
      .then(data => { setTerms(data.terms); setLoading(false) })
  }, [career])

  if (loading) return <div className="p-6 text-slate-400">Cargando...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      {/* tu implementación aquí */}
    </div>
  )
}
```

### Conectar al sidebar — dos pasos

El sidebar y el enrutador de módulos ya están configurados. Solo tienes que verificar que tu módulo ya está declarado en ambos archivos.

**`Sidebar.jsx`** — array `navItems` (ya incluye los 4 módulos):
```jsx
const navItems = [
  { id: 'dictionary', label: 'Diccionario',           icon: '📖' },
  { id: 'chatbot',    label: 'Chatbot',                icon: '🤖' },
  { id: 'learning',   label: 'Objetos de aprendizaje', icon: '🎓' },
  { id: 'pdf',        label: 'PDF',                    icon: '📄' },
]
```

**`pages/MainApp.jsx`** — objeto `modules` (ya incluye los 4 módulos):
```jsx
import Dictionary    from '../components/modules/Dictionary'
import Chatbot       from '../components/modules/Chatbot'
import LearningObjects from '../components/modules/LearningObjects'
import PDF           from '../components/modules/PDF'

const modules = {
  dictionary: Dictionary,
  chatbot:    Chatbot,
  learning:   LearningObjects,
  pdf:        PDF,
}
```

Tu módulo ya está conectado. Solo reemplaza el contenido del placeholder en tu archivo `.jsx`.

### Llamar a tu endpoint desde el componente

```jsx
import { useState, useEffect } from 'react'

export default function Dictionary({ career }) {
  const [terms, setTerms] = useState([])

  useEffect(() => {
    fetch(`/api/dictionary/terms?career=${career}`)
      .then((res) => res.json())
      .then((data) => setTerms(data.terms))
  }, [career])

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      {/* renderiza terms */}
    </div>
  )
}
```

El proxy de Vite redirige `/api/...` al backend automáticamente, sin necesidad de especificar `http://localhost:8000`.

---

## 5. Primer commit en tu rama feature

```bash
# 1. Asegúrate de estar en main y tener el código más reciente
git checkout main
git pull origin main

# 2. Crea tu rama
git checkout -b feature/dictionary   # o feature/learning, feature/pdf

# 3. Trabaja en tu módulo...

# 4. Cuando tengas algo que mostrar, agrega tus archivos
git add backend/routers/dictionary.py
git add frontend/src/components/modules/Dictionary.jsx

# 5. Commit descriptivo
git commit -m "feat(dictionary): agregar endpoint GET /api/dictionary/terms"

# 6. Subir la rama
git push -u origin feature/dictionary
```

Nunca hagas `git add .` sin revisar qué archivos incluye — podrías subir el `venv/`, archivos `.env` u otros que deben estar en `.gitignore`.

---

## 6. Consumir la ontología desde `/backend/knowledge_base/`

La ontología está en `backend/knowledge_base/software_engineering.json`. Su estructura es:

```json
{
  "domain": "software_engineering",
  "label": "Ingeniería de Software",
  "version": "1.0.0",
  "terms": [
    {
      "id": "term_001",
      "term": "API",
      "full_form": "Application Programming Interface",
      "definition_en": "A set of rules and protocols that allows different software applications to communicate with each other.",
      "definition_es": "Conjunto de reglas y protocolos que permite que diferentes aplicaciones de software se comuniquen entre sí.",
      "category": "architecture",
      "difficulty": "intermediate",
      "related_terms": ["term_002", "term_003"],
      "examples": [
        "A weather app uses a REST API to fetch temperature data."
      ],
      "tags": ["web", "integration", "backend"]
    }
  ]
}
```

### Patrón recomendado: cargar una sola vez

Carga el JSON al inicio del módulo (fuera de la función del endpoint) para no leerlo del disco en cada request:

```python
from pathlib import Path
import json

_KB_PATH = Path(__file__).parent.parent / "knowledge_base" / "software_engineering.json"
with open(_KB_PATH, encoding="utf-8") as f:
    _KB = json.load(f)

TERMS = {t["id"]: t for t in _KB["terms"]}  # índice por ID para búsqueda O(1)
```

### Buscar por término (búsqueda parcial)

```python
@router.get("/dictionary/search")
async def search(q: str, career: str = "software_engineering"):
    q_lower = q.lower()
    results = [
        t for t in _KB["terms"]
        if q_lower in t["term"].lower()
        or q_lower in t["definition_en"].lower()
        or q_lower in t.get("definition_es", "").lower()
    ]
    return {"query": q, "results": results}
```

### Obtener términos relacionados

Cada término tiene `related_terms` con una lista de IDs. Para resolverlos:

```python
@router.get("/dictionary/terms/{term_id}/related")
async def get_related(term_id: str):
    term = TERMS.get(term_id)
    if not term:
        raise HTTPException(status_code=404, detail="Término no encontrado")
    related = [TERMS[rid] for rid in term["related_terms"] if rid in TERMS]
    return {"term": term["term"], "related": related}
```

> No modifiques los JSON de la ontología directamente. Si necesitas agregar términos o cambiar la estructura, habla primero con el coordinador.

---

## 7. Cambiar el modelo de IA

El modelo que usa el backend se configura en `backend/.env`. No necesitas tocar ningún archivo de código.

```bash
# backend/.env
OLLAMA_MODEL=gemma4:31b-cloud   # valor por defecto
```

Al clonar el repo por primera vez, crea tu `.env` desde la plantilla:

```bash
cd backend
cp .env.example .env   # macOS / Linux
copy .env.example .env # Windows PowerShell
```

### Opciones según tu máquina

| Situación | Modelo recomendado | Requiere descarga |
|---|---|---|
| Setup estándar del proyecto (default) | `gemma4:31b-cloud` | **No** — corre en servidores de Ollama |
| Máquina con GPU — modelo local potente | `gemma3:12b` | Sí — `ollama pull gemma3:12b` (~8 GB) |
| Máquina sin GPU — modelo local ligero | `gemma3:1b` | Sí — `ollama pull gemma3:1b` |

### Modelo cloud (sin descarga)

Si tu máquina no puede correr un modelo local, puedes usar un modelo cloud de Ollama. Solo cambia el valor en tu `.env`:

```env
OLLAMA_MODEL=gemma4:31b-cloud
```

Ventajas del modelo cloud:
- No ocupa espacio en disco ni RAM de tu máquina
- No necesitas GPU
- El servidor de Ollama (`ollama serve`) sigue siendo el mismo — el backend no cambia

Desventajas:
- Requiere conexión a internet durante el uso
- Latencia ligeramente mayor que un modelo local

### Modelo ligero local (`gemma3:1b`)

Si prefieres correr todo localmente pero tu máquina es limitada:

```bash
ollama pull gemma3:1b
```

Luego en `backend/.env`:

```env
OLLAMA_MODEL=gemma3:1b
```

Es más rápido y liviano, aunque las respuestas son menos detalladas que `gemma4:31b-cloud`.

> Cada integrante puede tener un `.env` diferente según su máquina. El archivo está en `.gitignore` y no se sube al repo, así que no afecta a los demás.

---

## 8. Reglas del equipo

### Lo que no se toca sin avisar

| Archivo / carpeta | Por qué |
|---|---|
| `backend/main.py` | Punto de entrada de toda la API; un error aquí rompe todo |
| `frontend/src/pages/MainApp.jsx` | Conecta todos los módulos; cambios no coordinados rompen el enrutamiento |
| `frontend/src/components/Sidebar.jsx` | Compartido por todos los módulos |
| `backend/knowledge_base/*.json` | Base de conocimiento del proyecto; cambios deben ser versionados |

Si necesitas cambiar alguno de estos archivos, avisa en el grupo **antes** de hacerlo.

### Una rama por módulo

```
feature/dictionary
feature/chatbot
feature/learning
feature/pdf
```

No trabajes en la rama de otro. Si necesitas algo de su módulo, pídele que lo exponga como endpoint o componente.

### Commits descriptivos

Formato: `tipo(módulo): descripción corta`

```bash
# Bien
git commit -m "feat(dictionary): búsqueda por término con filtro de carrera"
git commit -m "fix(dictionary): corregir índice de términos relacionados"
git commit -m "style(dictionary): ajustar padding de cards según diseño"

# Mal
git commit -m "cambios"
git commit -m "fix"
git commit -m "wip"
```

Tipos válidos: `feat` (nueva funcionalidad), `fix` (corrección), `style` (solo visual), `refactor`, `docs`.

### Antes de hacer push

```bash
# Verifica que el backend levanta sin errores
cd backend && uvicorn main:app --reload

# Verifica que el frontend compila sin errores
cd frontend && npm run build
```

Si algo falla en `main` por tu causa, es tu responsabilidad arreglarlo el mismo día.

---

*Dudas técnicas → abrir un Issue en GitHub con el label de tu módulo.*

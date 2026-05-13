# 🧠 Verbalis
### Plataforma de aprendizaje de inglés técnico para estudiantes de ingeniería
> Proyecto final — Asignatura: Base de Conocimiento

---

## 📌 ¿Qué es Verbalis?

Verbalis es una aplicación web que ayuda a estudiantes de ingeniería a aprender y comprender terminología técnica en inglés. Combina una base de conocimiento estructurada (ontología), reglas de inferencia y un modelo de IA local para ofrecer una experiencia de aprendizaje personalizada.

---

## 🏗️ Arquitectura general

```
verbalis/
├── frontend/               # React + Tailwind CSS
│   └── src/
│       ├── components/
│       │   ├── Sidebar/        # Navegación entre módulos
│       │   ├── Dictionary/     # Módulo 1
│       │   ├── Chatbot/        # Módulo 2
│       │   ├── Learning/       # Módulo 3
│       │   └── PDF/            # Módulo 4
│       ├── pages/
│       ├── styles/
│       └── utils/
├── backend/                # FastAPI (Python)
│   ├── routers/            # Endpoints por módulo
│   ├── models/             # Modelos de datos
│   ├── services/           # Lógica de negocio
│   └── knowledge_base/
│       ├── ontology/       # JSONs de la base de conocimiento
│       └── rules/          # Reglas de inferencia
├── docs/                   # Documentación del proyecto
└── scripts/                # Scripts de utilidad
```

---

## 👥 División de trabajo

| Persona | Módulo | Responsabilidad |
|--------|--------|----------------|
| **[Tu nombre]** | Base + Coordinación | Estructura del repo, base de conocimiento (ontología), integración Ollama, sidebar |
| **Persona 2** | Diccionario | Búsqueda, visualización de términos, relaciones ontológicas |
| **Persona 3** | Chatbot | Interfaz de chat, prompts, memoria de sesión |
| **Persona 4** | Objetos de aprendizaje | Flashcards, quizes, reglas de refuerzo |
| **Persona 5** | PDF | Visor de PDF, selección de texto, panel de definición |

---

## 🗓️ Cronograma

### Semana 1 — Fundamentos
- [ ] Todos: clonar el repo, instalar dependencias, correr el proyecto base
- [ ] Base: montar FastAPI + React + Ollama funcionando juntos
- [ ] Base: ontología inicial lista con al menos 3 carreras (Software, Electrónica, una más)
- [ ] Módulos 1-4: diseño de su interfaz (pueden usar Figma o dibujo a mano)

### Semana 2 — Implementación
- [ ] Cada persona implementa su módulo sobre la base
- [ ] Check-in a mitad de semana: todos muestran avance
- [ ] No bloquear a nadie: si necesitas algo de la base, pedirlo el día 1 de la semana

### Semana 3 — Integración y demo
- [ ] Integrar todos los módulos
- [ ] Pruebas básicas de flujo completo
- [ ] Preparar demo para el profesor
- [ ] Documentar justificación académica (ver sección abajo)

---

## 🤖 Modelo de IA local

**Modelo:** Gemma 3 12B (cuantizado Q4)
**Herramienta:** [Ollama](https://ollama.com)

### Instalación rápida
```bash
# 1. Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# 2. Descargar el modelo
ollama pull gemma3:12b

# 3. Verificar que corre
ollama run gemma3:12b "Hello, what is an API?"
```

### Cómo llamar al modelo desde el backend
```python
import httpx

async def query_ollama(prompt: str, context: str = "") -> str:
    system_prompt = f"""You are a technical English assistant specialized in {context}.
    Only respond about terminology and concepts related to that field.
    Always provide: literal definition, contextual meaning, and one example."""
    
    response = await httpx.post("http://localhost:11434/api/generate", json={
        "model": "gemma3:12b",
        "prompt": prompt,
        "system": system_prompt,
        "stream": False
    })
    return response.json()["response"]
```

---

## 🧠 Justificación académica — Base de Conocimiento

### ¿Dónde está la base de conocimiento?

**1. Ontología del diccionario** (`/backend/knowledge_base/ontology/`)
Cada carrera tiene su propio JSON estructurado con:
- Términos con definiciones en inglés y español
- Relaciones entre términos (`related_terms`)
- Categorías semánticas
- Niveles de dificultad
- Etiquetas para búsqueda facetada

Esto no es una lista plana de palabras. Es una **representación del conocimiento** con relaciones explícitas entre conceptos.

**2. Reglas de inferencia** (`/backend/knowledge_base/rules/`)
El sistema aplica reglas lógicas como:
- Si el usuario busca término X → sugerir términos relacionados
- Si el usuario falla una palabra 2 veces → reforzarla en la siguiente sesión
- Si una palabra aparece en un PDF y está en la ontología → usar definición estructurada en vez del modelo

**3. Sistema experto en el chatbot**
El prompt invisible que instancia el chatbot según la carrera elegida actúa como un **sistema de reglas de dominio**. Define el alcance del agente y sus restricciones de respuesta.

**4. Razonamiento en objetos de aprendizaje**
El módulo de aprendizaje infiere el nivel del usuario en base a su historial de respuestas y adapta el contenido (más fácil, más difícil, repaso).

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Tailwind CSS |
| Backend | FastAPI (Python 3.11+) |
| IA local | Ollama + Gemma 3 12B Q4 |
| Base de conocimiento | JSON estructurado (ontología) |
| Visor PDF | pdf.js |
| Base de datos | SQLite (solo si se necesita persistencia) |
| Control de versiones | Git + GitHub |

---

## ⚙️ Cómo correr el proyecto

### Requisitos
- Node.js 18+
- Python 3.11+
- Ollama instalado con gemma3:12b descargado

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn httpx python-multipart
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📋 Reglas del equipo (leer antes de codear)

1. **Una rama por módulo:** `feature/dictionary`, `feature/chatbot`, `feature/learning`, `feature/pdf`
2. **No tocar código ajeno** sin avisar primero en el grupo
3. **Commits descriptivos:** `feat: agregar búsqueda por categoría en diccionario`
4. **Si algo de la base no está listo**, avisa al coordinador, no lo inventes por tu cuenta
5. **Cada módulo tiene su propio router** en `/backend/routers/` y su propia carpeta en `/frontend/src/components/`
6. **Preguntas técnicas** → abrir un Issue en GitHub, no solo por WhatsApp

---

## 📄 Módulos — Descripción rápida

### Módulo 1: Diccionario
- Lista de términos técnicos filtrada por carrera
- Búsqueda en tiempo real
- Card con: término, definición EN, botón traducir (ES), términos relacionados
- Sin IA: solo consulta a la ontología JSON

### Módulo 2: Chatbot
- Interfaz de chat con historial de mensajes
- Prompt invisible precargado según carrera seleccionada
- Respuestas del modelo Gemma 3 12B
- Soporte texto (imágenes si alcanza el tiempo)

### Módulo 3: Objetos de aprendizaje
- Flashcards de vocabulario
- Quiz de opción múltiple (preguntas generadas por IA)
- Completar la frase
- Regla de refuerzo: si fallas 2 veces → la palabra vuelve al final

### Módulo 4: Trabajar con PDF
- Subir PDF y visualizarlo en pantalla
- Seleccionar texto → panel lateral con: definición literal, definición en contexto, ejemplos
- Campo para preguntar más a la IA sobre lo seleccionado
- Consulta primero la ontología; si no encuentra, va al modelo

---

*Verbalis — Base de Conocimiento aplicada al aprendizaje de inglés técnico*

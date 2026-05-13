# Verbalis
### Plataforma de aprendizaje de inglés técnico para estudiantes de ingeniería
> Proyecto final — Asignatura: Base de Conocimiento

---

## ¿Qué es Verbalis?

Verbalis es una aplicación web que ayuda a estudiantes de ingeniería a aprender y comprender terminología técnica en inglés. Combina una base de conocimiento estructurada (ontología), reglas de inferencia y un modelo de IA local para ofrecer una experiencia de aprendizaje personalizada y bilingüe.

---

## Arquitectura general

```
verbalis/
├── backend/
│   ├── main.py                        # FastAPI: configuración, CORS, registro de routers
│   ├── routers/
│   │   └── chat.py                    # /api/chat (streaming) y /api/chat/clear
│   ├── knowledge_base/
│   │   ├── software_engineering.json  # Ontología — términos, relaciones, categorías
│   │   └── inference_rules.json       # Reglas de inferencia
│   ├── .env                           # variables locales (ignorado en git)
│   ├── .env.example                   # plantilla del .env
│   └── venv/                          # ignorado en git
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── CareerSelect.jsx
│       │   └── MainApp.jsx
│       └── components/
│           ├── Sidebar.jsx
│           └── modules/
│               ├── Chatbot.jsx          # Módulo 2 — implementado
│               ├── Dictionary.jsx       # Módulo 1 — placeholder
│               ├── LearningObjects.jsx  # Módulo 3 — placeholder
│               └── PDF.jsx              # Módulo 4 — placeholder
├── docs/
│   ├── guia_equipo.md                 # Instrucciones técnicas para el equipo
│   └── reunion_equipo.md
├── README.md
└── README_DEV.md
```

---

## División de trabajo

| Persona | Módulo | Responsabilidad |
|--------|--------|----------------|
| **Alex** | Base + Coordinación | Estructura del repo, base de conocimiento (ontología), integración Ollama, sidebar |
| **Segovia** | Diccionario | Búsqueda, visualización de términos, relaciones ontológicas |
| **Alex** | Chatbot | Interfaz de chat, prompts, memoria de sesión |
| **Omar** | Objetos de aprendizaje | Flashcards, quizes, reglas de refuerzo |
| **Fleshman** | PDF | Visor de PDF, selección de texto, panel de definición |

---

## Cronograma

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

## Modelo de IA local

**Modelo por defecto:** Gemma 4 31B (cloud) — no requiere descarga  
**Herramienta:** [Ollama](https://ollama.com)  
**Context window:** 8 192 tokens

### Instalación rápida
```bash
# 1. Instalar Ollama desde https://ollama.com

# 2. Iniciar el servidor (el modelo cloud no requiere descarga)
ollama serve

# 3. Verificar que corre
curl http://localhost:11434/api/tags
```

> Para usar un modelo local en lugar del cloud, ver la sección "Cambiar el modelo" en [docs/guia_equipo.md](./docs/guia_equipo.md).

---

## Justificación académica — Base de Conocimiento

### ¿Dónde está la base de conocimiento?

**1. Ontología del diccionario** (`backend/knowledge_base/software_engineering.json`)  
Cada carrera tiene su propio JSON estructurado con:
- Términos con definiciones en inglés y español
- Relaciones entre términos (`related_terms`)
- Categorías semánticas y niveles de dificultad

**2. Reglas de inferencia** (`backend/knowledge_base/inference_rules.json`)  
El sistema aplica reglas lógicas como:
- Si el usuario busca término X → sugerir términos relacionados
- Si el usuario falla una palabra 2 veces → reforzarla en la siguiente sesión
- Si una palabra aparece en un PDF y está en la ontología → usar definición estructurada en vez del modelo

**3. Sistema experto en el chatbot**  
El system prompt bilingüe que instancia el chatbot según la carrera elegida actúa como un **sistema de reglas de dominio**. Define el alcance del agente, sus restricciones de respuesta y las reglas pedagógicas para la enseñanza gradual del vocabulario técnico en inglés.

**4. Razonamiento en objetos de aprendizaje**  
El módulo de aprendizaje infiere el nivel del usuario en base a su historial de respuestas y adapta el contenido (más fácil, más difícil, repaso).

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Renderizado Markdown | react-markdown |
| Backend | FastAPI (Python 3.11+) |
| Cliente HTTP async | httpx |
| IA local | Ollama + Gemma 3 12B |
| Base de conocimiento | JSON estructurado (ontología) |
| Visor PDF | pdf.js |
| Control de versiones | Git + GitHub |

---

## Cómo correr el proyecto

Ver [README_DEV.md](./README_DEV.md) para instrucciones detalladas y [docs/guia_equipo.md](./docs/guia_equipo.md) para incorporarse al proyecto.

### Resumen rápido
```bash
# Terminal 1 — Ollama
ollama serve

# Terminal 2 — Backend
cd backend && .\venv\Scripts\Activate.ps1 && uvicorn main:app --reload

# Terminal 3 — Frontend
cd frontend && npm run dev
```

Abrir **http://localhost:5173**

---

## Módulos — Estado actual

### Módulo 1: Diccionario
- Lista de términos técnicos filtrada por carrera
- Búsqueda en tiempo real
- Card con: término, definición EN, botón traducir (ES), términos relacionados
- Sin IA: solo consulta a la ontología JSON

### Módulo 2: Chatbot ✅ implementado
- Respuestas en streaming en tiempo real (tokens conforme se generan)
- Memoria de sesión: historial de hasta 10 mensajes enviados a Ollama en cada request
- System prompt bilingüe pedagógico: detecta el idioma del usuario y responde en el mismo idioma, mostrando siempre los términos técnicos en inglés con su traducción al español entre paréntesis
- Reglas anti-alucinación: el modelo declara incertidumbre explícitamente, no inventa librerías ni código, y redirige preguntas fuera del dominio
- Temperatura 0.3: respuestas más precisas y consistentes
- Renderizado de Markdown: negritas, listas, bloques de código con header de lenguaje y botón de copiar
- Botón para limpiar el historial de la sesión
- Contador de mensajes de sesión (N/10)
- Mensajes de error visibles con estilo diferenciado

### Módulo 3: Objetos de aprendizaje
- Flashcards de vocabulario
- Quiz de opción múltiple
- Completar la frase
- Regla de refuerzo: si fallas 2 veces → la palabra vuelve al final

### Módulo 4: Trabajar con PDF
- Subir PDF y visualizarlo en pantalla
- Seleccionar texto → panel lateral con definición literal, en contexto y ejemplos
- Consulta primero la ontología; si no encuentra, va al modelo

---

## Reglas del equipo

1. **Una rama por módulo:** `feature/dictionary`, `feature/chatbot`, `feature/learning`, `feature/pdf`
2. **No tocar código ajeno** sin avisar primero en el grupo
3. **Commits descriptivos:** `feat: agregar búsqueda por categoría en diccionario`
4. **Si algo de la base no está listo**, avisa al coordinador, no lo inventes por tu cuenta
5. **Cada módulo tiene su propio router** en `/backend/routers/` y su propia carpeta en `/frontend/src/components/modules/`
6. **Preguntas técnicas** → abrir un Issue en GitHub

---

*Verbalis — Base de Conocimiento aplicada al aprendizaje de inglés técnico*

# 📣 Guión para la reunión del equipo — Verbalis

## Cómo presentarle el proyecto y la metodología a tus compañeros

---

## 1. Arranque (5 min) — ¿Qué estamos construyendo exactamente?

> *"Ya sabemos las funciones principales que discutimos. Pero necesitamos entender por qué esto es un proyecto de Base de Conocimiento y no solo una app con IA, porque eso es lo que el profesor va a preguntar."*

**Punto clave para decirles:**
La diferencia entre Verbalis y simplemente abrir ChatGPT está en dos cosas:
- Tenemos una **ontología propia**: una estructura de conocimiento que el sistema consulta antes de ir al modelo de IA
- Tenemos **reglas de inferencia**: el sistema toma decisiones basadas en lógica, no solo en lo que devuelve el modelo

---

## 2. La base de conocimiento (5 min) — Lo que hace esto académico

> *"Creé una ontología base en JSON. No es una lista de palabras, es una red de conceptos con relaciones entre ellos."*

**Mostrar el archivo:** `backend/knowledge_base/ontology/software_engineering.json`

Puntos a destacar:
- Cada término tiene `related_terms` → eso es la ontología, no solo definiciones
- Hay categorías semánticas, niveles de dificultad, etiquetas
- Cuando buscas "API", el sistema también te sugiere "Endpoint", "REST", "HTTP" — porque está en la ontología

**Mostrar el archivo:** `backend/knowledge_base/rules/inference_rules.json`

Puntos a destacar:
- El sistema tiene 7 reglas de inferencia documentadas
- Ejemplo: si fallas una palabra 2 veces → vuelve al final del quiz (INF_003)
- Ejemplo: cuando seleccionas texto en PDF, primero consulta la ontología, luego el modelo (INF_005)

> *"Eso es lo que justifica la materia. No es solo un chatbot."*

---

## 3. Cómo vamos a trabajar (10 min) — Metodología

### El repo
> *"Vamos a trabajar en GitHub. El repo ya tiene la estructura base. Cada uno trabaja en su propia rama."*

**Ramas:**
- `main` → código estable, nadie toca directamente
- `develop` → integración, aquí mergean sus ramas cuando algo está listo
- `feature/dictionary` → Persona 2
- `feature/chatbot` → Persona 3
- `feature/learning` → Persona 4
- `feature/pdf` → Persona 5

**Regla de oro:**
> *"Cada quien trabaja solo en su rama. No modifican archivos de otro módulo sin avisar. Si necesitan algo de la base, me lo piden a mí."*

### La independencia de módulos
Cada módulo tiene:
- Su propia carpeta en `frontend/src/components/`
- Su propio router en `backend/routers/`
- Sus propias rutas de API (sin chocar con los demás)

> *"Pueden trabajar en su módulo sin bloquear a nadie. Lo que cada uno haga no rompe lo de los demás."*

### El modelo de IA
> *"El modelo corre en mi laptop. Para el desarrollo, todos van a apuntar a mi IP cuando estén probando. Para la demo, usamos mi laptop directamente."*

- Modelo: Gemma 3 12B cuantizado
- Herramienta: Ollama
- URL base: `http://[IP-DE-MI-LAPTOP]:11434`

---

## 4. División de trabajo (5 min)

> *"Aquí está quién hace qué. Hablen si alguno prefiere otro módulo, pero que sea ahora, no en la semana 2."*

| Persona | Módulo | Lo que entrega |
|--------|--------|---------------|
| Tú | Base + coordinación | Repo, ontología, Ollama, sidebar, landing, selección de carrera |
| Persona 2 | Diccionario | Búsqueda, cards de términos, términos relacionados |
| Persona 3 | Chatbot | Interfaz chat, integración con Ollama, memoria de sesión |
| Persona 4 | Objetos de aprendizaje | Flashcards, quiz, reglas de refuerzo |
| Persona 5 | PDF | Visor PDF, selección de texto, panel de definición |

---

## 5. Cronograma (3 min)

**Esta semana (Semana 1):**
- Hoy: clonan el repo, instalan dependencias, levantan el proyecto
- Días 2-3: diseñan su interfaz (Figma, papel, lo que sea)
- Fin de semana: yo tengo lista la base, el sidebar y Ollama corriendo

**Semana 2:**
- Implementan su módulo
- Check-in el miércoles: todos muestran lo que tienen aunque sea incompleto
- No esperan a tener todo perfecto para mostrar

**Semana 3:**
- Integramos todo
- Pruebas
- Preparamos la demo

---

## 6. Preguntas frecuentes del equipo

**"¿Y si no entiendo algo del código base?"**
> Me preguntas a mí o abres un Issue en GitHub. No te quedes bloqueado más de 2 horas sin decirme.

**"¿Tenemos que saber sobre ontologías?"**
> No en profundidad. Solo entender que el diccionario funciona con un JSON estructurado que ya está hecho. Tú solo consumes esa data.

**"¿Qué pasa si no termino mi módulo?"**
> Lo que esté funcional lo presentamos. Mejor un módulo sólido que cuatro rotos. Pero tenemos 3 semanas, sí se puede.

**"¿El login lo hacemos?"**
> Al final, si sobra tiempo. No es prioridad.

---

## 7. Cierre

> *"¿Alguien tiene dudas sobre su módulo? ¿Alguien quiere cambiar de módulo? Háblenme ahora."*

> *"Esta semana me mandan por WhatsApp confirmación de que clonaron el repo y levantaron el proyecto. Si no lo logran, me dicen y los ayudo."*

---

*Recuerda: el objetivo no es perfección, es un sistema funcional que justifique la materia y que el profe diga "sí trabajaron".*

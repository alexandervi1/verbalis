import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: '¡Hola! Soy tu tutor de inglés técnico. Puedo ayudarte a entender términos, explicar conceptos o practicar vocabulario de tu área. ¿Por dónde empezamos?',
}

function CodeBlock({ className, children }) {
  const [copied, setCopied] = useState(false)
  const language = className?.replace('language-', '') || 'código'
  const code = String(children).replace(/\n$/, '')

  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-600/60">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-600/60">
        <span className="text-xs text-slate-400 font-mono">{language}</span>
        <button
          onClick={copy}
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          {copied ? 'Copiado ✓' : 'Copiar'}
        </button>
      </div>
      <pre className="bg-slate-900 text-blue-300 px-4 py-3 text-xs font-mono overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function Chatbot({ career }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const sessionId = useRef(crypto.randomUUID())

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const clearChat = async () => {
    try {
      await fetch('/api/chat/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId.current }),
      })
    } catch {
      // ignore — reset local state regardless
    }
    setMessages([INITIAL_MESSAGE])
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, career, session_id: sessionId.current }),
      })

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', isError: true, content: 'Error al conectar con el asistente. Verifica que Ollama esté corriendo.' },
        ])
        return
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + chunk,
          }
          return updated
        })
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', isError: true, content: 'Error al conectar con el asistente. Verifica que Ollama esté corriendo.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-6 max-w-3xl mx-auto w-full">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-blue-300">Chatbot</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tutor de inglés técnico — responde según tu carrera
            {' · '}
            <span className="text-slate-500">
              {Math.min(messages.slice(1).filter((m) => !m.isError).length, 10)}/10 mensajes
            </span>
          </p>
        </div>
        <button
          onClick={clearChat}
          disabled={loading}
          className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-400"
        >
          Limpiar chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xl px-5 py-4 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-br-sm whitespace-pre-wrap shadow-lg shadow-blue-900/30'
                  : msg.isError
                  ? 'bg-red-950 border border-red-700/60 text-red-300 rounded-bl-sm'
                  : 'bg-slate-800/80 text-slate-100 rounded-bl-sm border-l-2 border-blue-500/60'
                }`}
            >
              {msg.role === 'user' ? (
                msg.content
              ) : msg.isError ? (
                msg.content
              ) : msg.content ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    pre: ({ children }) => {
                      const child = Array.isArray(children) ? children[0] : children
                      return (
                        <CodeBlock className={child?.props?.className}>
                          {child?.props?.children}
                        </CodeBlock>
                      )
                    },
                    code: ({ inline, children }) =>
                      inline ? (
                        <code className="bg-slate-900/80 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                      ) : (
                        <code>{children}</code>
                      ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : loading && i === messages.length - 1 ? (
                <span className="animate-pulse text-slate-400">Pensando...</span>
              ) : null}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Escribe tu pregunta en inglés o español..."
          disabled={loading}
          className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-5 py-3 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all shadow-md shadow-blue-900/20"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}

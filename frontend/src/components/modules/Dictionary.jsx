import { useState } from 'react'

export default function Dictionary({ career }) {
  const [query, setQuery] = useState('')

  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-blue-300">Diccionario</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Busca términos técnicos en inglés de tu área de especialización
        </p>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar término técnico..."
        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-8 transition-colors"
      />

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center">
        <div className="text-5xl mb-4">📖</div>
        <p className="text-slate-300 font-medium mb-1">Módulo en desarrollo</p>
        <p className="text-slate-500 text-sm">
          El diccionario se conectará a la ontología de{' '}
          <span className="text-slate-400">{career}</span> para mostrar
          definiciones, ejemplos y términos relacionados.
        </p>
      </div>
    </div>
  )
}

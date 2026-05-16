import { useState, useEffect, useMemo } from 'react'

export default function Dictionary({ career }) {
  const [query, setQuery] = useState('')
  const [terms, setTerms] = useState([])
  const [categories, setCategories] = useState({})
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [showSpanish, setShowSpanish] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTerms = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/dictionary/terms?career=${career}`)
        if (!response.ok) {
          throw new Error('No se pudo cargar el diccionario')
        }
        const data = await response.json()
        setTerms(data.terms)
        setCategories(data.categories)
        if (data.terms.length > 0) {
          setSelectedTerm(data.terms[0])
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (career) {
      fetchTerms()
    }
  }, [career])

  const filteredTerms = useMemo(() => {
    let result = terms.filter(t => 
      t.term.toLowerCase().includes(query.toLowerCase()) ||
      (t.full_form && t.full_form.toLowerCase().includes(query.toLowerCase())) ||
      t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )

    if (selectedCategory !== 'all') {
      result = result.filter(t => t.category === selectedCategory)
    }

    // Sort by difficulty: beginner first (Rule INF_002)
    const diffOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 }
    return result.sort((a, b) => {
      return (diffOrder[a.difficulty] || 9) - (diffOrder[b.difficulty] || 9)
    })
  }, [terms, query, selectedCategory])

  const handleTermClick = (term) => {
    setSelectedTerm(term)
    setShowSpanish(false)
  }

  const findTermById = (id) => terms.find(t => t.id === id)

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
        <p className="font-bold">Error al cargar datos</p>
        <p className="text-sm opacity-80">{error}</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden bg-slate-900/50">
      {/* Header */}
      <div className="mb-6 shrink-0 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Diccionario Técnico</h2>
          <p className="text-sm text-slate-400 mt-1">
            Explora la ontología de <span className="text-blue-400 font-medium">{career.replace('_', ' ')}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Base de Conocimiento Activa
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6 shrink-0">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar término, siglas o etiquetas..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pl-10"
          />
          <span className="absolute left-3.5 top-3.5 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Todos
          </button>
          {Object.keys(categories).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              title={categories[cat]}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* List Column */}
        <div className="w-80 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
          {filteredTerms.length > 0 ? (
            filteredTerms.map(t => (
              <button
                key={t.id}
                onClick={() => handleTermClick(t)}
                className={`text-left p-3 rounded-xl border transition-all group ${
                  selectedTerm?.id === t.id
                    ? 'bg-blue-500/10 border-blue-500/50 ring-1 ring-blue-500/50'
                    : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-semibold text-sm ${selectedTerm?.id === t.id ? 'text-blue-300' : 'text-slate-200'}`}>
                    {t.term}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase font-bold tracking-wider ${
                    t.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                    t.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-rose-500/10 text-rose-400'
                  }`}>
                    {t.difficulty}
                  </span>
                </div>
                {t.full_form && (
                  <div className="text-[10px] text-slate-500 mt-1 truncate">{t.full_form}</div>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 bg-slate-700/50 px-1.5 py-0.5 rounded uppercase">
                    {t.category}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <span className="text-4xl mb-4">🔍</span>
              <p className="text-sm">No se encontraron términos</p>
              <button onClick={() => {setQuery(''); setSelectedCategory('all')}} className="text-xs text-blue-400 mt-2 hover:underline">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Detail Column */}
        <div className="flex-1 bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden flex flex-col">
          {selectedTerm ? (
            <div className="flex flex-col h-full animate-fade-in-up">
              {/* Detail Header */}
              <div className="p-8 border-b border-slate-700/50 bg-slate-800/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-3xl font-bold text-white">{selectedTerm.term}</h3>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30 font-bold uppercase tracking-widest">
                        {selectedTerm.category}
                      </span>
                    </div>
                    {selectedTerm.full_form && (
                      <p className="text-lg text-slate-400 font-medium">{selectedTerm.full_form}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5 max-w-[200px]">
                    {selectedTerm.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-slate-700/50 text-slate-400 px-2 py-1 rounded border border-slate-600/50 hover:text-slate-300 transition-colors">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-4 items-center">
                   <div className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${
                    selectedTerm.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                    selectedTerm.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-rose-500/10 text-rose-400'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    Nivel: <span className="font-bold uppercase">{selectedTerm.difficulty}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 italic">
                    Regla INF_002: Ordenado por dificultad
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                {/* Definition Section */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Definición Técnica</h4>
                    <button
                      onClick={() => setShowSpanish(!showSpanish)}
                      className="flex items-center gap-2 text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-all shadow-lg shadow-blue-900/20"
                    >
                      <span>{showSpanish ? '🇬🇧 Ver Inglés' : '🇪🇸 Ver Español'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <p className="text-lg text-slate-200 leading-relaxed italic">
                      "{showSpanish ? selectedTerm.definition_es : selectedTerm.definition_en}"
                    </p>
                  </div>
                </section>

                {/* Examples Section */}
                {selectedTerm.examples && selectedTerm.examples.length > 0 && (
                  <section>
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Ejemplos de Uso</h4>
                    <div className="grid gap-3">
                      {selectedTerm.examples.map((ex, i) => (
                        <div key={i} className="flex gap-4 items-start p-4 bg-slate-800/30 rounded-xl border border-slate-700/30 hover:border-slate-600 transition-colors">
                          <span className="text-blue-500/50 font-mono text-xs mt-0.5">{String(i+1).padStart(2, '0')}</span>
                          <p className="text-sm text-slate-300 leading-relaxed">{ex}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Related Terms Section */}
                {selectedTerm.related_terms && selectedTerm.related_terms.length > 0 && (
                  <section className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Términos Relacionados</h4>
                      <span className="text-[10px] text-slate-500 italic">Regla INF_001: Sugerencia por ontología</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.related_terms.map(id => {
                        const related = findTermById(id)
                        if (!related) return null
                        return (
                          <button
                            key={id}
                            onClick={() => handleTermClick(related)}
                            className="group flex flex-col items-start p-3 bg-slate-800/50 hover:bg-blue-600/10 border border-slate-700 hover:border-blue-500/50 rounded-xl transition-all"
                          >
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">{related.term}</span>
                            <span className="text-[9px] text-slate-500 uppercase mt-0.5">{related.category}</span>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
              <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center text-3xl">
                📖
              </div>
              <p className="text-sm font-medium">Selecciona un término para ver los detalles técnicos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

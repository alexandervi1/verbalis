const navItems = [
  { id: 'dictionary', label: 'Diccionario', icon: '📖' },
  { id: 'chatbot', label: 'Chatbot', icon: '🤖' },
  { id: 'learning', label: 'Objetos de aprendizaje', icon: '🎓' },
  { id: 'pdf', label: 'PDF', icon: '📄' },
]

export default function Sidebar({ activeModule, onSelect, careerLabel, onBack }) {
  return (
    <aside className="w-60 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0">
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-300 tracking-widest">VERBALIS</h1>
        <p className="text-xs text-slate-400 mt-1 truncate">{careerLabel}</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
              ${
                activeModule === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-700">
        <button
          onClick={onBack}
          className="w-full text-xs text-slate-400 hover:text-slate-200 py-2 transition-colors text-left px-2"
        >
          ← Cambiar carrera
        </button>
      </div>
    </aside>
  )
}

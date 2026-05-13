import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center text-white">
      <div className="text-center space-y-6 px-4">
        <p className="text-blue-400 text-sm tracking-widest uppercase font-medium">
          Inglés técnico para ingeniería
        </p>
        <h1 className="text-8xl font-bold tracking-widest text-white drop-shadow-lg">
          VERBALIS
        </h1>
        <p className="text-lg text-slate-300 max-w-md mx-auto leading-relaxed">
          Aprende el vocabulario técnico en inglés que necesitas para tu carrera de ingeniería.
        </p>
        <button
          onClick={() => navigate('/carreras')}
          className="mt-4 px-12 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-full text-base font-semibold transition-colors duration-200 shadow-lg shadow-blue-900/40"
        >
          Comenzar
        </button>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'

const careers = [
  {
    id: 'software_engineering',
    label: 'Ingeniería de Software',
    icon: '💻',
    description: 'APIs, arquitectura, patrones de diseño, DevOps, bases de datos y más.',
  },
  {
    id: 'electronics',
    label: 'Electrónica',
    icon: '⚡',
    description: 'Circuitos, microcontroladores, señales, PCB y sistemas embebidos.',
  },
]

export default function CareerSelect() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center text-white px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Selecciona tu carrera</h2>
        <p className="text-slate-400 text-sm">
          El contenido se adaptará a tu área de especialización
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {careers.map((career) => (
          <button
            key={career.id}
            onClick={() =>
              navigate('/app', {
                state: { career: career.id, careerLabel: career.label },
              })
            }
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 rounded-2xl p-8 text-left transition-all duration-200 group shadow-lg"
          >
            <div className="text-5xl mb-4">{career.icon}</div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-300 transition-colors">
              {career.label}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">{career.description}</p>
          </button>
        ))}
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-8 text-xs text-slate-500 hover:text-slate-300 transition-colors"
      >
        ← Volver al inicio
      </button>
    </div>
  )
}

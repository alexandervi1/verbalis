export default function LearningObjects({ career }) {
  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-blue-300">Objetos de Aprendizaje</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Recursos estructurados para aprender vocabulario técnico en inglés
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center">
        <div className="text-5xl mb-4">🎓</div>
        <p className="text-slate-300 font-medium mb-1">Módulo en desarrollo</p>
        <p className="text-slate-500 text-sm">
          Próximamente encontrarás lecciones, ejercicios y actividades adaptadas
          a la terminología técnica de{' '}
          <span className="text-slate-400">{career}</span>.
        </p>
      </div>
    </div>
  )
}

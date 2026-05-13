export default function PDF({ career }) {
  return (
    <div className="p-6 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-blue-300">Visor PDF</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Documentación técnica y guías de estudio en inglés
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center">
        <div className="text-5xl mb-4">📄</div>
        <p className="text-slate-300 font-medium mb-1">Módulo en desarrollo</p>
        <p className="text-slate-500 text-sm">
          Próximamente podrás cargar y visualizar PDFs técnicos con glosario
          integrado para{' '}
          <span className="text-slate-400">{career}</span>.
        </p>
      </div>
    </div>
  )
}

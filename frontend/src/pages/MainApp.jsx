import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Dictionary from '../components/modules/Dictionary'
import Chatbot from '../components/modules/Chatbot'
import LearningObjects from '../components/modules/LearningObjects'
import PDF from '../components/modules/PDF'

const modules = {
  dictionary: Dictionary,
  chatbot: Chatbot,
  learning: LearningObjects,
  pdf: PDF,
}

export default function MainApp() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [activeModule, setActiveModule] = useState('chatbot')

  const career = state?.career || 'software_engineering'
  const careerLabel = state?.careerLabel || 'Ingeniería de Software'

  const ActiveComponent = modules[activeModule]

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      <Sidebar
        activeModule={activeModule}
        onSelect={setActiveModule}
        careerLabel={careerLabel}
        onBack={() => navigate('/carreras')}
      />
      <main className="flex-1 overflow-auto">
        <ActiveComponent career={career} />
      </main>
    </div>
  )
}

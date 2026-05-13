import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import CareerSelect from './pages/CareerSelect'
import MainApp from './pages/MainApp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/carreras" element={<CareerSelect />} />
      <Route path="/app" element={<MainApp />} />
    </Routes>
  )
}

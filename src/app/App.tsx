import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Suspense, lazy } from 'react'

const Hub = lazy(() => import('./Hub'))
const ElectricModule = lazy(() => import('../modules/electric/presentation/ElectricModule'))
const CapacitorsModule = lazy(() => import('../modules/capacitors/presentation/CapacitorsModule'))
const CurrentModule = lazy(() => import('../modules/current/CurrentModule'))
const MagnetismModule = lazy(() => import('../modules/magnetism/MagnetismModule'))

export function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Cargando Laboratorio...</div>}>
        <Routes>
          <Route path="/" element={<Hub />} />
          <Route path="/electric" element={<ElectricModule />} />
          <Route path="/capacitors" element={<CapacitorsModule />} />
          <Route path="/current" element={<CurrentModule />} />
          <Route path="/magnetism" element={<MagnetismModule />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

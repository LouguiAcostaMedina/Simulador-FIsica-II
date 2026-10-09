import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Magnetism3DView } from './presentation/Magnetism3DView'
import { Vector3 } from '../../shared/domain/Vector3'
import { isWebGLAvailable } from '../../shared/ui/isWebGLAvailable'

export default function MagnetismModule() {
  const [mode, setMode] = useState<'wire' | 'dipole'>('wire')
  const [I, setI] = useState(10)
  const [showLorentz, setShowLorentz] = useState(false)
  const [q, setQ] = useState(1)
  const [vz, setVz] = useState(5)
  const [Ey, setEy] = useState(0)
  
  const webGLAvailable = React.useMemo(() => isWebGLAvailable(), [])
  const [webGLLost, setWebGLLost] = useState(!webGLAvailable)

  return (
    <div className="electric-layout">
      <aside className="electric-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="back-link">← Hub</Link>
          <h2>Fuerza y Campo Magnético</h2>
        </div>

        <section className="control-group">
          <h3>Fuente Magnética</h3>
          <div className="radio-group">
            <label>
              <input type="radio" checked={mode === 'wire'} onChange={() => setMode('wire')} /> Hilo Rectilíneo
            </label>
            <label>
              <input type="radio" checked={mode === 'dipole'} onChange={() => setMode('dipole')} /> Dipolo
            </label>
          </div>
          {mode === 'wire' && (
            <div className="input-row">
              <label>Corriente I (A): <input type="number" min="0" value={I} onChange={e => setI(Number(e.target.value))} /></label>
            </div>
          )}
          {mode === 'dipole' && (
            <div className="input-row">
              <label>Momento m (A·m²): <input type="number" min="0" value={I} onChange={e => setI(Number(e.target.value))} /></label>
            </div>
          )}
        </section>

        <section className="control-group">
          <h3>Fuerza de Lorentz</h3>
          <p className="caption">Simula una carga q moviéndose en el campo B generado y un campo E externo.</p>
          <div className="input-row">
             <label>Carga q (C): <input type="number" value={q} onChange={e => setQ(Number(e.target.value))} /></label>
          </div>
          <div className="input-row">
             <label>Velocidad inicial Vz (m/s): <input type="number" value={vz} onChange={e => setVz(Number(e.target.value))} /></label>
          </div>
          <div className="input-row">
             <label>Campo Externo Ey (N/C): <input type="number" value={Ey} onChange={e => setEy(Number(e.target.value))} /></label>
          </div>
          <div className="sim-controls">
             <button onClick={() => setShowLorentz(!showLorentz)}>{showLorentz ? 'Detener' : 'Lanzar Partícula'}</button>
          </div>
        </section>
        
        <section className="control-group">
          <h3>Fórmulas</h3>
          <ul className="metrics-list">
             <li>Hilo: <span>B = μ₀I / (2πr)</span></li>
             <li>Lorentz: <span>F = q(E + v × B)</span></li>
          </ul>
        </section>

        <section className="control-group">
          <h3>Resultados de la Partícula</h3>
          <ul className="metrics-list">
             <li>Vel. Inicial v₀: <span>(0, 0, {vz}) m/s</span></li>
             <li>Campo E: <span>(0, {Ey}, 0) N/C</span></li>
             <li>Campo BExt: <span>(0, 0, 0) T</span></li>
             <li>Nota: <span>La fuerza instantánea y trayectoria se calculan y dibujan en la vista 3D.</span></li>
          </ul>
        </section>
      </aside>

      <main className="electric-canvas-area">
        <div className="canvas-container">
           {webGLLost ? (
               <div className="error-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                 <h3>El contexto WebGL se ha perdido.</h3>
                 <p>Por favor, recarga la página o intenta de nuevo.</p>
                 <button onClick={() => setWebGLLost(false)}>Reintentar</button>
               </div>
           ) : (
               <Magnetism3DView 
                 mode={mode} 
                 I={I} 
                 showLorentz={showLorentz}
                 q={q}
                 v0={new Vector3(0, 0, vz)}
                 EExt={new Vector3(0, Ey, 0)}
                 BExt={new Vector3(0, 0, 0)}
                 onContextLost={() => setWebGLLost(true)}
               />
           )}
        </div>
      </main>
    </div>
  )
}

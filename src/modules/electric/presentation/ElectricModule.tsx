import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useElectricSimulation } from './useElectricSimulation'
import { Vector3 } from '../../../shared/domain/Vector3'
import { Electric2DView } from './Electric2DView'
import { Electric3DView } from './Electric3DView'
import { FieldMath } from '../domain/FieldMath'
import './ElectricModule.css'

export default function ElectricModule() {
  const sim = useElectricSimulation()
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('3D')

  const [scale, setScale] = useState(50)
  const [inspectedPos, setInspectedPos] = useState<Vector3 | null>(null)

  // Inputs para añadir carga
  const [qInput, setQInput] = useState(1) // uC
  const [xInput, setXInput] = useState(0)
  const [yInput, setYInput] = useState(0)

  const handleAddCharge = () => {
    if (sim.charges.length >= 10) return;
    sim.addCharge({
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
      q: qInput * 1e-6, // convertir de uC a C
      position: new Vector3(xInput, yInput, 0)
    })
  }

  const handlePresetDipole = () => {
    sim.clearCharges()
    const id1 = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9)
    const id2 = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9)
    sim.addCharge({ id: id1, q: 1e-6, position: new Vector3(-1, 0, 0) })
    sim.addCharge({ id: id2, q: -1e-6, position: new Vector3(1, 0, 0) })
  }

  return (
    <div className="electric-layout">
      <aside className="electric-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="back-link">← Hub</Link>
          <h2>Campo y Potencial</h2>
        </div>

        <section className="control-group">
          <h3>Añadir Carga Puntual</h3>
          <div className="input-row">
            <label>Q (μC): <input type="number" value={qInput} onChange={e => setQInput(Number(e.target.value))} /></label>
          </div>
          <div className="input-row">
            <label>X (m): <input type="number" value={xInput} onChange={e => setXInput(Number(e.target.value))} /></label>
            <label>Y (m): <input type="number" value={yInput} onChange={e => setYInput(Number(e.target.value))} /></label>
          </div>
          <button onClick={handleAddCharge} disabled={sim.charges.length >= 10}>Añadir Carga</button>
          <button onClick={handlePresetDipole} className="secondary">Preset: Dipolo</button>
        </section>

        <section className="control-group">
          <h3>Cargas actuales ({sim.charges.length}/10)</h3>
          <ul>
            {sim.charges.map(c => (
              <li key={c.id}>
                {(c.q * 1e6).toFixed(2)} μC en ({c.position.x}, {c.position.y})
                <button onClick={() => sim.removeCharge(c.id)}>x</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="control-group">
          <h3>Simulación de partícula</h3>
          <button onClick={() => sim.setupTestParticle({q: 1e-6, m: 1e-3, position: new Vector3(0, 1, 0), velocity: new Vector3(0, 0, 0)})}>
            Preparar (+1μC, 1g, y=1)
          </button>
          <div className="sim-controls">
            <button onClick={sim.play} disabled={sim.state === 'running' || sim.state === 'unconfigured'}>▶</button>
            <button onClick={sim.pause} disabled={sim.state !== 'running'}>⏸</button>
            <button onClick={sim.reset} disabled={sim.state === 'unconfigured'}>⏹</button>
          </div>
          <div className="status">Estado: {sim.state} | t = {sim.time.toFixed(3)}s</div>
        </section>

        {sim.errorMsg && (
          <div className="error-panel">
            <strong>Error:</strong> {sim.errorMsg}
            <button onClick={() => sim.setErrorMsg(null)}>OK</button>
          </div>
        )}

        {inspectedPos && (
          <section className="control-group inspector-panel">
            <h3>Inspector</h3>
            <p>Pos: ({inspectedPos.x.toFixed(2)}, {inspectedPos.y.toFixed(2)}) m</p>
            {(() => {
              try {
                const E = FieldMath.evaluateField(sim.charges, inspectedPos);
                const V = FieldMath.evaluatePotential(sim.charges, inspectedPos);
                return (
                  <ul>
                    <li>Ex: {E.x.toExponential(2)} N/C</li>
                    <li>Ey: {E.y.toExponential(2)} N/C</li>
                    <li>|E|: {E.length().toExponential(2)} N/C</li>
                    <li>V: {V.toExponential(2)} V</li>
                  </ul>
                );
              } catch (e) {
                return <p>Singularidad (Campo infinito)</p>
              }
            })()}
          </section>
        )}
      </aside>

      <main className="electric-canvas-area">
        <div className="canvas-toolbar">
          <button onClick={() => setViewMode('2D')} className={viewMode === '2D' ? 'active' : ''}>Vista 2D</button>
          <button onClick={() => setViewMode('3D')} className={viewMode === '3D' ? 'active' : ''}>Vista 3D</button>
          <div className="scale-control">
            <label>Escala (px/m): <input type="range" min="10" max="200" value={scale} onChange={e => setScale(Number(e.target.value))} /></label>
            <span>{scale}</span>
          </div>
        </div>
        <div className="canvas-container">
           {viewMode === '2D' ? (
             <Electric2DView 
                charges={sim.charges} 
                testParticle={sim.testParticle} 
                trajectory={sim.trajectory} 
                scale={scale}
                onChargeMove={sim.updateCharge}
                onInspect={setInspectedPos}
              />
           ) : (
             <Electric3DView 
                 charges={sim.charges} 
                 testParticle={sim.testParticle} 
                 trajectory={sim.trajectory}
                 onContextLost={() => {
                   sim.setErrorMsg("El contexto WebGL falló. Cambiando a vista 2D por seguridad.");
                   setViewMode('2D');
                 }}
              />
           )}
        </div>
      </main>
    </div>
  )
}

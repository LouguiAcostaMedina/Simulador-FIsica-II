import React from 'react'
import { Link } from 'react-router-dom'
import { useCapacitorSimulation } from './useCapacitorSimulation'
import { Capacitor3DView } from './Capacitor3DView'
import './CapacitorsModule.css'

export default function CapacitorsModule() {
  const { state, metrics, originalMetrics, setParam, setBaseLine, clearBaseLine } = useCapacitorSimulation()

  const isValid = state.A > 0 && state.d > 0 && state.er >= 1

  return (
    <div className="electric-layout">
      <aside className="electric-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="back-link">← Hub</Link>
          <h2>Capacitores y Dieléctricos</h2>
        </div>

        <section className="control-group">
          <h3>Geometría</h3>
          <div className="input-row">
            <label>Área A (cm²): <input type="number" min="1" step="10" value={state.A * 10000} onChange={e => setParam('A', Number(e.target.value) / 10000)} /></label>
          </div>
          <div className="input-row">
            <label>Distancia d (mm): <input type="number" min="0.1" step="0.1" value={state.d * 1000} onChange={e => setParam('d', Number(e.target.value) / 1000)} /></label>
          </div>
          <div className="input-row">
            <label>Dieléctrico (εr): <input type="number" min="1" step="0.5" value={state.er} onChange={e => setParam('er', Number(e.target.value))} /></label>
          </div>
        </section>

        <section className="control-group">
          <h3>Fuente / Batería</h3>
          <div className="radio-group">
            <label>
              <input type="radio" checked={state.mode === 'fixed_V'} onChange={() => setParam('mode', 'fixed_V')} /> Batería Conectada (V fijo)
            </label>
            <label>
              <input type="radio" checked={state.mode === 'fixed_Q'} onChange={() => setParam('mode', 'fixed_Q')} /> Batería Desconectada (Q fijo)
            </label>
          </div>
          <div className="input-row">
            <label>
              {state.mode === 'fixed_V' ? 'Voltaje V (V):' : 'Carga Q (pC):'}
              <input type="number" value={state.mode === 'fixed_V' ? state.sourceValue : (state.sourceValue * 1e12)} onChange={e => setParam('sourceValue', state.mode === 'fixed_V' ? Number(e.target.value) : Number(e.target.value) * 1e-12)} />
            </label>
          </div>
        </section>

        {!isValid && (
          <div className="error-panel">Los valores deben ser positivos (A&gt;0, d&gt;0, εr&ge;1).</div>
        )}

        <section className="control-group">
          <h3>Resultados</h3>
          {metrics && (
            <ul className="metrics-list">
              <li>Capacitancia C: <span>{(metrics.C * 1e12).toFixed(2)} pF</span></li>
              <li>Carga Q: <span>{(metrics.Q * 1e12).toFixed(2)} pC</span></li>
              <li>Voltaje V: <span>{metrics.V.toFixed(2)} V</span></li>
              <li>Campo E: <span>{(metrics.E).toFixed(2)} V/m</span></li>
              <li>Energía U: <span>{(metrics.U * 1e12).toFixed(2)} pJ</span></li>
            </ul>
          )}
        </section>
        
        <section className="control-group">
          <h3>Comparación</h3>
          <div className="sim-controls">
            <button onClick={setBaseLine}>Fijar Escenario</button>
            <button className="secondary" onClick={clearBaseLine}>Limpiar</button>
          </div>
          {originalMetrics && metrics && (
             <ul className="metrics-list compare">
               <li>ΔC: <span>{((metrics.C - originalMetrics.C) * 1e12).toFixed(2)} pF</span></li>
               <li>ΔU: <span>{((metrics.U - originalMetrics.U) * 1e12).toFixed(2)} pJ</span></li>
               <li>ΔV: <span>{(metrics.V - originalMetrics.V).toFixed(2)} V</span></li>
             </ul>
          )}
        </section>

      </aside>
      
      <main className="electric-canvas-area">
         <div className="canvas-container">
            {isValid && <Capacitor3DView state={state} metrics={metrics!} />}
         </div>
      </main>
    </div>
  )
}

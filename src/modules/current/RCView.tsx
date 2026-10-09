import React, { useState, useEffect } from 'react'
import { SimpleLineChart } from '../../shared/ui/SimpleLineChart'

export function RCView() {
  const [R, setR] = useState(1000) // Ohms
  const [C, setC] = useState(1000) // uF
  const [V0, setV0] = useState(12) // V
  const [mode, setMode] = useState<'charge' | 'discharge'>('charge')
  const [t, setT] = useState(0) // seconds
  const [isRunning, setIsRunning] = useState(false)

  const C_F = C * 1e-6; // Farads
  const tau = R * C_F; // seconds

  useEffect(() => {
    let frame: number;
    let lastTime = performance.now();
    
    const loop = (time: number) => {
      if (isRunning) {
        const dt = (time - lastTime) / 1000;
        setT(prev => Math.min(prev + dt, tau * 5)); // stop at 5 tau
      }
      lastTime = time;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [isRunning, tau]);

  const V_t = mode === 'charge' 
    ? V0 * (1 - Math.exp(-t / tau))
    : V0 * Math.exp(-t / tau);
    
  const I_t = (V0 / R) * Math.exp(-t / tau);

  const reset = () => {
    setT(0);
    setIsRunning(false);
  }

  // Generate chart data (static prediction)
  const chartData = Array.from({length: 40}).map((_, i) => {
    const time = (i / 40) * (tau * 5);
    const v = mode === 'charge' ? V0 * (1 - Math.exp(-time / tau)) : V0 * Math.exp(-time / tau);
    return { x: time, y: v };
  });

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <label>Resistencia R (Ω): <input type="number" value={R} onChange={e => {setR(Number(e.target.value)); reset();}} /></label><br/>
          <label>Capacitancia C (μF): <input type="number" value={C} onChange={e => {setC(Number(e.target.value)); reset();}} /></label><br/>
          <label>Voltaje Fuente V0 (V): <input type="number" value={V0} onChange={e => {setV0(Number(e.target.value)); reset();}} /></label><br/>
        </div>
        <div>
          <div>Modo: 
             <button onClick={() => {setMode('charge'); reset();}} className={mode === 'charge' ? 'active' : ''}>Carga</button>
             <button onClick={() => {setMode('discharge'); reset();}} className={mode === 'discharge' ? 'active' : ''}>Descarga</button>
          </div>
          <div>
            <button onClick={() => setIsRunning(!isRunning)}>{isRunning ? 'Pausar' : 'Iniciar'}</button>
            <button onClick={reset}>Reiniciar</button>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <h3>Estado Actual</h3>
        <p>t = {t.toFixed(2)} s (Tau = {tau.toFixed(2)} s)</p>
        <p>V(t) = {V_t.toFixed(2)} V</p>
        <p>I(t) = {(I_t * 1000).toFixed(2)} mA</p>
      </div>

      <SimpleLineChart 
        data={chartData} 
        title="Voltaje vs Tiempo" 
        xLabel="t (s)" 
        yLabel="V (V)" 
        currentValue={t}
        width={400}
        height={250}
      />
    </div>
  )
}

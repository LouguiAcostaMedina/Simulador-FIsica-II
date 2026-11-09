import { useState, useEffect, useMemo, useRef } from 'react'
import { ScientificChart } from '../../shared/ui/Charts/ScientificChart'
import './RCView.css'

export function RCView() {
  const [R, setR] = useState(1000) // Ohms (1 kΩ)
  const [C_uF, setC_uF] = useState(1000) // uF
  const [V0, setV0] = useState(12) // V
  const [mode, setMode] = useState<'charge' | 'discharge'>('charge')
  const [showSignedCurrent, setShowSignedCurrent] = useState(false)
  const [t, setT] = useState(0) // seconds
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(1) // 1x, 2x, 0.5x

  const C_F = Math.max(1e-9, C_uF * 1e-6) // Farads
  const R_safe = Math.max(1, R)
  const tau = R_safe * C_F // Constante de tiempo tau = R*C (segundos)

  const lastTimeRef = useRef(performance.now())

  useEffect(() => {
    let frame: number

    const loop = (time: number) => {
      if (isRunning) {
        const dt = ((time - lastTimeRef.current) / 1000) * speed
        setT(prev => {
          const next = prev + dt
          if (next >= tau * 5) {
            setIsRunning(false)
            return tau * 5
          }
          return next
        })
      }
      lastTimeRef.current = time
      frame = requestAnimationFrame(loop)
    }

    lastTimeRef.current = performance.now()
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [isRunning, tau, speed])

  // Ecuaciones transitorias del circuito RC
  // V(t) en capacitor
  const V_t = useMemo(() => {
    if (mode === 'charge') {
      return V0 * (1 - Math.exp(-t / tau))
    } else {
      return V0 * Math.exp(-t / tau)
    }
  }, [mode, V0, t, tau])

  // Carga instantánea Q(t) = C * V(t)
  const Q_t = useMemo(() => C_F * V_t, [C_F, V_t])

  // Corriente I(t)
  // En carga: I(t) = (V0 / R) * exp(-t / tau)
  // En descarga: I(t) = -(V0 / R) * exp(-t / tau) si se respeta la convención pasiva
  const I_mag = useMemo(() => (V0 / R_safe) * Math.exp(-t / tau), [V0, R_safe, t, tau])
  const I_t = useMemo(() => {
    if (mode === 'discharge' && showSignedCurrent) {
      return -I_mag
    }
    return I_mag
  }, [mode, showSignedCurrent, I_mag])

  const reset = () => {
    setT(0)
    setIsRunning(false)
  }

  const stepForward = () => {
    setIsRunning(false)
    setT(prev => Math.min(prev + 0.1 * tau, tau * 5))
  }

  // Curvas analíticas completas para la gráfica científica
  const maxTime = tau * 5
  const chartPoints = useMemo(() => {
    const steps = 40
    const vPts = []
    const iPts = []

    for (let i = 0; i <= steps; i++) {
      const time = (i / steps) * maxTime
      const v = mode === 'charge' ? V0 * (1 - Math.exp(-time / tau)) : V0 * Math.exp(-time / tau)
      const iVal = (V0 / R_safe) * Math.exp(-time / tau) * 1000 // en mA
      const signedI = mode === 'discharge' && showSignedCurrent ? -iVal : iVal

      vPts.push({ x: time, y: v })
      iPts.push({ x: time, y: signedI })
    }

    return { vPts, iPts }
  }, [maxTime, mode, V0, tau, R_safe, showSignedCurrent])

  return (
    <div className="rc-simulation-wrapper">
      <div className="rc-controls-bar">
        <div className="rc-param-group">
          <label>
            Resistencia R: <strong>{R} Ω</strong>
            <input
              type="number"
              min="10"
              max="100000"
              step="50"
              value={R}
              onChange={e => {
                setR(Number(e.target.value))
                reset()
              }}
            />
          </label>

          <label>
            Capacitancia C: <strong>{C_uF} μF</strong>
            <input
              type="number"
              min="1"
              max="10000"
              step="100"
              value={C_uF}
              onChange={e => {
                setC_uF(Number(e.target.value))
                reset()
              }}
            />
          </label>

          <label>
            Voltaje Fuente V₀: <strong>{V0} V</strong>
            <input
              type="number"
              min="1"
              max="48"
              step="1"
              value={V0}
              onChange={e => {
                setV0(Number(e.target.value))
                reset()
              }}
            />
          </label>
        </div>

        <div className="rc-actions-group">
          <div className="rc-mode-toggle">
            <button
              type="button"
              className={`rc-btn-toggle ${mode === 'charge' ? 'active' : ''}`}
              onClick={() => {
                setMode('charge')
                reset()
              }}
            >
              ⚡ Carga RC
            </button>
            <button
              type="button"
              className={`rc-btn-toggle ${mode === 'discharge' ? 'active' : ''}`}
              onClick={() => {
                setMode('discharge')
                reset()
              }}
            >
              🔄 Descarga RC
            </button>
          </div>

          <div className="rc-player-controls">
            <button
              type="button"
              className="rc-play-btn"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? '⏸ Pausar' : '▶ Iniciar'}
            </button>
            <button type="button" className="rc-step-btn" onClick={stepForward}>
              ⏯ Paso (+0.1τ)
            </button>
            <button type="button" className="rc-reset-btn" onClick={reset}>
              🔄 Reiniciar
            </button>
          </div>

          <div className="rc-speed-control">
            <span>Velocidad:</span>
            {[0.5, 1, 2].map(s => (
              <button
                key={s}
                type="button"
                className={`rc-speed-btn ${speed === s ? 'active' : ''}`}
                onClick={() => setSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>

          {mode === 'discharge' && (
            <label className="rc-sign-checkbox">
              <input
                type="checkbox"
                checked={showSignedCurrent}
                onChange={e => setShowSignedCurrent(e.target.checked)}
              />
              Mostrar signo físico de descarga (-I)
            </label>
          )}
        </div>
      </div>

      {/* Visualización Esquematizada del Circuito RC */}
      <div className="rc-display-grid">
        <div className="rc-schematic-card">
          <h4>Esquema Transitorio del Circuito RC</h4>
          <svg viewBox="0 0 380 200" className="rc-schematic-svg">
            {/* Marco de circuito */}
            <rect x="50" y="30" width="280" height="130" rx="6" fill="none" stroke="var(--color-border-medium)" strokeWidth="2" />

            {/* Fuente V0 a la izquierda (solo si modo carga) */}
            {mode === 'charge' ? (
              <g className="rc-source-symbol">
                <line x1="50" y1="80" x2="50" y2="110" stroke="#F5A66A" strokeWidth="3" />
                <line x1="40" y1="88" x2="60" y2="88" stroke="#F5A66A" strokeWidth="3" />
                <line x1="44" y1="102" x2="56" y2="102" stroke="#5C9CE6" strokeWidth="4" />
                <text x="25" y="98" fill="#F5A66A" fontSize="12" fontWeight="bold">V₀</text>
              </g>
            ) : (
              <g className="rc-discharge-short">
                <line x1="50" y1="30" x2="50" y2="160" stroke="#42D7C8" strokeWidth="2.5" />
                <text x="20" y="100" fill="#42D7C8" fontSize="10">Corto</text>
              </g>
            )}

            {/* Resistor R arriba */}
            <g className="rc-resistor-symbol">
              <rect x="150" y="22" width="60" height="16" fill="var(--color-bg-surface-elevated)" stroke="#F5A66A" strokeWidth="1.5" />
              <text x="180" y="34" fill="#F4F0E8" fontSize="10" textAnchor="middle">
                R = {R} Ω
              </text>
            </g>

            {/* Capacitor C a la derecha con placas y carga */}
            <g className="rc-capacitor-symbol">
              <rect x="310" y="30" width="20" height="130" fill="var(--color-bg-ink)" />
              {/* Placa superior */}
              <line x1="320" y1="75" x2="340" y2="75" stroke="#F5A66A" strokeWidth="3" />
              {/* Placa inferior */}
              <line x1="320" y1="95" x2="340" y2="95" stroke="#5C9CE6" strokeWidth="3" />
              <text x="355" y="88" fill="#42D7C8" fontSize="11" fontWeight="bold">C</text>
              {/* Indicador de carga acumulada */}
              <rect
                x="322"
                y="77"
                width="16"
                height={Math.max(2, (V_t / (V0 || 1)) * 16)}
                fill="#B69BE8"
                opacity="0.6"
              />
            </g>

            {/* Flecha de corriente transitoria */}
            {I_mag > 1e-5 && (
              <g className="rc-current-arrow">
                <text x="180" y="65" fill="#42D7C8" fontSize="11" textAnchor="middle" fontFamily="var(--font-mono)">
                  I(t) = {(I_t * 1000).toFixed(2)} mA
                </text>
              </g>
            )}
          </svg>

          <div className="rc-metrics-summary">
            <div className="rc-metric-badge">
              <span>Tiempo Actual:</span>
              <strong>t = {t.toFixed(3)} s</strong>
            </div>
            <div className="rc-metric-badge">
              <span>Constante τ = RC:</span>
              <strong>τ = {tau.toFixed(3)} s</strong>
            </div>
            <div className="rc-metric-badge">
              <span>Voltaje V(t):</span>
              <strong>{V_t.toFixed(2)} V</strong>
            </div>
            <div className="rc-metric-badge">
              <span>Corriente I(t):</span>
              <strong>{(I_t * 1000).toFixed(2)} mA</strong>
            </div>
            <div className="rc-metric-badge">
              <span>Carga Q(t):</span>
              <strong>{(Q_t * 1e6).toFixed(2)} μC</strong>
            </div>
          </div>
        </div>

        {/* Gráficas Científicas de V(t) e I(t) */}
        <div className="rc-charts-card">
          <ScientificChart
            title="Evolución Temporal del Circuito RC"
            subtitle={
              mode === 'charge'
                ? `Carga exponencial: V(t) = V₀(1 - e⁻ᵗ/ᵀ) · τ = ${tau.toFixed(2)} s`
                : `Descarga exponencial: V(t) = V₀ e⁻ᵗ/ᵀ · τ = ${tau.toFixed(2)} s`
            }
            xLabel="Tiempo t"
            xUnit="s"
            yLabel="Magnitud"
            currentX={t}
            series={[
              {
                id: 'rc-v',
                name: 'Voltaje V(t) [V]',
                color: '#42D7C8',
                data: chartPoints.vPts,
                unit: 'V'
              },
              {
                id: 'rc-i',
                name: 'Corriente I(t) [mA]',
                color: '#F5A66A',
                data: chartPoints.iPts,
                unit: 'mA',
                dashed: true
              }
            ]}
            height={200}
          />
        </div>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { CurrentMath, CONSTANTS } from '../domain/CurrentMath'
import './ElectrodynamicsView.css'

interface ConductorMaterial {
  name: string
  rho: number // Resistividad a 20°C (Ω·m)
  n: number   // Densidad de electrones libres (e-/m³)
  description: string
}

const MATERIALS: ConductorMaterial[] = [
  {
    name: 'Cobre (Cu)',
    rho: 1.68e-8,
    n: 8.5e28,
    description: 'Estándar en instalaciones y cables eléctricos por su excelente conductividad.'
  },
  {
    name: 'Plata (Ag)',
    rho: 1.59e-8,
    n: 5.86e28,
    description: 'El metal de mayor conductividad eléctrica conocida a temperatura ambiente.'
  },
  {
    name: 'Aluminio (Al)',
    rho: 2.65e-8,
    n: 1.81e29,
    description: 'Ligero y económico, usado en líneas de transmisión de alta tensión.'
  },
  {
    name: 'Oro (Au)',
    rho: 2.44e-8,
    n: 5.9e28,
    description: 'Excelente resistencia a la corrosión y oxidación en contactos y conectores.'
  },
  {
    name: 'Tungsteno (W)',
    rho: 5.6e-8,
    n: 6.3e28,
    description: 'Alto punto de fusión, usado históricamente en filamentos de bombillas.'
  }
]

export function ElectrodynamicsView() {
  // Parámetros de Corriente y Geometría
  const [I, setI] = useState(2.0) // Corriente (A)
  const [wireRadiusMm, setWireRadiusMm] = useState(0.8) // Radio del conductor en mm (calibre AWG ~14)
  const [wireLengthM, setWireLengthM] = useState(5.0) // Longitud (m)
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0)

  const material = MATERIALS[selectedMaterialIdx]

  // Cálculos físicos
  const areaM2 = useMemo(() => {
    const rM = wireRadiusMm * 1e-3
    return Math.PI * rM * rM
  }, [wireRadiusMm])

  const J = useMemo(() => {
    try {
      return CurrentMath.evaluateCurrentDensity(I, areaM2)
    } catch {
      return 0
    }
  }, [I, areaM2])

  const vd = useMemo(() => {
    try {
      return CurrentMath.evaluateDriftVelocity(I, material.n, areaM2)
    } catch {
      return 0
    }
  }, [I, material.n, areaM2])

  const R = useMemo(() => {
    try {
      return CurrentMath.evaluateResistance(material.rho, wireLengthM, areaM2)
    } catch {
      return 0
    }
  }, [material.rho, wireLengthM, areaM2])

  const voltageDrop = useMemo(() => I * R, [I, R])
  const powerLoss = useMemo(() => I * voltageDrop, [I, voltageDrop])

  return (
    <div className="electrodynamics-container">
      <div className="electro-header-box">
        <h3>Electrodinámica Microscópica y Parámetros del Conductor</h3>
        <p>
          Explora la relación entre la corriente macroscópica <code>I</code>, la densidad <code>J</code>,
          la lentísima velocidad de deriva de los electrones <code>v_d</code> y la resistencia óhmica <code>R = ρL/A</code>.
        </p>
      </div>

      <div className="electro-main-grid">
        {/* Controles de entrada */}
        <div className="electro-controls-card">
          <h4>1. Parámetros del Experimento</h4>

          <div className="electro-field">
            <label>Material Conductor:</label>
            <select
              value={selectedMaterialIdx}
              onChange={e => setSelectedMaterialIdx(Number(e.target.value))}
              className="electro-select"
            >
              {MATERIALS.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m.name} (ρ = {m.rho.toExponential(2)} Ω·m)
                </option>
              ))}
            </select>
            <span className="electro-helper">{material.description}</span>
          </div>

          <div className="electro-field">
            <label>
              Corriente Eléctrica I: <strong>{I.toFixed(2)} A</strong>
            </label>
            <input
              type="range"
              min="0.1"
              max="20"
              step="0.1"
              value={I}
              onChange={e => setI(Number(e.target.value))}
            />
          </div>

          <div className="electro-field">
            <label>
              Radio del Alambre r: <strong>{wireRadiusMm.toFixed(2)} mm</strong> (Área: {(areaM2 * 1e6).toFixed(3)} mm²)
            </label>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={wireRadiusMm}
              onChange={e => setWireRadiusMm(Number(e.target.value))}
            />
          </div>

          <div className="electro-field">
            <label>
              Longitud del Alambre L: <strong>{wireLengthM.toFixed(1)} m</strong>
            </label>
            <input
              type="range"
              min="0.5"
              max="50"
              step="0.5"
              value={wireLengthM}
              onChange={e => setWireLengthM(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Visualización Esquematizada del Alambre */}
        <div className="electro-visual-card">
          <h4>2. Sentido Convencional vs Deriva de Electrones (Modelo de Drude)</h4>

          <div className="wire-svg-wrapper">
            <svg viewBox="0 0 540 200" className="wire-svg">
              <defs>
                <linearGradient id="metal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#25353F" />
                  <stop offset="50%" stopColor="#1C2930" />
                  <stop offset="100%" stopColor="#152026" />
                </linearGradient>
                <marker id="arrow-copper" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="#F5A66A" />
                </marker>
                <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">
                  <polygon points="6 0, 0 3, 6 6" fill="#5C9CE6" />
                </marker>
              </defs>

              {/* Cilindro del alambre */}
              <rect x="70" y="55" width="400" height="90" rx="6" fill="url(#metal-grad)" stroke="#42D7C8" strokeWidth="1.5" />

              {/* Iones positivos de la red cristalina (fijos) */}
              {[95, 155, 215, 275, 335, 395, 445].map((cx, i) => (
                <g key={`ion-${i}`}>
                  <circle cx={cx} cy={75} r="7" fill="#24343D" stroke="#6B7D88" strokeWidth="1" />
                  <text x={cx} y={78} fill="#6B7D88" fontSize="9" textAnchor="middle">+</text>
                  <circle cx={cx} cy={125} r="7" fill="#24343D" stroke="#6B7D88" strokeWidth="1" />
                  <text x={cx} y={128} fill="#6B7D88" fontSize="9" textAnchor="middle">+</text>
                </g>
              ))}

              {/* Electrones libres en deriva (hacia la izquierda, contra el campo) */}
              {[125, 185, 245, 305, 365, 425].map((cx, i) => (
                <g key={`e-${i}`}>
                  <circle cx={cx} cy={100} r="6" fill="#5C9CE6" />
                  <text x={cx} y={103} fill="#111A20" fontSize="9" fontWeight="bold" textAnchor="middle">-</text>
                  {/* Flechita de velocidad vd hacia la izquierda */}
                  <line x1={cx - 8} y1={100} x2={cx - 18} y2={100} stroke="#5C9CE6" strokeWidth="1.5" markerEnd="url(#arrow-blue)" />
                </g>
              ))}

              {/* Flecha de Corriente Convencional (de izquierda a derecha: polo + al polo -) */}
              <line x1="120" y1="30" x2="420" y2="30" stroke="#F5A66A" strokeWidth="2.5" markerEnd="url(#arrow-copper)" />
              <text x="270" y="24" fill="#F5A66A" fontSize="11" fontWeight="bold" textAnchor="middle">
                Corriente Convencional I (de Mayor a Menor Potencial) →
              </text>

              {/* Indicador de campo eléctrico E dentro del conductor */}
              <line x1="140" y1="165" x2="400" y2="165" stroke="#42D7C8" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-copper)" />
              <text x="270" y="182" fill="#42D7C8" fontSize="10" textAnchor="middle">
                Campo Eléctrico E = J · ρ (en la dirección de la corriente convencional) →
              </text>
            </svg>
          </div>

          <div className="electro-paradox-box">
            <strong>💡 La Paradoja de la Velocidad de Deriva:</strong>
            <p>
              Observa que los electrones se desplazan a solo{' '}
              <span className="highlight-val">{(vd * 1000).toFixed(4)} mm/s</span> (tardarían más de 2 horas en recorrer 1 metro).
              Sin embargo, al encender un interruptor la bombilla se ilumina instantáneamente porque la{' '}
              <strong>onda del campo electromagnético</strong> viaja casi a la velocidad de la luz en el vacío{' '}
              <code>c ≈ 300.000 km/s</code>, poniendo en movimiento todos los electrones al mismo tiempo a lo largo del conductor.
            </p>
          </div>
        </div>

        {/* 3. Panel de Resultados Microscópicos & Macroscópicos */}
        <div className="electro-results-card">
          <h4>3. Magnitudes Físicas Calculadas</h4>

          <div className="electro-metrics-list">
            <div className="electro-metric-item">
              <span className="metric-label">Densidad de Corriente (J = I/A)</span>
              <span className="metric-value">{(J / 1e6).toFixed(3)} MA/m²</span>
            </div>

            <div className="electro-metric-item">
              <span className="metric-label">Velocidad de Deriva (v_d)</span>
              <span className="metric-value">
                {vd.toExponential(3)} m/s ({(vd * 1000).toFixed(4)} mm/s)
              </span>
            </div>

            <div className="electro-metric-item">
              <span className="metric-label">Densidad de Portadores (n)</span>
              <span className="metric-value">{material.n.toExponential(2)} e⁻/m³</span>
            </div>

            <div className="electro-metric-item highlight">
              <span className="metric-label">Resistencia Óhmica (R = ρL/A)</span>
              <span className="metric-value">{R.toFixed(4)} Ω</span>
            </div>

            <div className="electro-metric-item">
              <span className="metric-label">Caída de Tensión (ΔV = I·R)</span>
              <span className="metric-value">{(voltageDrop * 1000).toFixed(2)} mV</span>
            </div>

            <div className="electro-metric-item">
              <span className="metric-label">Pérdida por Efecto Joule (P = I²·R)</span>
              <span className="metric-value">{(powerLoss * 1000).toFixed(2)} mW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


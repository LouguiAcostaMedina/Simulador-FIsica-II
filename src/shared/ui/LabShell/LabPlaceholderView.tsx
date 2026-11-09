import './LabPlaceholderView.css'

export interface LabPlaceholderViewProps {
  unitId: string
  unitName: string
  expectedFeatures: string[]
  physicalLaws: string[]
  targetMilestone: string
  onSwitchToSimulator: () => void
}

export function LabPlaceholderView({
  unitId,
  unitName,
  expectedFeatures,
  physicalLaws,
  targetMilestone,
  onSwitchToSimulator
}: LabPlaceholderViewProps) {
  return (
    <div className="lab-placeholder-container">
      <div className="lab-placeholder-card">
        <div className="lab-placeholder-badge">{targetMilestone}</div>
        <h2 className="lab-placeholder-title">
          Laboratorio Interactivo de {unitId}: {unitName}
        </h2>
        <p className="lab-placeholder-desc">
          Este modo de experimentación libre está programado en la hoja de ruta física.
          Te permitirá manipular visualmente los componentes, conectar sondas y observar la respuesta del motor físico en tiempo real.
        </p>

        <div className="lab-placeholder-section">
          <h4>🧪 Capacidades en desarrollo para este laboratorio:</h4>
          <ul className="lab-placeholder-list">
            {expectedFeatures.map((feat, i) => (
              <li key={i}>{feat}</li>
            ))}
          </ul>
        </div>

        <div className="lab-placeholder-section">
          <h4>📐 Fundamentos y modelos físicos vinculados:</h4>
          <div className="lab-placeholder-tags">
            {physicalLaws.map((law, i) => (
              <span key={i} className="lab-placeholder-tag">
                {law}
              </span>
            ))}
          </div>
        </div>

        <div className="lab-placeholder-actions">
          <button
            type="button"
            className="lab-placeholder-switch-btn"
            onClick={onSwitchToSimulator}
          >
            ⚡ Explorar en Modo Simulador (Operativo)
          </button>
        </div>
      </div>
    </div>
  )
}


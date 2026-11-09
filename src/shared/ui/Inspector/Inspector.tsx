import React from 'react'
import './Inspector.css'

export interface InspectorMetricProps {
  label: string
  value: string | number
  unit?: string
  color?: string
  helper?: string
}

export function InspectorMetric({ label, value, unit, color, helper }: InspectorMetricProps) {
  return (
    <div className="inspector-metric">
      <div className="inspector-metric-label">
        <span>{label}</span>
        {helper && <span className="inspector-metric-helper" title={helper}>ℹ</span>}
      </div>
      <div className="inspector-metric-value" style={{ color: color || 'var(--color-text-ivory)' }}>
        <strong>{typeof value === 'number' ? value.toLocaleString('es-ES', { maximumFractionDigits: 4 }) : value}</strong>
        {unit && <span className="inspector-metric-unit">{unit}</span>}
      </div>
    </div>
  )
}

export interface InspectorFieldProps {
  label: string
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  error?: string
  helper?: string
  disabled?: boolean
  showSlider?: boolean
}

export function InspectorField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit,
  error,
  helper,
  disabled = false,
  showSlider = true
}: InspectorFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value)
    if (!Number.isNaN(parsed)) {
      onChange(parsed)
    }
  }

  return (
    <div className={`inspector-field ${error ? 'has-error' : ''}`}>
      <div className="inspector-field-header">
        <label className="inspector-field-label">
          {label}
          {unit && <span className="inspector-field-unit">({unit})</span>}
        </label>
        {helper && <span className="inspector-field-helper" title={helper}>ℹ</span>}
      </div>

      <div className="inspector-field-inputs">
        <input
          type="number"
          className="inspector-number-input"
          value={Number.isFinite(value) ? value : 0}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-label={label}
        />
        {showSlider && (
          <input
            type="range"
            className="inspector-slider-input"
            value={Number.isFinite(value) ? value : 0}
            onChange={handleChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            aria-label={`${label} control deslizante`}
          />
        )}
      </div>

      {error && (
        <div className="inspector-field-error" role="alert">
          <span className="error-icon">⚠</span> {error}
        </div>
      )}
    </div>
  )
}

export interface InspectorProps {
  title?: string
  badge?: string
  badgeVariant?: 'primary' | 'copper' | 'lilac' | 'warning'
  isEmpty?: boolean
  emptyMessage?: string
  onClose?: () => void
  actions?: React.ReactNode
  children?: React.ReactNode
}

export function Inspector({
  title = 'Inspector Contextual',
  badge,
  badgeVariant = 'primary',
  isEmpty = false,
  emptyMessage = 'Selecciona un elemento en el lienzo para inspeccionar sus magnitudes y ajustar parámetros.',
  onClose,
  actions,
  children
}: InspectorProps) {
  return (
    <aside className="inspector-panel" aria-label="Inspector de propiedades contextual">
      <div className="inspector-header">
        <div className="inspector-title-group">
          <h3 className="inspector-title">{title}</h3>
          {badge && <span className={`inspector-badge badge-${badgeVariant}`}>{badge}</span>}
        </div>
        {onClose && (
          <button
            type="button"
            className="inspector-close-btn"
            onClick={onClose}
            aria-label="Cerrar inspector"
          >
            ✕
          </button>
        )}
      </div>

      <div className="inspector-content">
        {isEmpty ? (
          <div className="inspector-empty-state">
            <div className="inspector-empty-icon">🔍</div>
            <p className="inspector-empty-text">{emptyMessage}</p>
          </div>
        ) : (
          <>
            {children}
            {actions && <div className="inspector-actions">{actions}</div>}
          </>
        )}
      </div>
    </aside>
  )
}


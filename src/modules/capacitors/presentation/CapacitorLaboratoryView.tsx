import React, { useState, useMemo } from 'react'
import { LabShell, LabMode, DimensionMode } from '../../../shared/ui/LabShell/LabShell'
import { InspectorMetric, InspectorField } from '../../../shared/ui/Inspector/Inspector'
import { ScientificChart } from '../../../shared/ui/Charts/ScientificChart'
import { CapacitorState, CapacitorMetrics, CapacitorMath, STANDARD_DIELECTRICS, DielectricMaterial } from '../domain/CapacitorMath'
import { Capacitor2DView } from './Capacitor2DView'
import { Capacitor3DView } from './Capacitor3DView'
import { isWebGLAvailable } from '../../../shared/ui/isWebGLAvailable'
import './CapacitorLaboratoryView.css'

export interface CapacitorLaboratoryViewProps {
  onSwitchToSimulator: () => void
}

export function CapacitorLaboratoryView({ onSwitchToSimulator }: CapacitorLaboratoryViewProps) {
  const webGLAvailable = useMemo(() => isWebGLAvailable(), [])
  const [dimension, setDimension] = useState<DimensionMode>('2D')
  const [webGLLost, setWebGLLost] = useState(false)

  // Estado del capacitor en SI
  const [state, setState] = useState<CapacitorState>({
    A: 0.01, // 100 cm² = 0.01 m²
    d: 0.002, // 2 mm = 0.002 m
    er: 1.0,
    mode: 'fixed_V',
    sourceValue: 12, // 12 V
    insertionFraction: 1.0
  })

  // Escenario base para comparación de deltas
  const [baselineMetrics, setBaselineMetrics] = useState<CapacitorMetrics | null>(null)

  // Selector de curva en gráfica inferior
  const [chartMode, setChartMode] = useState<'C_vs_d' | 'U_vs_V' | 'C_vs_f'>('C_vs_d')

  // Métrica calculada en tiempo real
  const metrics = useMemo(() => {
    try {
      return CapacitorMath.evaluate(state)
    } catch {
      return null
    }
  }, [state])

  const setParam = (key: keyof CapacitorState, value: any) => {
    setState(prev => {
      // Si cambia de modo V fijo -> Q fijo, preservar Q actual
      if (key === 'mode') {
        if (value === 'fixed_Q' && prev.mode === 'fixed_V' && metrics) {
          return { ...prev, mode: 'fixed_Q', sourceValue: metrics.Q }
        }
        if (value === 'fixed_V' && prev.mode === 'fixed_Q' && metrics) {
          return { ...prev, mode: 'fixed_V', sourceValue: metrics.V }
        }
      }
      return { ...prev, [key]: value }
    })
  }

  // Presets experimentales
  const applyPreset = (preset: 'vacuum' | 'dielectric_V' | 'dielectric_Q' | 'plates_gap') => {
    if (preset === 'vacuum') {
      setState({
        A: 0.01,
        d: 0.002,
        er: 1.0,
        mode: 'fixed_V',
        sourceValue: 12,
        insertionFraction: 1.0
      })
      setBaselineMetrics(null)
    } else if (preset === 'dielectric_V') {
      // Batería conectada, inserción de dieléctrico
      const baseState: CapacitorState = {
        A: 0.01,
        d: 0.002,
        er: 1.0,
        mode: 'fixed_V',
        sourceValue: 12,
        insertionFraction: 0.0
      }
      const baseM = CapacitorMath.evaluate(baseState)
      setBaselineMetrics(baseM)
      setState({
        ...baseState,
        er: 4.7, // Vidrio Pyrex
        insertionFraction: 1.0
      })
    } else if (preset === 'dielectric_Q') {
      // Carga fija, inserción de dieléctrico
      const baseState: CapacitorState = {
        A: 0.01,
        d: 0.002,
        er: 1.0,
        mode: 'fixed_V',
        sourceValue: 12,
        insertionFraction: 0.0
      }
      const baseM = CapacitorMath.evaluate(baseState)
      setBaselineMetrics(baseM)
      setState({
        A: 0.01,
        d: 0.002,
        er: 4.7,
        mode: 'fixed_Q',
        sourceValue: baseM.Q,
        insertionFraction: 1.0
      })
    } else if (preset === 'plates_gap') {
      setState({
        A: 0.015,
        d: 0.005,
        er: 1.0,
        mode: 'fixed_V',
        sourceValue: 15,
        insertionFraction: 1.0
      })
      setBaselineMetrics(null)
    }
  }

  // Material dieléctrico rápido
  const selectMaterial = (mat: DielectricMaterial) => {
    setParam('er', mat.er)
    if (state.insertionFraction === 0) {
      setParam('insertionFraction', 1.0)
    }
  }

  // Datos para la gráfica interactiva inferior
  const chartSeries = useMemo(() => {
    if (!metrics) return []

    if (chartMode === 'C_vs_d') {
      const points = []
      for (let i = 1; i <= 25; i++) {
        const dVal = 0.0005 + (i / 25) * 0.01 // 0.5 mm a 10.5 mm
        try {
          const m = CapacitorMath.evaluate({ ...state, d: dVal })
          points.push({ x: dVal * 1000, y: m.C * 1e12 }) // mm vs pF
        } catch {
          // ignore
        }
      }
      return [
        {
          id: 'C_d',
          name: 'C(d) [pF]',
          color: '#42D7C8',
          data: points,
          unit: 'pF'
        }
      ]
    } else if (chartMode === 'U_vs_V') {
      const points = []
      for (let i = 1; i <= 25; i++) {
        const vVal = (i / 25) * 30 // 0 a 30 V
        try {
          const m = CapacitorMath.evaluate({ ...state, mode: 'fixed_V', sourceValue: vVal })
          points.push({ x: vVal, y: m.U * 1e12 }) // V vs pJ
        } catch {
          // ignore
        }
      }
      return [
        {
          id: 'U_V',
          name: 'Energía U(V) [pJ]',
          color: '#F5A66A',
          data: points,
          unit: 'pJ'
        }
      ]
    } else {
      // C vs fracción de inserción f
      const points = []
      for (let i = 0; i <= 20; i++) {
        const fVal = i / 20
        try {
          const m = CapacitorMath.evaluate({ ...state, insertionFraction: fVal })
          points.push({ x: fVal * 100, y: m.C * 1e12 }) // % vs pF
        } catch {
          // ignore
        }
      }
      return [
        {
          id: 'C_f',
          name: 'C(f) [pF]',
          color: '#B69BE8',
          data: points,
          unit: 'pF'
        }
      ]
    }
  }, [state, metrics, chartMode])

  // Delat de comparación con el escenario base
  const comparisonDelta = useMemo(() => {
    if (!baselineMetrics || !metrics) return null
    const deltaC = metrics.C - baselineMetrics.C
    const deltaQ = metrics.Q - baselineMetrics.Q
    const deltaV = metrics.V - baselineMetrics.V
    const deltaU = metrics.U - baselineMetrics.U

    // Trabajo suministrado por la batería
    const workBattery = state.mode === 'fixed_V' ? deltaQ * state.sourceValue : 0

    return {
      deltaC,
      deltaQ,
      deltaV,
      deltaU,
      workBattery
    }
  }, [baselineMetrics, metrics, state.mode, state.sourceValue])

  return (
    <LabShell
      unitId="U2"
      unitTitle="Capacitores y Dieléctricos"
      formulaBadge="C = ε₀·εᵣ·A / d"
      mode="laboratory"
      onModeChange={(m: LabMode) => {
        if (m === 'simulator') onSwitchToSimulator()
      }}
      dimension={dimension}
      onDimensionChange={(dim: DimensionMode) => {
        if (dim === '3D' && !webGLAvailable) {
          alert('WebGL no está disponible en este dispositivo. Manteniendo modo 2D.')
          return
        }
        setDimension(dim)
      }}
      statusBadge={{
        label: state.mode === 'fixed_V' ? 'Batería Conectada (V Fijo)' : 'Batería Desconectada (Q Fijo)',
        variant: state.mode === 'fixed_V' ? 'running' : 'idle'
      }}
      headerActions={
        <div className="cap-header-actions">
          <button
            type="button"
            className={`cap-mode-pill ${state.mode === 'fixed_V' ? 'active' : ''}`}
            onClick={() => setParam('mode', 'fixed_V')}
            title="Mantener voltaje V constante (batería conectada)"
          >
            🔋 V Fijo
          </button>
          <button
            type="button"
            className={`cap-mode-pill ${state.mode === 'fixed_Q' ? 'active' : ''}`}
            onClick={() => setParam('mode', 'fixed_Q')}
            title="Mantener carga Q constante (batería desconectada)"
          >
            ⚡ Q Fijo
          </button>
          <button
            type="button"
            className="cap-action-btn secondary"
            onClick={() => setBaselineMetrics(metrics)}
            title="Guardar estado actual como escenario base para calcular diferencias"
          >
            📌 Fijar Base
          </button>
          {baselineMetrics && (
            <button
              type="button"
              className="cap-action-btn secondary"
              onClick={() => setBaselineMetrics(null)}
              title="Limpiar escenario base"
            >
              Limpiar Base
            </button>
          )}
        </div>
      }
      libraryTitle="Materiales & Presets"
      libraryContent={
        <div className="cap-library">
          {/* 1. Selector de Dieléctricos */}
          <div className="cap-lib-section">
            <h4 className="cap-lib-heading">Material Dieléctrico</h4>
            <div className="cap-materials-list">
              {STANDARD_DIELECTRICS.map(mat => (
                <button
                  key={mat.name}
                  type="button"
                  className={`cap-mat-btn ${state.er === mat.er ? 'active' : ''}`}
                  onClick={() => selectMaterial(mat)}
                >
                  <span className="cap-mat-name">{mat.name}</span>
                  <span className="cap-mat-er">εᵣ = {mat.er}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Presets experimentales */}
          <div className="cap-lib-section">
            <h4 className="cap-lib-heading">Casos Experimentales</h4>
            <div className="cap-preset-list">
              <button
                type="button"
                className="cap-preset-btn"
                onClick={() => applyPreset('vacuum')}
              >
                ◻ Vacío Estándar (εᵣ = 1.0)
              </button>
              <button
                type="button"
                className="cap-preset-btn"
                onClick={() => applyPreset('dielectric_V')}
              >
                🔋 Dieléctrico con V Fijo (Batería)
              </button>
              <button
                type="button"
                className="cap-preset-btn"
                onClick={() => applyPreset('dielectric_Q')}
              >
                ⚡ Dieléctrico con Q Fijo (Aislado)
              </button>
              <button
                type="button"
                className="cap-preset-btn"
                onClick={() => applyPreset('plates_gap')}
              >
                📏 Gran Separación (d = 5 mm)
              </button>
            </div>
          </div>

          {/* 3. Selección de gráfica inferior */}
          <div className="cap-lib-section">
            <h4 className="cap-lib-heading">Curva en Panel Inferior</h4>
            <div className="cap-chart-selector">
              <button
                type="button"
                className={`cap-chart-tab ${chartMode === 'C_vs_d' ? 'active' : ''}`}
                onClick={() => setChartMode('C_vs_d')}
              >
                C vs d (1/d)
              </button>
              <button
                type="button"
                className={`cap-chart-tab ${chartMode === 'U_vs_V' ? 'active' : ''}`}
                onClick={() => setChartMode('U_vs_V')}
              >
                U vs V (½CV²)
              </button>
              <button
                type="button"
                className={`cap-chart-tab ${chartMode === 'C_vs_f' ? 'active' : ''}`}
                onClick={() => setChartMode('C_vs_f')}
              >
                C vs Inserción
              </button>
            </div>
          </div>
        </div>
      }
      inspectorTitle="Inspector Contextual"
      inspectorBadge={state.mode === 'fixed_V' ? 'V Conectado' : 'Q Aislado'}
      inspectorContent={
        <div className="cap-inspector">
          {/* Controles de Parámetros */}
          <div className="cap-insp-group">
            <h4 className="cap-insp-title">Geometría de Placas</h4>
            <InspectorField
              label="Área A"
              value={state.A * 10000}
              onChange={val => setParam('A', Math.max(10, val) / 10000)}
              min={10}
              max={400}
              step={10}
              unit="cm²"
              helper="Área superficial de cada placa conductora (SI: ×10⁻⁴ m²)"
            />
            <InspectorField
              label="Separación d"
              value={state.d * 1000}
              onChange={val => setParam('d', Math.max(0.5, val) / 1000)}
              min={0.5}
              max={15}
              step={0.5}
              unit="mm"
              helper="Distancia entre placas paralelas (SI: ×10⁻³ m)"
            />
            <InspectorField
              label="Dieléctrico εᵣ"
              value={state.er}
              onChange={val => setParam('er', Math.max(1, val))}
              min={1}
              max={20}
              step={0.1}
              unit=""
              helper="Permitividad relativa del material aislante (vacío = 1.0)"
            />
            <InspectorField
              label="Inserción del Dieléctrico"
              value={(state.insertionFraction ?? 1.0) * 100}
              onChange={val => setParam('insertionFraction', Math.max(0, Math.min(100, val)) / 100)}
              min={0}
              max={100}
              step={5}
              unit="%"
              helper="Fracción de inserción horizontal de la lámina dieléctrica entre placas"
            />
          </div>

          <div className="cap-insp-group">
            <h4 className="cap-insp-title">
              {state.mode === 'fixed_V' ? 'Fuente de Voltaje' : 'Carga Congelada'}
            </h4>
            {state.mode === 'fixed_V' ? (
              <InspectorField
                label="Voltaje V"
                value={state.sourceValue}
                onChange={val => setParam('sourceValue', val)}
                min={1}
                max={50}
                step={1}
                unit="V"
                helper="Diferencia de potencial fijada por la batería conectada"
              />
            ) : (
              <InspectorField
                label="Carga Almacenada Q"
                value={state.sourceValue * 1e12}
                onChange={val => setParam('sourceValue', val * 1e-12)}
                min={10}
                max={500}
                step={10}
                unit="pC"
                helper="Carga neta atrapada en las placas al desconectar la batería"
              />
            )}
          </div>

          {/* Resultados Instantáneos */}
          {metrics && (
            <div className="cap-insp-group">
              <h4 className="cap-insp-title">Magnitudes Físicas</h4>
              <InspectorMetric
                label="Capacitancia C"
                value={(metrics.C * 1e12).toFixed(2)}
                unit="pF"
                color="var(--color-field-turquoise)"
              />
              <InspectorMetric
                label="Carga Almacenada Q"
                value={(metrics.Q * 1e12).toFixed(2)}
                unit="pC"
                color="#F27C77"
              />
              <InspectorMetric
                label="Voltaje entre Placas V"
                value={metrics.V.toFixed(2)}
                unit="V"
                color="#5C9CE6"
              />
              <InspectorMetric
                label="Campo Eléctrico Medio E"
                value={(metrics.E / 1000).toFixed(2)}
                unit="kV/m"
              />
              <InspectorMetric
                label="Energía Almacenada U"
                value={(metrics.U * 1e12).toFixed(2)}
                unit="pJ"
                color="#F5A66A"
              />
              {state.er > 1 && (
                <InspectorMetric
                  label="Fuerza en Dieléctrico F"
                  value={(metrics.slabForce * 1e6).toFixed(3)}
                  unit="μN"
                  helper="Fuerza atractiva que tira de la lámina hacia el interior del capacitor"
                />
              )}
            </div>
          )}

          {/* Comparación con Escenario Base */}
          {comparisonDelta && (
            <div className="cap-insp-group cap-comparison-box">
              <h4 className="cap-insp-title">Comparación vs Base</h4>
              <InspectorMetric
                label="ΔC (Capacitancia)"
                value={`${comparisonDelta.deltaC >= 0 ? '+' : ''}${(comparisonDelta.deltaC * 1e12).toFixed(2)}`}
                unit="pF"
                color={comparisonDelta.deltaC >= 0 ? '#42D7C8' : '#F27C77'}
              />
              <InspectorMetric
                label="ΔQ (Carga)"
                value={`${comparisonDelta.deltaQ >= 0 ? '+' : ''}${(comparisonDelta.deltaQ * 1e12).toFixed(2)}`}
                unit="pC"
              />
              <InspectorMetric
                label="ΔV (Voltaje)"
                value={`${comparisonDelta.deltaV >= 0 ? '+' : ''}${comparisonDelta.deltaV.toFixed(2)}`}
                unit="V"
              />
              <InspectorMetric
                label="ΔU (Energía Almacenada)"
                value={`${comparisonDelta.deltaU >= 0 ? '+' : ''}${(comparisonDelta.deltaU * 1e12).toFixed(2)}`}
                unit="pJ"
                color="#F5A66A"
              />
              {state.mode === 'fixed_V' && (
                <div className="cap-energy-note">
                  <strong>Trabajo Batería W_bat:</strong>{' '}
                  {(comparisonDelta.workBattery * 1e12).toFixed(2)} pJ (W_bat = 2 · ΔU)
                </div>
              )}
            </div>
          )}
        </div>
      }
      bottomTitle="Curva Físico-Matemática & Principios de Capacitancia"
      bottomContent={
        <div className="cap-bottom-panel">
          <div className="cap-bottom-chart">
            <ScientificChart
              series={chartSeries}
              xLabel={
                chartMode === 'C_vs_d'
                  ? 'Separación d (mm)'
                  : chartMode === 'U_vs_V'
                  ? 'Voltaje V (V)'
                  : 'Inserción del Dieléctrico (%)'
              }
              yLabel={chartMode === 'U_vs_V' ? 'Energía U (pJ)' : 'Capacitancia C (pF)'}
              currentX={
                chartMode === 'C_vs_d'
                  ? state.d * 1000
                  : chartMode === 'U_vs_V'
                  ? metrics?.V ?? state.sourceValue
                  : (state.insertionFraction ?? 1) * 100
              }
              height={190}
            />
          </div>

          <div className="cap-bottom-formulas">
            <div className="cap-formula-card">
              <h5>Capacitancia de Placas Paralelas</h5>
              <code>C = ε₀ · εᵣ · A / d</code>
              <span>Suponiendo placas ideales de área A y separación d ≪ √A (sin efecto de borde).</span>
            </div>
            <div className="cap-formula-card">
              <h5>Energía Electrostática Almacenada</h5>
              <code>U = ½ · C · V² = Q² / (2C)</code>
              <span>
                Con V fijo, U aumenta al insertar dieléctrico. Con Q fijo, U disminuye porque el campo realiza trabajo sobre la lámina.
              </span>
            </div>
          </div>
        </div>
      }
      helpContent={
        <div>
          <h3>Guía del Laboratorio de Capacitores y Dieléctricos</h3>
          <p>
            1. <strong>Manipulación visual:</strong> En la vista 2D puedes arrastrar el punto verde para cambiar la distancia <em>d</em>, el punto naranja para modificar el área <em>A</em> y el punto azul para deslizar la lámina dieléctrica.
          </p>
          <p>
            2. <strong>Batería conectada vs desconectada:</strong> Con <em>V Fijo</em>, la batería mantiene el voltaje y suministra carga adicional cuando entra el dieléctrico. Con <em>Q Fijo</em>, la carga queda atrapada en las placas y el voltaje disminuye.
          </p>
          <p>
            3. <strong>Fijar Escenario Base:</strong> Pulsa <em>Fijar Base</em> antes de cambiar un parámetro para observar exactamente cuánto cambia cada magnitud ($\Delta C, \Delta Q, \Delta V, \Delta U$).
          </p>
        </div>
      }
    >
      <div className="cap-canvas-wrapper">
        {dimension === '2D' || webGLLost || !webGLAvailable ? (
          <Capacitor2DView
            state={state}
            metrics={metrics!}
            onParamChange={setParam}
            interactive={true}
          />
        ) : (
          <div className="cap-3d-wrapper">
            <Capacitor3DView
              state={state}
              metrics={metrics!}
              onContextLost={() => {
                setWebGLLost(true)
                setDimension('2D')
              }}
            />
          </div>
        )}
      </div>
    </LabShell>
  )
}

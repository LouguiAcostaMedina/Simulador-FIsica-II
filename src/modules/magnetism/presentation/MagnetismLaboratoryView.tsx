import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { LabShell, LabMode, DimensionMode } from '../../../shared/ui/LabShell/LabShell'
import { InspectorMetric, InspectorField } from '../../../shared/ui/Inspector/Inspector'
import { ScientificChart } from '../../../shared/ui/Charts/ScientificChart'
import { Vector3 } from '../../../shared/domain/Vector3'
import { MagnetismMath, CONSTANTS } from '../domain/MagnetismMath'
import { Magnetism2DView } from './Magnetism2DView'
import { Magnetism3DView } from './Magnetism3DView'
import { isWebGLAvailable } from '../../../shared/ui/isWebGLAvailable'
import './MagnetismLaboratoryView.css'

export interface MagnetismLaboratoryViewProps {
  onSwitchToSimulator: () => void
}

interface ParticleState {
  position: Vector3
  velocity: Vector3
  q: number
  m: number
}

export function MagnetismLaboratoryView({ onSwitchToSimulator }: MagnetismLaboratoryViewProps) {
  const webGLAvailable = useMemo(() => isWebGLAvailable(), [])
  const [dimension, setDimension] = useState<DimensionMode>('2D')
  const [webGLLost, setWebGLLost] = useState(false)

  // Configuración de la fuente magnética
  const [sourceType, setSourceType] = useState<'wire' | 'dipole' | 'uniform'>('wire')
  const [current, setCurrent] = useState(15) // A o A·m²
  const [bExt, setBExt] = useState<Vector3>(new Vector3(0, 0, 0))
  const [eExt, setExt] = useState<Vector3>(new Vector3(0, 0, 0))

  // Posición de la sonda de medición magnética
  const [probePos, setProbePos] = useState<Vector3>(new Vector3(1.5, 0, 0))

  // Partícula de prueba y snapshot reproducible
  const [particle, setParticle] = useState<ParticleState>({
    position: new Vector3(1.2, 0, 0),
    velocity: new Vector3(0, 6, 0),
    q: 1.0,
    m: 1.0
  })

  const [initialSnapshot, setInitialSnapshot] = useState<ParticleState>({
    position: new Vector3(1.2, 0, 0),
    velocity: new Vector3(0, 6, 0),
    q: 1.0,
    m: 1.0
  })

  const [simState, setSimState] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle')
  const [simTime, setSimTime] = useState(0)
  const [trajectory, setTrajectory] = useState<Vector3[]>([new Vector3(1.2, 0, 0)])

  // Selector de curva en panel inferior
  const [chartMode, setChartMode] = useState<'B_vs_r' | 'speed_vs_t'>('B_vs_r')
  const [speedHistory, setSpeedHistory] = useState<{ x: number; y: number }[]>([
    { x: 0, y: 6.0 }
  ])

  // Actualizar parámetros de partícula en reposo
  const updateParticle = (updates: Partial<ParticleState>) => {
    const updated = { ...particle, ...updates }
    setParticle(updated)
    if (simState === 'idle' || simState === 'paused') {
      setInitialSnapshot(updated)
      setTrajectory([updated.position.clone()])
      setSpeedHistory([{ x: 0, y: updated.velocity.magnitude() }])
    }
  }

  // --- PRESETS DIDÁCTICOS ---
  const applyPreset = (preset: 'wire' | 'dipole' | 'wien' | 'cyclotron') => {
    handleReset()
    if (preset === 'wire') {
      setSourceType('wire')
      setCurrent(20)
      setBExt(new Vector3(0, 0, 0))
      setExt(new Vector3(0, 0, 0))
      const p: ParticleState = {
        position: new Vector3(1.5, 0, 0),
        velocity: new Vector3(0, 8, 0),
        q: 1.0,
        m: 1.0
      }
      setParticle(p)
      setInitialSnapshot(p)
      setTrajectory([p.position.clone()])
      setSpeedHistory([{ x: 0, y: 8.0 }])
    } else if (preset === 'dipole') {
      setSourceType('dipole')
      setCurrent(5)
      setBExt(new Vector3(0, 0, 0))
      setExt(new Vector3(0, 0, 0))
      const p: ParticleState = {
        position: new Vector3(2.0, 0, 0),
        velocity: new Vector3(0, 5, 0),
        q: 1.0,
        m: 1.0
      }
      setParticle(p)
      setInitialSnapshot(p)
      setTrajectory([p.position.clone()])
      setSpeedHistory([{ x: 0, y: 5.0 }])
    } else if (preset === 'wien') {
      // Selector de velocidades de Wien: E = 20 N/C, B = 2 T -> v_wien = 10 m/s
      setSourceType('uniform')
      setCurrent(0)
      setBExt(new Vector3(0, 0, 2.0))
      setExt(new Vector3(0, 20.0, 0))
      const p: ParticleState = {
        position: new Vector3(-2.0, 0, 0),
        velocity: new Vector3(10, 0, 0), // v = E / B = 10 m/s exactamente
        q: 1.0,
        m: 1.0
      }
      setParticle(p)
      setInitialSnapshot(p)
      setTrajectory([p.position.clone()])
      setSpeedHistory([{ x: 0, y: 10.0 }])
    } else if (preset === 'cyclotron') {
      // Ciclotrón / Campo uniforme puro
      setSourceType('uniform')
      setCurrent(0)
      setBExt(new Vector3(0, 0, 1.5))
      setExt(new Vector3(0, 0, 0))
      const p: ParticleState = {
        position: new Vector3(0, 0, 0),
        velocity: new Vector3(6, 0, 0),
        q: 1.0,
        m: 1.0
      }
      setParticle(p)
      setInitialSnapshot(p)
      setTrajectory([p.position.clone()])
      setSpeedHistory([{ x: 0, y: 6.0 }])
    }
  }

  // --- INTEGRACIÓN BORIS PUSHER ---
  const executeStep = useCallback(() => {
    setParticle(prev => {
      const dt = 0.005 // 5 ms
      // Campo B total en la posición de la partícula
      let bTotal = bExt
      try {
        if (sourceType === 'wire') {
          bTotal = bTotal.add(
            MagnetismMath.evaluateWireBField(
              current,
              new Vector3(0, 0, 1),
              new Vector3(0, 0, 0),
              prev.position
            )
          )
        } else if (sourceType === 'dipole') {
          bTotal = bTotal.add(
            MagnetismMath.evaluateDipoleBField(
              new Vector3(0, current * 0.1, 0),
              new Vector3(0, 0, 0),
              prev.position
            )
          )
        }
      } catch {
        setSimState('paused')
        return prev
      }

      // Paso exacto de Boris
      const next = MagnetismMath.borisStep(
        { position: prev.position, velocity: prev.velocity },
        { q: prev.q, m: prev.m, E: eExt, B: bTotal, dt }
      )

      if (next.position.magnitude() > 30) {
        setSimState('finished')
        return prev
      }

      setTrajectory(traj => {
        if (traj.length > 400) return [...traj.slice(1), next.position.clone()]
        return [...traj, next.position.clone()]
      })

      return {
        ...prev,
        position: next.position,
        velocity: next.velocity
      }
    })

    setSimTime(t => {
      const nextT = t + 0.005
      setSpeedHistory(hist => {
        if (hist.length > 80) return [...hist.slice(1), { x: nextT, y: particle.velocity.magnitude() }]
        return [...hist, { x: nextT, y: particle.velocity.magnitude() }]
      })
      return nextT
    })
  }, [bExt, eExt, sourceType, current, particle.velocity])

  useEffect(() => {
    if (simState !== 'running') return
    let animId: number
    const loop = () => {
      for (let i = 0; i < 4; i++) {
        executeStep()
      }
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [simState, executeStep])

  const handlePlay = () => setSimState('running')
  const handlePause = () => setSimState('paused')
  const handleReset = () => {
    setSimState('idle')
    setSimTime(0)
    setParticle({
      position: initialSnapshot.position.clone(),
      velocity: initialSnapshot.velocity.clone(),
      q: initialSnapshot.q,
      m: initialSnapshot.m
    })
    setTrajectory([initialSnapshot.position.clone()])
    setSpeedHistory([{ x: 0, y: initialSnapshot.velocity.magnitude() }])
  }

  // Métricas locales en la sonda magnética
  const probeMetrics = useMemo(() => {
    let bTotal = bExt
    try {
      if (sourceType === 'wire') {
        bTotal = bTotal.add(
          MagnetismMath.evaluateWireBField(
            current,
            new Vector3(0, 0, 1),
            new Vector3(0, 0, 0),
            probePos
          )
        )
      } else if (sourceType === 'dipole') {
        bTotal = bTotal.add(
          MagnetismMath.evaluateDipoleBField(
            new Vector3(0, current * 0.1, 0),
            new Vector3(0, 0, 0),
            probePos
          )
        )
      }
      const bMag = bTotal.magnitude()
      return { bTotal, bMag }
    } catch {
      return null
    }
  }, [sourceType, current, bExt, probePos])

  // Magnitudes de partícula instantáneas
  const particleMetrics = useMemo(() => {
    const vMag = particle.velocity.magnitude()
    const kineticEnergy = 0.5 * particle.m * vMag * vMag
    const bMag = probeMetrics?.bMag ?? 1.0
    const larmorRadius = MagnetismMath.calculateLarmorRadius(particle.m, vMag, particle.q, bMag)
    const cyclotronFreq = MagnetismMath.calculateCyclotronFrequency(particle.q, bMag, particle.m)
    return { vMag, kineticEnergy, larmorRadius, cyclotronFreq }
  }, [particle, probeMetrics])

  // Curvas para la gráfica inferior
  const chartSeries = useMemo(() => {
    if (chartMode === 'B_vs_r') {
      const points = []
      for (let i = 1; i <= 25; i++) {
        const r = 0.2 + (i / 25) * 4.0 // 0.2 m a 4.2 m
        let bVal = bExt.magnitude()
        if (sourceType === 'wire') {
          bVal += (CONSTANTS.mu0 * current) / (2 * Math.PI * r)
        } else if (sourceType === 'dipole') {
          bVal += (CONSTANTS.mu0 * current * 0.1) / (4 * Math.PI * Math.pow(r, 3))
        }
        points.push({ x: r, y: bVal * 1e6 }) // r en m, B en uT
      }
      return [
        {
          id: 'B_r',
          name: 'B(r) [μT]',
          color: '#42D7C8',
          data: points,
          unit: 'μT'
        }
      ]
    } else {
      // Rapidez |v(t)|
      return [
        {
          id: 'v_t',
          name: 'Rapidez |v(t)| [m/s] (Boris)',
          color: '#F5A66A',
          data: speedHistory,
          unit: 'm/s'
        }
      ]
    }
  }, [chartMode, sourceType, current, bExt, speedHistory])

  return (
    <LabShell
      unitId="U4"
      unitTitle="Fuerza y Campo Magnético"
      formulaBadge="F = q·(E + v × B)"
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
        label:
          simState === 'running'
            ? `Simulando Lorentz (t=${simTime.toFixed(2)}s)`
            : simState === 'paused'
            ? 'Pausado'
            : 'Listo (Boris Pusher)',
        variant: simState === 'running' ? 'running' : 'idle'
      }}
      headerActions={
        <div className="mag-header-actions">
          <button
            type="button"
            className="mag-action-btn primary"
            onClick={simState === 'running' ? handlePause : handlePlay}
            title={simState === 'running' ? 'Pausar simulación' : 'Lanzar partícula de prueba'}
          >
            {simState === 'running' ? '⏸ Pausa' : '▶ Lanzar Partícula'}
          </button>
          <button
            type="button"
            className="mag-action-btn secondary"
            onClick={executeStep}
            disabled={simState === 'running'}
            title="Avanzar un paso físico (5 ms)"
          >
            ⏭ Paso
          </button>
          <button
            type="button"
            className="mag-action-btn secondary"
            onClick={handleReset}
            title="Restablecer posición inicial exacta (Snapshot)"
          >
            ⏹ Reiniciar
          </button>
        </div>
      }
      libraryTitle="Fuentes & Presets"
      libraryContent={
        <div className="mag-library">
          {/* 1. Selector de Fuente */}
          <div className="mag-lib-section">
            <h4 className="mag-lib-heading">Fuente Magnética</h4>
            <div className="mag-source-selector">
              <button
                type="button"
                className={`mag-source-btn ${sourceType === 'wire' ? 'active' : ''}`}
                onClick={() => setSourceType('wire')}
              >
                Hilo Rectilíneo (Biot-Savart)
              </button>
              <button
                type="button"
                className={`mag-source-btn ${sourceType === 'dipole' ? 'active' : ''}`}
                onClick={() => setSourceType('dipole')}
              >
                Dipolo Magnético (Imán)
              </button>
              <button
                type="button"
                className={`mag-source-btn ${sourceType === 'uniform' ? 'active' : ''}`}
                onClick={() => setSourceType('uniform')}
              >
                Campos Cruzados (Wien / Larmor)
              </button>
            </div>
          </div>

          {/* 2. Presets experimentales */}
          <div className="mag-lib-section">
            <h4 className="mag-lib-heading">Casos Didácticos</h4>
            <div className="mag-preset-list">
              <button type="button" className="mag-preset-btn" onClick={() => applyPreset('wire')}>
                ⚡ Hilo con Corriente (B ∝ 1/r)
              </button>
              <button type="button" className="mag-preset-btn" onClick={() => applyPreset('dipole')}>
                🧭 Dipolo Magnético (B ∝ 1/r³)
              </button>
              <button type="button" className="mag-preset-btn" onClick={() => applyPreset('wien')}>
                ⚖ Selector de Velocidades de Wien
              </button>
              <button type="button" className="mag-preset-btn" onClick={() => applyPreset('cyclotron')}>
                🔄 Radio de Larmor / Ciclotrón
              </button>
            </div>
          </div>

          {/* 3. Selección de gráfica inferior */}
          <div className="mag-lib-section">
            <h4 className="mag-lib-heading">Curva en Panel Inferior</h4>
            <div className="mag-chart-selector">
              <button
                type="button"
                className={`mag-chart-tab ${chartMode === 'B_vs_r' ? 'active' : ''}`}
                onClick={() => setChartMode('B_vs_r')}
              >
                B vs r (Biot-Savart)
              </button>
              <button
                type="button"
                className={`mag-chart-tab ${chartMode === 'speed_vs_t' ? 'active' : ''}`}
                onClick={() => setChartMode('speed_vs_t')}
              >
                Rapidez |v(t)| (Boris)
              </button>
            </div>
          </div>
        </div>
      }
      inspectorTitle="Inspector Contextual"
      inspectorBadge={sourceType === 'wire' ? 'Hilo Biot-Savart' : sourceType === 'dipole' ? 'Dipolo' : 'Cruzados'}
      inspectorContent={
        <div className="mag-inspector">
          {/* Parámetros de la Fuente */}
          <div className="mag-insp-group">
            <h4 className="mag-insp-title">
              {sourceType === 'wire' ? 'Corriente del Conductor' : sourceType === 'dipole' ? 'Momento Dipolar' : 'Campos Externos'}
            </h4>
            {sourceType === 'wire' && (
              <InspectorField
                label="Corriente I"
                value={current}
                onChange={val => setCurrent(val)}
                min={-50}
                max={50}
                step={2}
                unit="A"
                helper="Corriente eléctrica a lo largo del conductor ideal (positivo: sale de pantalla)"
              />
            )}
            {sourceType === 'dipole' && (
              <InspectorField
                label="Momento m"
                value={current}
                onChange={val => setCurrent(val)}
                min={0.5}
                max={20}
                step={0.5}
                unit="A·m²"
                helper="Magnitud del momento dipolar magnético"
              />
            )}
            {sourceType === 'uniform' && (
              <>
                <InspectorField
                  label="Campo Eléctrico Ey"
                  value={eExt.y}
                  onChange={val => setExt(new Vector3(0, val, 0))}
                  min={-50}
                  max={50}
                  step={5}
                  unit="N/C"
                />
                <InspectorField
                  label="Campo Magnético Bz"
                  value={bExt.z}
                  onChange={val => setBExt(new Vector3(0, 0, val))}
                  min={-5}
                  max={5}
                  step={0.5}
                  unit="T"
                />
              </>
            )}
          </div>

          {/* Sonda Magnética */}
          <div className="mag-insp-group">
            <h4 className="mag-insp-title">Sonda Magnética B</h4>
            <div className="mag-pos-row">
              <InspectorField
                label="Pos X"
                value={probePos.x}
                onChange={val => setProbePos(new Vector3(val, probePos.y, 0))}
                min={-4}
                max={4}
                step={0.1}
                unit="m"
                showSlider={false}
              />
              <InspectorField
                label="Pos Y"
                value={probePos.y}
                onChange={val => setProbePos(new Vector3(probePos.x, val, 0))}
                min={-4}
                max={4}
                step={0.1}
                unit="m"
                showSlider={false}
              />
            </div>
            {probeMetrics && (
              <InspectorMetric
                label="Inducción |B|"
                value={(probeMetrics.bMag * 1e6).toFixed(2)}
                unit="μT"
                color="var(--color-field-turquoise)"
              />
            )}
          </div>

          {/* Partícula de Prueba */}
          <div className="mag-insp-group">
            <h4 className="mag-insp-title">Partícula de Prueba (Lorentz)</h4>
            <InspectorField
              label="Carga q"
              value={particle.q}
              onChange={val => updateParticle({ q: val })}
              min={-5}
              max={5}
              step={0.5}
              unit="C"
            />
            <InspectorField
              label="Masa m"
              value={particle.m}
              onChange={val => updateParticle({ m: Math.max(0.1, val) })}
              min={0.1}
              max={10}
              step={0.5}
              unit="kg"
            />
            <div className="mag-pos-row">
              <InspectorField
                label="v₀x"
                value={initialSnapshot.velocity.x}
                onChange={val => {
                  const newV = new Vector3(val, particle.velocity.y, 0)
                  updateParticle({ velocity: newV })
                }}
                min={-20}
                max={20}
                step={1}
                unit="m/s"
                showSlider={false}
                disabled={simState === 'running'}
              />
              <InspectorField
                label="v₀y"
                value={initialSnapshot.velocity.y}
                onChange={val => {
                  const newV = new Vector3(particle.velocity.x, val, 0)
                  updateParticle({ velocity: newV })
                }}
                min={-20}
                max={20}
                step={1}
                unit="m/s"
                showSlider={false}
                disabled={simState === 'running'}
              />
            </div>

            <div className="mag-particle-stats">
              <InspectorMetric
                label="Rapidez |v|"
                value={particleMetrics.vMag.toFixed(3)}
                unit="m/s"
                color="#5C9CE6"
              />
              <InspectorMetric
                label="Energía Cinética K"
                value={particleMetrics.kineticEnergy.toFixed(3)}
                unit="J"
                color="#F5A66A"
              />
              {Number.isFinite(particleMetrics.larmorRadius) && (
                <InspectorMetric
                  label="Radio de Larmor r_L"
                  value={particleMetrics.larmorRadius.toFixed(2)}
                  unit="m"
                />
              )}
            </div>
          </div>
        </div>
      }
      bottomTitle="Curva Físico-Matemática & Leyes del Magnetismo"
      bottomContent={
        <div className="mag-bottom-panel">
          <div className="mag-bottom-chart">
            <ScientificChart
              series={chartSeries}
              xLabel={chartMode === 'B_vs_r' ? 'Distancia r (m)' : 'Tiempo t (s)'}
              yLabel={chartMode === 'B_vs_r' ? 'Campo B (μT)' : 'Rapidez |v| (m/s)'}
              currentX={chartMode === 'B_vs_r' ? probePos.magnitude() : simTime}
              height={190}
            />
          </div>

          <div className="mag-bottom-formulas">
            <div className="mag-formula-card">
              <h5>Fuerza de Lorentz & Trabajo Nulo</h5>
              <code>{'F = q · (E + v × B),  dK/dt = q · (v · E)'}</code>
              <span>
                Cuando E = 0, la fuerza magnética es perpendicular a la velocidad (F ⟂ v). No realiza trabajo y conserva la rapidez |v| incondicionalmente.
              </span>
            </div>
            <div className="mag-formula-card">
              <h5>Ley de Biot-Savart & Radio de Larmor</h5>
              <code>{'B = μ₀·I / (2π·r),  r_L = (m·v_⊥) / (|q|·B)'}</code>
              <span>
                Simulación temporal integrada con el algoritmo simpléctico de Boris Pusher (referencia en física de plasmas).
              </span>
            </div>
          </div>
        </div>
      }
      helpContent={
        <div>
          <h3>Guía del Laboratorio de Fuerza y Campo Magnético</h3>
          <p>
            1. <strong>Fuentes magnéticas:</strong> Alterna entre hilo rectilíneo con corriente (Biot-Savart), dipolo magnético o campos cruzados (Selector de velocidades de Wien).
          </p>
          <p>
            2. <strong>Sonda magnética:</strong> Arrastra la aguja de brújula para medir el vector inducción magnética $B$ en cualquier coordenada.
          </p>
          <p>
            3. <strong>Partícula de prueba:</strong> Pulsa <em>Lanzar Partícula</em> para ver el movimiento bajo la fuerza de Lorentz $F = q(E + v \times B)$. Comprueba con la gráfica cómo el algoritmo Boris Pusher preserva la rapidez y energía de forma exacta.
          </p>
        </div>
      }
    >
      <div className="mag-canvas-wrapper">
        {dimension === '2D' || webGLLost || !webGLAvailable ? (
          <Magnetism2DView
            sourceType={sourceType}
            current={current}
            bExt={bExt}
            eExt={eExt}
            particle={particle}
            trajectory={trajectory}
            probePos={probePos}
            onProbeMove={setProbePos}
          />
        ) : (
          <div className="mag-3d-wrapper">
            <Magnetism3DView
              mode={sourceType === 'dipole' ? 'dipole' : 'wire'}
              I={current}
              showLorentz={simState === 'running'}
              q={particle.q}
              v0={particle.velocity}
              EExt={eExt}
              BExt={bExt}
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

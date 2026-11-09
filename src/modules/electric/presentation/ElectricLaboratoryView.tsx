import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { LabShell, LabMode, DimensionMode } from '../../../shared/ui/LabShell/LabShell'
import { InspectorMetric, InspectorField } from '../../../shared/ui/Inspector/Inspector'
import { Charge, TestParticle } from '../domain/Charge'
import { FieldMath } from '../domain/FieldMath'
import { MarchingSquares } from '../domain/MarchingSquares'
import { Vector3 } from '../../../shared/domain/Vector3'
import { Constants } from '../../../shared/domain/constants'
import { isWebGLAvailable } from '../../../shared/ui/isWebGLAvailable'
import './ElectricLaboratoryView.css'

export interface ElectricLaboratoryViewProps {
  onSwitchToSimulator: () => void
}

interface Probe {
  id: string
  type: 'field' | 'potential'
  position: Vector3
}

export function ElectricLaboratoryView({ onSwitchToSimulator }: ElectricLaboratoryViewProps) {
  // WebGL availability
  const webGLAvailable = useMemo(() => isWebGLAvailable(), [])
  const [dimension, setDimension] = useState<DimensionMode>('2D')

  // Cargas en la mesa de laboratorio
  const [charges, setCharges] = useState<Charge[]>([
    { id: 'c1', q: 2e-6, position: new Vector3(-1, 0, 0) },
    { id: 'c2', q: -2e-6, position: new Vector3(1, 0, 0) }
  ])

  // Selección activa
  const [selectedId, setSelectedId] = useState<string | null>('c1')
  const [selectedType, setSelectedType] = useState<'charge' | 'probe' | 'particle' | null>('charge')

  // Sondas
  const [probes, setProbes] = useState<Probe[]>([
    { id: 'probe-E', type: 'field', position: new Vector3(0, 1, 0) },
    { id: 'probe-V', type: 'potential', position: new Vector3(0, 0.5, 0) }
  ])

  // Isolíneas personalizadas por sondas
  const [customIsoValues, setCustomIsoValues] = useState<number[]>([])

  // Partícula de prueba y simulación
  const [testParticle, setTestParticle] = useState<TestParticle>({
    position: new Vector3(0, 1.8, 0),
    velocity: new Vector3(0.5, 0, 0),
    q: 1e-6,
    m: 1e-3
  })
  const [initialParticleSnapshot, setInitialParticleSnapshot] = useState<TestParticle>({
    position: new Vector3(0, 1.8, 0),
    velocity: new Vector3(0.5, 0, 0),
    q: 1e-6,
    m: 1e-3
  })

  const [simState, setSimState] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle')
  const [simTime, setSimTime] = useState(0)
  const [trajectory, setTrajectory] = useState<Vector3[]>([new Vector3(0, 1.8, 0)])

  // Capas visibles
  const [showVectors, setShowVectors] = useState(true)
  const [showFieldLines, setShowFieldLines] = useState(true)
  const [showEquipotentials, setShowEquipotentials] = useState(true)
  const [showProbes, setShowProbes] = useState(true)
  const [showTrajectory, setShowTrajectory] = useState(true)
  const [showGrid, setShowGrid] = useState(true)

  // Escala del workbench (px por metro)
  const [scale, setScale] = useState(65)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Arrastre en canvas
  const [draggingEntity, setDraggingEntity] = useState<{
    id: string
    type: 'charge' | 'probe' | 'particle'
  } | null>(null)

  // Sincronizar snapshot cuando se edita la partícula en modo reposo
  const updateParticleParam = (updates: Partial<TestParticle>) => {
    const updated = { ...testParticle, ...updates }
    setTestParticle(updated)
    if (simState === 'idle' || simState === 'paused') {
      setInitialParticleSnapshot(updated)
      setTrajectory([updated.position.clone()])
    }
  }

  // --- PRESETS DIDÁCTICOS ---
  const loadPreset = (type: 'single-pos' | 'single-neg' | 'dipole' | 'quadrupole' | 'plates') => {
    handleReset()
    if (type === 'single-pos') {
      setCharges([{ id: 'c1', q: 1e-6, position: new Vector3(0, 0, 0) }])
      setSelectedId('c1')
      setSelectedType('charge')
    } else if (type === 'single-neg') {
      setCharges([{ id: 'c1', q: -1e-6, position: new Vector3(0, 0, 0) }])
      setSelectedId('c1')
      setSelectedType('charge')
    } else if (type === 'dipole') {
      setCharges([
        { id: 'c1', q: 2e-6, position: new Vector3(-1, 0, 0) },
        { id: 'c2', q: -2e-6, position: new Vector3(1, 0, 0) }
      ])
      setSelectedId('c1')
      setSelectedType('charge')
    } else if (type === 'quadrupole') {
      setCharges([
        { id: 'c1', q: 1.5e-6, position: new Vector3(-1, 1, 0) },
        { id: 'c2', q: -1.5e-6, position: new Vector3(1, 1, 0) },
        { id: 'c3', q: 1.5e-6, position: new Vector3(1, -1, 0) },
        { id: 'c4', q: -1.5e-6, position: new Vector3(-1, -1, 0) }
      ])
      setSelectedId('c1')
      setSelectedType('charge')
    } else if (type === 'plates') {
      // 6 cargas simulando dos placas paralelas
      setCharges([
        { id: 'p1', q: 1e-6, position: new Vector3(-1.2, 1, 0) },
        { id: 'p2', q: 1e-6, position: new Vector3(0, 1, 0) },
        { id: 'p3', q: 1e-6, position: new Vector3(1.2, 1, 0) },
        { id: 'p4', q: -1e-6, position: new Vector3(-1.2, -1, 0) },
        { id: 'p5', q: -1e-6, position: new Vector3(0, -1, 0) },
        { id: 'p6', q: -1e-6, position: new Vector3(1.2, -1, 0) }
      ])
      setSelectedId('p1')
      setSelectedType('charge')
    }
  }

  // --- AÑADIR CARGAS ---
  const addCharge = (qVal: number) => {
    if (charges.length >= 10) return
    const id = `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    // Desplazar un poco para que no se superpongan
    const offset = (charges.length % 5) * 0.3 - 0.6
    const newCharge: Charge = {
      id,
      q: qVal,
      position: new Vector3(offset, 0, 0)
    }
    setCharges(prev => [...prev, newCharge])
    setSelectedId(id)
    setSelectedType('charge')
  }

  const removeSelectedCharge = () => {
    if (!selectedId || selectedType !== 'charge') return
    setCharges(prev => prev.filter(c => c.id !== selectedId))
    setSelectedId(null)
    setSelectedType(null)
  }

  // --- CONTROL DE SIMULACIÓN DE PARTÍCULA ---
  const handlePlay = () => {
    if (charges.length === 0) return
    setSimState('running')
  }

  const handlePause = () => {
    setSimState('paused')
  }

  const handleReset = () => {
    setSimState('idle')
    setSimTime(0)
    const restored = {
      position: initialParticleSnapshot.position.clone(),
      velocity: initialParticleSnapshot.velocity.clone(),
      q: initialParticleSnapshot.q,
      m: initialParticleSnapshot.m
    }
    setTestParticle(restored)
    setTrajectory([restored.position.clone()])
  }

  const handleStep = () => {
    if (charges.length === 0) return
    executeSimulationStep()
  }

  const executeSimulationStep = useCallback(() => {
    setTestParticle(prev => {
      const dt = 0.002 // 2 ms
      try {
        const E = FieldMath.evaluateField(charges, prev.position)
        const F = FieldMath.evaluateForce(E, prev.q)
        const a = FieldMath.evaluateAcceleration(F, prev.m)

        // Euler-Cromer
        const newVel = prev.velocity.add(a.multiplyScalar(dt))
        const newPos = prev.position.add(newVel.multiplyScalar(dt))

        // Si se sale de los límites
        if (newPos.length() > 50) {
          setSimState('finished')
          return prev
        }

        setTrajectory(traj => {
          if (traj.length > 500) {
            return [...traj.slice(1), newPos.clone()]
          }
          return [...traj, newPos.clone()]
        })

        return {
          ...prev,
          position: newPos,
          velocity: newVel
        }
      } catch {
        setSimState('paused')
        return prev
      }
    })
    setSimTime(t => t + 0.002)
  }, [charges])

  // Bucle de animación para la partícula
  useEffect(() => {
    if (simState !== 'running') return
    let animId: number
    const loop = () => {
      // 5 micro-pasos por frame para suavidad física
      for (let i = 0; i < 5; i++) {
        executeSimulationStep()
      }
      animId = requestAnimationFrame(loop)
    }
    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [simState, executeSimulationStep])

  // --- RENDERIZADO EN CANVAS 2D ---
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    const cx = width / 2
    const cy = height / 2

    const toWorld = (x: number, y: number) => new Vector3((x - cx) / scale, -(y - cy) / scale, 0)
    const toScreen = (v: Vector3) => ({ x: cx + v.x * scale, y: cy - v.y * scale })

    // 1. Rejilla métrica (Grid)
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
      ctx.lineWidth = 1
      const meterStep = scale // 1 metro
      for (let x = cx % meterStep; x < width; x += meterStep) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = cy % meterStep; y < height; y += meterStep) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Ejes coordenados principales
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(0, cy)
      ctx.lineTo(width, cy)
      ctx.moveTo(cx, 0)
      ctx.lineTo(cx, height)
      ctx.stroke()

      // Etiquetas métricas
      ctx.fillStyle = 'rgba(244, 240, 232, 0.35)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('(0,0)', cx + 16, cy + 14)
      ctx.fillText('+1 m', cx + scale, cy + 14)
      ctx.fillText('-1 m', cx - scale, cy + 14)
      ctx.fillText('+1 m', cx + 18, cy - scale + 4)
      ctx.fillText('-1 m', cx + 18, cy + scale + 4)
    }

    // 2. Isolíneas equipotenciales (Marching Squares)
    if (showEquipotentials && charges.length > 0) {
      const cols = 56
      const rows = 42
      const xCoords: number[] = []
      const yCoords: number[] = []
      for (let c = 0; c < cols; c++) {
        const sx = (c / (cols - 1)) * width
        xCoords.push(toWorld(sx, 0).x)
      }
      for (let r = 0; r < rows; r++) {
        const sy = (r / (rows - 1)) * height
        yCoords.push(toWorld(0, sy).y)
      }

      const grid: number[][] = []
      for (let r = 0; r < rows; r++) {
        const row: number[] = []
        for (let c = 0; c < cols; c++) {
          const wPos = new Vector3(xCoords[c], yCoords[r], 0)
          try {
            let singular = false
            for (const ch of charges) {
              if (wPos.sub(ch.position).length() < 0.06) {
                singular = true
                break
              }
            }
            if (singular) {
              row.push(NaN)
            } else {
              row.push(FieldMath.evaluatePotential(charges, wPos))
            }
          } catch {
            row.push(NaN)
          }
        }
        grid.push(row)
      }

      // Valores isopotenciales didácticos + personalizados
      const isoValues = [
        -25000, -12000, -6000, -3000, -1500, -600, -200, 0,
        200, 600, 1500, 3000, 6000, 12000, 25000,
        ...customIsoValues
      ]

      const segments = MarchingSquares.generateContours(grid, xCoords, yCoords, isoValues)

      ctx.lineWidth = 1.2
      for (const seg of segments) {
        const s1 = toScreen(new Vector3(seg.x1, seg.y1, 0))
        const s2 = toScreen(new Vector3(seg.x2, seg.y2, 0))

        const isCustom = customIsoValues.includes(seg.value)
        if (isCustom) {
          ctx.strokeStyle = '#F5A66A' // Cobre resaltado para sondas
          ctx.lineWidth = 2
        } else if (seg.value === 0) {
          ctx.strokeStyle = 'rgba(244, 240, 232, 0.75)' // Plano neutro
          ctx.lineWidth = 1.5
        } else if (seg.value > 0) {
          ctx.strokeStyle = 'rgba(242, 124, 119, 0.45)' // Positivo
          ctx.lineWidth = 1.2
        } else {
          ctx.strokeStyle = 'rgba(182, 155, 232, 0.45)' // Negativo
          ctx.lineWidth = 1.2
        }

        ctx.beginPath()
        ctx.moveTo(s1.x, s1.y)
        ctx.lineTo(s2.x, s2.y)
        ctx.stroke()
      }
    }

    // 3. Rejilla de vectores discretos de campo E
    if (showVectors && charges.length > 0) {
      const step = 42
      ctx.lineWidth = 1
      for (let x = 20; x < width; x += step) {
        for (let y = 20; y < height; y += step) {
          const wPos = toWorld(x, y)
          try {
            const E = FieldMath.evaluateField(charges, wPos)
            const mag = E.length()
            if (mag > 10) {
              const dir = E.multiplyScalar(1 / mag)
              const len = Math.min(20, Math.max(8, Math.log10(mag) * 4))
              const ex = x + dir.x * len
              const ey = y - dir.y * len

              ctx.strokeStyle = 'rgba(66, 215, 200, 0.28)'
              ctx.beginPath()
              ctx.moveTo(x, y)
              ctx.lineTo(ex, ey)
              ctx.stroke()

              // Flecha de cabeza
              ctx.fillStyle = 'rgba(66, 215, 200, 0.4)'
              ctx.fillRect(ex - 1.5, ey - 1.5, 3, 3)
            }
          } catch {
            // singularidad
          }
        }
      }
    }

    // 4. Líneas de campo continuas integradas
    if (showFieldLines && charges.length > 0) {
      ctx.strokeStyle = 'rgba(66, 215, 200, 0.85)'
      ctx.lineWidth = 1.4

      const seedRadius = 0.12
      const stepSize = 0.04
      const maxSteps = 350

      charges.forEach(c => {
        const numSeeds = 10
        for (let i = 0; i < numSeeds; i++) {
          const angle = (i / numSeeds) * Math.PI * 2
          let currentPos = new Vector3(
            c.position.x + Math.cos(angle) * seedRadius,
            c.position.y + Math.sin(angle) * seedRadius,
            0
          )
          const forward = c.q > 0

          ctx.beginPath()
          const startScreen = toScreen(currentPos)
          ctx.moveTo(startScreen.x, startScreen.y)

          for (let st = 0; st < maxSteps; st++) {
            try {
              const E = FieldMath.evaluateField(charges, currentPos)
              const mag = E.length()
              if (mag < 1e-4) break

              const dir = E.multiplyScalar((forward ? 1 : -1) / mag)
              currentPos = currentPos.add(dir.multiplyScalar(stepSize))

              // Parar si colisiona con otra carga
              let hitOther = false
              for (const otherC of charges) {
                if (currentPos.sub(otherC.position).length() < seedRadius * 0.95) {
                  hitOther = true
                  break
                }
              }
              if (hitOther) break

              const sPos = toScreen(currentPos)
              if (sPos.x < -40 || sPos.x > width + 40 || sPos.y < -40 || sPos.y > height + 40) break
              ctx.lineTo(sPos.x, sPos.y)
            } catch {
              break
            }
          }
          ctx.stroke()
        }
      })
    }

    // 5. Trayectoria de la partícula de prueba
    if (showTrajectory && trajectory.length > 1) {
      ctx.strokeStyle = '#F5A66A'
      ctx.lineWidth = 2.5
      ctx.setLineDash([4, 2])
      ctx.beginPath()
      const start = toScreen(trajectory[0])
      ctx.moveTo(start.x, start.y)
      for (let i = 1; i < trajectory.length; i++) {
        const p = toScreen(trajectory[i])
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
      ctx.setLineDash([])
    }

    // 6. Dibujar Partícula de prueba
    {
      const pos = toScreen(testParticle.position)
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = '#F5A66A'
      ctx.fill()
      ctx.lineWidth = selectedType === 'particle' ? 3 : 1.5
      ctx.strokeStyle = '#fff'
      ctx.stroke()

      // Etiqueta q_t
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('qₜ', pos.x, pos.y)

      // Vector de velocidad v
      if (testParticle.velocity.length() > 0.05) {
        const vNorm = testParticle.velocity.multiplyScalar(1 / testParticle.velocity.length())
        const vLen = Math.min(35, testParticle.velocity.length() * 10)
        ctx.strokeStyle = '#5C9CE6'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(pos.x + vNorm.x * vLen, pos.y - vNorm.y * vLen)
        ctx.stroke()
      }
    }

    // 7. Sondas de Medición
    if (showProbes) {
      probes.forEach(probe => {
        const pos = toScreen(probe.position)
        const isSelected = selectedId === probe.id && selectedType === 'probe'

        if (probe.type === 'field') {
          // Sonda de Campo E
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, 11, 0, Math.PI * 2)
          ctx.fillStyle = isSelected ? '#42D7C8' : 'rgba(66, 215, 200, 0.75)'
          ctx.fill()
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = isSelected ? 2.5 : 1.5
          ctx.stroke()

          // Icono sensor diana
          ctx.fillStyle = '#111A20'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('E', pos.x, pos.y)

          // Vector de campo local desde la sonda
          try {
            const E = FieldMath.evaluateField(charges, probe.position)
            const mag = E.length()
            if (mag > 0) {
              const dir = E.multiplyScalar(1 / mag)
              const arrowLen = 32
              const ex = pos.x + dir.x * arrowLen
              const ey = pos.y - dir.y * arrowLen

              ctx.strokeStyle = '#42D7C8'
              ctx.lineWidth = 2.5
              ctx.beginPath()
              ctx.moveTo(pos.x, pos.y)
              ctx.lineTo(ex, ey)
              ctx.stroke()

              // Punta de flecha
              const angle = Math.atan2(-dir.y, dir.x)
              ctx.fillStyle = '#42D7C8'
              ctx.beginPath()
              ctx.moveTo(ex, ey)
              ctx.lineTo(ex - 7 * Math.cos(angle - Math.PI / 6), ey - 7 * Math.sin(angle - Math.PI / 6))
              ctx.lineTo(ex - 7 * Math.cos(angle + Math.PI / 6), ey - 7 * Math.sin(angle + Math.PI / 6))
              ctx.closePath()
              ctx.fill()
            }
          } catch {
            // singularidad
          }
        } else {
          // Sonda de Potencial V (Voltímetro)
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, 11, 0, Math.PI * 2)
          ctx.fillStyle = isSelected ? '#B69BE8' : 'rgba(182, 155, 232, 0.75)'
          ctx.fill()
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = isSelected ? 2.5 : 1.5
          ctx.stroke()

          ctx.fillStyle = '#111A20'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('V', pos.x, pos.y)
        }
      })
    }

    // 8. Cargas Puntuales (con halo de selección)
    charges.forEach((c, idx) => {
      const pos = toScreen(c.position)
      const isSelected = selectedId === c.id && selectedType === 'charge'

      if (isSelected) {
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 18, 0, Math.PI * 2)
        ctx.strokeStyle = '#42D7C8'
        ctx.lineWidth = 2.5
        ctx.setLineDash([3, 3])
        ctx.stroke()
        ctx.setLineDash([])
      }

      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 13, 0, Math.PI * 2)
      ctx.fillStyle = c.q > 0 ? '#F27C77' : '#B69BE8'
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(c.q > 0 ? '+' : '−', pos.x, pos.y - 1)

      // Subtítulo con valor en uC
      ctx.font = '9px monospace'
      ctx.fillStyle = 'rgba(244, 240, 232, 0.85)'
      ctx.fillText(`q${idx + 1}: ${(c.q * 1e6).toFixed(1)}μC`, pos.x, pos.y + 19)
    })

  }, [
    charges,
    testParticle,
    trajectory,
    scale,
    probes,
    selectedId,
    selectedType,
    showVectors,
    showFieldLines,
    showEquipotentials,
    showProbes,
    showTrajectory,
    showGrid,
    customIsoValues
  ])

  // --- INTERACCIÓN DE RATÓN Y TOQUE EN WORKBENCH ---
  const getEventWorldPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return new Vector3(0, 0, 0)
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    return new Vector3((x - cx) / scale, -(y - cy) / scale, 0)
  }

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const wPos = getEventWorldPos(e)
    const hitRadius = 18 / scale

    // 1. Probar clic en cargas
    for (let i = charges.length - 1; i >= 0; i--) {
      const c = charges[i]
      if (c.position.sub(wPos).length() <= hitRadius) {
        setSelectedId(c.id)
        setSelectedType('charge')
        setDraggingEntity({ id: c.id, type: 'charge' })
        return
      }
    }

    // 2. Probar clic en partícula de prueba
    if (testParticle.position.sub(wPos).length() <= hitRadius) {
      setSelectedId('test-particle')
      setSelectedType('particle')
      setDraggingEntity({ id: 'test-particle', type: 'particle' })
      return
    }

    // 3. Probar clic en sondas
    for (const p of probes) {
      if (p.position.sub(wPos).length() <= hitRadius) {
        setSelectedId(p.id)
        setSelectedType('probe')
        setDraggingEntity({ id: p.id, type: 'probe' })
        return
      }
    }

    // Clic en fondo: deseleccionar
    setSelectedId(null)
    setSelectedType(null)
  }

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingEntity) return
    const wPos = getEventWorldPos(e)

    if (draggingEntity.type === 'charge') {
      setCharges(prev =>
        prev.map(c => (c.id === draggingEntity.id ? { ...c, position: wPos } : c))
      )
    } else if (draggingEntity.type === 'particle') {
      updateParticleParam({ position: wPos })
    } else if (draggingEntity.type === 'probe') {
      setProbes(prev =>
        prev.map(p => (p.id === draggingEntity.id ? { ...p, position: wPos } : p))
      )
    }
  }

  const handlePointerUp = () => {
    setDraggingEntity(null)
  }

  // Objeto actualmente inspeccionado
  const selectedCharge = useMemo(
    () => (selectedType === 'charge' ? charges.find(c => c.id === selectedId) : null),
    [charges, selectedId, selectedType]
  )
  const selectedProbe = useMemo(
    () => (selectedType === 'probe' ? probes.find(p => p.id === selectedId) : null),
    [probes, selectedId, selectedType]
  )

  // Métricas de la sonda seleccionada
  const probeMetrics = useMemo(() => {
    if (!selectedProbe) return null
    try {
      const E = FieldMath.evaluateField(charges, selectedProbe.position)
      const V = FieldMath.evaluatePotential(charges, selectedProbe.position)
      const mag = E.length()
      const thetaDeg = (Math.atan2(E.y, E.x) * 180) / Math.PI
      return { E, V, mag, thetaDeg }
    } catch {
      return null
    }
  }, [charges, selectedProbe])

  // Carga neta y momento dipolar del sistema global
  const globalMetrics = useMemo(() => {
    const qNet = charges.reduce((acc, c) => acc + c.q, 0)
    let pVec = new Vector3(0, 0, 0)
    charges.forEach(c => {
      pVec = pVec.add(c.position.multiplyScalar(c.q))
    })
    return {
      qNet,
      pMag: pVec.length(),
      count: charges.length
    }
  }, [charges])

  // Trazar equipotencial que pasa por la sonda seleccionada
  const handleTraceEquipotentialAtProbe = () => {
    if (probeMetrics && Number.isFinite(probeMetrics.V)) {
      setCustomIsoValues(prev => [...prev, probeMetrics.V])
    }
  }

  return (
    <LabShell
      unitId="U1"
      unitTitle="Campo y Potencial Eléctrico"
      formulaBadge="E = k·Σ(qᵢ·r̂ᵢ/rᵢ²)"
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
            ? `Simulando (t=${simTime.toFixed(2)}s)`
            : simState === 'paused'
            ? 'Pausado'
            : charges.length === 0
            ? 'Sin cargas'
            : 'Listo',
        variant:
          simState === 'running'
            ? 'running'
            : simState === 'paused'
            ? 'paused'
            : charges.length === 0
            ? 'warning'
            : 'idle'
      }}
      headerActions={
        <div className="electric-header-actions">
          <button
            type="button"
            className="electric-action-btn primary"
            onClick={simState === 'running' ? handlePause : handlePlay}
            disabled={charges.length === 0}
            title={simState === 'running' ? 'Pausar simulación' : 'Lanzar partícula de prueba'}
          >
            {simState === 'running' ? '⏸ Pausa' : '▶ Lanzar Partícula'}
          </button>
          <button
            type="button"
            className="electric-action-btn secondary"
            onClick={handleStep}
            disabled={charges.length === 0 || simState === 'running'}
            title="Avanzar un paso físico (2 ms)"
          >
            ⏭ Paso
          </button>
          <button
            type="button"
            className="electric-action-btn secondary"
            onClick={handleReset}
            title="Restablecer posición inicial exacta (Snapshot)"
          >
            ⏹ Reiniciar
          </button>
        </div>
      }
      libraryTitle="Paleta & Capas"
      libraryContent={
        <div className="electric-library">
          {/* 1. Paleta de cargas para añadir */}
          <div className="electric-lib-section">
            <h4 className="electric-lib-heading">Añadir Cargas</h4>
            <div className="electric-charge-buttons">
              <button
                type="button"
                className="electric-add-btn pos"
                onClick={() => addCharge(1e-6)}
                disabled={charges.length >= 10}
              >
                +1 μC
              </button>
              <button
                type="button"
                className="electric-add-btn pos"
                onClick={() => addCharge(5e-6)}
                disabled={charges.length >= 10}
              >
                +5 μC
              </button>
              <button
                type="button"
                className="electric-add-btn neg"
                onClick={() => addCharge(-1e-6)}
                disabled={charges.length >= 10}
              >
                −1 μC
              </button>
              <button
                type="button"
                className="electric-add-btn neg"
                onClick={() => addCharge(-5e-6)}
                disabled={charges.length >= 10}
              >
                −5 μC
              </button>
            </div>
            <span className="electric-cap-note">{charges.length} / 10 cargas en mesa</span>
          </div>

          {/* 2. Presets experimentales */}
          <div className="electric-lib-section">
            <h4 className="electric-lib-heading">Presets Experimentales</h4>
            <div className="electric-preset-list">
              <button type="button" className="electric-preset-btn" onClick={() => loadPreset('single-pos')}>
                ⚡ Carga Única (+1 μC)
              </button>
              <button type="button" className="electric-preset-btn" onClick={() => loadPreset('dipole')}>
                ⚖ Dipolo (+2 μC, −2 μC)
              </button>
              <button type="button" className="electric-preset-btn" onClick={() => loadPreset('quadrupole')}>
                ❖ Cuadrupolo 2D
              </button>
              <button type="button" className="electric-preset-btn" onClick={() => loadPreset('plates')}>
                ═ Placas Paralelas (6 cargas)
              </button>
            </div>
          </div>

          {/* 3. Capas visibles */}
          <div className="electric-lib-section">
            <h4 className="electric-lib-heading">Capas de Visualización</h4>
            <div className="electric-toggles">
              <label className="electric-toggle-label">
                <input
                  type="checkbox"
                  checked={showFieldLines}
                  onChange={e => setShowFieldLines(e.target.checked)}
                />
                Líneas de Campo Eléctrico
              </label>
              <label className="electric-toggle-label">
                <input
                  type="checkbox"
                  checked={showEquipotentials}
                  onChange={e => setShowEquipotentials(e.target.checked)}
                />
                Isolíneas Equipotenciales
              </label>
              <label className="electric-toggle-label">
                <input
                  type="checkbox"
                  checked={showVectors}
                  onChange={e => setShowVectors(e.target.checked)}
                />
                Vectores Discretos (E)
              </label>
              <label className="electric-toggle-label">
                <input
                  type="checkbox"
                  checked={showProbes}
                  onChange={e => setShowProbes(e.target.checked)}
                />
                Sondas de Medición
              </label>
              <label className="electric-toggle-label">
                <input
                  type="checkbox"
                  checked={showTrajectory}
                  onChange={e => setShowTrajectory(e.target.checked)}
                />
                Trayectoria de Partícula
              </label>
              <label className="electric-toggle-label">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={e => setShowGrid(e.target.checked)}
                />
                Rejilla Coordenada (SI)
              </label>
            </div>
          </div>

          {/* 4. Zoom / Escala */}
          <div className="electric-lib-section">
            <h4 className="electric-lib-heading">Zoom de Mesa</h4>
            <div className="electric-zoom-row">
              <input
                type="range"
                min="30"
                max="120"
                value={scale}
                onChange={e => setScale(Number(e.target.value))}
                className="electric-scale-slider"
              />
              <span className="electric-scale-val">{scale} px/m</span>
            </div>
          </div>
        </div>
      }
      inspectorTitle="Inspector Contextual"
      inspectorBadge={
        selectedType === 'charge'
          ? 'Carga'
          : selectedType === 'probe'
          ? 'Sonda'
          : selectedType === 'particle'
          ? 'Partícula'
          : 'Sistema'
      }
      inspectorContent={
        <div className="electric-inspector">
          {/* INSPECTOR DE CARGA */}
          {selectedType === 'charge' && selectedCharge && (
            <div className="electric-insp-group">
              <h4 className="electric-insp-title">
                Carga {selectedCharge.q > 0 ? 'Positiva' : 'Negativa'}
              </h4>
              <InspectorField
                label="Magnitud q"
                value={selectedCharge.q * 1e6}
                onChange={val => {
                  setCharges(prev =>
                    prev.map(c => (c.id === selectedCharge.id ? { ...c, q: val * 1e-6 } : c))
                  )
                }}
                min={-20}
                max={20}
                step={0.5}
                unit="μC"
                helper="Carga puntual en microculombios (SI: ×10⁻⁶ C)"
              />
              <div className="electric-pos-row">
                <InspectorField
                  label="Posición X"
                  value={selectedCharge.position.x}
                  onChange={val => {
                    setCharges(prev =>
                      prev.map(c =>
                        c.id === selectedCharge.id
                          ? { ...c, position: new Vector3(val, c.position.y, 0) }
                          : c
                      )
                    )
                  }}
                  min={-5}
                  max={5}
                  step={0.1}
                  unit="m"
                  showSlider={false}
                />
                <InspectorField
                  label="Posición Y"
                  value={selectedCharge.position.y}
                  onChange={val => {
                    setCharges(prev =>
                      prev.map(c =>
                        c.id === selectedCharge.id
                          ? { ...c, position: new Vector3(c.position.x, val, 0) }
                          : c
                      )
                    )
                  }}
                  min={-5}
                  max={5}
                  step={0.1}
                  unit="m"
                  showSlider={false}
                />
              </div>

              <div className="electric-insp-actions">
                <button
                  type="button"
                  className="electric-insp-btn toggle-sign"
                  onClick={() => {
                    setCharges(prev =>
                      prev.map(c => (c.id === selectedCharge.id ? { ...c, q: -c.q } : c))
                    )
                  }}
                >
                  Invertir Signo (+ / −)
                </button>
                <button
                  type="button"
                  className="electric-insp-btn delete"
                  onClick={removeSelectedCharge}
                >
                  Eliminar Carga
                </button>
              </div>
            </div>
          )}

          {/* INSPECTOR DE SONDA */}
          {selectedType === 'probe' && selectedProbe && (
            <div className="electric-insp-group">
              <h4 className="electric-insp-title">
                {selectedProbe.type === 'field' ? 'Sonda de Campo E' : 'Sonda de Potencial V'}
              </h4>
              <p className="electric-insp-coord">
                Coordenadas: ({selectedProbe.position.x.toFixed(2)}, {selectedProbe.position.y.toFixed(2)}) m
              </p>

              {probeMetrics ? (
                <>
                  <InspectorMetric
                    label="|E| Módulo"
                    value={probeMetrics.mag.toExponential(3)}
                    unit="N/C"
                    color="var(--color-field-turquoise)"
                  />
                  <InspectorMetric
                    label="E_x"
                    value={probeMetrics.E.x.toExponential(3)}
                    unit="N/C"
                  />
                  <InspectorMetric
                    label="E_y"
                    value={probeMetrics.E.y.toExponential(3)}
                    unit="N/C"
                  />
                  <InspectorMetric
                    label="Potencial V"
                    value={probeMetrics.V.toLocaleString('es-ES', { maximumFractionDigits: 1 })}
                    unit="V"
                    color="var(--color-potential-purple)"
                  />
                  <InspectorMetric
                    label="Orientación θ"
                    value={probeMetrics.thetaDeg.toFixed(1)}
                    unit="°"
                  />
                  {selectedProbe.type === 'potential' && (
                    <button
                      type="button"
                      className="electric-insp-btn trace-btn"
                      onClick={handleTraceEquipotentialAtProbe}
                    >
                      Trazar Isolínea en este V
                    </button>
                  )}
                </>
              ) : (
                <div className="electric-singularity-warning">
                  ⚠ Singularidad: La sonda está sobre una carga puntual.
                </div>
              )}
            </div>
          )}

          {/* INSPECTOR DE PARTÍCULA DE PRUEBA */}
          {selectedType === 'particle' && (
            <div className="electric-insp-group">
              <h4 className="electric-insp-title">Partícula de Prueba (qₜ)</h4>
              <InspectorField
                label="Carga qₜ"
                value={testParticle.q * 1e6}
                onChange={val => updateParticleParam({ q: val * 1e-6 })}
                min={-10}
                max={10}
                step={0.5}
                unit="μC"
              />
              <InspectorField
                label="Masa m"
                value={testParticle.m * 1e3}
                onChange={val => updateParticleParam({ m: Math.max(0.1, val) * 1e-3 })}
                min={0.1}
                max={20}
                step={0.5}
                unit="g"
              />
              <InspectorField
                label="Velocidad v₀x"
                value={initialParticleSnapshot.velocity.x}
                onChange={val => {
                  const newV = new Vector3(val, testParticle.velocity.y, 0)
                  updateParticleParam({ velocity: newV })
                }}
                min={-10}
                max={10}
                step={0.5}
                unit="m/s"
                disabled={simState === 'running'}
              />
              <InspectorField
                label="Velocidad v₀y"
                value={initialParticleSnapshot.velocity.y}
                onChange={val => {
                  const newV = new Vector3(testParticle.velocity.x, val, 0)
                  updateParticleParam({ velocity: newV })
                }}
                min={-10}
                max={10}
                step={0.5}
                unit="m/s"
                disabled={simState === 'running'}
              />

              <div className="electric-particle-live-data">
                <h5>Estado Dinámico Actual</h5>
                <InspectorMetric
                  label="Rapidez |v|"
                  value={testParticle.velocity.length().toFixed(3)}
                  unit="m/s"
                  color="#5C9CE6"
                />
                <InspectorMetric
                  label="Energía Cinética K"
                  value={(0.5 * testParticle.m * testParticle.velocity.lengthSq()).toExponential(3)}
                  unit="J"
                />
              </div>
            </div>
          )}

          {/* INSPECTOR GLOBAL DEL SISTEMA */}
          {(!selectedType || !selectedId) && (
            <div className="electric-insp-group">
              <h4 className="electric-insp-title">Sistema de Cargas</h4>
              <InspectorMetric
                label="Total de Cargas"
                value={`${globalMetrics.count} / 10`}
              />
              <InspectorMetric
                label="Carga Neta Q_total"
                value={(globalMetrics.qNet * 1e6).toFixed(2)}
                unit="μC"
                color={globalMetrics.qNet > 0 ? '#F27C77' : globalMetrics.qNet < 0 ? '#B69BE8' : '#F4F0E8'}
              />
              <InspectorMetric
                label="Momento Dipolar |p|"
                value={globalMetrics.pMag.toExponential(3)}
                unit="C·m"
              />
              {customIsoValues.length > 0 && (
                <button
                  type="button"
                  className="electric-insp-btn delete"
                  onClick={() => setCustomIsoValues([])}
                >
                  Limpiar Isolíneas de Sondas
                </button>
              )}
            </div>
          )}
        </div>
      }
      bottomTitle="Principios Físicos de Electrostática"
      bottomContent={
        <div className="electric-bottom-panel">
          <div className="electric-formula-card">
            <h5>Ley de Coulomb & Superposición</h5>
            <p className="electric-formula-latex">
              {'E(r) = k · Σ [ qᵢ · (r − rᵢ) / |r − rᵢ|³ ]'}
            </p>
            <span className="electric-formula-note">
              k = 8.98755 × 10⁹ N·m²/C² | Principio de superposición lineal exacto.
            </span>
          </div>

          <div className="electric-formula-card">
            <h5>Potencial Escalar</h5>
            <p className="electric-formula-latex">
              {'V(r) = k · Σ [ qᵢ / |r − rᵢ| ]'}
            </p>
            <span className="electric-formula-note">
              Isolíneas calculadas mediante Marching Squares en rejilla 2D sin truncamiento.
            </span>
          </div>

          <div className="electric-formula-card">
            <h5>Dinámica de Partícula</h5>
            <p className="electric-formula-latex">
              {'F = q · E,  a = F / m,  v(t+Δt) = v(t) + a·Δt'}
            </p>
            <span className="electric-formula-note">
              Integrador simpléctico Euler-Cromer con snapshot estricto para reinicio reproducible.
            </span>
          </div>
        </div>
      }
      helpContent={
        <div>
          <h3>Guía de Uso del Laboratorio de Electrostática</h3>
          <p>
            1. <strong>Arrastrar cargas:</strong> Haz clic en los botones de la biblioteca (+1 μC, +5 μC, −1 μC, −5 μC) para colocar cargas en la mesa. Puedes arrastrarlas libremente con el ratón o dedo.
          </p>
          <p>
            2. <strong>Inspector de propiedades:</strong> Haz clic sobre cualquier carga para editar su posición métrica, su magnitud exacta o invertir su polaridad.
          </p>
          <p>
            3. <strong>Sondas de medición:</strong> Arrastra la sonda <strong>E</strong> para medir el vector campo y su ángulo, o la sonda <strong>V</strong> para medir el potencial escalar y trazar la curva equipotencial que pasa por ese punto.
          </p>
          <p>
            4. <strong>Partícula de prueba:</strong> Pulsa <em>Lanzar Partícula</em> para ver cómo acelera en el campo eléctrico. Pulsa <em>Reiniciar</em> para regresar con precisión al estado inicial exacto.
          </p>
        </div>
      }
    >
      <div className="electric-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={900}
          height={650}
          className="electric-canvas-2d"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
        />
        <div className="electric-canvas-hint">
          <span>Arrastra cargas, sondas o la partícula qₜ</span>
        </div>
      </div>
    </LabShell>
  )
}

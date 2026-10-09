import React, { useRef, useEffect, useState, MouseEvent } from 'react'
import { Charge, TestParticle } from '../domain/Charge'
import { FieldMath } from '../domain/FieldMath'
import { Vector3 } from '../../../shared/domain/Vector3'

interface Props {
  charges: Charge[]
  testParticle: TestParticle | null
  trajectory: Vector3[]
  scale: number
  onChargeMove?: (id: string, q: number, newPos: Vector3) => void
  onInspect?: (pos: Vector3 | null) => void
}

export function Electric2DView({ charges, testParticle, trajectory, scale, onChargeMove, onInspect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [draggingCharge, setDraggingCharge] = useState<string | null>(null)

  const getEventWorldPos = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return new Vector3(0, 0, 0)
    const rect = canvas.getBoundingClientRect()
    // Resolucion real vs tamaño visual
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const cx = canvas.width / 2
    const cy = canvas.height / 2

    return new Vector3((x - cx) / scale, -(y - cy) / scale, 0)
  }

  const handlePointerDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const wPos = getEventWorldPos(e)
    
    // Verificar si clickea una carga (radio de colision = 15/scale m)
    const hitRadius = 15 / scale
    for (let i = charges.length - 1; i >= 0; i--) {
      const c = charges[i]
      if (c.position.sub(wPos).length() <= hitRadius) {
        setDraggingCharge(c.id)
        if (onInspect) onInspect(null)
        return
      }
    }
    // Si no clickea carga, inspecciona el punto
    if (onInspect) {
      onInspect(wPos)
    }
  }

  const handlePointerMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (draggingCharge && onChargeMove) {
      const wPos = getEventWorldPos(e)
      const charge = charges.find(c => c.id === draggingCharge)
      if (charge) {
        onChargeMove(draggingCharge, charge.q, wPos)
      }
    }
  }

  const handlePointerUp = () => {
    setDraggingCharge(null)
  }

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

    // 1. Dibujar mapa de potencial (Líneas equipotenciales)
    // Utilizamos una rejilla gruesa y bandas de contorno para evitar caída de rendimiento
    if (charges.length > 0) {
      const eqStep = 4
      const contourInterval = 2000 // Dibujar línea cada 2000V
      const tolerance = 200 // Grosor de la línea en voltios

      ctx.fillStyle = 'rgba(182, 155, 232, 0.3)' // Lila suave para equipotenciales
      for (let x = 0; x < width; x += eqStep) {
        for (let y = 0; y < height; y += eqStep) {
          const wPos = toWorld(x, y)
          try {
            const V = FieldMath.evaluatePotential(charges, wPos)
            const Vabs = Math.abs(V)
            // Si Vabs está cerca de un múltiplo de contourInterval
            const remainder = Vabs % contourInterval
            if (remainder < tolerance || contourInterval - remainder < tolerance) {
              // Diferenciar color por signo
              ctx.fillStyle = V > 0 ? 'rgba(242, 124, 119, 0.4)' : 'rgba(182, 155, 232, 0.4)'
              ctx.fillRect(x, y, eqStep, eqStep)
            }
          } catch (e) {
            // singularidad
          }
        }
      }
    }

    // 1.5 Dibujar cuadrícula de campo vectorial
    const step = 40
    ctx.strokeStyle = 'rgba(66, 215, 200, 0.3)'
    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < height; y += step) {
        if (charges.length === 0) continue
        const wPos = toWorld(x, y)
        try {
          const E = FieldMath.evaluateField(charges, wPos)
          const mag = E.length()
          if (mag > 0) {
            const E_norm = E.multiplyScalar(1 / mag)
            const length = 15
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x + E_norm.x * length, y - E_norm.y * length)
            ctx.stroke()
            ctx.fillStyle = 'rgba(66, 215, 200, 0.5)'
            ctx.fillRect(x + E_norm.x * length - 1, y - E_norm.y * length - 1, 3, 3)
          }
        } catch (e) {
          // Singularity
        }
      }
    }

    // 2. Dibujar trayectoria
    if (trajectory.length > 1) {
      ctx.strokeStyle = '#F5A66A'
      ctx.lineWidth = 2
      ctx.beginPath()
      const start = toScreen(trajectory[0])
      ctx.moveTo(start.x, start.y)
      for (let i = 1; i < trajectory.length; i++) {
        const p = toScreen(trajectory[i])
        ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }

    // 3. Dibujar cargas
    charges.forEach(c => {
      const pos = toScreen(c.position)
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2)
      ctx.fillStyle = c.q > 0 ? '#F27C77' : '#B69BE8' 
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '14px Arial'
      ctx.fillText(c.q > 0 ? '+' : '-', pos.x, pos.y)
    })

    // 4. Dibujar test particle
    if (testParticle) {
      const pos = toScreen(testParticle.position)
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#F5A66A'
      ctx.fill()
    }

  }, [charges, testParticle, trajectory, scale])

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={600} 
      style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: draggingCharge ? 'grabbing' : 'crosshair' }} 
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  )
}

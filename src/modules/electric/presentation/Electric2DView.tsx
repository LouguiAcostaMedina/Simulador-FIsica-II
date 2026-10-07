import React, { useRef, useEffect } from 'react'
import { Charge, TestParticle } from '../domain/Charge'
import { FieldMath } from '../domain/FieldMath'
import { Vector3 } from '../../../shared/domain/Vector3'

interface Props {
  charges: Charge[]
  testParticle: TestParticle | null
  trajectory: Vector3[]
}

export function Electric2DView({ charges, testParticle, trajectory }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height)

    // Escala: 1 metro = 50 pixeles, origen al centro
    const scale = 50
    const cx = width / 2
    const cy = height / 2

    const toWorld = (x: number, y: number) => new Vector3((x - cx) / scale, -(y - cy) / scale, 0)
    const toScreen = (v: Vector3) => ({ x: cx + v.x * scale, y: cy - v.y * scale })

    // Dibujar cuadrícula de campo
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
            // Longitud fija para la flecha de dirección
            const length = 15
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x + E_norm.x * length, y - E_norm.y * length)
            ctx.stroke()
            // Podríamos dibujar una cabecita a la flecha, simplificaremos
            ctx.fillStyle = 'rgba(66, 215, 200, 0.5)'
            ctx.fillRect(x + E_norm.x * length - 1, y - E_norm.y * length - 1, 3, 3)
          }
        } catch (e) {
          // cerca de la carga
        }
      }
    }

    // Dibujar trayectoria
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

    // Dibujar cargas
    charges.forEach(c => {
      const pos = toScreen(c.position)
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2)
      ctx.fillStyle = c.q > 0 ? '#F27C77' : '#B69BE8' // Rojo +, Azul -
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(c.q > 0 ? '+' : '-', pos.x, pos.y)
    })

    // Dibujar test particle
    if (testParticle) {
      const pos = toScreen(testParticle.position)
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#F5A66A'
      ctx.fill()
    }

  }, [charges, testParticle, trajectory])

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={600} 
      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
    />
  )
}

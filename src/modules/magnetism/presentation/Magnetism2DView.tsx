import React, { useRef, useEffect, useState } from 'react'
import { Vector3 } from '../../../shared/domain/Vector3'
import { MagnetismMath } from '../domain/MagnetismMath'
import './Magnetism2DView.css'

interface Props {
  sourceType: 'wire' | 'dipole' | 'uniform'
  current: number // Amperios si wire, A·m² si dipole
  bExt: Vector3
  eExt: Vector3
  particle: {
    position: Vector3
    velocity: Vector3
    q: number
    m: number
  } | null
  trajectory: Vector3[]
  probePos: Vector3
  onProbeMove?: (newPos: Vector3) => void
  scale?: number
}

export function Magnetism2DView({
  sourceType,
  current,
  bExt,
  eExt,
  particle,
  trajectory,
  probePos,
  onProbeMove,
  scale = 60
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [draggingProbe, setDraggingProbe] = useState(false)

  const toScreen = React.useCallback(
    (v: Vector3, cx: number, cy: number) => ({
      x: cx + v.x * scale,
      y: cy - v.y * scale
    }),
    [scale]
  )

  const toWorld = React.useCallback(
    (sx: number, sy: number, cx: number, cy: number) =>
      new Vector3((sx - cx) / scale, -(sy - cy) / scale, 0),
    [scale]
  )

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onProbeMove) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const probeScreen = toScreen(probePos, cx, cy)

    if (Math.hypot(mx - probeScreen.x, my - probeScreen.y) < 20) {
      setDraggingProbe(true)
    }
  }

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingProbe || !onProbeMove) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    onProbeMove(toWorld(mx, my, cx, cy))
  }

  const handlePointerUp = () => {
    setDraggingProbe(false)
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

    // 1. Rejilla métrica (Grid)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    const step = scale
    for (let x = cx % step; x < width; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = cy % step; y < height; y += step) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Ejes coordenados
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(0, cy)
    ctx.lineTo(width, cy)
    ctx.moveTo(cx, 0)
    ctx.lineTo(cx, height)
    ctx.stroke()

    // 2. Líneas de Inducción Magnética B
    if (sourceType === 'wire') {
      // Hilo perpendicular a la pantalla (en z) o vertical en y
      // Dibujamos círculos concéntricos de Biot-Savart
      const radii = [0.6, 1.2, 1.8, 2.5, 3.2]
      radii.forEach(r => {
        const rPx = r * scale
        ctx.strokeStyle = 'rgba(66, 215, 200, 0.45)'
        ctx.lineWidth = 1.3
        ctx.beginPath()
        ctx.arc(cx, cy, rPx, 0, Math.PI * 2)
        ctx.stroke()

        // Flechas de dirección tangencial (Regla de la mano derecha)
        const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
        angles.forEach(ang => {
          const ax = cx + Math.cos(ang) * rPx
          const ay = cy - Math.sin(ang) * rPx
          // Tangente: (-sin(ang), -cos(ang)) si corriente es hacia afuera (+z)
          const sign = current >= 0 ? 1 : -1
          const tangX = -Math.sin(ang) * sign
          const tangY = -Math.cos(ang) * sign

          ctx.fillStyle = '#42D7C8'
          ctx.beginPath()
          ctx.moveTo(ax + tangX * 6, ay + tangY * 6)
          ctx.lineTo(ax - tangY * 4 - tangX * 4, ay + tangX * 4 - tangY * 4)
          ctx.lineTo(ax + tangY * 4 - tangX * 4, ay - tangX * 4 - tangY * 4)
          ctx.closePath()
          ctx.fill()
        })
      })

      // Conductor central (sección transversal)
      ctx.beginPath()
      ctx.arc(cx, cy, 14, 0, Math.PI * 2)
      ctx.fillStyle = '#2A3C47'
      ctx.fill()
      ctx.strokeStyle = '#F5A66A'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#F5A66A'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      // Si I > 0: punto (corriente sale hacia el usuario), si I < 0: cruz (entra)
      ctx.fillText(current >= 0 ? '⊙' : '⊗', cx, cy - 1)
      ctx.font = '10px monospace'
      ctx.fillStyle = '#fff'
      ctx.fillText(`I = ${current} A`, cx, cy + 24)
    } else if (sourceType === 'dipole') {
      // Dipolo magnético (barra imán con polos N y S)
      const barW = 32
      const barH = 75

      // Polo Norte (Rojo)
      ctx.fillStyle = '#F27C77'
      ctx.fillRect(cx - barW / 2, cy - barH / 2, barW, barH / 2)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('N', cx, cy - barH / 4)

      // Polo Sur (Azul)
      ctx.fillStyle = '#5C9CE6'
      ctx.fillRect(cx - barW / 2, cy, barW, barH / 2)
      ctx.fillStyle = '#fff'
      ctx.fillText('S', cx, cy + barH / 4)

      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.strokeRect(cx - barW / 2, cy - barH / 2, barW, barH)

      // Líneas de campo dipolares esquemáticas
      const loopWidths = [60, 110, 160]
      loopWidths.forEach(lw => {
        ctx.strokeStyle = 'rgba(66, 215, 200, 0.4)'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.ellipse(cx + lw, cy, lw * 0.9, barH * 0.9, 0, 0, Math.PI * 2)
        ctx.stroke()

        ctx.beginPath()
        ctx.ellipse(cx - lw, cy, lw * 0.9, barH * 0.9, 0, 0, Math.PI * 2)
        ctx.stroke()
      })
    } else {
      // Región de campo uniforme (Selector de velocidades)
      const boxW = 280
      const boxH = 180
      ctx.fillStyle = 'rgba(66, 215, 200, 0.06)'
      ctx.fillRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH)
      ctx.strokeStyle = '#42D7C8'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      ctx.strokeRect(cx - boxW / 2, cy - boxH / 2, boxW, boxH)
      ctx.setLineDash([])

      // Símbolos de campo B entrante ⊗
      ctx.fillStyle = 'rgba(66, 215, 200, 0.35)'
      ctx.font = '12px monospace'
      ctx.textAlign = 'center'
      for (let x = cx - boxW / 2 + 30; x < cx + boxW / 2; x += 45) {
        for (let y = cy - boxH / 2 + 25; y < cy + boxH / 2; y += 45) {
          ctx.fillText('⊗ B', x, y)
        }
      }

      // Flechas de campo eléctrico E
      if (eExt.magnitude() > 0) {
        ctx.strokeStyle = '#F5A66A'
        ctx.fillStyle = '#F5A66A'
        ctx.lineWidth = 1.5
        for (let x = cx - boxW / 2 + 25; x < cx + boxW / 2; x += 55) {
          ctx.beginPath()
          ctx.moveTo(x, cy + boxH / 2 - 15)
          ctx.lineTo(x, cy - boxH / 2 + 15)
          ctx.stroke()
          // Flecha
          ctx.beginPath()
          ctx.moveTo(x, cy - boxH / 2 + 15)
          ctx.lineTo(x - 4, cy - boxH / 2 + 23)
          ctx.lineTo(x + 4, cy - boxH / 2 + 23)
          ctx.closePath()
          ctx.fill()
        }
        ctx.fillText('Campo E ↑', cx, cy - boxH / 2 - 10)
      }
    }

    // 3. Trayectoria de la Partícula
    if (trajectory.length > 1) {
      ctx.strokeStyle = '#F5A66A'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      const s0 = toScreen(trajectory[0], cx, cy)
      ctx.moveTo(s0.x, s0.y)
      for (let i = 1; i < trajectory.length; i++) {
        const pt = toScreen(trajectory[i], cx, cy)
        ctx.lineTo(pt.x, pt.y)
      }
      ctx.stroke()
    }

    // 4. Partícula de Prueba
    if (particle) {
      const pScreen = toScreen(particle.position, cx, cy)
      ctx.beginPath()
      ctx.arc(pScreen.x, pScreen.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = particle.q > 0 ? '#F27C77' : '#B69BE8'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 9px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(particle.q > 0 ? '+q' : '−q', pScreen.x, pScreen.y)

      // Vector velocidad
      const vMag = particle.velocity.magnitude()
      if (vMag > 0.05) {
        const vNorm = particle.velocity.multiply(1 / vMag)
        const vLen = Math.min(40, vMag * 6)
        ctx.strokeStyle = '#5C9CE6'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(pScreen.x, pScreen.y)
        ctx.lineTo(pScreen.x + vNorm.x * vLen, pScreen.y - vNorm.y * vLen)
        ctx.stroke()
      }
    }

    // 5. Sonda Magnética B
    {
      const prScreen = toScreen(probePos, cx, cy)
      ctx.beginPath()
      ctx.arc(prScreen.x, prScreen.y, 13, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(66, 215, 200, 0.25)'
      ctx.fill()
      ctx.strokeStyle = '#42D7C8'
      ctx.lineWidth = 2
      ctx.stroke()

      // Calcular campo local B en la sonda
      let localB = bExt
      try {
        if (sourceType === 'wire') {
          localB = localB.add(
            MagnetismMath.evaluateWireBField(
              current,
              new Vector3(0, 0, 1),
              new Vector3(0, 0, 0),
              probePos
            )
          )
        } else if (sourceType === 'dipole') {
          localB = localB.add(
            MagnetismMath.evaluateDipoleBField(
              new Vector3(0, current * 0.1, 0),
              new Vector3(0, 0, 0),
              probePos
            )
          )
        }
      } catch {
        // singularidad
      }

      const bMag = localB.magnitude()
      // Aguja de brújula magnética
      const angle = bMag > 1e-9 ? Math.atan2(localB.y, localB.x) : 0
      const needleLen = 14

      // Mitad norte (roja)
      ctx.strokeStyle = '#F27C77'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(prScreen.x, prScreen.y)
      ctx.lineTo(prScreen.x + Math.cos(angle) * needleLen, prScreen.y - Math.sin(angle) * needleLen)
      ctx.stroke()

      // Mitad sur (azul)
      ctx.strokeStyle = '#5C9CE6'
      ctx.beginPath()
      ctx.moveTo(prScreen.x, prScreen.y)
      ctx.lineTo(prScreen.x - Math.cos(angle) * needleLen, prScreen.y + Math.sin(angle) * needleLen)
      ctx.stroke()

      // Punto central
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(prScreen.x, prScreen.y, 2.5, 0, Math.PI * 2)
      ctx.fill()

      // Etiqueta de magnitud de campo B
      ctx.fillStyle = '#42D7C8'
      ctx.font = '10px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(
        `|B| = ${(bMag * 1e6).toFixed(1)} μT`,
        prScreen.x + 16,
        prScreen.y + 4
      )
    }

  }, [sourceType, current, bExt, eExt, particle, trajectory, probePos, scale, toScreen])

  return (
    <div className="magnetism-2d-container">
      <canvas
        ref={canvasRef}
        width={800}
        height={550}
        className="magnetism-2d-canvas"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
      />
      <div className="magnetism-2d-hint">
        <span>Arrastra la sonda magnética de brújula o lanza la partícula para observar el movimiento de Lorentz</span>
      </div>
    </div>
  )
}

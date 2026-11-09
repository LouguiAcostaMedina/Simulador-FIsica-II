import React, { useRef, useEffect, useState } from 'react'
import { CapacitorState, CapacitorMetrics } from '../domain/CapacitorMath'
import './Capacitor2DView.css'

interface Props {
  state: CapacitorState
  metrics: CapacitorMetrics
  onParamChange?: (key: keyof CapacitorState, value: any) => void
  interactive?: boolean
}

export function Capacitor2DView({ state, metrics, onParamChange, interactive = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dragging, setDragging] = useState<'distance' | 'area' | 'dielectric' | null>(null)

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !onParamChange) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mouseX = (e.clientX - rect.left) * scaleX
    const mouseY = (e.clientY - rect.top) * scaleY

    const cx = canvas.width / 2
    const cy = canvas.height / 2

    // Coordenadas de las placas en el canvas
    const plateWidth = Math.min(380, Math.max(140, Math.sqrt(state.A * 10000) * 22))
    const dPx = Math.min(180, Math.max(35, state.d * 1000 * 20))
    const topY = cy - dPx / 2
    const botY = cy + dPx / 2
    const leftX = cx - plateWidth / 2
    const rightX = cx + plateWidth / 2

    // 1. Clic cerca de la placa superior (cambiar distancia d)
    if (Math.abs(mouseY - topY) < 22 && mouseX >= leftX - 20 && mouseX <= rightX + 20) {
      setDragging('distance')
      return
    }

    // 2. Clic cerca del extremo derecho de la placa (cambiar área A)
    if (Math.abs(mouseX - rightX) < 25 && mouseY >= topY - 15 && mouseY <= botY + 15) {
      setDragging('area')
      return
    }

    // 3. Clic sobre la lámina dieléctrica (cambiar inserción)
    const insFrac = state.insertionFraction ?? 1
    const dielX = leftX + (insFrac - 1) * plateWidth
    if (mouseX >= dielX && mouseX <= dielX + plateWidth && mouseY >= topY && mouseY <= botY) {
      setDragging('dielectric')
      return
    }
  }

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging || !onParamChange) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mouseX = (e.clientX - rect.left) * scaleX
    const mouseY = (e.clientY - rect.top) * scaleY

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const plateWidth = Math.min(380, Math.max(140, Math.sqrt(state.A * 10000) * 22))
    const leftX = cx - plateWidth / 2

    if (dragging === 'distance') {
      const halfD = Math.max(18, Math.min(95, Math.abs(cy - mouseY)))
      const newD_mm = (halfD * 2) / 20
      onParamChange('d', Math.max(0.0005, Math.min(0.015, newD_mm / 1000)))
    } else if (dragging === 'area') {
      const newWidth = Math.max(140, Math.min(380, (mouseX - cx) * 2))
      const widthUnits = newWidth / 22
      const newArea_cm2 = widthUnits * widthUnits
      onParamChange('A', Math.max(0.0025, Math.min(0.04, newArea_cm2 / 10000)))
    } else if (dragging === 'dielectric') {
      const frac = Math.max(0, Math.min(1, (mouseX - leftX) / plateWidth))
      onParamChange('insertionFraction', frac)
    }
  }

  const handlePointerUp = () => {
    setDragging(null)
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

    // Dimensiones en pantalla proporcionales
    const plateWidth = Math.min(380, Math.max(140, Math.sqrt(state.A * 10000) * 22))
    const plateHeight = 12
    const dPx = Math.min(180, Math.max(35, state.d * 1000 * 20))

    const topY = cy - dPx / 2
    const botY = cy + dPx / 2
    const leftX = cx - plateWidth / 2
    const rightX = cx + plateWidth / 2

    const insFrac = state.insertionFraction ?? 1.0

    // 1. Conexiones eléctricas y Batería
    ctx.lineWidth = 2.5
    ctx.strokeStyle = state.mode === 'fixed_V' ? '#42D7C8' : '#F4F0E8'

    // Cable superior hacia la batería lateral
    ctx.beginPath()
    ctx.moveTo(leftX + 25, topY)
    ctx.lineTo(leftX + 25, 45)
    ctx.lineTo(75, 45)
    ctx.lineTo(75, cy - 25)
    ctx.stroke()

    // Cable inferior hacia la batería
    ctx.beginPath()
    ctx.moveTo(leftX + 25, botY + plateHeight)
    ctx.lineTo(leftX + 25, height - 45)
    ctx.lineTo(75, height - 45)
    ctx.lineTo(75, cy + 25)
    ctx.stroke()

    // Dibujo de la fuente o interruptor desconectado
    if (state.mode === 'fixed_V') {
      // Batería conectada
      ctx.fillStyle = '#1C2930'
      ctx.fillRect(50, cy - 30, 50, 60)
      ctx.strokeStyle = '#42D7C8'
      ctx.strokeRect(50, cy - 30, 50, 60)

      // Terminales + y -
      ctx.fillStyle = '#F27C77'
      ctx.fillRect(70, cy - 34, 10, 4)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('+', 75, cy - 14)
      ctx.fillText('−', 75, cy + 22)
      ctx.font = '10px monospace'
      ctx.fillStyle = '#42D7C8'
      ctx.fillText(`${state.sourceValue}V`, 75, cy + 4)
    } else {
      // Batería desconectada (Interruptor abierto)
      ctx.fillStyle = '#1C2930'
      ctx.fillRect(45, cy - 25, 60, 50)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.strokeRect(45, cy - 25, 60, 50)

      // Cuchilla abierta
      ctx.strokeStyle = '#F5A66A'
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(75, cy + 20)
      ctx.lineTo(60, cy - 10)
      ctx.stroke()

      ctx.fillStyle = '#F5A66A'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Abierto', 75, cy + 38)
      ctx.fillText('(Q Fijo)', 75, cy - 32)
    }

    // 2. Líneas de Campo Eléctrico E entre placas
    const numLines = 14
    for (let i = 1; i < numLines; i++) {
      const lineX = leftX + (i / numLines) * plateWidth
      const inDielectric = lineX < leftX + insFrac * plateWidth && state.er > 1

      // El campo se atenúa dentro del dieléctrico por factor 1/er
      ctx.strokeStyle = inDielectric ? 'rgba(66, 215, 200, 0.35)' : 'rgba(66, 215, 200, 0.85)'
      ctx.lineWidth = inDielectric ? 1.2 : 2.0
      ctx.setLineDash(inDielectric ? [4, 4] : [])

      ctx.beginPath()
      ctx.moveTo(lineX, topY + plateHeight)
      ctx.lineTo(lineX, botY)
      ctx.stroke()

      // Flecha apuntando hacia abajo
      ctx.fillStyle = inDielectric ? 'rgba(66, 215, 200, 0.4)' : '#42D7C8'
      ctx.beginPath()
      ctx.moveTo(lineX, botY - 2)
      ctx.lineTo(lineX - 3.5, botY - 9)
      ctx.lineTo(lineX + 3.5, botY - 9)
      ctx.closePath()
      ctx.fill()
    }
    ctx.setLineDash([])

    // 3. Lámina Dieléctrica (si er > 1)
    if (state.er > 1 && insFrac > 0) {
      const dielWidth = plateWidth * insFrac
      const dielHeight = dPx - 2

      ctx.fillStyle = 'rgba(92, 156, 230, 0.38)'
      ctx.fillRect(leftX, topY + plateHeight + 1, dielWidth, dielHeight)

      ctx.strokeStyle = '#5C9CE6'
      ctx.lineWidth = 2
      ctx.strokeRect(leftX, topY + plateHeight + 1, dielWidth, dielHeight)

      // Cargas ligadas / polarización interior
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      const dipoles = Math.min(8, Math.max(2, Math.floor(insFrac * 8)))
      for (let j = 0; j < dipoles; j++) {
        const dx = leftX + ((j + 0.5) / dipoles) * dielWidth
        ctx.fillText('−', dx, topY + plateHeight + 14)
        ctx.fillText('+', dx, botY - 6)
      }

      // Etiqueta dieléctrico
      ctx.fillStyle = '#5C9CE6'
      ctx.font = 'bold 11px sans-serif'
      ctx.fillText(`Dieléctrico (εᵣ = ${state.er})`, leftX + dielWidth / 2, cy)
    }

    // 4. Placa Superior (+Q)
    ctx.fillStyle = '#2A3C47'
    ctx.strokeStyle = '#F5A66A'
    ctx.lineWidth = 2
    ctx.fillRect(leftX, topY, plateWidth, plateHeight)
    ctx.strokeRect(leftX, topY, plateWidth, plateHeight)

    // Cargas positivas ++++ en la placa superior
    ctx.fillStyle = '#F27C77'
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'center'
    const numCharges = Math.min(12, Math.max(4, Math.floor(plateWidth / 30)))
    for (let i = 0; i < numCharges; i++) {
      const cxPos = leftX + ((i + 0.5) / numCharges) * plateWidth
      ctx.fillText('+', cxPos, topY + 9)
    }

    // Etiqueta de la placa superior
    ctx.fillStyle = '#F27C77'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(`+Q = +${(metrics.Q * 1e12).toFixed(1)} pC`, rightX + 65, topY + 9)

    // 5. Placa Inferior (-Q)
    ctx.fillStyle = '#2A3C47'
    ctx.strokeStyle = '#B69BE8'
    ctx.lineWidth = 2
    ctx.fillRect(leftX, botY, plateWidth, plateHeight)
    ctx.strokeRect(leftX, botY, plateWidth, plateHeight)

    // Cargas negativas ---- en la placa inferior
    ctx.fillStyle = '#B69BE8'
    for (let i = 0; i < numCharges; i++) {
      const cxPos = leftX + ((i + 0.5) / numCharges) * plateWidth
      ctx.fillText('−', cxPos, botY + 9)
    }

    // Etiqueta de la placa inferior
    ctx.fillStyle = '#B69BE8'
    ctx.fillText(`−Q = −${(metrics.Q * 1e12).toFixed(1)} pC`, rightX + 65, botY + 9)

    // 6. Cotas de separación d
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.lineWidth = 1.2
    const dimX = leftX - 35
    ctx.beginPath()
    ctx.moveTo(dimX, topY + plateHeight)
    ctx.lineTo(dimX, botY)
    ctx.moveTo(dimX - 5, topY + plateHeight)
    ctx.lineTo(dimX + 5, topY + plateHeight)
    ctx.moveTo(dimX - 5, botY)
    ctx.lineTo(dimX + 5, botY)
    ctx.stroke()

    ctx.fillStyle = '#F4F0E8'
    ctx.font = '10px monospace'
    ctx.textAlign = 'right'
    ctx.fillText(`d = ${(state.d * 1000).toFixed(1)} mm`, dimX - 6, cy + 4)

    // 7. Cotas de ancho/área A
    const dimY = botY + plateHeight + 25
    ctx.beginPath()
    ctx.moveTo(leftX, dimY)
    ctx.lineTo(rightX, dimY)
    ctx.moveTo(leftX, dimY - 4)
    ctx.lineTo(leftX, dimY + 4)
    ctx.moveTo(rightX, dimY - 4)
    ctx.lineTo(rightX, dimY + 4)
    ctx.stroke()

    ctx.textAlign = 'center'
    ctx.fillText(`Área A = ${(state.A * 10000).toFixed(0)} cm²`, cx, dimY + 16)

    // 8. Handles de interacción (si interactive = true)
    if (interactive) {
      // Handle de separación d (flecha arriba/abajo en placa superior)
      ctx.fillStyle = '#42D7C8'
      ctx.beginPath()
      ctx.arc(cx, topY - 10, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Handle de área A (flecha lateral en borde derecho)
      ctx.fillStyle = '#F5A66A'
      ctx.beginPath()
      ctx.arc(rightX + 10, cy, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Handle de dieléctrico si existe
      if (state.er > 1) {
        ctx.fillStyle = '#5C9CE6'
        ctx.beginPath()
        ctx.arc(leftX + insFrac * plateWidth, topY + plateHeight / 2, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
    }

  }, [state, metrics, interactive])

  return (
    <div className="capacitor-2d-container">
      <canvas
        ref={canvasRef}
        width={750}
        height={500}
        className="capacitor-2d-canvas"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
      />
      {interactive && (
        <div className="capacitor-2d-hint">
          <span>Arrastra los puntos verde (separación d), naranja (área A) o azul (dieléctrico)</span>
        </div>
      )}
    </div>
  )
}

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  CircuitComponent,
  Wire,
  SimulationResult,
  Terminal
} from '../domain/CircuitNetlist'
import './CircuitCanvas.css'

export interface CircuitCanvasProps {
  components: CircuitComponent[]
  wires: Wire[]
  simulationResult: SimulationResult | null
  selectedId: string | null
  onSelectComponent: (id: string | null) => void
  onUpdateComponentPosition: (id: string, x: number, y: number) => void
  onConnectTerminals: (t1Id: string, t2Id: string) => void
  onDeleteWire: (wireId: string) => void
  onToggleSwitch?: (compId: string) => void
  gridSize?: number
}

export function CircuitCanvas({
  components,
  wires,
  simulationResult,
  selectedId,
  onSelectComponent,
  onUpdateComponentPosition,
  onConnectTerminals,
  onDeleteWire,
  onToggleSwitch,
  gridSize = 20
}: CircuitCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Zoom y Pan
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 40, y: 40 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Dragging de componentes
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Conexión de cables interactiva (clic/arrastre de terminal a terminal)
  const [connectingTerminal, setConnectingTerminal] = useState<Terminal | null>(null)
  const [mouseCanvasPos, setMouseCanvasPos] = useState({ x: 0, y: 0 })

  // Cable seleccionado
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null)

  // Convertir coordenadas del cliente al espacio del canvas
  const clientToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: 0, y: 0 }
      const rect = svgRef.current.getBoundingClientRect()
      const rawX = (clientX - rect.left - pan.x) / zoom
      const rawY = (clientY - rect.top - pan.y) / zoom
      return { x: rawX, y: rawY }
    },
    [pan, zoom]
  )

  // Snap to grid
  const snap = (val: number) => Math.round(val / gridSize) * gridSize

  // Terminal lookup
  const terminalMap = useRef<Record<string, { term: Terminal; comp: CircuitComponent; absX: number; absY: number }>>({})
  terminalMap.current = {}
  for (const c of components) {
    const rad = ((c.rotation || 0) * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    for (const t of c.terminals) {
      // Rotar posición relativa según orientación del componente
      const rotX = t.relativeX * cos - t.relativeY * sin
      const rotY = t.relativeX * sin + t.relativeY * cos
      terminalMap.current[t.id] = {
        term: t,
        comp: c,
        absX: c.x + rotX,
        absY: c.y + rotY
      }
    }
  }

  // Manejadores de Pan del lienzo
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    // Si se hace clic sobre el fondo vacío, iniciar pan
    if (e.target === svgRef.current || (e.target as Element).tagName === 'rect') {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      onSelectComponent(null)
      setSelectedWireId(null)
      setConnectingTerminal(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const cPos = clientToCanvas(e.clientX, e.clientY)
    setMouseCanvasPos(cPos)

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      })
    } else if (draggingCompId) {
      const newX = snap(cPos.x - dragOffset.x)
      const newY = snap(cPos.y - dragOffset.y)
      onUpdateComponentPosition(draggingCompId, newX, newY)
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    setDraggingCompId(null)
  }

  // Manejo de zoom por rueda
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
    const newZoom = Math.min(2.5, Math.max(0.4, zoom * zoomFactor))
    setZoom(newZoom)
  }

  // Clic en componente
  const handleComponentMouseDown = (e: React.MouseEvent, comp: CircuitComponent) => {
    e.stopPropagation()
    onSelectComponent(comp.id)
    setSelectedWireId(null)
    const cPos = clientToCanvas(e.clientX, e.clientY)
    setDraggingCompId(comp.id)
    setDragOffset({ x: cPos.x - comp.x, y: cPos.y - comp.y })
  }

  // Clic en terminal
  const handleTerminalClick = (e: React.MouseEvent, t: Terminal) => {
    e.stopPropagation()
    if (!connectingTerminal) {
      // Iniciar conexión desde este terminal
      setConnectingTerminal(t)
    } else {
      // Conectar si es un terminal distinto
      if (connectingTerminal.id !== t.id && connectingTerminal.componentId !== t.componentId) {
        onConnectTerminals(connectingTerminal.id, t.id)
      }
      setConnectingTerminal(null)
    }
  }

  // Manejo de teclado (Delete, R para rotar, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedWireId && (e.key === 'Delete' || e.key === 'Backspace')) {
        onDeleteWire(selectedWireId)
        setSelectedWireId(null)
      }
      if (e.key === 'Escape') {
        setConnectingTerminal(null)
        setSelectedWireId(null)
        onSelectComponent(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedWireId, onDeleteWire, onSelectComponent])

  // Controles de zoom / reset
  const resetView = () => {
    setZoom(1)
    setPan({ x: 40, y: 40 })
  }

  return (
    <div className="circuit-canvas-wrapper" onWheel={handleWheel}>
      {/* Barra de herramientas flotante de navegación */}
      <div className="canvas-floating-toolbar">
        <button
          type="button"
          onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
          title="Acercar (Zoom +)"
          aria-label="Acercar"
        >
          🔍+
        </button>
        <button
          type="button"
          onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
          title="Alejar (Zoom -)"
          aria-label="Alejar"
        >
          🔍-
        </button>
        <button
          type="button"
          onClick={resetView}
          title="Restablecer vista centrada"
          aria-label="Restablecer vista"
        >
          ⤢ Reset
        </button>
        <span className="zoom-indicator">{Math.round(zoom * 100)}%</span>
      </div>

      {connectingTerminal && (
        <div className="canvas-connecting-banner" role="status">
          <span>
            Conectando cable desde <strong>{connectingTerminal.name}</strong>. Haz clic en otro terminal para completar la unión. (Esc para cancelar)
          </span>
          <button type="button" onClick={() => setConnectingTerminal(null)}>
            Cancelar
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        className="circuit-canvas-svg"
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <defs>
          {/* Patrón de cuadrícula tenue */}
          <pattern id="grid-pattern" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <circle cx={gridSize / 2} cy={gridSize / 2} r="1" fill="rgba(244, 240, 232, 0.12)" />
          </pattern>

          {/* Gradiente de brillo para bombilla */}
          <radialGradient id="bulb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ECC94B" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#ECC94B" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ECC94B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Fondo del lienzo interactivo */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          <rect
            x={-2000}
            y={-2000}
            width={5000}
            height={5000}
            fill="url(#grid-pattern)"
            className="canvas-background-grid"
          />

          {/* 1. Capa de Cables */}
          <g className="wires-layer">
            {wires.map(wire => {
              const from = terminalMap.current[wire.fromTerminalId]
              const to = terminalMap.current[wire.toTerminalId]
              if (!from || !to) return null

              const isSelected = selectedWireId === wire.id
              const wireInfo = simulationResult?.wireCurrents[wire.id]
              const isActive = wireInfo?.active ?? false

              // Trazar línea de cable
              return (
                <g
                  key={wire.id}
                  className={`wire-group ${isSelected ? 'selected' : ''} ${isActive ? 'active-wire' : ''}`}
                  onClick={e => {
                    e.stopPropagation()
                    setSelectedWireId(wire.id)
                    onSelectComponent(null)
                  }}
                >
                  {/* Línea invisible más gruesa para facilitar clic */}
                  <line
                    x1={from.absX}
                    y1={from.absY}
                    x2={to.absX}
                    y2={to.absY}
                    stroke="transparent"
                    strokeWidth={14}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Línea visible de cobre / conductor */}
                  <line
                    x1={from.absX}
                    y1={from.absY}
                    x2={to.absX}
                    y2={to.absY}
                    className="wire-line"
                    stroke={
                      isSelected
                        ? 'var(--color-accent-copper)'
                        : isActive
                        ? 'var(--color-accent-turquoise)'
                        : 'rgba(244, 240, 232, 0.45)'
                    }
                    strokeWidth={isSelected ? 3.5 : 2.5}
                    strokeLinecap="round"
                  />
                  {/* Animación simbólica de flujo de corriente */}
                  {isActive && (
                    <line
                      x1={from.absX}
                      y1={from.absY}
                      x2={to.absX}
                      y2={to.absY}
                      stroke="#FFFFFF"
                      strokeWidth={1.5}
                      strokeDasharray="4 6"
                      className="wire-flowing-dash"
                    />
                  )}
                </g>
              )
            })}

            {/* Cable en construcción mientras se arrastra */}
            {connectingTerminal && (
              <line
                x1={terminalMap.current[connectingTerminal.id]?.absX ?? 0}
                y1={terminalMap.current[connectingTerminal.id]?.absY ?? 0}
                x2={mouseCanvasPos.x}
                y2={mouseCanvasPos.y}
                stroke="var(--color-accent-copper)"
                strokeWidth={2}
                strokeDasharray="4 4"
                pointerEvents="none"
              />
            )}
          </g>

          {/* 2. Capa de Componentes */}
          <g className="components-layer">
            {components.map(comp => {
              const isSelected = selectedId === comp.id
              const compRes = simulationResult?.componentResults[comp.id]
              const isActive = compRes?.isActive ?? false

              return (
                <g
                  key={comp.id}
                  transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation || 0})`}
                  className={`component-group ${isSelected ? 'selected' : ''}`}
                  onMouseDown={e => handleComponentMouseDown(e, comp)}
                  style={{ cursor: 'grab' }}
                >
                  {/* Bounding box de selección */}
                  {isSelected && (
                    <rect
                      x={-48}
                      y={-32}
                      width={96}
                      height={64}
                      rx={6}
                      fill="none"
                      stroke="var(--color-accent-turquoise)"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Renderizado de Símbolos según Tipo */}
                  {comp.type === 'dc_source' && (
                    <g className="symbol-dc-source">
                      <line x1={-35} y1={0} x2={-12} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      <line x1={12} y1={0} x2={35} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      {/* Polo positivo (+) línea larga */}
                      <line x1={-12} y1={-18} x2={-12} y2={18} stroke="var(--color-accent-copper)" strokeWidth={3} />
                      <text x={-18} y={-10} fill="var(--color-accent-copper)" fontSize="12" fontWeight="bold">+</text>
                      {/* Polo negativo (-) línea corta más gruesa */}
                      <line x1={12} y1={-10} x2={12} y2={10} stroke="var(--color-accent-blue)" strokeWidth={4.5} />
                      <text x={18} y={-10} fill="var(--color-accent-blue)" fontSize="12" fontWeight="bold">-</text>
                      <text x={0} y={30} fill="var(--color-text-ivory)" fontSize="11" textAnchor="middle" fontWeight="bold">
                        {comp.params.voltage ?? 12} V
                      </text>
                    </g>
                  )}

                  {comp.type === 'resistor' && (
                    <g className="symbol-resistor">
                      <line x1={-35} y1={0} x2={-20} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      <line x1={20} y1={0} x2={35} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      {/* Zigzag de resistencia */}
                      <path
                        d="M -20 0 L -15 -10 L -5 10 L 5 -10 L 15 10 L 20 0"
                        fill="none"
                        stroke={isActive ? 'var(--color-accent-turquoise)' : 'var(--color-accent-copper)'}
                        strokeWidth={2.5}
                        strokeLinejoin="round"
                      />
                      <text x={0} y={24} fill="var(--color-text-ivory)" fontSize="11" textAnchor="middle">
                        {comp.params.resistance ?? 10} Ω
                      </text>
                    </g>
                  )}

                  {comp.type === 'lightbulb' && (
                    <g className="symbol-lightbulb">
                      <line x1={-35} y1={0} x2={-18} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      <line x1={18} y1={0} x2={35} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      {/* Resplandor si está encendida */}
                      {isActive && (compRes?.brightness ?? 0) > 0.05 && (
                        <circle cx={0} cy={0} r={32} fill="url(#bulb-glow)" opacity={compRes?.brightness ?? 1} />
                      )}
                      <circle
                        cx={0}
                        cy={0}
                        r={18}
                        fill="var(--color-bg-surface-elevated)"
                        stroke={isActive ? '#ECC94B' : 'var(--color-border-medium)'}
                        strokeWidth={2}
                      />
                      {/* Filamento cruzado */}
                      <path
                        d="M -7 -7 L 7 7 M -7 7 L 7 -7"
                        stroke={isActive ? '#ECC94B' : 'var(--color-text-muted)'}
                        strokeWidth={2}
                      />
                      <text x={0} y={30} fill="var(--color-text-ivory)" fontSize="11" textAnchor="middle">
                        {comp.params.resistance ?? 25} Ω
                      </text>
                    </g>
                  )}

                  {comp.type === 'switch' && (
                    <g
                      className="symbol-switch"
                      onClick={e => {
                        e.stopPropagation()
                        if (onToggleSwitch) onToggleSwitch(comp.id)
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <line x1={-35} y1={0} x2={-14} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      <line x1={14} y1={0} x2={35} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      <circle cx={-14} cy={0} r={4} fill="var(--color-accent-turquoise)" />
                      <circle cx={14} cy={0} r={4} fill="var(--color-accent-turquoise)" />
                      {/* Palanca del interruptor */}
                      {comp.params.switchState === 'closed' ? (
                        <line x1={-14} y1={0} x2={14} y2={0} stroke="var(--color-success)" strokeWidth={3} />
                      ) : (
                        <line x1={-14} y1={0} x2={10} y2={-16} stroke="var(--color-warning)" strokeWidth={3} />
                      )}
                      <text x={0} y={24} fill="var(--color-text-muted)" fontSize="10" textAnchor="middle">
                        {comp.params.switchState === 'closed' ? 'Cerrado' : 'Abierto'}
                      </text>
                    </g>
                  )}

                  {comp.type === 'ammeter' && (
                    <g className="symbol-ammeter">
                      <line x1={-35} y1={0} x2={-16} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      <line x1={16} y1={0} x2={35} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      <circle cx={0} cy={0} r={16} fill="var(--color-bg-ink)" stroke="var(--color-accent-turquoise)" strokeWidth={2} />
                      <text x={0} y={5} fill="var(--color-accent-turquoise)" fontSize="14" fontWeight="bold" textAnchor="middle">
                        A
                      </text>
                      <text x={0} y={30} fill="var(--color-text-ivory)" fontSize="10" textAnchor="middle" fontFamily="var(--font-mono)">
                        {(compRes?.current ?? 0).toFixed(3)} A
                      </text>
                    </g>
                  )}

                  {comp.type === 'voltmeter' && (
                    <g className="symbol-voltmeter">
                      <line x1={-35} y1={0} x2={-16} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      <line x1={16} y1={0} x2={35} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      <circle cx={0} cy={0} r={16} fill="var(--color-bg-ink)" stroke="var(--color-accent-copper)" strokeWidth={2} />
                      <text x={0} y={5} fill="var(--color-accent-copper)" fontSize="14" fontWeight="bold" textAnchor="middle">
                        V
                      </text>
                      <text x={0} y={30} fill="var(--color-text-ivory)" fontSize="10" textAnchor="middle" fontFamily="var(--font-mono)">
                        {(compRes?.voltage ?? 0).toFixed(2)} V
                      </text>
                    </g>
                  )}

                  {comp.type === 'fuse' && (
                    <g className="symbol-fuse">
                      <line x1={-35} y1={0} x2={-20} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      <line x1={20} y1={0} x2={35} y2={0} stroke="var(--color-text-ivory)" strokeWidth={2} />
                      <rect x={-20} y={-8} width={40} height={16} fill="none" stroke="var(--color-border-medium)" strokeWidth={1.5} />
                      <line
                        x1={-20}
                        y1={0}
                        x2={20}
                        y2={0}
                        stroke={compRes?.isBlown ? 'var(--color-error)' : 'var(--color-accent-turquoise)'}
                        strokeWidth={compRes?.isBlown ? 1 : 2}
                        strokeDasharray={compRes?.isBlown ? '2 3' : undefined}
                      />
                      <text x={0} y={24} fill={compRes?.isBlown ? 'var(--color-error)' : 'var(--color-text-muted)'} fontSize="10" textAnchor="middle">
                        {compRes?.isBlown ? '¡FUSIBLE FUNDIDO!' : `${comp.params.maxCurrent ?? 1.5} A`}
                      </text>
                    </g>
                  )}

                  {/* Terminales interactivos con radio amplio para facilitar clic */}
                  {comp.terminals.map(term => {
                    const isSourceTerminal = connectingTerminal?.id === term.id
                    return (
                      <g
                        key={term.id}
                        transform={`translate(${term.relativeX}, ${term.relativeY})`}
                        onClick={e => handleTerminalClick(e, term)}
                        className={`terminal-pin ${isSourceTerminal ? 'connecting-source' : ''}`}
                        style={{ cursor: 'crosshair' }}
                      >
                        {/* Área táctil amplia */}
                        <circle cx={0} cy={0} r={12} fill="transparent" />
                        {/* Círculo visual del pin */}
                        <circle
                          cx={0}
                          cy={0}
                          r={5}
                          fill={isSourceTerminal ? 'var(--color-accent-copper)' : 'var(--color-bg-surface-elevated)'}
                          stroke="var(--color-accent-turquoise)"
                          strokeWidth={2}
                          className="terminal-circle"
                        />
                      </g>
                    )
                  })}
                </g>
              )
            })}
          </g>
        </g>
      </svg>
    </div>
  )
}


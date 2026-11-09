import { useState, useMemo, useCallback } from 'react'
import {
  CircuitComponent,
  Wire,
  CircuitNetlist,
  ComponentType
} from '../domain/CircuitNetlist'
import { DCSolver } from '../domain/DCSolver'
import { CircuitCanvas } from './CircuitCanvas'
import { Inspector, InspectorField, InspectorMetric } from '../../../shared/ui/Inspector/Inspector'
import { ScientificChart } from '../../../shared/ui/Charts/ScientificChart'
import { LabShell, StatusBadgeInfo } from '../../../shared/ui/LabShell/LabShell'
import './CircuitLaboratoryView.css'

export interface CircuitLaboratoryViewProps {
  onSwitchToSimulator: () => void
}

// Preset inicial: Caso de Aceptación Clave (12V, 10Ω en serie con [20Ω || 20Ω])
const PRESET_ACCEPTANCE: CircuitNetlist = {
  components: [
    {
      id: 'bat_1',
      type: 'dc_source',
      label: 'Batería 12V',
      x: 100,
      y: 200,
      rotation: 0,
      params: { voltage: 12 },
      terminals: [
        { id: 'bat_pos', componentId: 'bat_1', name: 'pos', relativeX: 0, relativeY: -35 },
        { id: 'bat_neg', componentId: 'bat_1', name: 'neg', relativeX: 0, relativeY: 35 }
      ]
    },
    {
      id: 'r_1',
      type: 'resistor',
      label: 'R1 (10 Ω)',
      x: 260,
      y: 100,
      rotation: 0,
      params: { resistance: 10, maxPower: 10 },
      terminals: [
        { id: 'r1_t1', componentId: 'r_1', name: 't1', relativeX: -35, relativeY: 0 },
        { id: 'r1_t2', componentId: 'r_1', name: 't2', relativeX: 35, relativeY: 0 }
      ]
    },
    {
      id: 'r_2',
      type: 'resistor',
      label: 'R2 (20 Ω)',
      x: 440,
      y: 60,
      rotation: 0,
      params: { resistance: 20, maxPower: 10 },
      terminals: [
        { id: 'r2_t1', componentId: 'r_2', name: 't1', relativeX: -35, relativeY: 0 },
        { id: 'r2_t2', componentId: 'r_2', name: 't2', relativeX: 35, relativeY: 0 }
      ]
    },
    {
      id: 'r_3',
      type: 'resistor',
      label: 'R3 (20 Ω)',
      x: 440,
      y: 160,
      rotation: 0,
      params: { resistance: 20, maxPower: 10 },
      terminals: [
        { id: 'r3_t1', componentId: 'r_3', name: 't1', relativeX: -35, relativeY: 0 },
        { id: 'r3_t2', componentId: 'r_3', name: 't2', relativeX: 35, relativeY: 0 }
      ]
    }
  ],
  wires: [
    { id: 'w1', fromTerminalId: 'bat_pos', toTerminalId: 'r1_t1' },
    { id: 'w2', fromTerminalId: 'r1_t2', toTerminalId: 'r2_t1' },
    { id: 'w3', fromTerminalId: 'r1_t2', toTerminalId: 'r3_t1' },
    { id: 'w4', fromTerminalId: 'r2_t2', toTerminalId: 'bat_neg' },
    { id: 'w5', fromTerminalId: 'r3_t2', toTerminalId: 'bat_neg' }
  ]
}

export function CircuitLaboratoryView({ onSwitchToSimulator }: CircuitLaboratoryViewProps) {
  // Estado del Netlist
  const [components, setComponents] = useState<CircuitComponent[]>(PRESET_ACCEPTANCE.components)
  const [wires, setWires] = useState<Wire[]>(PRESET_ACCEPTANCE.wires)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Pila de deshacer / rehacer
  const [history, setHistory] = useState<{ components: CircuitComponent[]; wires: Wire[] }[]>([])
  const [future, setFuture] = useState<{ components: CircuitComponent[]; wires: Wire[] }[]>([])

  const pushState = useCallback((newComps: CircuitComponent[], newWires: Wire[]) => {
    setHistory(prev => [...prev.slice(-15), { components, wires }])
    setFuture([])
    setComponents(newComps)
    setWires(newWires)
  }, [components, wires])

  const undo = () => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setFuture(f => [{ components, wires }, ...f])
    setHistory(h => h.slice(0, -1))
    setComponents(prev.components)
    setWires(prev.wires)
  }

  const redo = () => {
    if (future.length === 0) return
    const next = future[0]
    setHistory(h => [...h, { components, wires }])
    setFuture(f => f.slice(1))
    setComponents(next.components)
    setWires(next.wires)
  }

  // Solución DC exacta por MNA en tiempo real
  const currentNetlist = useMemo<CircuitNetlist>(() => ({ components, wires }), [components, wires])
  const simulationResult = useMemo(() => DCSolver.solve(currentNetlist), [currentNetlist])

  // Componente seleccionado actualmente
  const selectedComponent = useMemo(
    () => components.find(c => c.id === selectedId) || null,
    [components, selectedId]
  )
  const selectedResult = selectedComponent
    ? simulationResult.componentResults[selectedComponent.id] || null
    : null

  // Estado del badge superior
  const statusBadgeInfo = useMemo<StatusBadgeInfo>(() => {
    switch (simulationResult.status) {
      case 'valid':
        return simulationResult.totalCurrent > 1e-6
          ? { label: 'Energizado · MNA Válido', variant: 'success' }
          : { label: 'Circuito Abierto', variant: 'warning' }
      case 'short_circuit':
        return { label: '¡Cortocircuito!', variant: 'error' }
      case 'open_circuit':
        return { label: 'Circuito Abierto', variant: 'warning' }
      case 'no_source':
        return { label: 'Sin Fuente DC', variant: 'idle' }
      default:
        return { label: 'Error Topológico', variant: 'error' }
    }
  }, [simulationResult])

  // Añadir un nuevo componente al lienzo
  const addComponent = (type: ComponentType) => {
    const id = `comp_${Date.now().toString(36)}`
    let label = ''
    let params = {}
    let terminals = []

    switch (type) {
      case 'dc_source':
        label = `Batería ${components.filter(c => c.type === 'dc_source').length + 1}`
        params = { voltage: 12 }
        terminals = [
          { id: `${id}_pos`, componentId: id, name: 'pos', relativeX: 0, relativeY: -35 },
          { id: `${id}_neg`, componentId: id, name: 'neg', relativeX: 0, relativeY: 35 }
        ]
        break
      case 'resistor':
        label = `R${components.filter(c => c.type === 'resistor').length + 1}`
        params = { resistance: 10, maxPower: 10 }
        terminals = [
          { id: `${id}_t1`, componentId: id, name: 't1', relativeX: -35, relativeY: 0 },
          { id: `${id}_t2`, componentId: id, name: 't2', relativeX: 35, relativeY: 0 }
        ]
        break
      case 'lightbulb':
        label = `Bombilla ${components.filter(c => c.type === 'lightbulb').length + 1}`
        params = { resistance: 25, nominalPower: 10 }
        terminals = [
          { id: `${id}_t1`, componentId: id, name: 't1', relativeX: -35, relativeY: 0 },
          { id: `${id}_t2`, componentId: id, name: 't2', relativeX: 35, relativeY: 0 }
        ]
        break
      case 'switch':
        label = `Interruptor ${components.filter(c => c.type === 'switch').length + 1}`
        params = { switchState: 'closed' }
        terminals = [
          { id: `${id}_t1`, componentId: id, name: 't1', relativeX: -35, relativeY: 0 },
          { id: `${id}_t2`, componentId: id, name: 't2', relativeX: 35, relativeY: 0 }
        ]
        break
      case 'ammeter':
        label = 'Amperímetro'
        params = {}
        terminals = [
          { id: `${id}_t1`, componentId: id, name: 't1', relativeX: -35, relativeY: 0 },
          { id: `${id}_t2`, componentId: id, name: 't2', relativeX: 35, relativeY: 0 }
        ]
        break
      case 'voltmeter':
        label = 'Voltímetro'
        params = {}
        terminals = [
          { id: `${id}_t1`, componentId: id, name: 't1', relativeX: -35, relativeY: 0 },
          { id: `${id}_t2`, componentId: id, name: 't2', relativeX: 35, relativeY: 0 }
        ]
        break
      case 'fuse':
        label = 'Fusible 1.5A'
        params = { maxCurrent: 1.5, fuseState: 'intact' }
        terminals = [
          { id: `${id}_t1`, componentId: id, name: 't1', relativeX: -35, relativeY: 0 },
          { id: `${id}_t2`, componentId: id, name: 't2', relativeX: 35, relativeY: 0 }
        ]
        break
    }

    const newComp: CircuitComponent = {
      id,
      type,
      label,
      x: 240 + (components.length % 5) * 40,
      y: 200 + (components.length % 4) * 30,
      rotation: 0,
      params,
      terminals: terminals as any
    }

    pushState([...components, newComp], wires)
    setSelectedId(id)
  }

  // Mover componente en el grid
  const handleUpdatePosition = (id: string, x: number, y: number) => {
    setComponents(prev => prev.map(c => (c.id === id ? { ...c, x, y } : c)))
  }

  // Conectar terminales con un cable
  const handleConnectTerminals = (t1Id: string, t2Id: string) => {
    // Evitar cables duplicados
    const exists = wires.some(
      w =>
        (w.fromTerminalId === t1Id && w.toTerminalId === t2Id) ||
        (w.fromTerminalId === t2Id && w.toTerminalId === t1Id)
    )
    if (exists) return

    const newWire: Wire = {
      id: `w_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`,
      fromTerminalId: t1Id,
      toTerminalId: t2Id
    }
    pushState(components, [...wires, newWire])
  }

  // Borrar cable
  const handleDeleteWire = (wireId: string) => {
    pushState(components, wires.filter(w => w.id !== wireId))
  }

  // Rotar componente seleccionado 90 grados
  const rotateComponent = (id: string) => {
    const updated = components.map(c => {
      if (c.id === id) {
        const nextRot = (((c.rotation || 0) + 90) % 360) as 0 | 90 | 180 | 270
        return { ...c, rotation: nextRot }
      }
      return c
    })
    pushState(updated, wires)
  }

  // Borrar componente seleccionado
  const deleteComponent = (id: string) => {
    const comp = components.find(c => c.id === id)
    if (!comp) return
    const termIds = new Set(comp.terminals.map(t => t.id))
    const updatedWires = wires.filter(
      w => !termIds.has(w.fromTerminalId) && !termIds.has(w.toTerminalId)
    )
    const updatedComps = components.filter(c => c.id !== id)
    pushState(updatedComps, updatedWires)
    setSelectedId(null)
  }

  // Alternar estado de interruptor (abierto / cerrado)
  const toggleSwitch = (id: string) => {
    const updated = components.map(c => {
      if (c.id === id && c.type === 'switch') {
        const nextState = c.params.switchState === 'closed' ? 'open' : 'closed'
        return { ...c, params: { ...c.params, switchState: nextState as any } }
      }
      return c
    })
    pushState(updated, wires)
  }

  // Actualizar parámetros en inspector
  const updateParams = (id: string, newParams: Partial<CircuitComponent['params']>) => {
    setComponents(prev =>
      prev.map(c => (c.id === id ? { ...c, params: { ...c.params, ...newParams } } : c))
    )
  }

  // Cargar Presets Didácticos
  const loadPreset = (presetKey: 'acceptance' | 'series' | 'parallel' | 'switch' | 'empty') => {
    if (presetKey === 'acceptance') {
      pushState(PRESET_ACCEPTANCE.components, PRESET_ACCEPTANCE.wires)
    } else if (presetKey === 'series') {
      const sComps: CircuitComponent[] = [
        {
          id: 'bat_s',
          type: 'dc_source',
          label: 'Batería 12V',
          x: 120,
          y: 200,
          rotation: 0,
          params: { voltage: 12 },
          terminals: [
            { id: 'bat_s_pos', componentId: 'bat_s', name: 'pos', relativeX: 0, relativeY: -35 },
            { id: 'bat_s_neg', componentId: 'bat_s', name: 'neg', relativeX: 0, relativeY: 35 }
          ]
        },
        {
          id: 'r_s1',
          type: 'resistor',
          label: 'R1 (10 Ω)',
          x: 280,
          y: 100,
          rotation: 0,
          params: { resistance: 10 },
          terminals: [
            { id: 'rs1_t1', componentId: 'r_s1', name: 't1', relativeX: -35, relativeY: 0 },
            { id: 'rs1_t2', componentId: 'r_s1', name: 't2', relativeX: 35, relativeY: 0 }
          ]
        },
        {
          id: 'r_s2',
          type: 'resistor',
          label: 'R2 (30 Ω)',
          x: 440,
          y: 100,
          rotation: 0,
          params: { resistance: 30 },
          terminals: [
            { id: 'rs2_t1', componentId: 'r_s2', name: 't1', relativeX: -35, relativeY: 0 },
            { id: 'rs2_t2', componentId: 'r_s2', name: 't2', relativeX: 35, relativeY: 0 }
          ]
        }
      ]
      const sWires: Wire[] = [
        { id: 'sw1', fromTerminalId: 'bat_s_pos', toTerminalId: 'rs1_t1' },
        { id: 'sw2', fromTerminalId: 'rs1_t2', toTerminalId: 'rs2_t1' },
        { id: 'sw3', fromTerminalId: 'rs2_t2', toTerminalId: 'bat_s_neg' }
      ]
      pushState(sComps, sWires)
    } else if (presetKey === 'parallel') {
      const pComps: CircuitComponent[] = [
        {
          id: 'bat_p',
          type: 'dc_source',
          label: 'Batería 12V',
          x: 120,
          y: 200,
          rotation: 0,
          params: { voltage: 12 },
          terminals: [
            { id: 'bat_p_pos', componentId: 'bat_p', name: 'pos', relativeX: 0, relativeY: -35 },
            { id: 'bat_p_neg', componentId: 'bat_p', name: 'neg', relativeX: 0, relativeY: 35 }
          ]
        },
        {
          id: 'r_p1',
          type: 'resistor',
          label: 'R1 (20 Ω)',
          x: 320,
          y: 120,
          rotation: 0,
          params: { resistance: 20 },
          terminals: [
            { id: 'rp1_t1', componentId: 'r_p1', name: 't1', relativeX: -35, relativeY: 0 },
            { id: 'rp1_t2', componentId: 'r_p1', name: 't2', relativeX: 35, relativeY: 0 }
          ]
        },
        {
          id: 'r_p2',
          type: 'resistor',
          label: 'R2 (20 Ω)',
          x: 320,
          y: 280,
          rotation: 0,
          params: { resistance: 20 },
          terminals: [
            { id: 'rp2_t1', componentId: 'r_p2', name: 't1', relativeX: -35, relativeY: 0 },
            { id: 'rp2_t2', componentId: 'r_p2', name: 't2', relativeX: 35, relativeY: 0 }
          ]
        }
      ]
      const pWires: Wire[] = [
        { id: 'pw1', fromTerminalId: 'bat_p_pos', toTerminalId: 'rp1_t1' },
        { id: 'pw2', fromTerminalId: 'bat_p_pos', toTerminalId: 'rp2_t1' },
        { id: 'pw3', fromTerminalId: 'rp1_t2', toTerminalId: 'bat_p_neg' },
        { id: 'pw4', fromTerminalId: 'rp2_t2', toTerminalId: 'bat_p_neg' }
      ]
      pushState(pComps, pWires)
    } else if (presetKey === 'switch') {
      const bComps: CircuitComponent[] = [
        {
          id: 'bat_b',
          type: 'dc_source',
          label: 'Batería 9V',
          x: 120,
          y: 200,
          rotation: 0,
          params: { voltage: 9 },
          terminals: [
            { id: 'bat_b_pos', componentId: 'bat_b', name: 'pos', relativeX: 0, relativeY: -35 },
            { id: 'bat_b_neg', componentId: 'bat_b', name: 'neg', relativeX: 0, relativeY: 35 }
          ]
        },
        {
          id: 'sw_b',
          type: 'switch',
          label: 'Interruptor',
          x: 280,
          y: 100,
          rotation: 0,
          params: { switchState: 'closed' },
          terminals: [
            { id: 'sw_b_t1', componentId: 'sw_b', name: 't1', relativeX: -35, relativeY: 0 },
            { id: 'sw_b_t2', componentId: 'sw_b', name: 't2', relativeX: 35, relativeY: 0 }
          ]
        },
        {
          id: 'bulb_b',
          type: 'lightbulb',
          label: 'Bombilla 10W',
          x: 440,
          y: 100,
          rotation: 0,
          params: { resistance: 25, nominalPower: 10 },
          terminals: [
            { id: 'bulb_b_t1', componentId: 'bulb_b', name: 't1', relativeX: -35, relativeY: 0 },
            { id: 'bulb_b_t2', componentId: 'bulb_b', name: 't2', relativeX: 35, relativeY: 0 }
          ]
        }
      ]
      const bWires: Wire[] = [
        { id: 'bw1', fromTerminalId: 'bat_b_pos', toTerminalId: 'sw_b_t1' },
        { id: 'bw2', fromTerminalId: 'sw_b_t2', toTerminalId: 'bulb_b_t1' },
        { id: 'bw3', fromTerminalId: 'bulb_b_t2', toTerminalId: 'bat_b_neg' }
      ]
      pushState(bComps, bWires)
    } else if (presetKey === 'empty') {
      pushState([], [])
    }
    setSelectedId(null)
  }

  // Gráfica I-V característica de la red
  const chartData = useMemo(() => {
    const req = simulationResult.equivalentResistance
    if (!Number.isFinite(req) || req <= 0) return []
    return Array.from({ length: 15 }).map((_, i) => {
      const v = i * 2
      return { x: v, y: v / req }
    })
  }, [simulationResult])

  return (
    <LabShell
      unitId="U3"
      unitTitle="Laboratorio de Circuitos DC"
      formulaBadge="Leyes de Kirchhoff · MNA Solver DC · P = V · I"
      mode="laboratory"
      onModeChange={m => {
        if (m === 'simulator') onSwitchToSimulator()
      }}
      statusBadge={statusBadgeInfo}
      headerActions={
        <div className="lab-header-actions">
          <button
            type="button"
            className="circuit-action-btn"
            onClick={undo}
            disabled={history.length === 0}
            title="Deshacer última acción (Ctrl+Z)"
          >
            ↩ Deshacer
          </button>
          <button
            type="button"
            className="circuit-action-btn"
            onClick={redo}
            disabled={future.length === 0}
            title="Rehacer acción (Ctrl+Y)"
          >
            ↪ Rehacer
          </button>
          <button
            type="button"
            className="circuit-action-btn danger"
            onClick={() => loadPreset('empty')}
            title="Borrar todo el circuito"
          >
            🗑️ Limpiar
          </button>
        </div>
      }
      libraryTitle="Biblioteca de Componentes"
      libraryContent={
        <div className="circuit-library">
          <div className="library-section">
            <span className="library-section-title">Componentes Eléctricos</span>
            <div className="component-buttons-grid">
              <button
                type="button"
                className="comp-palette-btn"
                onClick={() => addComponent('dc_source')}
              >
                <span className="palette-icon">⚡</span>
                <span className="palette-label">Batería DC</span>
              </button>
              <button
                type="button"
                className="comp-palette-btn"
                onClick={() => addComponent('resistor')}
              >
                <span className="palette-icon">⏛</span>
                <span className="palette-label">Resistencia</span>
              </button>
              <button
                type="button"
                className="comp-palette-btn"
                onClick={() => addComponent('lightbulb')}
              >
                <span className="palette-icon">💡</span>
                <span className="palette-label">Bombilla</span>
              </button>
              <button
                type="button"
                className="comp-palette-btn"
                onClick={() => addComponent('switch')}
              >
                <span className="palette-icon">⏻</span>
                <span className="palette-label">Interruptor</span>
              </button>
              <button
                type="button"
                className="comp-palette-btn"
                onClick={() => addComponent('ammeter')}
              >
                <span className="palette-icon">Ⓐ</span>
                <span className="palette-label">Amperímetro</span>
              </button>
              <button
                type="button"
                className="comp-palette-btn"
                onClick={() => addComponent('voltmeter')}
              >
                <span className="palette-icon">Ⓥ</span>
                <span className="palette-label">Voltímetro</span>
              </button>
              <button
                type="button"
                className="comp-palette-btn"
                onClick={() => addComponent('fuse')}
              >
                <span className="palette-icon">⚡</span>
                <span className="palette-label">Fusible</span>
              </button>
            </div>
          </div>

          <div className="library-section">
            <span className="library-section-title">Presets Didácticos</span>
            <div className="preset-buttons-list">
              <button
                type="button"
                className="preset-btn primary-preset"
                onClick={() => loadPreset('acceptance')}
              >
                <strong>1. Caso Aceptación (12V Mixto)</strong>
                <span>10 Ω serie + (20 Ω || 20 Ω) = 20 Ω</span>
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => loadPreset('series')}
              >
                <strong>2. Circuito Serie</strong>
                <span>12V + 10 Ω + 30 Ω = 40 Ω</span>
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => loadPreset('parallel')}
              >
                <strong>3. Circuito Paralelo</strong>
                <span>12V + 20 Ω || 20 Ω = 10 Ω</span>
              </button>
              <button
                type="button"
                className="preset-btn"
                onClick={() => loadPreset('switch')}
              >
                <strong>4. Bombilla con Interruptor</strong>
                <span>Control interactivo de encendido</span>
              </button>
            </div>
          </div>

          <div className="library-instruction-box">
            <strong>Instrucciones de Cableado:</strong>
            <p>1. Arrastra piezas al lienzo para ubicarlas.</p>
            <p>2. Haz clic en el terminal (círculo) de una pieza y luego en el de otra para unirlas con un conductor.</p>
            <p>3. Pulsa sobre el interruptor para abrirlo o cerrarlo.</p>
          </div>
        </div>
      }
      inspectorTitle={selectedComponent ? selectedComponent.label : 'Métricas Globales de Red'}
      inspectorBadge={selectedComponent?.type.toUpperCase()}
      inspectorContent={
        selectedComponent ? (
          <div className="inspector-form-wrapper">
            {/* Parámetros específicos según tipo de componente */}
            {selectedComponent.type === 'dc_source' && (
              <InspectorField
                label="Voltaje Nominal"
                value={selectedComponent.params.voltage ?? 12}
                onChange={v => updateParams(selectedComponent.id, { voltage: v })}
                min={0}
                max={48}
                step={1}
                unit="V"
                helper="Voltaje continuo ideal suministrado por la batería"
              />
            )}

            {(selectedComponent.type === 'resistor' || selectedComponent.type === 'lightbulb') && (
              <InspectorField
                label="Resistencia"
                value={selectedComponent.params.resistance ?? 10}
                onChange={r => updateParams(selectedComponent.id, { resistance: r })}
                min={0.5}
                max={500}
                step={0.5}
                unit="Ω"
                helper="Oposición óhmica al paso de corriente eléctrica"
              />
            )}

            {selectedComponent.type === 'switch' && (
              <div className="inspector-switch-control">
                <label>Estado del Interruptor:</label>
                <button
                  type="button"
                  className={`switch-toggle-btn ${
                    selectedComponent.params.switchState === 'closed' ? 'closed' : 'open'
                  }`}
                  onClick={() => toggleSwitch(selectedComponent.id)}
                >
                  {selectedComponent.params.switchState === 'closed'
                    ? '✔ Cerrado (Paso Activo)'
                    : '✖ Abierto (Rama Aislada)'}
                </button>
              </div>
            )}

            {selectedComponent.type === 'fuse' && (
              <InspectorField
                label="Corriente Máxima de Disparo"
                value={selectedComponent.params.maxCurrent ?? 1.5}
                onChange={i => updateParams(selectedComponent.id, { maxCurrent: i })}
                min={0.1}
                max={10}
                step={0.1}
                unit="A"
                helper="Umbral determinista tras el cual el fusible se funde permanentemente"
              />
            )}

            {/* Lecturas Físicas en Tiempo Real */}
            <div className="inspector-metrics-group">
              <span className="metrics-group-title">Lecturas de Simulación MNA</span>
              <InspectorMetric
                label="Voltaje en Terminales (ΔV)"
                value={(selectedResult?.voltage ?? 0).toFixed(3)}
                unit="V"
                color="var(--color-accent-copper)"
              />
              <InspectorMetric
                label="Corriente en la Rama (I)"
                value={(selectedResult?.current ?? 0).toFixed(4)}
                unit="A"
                color="var(--color-accent-turquoise)"
              />
              <InspectorMetric
                label={selectedComponent.type === 'dc_source' ? 'Potencia Suministrada' : 'Potencia Disipada'}
                value={(selectedResult?.power ?? 0).toFixed(4)}
                unit="W"
                color="var(--color-accent-lilac)"
              />
            </div>

            {/* Acciones del componente */}
            <div className="inspector-comp-actions">
              <button
                type="button"
                className="inspector-action-btn"
                onClick={() => rotateComponent(selectedComponent.id)}
              >
                🔄 Girar 90° (Tecla R)
              </button>
              <button
                type="button"
                className="inspector-action-btn danger"
                onClick={() => deleteComponent(selectedComponent.id)}
              >
                🗑️ Eliminar Componente (Supr)
              </button>
            </div>
          </div>
        ) : (
          <div className="inspector-network-summary">
            {simulationResult.errorMessage ? (
              <div className="network-error-card">
                <strong>Aviso de Topología:</strong>
                <p>{simulationResult.errorMessage}</p>
              </div>
            ) : (
              <div className="network-status-card">
                <strong>Estado de Circuito Válido</strong>
                <p>La red satisface KCL y KVL en todos los nodos calculados por MNA.</p>
              </div>
            )}

            <div className="inspector-metrics-group">
              <InspectorMetric
                label="Voltaje de Fuente Principal"
                value={simulationResult.totalVoltage.toFixed(2)}
                unit="V"
              />
              <InspectorMetric
                label="Corriente Total (I total)"
                value={simulationResult.totalCurrent.toFixed(4)}
                unit="A"
                color="var(--color-accent-turquoise)"
              />
              <InspectorMetric
                label="Resistencia Equivalente (Req)"
                value={
                  Number.isFinite(simulationResult.equivalentResistance)
                    ? simulationResult.equivalentResistance.toFixed(2)
                    : '∞'
                }
                unit="Ω"
                color="var(--color-accent-copper)"
              />
              <InspectorMetric
                label="Potencia Suministrada (P in)"
                value={simulationResult.totalPowerSupplied.toFixed(3)}
                unit="W"
              />
              <InspectorMetric
                label="Potencia Disipada (P out)"
                value={simulationResult.totalPowerDissipated.toFixed(3)}
                unit="W"
              />
              <InspectorMetric
                label="Nodos Eléctricos Identificados"
                value={simulationResult.nodeCount}
              />
            </div>
          </div>
        )
      }
      bottomTitle="Curvas Características & Comprobación Física"
      bottomContent={
        <div className="circuit-bottom-content">
          <div className="bottom-chart-box">
            {chartData.length > 0 ? (
              <ScientificChart
                title="Curva Característica de la Red (I - V)"
                subtitle="Ley de Ohm global vista por la fuente"
                xLabel="Voltaje V"
                xUnit="V"
                yLabel="Corriente I"
                yUnit="A"
                currentX={simulationResult.totalVoltage}
                series={[
                  {
                    id: 'iv-curve',
                    name: 'I(V) equivalente',
                    color: '#42D7C8',
                    data: chartData,
                    unit: 'A'
                  }
                ]}
                height={160}
              />
            ) : (
              <div className="chart-empty-placeholder">
                <p>Conecta un circuito cerrado para trazar la curva I-V característica.</p>
              </div>
            )}
          </div>

          <div className="bottom-analysis-box">
            <h4>Diagnóstico Físico & Leyes de Conservación</h4>
            <div className="analysis-table-wrapper">
              <table className="circuit-analysis-table">
                <thead>
                  <tr>
                    <th>Componente</th>
                    <th>Voltaje (V)</th>
                    <th>Corriente (A)</th>
                    <th>Potencia (W)</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map(comp => {
                    const r = simulationResult.componentResults[comp.id]
                    return (
                      <tr key={comp.id}>
                        <td>
                          <strong>{comp.label}</strong>
                        </td>
                        <td>{(r?.voltage ?? 0).toFixed(2)} V</td>
                        <td>{(r?.current ?? 0).toFixed(3)} A</td>
                        <td>{(r?.power ?? 0).toFixed(3)} W</td>
                        <td>
                          <span
                            className={`status-pill ${
                              r?.isActive ? 'pill-active' : 'pill-inactive'
                            }`}
                          >
                            {r?.isActive ? 'Con Corriente' : 'Sin Corriente'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <p className="conservation-proof">
              <strong>Balance Energético:</strong> P fuente ={' '}
              {simulationResult.totalPowerSupplied.toFixed(3)} W · Σ P resistencias ={' '}
              {simulationResult.totalPowerDissipated.toFixed(3)} W · Diferencia ={' '}
              {Math.abs(
                simulationResult.totalPowerSupplied - simulationResult.totalPowerDissipated
              ).toExponential(2)}{' '}
              W.
            </p>
          </div>
        </div>
      }
      helpContent={
        <div className="circuit-help-guide">
          <h3>Leyes y Algoritmos del Laboratorio de Circuitos</h3>
          <p>
            Este laboratorio implementa <strong>Análisis Nodal Modificado (MNA)</strong> en
            tiempo real en el navegador, resolviendo el sistema matricial <code>[G][V] = [I]</code> con
            pivoteo parcial gaussiano para topologías libres en serie, paralelo y mixto.
          </p>
          <h3>Reglas de Conservación Verificables</h3>
          <ul>
            <li>
              <strong>Ley de Corrientes de Kirchhoff (KCL):</strong> La suma algebraica de corrientes en
              cada nodo eléctrico es exactamente 0.
            </li>
            <li>
              <strong>Ley de Voltajes de Kirchhoff (KVL):</strong> La suma de diferencias de potencial en
              cualquier malla cerrada es igual a 0.
            </li>
            <li>
              <strong>Teorema de Tellegen / Balance de Potencia:</strong> La potencia entregada por las
              fuentes es idéntica a la suma de potencias disipadas en resistores y bombillas.
            </li>
          </ul>
          <h3>Cómo Experimentar</h3>
          <p>
            - Utiliza el botón <strong>1. Caso Aceptación</strong> para cargar la red mixta analítica
            oficial: 12 V con 10 Ω en serie con (20 Ω || 20 Ω). Observa que Req = 20 Ω y la corriente total es 0.6 A.
          </p>
          <p>
            - Agrega un interruptor en una de las ramas de 20 Ω y haz clic en él para abrirlo. Observa
            cómo la corriente de esa rama cae inmediatamente a 0 A y el circuito recalcula Req = 30 Ω y I = 0.4 A.
          </p>
        </div>
      }
    >
      <CircuitCanvas
        components={components}
        wires={wires}
        simulationResult={simulationResult}
        selectedId={selectedId}
        onSelectComponent={setSelectedId}
        onUpdateComponentPosition={handleUpdatePosition}
        onConnectTerminals={handleConnectTerminals}
        onDeleteWire={handleDeleteWire}
        onToggleSwitch={toggleSwitch}
      />
    </LabShell>
  )
}

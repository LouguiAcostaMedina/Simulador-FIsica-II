/**
 * CircuitNetlist.ts — Modelo de datos para el Laboratorio de Circuitos (U3)
 * Dominio TypeScript puro sin dependencias de React ni Three.js.
 * La conectividad eléctrica es estrictamente independiente de la posición visual.
 */

export type ComponentType =
  | 'dc_source'
  | 'resistor'
  | 'lightbulb'
  | 'switch'
  | 'voltmeter'
  | 'ammeter'
  | 'fuse'

export interface Terminal {
  id: string
  componentId: string
  name: 'pos' | 'neg' | 't1' | 't2'
  relativeX: number
  relativeY: number
}

export interface ComponentParams {
  voltage?: number        // Para fuente DC (V)
  resistance?: number     // Para resistor / bombilla (Ω)
  maxPower?: number       // Potencia admisible (W)
  nominalPower?: number   // Para bombilla (W)
  switchState?: 'closed' | 'open' // Para interruptor
  maxCurrent?: number     // Para fusible (A)
  fuseState?: 'intact' | 'blown'  // Para fusible
}

export interface CircuitComponent {
  id: string
  type: ComponentType
  label: string
  x: number // Coordenadas en cuadrícula (grid canvas)
  y: number
  rotation: 0 | 90 | 180 | 270 // Grados
  params: ComponentParams
  terminals: Terminal[]
}

export interface Wire {
  id: string
  fromTerminalId: string
  toTerminalId: string
}

export interface CircuitNetlist {
  components: CircuitComponent[]
  wires: Wire[]
}

export interface ComponentSimulationResult {
  voltage: number     // V_t1 - V_t2 (V)
  current: number     // I a través del componente (A)
  power: number       // P disipada o suministrada (W)
  isActive: boolean   // true si circula corriente significativa (> 1e-6 A)
  brightness?: number // 0 a 1 para bombilla
  isBlown?: boolean   // para fusible
  error?: string
}

export interface SimulationResult {
  status: 'valid' | 'open_circuit' | 'short_circuit' | 'floating_nodes' | 'no_source' | 'singular'
  errorMessage?: string
  warnings: string[]
  nodeVoltages: Record<string, number> // nodeId -> V
  terminalToNode: Record<string, string> // terminalId -> nodeId
  componentResults: Record<string, ComponentSimulationResult>
  totalVoltage: number
  totalCurrent: number
  totalPowerSupplied: number
  totalPowerDissipated: number
  equivalentResistance: number
  nodeCount: number
  wireCurrents: Record<string, { current: number; active: boolean; forward: boolean }>
}


import { describe, it, expect } from 'vitest'
import { DCSolver } from './DCSolver'
import { CircuitNetlist, CircuitComponent, Wire } from './CircuitNetlist'

describe('DCSolver — Análisis Nodal Modificado (MNA)', () => {
  it('resuelve el caso de aceptación clave: 12V con R1=10Ω en serie con (R2=20Ω || R3=20Ω)', () => {
    // Topología:
    // N0: Tierra (polo negativo de la batería y retorno de R2, R3)
    // N1: Polo positivo de la batería conectado a terminal 1 de R1
    // N2: Terminal 2 de R1 conectado a terminal 1 de R2 y terminal 1 de R3
    // N0: Terminal 2 de R2 y terminal 2 de R3 conectados al polo negativo de la batería

    const bat: CircuitComponent = {
      id: 'bat_1',
      type: 'dc_source',
      label: 'Batería 12V',
      x: 100,
      y: 200,
      rotation: 0,
      params: { voltage: 12 },
      terminals: [
        { id: 'bat_pos', componentId: 'bat_1', name: 'pos', relativeX: 0, relativeY: -30 },
        { id: 'bat_neg', componentId: 'bat_1', name: 'neg', relativeX: 0, relativeY: 30 }
      ]
    }

    const r1: CircuitComponent = {
      id: 'r_1',
      type: 'resistor',
      label: 'R1 (10 Ω)',
      x: 250,
      y: 100,
      rotation: 0,
      params: { resistance: 10 },
      terminals: [
        { id: 'r1_t1', componentId: 'r_1', name: 't1', relativeX: -40, relativeY: 0 },
        { id: 'r1_t2', componentId: 'r_1', name: 't2', relativeX: 40, relativeY: 0 }
      ]
    }

    const r2: CircuitComponent = {
      id: 'r_2',
      type: 'resistor',
      label: 'R2 (20 Ω)',
      x: 400,
      y: 50,
      rotation: 0,
      params: { resistance: 20 },
      terminals: [
        { id: 'r2_t1', componentId: 'r_2', name: 't1', relativeX: -40, relativeY: 0 },
        { id: 'r2_t2', componentId: 'r_2', name: 't2', relativeX: 40, relativeY: 0 }
      ]
    }

    const r3: CircuitComponent = {
      id: 'r_3',
      type: 'resistor',
      label: 'R3 (20 Ω)',
      x: 400,
      y: 150,
      rotation: 0,
      params: { resistance: 20 },
      terminals: [
        { id: 'r3_t1', componentId: 'r_3', name: 't1', relativeX: -40, relativeY: 0 },
        { id: 'r3_t2', componentId: 'r_3', name: 't2', relativeX: 40, relativeY: 0 }
      ]
    }

    const wires: Wire[] = [
      // Batería (+) -> R1(t1)
      { id: 'w1', fromTerminalId: 'bat_pos', toTerminalId: 'r1_t1' },
      // R1(t2) -> R2(t1)
      { id: 'w2', fromTerminalId: 'r1_t2', toTerminalId: 'r2_t1' },
      // R1(t2) -> R3(t1) (paralelo)
      { id: 'w3', fromTerminalId: 'r1_t2', toTerminalId: 'r3_t1' },
      // R2(t2) -> Retorno Batería (-)
      { id: 'w4', fromTerminalId: 'r2_t2', toTerminalId: 'bat_neg' },
      // R3(t2) -> Retorno Batería (-)
      { id: 'w5', fromTerminalId: 'r3_t2', toTerminalId: 'bat_neg' }
    ]

    const netlist: CircuitNetlist = {
      components: [bat, r1, r2, r3],
      wires
    }

    const res = DCSolver.solve(netlist)

    expect(res.status).toBe('valid')
    expect(res.errorMessage).toBeUndefined()

    // 1. Resistencia equivalente: Req = 10 + (20 || 20) = 20 Ω
    expect(res.equivalentResistance).toBeCloseTo(20, 4)

    // 2. Corriente total: I = 12 / 20 = 0.6 A
    expect(res.totalCurrent).toBeCloseTo(0.6, 4)

    // 3. Resultados en R1: V1 = 6 V, I1 = 0.6 A, P1 = 3.6 W
    const r1Res = res.componentResults['r_1']
    expect(r1Res).toBeDefined()
    expect(r1Res.voltage).toBeCloseTo(6.0, 4)
    expect(r1Res.current).toBeCloseTo(0.6, 4)
    expect(r1Res.power).toBeCloseTo(3.6, 4)
    expect(r1Res.isActive).toBe(true)

    // 4. Resultados en R2 y R3: V = 6 V, I = 0.3 A, P = 1.8 W
    const r2Res = res.componentResults['r_2']
    expect(r2Res).toBeDefined()
    expect(r2Res.voltage).toBeCloseTo(6.0, 4)
    expect(r2Res.current).toBeCloseTo(0.3, 4)
    expect(r2Res.power).toBeCloseTo(1.8, 4)
    expect(r2Res.isActive).toBe(true)

    const r3Res = res.componentResults['r_3']
    expect(r3Res).toBeDefined()
    expect(r3Res.voltage).toBeCloseTo(6.0, 4)
    expect(r3Res.current).toBeCloseTo(0.3, 4)
    expect(r3Res.power).toBeCloseTo(1.8, 4)
    expect(r3Res.isActive).toBe(true)

    // 5. Potencia suministrada por la fuente = 12 * 0.6 = 7.2 W
    expect(res.totalPowerSupplied).toBeCloseTo(7.2, 4)

    // 6. Balance de potencia: P_fuente = P1 + P2 + P3
    expect(res.totalPowerDissipated).toBeCloseTo(7.2, 4)
    expect(Math.abs(res.totalPowerSupplied - res.totalPowerDissipated)).toBeLessThan(1e-5)
  })

  it('recalcula correctamente al abrir un interruptor en la rama de R2', () => {
    // Al abrir el interruptor en la rama de R2, la corriente en R2 debe ser 0 A
    // y el circuito resultante es R1 en serie con R3: Req = 10 + 20 = 30 Ω, I = 12/30 = 0.4 A
    const bat: CircuitComponent = {
      id: 'bat_1',
      type: 'dc_source',
      label: 'Batería 12V',
      x: 100,
      y: 200,
      rotation: 0,
      params: { voltage: 12 },
      terminals: [
        { id: 'bat_pos', componentId: 'bat_1', name: 'pos', relativeX: 0, relativeY: -30 },
        { id: 'bat_neg', componentId: 'bat_1', name: 'neg', relativeX: 0, relativeY: 30 }
      ]
    }

    const r1: CircuitComponent = {
      id: 'r_1',
      type: 'resistor',
      label: 'R1 (10 Ω)',
      x: 250,
      y: 100,
      rotation: 0,
      params: { resistance: 10 },
      terminals: [
        { id: 'r1_t1', componentId: 'r_1', name: 't1', relativeX: -40, relativeY: 0 },
        { id: 'r1_t2', componentId: 'r_1', name: 't2', relativeX: 40, relativeY: 0 }
      ]
    }

    const sw: CircuitComponent = {
      id: 'sw_1',
      type: 'switch',
      label: 'Interruptor Rama 2',
      x: 350,
      y: 50,
      rotation: 0,
      params: { switchState: 'open' }, // INTERRUPTOR ABIERTO
      terminals: [
        { id: 'sw_t1', componentId: 'sw_1', name: 't1', relativeX: -30, relativeY: 0 },
        { id: 'sw_t2', componentId: 'sw_1', name: 't2', relativeX: 30, relativeY: 0 }
      ]
    }

    const r2: CircuitComponent = {
      id: 'r_2',
      type: 'resistor',
      label: 'R2 (20 Ω)',
      x: 450,
      y: 50,
      rotation: 0,
      params: { resistance: 20 },
      terminals: [
        { id: 'r2_t1', componentId: 'r_2', name: 't1', relativeX: -40, relativeY: 0 },
        { id: 'r2_t2', componentId: 'r_2', name: 't2', relativeX: 40, relativeY: 0 }
      ]
    }

    const r3: CircuitComponent = {
      id: 'r_3',
      type: 'resistor',
      label: 'R3 (20 Ω)',
      x: 400,
      y: 150,
      rotation: 0,
      params: { resistance: 20 },
      terminals: [
        { id: 'r3_t1', componentId: 'r_3', name: 't1', relativeX: -40, relativeY: 0 },
        { id: 'r3_t2', componentId: 'r_3', name: 't2', relativeX: 40, relativeY: 0 }
      ]
    }

    const wires: Wire[] = [
      { id: 'w1', fromTerminalId: 'bat_pos', toTerminalId: 'r1_t1' },
      { id: 'w2', fromTerminalId: 'r1_t2', toTerminalId: 'sw_t1' },
      { id: 'w3', fromTerminalId: 'sw_t2', toTerminalId: 'r2_t1' },
      { id: 'w4', fromTerminalId: 'r1_t2', toTerminalId: 'r3_t1' },
      { id: 'w5', fromTerminalId: 'r2_t2', toTerminalId: 'bat_neg' },
      { id: 'w6', fromTerminalId: 'r3_t2', toTerminalId: 'bat_neg' }
    ]

    const netlist: CircuitNetlist = {
      components: [bat, r1, sw, r2, r3],
      wires
    }

    const res = DCSolver.solve(netlist)

    expect(res.status).toBe('valid')

    // R2 debe tener 0 A porque el interruptor está abierto
    const r2Res = res.componentResults['r_2']
    expect(r2Res.current).toBeCloseTo(0, 4)
    expect(r2Res.isActive).toBe(false)

    // Circuito queda como 10 Ω + 20 Ω = 30 Ω
    expect(res.equivalentResistance).toBeCloseTo(30, 4)
    expect(res.totalCurrent).toBeCloseTo(0.4, 4)

    // R1: V = 10 * 0.4 = 4 V, P = 1.6 W
    const r1Res = res.componentResults['r_1']
    expect(r1Res.voltage).toBeCloseTo(4.0, 4)
    expect(r1Res.current).toBeCloseTo(0.4, 4)
    expect(r1Res.power).toBeCloseTo(1.6, 4)

    // R3: V = 20 * 0.4 = 8 V, P = 3.2 W
    const r3Res = res.componentResults['r_3']
    expect(r3Res.voltage).toBeCloseTo(8.0, 4)
    expect(r3Res.current).toBeCloseTo(0.4, 4)
    expect(r3Res.power).toBeCloseTo(3.2, 4)

    // Potencia total = 1.6 + 3.2 = 4.8 W = 12 V * 0.4 A
    expect(res.totalPowerSupplied).toBeCloseTo(4.8, 4)
    expect(res.totalPowerDissipated).toBeCloseTo(4.8, 4)
  })

  it('detecta cortocircuito directo entre terminales de la fuente', () => {
    const bat: CircuitComponent = {
      id: 'bat_1',
      type: 'dc_source',
      label: 'Batería',
      x: 100,
      y: 100,
      rotation: 0,
      params: { voltage: 9 },
      terminals: [
        { id: 'bat_pos', componentId: 'bat_1', name: 'pos', relativeX: 0, relativeY: -30 },
        { id: 'bat_neg', componentId: 'bat_1', name: 'neg', relativeX: 0, relativeY: 30 }
      ]
    }

    // Cable que une el positivo con el negativo directamente
    const wire: Wire = {
      id: 'w_short',
      fromTerminalId: 'bat_pos',
      toTerminalId: 'bat_neg'
    }

    const res = DCSolver.solve({ components: [bat], wires: [wire] })
    expect(res.status).toBe('short_circuit')
    expect(res.errorMessage).toContain('Cortocircuito')
  })

  it('detecta ausencia de fuente de voltaje', () => {
    const r1: CircuitComponent = {
      id: 'r_1',
      type: 'resistor',
      label: 'R1',
      x: 100,
      y: 100,
      rotation: 0,
      params: { resistance: 50 },
      terminals: [
        { id: 't1', componentId: 'r_1', name: 't1', relativeX: -30, relativeY: 0 },
        { id: 't2', componentId: 'r_1', name: 't2', relativeX: 30, relativeY: 0 }
      ]
    }

    const res = DCSolver.solve({ components: [r1], wires: [] })
    expect(res.status).toBe('no_source')
  })
})


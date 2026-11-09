/**
 * DCSolver.ts — Solucionador DC exacto por Análisis Nodal Modificado (MNA)
 * Cumple estrictamente con las leyes de Kirchhoff (KCL/KVL) y conservación de energía.
 * Dominio TypeScript puro sin dependencias de React ni Three.js.
 */

import {
  CircuitNetlist,
  CircuitComponent,
  SimulationResult,
  ComponentSimulationResult
} from './CircuitNetlist'

export class DCSolver {
  /**
   * Resuelve la red eléctrica DC mediante Análisis Nodal Modificado.
   */
  public static solve(netlist: CircuitNetlist): SimulationResult {
    const warnings: string[] = []

    if (!netlist.components || netlist.components.length === 0) {
      return this.createEmptyResult('no_source', 'El circuito está vacío. Arrastra componentes al lienzo.')
    }

    // 1. Filtrar fuentes DC activas
    const sources = netlist.components.filter(c => c.type === 'dc_source')
    if (sources.length === 0) {
      return this.createEmptyResult(
        'no_source',
        'No hay fuente de voltaje DC en el circuito. Conecta una batería para energizar la red.'
      )
    }

    // 2. Extraer Nodos Eléctricos mediante Disjoint-Set
    const parent: Record<string, string> = {}
    const find = (tId: string): string => {
      if (!parent[tId]) parent[tId] = tId
      if (parent[tId] !== tId) {
        parent[tId] = find(parent[tId])
      }
      return parent[tId]
    }
    const union = (t1: string, t2: string) => {
      const root1 = find(t1)
      const root2 = find(t2)
      if (root1 !== root2) {
        parent[root2] = root1
      }
    }

    // Registrar todos los terminales
    for (const comp of netlist.components) {
      for (const t of comp.terminals) {
        find(t.id)
      }
    }

    // Unir terminales conectados por cables
    for (const wire of netlist.wires) {
      union(wire.fromTerminalId, wire.toTerminalId)
    }

    // Mapear cada terminal a un ID canónico de nodo
    const rawNodes = new Set<string>()
    const terminalToRawNode: Record<string, string> = {}
    for (const comp of netlist.components) {
      for (const t of comp.terminals) {
        const root = find(t.id)
        rawNodes.add(root)
        terminalToRawNode[t.id] = root
      }
    }

    // 3. Verificar cortocircuito directo en cualquier fuente
    for (const src of sources) {
      const posTerm = src.terminals.find(t => t.name === 'pos' || t.name === 't1')
      const negTerm = src.terminals.find(t => t.name === 'neg' || t.name === 't2')
      if (posTerm && negTerm) {
        if (terminalToRawNode[posTerm.id] === terminalToRawNode[negTerm.id]) {
          return this.createEmptyResult(
            'short_circuit',
            `Cortocircuito detectado en la fuente "${src.label}": terminales positivo y negativo unidos directamente.`
          )
        }
      }
    }

    // 4. Seleccionar Nodo de Referencia (Tierra = 0 V)
    // El terminal negativo de la primera fuente es el nodo 0 de referencia
    const primarySrc = sources[0]
    const primaryNegTerm = primarySrc.terminals.find(t => t.name === 'neg' || t.name === 't2')
    if (!primaryNegTerm) {
      return this.createEmptyResult('open_circuit', 'La fuente no tiene terminal de referencia negativo definido.')
    }
    const groundRawNode = terminalToRawNode[primaryNegTerm.id]

    // Asignar índices de nodo: el nodo de tierra es el 0
    const rawNodeToIndex: Record<string, number> = {}
    rawNodeToIndex[groundRawNode] = 0
    let nodeIndexCounter = 1
    for (const rawNode of rawNodes) {
      if (rawNode !== groundRawNode) {
        rawNodeToIndex[rawNode] = nodeIndexCounter++
      }
    }

    const terminalToNode: Record<string, string> = {}
    for (const comp of netlist.components) {
      for (const t of comp.terminals) {
        const idx = rawNodeToIndex[terminalToRawNode[t.id]]
        terminalToNode[t.id] = `N${idx}`
      }
    }

    const N = nodeIndexCounter // Número total de nodos (0 a N-1)

    // 5. Verificar camino cerrado (Conectividad) entre terminal positivo y tierra
    const primaryPosTerm = primarySrc.terminals.find(t => t.name === 'pos' || t.name === 't1')
    if (!primaryPosTerm) {
      return this.createEmptyResult('open_circuit', 'La fuente no tiene terminal positivo conectado.')
    }
    const primaryPosNode = rawNodeToIndex[terminalToRawNode[primaryPosTerm.id]]

    // Comprobar si hay al menos una rama conductora cerrada
    // Ramas de voltaje ideales en MNA:
    // - Fuentes DC
    // - Interruptores CERRADOS (modelo V=0 exacto en MNA)
    // - Amperímetros (modelo V=0 exacto)
    // - Fusibles intactos (modelo V=0 exacto)
    interface VoltageBranch {
      comp: CircuitComponent
      nodeA: number // polo positivo (+ / t1)
      nodeB: number // polo negativo (- / t2)
      voltage: number
    }
    const voltageBranches: VoltageBranch[] = []

    for (const comp of netlist.components) {
      if (comp.type === 'dc_source') {
        const tPos = comp.terminals.find(t => t.name === 'pos' || t.name === 't1')
        const tNeg = comp.terminals.find(t => t.name === 'neg' || t.name === 't2')
        if (tPos && tNeg) {
          voltageBranches.push({
            comp,
            nodeA: rawNodeToIndex[terminalToRawNode[tPos.id]],
            nodeB: rawNodeToIndex[terminalToRawNode[tNeg.id]],
            voltage: comp.params.voltage ?? 12
          })
        }
      } else if (comp.type === 'switch') {
        const isClosed = comp.params.switchState === 'closed'
        if (isClosed && comp.terminals.length >= 2) {
          voltageBranches.push({
            comp,
            nodeA: rawNodeToIndex[terminalToRawNode[comp.terminals[0].id]],
            nodeB: rawNodeToIndex[terminalToRawNode[comp.terminals[1].id]],
            voltage: 0 // Interruptor cerrado = cortocircuito ideal controlado
          })
        }
      } else if (comp.type === 'ammeter') {
        if (comp.terminals.length >= 2) {
          voltageBranches.push({
            comp,
            nodeA: rawNodeToIndex[terminalToRawNode[comp.terminals[0].id]],
            nodeB: rawNodeToIndex[terminalToRawNode[comp.terminals[1].id]],
            voltage: 0 // Amperímetro ideal = 0 V
          })
        }
      } else if (comp.type === 'fuse') {
        const isIntact = comp.params.fuseState !== 'blown'
        if (isIntact && comp.terminals.length >= 2) {
          voltageBranches.push({
            comp,
            nodeA: rawNodeToIndex[terminalToRawNode[comp.terminals[0].id]],
            nodeB: rawNodeToIndex[terminalToRawNode[comp.terminals[1].id]],
            voltage: 0 // Fusible intacto = 0 V
          })
        }
      }
    }

    // 6. Construir matrices MNA: Sistema de dimensión (N - 1 + M)
    // donde N-1 son los nodos no-referencia y M es el número de ramas de voltaje
    const M = voltageBranches.length
    const numEquations = (N - 1) + M

    if (numEquations <= 0) {
      return this.createEmptyResult('open_circuit', 'No hay suficientes nodos o ramas para formar un circuito.')
    }

    const A: number[][] = Array.from({ length: numEquations }, () =>
      new Array(numEquations).fill(0)
    )
    const z: number[] = new Array(numEquations).fill(0)

    // Submatriz G: Conductancias entre nodos
    for (const comp of netlist.components) {
      if (comp.type === 'resistor' || comp.type === 'lightbulb') {
        const R = comp.params.resistance ?? (comp.type === 'resistor' ? 10 : 25)
        if (R <= 0) {
          return this.createEmptyResult(
            'short_circuit',
            `Resistencia no permitida en "${comp.label}": el valor debe ser estrictamente mayor que 0 Ω.`
          )
        }
        const g = 1 / R
        if (comp.terminals.length >= 2) {
          const n1 = rawNodeToIndex[terminalToRawNode[comp.terminals[0].id]]
          const n2 = rawNodeToIndex[terminalToRawNode[comp.terminals[1].id]]

          // Si n1 == n2, la resistencia está puenteada a sí misma (no aporta a la matriz)
          if (n1 !== n2) {
            if (n1 > 0) A[n1 - 1][n1 - 1] += g
            if (n2 > 0) A[n2 - 1][n2 - 1] += g
            if (n1 > 0 && n2 > 0) {
              A[n1 - 1][n2 - 1] -= g
              A[n2 - 1][n1 - 1] -= g
            }
          }
        }
      }
    }

    // Submatrices B, C, D para ramas de voltaje
    for (let k = 0; k < M; k++) {
      const branch = voltageBranches[k]
      const branchEq = (N - 1) + k
      const { nodeA, nodeB, voltage } = branch

      // B matrix: efecto de la corriente de rama en los nodos
      if (nodeA > 0) {
        A[nodeA - 1][branchEq] += 1
      }
      if (nodeB > 0) {
        A[nodeB - 1][branchEq] -= 1
      }

      // C matrix: ecuación de rama de voltaje V_nodeA - V_nodeB = voltage
      if (nodeA > 0) {
        A[branchEq][nodeA - 1] += 1
      }
      if (nodeB > 0) {
        A[branchEq][nodeB - 1] -= 1
      }

      // D matrix: 0 para fuentes ideales
      A[branchEq][branchEq] = 0

      // Vector de estímulos z
      z[branchEq] = voltage
    }

    // 7. Resolver por Eliminación Gaussiana con Pivoteo Parcial
    const solution = this.solveGaussian(A, z)
    if (!solution) {
      // Si la matriz es singular, diagnosticar la causa física
      // ¿Es un cortocircuito entre dos fuentes en paralelo con voltajes distintos?
      for (let i = 0; i < M; i++) {
        for (let j = i + 1; j < M; j++) {
          const b1 = voltageBranches[i]
          const b2 = voltageBranches[j]
          const sameNodes =
            (b1.nodeA === b2.nodeA && b1.nodeB === b2.nodeB) ||
            (b1.nodeA === b2.nodeB && b1.nodeB === b2.nodeA)
          if (sameNodes) {
            return this.createEmptyResult(
              'short_circuit',
              `Conflicto topológico o cortocircuito entre ramas de voltaje "${b1.comp.label}" y "${b2.comp.label}".`
            )
          }
        }
      }

      return this.createEmptyResult(
        'open_circuit',
        'Circuito abierto o nodos flotantes: no hay camino conductor cerrado hacia la referencia.'
      )
    }

    // 8. Extraer voltajes nodales calculados
    const nodeVoltages: Record<string, number> = { N0: 0 }
    for (let i = 1; i < N; i++) {
      const v = solution[i - 1]
      nodeVoltages[`N${i}`] = Number.isFinite(v) ? v : 0
    }

    // Extraer corrientes de rama de voltaje
    const branchCurrents: Record<string, number> = {}
    for (let k = 0; k < M; k++) {
      const branch = voltageBranches[k]
      const current = solution[(N - 1) + k]
      branchCurrents[branch.comp.id] = Number.isFinite(current) ? current : 0
    }

    // 9. Calcular magnitudes de cada componente
    const componentResults: Record<string, ComponentSimulationResult> = {}
    let totalPowerSupplied = 0
    let totalPowerDissipated = 0
    let primarySourceCurrent = 0

    for (const comp of netlist.components) {
      if (comp.terminals.length < 2) {
        componentResults[comp.id] = {
          voltage: 0,
          current: 0,
          power: 0,
          isActive: false,
          error: 'Componente sin conectar'
        }
        continue
      }

      const t1 = comp.terminals[0]
      const t2 = comp.terminals[1]
      const node1Id = terminalToNode[t1.id] || 'N0'
      const node2Id = terminalToNode[t2.id] || 'N0'
      const v1 = nodeVoltages[node1Id] ?? 0
      const v2 = nodeVoltages[node2Id] ?? 0
      const vDiff = v1 - v2

      if (comp.type === 'dc_source') {
        const jBranch = branchCurrents[comp.id] ?? 0
        // En MNA, jBranch es la corriente que ENTRA al nodo positivo.
        // La corriente suministrada que SALE del polo positivo hacia el circuito es -jBranch.
        const iSupplied = -jBranch
        const vNom = comp.params.voltage ?? 12
        const pSupplied = vNom * iSupplied
        if (comp.id === primarySrc.id) {
          primarySourceCurrent = iSupplied
        }
        if (pSupplied > 0) {
          totalPowerSupplied += pSupplied
        }
        componentResults[comp.id] = {
          voltage: vNom,
          current: Math.abs(iSupplied),
          power: Math.abs(pSupplied),
          isActive: Math.abs(iSupplied) > 1e-6
        }
      } else if (comp.type === 'resistor') {
        const R = comp.params.resistance ?? 10
        const current = vDiff / R
        const power = vDiff * current
        totalPowerDissipated += power
        componentResults[comp.id] = {
          voltage: Math.abs(vDiff),
          current: Math.abs(current),
          power: Math.abs(power),
          isActive: Math.abs(current) > 1e-6
        }
      } else if (comp.type === 'lightbulb') {
        const R = comp.params.resistance ?? 25
        const current = vDiff / R
        const power = vDiff * current
        const nominalP = comp.params.nominalPower ?? 10
        const brightness = Math.min(1, Math.max(0, power / nominalP))
        totalPowerDissipated += power
        componentResults[comp.id] = {
          voltage: Math.abs(vDiff),
          current: Math.abs(current),
          power: Math.abs(power),
          isActive: Math.abs(current) > 1e-6,
          brightness
        }
      } else if (comp.type === 'switch') {
        const isClosed = comp.params.switchState === 'closed'
        const current = isClosed ? Math.abs(branchCurrents[comp.id] ?? 0) : 0
        componentResults[comp.id] = {
          voltage: isClosed ? 0 : Math.abs(vDiff),
          current,
          power: 0,
          isActive: current > 1e-6
        }
      } else if (comp.type === 'ammeter') {
        const current = Math.abs(branchCurrents[comp.id] ?? 0)
        componentResults[comp.id] = {
          voltage: 0,
          current,
          power: 0,
          isActive: current > 1e-6
        }
      } else if (comp.type === 'voltmeter') {
        componentResults[comp.id] = {
          voltage: Math.abs(vDiff),
          current: 0,
          power: 0,
          isActive: Math.abs(vDiff) > 1e-3
        }
      } else if (comp.type === 'fuse') {
        const isBlown = comp.params.fuseState === 'blown'
        const current = isBlown ? 0 : Math.abs(branchCurrents[comp.id] ?? 0)
        const maxI = comp.params.maxCurrent ?? 1.5
        const willBlow = !isBlown && current > maxI
        componentResults[comp.id] = {
          voltage: isBlown ? Math.abs(vDiff) : 0,
          current,
          power: 0,
          isActive: current > 1e-6,
          isBlown: isBlown || willBlow
        }
      }
    }

    // Verificar si el circuito está abierto (corriente de fuente nula)
    if (Math.abs(primarySourceCurrent) < 1e-9) {
      warnings.push('La corriente en la fuente es 0 A: el circuito está abierto o los interruptores están desconectados.')
    }

    // Calcular resistencia equivalente global vista por la fuente
    const primaryV = primarySrc.params.voltage ?? 12
    const totalCurrent = Math.abs(primarySourceCurrent)
    const Req = totalCurrent > 1e-9 ? primaryV / totalCurrent : Infinity

    // Determinar corrientes de cables
    const wireCurrents: Record<string, { current: number; active: boolean; forward: boolean }> = {}
    for (const wire of netlist.wires) {
      // Asociar corriente al componente al que se conecta
      const fromComp = netlist.components.find(c => c.terminals.some(t => t.id === wire.fromTerminalId))
      const res = fromComp ? componentResults[fromComp.id] : null
      const wireI = res ? res.current : 0
      wireCurrents[wire.id] = {
        current: wireI,
        active: wireI > 1e-6,
        forward: true
      }
    }

    return {
      status: 'valid',
      warnings,
      nodeVoltages,
      terminalToNode,
      componentResults,
      totalVoltage: primaryV,
      totalCurrent,
      totalPowerSupplied,
      totalPowerDissipated,
      equivalentResistance: Req,
      nodeCount: N,
      wireCurrents
    }
  }

  /**
   * Resuelve sistema lineal Ax = b mediante Eliminación Gaussiana con pivoteo parcial.
   */
  private static solveGaussian(A: number[][], b: number[]): number[] | null {
    const n = b.length
    // Clonar matriz y vector para no mutar los originales
    const M: number[][] = A.map(row => [...row])
    const x: number[] = [...b]

    for (let k = 0; k < n; k++) {
      // 1. Encontrar pivote máximo
      let maxRow = k
      let maxVal = Math.abs(M[k][k])
      for (let i = k + 1; i < n; i++) {
        if (Math.abs(M[i][k]) > maxVal) {
          maxVal = Math.abs(M[i][k])
          maxRow = i
        }
      }

      if (maxVal < 1e-12) {
        // Matriz singular o casi singular
        return null
      }

      // 2. Intercambiar filas
      if (maxRow !== k) {
        const tempRow = M[k]
        M[k] = M[maxRow]
        M[maxRow] = tempRow
        const tempB = x[k]
        x[k] = x[maxRow]
        x[maxRow] = tempB
      }

      // 3. Eliminación hacia adelante
      for (let i = k + 1; i < n; i++) {
        const factor = M[i][k] / M[k][k]
        for (let j = k; j < n; j++) {
          M[i][j] -= factor * M[k][j]
        }
        x[i] -= factor * x[k]
      }
    }

    // 4. Sustitución hacia atrás
    const sol = new Array(n).fill(0)
    for (let i = n - 1; i >= 0; i--) {
      let sum = x[i]
      for (let j = i + 1; j < n; j++) {
        sum -= M[i][j] * sol[j]
      }
      sol[i] = sum / M[i][i]
    }

    return sol
  }

  private static createEmptyResult(
    status: SimulationResult['status'],
    errorMessage: string
  ): SimulationResult {
    return {
      status,
      errorMessage,
      warnings: [],
      nodeVoltages: {},
      terminalToNode: {},
      componentResults: {},
      totalVoltage: 0,
      totalCurrent: 0,
      totalPowerSupplied: 0,
      totalPowerDissipated: 0,
      equivalentResistance: 0,
      nodeCount: 0,
      wireCurrents: {}
    }
  }
}


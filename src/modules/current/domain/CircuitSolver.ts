export type ComponentType = 'resistor' | 'series' | 'parallel';

export interface CircuitNode {
  id: string;
  type: ComponentType;
  R?: number; // Only if type === 'resistor'
  children?: CircuitNode[]; // If series or parallel
  // Calculated state
  V?: number;
  I?: number;
  P?: number;
  Req?: number;
}

export class CircuitSolver {
  static evaluateEquivalentResistance(node: CircuitNode): number {
    if (node.type === 'resistor') {
      return node.R || 0;
    }
    
    if (!node.children || node.children.length === 0) return Infinity; // Open circuit

    if (node.type === 'series') {
      let req = 0;
      for (const child of node.children) {
        req += this.evaluateEquivalentResistance(child);
      }
      return req;
    }

    if (node.type === 'parallel') {
      let invReq = 0;
      for (const child of node.children) {
        const r = this.evaluateEquivalentResistance(child);
        if (r === 0) return 0; // Short circuit
        invReq += 1 / r;
      }
      return invReq === 0 ? Infinity : 1 / invReq;
    }

    return Infinity;
  }
  
  static solveTree(node: CircuitNode, V_total: number): CircuitNode {
    const Req = this.evaluateEquivalentResistance(node);
    
    if (Req === 0 && V_total > 0) {
      throw new Error("Cortocircuito detectado: Resistencia equivalente nula con voltaje de fuente.");
    }
    
    if (Req === Infinity) {
      throw new Error("Circuito abierto: La red no tiene caminos válidos para la corriente.");
    }
    
    const I_total = V_total / Req;
    
    return this.propagateVoltageCurrent(node, V_total, I_total);
  }

  private static propagateVoltageCurrent(node: CircuitNode, V: number, I: number): CircuitNode {
    const Req = this.evaluateEquivalentResistance(node);
    const newNode: CircuitNode = { ...node, V, I, P: V * I, Req };
    
    if (node.type === 'resistor') return newNode;
    if (!node.children) return newNode;

    if (node.type === 'series') {
      newNode.children = node.children.map(child => {
        const r = this.evaluateEquivalentResistance(child);
        const childV = r * I; // En serie, I es la misma
        return this.propagateVoltageCurrent(child, childV, I);
      });
    } else if (node.type === 'parallel') {
      newNode.children = node.children.map(child => {
        const r = this.evaluateEquivalentResistance(child);
        const childI = r > 0 ? V / r : 0; // En paralelo, V es la misma
        return this.propagateVoltageCurrent(child, V, childI);
      });
    }

    return newNode;
  }
}

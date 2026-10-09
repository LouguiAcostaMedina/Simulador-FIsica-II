import { describe, it, expect } from 'vitest'
import { CircuitSolver, CircuitNode } from './CircuitSolver'

describe('CircuitSolver', () => {
  it('solves simple series circuit', () => {
    const root: CircuitNode = {
      id: 'root',
      type: 'series',
      children: [
        { id: 'r1', type: 'resistor', R: 10 },
        { id: 'r2', type: 'resistor', R: 20 }
      ]
    }
    
    const solved = CircuitSolver.solveTree(root, 30) // V = 30V
    
    expect(solved.Req).toBe(30)
    expect(solved.I).toBe(1) // 30V / 30Ohm
    
    expect(solved.children![0].V).toBe(10)
    expect(solved.children![1].V).toBe(20)
    
    expect(solved.children![0].I).toBe(1)
    expect(solved.children![1].I).toBe(1)
  })

  it('solves simple parallel circuit', () => {
    const root: CircuitNode = {
      id: 'root',
      type: 'parallel',
      children: [
        { id: 'r1', type: 'resistor', R: 10 },
        { id: 'r2', type: 'resistor', R: 10 }
      ]
    }
    
    const solved = CircuitSolver.solveTree(root, 10) // V = 10V
    
    expect(solved.Req).toBe(5)
    expect(solved.I).toBe(2) // 10V / 5Ohm
    
    expect(solved.children![0].V).toBe(10)
    expect(solved.children![1].V).toBe(10)
    
    expect(solved.children![0].I).toBe(1)
    expect(solved.children![1].I).toBe(1)
  })
})

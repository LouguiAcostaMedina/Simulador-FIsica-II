import { describe, it, expect } from 'vitest'
import { CapacitorMath, CapacitorState } from './CapacitorMath'

describe('CapacitorMath', () => {
  it('duplicar A duplica C', () => {
    const s1: CapacitorState = { A: 0.01, d: 0.01, er: 1, mode: 'fixed_V', sourceValue: 10 }
    const s2: CapacitorState = { ...s1, A: 0.02 }
    
    const m1 = CapacitorMath.evaluate(s1)
    const m2 = CapacitorMath.evaluate(s2)
    
    expect(m2.C).toBeCloseTo(m1.C * 2, 15)
  })

  it('duplicar d reduce C a la mitad', () => {
    const s1: CapacitorState = { A: 0.01, d: 0.01, er: 1, mode: 'fixed_V', sourceValue: 10 }
    const s2: CapacitorState = { ...s1, d: 0.02 }
    
    const m1 = CapacitorMath.evaluate(s1)
    const m2 = CapacitorMath.evaluate(s2)
    
    expect(m2.C).toBeCloseTo(m1.C / 2, 15)
  })

  it('dieléctrico en V fijo aumenta C, Q, U', () => {
    const base: CapacitorState = { A: 0.01, d: 0.01, er: 1, mode: 'fixed_V', sourceValue: 10 }
    const conD: CapacitorState = { ...base, er: 2 }
    
    const mb = CapacitorMath.evaluate(base)
    const md = CapacitorMath.evaluate(conD)
    
    expect(md.C).toBeGreaterThan(mb.C)
    expect(md.Q).toBeGreaterThan(mb.Q)
    expect(md.U).toBeGreaterThan(mb.U)
    expect(md.V).toBe(mb.V) // V se mantiene
  })

  it('dieléctrico en Q fijo aumenta C, disminuye V, E, U', () => {
    // Calculamos Q inicial
    const base: CapacitorState = { A: 0.01, d: 0.01, er: 1, mode: 'fixed_V', sourceValue: 10 }
    const mb = CapacitorMath.evaluate(base)
    
    const baseQ: CapacitorState = { A: 0.01, d: 0.01, er: 1, mode: 'fixed_Q', sourceValue: mb.Q }
    const conD_Q: CapacitorState = { ...baseQ, er: 2 }
    
    const mbq = CapacitorMath.evaluate(baseQ)
    const mdq = CapacitorMath.evaluate(conD_Q)
    
    expect(mdq.C).toBeGreaterThan(mbq.C)
    expect(mdq.V).toBeLessThan(mbq.V)
    expect(mdq.E).toBeLessThan(mbq.E)
    expect(mdq.U).toBeLessThan(mbq.U)
    expect(mdq.Q).toBeCloseTo(mbq.Q, 15)
  })
})

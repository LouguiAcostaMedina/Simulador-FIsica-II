import { describe, it, expect } from 'vitest'
import { CurrentMath, CONSTANTS } from './CurrentMath'

describe('CurrentMath', () => {
  it('calculates current correctly', () => {
    expect(CurrentMath.evaluateCurrent(5, 2)).toBe(2.5)
  })
  it('calculates resistance correctly', () => {
    expect(CurrentMath.evaluateResistance(1.68e-8, 10, 1e-6)).toBeCloseTo(0.168, 5)
  })
  it('calculates voltage and power correctly', () => {
    const I = 2;
    const R = 5;
    const V = CurrentMath.evaluateVoltage(I, R);
    expect(V).toBe(10);
    expect(CurrentMath.evaluatePower(V, I)).toBe(20);
  })
})

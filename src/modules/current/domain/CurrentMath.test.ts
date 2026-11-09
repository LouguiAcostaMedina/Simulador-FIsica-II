import { describe, it, expect } from 'vitest'
import { CurrentMath } from './CurrentMath'

describe('CurrentMath — Electrodinámica y Ley de Ohm', () => {
  it('calcula corriente I = dQ/dt y valida dt > 0', () => {
    expect(CurrentMath.evaluateCurrent(5, 2)).toBe(2.5)
    expect(() => CurrentMath.evaluateCurrent(5, 0)).toThrow('dt debe ser mayor a 0')
    expect(() => CurrentMath.evaluateCurrent(5, -1)).toThrow('dt debe ser mayor a 0')
  })

  it('calcula densidad de corriente J = I / A y velocidad de deriva vd', () => {
    const I = 2 // A
    const A = 1e-6 // 1 mm^2 = 1e-6 m^2
    const J = CurrentMath.evaluateCurrentDensity(I, A)
    expect(J).toBe(2e6) // 2 MA/m^2

    // Cobre: n ≈ 8.5e28 electrones/m^3
    const n = 8.5e28
    const vd = CurrentMath.evaluateDriftVelocity(I, n, A)
    // vd = 2 / (8.5e28 * 1.602e-19 * 1e-6) ≈ 1.468e-4 m/s (fracción de mm por segundo)
    expect(vd).toBeCloseTo(1.4687e-4, 7)

    expect(() => CurrentMath.evaluateCurrentDensity(I, 0)).toThrow()
    expect(() => CurrentMath.evaluateDriftVelocity(I, 0, A)).toThrow()
  })

  it('calcula resistencia material R = rho * L / A', () => {
    // Alambre de cobre: rho = 1.68e-8 Ω·m, L = 10 m, A = 1 mm^2 = 1e-6 m^2
    expect(CurrentMath.evaluateResistance(1.68e-8, 10, 1e-6)).toBeCloseTo(0.168, 5)
    expect(() => CurrentMath.evaluateResistance(0, 10, 1e-6)).toThrow()
    expect(() => CurrentMath.evaluateResistance(1.68e-8, -5, 1e-6)).toThrow()
  })

  it('calcula voltaje V = I * R y potencia P = V * I', () => {
    const I = 2
    const R = 5
    const V = CurrentMath.evaluateVoltage(I, R)
    expect(V).toBe(10)
    expect(CurrentMath.evaluatePower(V, I)).toBe(20)
  })
})

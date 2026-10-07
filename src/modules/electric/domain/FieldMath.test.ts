import { describe, it, expect } from 'vitest'
import { FieldMath } from './FieldMath'
import { Vector3 } from '../../../shared/domain/Vector3'
import { Constants } from '../../../shared/domain/constants'

describe('FieldMath', () => {
  it('calcula el potencial de una carga a cierta distancia', () => {
    const q = 1e-6 // 1 uC
    const d = 1 // 1 m
    const charges = [{ id: '1', q, position: new Vector3(0, 0, 0) }]
    const pos = new Vector3(d, 0, 0)
    
    const V = FieldMath.evaluatePotential(charges, pos)
    // V = k * q / r = 8.98e9 * 1e-6 / 1 = 8.98e3
    expect(V).toBeCloseTo(Constants.k * q / d, 0)
  })

  it('dipolo simétrico tiene potencial nulo en el plano medio', () => {
    const q = 1e-6
    const charges = [
      { id: '1', q, position: new Vector3(-1, 0, 0) },
      { id: '2', q: -q, position: new Vector3(1, 0, 0) }
    ]
    const pos = new Vector3(0, 1, 0) // En el plano y
    
    const V = FieldMath.evaluatePotential(charges, pos)
    expect(V).toBeCloseTo(0, 5)
  })
  
  it('invertir signo de carga invierte aceleración', () => {
    const E = new Vector3(1000, 0, 0) // Campo uniforme
    
    const F1 = FieldMath.evaluateForce(E, 1e-6)
    const a1 = FieldMath.evaluateAcceleration(F1, 1e-3)
    
    const F2 = FieldMath.evaluateForce(E, -1e-6)
    const a2 = FieldMath.evaluateAcceleration(F2, 1e-3)
    
    expect(a1.x).toBeGreaterThan(0)
    expect(a2.x).toBeLessThan(0)
    expect(a1.x).toBeCloseTo(-a2.x, 5)
  })
})

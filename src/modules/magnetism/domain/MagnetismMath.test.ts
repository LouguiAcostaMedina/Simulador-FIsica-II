import { describe, it, expect } from 'vitest'
import { MagnetismMath, CONSTANTS } from './MagnetismMath'
import { Vector3 } from '../../../shared/domain/Vector3'

describe('MagnetismMath', () => {
  it('calculates wire B field direction correctly', () => {
    // Wire along Z axis, current = 1A
    const I = 1
    const wireDir = new Vector3(0, 0, 1)
    const wirePoint = new Vector3(0, 0, 0)
    const evalPoint = new Vector3(1, 0, 0) // Point at x=1

    const B = MagnetismMath.evaluateWireBField(I, wireDir, wirePoint, evalPoint)

    // Wire along Z, point at X, r_vec = (1, 0, 0)
    // dir x r_vec = (0, 0, 1) x (1, 0, 0) = (0, 1, 0) -> +Y direction
    expect(B.x).toBeCloseTo(0, 10)
    expect(B.y).toBeGreaterThan(0)
    expect(B.z).toBeCloseTo(0, 10)

    const mag = (CONSTANTS.mu0 * 1) / (2 * Math.PI * 1)
    expect(B.y).toBeCloseTo(mag, 15)
  })

  it('calculates Lorentz force', () => {
    const q = 1 // 1 C
    const E = new Vector3(10, 0, 0) // E in X
    const v = new Vector3(0, 10, 0) // v in Y
    const B = new Vector3(0, 0, 1) // B in Z

    // v x B = (0, 10, 0) x (0, 0, 1) = (10, 0, 0)
    // F = q * (E + v x B) = 1 * ((10,0,0) + (10,0,0)) = (20, 0, 0)
    const F = MagnetismMath.evaluateLorentzForce(q, E, v, B)
    expect(F.x).toBeCloseTo(20, 10)
    expect(F.y).toBeCloseTo(0, 10)
    expect(F.z).toBeCloseTo(0, 10)
  })

  it('Boris Pusher conserva estrictamente la rapidez |v| cuando E = 0 a lo largo de 500 pasos', () => {
    const q = 1.0
    const m = 1.0
    const E = new Vector3(0, 0, 0)
    const B = new Vector3(0, 0, 2.5) // Campo magnético puro en Z
    const initialVelocity = new Vector3(3.0, 4.0, 0) // Rapidez inicial = 5.0 m/s
    const initialSpeed = initialVelocity.magnitude()

    let state = {
      position: new Vector3(0, 0, 0),
      velocity: initialVelocity
    }

    const dt = 0.01 // 10 ms
    for (let step = 0; step < 500; step++) {
      state = MagnetismMath.borisStep(state, { q, m, E, B, dt })
      const currentSpeed = state.velocity.magnitude()
      // Conservación incondicional de la rapidez (energía cinética constante)
      expect(currentSpeed).toBeCloseTo(initialSpeed, 8)
    }

    // Comprobar que describió una trayectoria circular cerrada (posición no se alejó indefinidamente)
    const rLarmor = MagnetismMath.calculateLarmorRadius(m, initialSpeed, q, B.magnitude())
    expect(rLarmor).toBeCloseTo(5.0 / 2.5, 5) // 2 metros
    expect(state.position.magnitude()).toBeLessThanOrEqual(2 * rLarmor + 0.1)
  })

  it('Boris Pusher en Selector de Velocidades de Wien (E perp B, v = E/B) mantiene trayectoria recta', () => {
    // E en +Y, B en +Z -> v x B en -Y para v en +X
    // Si v = E / B, la fuerza nera F = q*(E + v x B) = 0
    const q = 1.0
    const m = 1.0
    const B = new Vector3(0, 0, 1.0) // 1 T
    const E = new Vector3(0, 10.0, 0) // 10 N/C
    const vWien = new Vector3(10.0, 0, 0) // 10 m/s (v = E/B = 10)

    let state = {
      position: new Vector3(0, 0, 0),
      velocity: vWien
    }

    const dt = 0.01
    for (let step = 0; step < 50; step++) {
      state = MagnetismMath.borisStep(state, { q, m, E, B, dt })
    }

    // La velocidad no debe desviarse en Y ni Z
    expect(state.velocity.x).toBeCloseTo(10.0, 2)
    expect(state.velocity.y).toBeCloseTo(0, 2)
    expect(state.position.y).toBeCloseTo(0, 2)
  })
})

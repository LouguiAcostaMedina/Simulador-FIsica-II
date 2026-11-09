import { Vector3 } from '../../../shared/domain/Vector3'

export const CONSTANTS = {
  mu0: 4 * Math.PI * 1e-7 // T*m/A
}

export interface BorisState {
  position: Vector3
  velocity: Vector3
}

export interface BorisParams {
  q: number
  m: number
  E: Vector3
  B: Vector3
  dt: number
}

export class MagnetismMath {
  // Campo B de un conductor rectilíneo largo ideal
  // B = (mu0 * I / (2 * pi * r)) * (u_I x u_r)
  static evaluateWireBField(I: number, wireDir: Vector3, wirePoint: Vector3, evalPoint: Vector3): Vector3 {
    const dir = wireDir.normalize()
    const rVec = evalPoint.subtract(wirePoint)

    // Proyección de rVec sobre la línea
    const projLength = rVec.dot(dir)
    const projVec = dir.multiply(projLength)

    // Vector perpendicular desde el alambre al punto de evaluación
    const perpVec = rVec.subtract(projVec)
    const r = perpVec.magnitude()

    if (r < 1e-6) throw new Error('Singularidad en el conductor')

    const B_mag = (CONSTANTS.mu0 * I) / (2 * Math.PI * r)
    const u_r = perpVec.normalize()

    // Dirección del campo magnético: regla de la mano derecha (wireDir x u_r)
    const B_dir = dir.cross(u_r)

    return B_dir.multiply(B_mag)
  }

  // Dipolo magnético como aproximación
  // B(r) = (mu0 / (4 * pi)) * ( (3 * r * (m . r) / |r|^5) - (m / |r|^3) )
  static evaluateDipoleBField(m: Vector3, dipolePos: Vector3, evalPoint: Vector3): Vector3 {
    const rVec = evalPoint.subtract(dipolePos)
    const r = rVec.magnitude()

    if (r < 1e-6) throw new Error('Singularidad en el dipolo')

    const r5 = Math.pow(r, 5)
    const r3 = Math.pow(r, 3)
    const m_dot_r = m.dot(rVec)

    const term1 = rVec.multiply((3 * m_dot_r) / r5)
    const term2 = m.multiply(1 / r3)

    const factor = CONSTANTS.mu0 / (4 * Math.PI)
    return term1.subtract(term2).multiply(factor)
  }

  // Fuerza de Lorentz: F = q * (E + v x B)
  static evaluateLorentzForce(q: number, E: Vector3, v: Vector3, B: Vector3): Vector3 {
    const v_cross_B = v.cross(B)
    return E.add(v_cross_B).multiply(q)
  }

  /**
   * Integrador Boris Pusher
   * El algoritmo de referencia en física de plasmas y simulación de partículas cargadas.
   * Garantiza la conservación estricta de la rapidez |v| y energía cinética cuando E = 0.
   */
  static borisStep(state: BorisState, params: BorisParams): BorisState {
    const { q, m, E, B, dt } = params
    if (m <= 0) throw new Error('La masa de la partícula debe ser estrictamente positiva (m > 0).')

    const half_dt = dt * 0.5
    const q_over_m = q / m

    // 1. Primer semi-paso eléctrico: v_minus = v + (q * E / m) * (dt / 2)
    const v_minus = state.velocity.add(E.multiply(q_over_m * half_dt))

    // 2. Rotación magnética pura
    // t = (q * B / m) * (dt / 2)
    const t = B.multiply(q_over_m * half_dt)
    const t_mag_sq = t.dot(t)
    // s = 2 * t / (1 + |t|^2)
    const s = t.multiply(2 / (1 + t_mag_sq))

    // v_prime = v_minus + v_minus x t
    const v_prime = v_minus.add(v_minus.cross(t))

    // v_plus = v_minus + v_prime x s
    const v_plus = v_minus.add(v_prime.cross(s))

    // 3. Segundo semi-paso eléctrico: v_next = v_plus + (q * E / m) * (dt / 2)
    const v_next = v_plus.add(E.multiply(q_over_m * half_dt))

    // 4. Actualización de posición: x_next = x + v_next * dt
    const x_next = state.position.add(v_next.multiply(dt))

    return {
      position: x_next,
      velocity: v_next
    }
  }

  // Radio de Larmor: r_L = (m * v_perp) / (|q| * |B|)
  static calculateLarmorRadius(m: number, vPerp: number, q: number, BMag: number): number {
    if (Math.abs(q) < 1e-18 || BMag < 1e-18) return Infinity
    return (m * Math.abs(vPerp)) / (Math.abs(q) * BMag)
  }

  // Frecuencia de ciclotrón: omega_c = (|q| * B) / m
  static calculateCyclotronFrequency(q: number, BMag: number, m: number): number {
    if (m <= 0) return 0
    return (Math.abs(q) * BMag) / m
  }
}

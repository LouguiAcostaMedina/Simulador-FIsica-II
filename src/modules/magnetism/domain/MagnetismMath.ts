import { Vector3 } from '../../../shared/domain/Vector3'

export const CONSTANTS = {
  mu0: 4 * Math.PI * 1e-7 // T*m/A
}

export class MagnetismMath {
  // Campo B de un conductor rectilíneo largo ideal
  // B = (mu0 * I / (2 * pi * r)) * (u_I x u_r)
  static evaluateWireBField(I: number, wireDir: Vector3, wirePoint: Vector3, evalPoint: Vector3): Vector3 {
    const dir = wireDir.normalize();
    const rVec = evalPoint.subtract(wirePoint);
    
    // Proyección de rVec sobre la línea
    const projLength = rVec.dot(dir);
    const projVec = dir.multiply(projLength);
    
    // Vector perpendicular desde el alambre al punto de evaluación
    const perpVec = rVec.subtract(projVec);
    const r = perpVec.magnitude();
    
    if (r < 1e-9) throw new Error("Singularidad en el alambre");
    
    const B_mag = (CONSTANTS.mu0 * I) / (2 * Math.PI * r);
    const u_r = perpVec.normalize();
    
    // Dirección del campo magnético: regla de la mano derecha (wireDir x u_r)
    const B_dir = dir.cross(u_r);
    
    return B_dir.multiply(B_mag);
  }

  // Dipolo magnético como aproximación
  // B(r) = (mu0 / (4 * pi)) * ( (3 * r * (m . r) / |r|^5) - (m / |r|^3) )
  static evaluateDipoleBField(m: Vector3, dipolePos: Vector3, evalPoint: Vector3): Vector3 {
    const rVec = evalPoint.subtract(dipolePos);
    const r = rVec.magnitude();
    
    if (r < 1e-9) throw new Error("Singularidad en el dipolo");
    
    const r5 = Math.pow(r, 5);
    const r3 = Math.pow(r, 3);
    const m_dot_r = m.dot(rVec);
    
    const term1 = rVec.multiply((3 * m_dot_r) / r5);
    const term2 = m.multiply(1 / r3);
    
    const factor = CONSTANTS.mu0 / (4 * Math.PI);
    return term1.subtract(term2).multiply(factor);
  }

  // Fuerza de Lorentz: F = q * (E + v x B)
  static evaluateLorentzForce(q: number, E: Vector3, v: Vector3, B: Vector3): Vector3 {
    const v_cross_B = v.cross(B);
    return E.add(v_cross_B).multiply(q);
  }
}

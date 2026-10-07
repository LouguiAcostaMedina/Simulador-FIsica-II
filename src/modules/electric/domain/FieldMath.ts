import { Vector3 } from '../../../shared/domain/Vector3'
import { Constants } from '../../../shared/domain/constants'
import { Charge } from './Charge'

export class FieldMath {
  static evaluateField(charges: Charge[], position: Vector3): Vector3 {
    let E = new Vector3(0, 0, 0)
    for (const charge of charges) {
      const r = position.sub(charge.position)
      const rMag = r.length()
      if (rMag < 1e-9) {
        // Singularidad evitada o reportada: en un simulador real deberíamos manejar esto
        // Lanzamos error o devolvemos un campo infinito. La regla dice "cerca de singularidades devolver error de dominio concreto".
        throw new Error('Punto de evaluación demasiado cerca de una carga puntual (singularidad).')
      }
      const mag = (Constants.k * charge.q) / (rMag * rMag * rMag)
      E = E.add(r.multiplyScalar(mag))
    }
    return E
  }

  static evaluatePotential(charges: Charge[], position: Vector3): number {
    let V = 0
    for (const charge of charges) {
      const r = position.sub(charge.position)
      const rMag = r.length()
      if (rMag < 1e-9) {
        throw new Error('Punto de evaluación demasiado cerca de una carga puntual (singularidad).')
      }
      V += (Constants.k * charge.q) / rMag
    }
    return V
  }

  static evaluateForce(E: Vector3, q: number): Vector3 {
    return E.multiplyScalar(q)
  }

  static evaluateAcceleration(F: Vector3, m: number): Vector3 {
    return F.multiplyScalar(1 / m)
  }
}

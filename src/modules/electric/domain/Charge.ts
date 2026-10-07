import { Vector3 } from '../../../shared/domain/Vector3'

export interface Charge {
  id: string
  q: number // en Coulombs
  position: Vector3 // en metros
}

export interface TestParticle {
  q: number // en Coulombs
  m: number // en kg
  position: Vector3 // en metros
  velocity: Vector3 // en m/s
}

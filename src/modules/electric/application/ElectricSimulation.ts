import { Charge, TestParticle } from '../domain/Charge'
import { FieldMath } from '../domain/FieldMath'
import { Vector3 } from '../../../shared/domain/Vector3'

export type SimulationState = 'unconfigured' | 'ready' | 'running' | 'paused' | 'finished' | 'error'

export class ElectricSimulation {
  charges: Charge[] = []
  testParticle: TestParticle | null = null
  state: SimulationState = 'unconfigured'
  time: number = 0
  dt: number = 0.001 // 1 ms de paso físico
  errorMsg: string | null = null

  // Historial de trayectoria para render
  trajectory: Vector3[] = []

  constructor() {}

  setCharges(charges: Charge[]) {
    if (charges.length > 10) {
      throw new Error('El límite máximo es de 10 cargas puntuales.')
    }
    this.charges = charges
    if (this.state === 'running' || this.state === 'paused') {
      this.resetSimulation()
    }
    this.state = this.charges.length > 0 ? 'ready' : 'unconfigured'
  }

  setTestParticle(particle: TestParticle | null) {
    this.testParticle = particle
    this.resetSimulation()
  }

  resetSimulation() {
    this.time = 0
    this.trajectory = []
    if (this.testParticle) {
      this.trajectory.push(this.testParticle.position.clone())
      this.state = 'ready'
    }
    this.errorMsg = null
  }

  step() {
    if (this.state !== 'running') return
    if (!this.testParticle) return
    if (this.charges.length === 0) return

    try {
      const E = FieldMath.evaluateField(this.charges, this.testParticle.position)
      const F = FieldMath.evaluateForce(E, this.testParticle.q)
      const a = FieldMath.evaluateAcceleration(F, this.testParticle.m)

      // Euler-Cromer simple step
      this.testParticle.velocity = this.testParticle.velocity.add(a.multiplyScalar(this.dt))
      this.testParticle.position = this.testParticle.position.add(this.testParticle.velocity.multiplyScalar(this.dt))
      this.time += this.dt

      // Guardar cada 10 pasos para no saturar memoria
      if (Math.floor(this.time / this.dt) % 10 === 0) {
        this.trajectory.push(this.testParticle.position.clone())
      }

      // Condición de salida si se aleja mucho
      if (this.testParticle.position.length() > 100) {
        this.state = 'finished'
      }

    } catch (e: any) {
      this.state = 'paused'
      this.errorMsg = e.message
    }
  }
}

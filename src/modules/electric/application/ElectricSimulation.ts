import { Charge, TestParticle } from '../domain/Charge'
import { FieldMath } from '../domain/FieldMath'
import { Vector3 } from '../../../shared/domain/Vector3'

export type SimulationState = 'unconfigured' | 'ready' | 'running' | 'paused' | 'finished' | 'error'

export class ElectricSimulation {
  charges: Charge[] = []
  testParticle: TestParticle | null = null
  initialParticleSnapshot: {
    position: Vector3
    velocity: Vector3
    q: number
    m: number
  } | null = null

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
    if (particle) {
      this.initialParticleSnapshot = {
        position: particle.position.clone(),
        velocity: particle.velocity.clone(),
        q: particle.q,
        m: particle.m
      }
      this.testParticle = {
        position: particle.position.clone(),
        velocity: particle.velocity.clone(),
        q: particle.q,
        m: particle.m
      }
    } else {
      this.initialParticleSnapshot = null
      this.testParticle = null
    }
    this.resetSimulation()
  }

  resetSimulation() {
    this.time = 0
    this.trajectory = []
    if (this.initialParticleSnapshot) {
      this.testParticle = {
        position: this.initialParticleSnapshot.position.clone(),
        velocity: this.initialParticleSnapshot.velocity.clone(),
        q: this.initialParticleSnapshot.q,
        m: this.initialParticleSnapshot.m
      }
      this.trajectory.push(this.testParticle.position.clone())
      this.state = 'ready'
    } else {
      this.state = this.charges.length > 0 ? 'ready' : 'unconfigured'
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

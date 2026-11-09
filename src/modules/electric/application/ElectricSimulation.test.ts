import { describe, it, expect } from 'vitest'
import { ElectricSimulation } from './ElectricSimulation'
import { Vector3 } from '../../../shared/domain/Vector3'

describe('ElectricSimulation — Reproducibilidad y Snapshot', () => {
  it('toma un snapshot estricto al configurar la partícula de prueba', () => {
    const sim = new ElectricSimulation()
    sim.setCharges([
      { id: 'c1', q: 1e-6, position: new Vector3(0, 0, 0) }
    ])

    const initialPos = new Vector3(0, 1, 0)
    const initialVel = new Vector3(10, 0, 0)
    sim.setTestParticle({
      position: initialPos,
      velocity: initialVel,
      q: 1e-6,
      m: 1e-3
    })

    expect(sim.initialParticleSnapshot).toBeDefined()
    expect(sim.initialParticleSnapshot?.position.x).toBe(0)
    expect(sim.initialParticleSnapshot?.position.y).toBe(1)
    expect(sim.initialParticleSnapshot?.velocity.x).toBe(10)
  })

  it('restablece exactamente la posición, velocidad y tiempo al llamar a resetSimulation()', () => {
    const sim = new ElectricSimulation()
    sim.setCharges([
      { id: 'c1', q: 1e-6, position: new Vector3(0, 0, 0) }
    ])

    sim.setTestParticle({
      position: new Vector3(0, 1, 0),
      velocity: new Vector3(5, 0, 0),
      q: 1e-6,
      m: 1e-3
    })

    sim.state = 'running'
    // Ejecutar 20 pasos de integración
    for (let i = 0; i < 20; i++) {
      sim.step()
    }

    expect(sim.time).toBeGreaterThan(0)
    expect(sim.testParticle?.position.x).not.toBe(0)

    // Reiniciar
    sim.resetSimulation()

    expect(sim.time).toBe(0)
    expect(sim.state).toBe('ready')
    expect(sim.testParticle?.position.x).toBe(0)
    expect(sim.testParticle?.position.y).toBe(1)
    expect(sim.testParticle?.velocity.x).toBe(5)
    expect(sim.testParticle?.velocity.y).toBe(0)
    expect(sim.trajectory).toHaveLength(1)
    expect(sim.trajectory[0].y).toBe(1)
  })

  it('dos ejecuciones independientes con el mismo snapshot producen trayectorias idénticas', () => {
    const sim = new ElectricSimulation()
    sim.setCharges([
      { id: 'c1', q: 2e-6, position: new Vector3(-1, 0, 0) },
      { id: 'c2', q: -2e-6, position: new Vector3(1, 0, 0) }
    ])

    sim.setTestParticle({
      position: new Vector3(0, 2, 0),
      velocity: new Vector3(0, 0, 0),
      q: 1e-6,
      m: 2e-3
    })

    // Primera ejecución
    sim.state = 'running'
    for (let i = 0; i < 50; i++) sim.step()
    const finalPos1 = sim.testParticle!.position.clone()
    const trajLen1 = sim.trajectory.length

    // Reinicio
    sim.resetSimulation()
    expect(sim.testParticle!.position.x).toBe(0)
    expect(sim.testParticle!.position.y).toBe(2)

    // Segunda ejecución
    sim.state = 'running'
    for (let i = 0; i < 50; i++) sim.step()
    const finalPos2 = sim.testParticle!.position.clone()
    const trajLen2 = sim.trajectory.length

    expect(finalPos1.x).toBeCloseTo(finalPos2.x, 10)
    expect(finalPos1.y).toBeCloseTo(finalPos2.y, 10)
    expect(trajLen1).toBe(trajLen2)
  })

  it('rechaza más de 10 cargas puntuales', () => {
    const sim = new ElectricSimulation()
    const charges = Array.from({ length: 11 }, (_, i) => ({
      id: `c${i}`,
      q: 1e-6,
      position: new Vector3(i, 0, 0)
    }))

    expect(() => sim.setCharges(charges)).toThrow('El límite máximo es de 10 cargas puntuales.')
  })
})

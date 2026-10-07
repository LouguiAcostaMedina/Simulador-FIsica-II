import { useState, useCallback, useRef, useEffect } from 'react'
import { Charge, TestParticle } from '../domain/Charge'
import { ElectricSimulation } from '../application/ElectricSimulation'
import { Vector3 } from '../../../shared/domain/Vector3'

export function useElectricSimulation() {
  const [simulation] = useState(() => new ElectricSimulation())
  const [charges, setCharges] = useState<Charge[]>([])
  const [testParticle, setTestParticle] = useState<TestParticle | null>(null)
  const [state, setState] = useState(simulation.state)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [trajectory, setTrajectory] = useState<Vector3[]>([])
  const [time, setTime] = useState(0)

  const reqRef = useRef<number>()

  const updateReactState = useCallback(() => {
    setState(simulation.state)
    setErrorMsg(simulation.errorMsg)
    setTime(simulation.time)
    setTrajectory([...simulation.trajectory]) // force re-render with new ref if needed, or handle in 3D efficiently
  }, [simulation])

  useEffect(() => {
    if (state === 'running') {
      const loop = () => {
        // Ejecutar varios pasos físicos por cuadro para acelerar visualmente si es necesario
        for(let i=0; i<10; i++) simulation.step()
        updateReactState()
        if (simulation.state === 'running') {
          reqRef.current = requestAnimationFrame(loop)
        }
      }
      reqRef.current = requestAnimationFrame(loop)
    }
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
    }
  }, [state, simulation, updateReactState])

  const addCharge = (c: Charge) => {
    const newCharges = [...charges, c]
    try {
      simulation.setCharges(newCharges)
      setCharges(newCharges)
      updateReactState()
    } catch (e: any) {
      setErrorMsg(e.message)
    }
  }

  const updateCharge = (id: string, newQ: number, newPos: Vector3) => {
    const newCharges = charges.map(c => c.id === id ? { ...c, q: newQ, position: newPos } : c)
    simulation.setCharges(newCharges)
    setCharges(newCharges)
    updateReactState()
  }

  const removeCharge = (id: string) => {
    const newCharges = charges.filter(c => c.id !== id)
    simulation.setCharges(newCharges)
    setCharges(newCharges)
    updateReactState()
  }

  const setupTestParticle = (p: TestParticle) => {
    simulation.setTestParticle(p)
    setTestParticle(p)
    updateReactState()
  }

  const play = () => {
    if (simulation.state === 'ready' || simulation.state === 'paused') {
      simulation.state = 'running'
      updateReactState()
    }
  }

  const pause = () => {
    if (simulation.state === 'running') {
      simulation.state = 'paused'
      updateReactState()
    }
  }

  const reset = () => {
    simulation.resetSimulation()
    updateReactState()
  }

  return {
    charges,
    testParticle,
    state,
    errorMsg,
    trajectory,
    time,
    addCharge,
    updateCharge,
    removeCharge,
    setupTestParticle,
    play,
    pause,
    reset,
    setErrorMsg
  }
}

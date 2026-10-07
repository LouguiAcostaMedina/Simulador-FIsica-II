import { useState, useMemo } from 'react'
import { CapacitorState, CapacitorMath, CapacitorMetrics } from '../domain/CapacitorMath'

export function useCapacitorSimulation() {
  const [state, setState] = useState<CapacitorState>({
    A: 0.01, // 100 cm^2
    d: 0.01, // 1 cm
    er: 1, // Vacío
    mode: 'fixed_V',
    sourceValue: 12 // 12V
  })
  
  // Guardamos el estado original para comparar
  const [originalState, setOriginalState] = useState<CapacitorState | null>(null)

  const metrics = useMemo(() => {
    try {
      if (state.A <= 0 || state.d <= 0 || state.er < 1) return null
      return CapacitorMath.evaluate(state)
    } catch {
      return null
    }
  }, [state])
  
  const originalMetrics = useMemo(() => {
    try {
      if (!originalState || originalState.A <= 0 || originalState.d <= 0 || originalState.er < 1) return null
      return CapacitorMath.evaluate(originalState)
    } catch {
      return null
    }
  }, [originalState])

  const setParam = (key: keyof CapacitorState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }))
  }
  
  const setBaseLine = () => {
    setOriginalState({ ...state })
  }

  const clearBaseLine = () => {
    setOriginalState(null)
  }

  return {
    state,
    metrics,
    originalMetrics,
    setParam,
    setBaseLine,
    clearBaseLine
  }
}

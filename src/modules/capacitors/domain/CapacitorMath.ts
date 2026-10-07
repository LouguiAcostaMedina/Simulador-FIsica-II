import { Constants } from '../../../shared/domain/constants'

export interface CapacitorState {
  A: number // m^2
  d: number // m
  er: number // permitividad relativa
  mode: 'fixed_V' | 'fixed_Q'
  sourceValue: number // V si fixed_V, Q si fixed_Q
}

export interface CapacitorMetrics {
  C: number // F
  Q: number // C
  V: number // V
  E: number // V/m
  U: number // J
}

export class CapacitorMath {
  static evaluate(state: CapacitorState): CapacitorMetrics {
    const C = (Constants.epsilon0 * state.er * state.A) / state.d
    
    let Q = 0
    let V = 0
    
    if (state.mode === 'fixed_V') {
      V = state.sourceValue
      Q = C * V
    } else {
      Q = state.sourceValue
      V = Q / C
    }
    
    const E = V / state.d
    const U = 0.5 * C * V * V
    
    return { C, Q, V, E, U }
  }
}

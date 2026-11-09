import { Constants } from '../../../shared/domain/constants'

export interface CapacitorState {
  A: number // m^2
  d: number // m
  er: number // permitividad relativa
  mode: 'fixed_V' | 'fixed_Q'
  sourceValue: number // V si fixed_V, Q si fixed_Q
  insertionFraction?: number // Fracción de inserción del dieléctrico entre 0 y 1 (por defecto 1)
}

export interface CapacitorMetrics {
  C: number // F
  Q: number // C
  V: number // V
  E: number // V/m
  U: number // J
  cVacuum: number // F (Capacitancia sin dieléctrico)
  insertionFraction: number // Fracción efectiva de inserción
  slabForce: number // N (Fuerza electrostática que tira del dieléctrico)
}

export interface DielectricMaterial {
  name: string
  er: number
  dielectricStrength: number // MV/m (Rigidez dieléctrica de ruptura)
}

export const STANDARD_DIELECTRICS: DielectricMaterial[] = [
  { name: 'Vacío / Aire', er: 1.0, dielectricStrength: 3.0 },
  { name: 'Papel Parafinado', er: 3.5, dielectricStrength: 16.0 },
  { name: 'Vidrio Pyrex', er: 4.7, dielectricStrength: 14.0 },
  { name: 'Mica', er: 5.4, dielectricStrength: 118.0 },
  { name: 'Titanato de Bario', er: 1200.0, dielectricStrength: 6.0 }
]

export class CapacitorMath {
  static evaluate(state: CapacitorState): CapacitorMetrics {
    if (state.A <= 0) {
      throw new Error('El área de las placas debe ser estrictamente positiva (A > 0).')
    }
    if (state.d <= 0) {
      throw new Error('La separación entre placas debe ser estrictamente positiva (d > 0).')
    }
    if (state.er < 1) {
      throw new Error('La permitividad relativa debe ser al menos 1 (vacío).')
    }

    const f = typeof state.insertionFraction === 'number'
      ? Math.max(0, Math.min(1, state.insertionFraction))
      : 1.0

    // Capacitancia en vacío base
    const cVacuum = (Constants.epsilon0 * state.A) / state.d

    // Modelo de capacitores en paralelo por fracción de área (Sears-Zemansky Cap. 24)
    // C_eq = C_vacio*(1 - f) + C_dielectrico*f = C_vacio * [ 1 + (er - 1)*f ]
    const C = cVacuum * (1 + (state.er - 1) * f)

    let Q = 0
    let V = 0

    if (state.mode === 'fixed_V') {
      V = state.sourceValue
      Q = C * V
    } else {
      Q = state.sourceValue
      V = C > 0 ? Q / C : 0
    }

    const E = V / state.d
    const U = 0.5 * C * V * V

    // Fuerza electrostática sobre la lámina dieléctrica (asumiendo placas cuadradas con ancho W = sqrt(A))
    // F = 1/2 * (er - 1) * eps0 * W * V^2 / d
    const W = Math.sqrt(state.A)
    const slabForce = 0.5 * (state.er - 1) * Constants.epsilon0 * W * (V * V) / state.d

    return {
      C,
      Q,
      V,
      E,
      U,
      cVacuum,
      insertionFraction: f,
      slabForce
    }
  }
}

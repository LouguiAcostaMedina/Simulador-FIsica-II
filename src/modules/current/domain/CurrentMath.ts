export const CONSTANTS = {
  e: 1.602e-19, // Carga elemental
}

export class CurrentMath {
  // Corriente I = dQ/dt
  static evaluateCurrent(dQ: number, dt: number): number {
    if (dt <= 0) throw new Error("dt debe ser mayor a 0");
    return dQ / dt;
  }

  // Densidad de corriente J = I / A
  static evaluateCurrentDensity(I: number, A: number): number {
    if (A <= 0) throw new Error("El área debe ser mayor a 0");
    return I / A;
  }

  // Velocidad de deriva vd = I / (n * e * A)
  static evaluateDriftVelocity(I: number, n: number, A: number): number {
    if (A <= 0 || n <= 0) throw new Error("A y n deben ser mayores a 0");
    return I / (n * CONSTANTS.e * A);
  }

  // Resistencia R = rho * L / A
  static evaluateResistance(rho: number, L: number, A: number): number {
    if (A <= 0 || L <= 0 || rho <= 0) throw new Error("rho, L y A deben ser mayores a 0");
    return (rho * L) / A;
  }

  // Ley de Ohm V = I * R
  static evaluateVoltage(I: number, R: number): number {
    return I * R;
  }

  // Potencia P = V * I
  static evaluatePower(V: number, I: number): number {
    return V * I;
  }
}

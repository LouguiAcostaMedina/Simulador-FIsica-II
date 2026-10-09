import { describe, it, expect } from 'vitest'
import { MagnetismMath, CONSTANTS } from './MagnetismMath'
import { Vector3 } from '../../../shared/domain/Vector3'

describe('MagnetismMath', () => {
  it('calculates wire B field direction correctly', () => {
    // Wire along Z axis, current = 1A
    const I = 1;
    const wireDir = new Vector3(0, 0, 1);
    const wirePoint = new Vector3(0, 0, 0);
    const evalPoint = new Vector3(1, 0, 0); // Point at x=1
    
    const B = MagnetismMath.evaluateWireBField(I, wireDir, wirePoint, evalPoint);
    
    // Wire along Z, point at X, r_vec = (1, 0, 0)
    // dir x r_vec = (0, 0, 1) x (1, 0, 0) = (0, 1, 0) -> +Y direction
    expect(B.x).toBeCloseTo(0, 10);
    expect(B.y).toBeGreaterThan(0);
    expect(B.z).toBeCloseTo(0, 10);
    
    const mag = (CONSTANTS.mu0 * 1) / (2 * Math.PI * 1);
    expect(B.y).toBeCloseTo(mag, 15);
  })

  it('calculates Lorentz force', () => {
    const q = 1; // 1 C
    const E = new Vector3(10, 0, 0); // E in X
    const v = new Vector3(0, 10, 0); // v in Y
    const B = new Vector3(0, 0, 1);  // B in Z
    
    // v x B = (0, 10, 0) x (0, 0, 1) = (10, 0, 0)
    // F = q * (E + v x B) = 1 * ((10,0,0) + (10,0,0)) = (20, 0, 0)
    
    const F = MagnetismMath.evaluateLorentzForce(q, E, v, B);
    expect(F.x).toBeCloseTo(20, 10);
    expect(F.y).toBeCloseTo(0, 10);
    expect(F.z).toBeCloseTo(0, 10);
  })
})

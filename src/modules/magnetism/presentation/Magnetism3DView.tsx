import React, { useMemo, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Cylinder, Sphere, Line } from '@react-three/drei'
import { Vector3 } from '../../../shared/domain/Vector3'
import { MagnetismMath } from '../domain/MagnetismMath'

interface Props {
  mode: 'wire' | 'dipole'
  I: number // Current
  BExt: Vector3 // External B Field (for Lorentz)
  EExt: Vector3 // External E Field (for Lorentz)
  showLorentz: boolean
  q: number
  v0: Vector3
}

export function Magnetism3DView({ mode, I, BExt, EExt, showLorentz, q, v0 }: Props) {
  const [particlePos, setParticlePos] = useState(new Vector3(2, 0, 0))
  const [particleVel, setParticleVel] = useState(v0)
  const [trajectory, setTrajectory] = useState<Vector3[]>([new Vector3(2, 0, 0)])

  // Reset particle when conditions change
  useEffect(() => {
    setParticlePos(new Vector3(2, 0, 0));
    setParticleVel(v0);
    setTrajectory([new Vector3(2, 0, 0)]);
  }, [mode, I, BExt, EExt, showLorentz, q, v0]);

  useEffect(() => {
    if (!showLorentz) return;
    
    let frame: number;
    let lastTime = performance.now();
    
    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05); // cap dt
      lastTime = time;
      
      setParticlePos(prevPos => {
        setParticleVel(prevVel => {
          // B at current position
          let BLocal = BExt;
          if (mode === 'wire') {
            try {
              const Bw = MagnetismMath.evaluateWireBField(I, new Vector3(0,1,0), new Vector3(0,0,0), prevPos);
              BLocal = BLocal.add(Bw);
            } catch (e) {}
          } else if (mode === 'dipole') {
            try {
              const m = new Vector3(0, I * 0.1, 0); // Approximation
              const Bd = MagnetismMath.evaluateDipoleBField(m, new Vector3(0,0,0), prevPos);
              BLocal = BLocal.add(Bd);
            } catch (e) {}
          }
          
          const F = MagnetismMath.evaluateLorentzForce(q, EExt, prevVel, BLocal);
          const mass = 1; // Assuming m=1 for simplicity
          const a = F.multiply(1 / mass);
          
          const newVel = prevVel.add(a.multiply(dt));
          const newPos = prevPos.add(newVel.multiply(dt));
          
          setTrajectory(prev => {
            const next = [...prev, newPos];
            if (next.length > 200) next.shift(); // limit trajectory length
            return next;
          });
          
          return newVel;
        });
        return particlePos; // Value doesn't matter since it's updated in tandem
      });
      
      frame = requestAnimationFrame(loop);
    };
    
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [showLorentz, mode, I, BExt, EExt, q]);

  const points = useMemo(() => {
    return trajectory.map(p => [p.x, p.y, p.z] as [number, number, number])
  }, [trajectory])

  // Field lines rings for wire
  const wireRings = useMemo(() => {
    if (mode !== 'wire') return null;
    const rings = [];
    for (let r = 1; r <= 3; r++) {
      const pts = [];
      for (let theta = 0; theta <= Math.PI * 2; theta += 0.2) {
        pts.push([Math.cos(theta) * r, 0, Math.sin(theta) * r] as [number, number, number]);
      }
      rings.push(pts);
    }
    return rings;
  }, [mode]);

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls />
      
      {mode === 'wire' && (
        <group>
          <Cylinder args={[0.05, 0.05, 10, 16]} position={[0,0,0]}>
            <meshStandardMaterial color="#8892b0" />
          </Cylinder>
          {wireRings?.map((pts, i) => (
             <Line key={i} points={pts} color="#42D7C8" lineWidth={1} />
          ))}
        </group>
      )}

      {mode === 'dipole' && (
        <group>
          <Sphere args={[0.2, 16, 16]}>
            <meshStandardMaterial color="#F5A66A" />
          </Sphere>
          <Sphere args={[0.2, 16, 16]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color="#B69BE8" />
          </Sphere>
        </group>
      )}

      {showLorentz && (
         <group>
           <Sphere args={[0.1, 16, 16]} position={[particlePos.x, particlePos.y, particlePos.z]}>
             <meshStandardMaterial color={q > 0 ? '#F27C77' : '#B69BE8'} />
           </Sphere>
           {points.length > 1 && <Line points={points} color="#F5A66A" lineWidth={2} />}
         </group>
      )}

      <gridHelper args={[20, 20, '#42D7C8', '#1C2930']} position={[0,-2,0]} />
    </Canvas>
  )
}

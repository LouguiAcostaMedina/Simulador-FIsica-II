import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Cylinder, Sphere, Line } from '@react-three/drei'
import { Vector3 } from '../../../shared/domain/Vector3'
import { MagnetismMath } from '../domain/MagnetismMath'

function LorentzParticle({ mode, I, BExt, EExt, showLorentz, q, v0, particlePosRef, trajectory, setTrajectory }: any) {
  const velRef = useRef(v0);

  useEffect(() => {
    particlePosRef.current = new Vector3(2, 0, 0);
    velRef.current = v0;
    setTrajectory([new Vector3(2, 0, 0)]);
  }, [mode, I, BExt, EExt, showLorentz, q, v0]);

  useFrame((state, delta) => {
    if (!showLorentz) return;
    const dt = Math.min(delta, 0.05); // cap dt
    
    let BLocal = BExt;
    if (mode === 'wire') {
      try {
        BLocal = BLocal.add(MagnetismMath.evaluateWireBField(I, new Vector3(0,1,0), new Vector3(0,0,0), particlePosRef.current));
      } catch (e) {}
    } else if (mode === 'dipole') {
      try {
        BLocal = BLocal.add(MagnetismMath.evaluateDipoleBField(new Vector3(0, I * 0.1, 0), new Vector3(0,0,0), particlePosRef.current));
      } catch (e) {}
    }
    
    const F = MagnetismMath.evaluateLorentzForce(q, EExt, velRef.current, BLocal);
    const mass = 1; 
    const a = F.multiply(1 / mass);
    
    velRef.current = velRef.current.add(a.multiply(dt));
    particlePosRef.current = particlePosRef.current.add(velRef.current.multiply(dt));
    
    // Solo actualiza la UI de React de la trayectoria de a ratos para evitar lag,
    // pero actualiza la posición del mesh directamente aquí para suavidad
    if (state.clock.elapsedTime * 60 % 2 < 1) {
       setTrajectory((prev: Vector3[]) => {
          const next = [...prev, particlePosRef.current];
          if (next.length > 200) next.shift();
          return next;
       });
    }
  });

  return (
     <Sphere args={[0.1, 16, 16]} position={[particlePosRef.current.x, particlePosRef.current.y, particlePosRef.current.z]}>
       <meshStandardMaterial color={q > 0 ? '#F27C77' : '#B69BE8'} />
     </Sphere>
  );
}

interface Props {
  mode: 'wire' | 'dipole'
  I: number // Current
  BExt: Vector3 // External B Field (for Lorentz)
  EExt: Vector3 // External E Field (for Lorentz)
  showLorentz: boolean
  q: number
  v0: Vector3
  onContextLost?: () => void
}

export function Magnetism3DView({ mode, I, BExt, EExt, showLorentz, q, v0, onContextLost }: Props) {
  const particlePosRef = useRef(new Vector3(2, 0, 0))
  const [trajectory, setTrajectory] = useState<Vector3[]>([new Vector3(2, 0, 0)])

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

  // Calculated Field lines for dipole
  const dipoleLines = useMemo(() => {
    if (mode !== 'dipole') return null;
    const lines = [];
    const m = new Vector3(0, I * 0.1, 0); // Using the same approximation
    
    // Generamos varias líneas desde el hemisferio superior
    for (let theta = 0.2; theta <= Math.PI / 2 - 0.2; theta += 0.3) {
      for (let phi = 0; phi < Math.PI * 2; phi += Math.PI / 2) {
         let r = 0.3; // starting radius
         let pos = new Vector3(
           r * Math.sin(theta) * Math.cos(phi),
           r * Math.cos(theta),
           r * Math.sin(theta) * Math.sin(phi)
         );
         
         const pts = [];
         let outOfBounds = false;
         for (let step = 0; step < 200; step++) {
           pts.push([pos.x, pos.y, pos.z] as [number, number, number]);
           try {
             const B = MagnetismMath.evaluateDipoleBField(m, new Vector3(0,0,0), pos);
             const mag = B.length();
             if (mag < 1e-10) break;
             const dir = B.multiplyScalar(1 / mag);
             // paso proporcional al campo para más precisión cerca del origen, pero acotado
             const ds = 0.05; 
             pos = pos.add(dir.multiplyScalar(ds));
             
             // Si volvió cerca del origen en el hemisferio sur, terminar
             if (pos.y < 0 && pos.length() < 0.35) {
                pts.push([pos.x, pos.y, pos.z] as [number, number, number]);
                break;
             }
             if (pos.length() > 10) {
                outOfBounds = true;
                break; // Muy lejos
             }
           } catch {
             break;
           }
         }
         if (!outOfBounds && pts.length > 5) {
            lines.push(pts);
         }
      }
    }
    return lines;
  }, [mode, I]);

  return (
    <Canvas 
      camera={{ position: [5, 5, 5], fov: 50 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          onContextLost?.();
        });
      }}
    >
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
          {dipoleLines?.map((pts, i) => (
             <Line key={i} points={pts} color="#42D7C8" lineWidth={1.5} opacity={0.6} transparent />
          ))}
        </group>
      )}

      {showLorentz && (
         <group>
           <LorentzParticle 
              mode={mode} I={I} BExt={BExt} EExt={EExt} showLorentz={showLorentz} q={q} v0={v0}
              particlePosRef={particlePosRef} trajectory={trajectory} setTrajectory={setTrajectory}
           />
           {points.length > 1 && <Line points={points} color="#F5A66A" lineWidth={2} />}
         </group>
      )}

      <gridHelper args={[20, 20, '#42D7C8', '#1C2930']} position={[0,-2,0]} />
    </Canvas>
  )
}

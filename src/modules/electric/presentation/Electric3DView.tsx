import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, Line, MarchingCubes, MarchingCube } from '@react-three/drei'
import { Color } from 'three'
import { Charge, TestParticle } from '../domain/Charge'
import { Vector3 } from '../../../shared/domain/Vector3'

interface Props {
  charges: Charge[]
  testParticle: TestParticle | null
  trajectory: Vector3[]
  onContextLost?: () => void
}

export function Electric3DView({ charges, testParticle, trajectory, onContextLost }: Props) {
  // Convertimos trajectory a arreglo de puntos para el Line de drei
  const points = useMemo(() => {
    return trajectory.map(p => [p.x, p.y, p.z] as [number, number, number])
  }, [trajectory])

  return (
    <Canvas 
      camera={{ position: [0, 0, 10], fov: 50 }}
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
      
      {/* Visualización volumétrica de proximidad a las cargas (Metaballs cualitativas, NO son superficies equipotenciales exactas) */}
      {charges.length > 0 && (
        <MarchingCubes resolution={40} maxPolyCount={20000} enableUvs={false} enableColors={true}>
          <meshPhysicalMaterial transmission={0.6} opacity={1} transparent roughness={0.1} />
          {charges.map(c => (
            <MarchingCube 
              key={`mc-${c.id}`} 
              strength={Math.abs(c.q) * 1e6 * 0.5} // Escalado cualitativo
              subtract={10} 
              color={new Color(c.q > 0 ? '#F27C77' : '#B69BE8')} 
              position={[c.position.x, c.position.y, c.position.z]} 
            />
          ))}
        </MarchingCubes>
      )}

      {/* Cargas */}
      {charges.map(c => (
        <Sphere key={c.id} args={[0.2, 32, 32]} position={[c.position.x, c.position.y, c.position.z]}>
          <meshStandardMaterial color={c.q > 0 ? '#F27C77' : '#B69BE8'} />
        </Sphere>
      ))}

      {/* Test Particle */}
      {testParticle && (
        <Sphere args={[0.1, 16, 16]} position={[testParticle.position.x, testParticle.position.y, testParticle.position.z]}>
          <meshStandardMaterial color="#F5A66A" />
        </Sphere>
      )}

      {/* Trajectory */}
      {points.length > 1 && (
        <Line points={points} color="#F5A66A" lineWidth={2} />
      )}
      
      {/* Grid Helpers */}
      <gridHelper args={[20, 20, '#42D7C8', '#1C2930']} rotation={[Math.PI / 2, 0, 0]} position={[0,0,-1]} />
    </Canvas>
  )
}

import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Html } from '@react-three/drei'
import { CapacitorState, CapacitorMetrics } from '../domain/CapacitorMath'

interface Props {
  state: CapacitorState
  metrics: CapacitorMetrics
}

export function Capacitor3DView({ state, metrics }: Props) {
  // Calculamos dimensiones proporcionales a escala visual
  // A = área. L = sqrt(A)
  const L = Math.sqrt(state.A) * 10 // Escala de visualización
  const d_visual = state.d * 100 // Escala de separación para que sea visible

  const colorPlaca = '#8892b0'
  const colorDielectrico = state.er > 1 ? 'rgba(66, 215, 200, 0.4)' : 'transparent'

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls />

      <group>
        {/* Placa superior (+) */}
        <Box args={[L, 0.1, L]} position={[0, d_visual / 2, 0]}>
          <meshStandardMaterial color={colorPlaca} metalness={0.8} roughness={0.2} />
          <Html position={[L/2, 0.2, L/2]} center>
            <div style={{color: '#F27C77', fontWeight: 'bold'}}>+Q</div>
          </Html>
        </Box>

        {/* Dieléctrico (si aplica) */}
        {state.er > 1 && (
           <Box args={[L, d_visual, L]} position={[0, 0, 0]}>
              <meshPhysicalMaterial color="#42D7C8" transmission={0.9} opacity={1} transparent roughness={0.1} />
           </Box>
        )}

        {/* Placa inferior (-) */}
        <Box args={[L, 0.1, L]} position={[0, -d_visual / 2, 0]}>
          <meshStandardMaterial color={colorPlaca} metalness={0.8} roughness={0.2} />
          <Html position={[L/2, -0.2, L/2]} center>
            <div style={{color: '#B69BE8', fontWeight: 'bold'}}>-Q</div>
          </Html>
        </Box>

        {/* E field visualizador (idealizado) */}
        {/* Si hay voltaje/carga, podemos mostrar algunas flechas, por ahora dejaremos el esquema base. */}
      </group>
    </Canvas>
  )
}

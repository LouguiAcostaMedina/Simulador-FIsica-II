import { Link } from 'react-router-dom'
import './Placeholder.css'

export default function CurrentModule() {
  return (
    <div className="placeholder-container">
      <header className="placeholder-header">
        <h1>Unidad 3: Corriente y Ley de Ohm</h1>
        <div className="status-badge upcoming">Próximamente</div>
      </header>
      
      <main className="placeholder-content">
        <p>
          Este módulo está planificado para el siguiente hito (P3).
        </p>
        <div className="features-list">
          <h3>Funcionalidades preparadas para la arquitectura:</h3>
          <ul>
            <li>Cálculo de corriente, carga y tiempo (I = ΔQ/Δt)</li>
            <li>Densidad y velocidad de deriva (J = I/A, v_d = I/(n|q|A))</li>
            <li>Resistividad y resistencia geométrica (R = ρL/A)</li>
            <li>Ley de Ohm y potencia (V = IR, P = VI)</li>
            <li>Circuitos resistivos serie/paralelo y mixtos válidos</li>
          </ul>
        </div>
        
        <Link to="/" className="back-link">
          ← Volver al Hub Principal
        </Link>
      </main>
    </div>
  )
}

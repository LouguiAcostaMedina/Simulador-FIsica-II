import { Link } from 'react-router-dom'
import '../current/Placeholder.css'

export default function MagnetismModule() {
  return (
    <div className="placeholder-container">
      <header className="placeholder-header">
        <h1>Unidad 4: Fuerza y Campo Magnético</h1>
        <div className="status-badge upcoming">Próximamente</div>
      </header>
      
      <main className="placeholder-content">
        <p>
          Este módulo está planificado para el siguiente hito (P4).
        </p>
        <div className="features-list">
          <h3>Funcionalidades preparadas para la arquitectura:</h3>
          <ul>
            <li>Campo de conductor rectilíneo largo ideal (B = μ₀I/(2πr))</li>
            <li>Aproximación de dipolo magnético</li>
            <li>Fuerza de Lorentz (F = q(E + v×B))</li>
            <li>Trayectoria de carga bajo campos E y B combinados</li>
          </ul>
        </div>
        
        <Link to="/" className="back-link">
          ← Volver al Hub Principal
        </Link>
      </main>
    </div>
  )
}

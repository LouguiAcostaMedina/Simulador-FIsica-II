import { Link } from 'react-router-dom'
import './Hub.css'

export default function Hub() {
  return (
    <div className="hub-container">
      <header className="hub-header">
        <h1>Laboratorio Vectorial</h1>
        <p>Simulador interactivo de Física II</p>
      </header>
      
      <main className="hub-grid">
        <Link to="/electric" className="module-card">
          <h2>U1: Campo y Potencial Eléctrico</h2>
          <p>Superposición, líneas de campo, equipotenciales y trayectorias de partículas.</p>
          <div className="status-badge available">Disponible</div>
        </Link>
        
        <Link to="/capacitors" className="module-card">
          <h2>U2: Capacitores y Dieléctricos</h2>
          <p>Placas paralelas, energía, materiales dieléctricos y efectos de conexión.</p>
          <div className="status-badge available">Disponible</div>
        </Link>

        <div className="module-card disabled">
          <h2>U3: Corriente y Ley de Ohm</h2>
          <p>Densidad, velocidad de deriva, resistencia y circuitos básicos.</p>
          <div className="status-badge upcoming">Próximamente</div>
          <Link to="/current" className="preview-link">Ver ruta preparada</Link>
        </div>

        <div className="module-card disabled">
          <h2>U4: Fuerza y Campo Magnético</h2>
          <p>Fuerza de Lorentz, conductores rectilíneos y trayectorias bajo E y B.</p>
          <div className="status-badge upcoming">Próximamente</div>
          <Link to="/magnetism" className="preview-link">Ver ruta preparada</Link>
        </div>
      </main>
      
      <footer className="hub-footer">
        <p>Desarrollado para Ingeniería de Sistemas. Selecciona una unidad para comenzar la simulación.</p>
      </footer>
    </div>
  )
}

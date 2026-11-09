import { Link } from 'react-router-dom'
import './Hub.css'

interface UnitCardData {
  id: string
  route: string
  title: string
  subtitle: string
  description: string
  formula: string
  badgeText: string
  status: 'operativo' | 'destacado'
  svgIcon: React.ReactNode
  topics: string[]
}

const UNITS: UnitCardData[] = [
  {
    id: 'U1',
    route: '/electric',
    title: 'Campo y Potencial Eléctrico',
    subtitle: 'Electrostática & Superposición',
    description: 'Calcula y visualiza campos creados por hasta 10 cargas puntuales en 2D/3D, curvas equipotenciales y simula trayectorias de partículas de prueba.',
    formula: 'E = k Σ [qᵢ(r-rᵢ)/|r-rᵢ|³] · V = k Σ [qᵢ/|r-rᵢ|]',
    badgeText: 'Operativo · 2D/3D',
    status: 'operativo',
    topics: ['Ley de Coulomb', 'Superposición', 'Marching Squares', 'Carga de prueba'],
    svgIcon: (
      <svg viewBox="0 0 80 80" className="unit-card-illustration" aria-hidden="true">
        <circle cx="26" cy="40" r="12" fill="#F5A66A" opacity="0.85" />
        <text x="26" y="44" fill="#111A20" fontSize="14" fontWeight="bold" textAnchor="middle">+q</text>
        <circle cx="54" cy="40" r="12" fill="#5C9CE6" opacity="0.85" />
        <text x="54" y="44" fill="#111A20" fontSize="14" fontWeight="bold" textAnchor="middle">-q</text>
        {/* Líneas de campo que unen las cargas */}
        <path d="M 38 40 Q 40 32 42 40" stroke="#42D7C8" strokeWidth="1.5" fill="none" />
        <path d="M 26 28 Q 40 16 54 28" stroke="#42D7C8" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
        <path d="M 26 52 Q 40 64 54 52" stroke="#42D7C8" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
      </svg>
    )
  },
  {
    id: 'U2',
    route: '/capacitors',
    title: 'Capacitores y Dieléctricos',
    subtitle: 'Almacenamiento de Carga & Energía',
    description: 'Modela placas paralelas en 3D variando área, distancia y permitividad. Analiza modos con batería fija (V constante) o desconectada (Q constante).',
    formula: 'C = ε₀ εᵣ A / d · U = ½ C V² = Q² / (2C)',
    badgeText: 'Operativo · 3D/2D Fallback',
    status: 'operativo',
    topics: ['Placas paralelas', 'Material dieléctrico', 'Voltaje vs Carga fija', 'Balance U'],
    svgIcon: (
      <svg viewBox="0 0 80 80" className="unit-card-illustration" aria-hidden="true">
        {/* Placa superior */}
        <rect x="20" y="24" width="40" height="6" rx="2" fill="#F5A66A" opacity="0.9" />
        {/* Placa inferior */}
        <rect x="20" y="50" width="40" height="6" rx="2" fill="#5C9CE6" opacity="0.9" />
        {/* Dieléctrico intermedio */}
        <rect x="24" y="32" width="32" height="16" rx="1" fill="#B69BE8" opacity="0.5" stroke="#B69BE8" strokeWidth="1" strokeDasharray="2 2" />
        <text x="40" y="44" fill="#F4F0E8" fontSize="10" fontWeight="bold" textAnchor="middle">εᵣ</text>
        {/* Flechas de campo E */}
        <line x1="30" y1="30" x2="30" y2="50" stroke="#42D7C8" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <line x1="50" y1="30" x2="50" y2="50" stroke="#42D7C8" strokeWidth="1.5" markerEnd="url(#arrow)" />
      </svg>
    )
  },
  {
    id: 'U3',
    route: '/current',
    title: 'Corriente, Ley de Ohm y Circuitos',
    subtitle: 'Redes DC & Laboratorio de Cableado',
    description: 'Arma circuitos libres en serie, paralelo o mixtos arrastrando fuentes, resistencias, bombillas e interruptores. Resuelto por Análisis Nodal Modificado (MNA).',
    formula: 'V = I · R · P = V · I · MNA Solver DC · τ = RC',
    badgeText: 'Destacado · MNA Solver',
    status: 'destacado',
    topics: ['MNA Solver DC', 'Cableado visual libre', 'Interruptor & Bombilla', 'Transitorio RC'],
    svgIcon: (
      <svg viewBox="0 0 80 80" className="unit-card-illustration" aria-hidden="true">
        {/* Circuito esquemático */}
        <rect x="18" y="20" width="44" height="40" rx="4" fill="none" stroke="#42D7C8" strokeWidth="2" />
        {/* Batería en lado izquierdo */}
        <rect x="14" y="34" width="8" height="12" fill="#111A20" />
        <line x1="15" y1="36" x2="21" y2="36" stroke="#F5A66A" strokeWidth="2.5" />
        <line x1="17" y1="44" x2="19" y2="44" stroke="#F5A66A" strokeWidth="1.5" />
        {/* Resistencia arriba */}
        <rect x="32" y="16" width="16" height="8" fill="#1C2930" stroke="#F5A66A" strokeWidth="1.5" />
        {/* Bombilla abajo */}
        <circle cx="40" cy="60" r="6" fill="#1C2930" stroke="#ECC94B" strokeWidth="1.5" />
        <path d="M 36 56 L 44 64 M 44 56 L 36 64" stroke="#ECC94B" strokeWidth="1" />
      </svg>
    )
  },
  {
    id: 'U4',
    route: '/magnetism',
    title: 'Fuerza y Campo Magnético',
    subtitle: 'Biot-Savart & Dinámica de Lorentz',
    description: 'Visualiza el campo magnético de conductores rectilíneos y dipolos magnéticos. Simula el movimiento de cargas bajo campos E y B cruzados con integrador Boris.',
    formula: 'B = μ₀ I / (2π r) · F = q (E + v × B) · Boris Pusher',
    badgeText: 'Operativo · 3D/2D Fallback',
    status: 'operativo',
    topics: ['Hilo rectilíneo', 'Dipolo magnético', 'Fuerza de Lorentz', 'Conservación rapidez'],
    svgIcon: (
      <svg viewBox="0 0 80 80" className="unit-card-illustration" aria-hidden="true">
        {/* Conductor vertical con corriente */}
        <line x1="40" y1="12" x2="40" y2="68" stroke="#F5A66A" strokeWidth="3" />
        <polygon points="40,12 37,18 43,18" fill="#F5A66A" />
        <text x="48" y="20" fill="#F5A66A" fontSize="10" fontWeight="bold">I</text>
        {/* Anillos concéntricos de campo B */}
        <ellipse cx="40" cy="40" rx="24" ry="12" fill="none" stroke="#B69BE8" strokeWidth="1.5" strokeDasharray="3 2" />
        <ellipse cx="40" cy="40" rx="14" ry="7" fill="none" stroke="#B69BE8" strokeWidth="1.5" />
        {/* Partícula en órbita */}
        <circle cx="58" cy="45" r="3.5" fill="#42D7C8" />
      </svg>
    )
  }
]

export default function Hub() {
  return (
    <div className="hub-page">
      {/* 1. Hero Section Científico */}
      <header className="hub-hero">
        <div className="hub-hero-badge">
          <span className="hero-badge-pulse" />
          Física II · Ingeniería de Sistemas
        </div>
        <h1 className="hub-hero-title">Laboratorio Vectorial</h1>
        <p className="hub-hero-description">
          Plataforma interactiva de experimentación científica y simulación en tiempo real.
          Visualiza campos electrostáticos, dieléctricos, redes de circuitos y magnetismo
          con rigor matemático en unidades SI y doble modalidad de aprendizaje.
        </p>

        <div className="hub-system-tags">
          <span className="hub-sys-tag">⚡ Motor TypeScript en Navegador</span>
          <span className="hub-sys-tag">📐 Unidades SI Estrictas</span>
          <span className="hub-sys-tag">🔬 Solver DC MNA Exacto</span>
          <span className="hub-sys-tag">🌐 Visualización 2D / 3D WebGL</span>
        </div>
      </header>

      {/* 2. Grid de las 4 Unidades (todas operativas, sin 'Próximamente') */}
      <main className="hub-units-section" aria-label="Unidades de aprendizaje">
        <div className="hub-section-header">
          <h2>Unidades de Simulación y Laboratorio</h2>
          <p>Selecciona una unidad para ingresar a su modo Simulador o a su mesa de Laboratorio:</p>
        </div>

        <div className="hub-units-grid">
          {UNITS.map(unit => (
            <article key={unit.id} className={`hub-unit-card ${unit.status === 'destacado' ? 'card-highlight' : ''}`}>
              <div className="hub-unit-card-header">
                <div className="hub-unit-tag-group">
                  <span className="hub-unit-id">{unit.id}</span>
                  <span className="hub-unit-status-pill">{unit.badgeText}</span>
                </div>
                <div className="hub-unit-icon-wrapper">{unit.svgIcon}</div>
              </div>

              <div className="hub-unit-card-body">
                <h3 className="hub-unit-title">{unit.title}</h3>
                <span className="hub-unit-subtitle">{unit.subtitle}</span>
                <p className="hub-unit-desc">{unit.description}</p>

                <div className="hub-unit-formula" title="Ecuaciones rectoras del módulo">
                  <code>{unit.formula}</code>
                </div>

                <div className="hub-unit-topics">
                  {unit.topics.map((t, idx) => (
                    <span key={idx} className="hub-topic-chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botones de acción dual: Simulador y Laboratorio */}
              <div className="hub-unit-card-actions">
                <Link
                  to={`${unit.route}?mode=simulator`}
                  className="hub-action-btn btn-simulator"
                  title={`Abrir Simulador paramétrico de ${unit.title}`}
                >
                  <span className="btn-icon">⚡</span>
                  <span>Simulador</span>
                </Link>
                <Link
                  to={`${unit.route}?mode=laboratory`}
                  className="hub-action-btn btn-laboratory"
                  title={`Abrir Laboratorio interactivo de ${unit.title}`}
                >
                  <span className="btn-icon">🔬</span>
                  <span>Laboratorio</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* 3. Recorridos de Aprendizaje Pedagógicos */}
      <section className="hub-pathways-section" aria-label="Recorridos didácticos">
        <div className="hub-section-header">
          <h2>Recorridos de Experimentación Guiada</h2>
          <p>Tres enfoques didácticos adaptados a distintos momentos del estudio:</p>
        </div>

        <div className="hub-pathways-grid">
          <div className="hub-pathway-card">
            <div className="pathway-icon">⚙️</div>
            <h3>1. Análisis Paramétrico</h3>
            <p>
              Modifica magnitudes escalares (voltajes, distancias, permitividades) con sliders
              y observa el impacto numérico instantáneo en capacitancia, potencia o campo resultante.
            </p>
          </div>
          <div className="hub-pathway-card">
            <div className="pathway-icon">🔌</div>
            <h3>2. Construcción Libre</h3>
            <p>
              Coloca componentes y traza conductores en el editor esquemático de U3.
              Verifica cómo responden las mallas y ramas a interruptores abiertos o cortocircuitos.
            </p>
          </div>
          <div className="hub-pathway-card">
            <div className="pathway-icon">📊</div>
            <h3>3. Verificación Analítica</h3>
            <p>
              Contrasta cada lectura con las leyes de Kirchhoff, superposición de Coulomb y balance
              energético antes y después de insertar dieléctricos o abrir ramas.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Guía de Convenciones y Simbología */}
      <section className="hub-conventions-section" aria-label="Guía de simbología">
        <div className="hub-conventions-box">
          <h3>Convenciones Científicas & Código de Colores</h3>
          <div className="hub-conventions-grid">
            <div className="convention-item">
              <span className="color-indicator" style={{ backgroundColor: 'var(--color-accent-copper)' }} />
              <div>
                <strong>Cobre / Ánodo (#F5A66A)</strong>
                <p>Cargas positivas (+q), terminal de mayor potencial, corriente convencional saliente.</p>
              </div>
            </div>
            <div className="convention-item">
              <span className="color-indicator" style={{ backgroundColor: 'var(--color-accent-blue)' }} />
              <div>
                <strong>Azul / Cátodo (#5C9CE6)</strong>
                <p>Cargas negativas (-q), electrones portadores, retorno a fuente de menor potencial.</p>
              </div>
            </div>
            <div className="convention-item">
              <span className="color-indicator" style={{ backgroundColor: 'var(--color-accent-turquoise)' }} />
              <div>
                <strong>Turquesa (#42D7C8)</strong>
                <p>Vectores y líneas de campo eléctrico E, ramas energizadas activas en circuitos.</p>
              </div>
            </div>
            <div className="convention-item">
              <span className="color-indicator" style={{ backgroundColor: 'var(--color-accent-lilac)' }} />
              <div>
                <strong>Lila (#B69BE8)</strong>
                <p>Equipotenciales, potencial escalar V, líneas de campo magnético B e inductores.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer Académico */}
      <footer className="hub-footer" role="contentinfo">
        <div className="hub-footer-content">
          <p className="footer-author">
            <strong>Laboratorio Vectorial v2.0</strong> — Aplicación didáctica de Física II para Ingeniería de Sistemas.
          </p>
          <p className="footer-notes">
            Cálculos realizados en el navegador en unidades estándar del SI. Sin servidores externos ni dependencias de backend.
          </p>
        </div>
      </footer>
    </div>
  )
}

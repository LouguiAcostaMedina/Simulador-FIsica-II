import { useState, useId } from 'react'
import { Link } from 'react-router-dom'
import './LabShell.css'

export type LabMode = 'simulator' | 'laboratory'
export type DimensionMode = '2D' | '3D'

export interface StatusBadgeInfo {
  label: string
  variant: 'idle' | 'running' | 'paused' | 'error' | 'warning' | 'success'
}

export interface LabShellProps {
  unitId: 'U1' | 'U2' | 'U3' | 'U4'
  unitTitle: string
  formulaBadge?: string
  mode: LabMode
  onModeChange: (mode: LabMode) => void
  dimension?: DimensionMode
  onDimensionChange?: (dim: DimensionMode) => void
  statusBadge?: StatusBadgeInfo
  headerActions?: React.ReactNode
  libraryTitle?: string
  libraryContent?: React.ReactNode
  inspectorTitle?: string
  inspectorBadge?: string
  inspectorContent?: React.ReactNode
  bottomTitle?: string
  bottomContent?: React.ReactNode
  helpContent?: React.ReactNode
  children: React.ReactNode
}

export function LabShell({
  unitId,
  unitTitle,
  formulaBadge,
  mode,
  onModeChange,
  dimension,
  onDimensionChange,
  statusBadge,
  headerActions,
  libraryTitle = 'Biblioteca y Presets',
  libraryContent,
  inspectorTitle = 'Inspector Contextual',
  inspectorBadge,
  inspectorContent,
  bottomTitle = 'Mediciones y Gráficas',
  bottomContent,
  helpContent,
  children
}: LabShellProps) {
  const [activeMobileDrawer, setActiveMobileDrawer] = useState<'none' | 'library' | 'inspector' | 'bottom'>('none')
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false)
  const helpDialogId = useId()

  const toggleMobileDrawer = (drawer: 'library' | 'inspector' | 'bottom') => {
    setActiveMobileDrawer(prev => (prev === drawer ? 'none' : drawer))
  }

  return (
    <div className="lab-shell">
      {/* 1. Header Superior */}
      <header className="lab-header" role="banner">
        <div className="lab-header-left">
          <Link to="/" className="lab-back-link" title="Regresar al Hub de unidades">
            <span aria-hidden="true">←</span>
            <span className="lab-back-text">Hub</span>
          </Link>
          <div className="lab-unit-indicator">
            <span className="lab-unit-tag">{unitId}</span>
            <h1 className="lab-unit-heading">{unitTitle}</h1>
            {formulaBadge && (
              <span className="lab-formula-badge" title="Modelo matemático implementado">
                {formulaBadge}
              </span>
            )}
          </div>
        </div>

        <div className="lab-header-center">
          {/* Selector de Modo obligatorio */}
          <div className="lab-mode-switcher" role="tablist" aria-label="Modo de trabajo">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'simulator'}
              className={`lab-mode-tab ${mode === 'simulator' ? 'active' : ''}`}
              onClick={() => onModeChange('simulator')}
            >
              <span className="tab-icon">⚡</span>
              <span>Simulador</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'laboratory'}
              className={`lab-mode-tab ${mode === 'laboratory' ? 'active' : ''}`}
              onClick={() => onModeChange('laboratory')}
            >
              <span className="tab-icon">🔬</span>
              <span>Laboratorio</span>
            </button>
          </div>

          {/* Conmutador 2D / 3D cuando aplique */}
          {dimension && onDimensionChange && (
            <div className="lab-dim-switcher" role="group" aria-label="Dimensión de visualización">
              <button
                type="button"
                className={`lab-dim-btn ${dimension === '2D' ? 'active' : ''}`}
                onClick={() => onDimensionChange('2D')}
                aria-pressed={dimension === '2D'}
              >
                2D
              </button>
              <button
                type="button"
                className={`lab-dim-btn ${dimension === '3D' ? 'active' : ''}`}
                onClick={() => onDimensionChange('3D')}
                aria-pressed={dimension === '3D'}
              >
                3D
              </button>
            </div>
          )}
        </div>

        <div className="lab-header-right">
          {statusBadge && (
            <span className={`lab-status-badge status-${statusBadge.variant}`}>
              <span className="status-dot" />
              {statusBadge.label}
            </span>
          )}

          {headerActions}

          {helpContent && (
            <button
              type="button"
              className="lab-help-btn"
              onClick={() => setIsHelpOpen(true)}
              aria-label="Ayuda y fundamentos físicos"
              title="Consultar leyes físicas y guía de uso"
            >
              ?
            </button>
          )}
        </div>
      </header>

      {/* 2. Cuerpo Central (3 Columnas + Canvas) */}
      <div className="lab-body">
        {/* Columna Izquierda: Biblioteca / Presets */}
        {libraryContent && (
          <aside
            className={`lab-sidebar-left ${activeMobileDrawer === 'library' ? 'mobile-open' : ''}`}
            aria-label={libraryTitle}
          >
            <div className="lab-panel-header">
              <h3>{libraryTitle}</h3>
              <button
                type="button"
                className="lab-panel-close-mobile"
                onClick={() => setActiveMobileDrawer('none')}
                aria-label="Cerrar panel de biblioteca"
              >
                ✕
              </button>
            </div>
            <div className="lab-panel-body">{libraryContent}</div>
          </aside>
        )}

        {/* Centro: Lienzo Interactivo Principal */}
        <main className="lab-canvas-area" role="main">
          {children}
        </main>

        {/* Columna Derecha: Inspector Contextual */}
        {inspectorContent && (
          <aside
            className={`lab-sidebar-right ${activeMobileDrawer === 'inspector' ? 'mobile-open' : ''}`}
            aria-label={inspectorTitle}
          >
            <div className="lab-panel-header">
              <div className="lab-inspector-title-row">
                <h3>{inspectorTitle}</h3>
                {inspectorBadge && <span className="lab-inspector-badge">{inspectorBadge}</span>}
              </div>
              <button
                type="button"
                className="lab-panel-close-mobile"
                onClick={() => setActiveMobileDrawer('none')}
                aria-label="Cerrar inspector"
              >
                ✕
              </button>
            </div>
            <div className="lab-panel-body">{inspectorContent}</div>
          </aside>
        )}
      </div>

      {/* 3. Panel Inferior: Gráficas y Resultados */}
      {bottomContent && (
        <section
          className={`lab-bottom-panel ${isBottomCollapsed ? 'collapsed' : ''} ${
            activeMobileDrawer === 'bottom' ? 'mobile-open' : ''
          }`}
          aria-label={bottomTitle}
        >
          <div className="lab-bottom-header">
            <div className="lab-bottom-title-group">
              <span className="lab-bottom-icon">📊</span>
              <h4>{bottomTitle}</h4>
            </div>
            <div className="lab-bottom-actions">
              <button
                type="button"
                className="lab-bottom-toggle-btn"
                onClick={() => setIsBottomCollapsed(prev => !prev)}
                aria-expanded={!isBottomCollapsed}
                title={isBottomCollapsed ? 'Expandir resultados' : 'Colapsar resultados'}
              >
                {isBottomCollapsed ? '▲ Expandir' : '▼ Ocultar'}
              </button>
              <button
                type="button"
                className="lab-panel-close-mobile"
                onClick={() => setActiveMobileDrawer('none')}
                aria-label="Cerrar panel inferior"
              >
                ✕
              </button>
            </div>
          </div>
          {!isBottomCollapsed && <div className="lab-bottom-body">{bottomContent}</div>}
        </section>
      )}

      {/* 4. Barra de Acceso Rápido Móvil (< 1024px) */}
      <nav className="lab-mobile-nav" aria-label="Navegación de paneles móviles">
        {libraryContent && (
          <button
            type="button"
            className={`lab-mobile-tab ${activeMobileDrawer === 'library' ? 'active' : ''}`}
            onClick={() => toggleMobileDrawer('library')}
          >
            <span>🛠️</span>
            <span>Elementos</span>
          </button>
        )}
        {inspectorContent && (
          <button
            type="button"
            className={`lab-mobile-tab ${activeMobileDrawer === 'inspector' ? 'active' : ''}`}
            onClick={() => toggleMobileDrawer('inspector')}
          >
            <span>🔍</span>
            <span>Inspector</span>
          </button>
        )}
        {bottomContent && (
          <button
            type="button"
            className={`lab-mobile-tab ${activeMobileDrawer === 'bottom' ? 'active' : ''}`}
            onClick={() => toggleMobileDrawer('bottom')}
          >
            <span>📊</span>
            <span>Resultados</span>
          </button>
        )}
      </nav>

      {/* 5. Modal Accesible de Ayuda y Leyes Físicas */}
      {isHelpOpen && (
        <div
          className="lab-modal-backdrop"
          onClick={() => setIsHelpOpen(false)}
          role="presentation"
        >
          <div
            className="lab-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={helpDialogId}
            onClick={e => e.stopPropagation()}
          >
            <div className="lab-modal-header">
              <h2 id={helpDialogId}>Fundamentos Físicos & Ayuda Didáctica</h2>
              <button
                type="button"
                className="lab-modal-close"
                onClick={() => setIsHelpOpen(false)}
                aria-label="Cerrar ventana de ayuda"
              >
                ✕
              </button>
            </div>
            <div className="lab-modal-content">{helpContent}</div>
            <div className="lab-modal-footer">
              <button
                type="button"
                className="lab-modal-action-btn"
                onClick={() => setIsHelpOpen(false)}
              >
                Entendido, continuar simulando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


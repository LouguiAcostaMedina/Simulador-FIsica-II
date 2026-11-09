import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MagnetismLaboratoryView } from './MagnetismLaboratoryView'

describe('MagnetismLaboratoryView — Interacción en Laboratorio', () => {
  it('renderiza el laboratorio U4 con título, fórmula de Lorentz y estado inicial de Boris Pusher', () => {
    const onSwitch = vi.fn()
    render(
      <MemoryRouter>
        <MagnetismLaboratoryView onSwitchToSimulator={onSwitch} />
      </MemoryRouter>
    )

    expect(screen.getByText('Fuerza y Campo Magnético')).toBeDefined()
    expect(screen.getByText(/F = q·\(E \+ v × B\)/)).toBeDefined()
    expect(screen.getByText('Listo (Boris Pusher)')).toBeDefined()
    expect(screen.getByText('Fuerza de Lorentz & Trabajo Nulo')).toBeDefined()
  })

  it('aplica el preset del Selector de Velocidades de Wien con campos cruzados E y B', () => {
    const onSwitch = vi.fn()
    render(
      <MemoryRouter>
        <MagnetismLaboratoryView onSwitchToSimulator={onSwitch} />
      </MemoryRouter>
    )

    const wienBtn = screen.getByText('⚖ Selector de Velocidades de Wien')
    fireEvent.click(wienBtn)

    // Debe mostrar badges y campos cruzados
    expect(screen.getByText('Cruzados')).toBeDefined()
    expect(screen.getByText('Campo Eléctrico Ey')).toBeDefined()
    expect(screen.getByText('Campo Magnético Bz')).toBeDefined()
  })

  it('aplica el preset de Ciclotrón / Radio de Larmor', () => {
    const onSwitch = vi.fn()
    render(
      <MemoryRouter>
        <MagnetismLaboratoryView onSwitchToSimulator={onSwitch} />
      </MemoryRouter>
    )

    const cycloBtn = screen.getByText('🔄 Radio de Larmor / Ciclotrón')
    fireEvent.click(cycloBtn)

    expect(screen.getByText('Radio de Larmor r_L')).toBeDefined()
  })

  it('controla el ciclo de simulación de Lorentz: Lanzar, Pausar y Reiniciar con snapshot', () => {
    const onSwitch = vi.fn()
    render(
      <MemoryRouter>
        <MagnetismLaboratoryView onSwitchToSimulator={onSwitch} />
      </MemoryRouter>
    )

    const launchBtn = screen.getByText('▶ Lanzar Partícula')
    fireEvent.click(launchBtn)

    expect(screen.getByText('⏸ Pausa')).toBeDefined()

    const pauseBtn = screen.getByText('⏸ Pausa')
    fireEvent.click(pauseBtn)
    expect(screen.getByText('Pausado')).toBeDefined()

    const resetBtn = screen.getByText('⏹ Reiniciar')
    fireEvent.click(resetBtn)
    expect(screen.getByText('Listo (Boris Pusher)')).toBeDefined()
  })
})

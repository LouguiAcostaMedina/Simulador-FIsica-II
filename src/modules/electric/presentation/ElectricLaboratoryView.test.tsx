import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ElectricLaboratoryView } from './ElectricLaboratoryView'

describe('ElectricLaboratoryView — Interacción en Laboratorio', () => {
  it('renderiza el encabezado del laboratorio U1 con modo y principios físicos', () => {
    const onSwitch = vi.fn()
    render(
      <MemoryRouter>
        <ElectricLaboratoryView onSwitchToSimulator={onSwitch} />
      </MemoryRouter>
    )

    expect(screen.getByText('Campo y Potencial Eléctrico')).toBeDefined()
    expect(screen.getByText(/E = k·Σ\(qᵢ·r̂ᵢ\/rᵢ²\)/)).toBeDefined()
    expect(screen.getByText(/Ley de Coulomb & Superposición/)).toBeDefined()
  })

  it('permite añadir cargas desde la paleta hasta el límite de 10', () => {
    const onSwitch = vi.fn()
    render(
      <MemoryRouter>
        <ElectricLaboratoryView onSwitchToSimulator={onSwitch} />
      </MemoryRouter>
    )

    // Inicialmente hay 2 cargas (dipolo por defecto)
    expect(screen.getByText('2 / 10 cargas en mesa')).toBeDefined()

    // Pulsar botón de añadir "+1 μC"
    const addBtn = screen.getByText('+1 μC')
    fireEvent.click(addBtn)

    expect(screen.getByText('3 / 10 cargas en mesa')).toBeDefined()
  })

  it('cambia entre presets experimentales (Cuadrupolo y Carga Única)', () => {
    const onSwitch = vi.fn()
    render(
      <MemoryRouter>
        <ElectricLaboratoryView onSwitchToSimulator={onSwitch} />
      </MemoryRouter>
    )

    const quadBtn = screen.getByText('❖ Cuadrupolo 2D')
    fireEvent.click(quadBtn)
    expect(screen.getByText('4 / 10 cargas en mesa')).toBeDefined()

    const singleBtn = screen.getByText('⚡ Carga Única (+1 μC)')
    fireEvent.click(singleBtn)
    expect(screen.getByText('1 / 10 cargas en mesa')).toBeDefined()
  })

  it('controla el ciclo de simulación: Lanzar, Pausa y Reiniciar con snapshot', () => {
    const onSwitch = vi.fn()
    render(
      <MemoryRouter>
        <ElectricLaboratoryView onSwitchToSimulator={onSwitch} />
      </MemoryRouter>
    )

    const launchBtn = screen.getByText('▶ Lanzar Partícula')
    fireEvent.click(launchBtn)

    expect(screen.getByText('⏸ Pausa')).toBeDefined()

    // Pausar
    const pauseBtn = screen.getByText('⏸ Pausa')
    fireEvent.click(pauseBtn)
    expect(screen.getByText('Pausado')).toBeDefined()

    // Reiniciar
    const resetBtn = screen.getByText('⏹ Reiniciar')
    fireEvent.click(resetBtn)
    expect(screen.getByText('Listo')).toBeDefined()
  })
})

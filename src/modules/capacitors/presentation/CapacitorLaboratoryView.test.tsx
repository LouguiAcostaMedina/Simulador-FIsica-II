import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CapacitorLaboratoryView } from './CapacitorLaboratoryView'

describe('CapacitorLaboratoryView — Interacción en Laboratorio', () => {
  it('renderiza el laboratorio U2 con título, fórmula de placas paralelas y métricas iniciales', () => {
    const onSwitch = vi.fn()
    render(
      <MemoryRouter>
        <CapacitorLaboratoryView onSwitchToSimulator={onSwitch} />
      </MemoryRouter>
    )

    expect(screen.getByText('Capacitores y Dieléctricos')).toBeDefined()
    expect(screen.getByText('C = ε₀·εᵣ·A / d')).toBeDefined()
    expect(screen.getByText('Batería Conectada (V Fijo)')).toBeDefined()
    expect(screen.getByText('Capacitancia de Placas Paralelas')).toBeDefined()
  })

  it('permite alternar entre los modos Batería Conectada (V Fijo) y Desconectada (Q Fijo)', () => {
    const onSwitch = vi.fn()
    render(
      <MemoryRouter>
        <CapacitorLaboratoryView onSwitchToSimulator={onSwitch} />
      </MemoryRouter>
    )

    const qFixedPill = screen.getByText('⚡ Q Fijo')
    fireEvent.click(qFixedPill)

    expect(screen.getByText('Batería Desconectada (Q Fijo)')).toBeDefined()

    const vFixedPill = screen.getByText('🔋 V Fijo')
    fireEvent.click(vFixedPill)

    expect(screen.getByText('Batería Conectada (V Fijo)')).toBeDefined()
  })

  it('aplica el preset de Dieléctrico con V Fijo mostrando incremento de capacitancia y energía', () => {
    const onSwitch = vi.fn()
    render(
      <MemoryRouter>
        <CapacitorLaboratoryView onSwitchToSimulator={onSwitch} />
      </MemoryRouter>
    )

    const presetBtn = screen.getByText('🔋 Dieléctrico con V Fijo (Batería)')
    fireEvent.click(presetBtn)

    // Con Pyrex er=4.7 a V=12V, C crece y la caja de comparación muestra deltas
    expect(screen.getByText('Comparación vs Base')).toBeDefined()
    expect(screen.getByText(/Trabajo Batería W_bat:/)).toBeDefined()
  })

  it('permite seleccionar materiales dieléctricos estándar de la biblioteca', () => {
    const onSwitch = vi.fn()
    render(
      <MemoryRouter>
        <CapacitorLaboratoryView onSwitchToSimulator={onSwitch} />
      </MemoryRouter>
    )

    // Seleccionar Mica (er = 5.4)
    const micaBtn = screen.getByText('Mica')
    fireEvent.click(micaBtn)

    expect(screen.getByText('εᵣ = 5.4')).toBeDefined()
  })
})

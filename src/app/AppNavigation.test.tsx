import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Hub from './Hub'
import ElectricModule from '../modules/electric/presentation/ElectricModule'
import CapacitorsModule from '../modules/capacitors/presentation/CapacitorsModule'
import CurrentModule from '../modules/current/CurrentModule'
import MagnetismModule from '../modules/magnetism/MagnetismModule'

function TestApp({ initialEntry = '/' }: { initialEntry?: string }) {
  return (
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/electric" element={<ElectricModule />} />
        <Route path="/capacitors" element={<CapacitorsModule />} />
        <Route path="/current" element={<CurrentModule />} />
        <Route path="/magnetism" element={<MagnetismModule />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('App Navigation & End-to-End Integration', () => {
  it('renderiza el Hub con las 4 unidades operativas y sin etiquetas de Próximamente', async () => {
    render(<TestApp initialEntry="/" />)

    await waitFor(() => {
      expect(screen.getByText('Laboratorio Vectorial')).toBeDefined()
    })

    expect(screen.getByText('Campo y Potencial Eléctrico')).toBeDefined()
    expect(screen.getByText('Capacitores y Dieléctricos')).toBeDefined()
    expect(screen.getByText('Corriente, Ley de Ohm y Circuitos')).toBeDefined()
    expect(screen.getByText('Fuerza y Campo Magnético')).toBeDefined()
    expect(screen.queryByText(/Próximamente/i)).toBeNull()
  })

  it('navega directamente al Laboratorio U3 de Circuitos DC', async () => {
    render(<TestApp initialEntry="/current?mode=laboratory" />)

    await waitFor(() => {
      expect(screen.getByText('Laboratorio de Circuitos DC')).toBeDefined()
      expect(screen.getByText('Energizado · MNA Válido')).toBeDefined()
    })
  })

  it('navega directamente al Laboratorio U1 de Electrostática', async () => {
    render(<TestApp initialEntry="/electric?mode=laboratory" />)

    await waitFor(() => {
      expect(screen.getByText('Campo y Potencial Eléctrico')).toBeDefined()
      expect(screen.getByText(/E = k·Σ\(qᵢ·r̂ᵢ\/rᵢ²\)/)).toBeDefined()
    })
  })

  it('navega directamente al Laboratorio U2 de Capacitores', async () => {
    render(<TestApp initialEntry="/capacitors?mode=laboratory" />)

    await waitFor(() => {
      expect(screen.getByText('Capacitores y Dieléctricos')).toBeDefined()
      expect(screen.getByText('C = ε₀·εᵣ·A / d')).toBeDefined()
    })
  })

  it('navega directamente al Laboratorio U4 de Magnetismo', async () => {
    render(<TestApp initialEntry="/magnetism?mode=laboratory" />)

    await waitFor(() => {
      expect(screen.getByText('Fuerza y Campo Magnético')).toBeDefined()
      expect(screen.getByText(/F = q·\(E \+ v × B\)/)).toBeDefined()
    })
  })
})

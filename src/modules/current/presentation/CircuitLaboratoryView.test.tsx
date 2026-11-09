import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { CircuitLaboratoryView } from './CircuitLaboratoryView'

describe('CircuitLaboratoryView — Interacción en UI y Aceptación Clave', () => {
  it('renderiza el caso de aceptación clave y muestra magnitudes analíticas en pantalla', () => {
    render(
      <BrowserRouter>
        <CircuitLaboratoryView onSwitchToSimulator={() => {}} />
      </BrowserRouter>
    )

    // 1. Título y badges de estado
    expect(screen.getByText('Laboratorio de Circuitos DC')).toBeDefined()
    expect(screen.getByText('Energizado · MNA Válido')).toBeDefined()

    // 2. Magnitudes del circuito mixto: Req = 20 Ω, I = 0.6 A, P = 7.2 W
    expect(screen.getByText('Resistencia Equivalente (Req)')).toBeDefined()
    expect(screen.getByText('20.00')).toBeDefined()
    expect(screen.getByText('0.6000')).toBeDefined()
    // Potencia suministrada y disipada son exactamente iguales a 7.200 W (balance de energía)
    expect(screen.getAllByText('7.200').length).toBeGreaterThanOrEqual(2)

    // 3. Tabla de diagnóstico físico: verificar componentes R1, R2, R3
    expect(screen.getAllByText('R1 (10 Ω)').length).toBeGreaterThan(0)
    expect(screen.getAllByText('R2 (20 Ω)').length).toBeGreaterThan(0)
    expect(screen.getAllByText('R3 (20 Ω)').length).toBeGreaterThan(0)
  })

  it('permite alternar presets y abrir/cerrar interruptor recalculando en tiempo real', () => {
    render(
      <BrowserRouter>
        <CircuitLaboratoryView onSwitchToSimulator={() => {}} />
      </BrowserRouter>
    )

    // Cargar preset de Bombilla con Interruptor
    const switchPresetBtn = screen.getByText('4. Bombilla con Interruptor')
    fireEvent.click(switchPresetBtn)

    // Debe mostrar la bombilla y el interruptor en el circuito
    expect(screen.getAllByText(/Bombilla 10W/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Interruptor/).length).toBeGreaterThan(0)

    // El interruptor inicial está cerrado, el circuito está energizado
    expect(screen.getByText('Energizado · MNA Válido')).toBeDefined()

    // Hacer clic en el interruptor para abrirlo
    const switchElement = screen.getByText('Cerrado')
    fireEvent.click(switchElement)

    // Ahora el interruptor debe marcar "Abierto" y el circuito queda en estado abierto
    expect(screen.getByText('Abierto')).toBeDefined()
    expect(screen.getByText('Circuito Abierto')).toBeDefined()
  })

  it('permite limpiar el lienzo y agregar componentes desde la biblioteca', () => {
    render(
      <BrowserRouter>
        <CircuitLaboratoryView onSwitchToSimulator={() => {}} />
      </BrowserRouter>
    )

    // Botón Limpiar
    const clearBtn = screen.getByText('🗑️ Limpiar')
    fireEvent.click(clearBtn)

    // El lienzo queda vacío -> Sin fuente DC
    expect(screen.getByText('Sin Fuente DC')).toBeDefined()
    expect(screen.getByText('El circuito está vacío. Arrastra componentes al lienzo.')).toBeDefined()

    // Añadir una batería
    const addBatteryBtn = screen.getByText('Batería DC')
    fireEvent.click(addBatteryBtn)

    // La batería aparece en la lista de componentes
    expect(screen.getAllByText('Batería 1').length).toBeGreaterThan(0)
  })
})

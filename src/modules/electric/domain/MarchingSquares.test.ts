import { describe, it, expect } from 'vitest'
import { MarchingSquares } from './MarchingSquares'

describe('MarchingSquares', () => {
  it('no genera contornos si la rejilla tiene menos de 2x2 celdas', () => {
    const segments = MarchingSquares.generateContours([[1]], [0], [0], [0.5])
    expect(segments).toEqual([])
  })

  it('no genera contornos si todos los valores están por encima o por debajo del isovalor', () => {
    const grid = [
      [10, 10],
      [10, 10]
    ]
    const xCoords = [0, 1]
    const yCoords = [0, 1]
    const segments = MarchingSquares.generateContours(grid, xCoords, yCoords, [5])
    expect(segments).toHaveLength(0)
  })

  it('genera segmento lineal interpolado correctamente cuando el isovalor cruza una celda', () => {
    // Esquinas:
    // r=0, c=0: v=0 (x=0, y=0)
    // r=0, c=1: v=10 (x=1, y=0)
    // r=1, c=1: v=10 (x=1, y=1)
    // r=1, c=0: v=0 (x=0, y=1)
    // Para iso=5, debe cruzar a la mitad del borde inferior y borde superior: x=0.5
    const grid = [
      [0, 10],
      [0, 10]
    ]
    const xCoords = [0, 1]
    const yCoords = [0, 1]
    const segments = MarchingSquares.generateContours(grid, xCoords, yCoords, [5])

    expect(segments.length).toBeGreaterThanOrEqual(1)
    const seg = segments[0]
    expect(seg.value).toBe(5)
    // Debe cruzar x ~ 0.5
    expect(seg.x1).toBeCloseTo(0.5, 2)
    expect(seg.x2).toBeCloseTo(0.5, 2)
  })

  it('ignora celdas con valores NaN o infinitos sin lanzar excepciones', () => {
    const grid = [
      [NaN, 10],
      [0, Infinity]
    ]
    const xCoords = [0, 1]
    const yCoords = [0, 1]
    expect(() => {
      const segments = MarchingSquares.generateContours(grid, xCoords, yCoords, [5])
      expect(segments).toEqual([])
    }).not.toThrow()
  })

  it('extrae múltiples isovalores ordenados', () => {
    const grid = [
      [0, 2, 4],
      [0, 2, 4],
      [0, 2, 4]
    ]
    const xCoords = [0, 1, 2]
    const yCoords = [0, 1, 2]
    const segments = MarchingSquares.generateContours(grid, xCoords, yCoords, [1, 3])

    const iso1Segs = segments.filter(s => s.value === 1)
    const iso3Segs = segments.filter(s => s.value === 3)
    expect(iso1Segs.length).toBeGreaterThan(0)
    expect(iso3Segs.length).toBeGreaterThan(0)
  })
})

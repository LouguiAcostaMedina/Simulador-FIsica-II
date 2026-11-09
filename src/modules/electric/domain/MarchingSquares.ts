/**
 * MarchingSquares.ts — Algoritmo clásico de Marching Squares para isolíneas 2D
 * Extrae contornos equipotenciales exactos a partir de un campo escalar continuo V(x, y).
 * Dominio TypeScript puro.
 */

export interface LineSegment {
  x1: number
  y1: number
  x2: number
  y2: number
  value: number
}

export class MarchingSquares {
  /**
   * Genera los segmentos de línea para un conjunto de valores isopotenciales.
   */
  public static generateContours(
    grid: number[][],
    xCoords: number[],
    yCoords: number[],
    isoValues: number[]
  ): LineSegment[] {
    const segments: LineSegment[] = []
    const cols = xCoords.length
    const rows = yCoords.length

    if (cols < 2 || rows < 2) return segments

    for (const iso of isoValues) {
      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const v0 = grid[r][c]       // Abajo-Izquierda (x0, y0)
          const v1 = grid[r][c + 1]   // Abajo-Derecha   (x1, y0)
          const v2 = grid[r + 1][c + 1] // Arriba-Derecha (x1, y1)
          const v3 = grid[r + 1][c]   // Arriba-Izquierda (x0, y1)

          // Si alguno es singular/NaN, saltar celda
          if (
            !Number.isFinite(v0) ||
            !Number.isFinite(v1) ||
            !Number.isFinite(v2) ||
            !Number.isFinite(v3)
          ) {
            continue
          }

          let cellIndex = 0
          if (v0 >= iso) cellIndex |= 1
          if (v1 >= iso) cellIndex |= 2
          if (v2 >= iso) cellIndex |= 4
          if (v3 >= iso) cellIndex |= 8

          if (cellIndex === 0 || cellIndex === 15) {
            // Todos adentro o todos afuera: ningún contorno cruza esta celda
            continue
          }

          const x0 = xCoords[c]
          const x1 = xCoords[c + 1]
          const y0 = yCoords[r]
          const y1 = yCoords[r + 1]

          // Interpolación lineal entre bordes
          // Borde 0 (inferior): entre (x0, y0) y (x1, y0)
          const interp0 = () => {
            const t = (iso - v0) / (v1 - v0 || 1e-9)
            return { x: x0 + t * (x1 - x0), y: y0 }
          }
          // Borde 1 (derecho): entre (x1, y0) y (x1, y1)
          const interp1 = () => {
            const t = (iso - v1) / (v2 - v1 || 1e-9)
            return { x: x1, y: y0 + t * (y1 - y0) }
          }
          // Borde 2 (superior): entre (x0, y1) y (x1, y1)
          const interp2 = () => {
            const t = (iso - v3) / (v2 - v3 || 1e-9)
            return { x: x0 + t * (x1 - x0), y: y1 }
          }
          // Borde 3 (izquierdo): entre (x0, y0) y (x0, y1)
          const interp3 = () => {
            const t = (iso - v0) / (v3 - v0 || 1e-9)
            return { x: x0, y: y0 + t * (y1 - y0) }
          }

          const addSeg = (pA: { x: number; y: number }, pB: { x: number; y: number }) => {
            segments.push({
              x1: pA.x,
              y1: pA.y,
              x2: pB.x,
              y2: pB.y,
              value: iso
            })
          }

          // Casos estándar de Marching Squares
          switch (cellIndex) {
            case 1:
            case 14:
              addSeg(interp3(), interp0())
              break
            case 2:
            case 13:
              addSeg(interp0(), interp1())
              break
            case 3:
            case 12:
              addSeg(interp3(), interp1())
              break
            case 4:
            case 11:
              addSeg(interp1(), interp2())
              break
            case 5:
              addSeg(interp3(), interp2())
              addSeg(interp0(), interp1())
              break
            case 6:
            case 9:
              addSeg(interp0(), interp2())
              break
            case 7:
            case 8:
              addSeg(interp3(), interp2())
              break
            case 10:
              addSeg(interp0(), interp3())
              addSeg(interp1(), interp2())
              break
          }
        }
      }
    }

    return segments
  }
}

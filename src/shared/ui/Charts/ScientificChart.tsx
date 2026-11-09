import { useState, useId, useMemo, useCallback } from 'react'
import './ScientificChart.css'

export interface ChartPoint {
  x: number
  y: number
}

export interface ChartSeries {
  id: string
  name: string
  color: string
  data: ChartPoint[]
  unit?: string
  strokeWidth?: number
  dashed?: boolean
}

export interface ScientificChartProps {
  title?: string
  subtitle?: string
  xLabel: string
  xUnit?: string
  yLabel: string
  yUnit?: string
  series: ChartSeries[]
  currentX?: number
  height?: number
  aspectRatio?: string
  showGrid?: boolean
  showLegend?: boolean
  ariaDescription?: string
}

export function ScientificChart({
  title,
  subtitle,
  xLabel,
  xUnit = '',
  yLabel,
  yUnit = '',
  series,
  currentX,
  height = 200,
  showGrid = true,
  showLegend = true,
  ariaDescription
}: ScientificChartProps) {
  const chartId = useId()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({})

  const activeSeries = useMemo(
    () => series.filter(s => !hiddenSeries[s.id] && s.data.length > 0),
    [series, hiddenSeries]
  )

  // Compute bounding box
  const bounds = useMemo(() => {
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    for (const s of activeSeries) {
      for (const p of s.data) {
        if (Number.isFinite(p.x) && Number.isFinite(p.y)) {
          if (p.x < minX) minX = p.x
          if (p.x > maxX) maxX = p.x
          if (p.y < minY) minY = p.y
          if (p.y > maxY) maxY = p.y
        }
      }
    }

    if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
      minX = 0
      maxX = 1
    }
    if (!Number.isFinite(minY) || !Number.isFinite(maxY)) {
      minY = 0
      maxY = 1
    }

    // Add 8% vertical padding so lines don't clamp to axes
    const rangeY = maxY - minY === 0 ? 1 : maxY - minY
    const padY = rangeY * 0.08
    minY -= padY
    maxY += padY

    const rangeX = maxX - minX === 0 ? 1 : maxX - minX

    return { minX, maxX, minY, maxY, rangeX, rangeY: maxY - minY }
  }, [activeSeries])

  // Dimensions inside SVG
  const width = 480
  const padLeft = 56
  const padRight = 24
  const padTop = 24
  const padBottom = 40
  const plotWidth = width - padLeft - padRight
  const plotHeight = height - padTop - padBottom

  const scaleX = useCallback(
    (x: number) => padLeft + ((x - bounds.minX) / bounds.rangeX) * plotWidth,
    [bounds.minX, bounds.rangeX, plotWidth]
  )

  const scaleY = useCallback(
    (y: number) => padTop + plotHeight - ((y - bounds.minY) / bounds.rangeY) * plotHeight,
    [bounds.minY, bounds.rangeY, plotHeight]
  )

  // Generate nice grid ticks
  const xTicks = useMemo(() => {
    const count = 4
    const ticks = []
    for (let i = 0; i <= count; i++) {
      const val = bounds.minX + (bounds.rangeX * i) / count
      ticks.push(val)
    }
    return ticks
  }, [bounds])

  const yTicks = useMemo(() => {
    const count = 4
    const ticks = []
    for (let i = 0; i <= count; i++) {
      const val = bounds.minY + (bounds.rangeY * i) / count
      ticks.push(val)
    }
    return ticks
  }, [bounds])

  const formatNumber = (num: number): string => {
    if (Math.abs(num) >= 1e4 || (Math.abs(num) < 1e-2 && num !== 0)) {
      return num.toExponential(2)
    }
    return num.toLocaleString('es-ES', { maximumFractionDigits: 2 })
  }

  // Find hover points
  const hoverPoint = useMemo(() => {
    if (hoverIndex === null || activeSeries.length === 0) return null
    // Reference first active series
    const primary = activeSeries[0]
    if (!primary || hoverIndex < 0 || hoverIndex >= primary.data.length) return null
    const xVal = primary.data[hoverIndex].x
    return {
      x: xVal,
      screenX: scaleX(xVal),
      values: activeSeries.map(s => {
        // Find closest point in this series
        const p = s.data.reduce((prev, curr) =>
          Math.abs(curr.x - xVal) < Math.abs(prev.x - xVal) ? curr : prev
        , s.data[0])
        return {
          seriesName: s.name,
          color: s.color,
          y: p ? p.y : 0,
          unit: s.unit || yUnit,
          screenY: p ? scaleY(p.y) : 0
        }
      })
    }
  }, [hoverIndex, activeSeries, scaleX, scaleY, yUnit])

  const toggleSeries = (id: string) => {
    setHiddenSeries(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="sci-chart-wrapper" role="region" aria-label={title || 'Gráfica científica'}>
      {(title || subtitle) && (
        <div className="sci-chart-header">
          {title && <h4 className="sci-chart-title">{title}</h4>}
          {subtitle && <span className="sci-chart-subtitle">{subtitle}</span>}
        </div>
      )}

      {showLegend && series.length > 1 && (
        <div className="sci-chart-legend">
          {series.map(s => {
            const isHidden = hiddenSeries[s.id]
            return (
              <button
                key={s.id}
                type="button"
                className={`sci-chart-legend-item ${isHidden ? 'hidden' : ''}`}
                onClick={() => toggleSeries(s.id)}
                title={`Alternar visibilidad de ${s.name}`}
              >
                <span
                  className="sci-chart-legend-color"
                  style={{ backgroundColor: isHidden ? '#6B7D88' : s.color }}
                />
                <span className="sci-chart-legend-text">{s.name}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="sci-chart-canvas-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="sci-chart-svg"
          preserveAspectRatio="xMidYMid meet"
          aria-description={ariaDescription || `Gráfica de ${yLabel} frente a ${xLabel}`}
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={e => {
            if (activeSeries.length === 0) return
            const rect = e.currentTarget.getBoundingClientRect()
            const mouseX = ((e.clientX - rect.left) / rect.width) * width
            // Find closest index in first active series
            const first = activeSeries[0]
            if (!first || first.data.length === 0) return
            let closestIdx = 0
            let closestDist = Infinity
            first.data.forEach((p, idx) => {
              const sx = scaleX(p.x)
              const dist = Math.abs(sx - mouseX)
              if (dist < closestDist) {
                closestDist = dist
                closestIdx = idx
              }
            })
            setHoverIndex(closestIdx)
          }}
        >
          <defs>
            <clipPath id={`plot-clip-${chartId}`}>
              <rect x={padLeft} y={padTop} width={plotWidth} height={plotHeight} />
            </clipPath>
          </defs>

          {/* Grid lines */}
          {showGrid && (
            <g className="sci-chart-grid" stroke="var(--color-border-subtle)" strokeDasharray="3 3">
              {xTicks.map((xVal, i) => (
                <line
                  key={`gx-${i}`}
                  x1={scaleX(xVal)}
                  y1={padTop}
                  x2={scaleX(xVal)}
                  y2={padTop + plotHeight}
                />
              ))}
              {yTicks.map((yVal, i) => (
                <line
                  key={`gy-${i}`}
                  x1={padLeft}
                  y1={scaleY(yVal)}
                  x2={padLeft + plotWidth}
                  y2={scaleY(yVal)}
                />
              ))}
            </g>
          )}

          {/* Ejes principales */}
          <g className="sci-chart-axes" stroke="var(--color-border-medium)" strokeWidth="1.5">
            {/* Eje X */}
            <line
              x1={padLeft}
              y1={padTop + plotHeight}
              x2={padLeft + plotWidth}
              y2={padTop + plotHeight}
            />
            {/* Eje Y */}
            <line
              x1={padLeft}
              y1={padTop}
              x2={padLeft}
              y2={padTop + plotHeight}
            />
          </g>

          {/* Etiquetas de marcas X */}
          <g className="sci-chart-ticks-x">
            {xTicks.map((val, i) => (
              <text
                key={`tx-${i}`}
                x={scaleX(val)}
                y={height - padBottom + 16}
                textAnchor="middle"
                className="sci-chart-tick-text"
              >
                {formatNumber(val)}
              </text>
            ))}
            <text
              x={padLeft + plotWidth / 2}
              y={height - 8}
              textAnchor="middle"
              className="sci-chart-axis-label"
            >
              {xLabel} {xUnit ? `(${xUnit})` : ''}
            </text>
          </g>

          {/* Etiquetas de marcas Y */}
          <g className="sci-chart-ticks-y">
            {yTicks.map((val, i) => (
              <text
                key={`ty-${i}`}
                x={padLeft - 8}
                y={scaleY(val) + 4}
                textAnchor="end"
                className="sci-chart-tick-text"
              >
                {formatNumber(val)}
              </text>
            ))}
            <text
              x={14}
              y={padTop + plotHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90 14,${padTop + plotHeight / 2})`}
              className="sci-chart-axis-label"
            >
              {yLabel} {yUnit ? `(${yUnit})` : ''}
            </text>
          </g>

          {/* Líneas de series */}
          <g clipPath={`url(#plot-clip-${chartId})`}>
            {activeSeries.map(s => {
              const pointsStr = s.data
                .map(p => `${scaleX(p.x).toFixed(1)},${scaleY(p.y).toFixed(1)}`)
                .join(' ')
              return (
                <polyline
                  key={s.id}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.strokeWidth || 2.2}
                  strokeDasharray={s.dashed ? '4 3' : undefined}
                  points={pointsStr}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )
            })}
          </g>

          {/* Indicador de posición X actual (ej. tiempo o separación) */}
          {currentX !== undefined &&
            currentX >= bounds.minX &&
            currentX <= bounds.maxX && (
              <line
                x1={scaleX(currentX)}
                y1={padTop}
                x2={scaleX(currentX)}
                y2={padTop + plotHeight}
                stroke="var(--color-accent-copper)"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            )}

          {/* Crosshair cursor interactivo */}
          {hoverPoint && (
            <g className="sci-chart-hover">
              <line
                x1={hoverPoint.screenX}
                y1={padTop}
                x2={hoverPoint.screenX}
                y2={padTop + plotHeight}
                stroke="var(--color-text-ivory)"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.7"
              />
              {hoverPoint.values.map((v, i) => (
                <circle
                  key={`hp-${i}`}
                  cx={hoverPoint.screenX}
                  cy={v.screenY}
                  r="4.5"
                  fill={v.color}
                  stroke="var(--color-bg-ink)"
                  strokeWidth="2"
                />
              ))}
            </g>
          )}
        </svg>

        {/* Tooltip flotante con datos exactos */}
        {hoverPoint && (
          <div
            className="sci-chart-tooltip"
            style={{
              left: `${(hoverPoint.screenX / width) * 100}%`,
              top: '8px'
            }}
          >
            <div className="sci-chart-tooltip-header">
              {xLabel}: <strong>{formatNumber(hoverPoint.x)} {xUnit}</strong>
            </div>
            {hoverPoint.values.map((v, i) => (
              <div key={i} className="sci-chart-tooltip-row" style={{ color: v.color }}>
                <span>{v.seriesName}:</span>
                <strong>{formatNumber(v.y)} {v.unit}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

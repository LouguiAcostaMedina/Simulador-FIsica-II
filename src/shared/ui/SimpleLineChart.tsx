import React from 'react';

interface Point {
  x: number;
  y: number;
}

interface Props {
  data: Point[];
  title: string;
  xLabel: string;
  yLabel: string;
  width?: number;
  height?: number;
  color?: string;
  currentValue?: number; // X value of the current point to highlight
}

export function SimpleLineChart({ data, title, xLabel, yLabel, width = 300, height = 200, color = '#42D7C8', currentValue }: Props) {
  if (data.length === 0) return null;

  const pad = 40;
  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));
  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));

  const rangeX = maxX - minX === 0 ? 1 : maxX - minX;
  const rangeY = maxY - minY === 0 ? 1 : maxY - minY;

  const getX = (val: number) => pad + ((val - minX) / rangeX) * (width - 2 * pad);
  const getY = (val: number) => height - pad - ((val - minY) / rangeY) * (height - 2 * pad);

  const pointsStr = data.map(d => `${getX(d.x)},${getY(d.y)}`).join(' ');

  let currentPoint = null;
  if (currentValue !== undefined) {
    // find closest
    const closest = data.reduce((prev, curr) => Math.abs(curr.x - currentValue) < Math.abs(prev.x - currentValue) ? curr : prev);
    currentPoint = closest;
  }

  return (
    <div className="chart-container" style={{ margin: '1rem 0' }}>
      <h4 style={{ textAlign: 'center', margin: '0 0 0.5rem' }}>{title}</h4>
      <svg width={width} height={height} style={{ background: 'rgba(28, 41, 48, 0.5)', borderRadius: '8px' }}>
        {/* Axes */}
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#F4F0E8" strokeWidth="2" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#F4F0E8" strokeWidth="2" />
        
        {/* Labels */}
        <text x={width / 2} y={height - 10} fill="#F4F0E8" fontSize="12" textAnchor="middle">{xLabel}</text>
        <text x={15} y={height / 2} fill="#F4F0E8" fontSize="12" textAnchor="middle" transform={`rotate(-90 15,${height/2})`}>{yLabel}</text>
        
        {/* Line */}
        <polyline fill="none" stroke={color} strokeWidth="3" points={pointsStr} />

        {/* Current point highlight */}
        {currentPoint && (
          <circle cx={getX(currentPoint.x)} cy={getY(currentPoint.y)} r="5" fill="#F5A66A" />
        )}
      </svg>
    </div>
  );
}

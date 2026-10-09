import React from 'react'
import { CircuitNode } from './domain/CircuitSolver'

interface Props {
  node: CircuitNode
  onAdd: (parentId: string, type: 'resistor' | 'series' | 'parallel') => void
  onRemove: (id: string) => void
  onUpdate: (id: string, R: number) => void
  isRoot?: boolean
}

export function CircuitView({ node, onAdd, onRemove, onUpdate, isRoot = false }: Props) {
  
  if (node.type === 'resistor') {
    return (
      <div className="circuit-resistor">
        <div className="resistor-symbol"></div>
        <div className="resistor-info">
          <input 
            type="number" 
            min="1" 
            value={node.R} 
            onChange={e => onUpdate(node.id, Number(e.target.value))} 
            title="Resistencia (Ω)"
          /> Ω
          <br/>
          <span className="tiny-info">{node.V?.toFixed(1)}V, {node.I?.toFixed(1)}A</span>
        </div>
        <button className="del-btn" onClick={() => onRemove(node.id)}>x</button>
      </div>
    )
  }

  return (
    <div className={`circuit-group circuit-${node.type} ${isRoot ? 'root-group' : ''}`}>
      <div className="group-label">
        {node.type === 'series' ? 'Serie' : 'Paralelo'} 
        <span className="tiny-info">({node.Req?.toFixed(1)}Ω)</span>
        <div className="group-actions">
          <button onClick={() => onAdd(node.id, 'resistor')}>+ R</button>
          <button onClick={() => onAdd(node.id, 'series')}>+ Serie</button>
          <button onClick={() => onAdd(node.id, 'parallel')}>+ Paralelo</button>
          {!isRoot && <button className="del-btn" onClick={() => onRemove(node.id)}>x</button>}
        </div>
      </div>
      <div className="group-children">
        {node.children?.map(child => (
          <CircuitView 
            key={child.id} 
            node={child} 
            onAdd={onAdd} 
            onRemove={onRemove} 
            onUpdate={onUpdate} 
          />
        ))}
      </div>
    </div>
  )
}

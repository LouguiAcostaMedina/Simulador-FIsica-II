import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CircuitNode, CircuitSolver } from './domain/CircuitSolver'
import { CircuitView } from './CircuitView'
import { RCView } from './RCView'

export default function CurrentModule() {
  const [activeTab, setActiveTab] = useState<'ohm' | 'rc'>('ohm')
  const [voltage, setVoltage] = useState(12)
  const [root, setRoot] = useState<CircuitNode>({
    id: 'root',
    type: 'series',
    children: [
      { id: 'r1', type: 'resistor', R: 10 },
      { id: 'r2', type: 'resistor', R: 20 }
    ]
  })

  // Evaluated tree
  const solvedTree = useMemo(() => CircuitSolver.solveTree(root, voltage), [root, voltage])

  // Helper to add nodes
  const addNode = (parentId: string, type: 'resistor' | 'series' | 'parallel') => {
    const newNode: CircuitNode = type === 'resistor' 
      ? { id: Math.random().toString(36).substr(2, 6), type, R: 10 }
      : { id: Math.random().toString(36).substr(2, 6), type, children: [] }

    const traverseAndAdd = (node: CircuitNode): CircuitNode => {
      if (node.id === parentId && node.children) {
        return { ...node, children: [...node.children, newNode] }
      }
      if (node.children) {
        return { ...node, children: node.children.map(traverseAndAdd) }
      }
      return node
    }
    setRoot(traverseAndAdd(root))
  }

  const removeNode = (id: string) => {
    if (id === 'root') return;
    const traverseAndRemove = (node: CircuitNode): CircuitNode => {
      if (node.children) {
        return { 
          ...node, 
          children: node.children.filter(c => c.id !== id).map(traverseAndRemove) 
        }
      }
      return node
    }
    setRoot(traverseAndRemove(root))
  }

  const updateResistor = (id: string, R: number) => {
    const traverseAndUpdate = (node: CircuitNode): CircuitNode => {
      if (node.id === id) {
        return { ...node, R }
      }
      if (node.children) {
        return { ...node, children: node.children.map(traverseAndUpdate) }
      }
      return node
    }
    setRoot(traverseAndUpdate(root))
  }

  return (
    <div className="electric-layout current-module">
      <aside className="electric-sidebar">
        <div className="sidebar-header">
          <Link to="/" className="back-link">← Hub</Link>
          <h2>Corriente y Ohm</h2>
        </div>

        <div className="sim-controls" style={{ padding: '0 1rem' }}>
           <button className={activeTab === 'ohm' ? '' : 'secondary'} onClick={() => setActiveTab('ohm')}>Ohm y Circuitos</button>
           <button className={activeTab === 'rc' ? '' : 'secondary'} onClick={() => setActiveTab('rc')}>Circuito RC</button>
        </div>
        
        {activeTab === 'ohm' && (
          <>
            <section className="control-group">
              <h3>Fuente de Poder</h3>
              <div className="input-row">
                <label>Voltaje (V): <input type="number" min="0" value={voltage} onChange={e => setVoltage(Number(e.target.value))} /></label>
              </div>
            </section>

            <section className="control-group">
              <h3>Resultados Totales</h3>
              <ul className="metrics-list">
                <li>R Equivalente: <span>{solvedTree.Req?.toFixed(2)} Ω</span></li>
                <li>Corriente I: <span>{solvedTree.I?.toFixed(2)} A</span></li>
                <li>Potencia P: <span>{solvedTree.P?.toFixed(2)} W</span></li>
              </ul>
            </section>

            <section className="control-group">
              <h3>Balance de Potencia</h3>
              <p className="caption">La potencia entregada por la fuente debe ser igual a la suma de la potencia disipada por las resistencias.</p>
            </section>
          </>
        )}
        
        {activeTab === 'rc' && (
          <section className="control-group">
            <h3>Carga y Descarga</h3>
            <p className="caption">Observa el comportamiento temporal de V e I en un circuito con resistor y capacitor conectados en serie a una fuente o en corto.</p>
          </section>
        )}
      </aside>

      <main className="electric-canvas-area">
        <div className="canvas-container circuit-container">
           {activeTab === 'ohm' ? (
             <CircuitView 
               node={solvedTree} 
               onAdd={addNode} 
               onRemove={removeNode} 
               onUpdate={updateResistor} 
               isRoot={true} 
             />
           ) : (
             <RCView />
           )}
        </div>
      </main>
    </div>
  )
}

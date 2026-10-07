# Decisiones de Arquitectura: ADR-001 Stack Tecnológico

**Decisión**: Usar React + TypeScript + Vite, y `@react-three/fiber` para el 3D.
**Justificación**: Permite prototipar interfaces modulares de forma robusta. TypeScript asegura la rigurosidad de los cálculos físicos. `@react-three/fiber` acorta significativamente el tiempo de desarrollo 3D comparado con Three.js puro, permitiendo enfocarnos en las fórmulas.
**Alternativas Descartadas**: Unity/WebGL (demasiado pesado y opaco para web docs). HTML Canvas simple (no alcanza para los requisitos 3D de la U2).

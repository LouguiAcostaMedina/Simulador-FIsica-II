# Arquitectura

El proyecto sigue una arquitectura limpia adaptada para React y simulación física:
- **`app/`**: Hub y rutas principales.
- **`shared/`**: Vectores, constantes, dominios base.
- **`modules/`**: Agrupación por unidad física (U1, U2, etc.).
  - **`domain/`**: Cálculos físicos puros (FieldMath, CapacitorMath), independientes de la UI.
  - **`application/`**: Estado y lógica de simulación (ElectricSimulation, hooks).
  - **`presentation/`**: Componentes React, Three.js (fibras) y Canvas 2D.

# Bitácora de Desarrollo — Laboratorio Vectorial (V2)

## Hito 0 — Estado y línea base
- **Fecha:** 9 de noviembre de 2026
- **Rama:** `feat/laboratorios-interactivos-ui-v2` (creada a partir de `origin/main` @ `272bd20`)
- **Herramientas:**
  - Node.js: `v22.16.0`
  - npm: `11.5.2`
  - OS: Windows 11 (PowerShell)
- **Resultados de línea base:**
  - `npm ci`: Completado con éxito (361 paquetes, 0 errores).
  - `npm run lint`: Detectó 5 problemas (4 errores y 1 warning) en `Electric2DView.tsx` y `Magnetism3DView.tsx`. Reparados limpiamente (`prefer-const`, dependencias de `useEffect` y bloques `catch` vacíos).
  - `npm run typecheck`: Exitoso (0 errores TypeScript).
  - `npm test`: Exitoso (5 suites de prueba, 14 pruebas analíticas aprobadas).
  - `npm run build`: Exitoso (bundle generado en `dist/` en 41.6s).
- **Diagnóstico de archivos especiales:**
  - `.gitignore`: Tenía 99 bytes con caracteres nulos (`\x00`) producidos por la concatenación de líneas en codificación UTF-16LE en PowerShell sobre un archivo UTF-8. Reescrito limpiamente en UTF-8 estándar.
  - `src/modules/electric/presentation/ElectricModule.css`: Archivo anómalo de 6 bytes (`FF FE 0D 00 0A 00`, BOM UTF-16 y salto de línea vacío). Restaurado en UTF-8 con estilos completos.
  - `vite.config.js` y `vite.config.d.ts`: Preservados intactos en el repositorio conforme a la consigna.
- **Estado de Hito 0:** COMPLETADO (APROBADO).

---

## Hito 1 — Base visual, LabShell, Inspector, Gráficas y Hub Rediseñado
- **Estado:** COMPLETADO (APROBADO)
- **Implementado:**
  - Tokens de diseño científico contemporáneo en `src/shared/ui/design-tokens/tokens.css` de alto contraste (#111A20, #1C2930, #F4F0E8, #42D7C8, #F5A66A, #B69BE8, #5C9CE6).
  - Componente de gráficas científicas `ScientificChart.tsx` con cursor interactivo crosshair, tooltip dinámico con unidades SI, auto-escalado con márgenes, marcas de ejes y leyenda conmutadora.
  - Inspector contextual `Inspector.tsx` con campos numéricos sincronizados con sliders, visualización de métricas físicas, validación in situ y estado vacío informativo.
  - Layout estándar `LabShell.tsx` con selector de modo `[Simulador] [Laboratorio]`, conmutador 2D/3D, barra superior, 3 columnas responsivas (biblioteca, lienzo, inspector), panel inferior de resultados y drawer móvil accesible.
  - Vista honesta de laboratorio en desarrollo `LabPlaceholderView.tsx` para guiar al estudiante sobre capacidades físicas y conmutar al simulador con 1 clic.
  - Rediseño completo del Hub (`src/app/Hub.tsx`, `Hub.css`) con hero científico, 4 tarjetas operativas con ilustraciones vectoriales únicas, eliminación definitiva del estado "Próximamente", accesos duales a Simulador y Laboratorio, recorridos pedagógicos y guía de simbología.
  - Integración del selector de modo y lectura de query params (`?mode=simulator` / `?mode=laboratory`) en las 4 unidades (`/electric`, `/capacitors`, `/current`, `/magnetism`).
- **Verificación:**
  - `npm run lint`: 0 errores, 0 warnings.
  - `npm run typecheck`: 0 errores de tipado.
  - `npm test`: 14 pruebas analíticas aprobadas en 5 archivos de prueba.
  - `npm run build`: Compilación limpia en 1m 20s.

---

## Hito 2 — Laboratorio de Circuitos U3 (Máxima Prioridad)
- **Estado:** COMPLETADO (APROBADO)
- **Implementado:**
  - Modelo de circuito en TypeScript puro en `src/modules/current/domain/CircuitNetlist.ts`: `CircuitComponent`, `Terminal`, `Wire`, `CircuitNetlist`, `ComponentSimulationResult`, `SimulationResult`.
  - Solucionador exacto DC por Análisis Nodal Modificado (MNA) en `src/modules/current/domain/DCSolver.ts`:
    - Extracción topológica de nodos mediante Disjoint-Set / bosque de terminales conectados por cables.
    - Detección rigurosa de cortocircuitos directos entre terminales de la fuente.
    - Matriz MNA `[G | B; C | D][v; j] = [i; e]` con solución por Eliminación Gaussiana con pivoteo parcial.
    - Soporte completo para fuentes DC ideales, resistores, bombillas con brillo proporcional a $P/P_{nom}$, interruptores abiertos/cerrados, amperímetros ideales (0 V), voltímetros y fusibles de disparo determinista.
    - Conservación estricta de energía: balance de potencia suministrada vs disipada ($P_{in} = \sum P_{out}$) con tolerancia $< 10^{-5}$ W.
  - Lienzo interactivo SVG `CircuitCanvas.tsx` y `CircuitCanvas.css`:
    - Cuadrícula con `snap-to-grid` (20 px), zoom por rueda / botones (40% a 250%) y desplazamiento (pan).
    - Arrastre de piezas, selección, rotación 90° con atajo de teclado 'R'.
    - Cableado interactivo terminal a terminal con cursor de mira y banner de conexión.
    - Visualización de flujo de corriente simbólico mediante trazos animados en ramas activas.
    - Alternancia directa de interruptor con clic sobre la palanca.
  - Entorno de laboratorio completo `CircuitLaboratoryView.tsx` y `CircuitLaboratoryView.css`:
    - Integración con `LabShell`: barra superior, biblioteca lateral izquierda con 7 componentes y 5 presets didácticos.
    - Inspector contextual lateral derecho: edición de voltajes, resistencias, interruptores, fusible y métricas instantáneas ($V, I, P$).
    - Panel inferior de resultados con gráfica $I-V$ en tiempo real (`ScientificChart`), tabla de corrientes por elemento y comprobación analítica de potencia.
    - Historial de estados con soporte para Deshacer (Ctrl+Z) y Rehacer (Ctrl+Y).
    - Conexión condicional en `CurrentModule.tsx` cuando `labMode === 'laboratory'`.
- **Verificación:**
  - `DCSolver.test.ts`: 4 pruebas analíticas aprobadas (caso mixto de aceptación $12\text{ V}, 10\ \Omega + [20\ \Omega \parallel 20\ \Omega] \to R_{eq}=20\ \Omega, I=0.6\text{ A}, P=7.2\text{ W}$; recálculo al abrir interruptor en rama $R_2 \to R_{eq}=30\ \Omega, I=0.4\text{ A}, P=4.8\text{ W}$; cortocircuito; sin fuente).
  - `CircuitLaboratoryView.test.tsx`: 3 pruebas completas de interacción en DOM con `@testing-library/react` aprobadas (renderizado del caso de aceptación, alternancia de presets con apertura de interruptor y vaciado/agregado desde biblioteca).
  - `npm test`: 21 pruebas aprobadas en 7 archivos.
  - `npm run typecheck`: 0 errores.
  - `npm run lint`: 0 errores, 0 warnings.
  - `npm run build`: Compilación exitosa de producción en 39.4s.

---

## Hito 3 — Renovación del Simulador U3 e Integración Didáctica
- **Estado:** Pendiente
- **Objetivos:**
  - Renovar la presentación del Simulador U3 (conservando el `CircuitSolver` de árbol y `RCView`).
  - Integrar en la UI las magnitudes físicas de electrodinámica: $I=\Delta Q/\Delta t$, densidad de corriente $J=I/A$, velocidad de deriva $v_d=I/(n|q|A)$ y resistencia material $R=\rho L/A$.
  - Explicar y contrastar en pantalla el sentido de corriente convencional frente a la deriva real de electrones.
  - Reparar el signo físico de la corriente en la descarga del circuito RC ($\tau = RC$), manteniendo magnitudes positivas o convención explícita con pausa y reinicio.




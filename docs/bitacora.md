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
- **Estado:** En progreso
- **Objetivos:**
  - Modelado formal de circuito en TypeScript puro: `Component`, `Terminal`, `Wire`, `Netlist`, `SimulationResult`.
  - Solucionador DC exacto por Análisis Nodal Modificado (MNA) con leyes de Kirchhoff (KCL/KVL), soporte de resistores, fuentes de voltaje ideales, interruptores abiertos/cerrados, bombillas resistivas e instrumentos virtuales (amperímetro/voltímetro).
  - Detección precisa de singularidades y fallos topológicos: circuito abierto, nodos flotantes, cortocircuito de fuente con mensaje concreto.
  - Canvas SVG interactivo para cableado libre con snap-to-grid, pan, zoom, arrastre de piezas, selección, rotación 90°, creación de cables terminal-a-terminal, borrado y presets (serie, paralelo, mixto, bombilla, switch).
  - Validación del caso de aceptación: 12 V, 10 Ω en serie con (20 Ω || 20 Ω) -> Req = 20 Ω, I = 0.6 A, P = 7.2 W.



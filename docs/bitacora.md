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
- **Estado:** COMPLETADO (APROBADO)
- **Implementado:**
  - Integración didáctica de Electrodinámica Microscópica en `ElectrodynamicsView.tsx` y `ElectrodynamicsView.css`:
    - Relación de flujo de portadores $I = \Delta Q / \Delta t$, densidad de corriente $J = I / A$ y velocidad de deriva $v_d = I / (n \cdot e \cdot A)$.
    - Resistencia geométrica $R = \rho L / A$ con 5 materiales reales (Cobre, Plata, Aluminio, Oro, Tungsteno).
    - Diagrama explicativo que contrasta el sentido de corriente convencional con la deriva de electrones (modelo de Drude) y explica la aparente paradoja de la velocidad microscópica ($v_d \sim 0.1\text{ mm/s}$) frente a la velocidad de propagación de la onda electromagnética ($c \sim 2\times 10^8\text{ m/s}$).
  - Renovación del simulador de transitorios `RCView.tsx` y `RCView.css`:
    - Incorporación de `ScientificChart` con series duales para $V(t)$ e $I(t)$ y cursor crosshair.
    - Corrección del signo de corriente en descarga: opción conmutable entre magnitud $|I|$ y convención física con signo negativo ($-I$).
    - Esquema animado del circuito RC con acumulación de carga en placas $Q(t) = C \cdot V(t)$.
    - Controles de reproducción: Iniciar/Pausar, Paso (+0.1τ), Reiniciar y selector de velocidad (0.5x, 1x, 2x).
  - Selector de sub-vistas didácticas en el Simulador de U3:
    - 1. Ohm y Redes en Árbol (`CircuitView.tsx`).
    - 2. Electrodinámica (`ElectrodynamicsView.tsx`).
    - 3. Circuito RC Transitorio (`RCView.tsx`).
  - Pruebas analíticas adicionales en `CurrentMath.test.ts` cubriendo cálculo de $J, v_d$, validación de áreas nulas y valores negativos.
- **Verificación:**
  - `npm test`: 22 pruebas aprobadas en 7 archivos.
  - `npm run typecheck`: 0 errores de tipado.
  - `npm run lint`: 0 errores, 0 warnings.
  - `npm run build`: Compilación exitosa en 40.3s.

---

## Hito 4 — U1: Simulador y Laboratorio de Electrostática
- **Estado:** COMPLETADO (APROBADO)
- **Implementado:**
  - Snapshot exacto de condiciones iniciales en `src/modules/electric/application/ElectricSimulation.ts` y sincronización reactiva en `useElectricSimulation.ts` con soporte para ejecución paso a paso (`step()`).
  - Algoritmo clásico de Marching Squares para contornos equipotenciales exactos en dominio puro en `src/modules/electric/domain/MarchingSquares.ts`.
  - Integración de Marching Squares en el lienzo `Electric2DView.tsx` para generar isolíneas continuas y suaves que reemplazan el coloreado discreto anterior.
  - Laboratorio completo de Electrostática en `src/modules/electric/presentation/ElectricLaboratoryView.tsx` y `ElectricLaboratoryView.css`:
    - Mesa de trabajo interactiva 2D con rejilla métrica SI y coordenadas reales.
    - Paleta de adición rápida de cargas ($+1\ \mu\text{C}, +5\ \mu\text{C}, -1\ \mu\text{C}, -5\ \mu\text{C}$) con arrastre libre y límite didáctico de 10 cargas.
    - Presets experimentales: Carga única positiva/negativa, Dipolo simétrico, Cuadrupolo 2D y Placas paralelas simuladas con 6 cargas.
    - Sondas de medición móviles: Sonda de campo $\vec{E}$ (muestra vector, magnitud en N/C, componentes y ángulo $\theta$) y Sonda de potencial $V$ (voltímetro con trazado de isolínea local personalizada).
    - Partícula de prueba manipulable con controles de Lanzar, Pausar, Paso y Reinicio estricto que restaura el snapshot inicial exacto.
    - Capas conmutables: Líneas de campo, Isolíneas equipotenciales, Vectores discretos, Sondas de medición, Trayectoria de partícula y Rejilla métrica.
    - Inspector contextual: permite editar magnitud de carga ($\mu\text{C}$), coordenadas $X, Y$, invertir polaridad o eliminar; inspeccionar sondas y leer la energía cinética y velocidad instantánea de la partícula.
  - Pruebas unitarias y de integración:
    - `MarchingSquares.test.ts`: 5 pruebas (interpolación lineal, filtrado de singularidades NaN/infinitos, valores fuera de rango).
    - `ElectricSimulation.test.ts`: 4 pruebas (toma de snapshot, restauración estricta, reproducibilidad idéntica de trayectorias, límite de 10 cargas).
    - `ElectricLaboratoryView.test.tsx`: 4 pruebas de interacción en DOM (renderizado, paleta de cargas, presets y ciclo de simulación de partícula).
- **Verificación:**
  - `npm test`: 35 pruebas aprobadas en 10 archivos.
  - `npm run typecheck`: 0 errores.
  - `npm run lint`: 0 errores, 0 warnings.
  - `npm run build`: Compilación limpia en 45.4s.

---

## Hito 5 — U2: Simulador y Laboratorio de Capacitores
- **Estado:** COMPLETADO (APROBADO)
- **Implementado:**
  - Modelo físico de inserción parcial de dieléctrico en `src/modules/capacitors/domain/CapacitorMath.ts`:
    - Modelo riguroso de capacitores equivalentes en paralelo por fracción de área: $C_{eq} = \frac{\varepsilon_0 A}{d} [1 + (\varepsilon_r - 1) f]$.
    - Cálculo de fuerza electrostática sobre la lámina $F_{slab} = \frac{1}{2} (\varepsilon_r - 1) \varepsilon_0 W \frac{V^2}{d}$.
    - Biblioteca de materiales dieléctricos estándar (`STANDARD_DIELECTRICS`: Vacío, Papel Parafinado, Vidrio Pyrex, Mica, Titanato de Bario).
    - Validación de magnitudes estrictamente positivas ($A > 0, d > 0, \varepsilon_r \ge 1$).
  - Vista interactiva 2D `Capacitor2DView.tsx` y `Capacitor2DView.css`:
    - Esquema de placas con cargas reales $+Q$ y $-Q$, líneas de campo eléctrico $\vec{E}$, polarización interior $\vec{P}$ y conexiones a batería o interruptor abierto.
    - Handles interactivos táctiles y de ratón en el lienzo para ajustar distancia $d$, área $A$ e inserción de dieléctrico.
    - Utilizado como fallback funcional al 100% en `CapacitorsModule.tsx` cuando WebGL no está disponible o falla.
  - Laboratorio completo `CapacitorLaboratoryView.tsx` y `CapacitorLaboratoryView.css`:
    - Integración con `LabShell`, selector de modo, dimensiones 2D/3D conmutables.
    - Presets experimentales: Vacío estándar, Dieléctrico con $V$ fijo (batería conectada), Dieléctrico con $Q$ fijo (batería aislada) y Gran separación de placas.
    - Inspector contextual: ajuste de $A, d, \varepsilon_r$, porcentaje de inserción, voltaje o carga fijada; lectura de $C, Q, V, E, U, F_{slab}$.
    - Comparador de escenario base con cálculo explícito del trabajo de la batería $W_{bat} = V \cdot \Delta Q = 2 \Delta U$ en modo $V$ fijo.
    - Gráfica dinámica `ScientificChart` con selector de curvas: $C(d) \propto 1/d$, $U(V) \propto V^2$ y $C(f)$ lineal.
  - Pruebas unitarias y de integración:
    - `CapacitorMath.test.ts`: 6 pruebas analíticas (duplicar $A$, duplicar $d$, dieléctrico en $V$ fijo, dieléctrico en $Q$ fijo, inserción al 50% y rechazo de parámetros no físicos).
    - `CapacitorLaboratoryView.test.tsx`: 4 pruebas de interacción en DOM (renderizado, alternancia $V$ fijo/$Q$ fijo, preset con $W_{bat}$ y selector de materiales).
- **Verificación:**
  - `npm test`: 41 pruebas aprobadas en 11 suites.
  - `npm run typecheck`: 0 errores.
  - `npm run lint`: 0 errores, 0 warnings.
  - `npm run build`: Compilación exitosa en 44.1s.

---

## Hito 6 — U4: Simulador y Laboratorio de Magnetismo
- **Estado:** En progreso
- **Objetivos:**
  - Implementar integrador Boris pusher en `src/modules/magnetism/domain/MagnetismMath.ts` para resolver la ecuación de Lorentz $\vec{F} = q(\vec{E} + \vec{v} \times \vec{B})$ con conservación estricta de rapidez ($|\vec{v}| = \text{cte}$) cuando $\vec{E} = 0$.
  - Fallback 2D sin WebGL en U4 (`MagnetismModule.tsx`).
  - Laboratorio interactivo de magnetismo (`MagnetismLaboratoryView.tsx`) con:
    - Conductor rectilíneo infinito con corriente $I$ y campo de Biot-Savart $B = \frac{\mu_0 I}{2\pi r}$.
    - Aproximación de dipolo magnético $\vec{B}(\vec{r}) = \frac{\mu_0}{4\pi} \frac{3(\vec{m}\cdot\hat{r})\hat{r} - \vec{m}}{r^3}$.
    - Sonda de medición de $\vec{B}$ (con aguja de brújula / magnetómetro en $\mu\text{T}$ o $\text{mT}$).
    - Región de campo uniforme cruzado $\vec{E} \perp \vec{B}$ (selector de velocidades de Wien $v = E/B$).
    - Lanzamiento de partículas cargadas con Boris pusher, radio de Larmor $r_L = \frac{mv_\perp}{|q|B}$ y frecuencia de ciclotrón $\omega_c = \frac{|q|B}{m}$.





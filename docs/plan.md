# Plan de Entrega y Backlog de Producto — Laboratorio Vectorial (V2)

## 1. Visión General del Proyecto
Laboratorio Vectorial es una aplicación web interactiva para la enseñanza de **Física II** en **Ingeniería de Sistemas**. Proporciona una doble modalidad para cada una de las cuatro unidades temáticas:
- **Modo Simulador:** Experimentación cuantitativa y paramétrica con soporte 2D/3D.
- **Modo Laboratorio:** Mesa interactiva con herramientas de arrastre (`drag & drop`), cableado visual de circuitos, sondas de medición móvil e inspector contextual de propiedades.

---

## 2. Estado de Hitos del Proyecto

| Hito | Alcance / Módulo | Estado | Evidencia y Criterio de Aceptación |
| :--- | :--- | :--- | :--- |
| **Hito 0** | Línea Base y Reparación | **APROBADO** | `npm ci`, corrección de codificación UTF-8 en `.gitignore` y `ElectricModule.css`, 0 errores lint/typecheck. |
| **Hito 1** | Base Visual, LabShell y Hub Rediseñado | **APROBADO** | Tokens científicos, `ScientificChart` con crosshair, `Inspector` contextual, `LabShell` 3 columnas y Hub sin "Próximamente". |
| **Hito 2** | Laboratorio U3: Circuitos DC (Máxima Prioridad) | **APROBADO** | Modelo Netlist, solver MNA en TypeScript puro, lienzo SVG interactivo con cableado, caso mixto $12\text{ V}, 10\ \Omega + [20\ \Omega \parallel 20\ \Omega] \to 20\ \Omega, 0.6\text{ A}, 7.2\text{ W}$, interruptores dinámicos y conservación de energía. |
| **Hito 3** | Renovación del Simulador U3 | **APROBADO** | Vistas de Electrodinámica (flujo, $J$, velocidad de deriva de electrones $v_d$, modelo de Drude, resistencia geométrica de 5 metales) y transitorio RC con `ScientificChart` y signo físico conmutable en descarga. |
| **Hito 4** | U1: Simulador y Laboratorio de Electrostática | **APROBADO** | Algoritmo Marching Squares para isolíneas 2D continuas, snapshot de condiciones iniciales para reinicio reproducible, mesa de cargas, sondas $\vec{E}$ y $V$, partícula de prueba y capas conmutables. |
| **Hito 5** | U2: Simulador y Laboratorio de Capacitores | **APROBADO** | Placas paralelas interactivas, inserción parcial de dieléctrico mediante modelo de capacitores en paralelo con fuerza atractiva, conmutación $V$ fijo vs $Q$ fijo con balance de trabajo de batería, y fallback 2D funcional al 100%. |
| **Hito 6** | U4: Simulador y Laboratorio de Magnetismo | **APROBADO** | Hilo rectilíneo (Biot-Savart), dipolo magnético, selector de velocidades de Wien ($v = E/B$), integrador Boris Pusher con conservación estricta de rapidez ($|\vec{v}| = \text{cte}$) en 500 pasos cuando $\vec{E}=0$, y fallback 2D. |
| **Hito 7** | Calidad, E2E, Documentación y Cierre | **APROBADO** | Workflow de CI en GitHub Actions (`.github/workflows/ci.yml`), pruebas E2E de navegación (`AppNavigation.test.tsx`), suite completa de 47 pruebas en 12 archivos aprobadas, y actualización de toda la documentación. |

---

## 3. Criterios de Aceptación Observables

### Criterio Clave de Aceptación de Circuitos (U3)
- [x] **Construcción en Lienzo:** Conectar una fuente de $12\text{ V}$ con una resistencia $R_1 = 10\ \Omega$ en serie con el paralelo de $R_2 = 20\ \Omega \parallel R_3 = 20\ \Omega$.
- [x] **Valores Numéricos Esperados:**
  - $R_{eq} = 20.00\ \Omega$
  - $I_{fuente} = 0.600\text{ A}$
  - $V_1 = 6.00\text{ V}$, $P_1 = 3.60\text{ W}$
  - $I_2 = I_3 = 0.300\text{ A}$, $P_2 = P_3 = 1.80\text{ W}$
  - $P_{suministrada} = 7.200\text{ W}$, $P_{disipada} = 7.200\text{ W}$
  - Balance de Potencia: $P_{in} - P_{out} = 0.000\text{ W}$.
- [x] **Apertura de Interruptor en Rama:** Al abrir un interruptor en la rama de $R_2$, la corriente en $R_2$ pasa inmediatamente a $0\text{ A}$ y el circuito se recalcula en serie: $R_{eq} = 30\ \Omega, I = 0.400\text{ A}, P = 4.800\text{ W}$.

### Criterio de Conservación en Magnetismo (U4)
- [x] **Conservación de Rapidez:** Bajo campo magnético constante $\vec{B}$ con $\vec{E} = 0$, el integrador Boris Pusher debe conservar la rapidez $|\vec{v}|$ a lo largo de 500 pasos temporales con tolerancia $|\Delta |\vec{v}|| < 10^{-8}\text{ m/s}$.
- [x] **Selector de Wien:** Con $\vec{E} \perp \vec{B}$ y $v_0 = E/B$, la partícula no sufre deflexión transversal y mantiene trayectoria rectilínea.

### Criterio de Reproducibilidad en Electrostática (U1)
- [x] **Snapshot de Condiciones Iniciales:** Al pulsar "Reiniciar" tras cualquier simulación de partícula de prueba, sus coordenadas de posición, vector velocidad, tiempo $t=0$ y traza regresan de forma determinista al snapshot original.

### Criterio de Resiliencia Gráfica (U1, U2, U4)
- [x] **Fallback 2D sin WebGL:** Si un navegador carece de contexto WebGL o sufre pérdida de contexto (`webglcontextlost`), la aplicación conmuta a la vista 2D interactiva sin pérdida de datos ni error fatal de JavaScript.

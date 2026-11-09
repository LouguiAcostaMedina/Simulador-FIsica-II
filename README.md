# Laboratorio Vectorial — Física II e Ingeniería de Sistemas

Simulador y entorno de experimentación de campos electromagnéticos y circuitos en tiempo real. Aplicación web científica en español construida con React 18, TypeScript 5, Three.js / React Three Fiber y Vite, sin backend, ejecutada íntegramente en el navegador del cliente bajo unidades del Sistema Internacional (SI).

---

## ⚡ Características Principales

1. **Arquitectura Dual por Unidad:**
   - **Modo Simulador:** Experimentación paramétrica continua con visualizaciones 2D/3D interactivas, controles analíticos y cálculo de magnitudes.
   - **Modo Laboratorio:** Mesa de experimentación didáctica interactiva (`drag & drop`, snap-to-grid, cableado interactivo, sondas de medición móvil e inspector contextual).
2. **Motores de Cálculo en Dominio Puro:**
   - **U1 (Electrostática):** Campo $\vec{E}$ y potencial escalar $V$ por superposición lineal de hasta 10 cargas, contornos equipotenciales continuos mediante algoritmo **Marching Squares**, y dinámica de partícula con **snapshot de condiciones iniciales** para reinicio estricto y reproducible.
   - **U2 (Capacitores):** Modelo analítico de placas paralelas ideales, conmutación estricta entre **Batería Conectada ($V$ fijo)** y **Batería Desconectada ($Q$ fijo)** con balance de energía real ($W_{bat} = 2\Delta U$), e inserción continua parcial de dieléctrico mediante modelo de capacitores equivalentes en paralelo con fuerza electrostática sobre la lámina.
   - **U3 (Corriente y Circuitos DC):** Solucionador nodal **Modified Nodal Analysis (MNA)** en TypeScript puro con matrices $G, B, C, D$ y eliminación gaussiana con pivoteo parcial. Soporta fuentes ideales, resistores, bombillas con brillo dinámico, interruptores, amperímetros, voltímetros y fusibles deterministas con conservación estricta de energía ($\sum P_{in} = \sum P_{out}$). Simulador con modelo microscópico de Drude, velocidad de deriva $v_d$ y circuito transitorio RC con gráfica $V(t), I(t)$ en `ScientificChart` y signo físico conmutable en descarga.
   - **U4 (Magnetismo):** Ley de Biot-Savart para hilo infinito ($B \propto 1/r$), aproximación de dipolo magnético ($B \propto 1/r^3$), región de campos cruzados (Selector de velocidades de Wien $v = E/B$) y dinámica de partículas cargadas resuelta mediante el integrador simpléctico canónico **Boris Pusher**, garantizando conservación incondicional de la rapidez ($|\vec{v}| = \text{cte}$) cuando $\vec{E} = 0$.
3. **Resiliencia Gráfica y Accesibilidad:**
   - **Fallback 2D Completo:** Si un equipo carece de aceleración WebGL o se pierde el contexto 3D, todas las unidades disponen de un lienzo 2D completamente interactivo que permite continuar el experimento sin pérdida de datos.
   - **Diseño Editorial "Cuaderno Experimental Contemporáneo":** Paleta de alto contraste (#111A20, #1C2930, #F4F0E8, #42D7C8, #F5A66A, #B69BE8), tipografía monoespaciada legible para magnitudes físicas, foco visible, atajos de teclado y cumplimiento de `prefers-reduced-motion`.

---

## 🧭 Mapa de Unidades y Rutas

| Unidad | Título | Modalidad | Modelo Físico Clave | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Hub** | Portada y Selección | Central (`/`) | Navegación responsiva a las 4 unidades | **Operativo** |
| **U1** | Campo y Potencial Eléctrico | `/electric` | Coulomb, Superposición, Marching Squares 2D, Euler-Cromer | **Operativo & Validado** |
| **U2** | Capacitores y Dieléctricos | `/capacitors` | $C = \varepsilon_0 \varepsilon_r A / d$, $V$ fijo vs $Q$ fijo, inserción parcial | **Operativo & Validado** |
| **U3** | Corriente, Ley de Ohm y Redes | `/current` | Solver MNA DC, Kirchhoff, Drude $v_d$, RC transitorio $\tau=RC$ | **Operativo & Validado** |
| **U4** | Fuerza y Campo Magnético | `/magnetism` | Biot-Savart, Lorentz $\vec{F} = q(\vec{E} + \vec{v}\times\vec{B})$, Boris Pusher | **Operativo & Validado** |

---

## 🛠 Requisitos e Instalación

### Requisitos del Sistema
- **Node.js:** Versión 18.x, 20.x o 22.x (verificado en `v22.16.0`).
- **npm:** Versión 10.x u 11.x (verificado en `11.5.2`).
- **Navegador:** Cualquier navegador moderno compatible con ECMAScript 2022 y Canvas 2D / WebGL (Chrome, Edge, Firefox, Safari).

### Comandos de Desarrollo
```bash
# 1. Instalar dependencias limpias
npm ci

# 2. Iniciar servidor de desarrollo local
npm run dev

# 3. Comprobación estricta de tipos TypeScript
npm run typecheck

# 4. Análisis estático de código con ESLint
npm run lint

# 5. Ejecutar suite de pruebas analíticas e integración (Vitest)
npm test

# 6. Compilar paquete de producción estático (dist/)
npm run build

# 7. Previsualizar la compilación de producción localmente
npm run preview
```

---

## 🔬 Caso de Aceptación Clave Verificado (U3)

Construcción física en el Laboratorio de Circuitos:
- **Fuente DC:** $V = 12\text{ V}$.
- **Red Mixta:** Resistencia $R_1 = 10\ \Omega$ en serie con el paralelo de $(R_2 = 20\ \Omega \parallel R_3 = 20\ \Omega)$.
- **Resultados Analíticos y Obtenidos:**
  - $R_{p} = \frac{20 \cdot 20}{20 + 20} = 10\ \Omega$.
  - $R_{eq} = 10 + 10 = 20\ \Omega$.
  - $I_{total} = \frac{12\text{ V}}{20\ \Omega} = 0.600\text{ A}$.
  - $V_1 = 0.6\text{ A} \times 10\ \Omega = 6.00\text{ V}$, $P_1 = 3.60\text{ W}$.
  - $I_2 = I_3 = 0.300\text{ A}$, $P_2 = P_3 = 1.80\text{ W}$.
  - $P_{suministrada} = 12\text{ V} \times 0.6\text{ A} = 7.200\text{ W}$.
  - $P_{disipada} = 3.60 + 1.80 + 1.80 = 7.200\text{ W}$.
  - **Balance de Energía:** $\sum P_{in} = \sum P_{out} = 7.200\text{ W}$ (error $< 10^{-6}\text{ W}$).
- **Apertura de interruptor en rama $R_2$:**
  - La rama $R_2$ pasa a mostrar $I = 0.000\text{ A}$.
  - La red se recalcula en serie $R_1 + R_3 = 30\ \Omega \to I = 0.400\text{ A}, P_{total} = 4.800\text{ W}$.

---

## 📁 Estructura del Proyecto

```text
src/
  app/                     # Shell global, Hub rediseñado, rutas y carga diferida (lazy)
  shared/
    domain/                # SI, constantes (eps0, mu0, k, e), vectores, errores
    ui/
      design-tokens/       # Tokens CSS (#111A20, #42D7C8, #F5A66A, etc.)
      LabShell/            # Layout responsivo 3-columnas con selector [Simulador/Laboratorio]
      Inspector/           # Inspector contextual de propiedades físicas y sliders
      Charts/              # ScientificChart SVG responsivo con cursor crosshair y unidades SI
  modules/
    electric/              # U1: Marching Squares 2D, superposición, sondas E y V, partícula
    capacitors/            # U2: Placas paralelas, inserción parcial, V/Q fijo, fallback 2D
    current/               # U3: Solver MNA DC, cableado interactivo, Drude, transitorio RC
    magnetism/             # U4: Biot-Savart, dipolo, Boris pusher, Wien, ciclotrón, fallback 2D
docs/
  plan.md                  # Backlog ordenado, criterios de aceptación observables y dependencias
  arquitectura.md          # Flujo de datos y Clean Architecture pragmática
  modelo-fisico.md         # Fórmulas, hipótesis, simplificaciones y unidades SI por unidad
  validacion.md            # Casos de prueba analíticos, tolerancias y comandos reales
  manual-usuario.md        # Manual de usuario con guía de uso para cada unidad y atajos
  guia-video.md            # Guion detallado de 5-10 min para demostración y defensa
  diseno-ui.md             # Tokens, dirección visual de cuaderno experimental y accesibilidad
  decisiones/ADR-001-stack.md # Registro de decisiones arquitectónicas
  bitacora.md              # Registro cronológico detallado de todos los hitos completados
.github/workflows/
  ci.yml                   # CI automatizado en GitHub Actions (lint, typecheck, test, build)
```

---

## 📜 Licencia y Autoría
Proyecto desarrollado para la asignatura **Física II**, carrera de **Ingeniería de Sistemas**.
Repositorio: [https://github.com/LouguiAcostaMedina/Simulador-FIsica-II.git](https://github.com/LouguiAcostaMedina/Simulador-FIsica-II.git)
Rama de entrega: `feat/laboratorios-interactivos-ui-v2`.

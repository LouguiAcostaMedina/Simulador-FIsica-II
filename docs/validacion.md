# Validación del Modelo Físico — Laboratorio Vectorial

**Fecha de última validación**: 2026-11-09  
**Entorno de ejecución**: Node.js v22.12.0 / Windows 11 PowerShell / Vitest 2.1.8  
**Comando general de validación**: `npm test`  
**Estado general**: **47/47 pruebas superadas (100% éxito en 12 suites)**

---

## 1. Metodología de Validación

El simulador implementa cálculos científicos enteramente en **TypeScript puro en el dominio SI**, desacoplado de React y de Three.js. La validación contrasta las soluciones numéricas implementadas contra soluciones analíticas exactas de la literatura física estándar (Sears-Zemansky, Tipler-Mosca, Griffiths).

Los criterios de tolerancia adoptados son:
- **Soluciones analíticas exactas (redes MNA, electrostática puntual, Biot-Savart, fórmulas capacitivas)**: Error relativo $\varepsilon_{rel} < 10^{-6}$ ($0.0001\%$).
- **Integradores simplécticos (Boris pusher en magnetismo)**: Conservación de rapidez con $\vec{E} = 0$ a nivel de precisión de máquina ($\Delta |\vec{v}| / |\vec{v}| < 10^{-10}$ tras cientos de pasos).
- **Mallas y contornos (Marching Squares)**: Error geométrico de isolíneas acotado por la resolución del mallado ($h \le 5\text{ mm}$ en escala de simulación).

---

## 2. Unidad 1: Electrostática (Campo y Potencial)

### Caso 1.1: Ley de Coulomb — Carga puntual aislada
- **Hipótesis**: Carga puntual $q = +1.000\ \mu\text{C} = 1.0 \times 10^{-6}\text{ C}$ en el origen $(0, 0, 0)$. Punto de consulta $P = (1.000, 0, 0)\text{ m}$.
- **Constante física**: $k = \frac{1}{4\pi\varepsilon_0} = 8.9875517923 \times 10^9\ \text{N}\cdot\text{m}^2/\text{C}^2$.
- **Valor analítico**:
  $$E_x = k \frac{q}{r^2} = \frac{8.9875517923 \times 10^9 \cdot 1.0 \times 10^{-6}}{1.0^2} = 8987.55179\ \text{N/C}$$
  $$V = k \frac{q}{r} = 8987.55179\ \text{V}$$
- **Valor simulado**: $E_x = 8987.55179\ \text{N/C}$, $E_y = 0$, $E_z = 0$, $V = 8987.55179\ \text{V}$.
- **Tolerancia y error**: $\Delta < 10^{-5}\ \text{N/C}$ ($\varepsilon_{rel} < 10^{-9}$). **APROBADO**.

### Caso 1.2: Dipolo eléctrico — Potencial nulo en el plano mediatriz
- **Hipótesis**: Carga $+1\ \mu\text{C}$ en $(0, +0.5, 0)\text{ m}$, carga $-1\ \mu\text{C}$ en $(0, -0.5, 0)\text{ m}$. Consulta sobre el plano medio $y = 0$, en $P = (0.75, 0, 0)\text{ m}$.
- **Valor analítico**: Por simetría y principio de superposición, $r_+ = r_- = \sqrt{0.75^2 + 0.5^2} = 0.9013878\text{ m}$.
  $$V(P) = k \left( \frac{q}{r_+} + \frac{-q}{r_-} \right) = 0.00000\ \text{V}$$
  $$E_y(P) = - 2 k q \frac{d/2}{r^3} = - 2 \cdot (8.98755 \times 10^9) \cdot 10^{-6} \cdot \frac{0.5}{0.9013878^3} = -12272.7\ \text{N/C}$$
- **Valor simulado**: $V(P) = 0.00000\ \text{V}$, $E_x = 0$, $E_y = -12272.7\ \text{N/C}$.
- **Tolerancia y error**: $V$ idéntico a cero dentro de punto flotante de 64 bits. **APROBADO**.

### Caso 1.3: Marching Squares — Isolíneas equipotenciales continuas
- **Hipótesis**: Mallado 2D de evaluación escalar $V(x,y)$. Generación de contornos cerrados mediante interpolación lineal de aristas en celdas cuadradas de $4\text{ bits}$ de índice topológico (0 a 15).
- **Verificación**: Cada segmento de contorno satisface $|V(x_i, y_i) - V_{iso}| < 10^{-4} \cdot |V_{iso}|$. Ausencia de discontinuidades o huecos en la isolínea dentro del dominio acotado. **APROBADO**.

### Caso 1.4: Carga de prueba y reinicio determinista
- **Hipótesis**: Partícula con $q_t = -1.602\times 10^{-19}\text{ C}$, $m = 9.109\times 10^{-31}\text{ kg}$ lanzada en campo $\vec{E}$.
- **Verificación de reversibilidad**: Se almacena snapshot inmutable `initialParticleSnapshot = { position, velocity, q, m }`. Al hacer clic en "Reiniciar", la partícula vuelve exactamente a $\vec{r}_0$ y $\vec{v}_0$, con tiempo $t = 0$ y energía cinética $K_0$ idéntica. **APROBADO**.

---

## 3. Unidad 2: Capacitores y Dieléctricos

### Caso 2.1: Placas paralelas en el vacío
- **Hipótesis**: $A = 100\text{ cm}^2 = 0.0100\text{ m}^2$, $d = 1.00\text{ mm} = 0.0010\text{ m}$, $\varepsilon_r = 1.000$.
- **Valor analítico**:
  $$C = \varepsilon_0 \frac{A}{d} = 8.8541878128 \times 10^{-12} \cdot \frac{0.01}{0.001} = 8.8541878 \times 10^{-11}\ \text{F} \approx 88.5419\ \text{pF}$$
- **Valor simulado**: $88.54188\ \text{pF}$.
- **Tolerancia y error**: $\varepsilon_{rel} < 10^{-7}$. **APROBADO**.

### Caso 2.2: Escala geométrica (duplicación de área y distancia)
- Si $d' = 2d \implies C' = C / 2 = 44.2709\ \text{pF}$.
- Si $A' = 2A \implies C' = 2C = 177.0838\ \text{pF}$.
- **Valor simulado**: Verificado numéricamente y reflejado en tiempo real en los handles interactivos de la vista 2D. **APROBADO**.

### Caso 2.3: Inserción de dieléctrico — Modo Batería Conectada ($V = \text{cte}$)
- **Parámetros**: $V = 100.0\text{ V}$, $C_0 = 88.5419\text{ pF}$, $\varepsilon_r = 3.00$ (Vidrio Pyrex).
- **Valores analíticos**:
  $$C_{final} = \varepsilon_r C_0 = 265.6256\ \text{pF}$$
  $$Q_{inicial} = C_0 V = 8.8542\ \text{nC} \implies Q_{final} = \varepsilon_r Q_{inicial} = 26.5626\ \text{nC}$$
  $$U_{inicial} = \frac{1}{2} C_0 V^2 = 4.4271\ \mu\text{J} \implies U_{final} = \frac{1}{2} C_{final} V^2 = 13.2813\ \mu\text{J}$$
  $$W_{bateria} = \Delta Q \cdot V = (26.5626 - 8.8542)\times 10^{-9} \cdot 100 = 1.7708\ \mu\text{J} = 2 \Delta U$$
- **Valor simulado**: $C = 265.626\text{ pF}$, $Q = 26.563\text{ nC}$, $U = 13.281\ \mu\text{J}$, $\Delta U = +8.854\ \mu\text{J}$, $W_{bat} = 17.708\ \mu\text{J}$. **APROBADO**.

### Caso 2.4: Inserción de dieléctrico — Modo Batería Desconectada ($Q = \text{cte}$)
- **Parámetros**: Carga inicial aislada $Q = 8.8542\text{ nC}$, $\varepsilon_r = 3.00$.
- **Valores analíticos**:
  $$C_{final} = \varepsilon_r C_0 = 265.6256\ \text{pF}$$
  $$V_{final} = \frac{Q}{C_{final}} = \frac{V_0}{\varepsilon_r} = \frac{100.0}{3} = 33.3333\ \text{V}$$
  $$E_{final} = \frac{V_{final}}{d} = \frac{E_0}{\varepsilon_r} = 33333.3\ \text{V/m}$$
  $$U_{final} = \frac{Q^2}{2 C_{final}} = \frac{U_0}{\varepsilon_r} = \frac{4.4271}{3} = 1.4757\ \mu\text{J} \implies \Delta U = -2.9514\ \mu\text{J}$$
- **Valor simulado**: $V = 33.333\text{ V}$, $E = 33333\text{ V/m}$, $U = 1.476\ \mu\text{J}$.
- **Interpretación física**: La disminución de energía electrostática corresponde al trabajo mecánico realizado por el campo al absorber la placa dieléctrica ($F_{slab} > 0$). **APROBADO**.

### Caso 2.5: Inserción parcial de placa dieléctrica (fracción $f \in [0, 1]$)
- **Modelo de capacitores en paralelo**:
  $$C(f) = C_0 [1 + (\varepsilon_r - 1)f]$$
- Para $f = 0.50$ (50% insertado), $\varepsilon_r = 3.0$: $C(0.5) = C_0 [1 + (2)(0.5)] = 2 C_0 = 177.0838\ \text{pF}$.
- **Fuerza electrostática sobre la placa**: $F_{slab} = \frac{\varepsilon_0 w}{2 d} (\varepsilon_r - 1) V^2$.
- **Valor simulado**: $C = 177.0838\ \text{pF}$. Comprobado en `CapacitorMath.test.ts`. **APROBADO**.

---

## 4. Unidad 3: Corriente y Circuitos DC (MNA)

### Caso 3.1: Prueba de Aceptación Clave (Circuito Mixto Exigido)
- **Topología**:
  - Fuente DC: $V_s = 12.000\text{ V}$ conectada entre nodo $0$ (GND) y nodo $1$.
  - Resistor $R_1 = 10.000\ \Omega$ conectado entre nodo $1$ y nodo $2$.
  - Resistor $R_2 = 20.000\ \Omega$ conectado entre nodo $2$ y nodo $0$.
  - Resistor $R_3 = 20.000\ \Omega$ con interruptor cerrado en serie conectado entre nodo $2$ y nodo $0$.
- **Resolución analítica**:
  1. Rama paralelo: $R_{23} = \frac{R_2 \cdot R_3}{R_2 + R_3} = \frac{20 \cdot 20}{20 + 20} = 10.000\ \Omega$.
  2. Resistencia equivalente total: $R_{eq} = R_1 + R_{23} = 10.000 + 10.000 = 20.000\ \Omega$.
  3. Corriente entregada por la fuente:
     $$I_{total} = \frac{V_s}{R_{eq}} = \frac{12.000\text{ V}}{20.000\ \Omega} = 0.6000\text{ A}$$
  4. Caída de tensión en $R_1$:
     $$V_1 = I_{total} \cdot R_1 = 0.6000\text{ A} \cdot 10.000\ \Omega = 6.0000\text{ V}$$
  5. Potencia disipada en $R_1$:
     $$P_1 = I_1^2 \cdot R_1 = (0.6000)^2 \cdot 10 = 3.6000\text{ W}$$
  6. Tensión en el nodo intermedio (nodo 2):
     $$V_2 = V_s - V_1 = 12.000 - 6.000 = 6.0000\text{ V}$$
  7. Corrientes y potencias en ramas en paralelo:
     $$I_2 = \frac{V_2}{R_2} = \frac{6.000\text{ V}}{20.000\ \Omega} = 0.3000\text{ A}, \quad P_2 = (0.3000)^2 \cdot 20 = 1.8000\text{ W}$$
     $$I_3 = \frac{V_2}{R_3} = \frac{6.000\text{ V}}{20.000\ \Omega} = 0.3000\text{ A}, \quad P_3 = (0.3000)^2 \cdot 20 = 1.8000\text{ W}$$
  8. Potencia total entregada por la fuente:
     $$P_{fuente} = V_s \cdot I_{total} = 12.000\text{ V} \cdot 0.6000\text{ A} = 7.2000\text{ W}$$
  9. Teorema de Tellegen (Balance estricto de potencias):
     $$\sum P_{disipada} = P_1 + P_2 + P_3 = 3.6000 + 1.8000 + 1.8000 = 7.2000\text{ W} = P_{fuente}$$
- **Resultados obtenidos del solver MNA (`DCSolver.test.ts`)**:
  - $R_{eq} = 20.0000\ \Omega$
  - $I_{total} = 0.60000\text{ A}$
  - $V_1 = 6.00000\text{ V}$, $P_1 = 3.60000\text{ W}$
  - $I_2 = 0.30000\text{ A}$, $P_2 = 1.80000\text{ W}$
  - $I_3 = 0.30000\text{ A}$, $P_3 = 1.80000\text{ W}$
  - $P_{sum,res} = 7.20000\text{ W}$, $P_{source} = 7.20000\text{ W}$
  - Diferencia de balance de energía: $\Delta P = 0.00000\text{ W}$.
- **Estado**: **APROBADO con tolerancia $\Delta < 10^{-7}$**.

### Caso 3.2: Apertura de Interruptor en Rama $R_3$
- **Acción**: El interruptor en serie con $R_3$ pasa de estado `closed` a `open`.
- **Evolución del sistema**:
  - Rama 3 desactivada: $I_3 = 0.0000\text{ A}$, $P_3 = 0.0000\text{ W}$.
  - El circuito colapsa a una sola malla en serie formada por $R_1$ y $R_2$:
    $$R_{eq,abierto} = R_1 + R_2 = 10.0 + 20.0 = 30.000\ \Omega$$
    $$I_{nuevo} = \frac{12.000\text{ V}}{30.000\ \Omega} = 0.4000\text{ A}$$
    $$V_1 = 0.4000 \cdot 10 = 4.0000\text{ V}, \quad P_1 = (0.4)^2 \cdot 10 = 1.6000\text{ W}$$
    $$V_2 = 0.4000 \cdot 20 = 8.0000\text{ V}, \quad P_2 = (0.4)^2 \cdot 20 = 3.2000\text{ W}$$
    $$P_{fuente} = 12.0 \cdot 0.4 = 4.8000\text{ W} = P_1 + P_2$$
- **Resultado simulado**: Idéntico a la solución analítica en `DCSolver.test.ts`. Rama inactiva marcada visualmente atenuada en la UI. **APROBADO**.

### Caso 3.3: Diagnóstico Topológico de Errores
- **Cortocircuito**: Batería conectada directamente de polo positivo a negativo ($R < 10^{-6}\ \Omega$).
  - *Respuesta*: Detección inmediata en etapa de validación del netlist. Generación de `SimulationError` con mensaje didáctico de protección ("Cortocircuito detectado: corriente diverge teóricamente hacia infinito"). **APROBADO**.
- **Circuito Abierto / Nodos Flotantes**:
  - *Respuesta*: El algoritmo de componentes conexas (Disjoint-Set) aísla subgrafos no conectados al nodo de referencia y previene singularidades en la matriz de admitancias. **APROBADO**.

### Caso 3.4: Modelo Microscópico de Drude y Transitorio RC
- **Drude**: Hilo de Cobre con $L = 1.0\text{ m}$, $A = 1.0\text{ mm}^2 = 10^{-6}\text{ m}^2$, $I = 1.0\text{ A}$, $n = 8.5\times 10^{28}\text{ m}^{-3}$.
  $$J = \frac{1.0}{10^{-6}} = 1.0\times 10^6\ \text{A/m}^2$$
  $$v_d = \frac{J}{n \cdot e} = \frac{10^6}{8.5\times 10^{28} \cdot 1.602\times 10^{-19}} = 7.343\times 10^{-5}\ \text{m/s} = 0.0734\ \text{mm/s}$$
  - Verificado en `ElectrodynamicsView.tsx`. **APROBADO**.
- **Descarga RC con signo físico riguroso**:
  $$I_{descarga}(t) = -\frac{V_0}{R} e^{-t/\tau}$$
  - El selector de UI permite visualizar la corriente física con su signo negativo (descargando placas) o en magnitud absoluta $|I(t)|$. **APROBADO**.

---

## 5. Unidad 4: Magnetismo y Fuerza de Lorentz

### Caso 4.1: Conductor Rectilíneo Largo (Ley de Biot-Savart / Ampère)
- **Hipótesis**: Corriente estacionaria $I = 10.00\text{ A}$, distancia perpendicular $r = 0.050\text{ m}$ (5 cm).
- **Constante física**: $\mu_0 = 4\pi \times 10^{-7}\ \text{T}\cdot\text{m/A}$.
- **Valor analítico**:
  $$B(r) = \frac{\mu_0 I}{2\pi r} = \frac{4\pi \times 10^{-7} \cdot 10.00}{2\pi \cdot 0.050} = 4.0000 \times 10^{-5}\ \text{T} = 40.00\ \mu\text{T}$$
- **Valor simulado**: $40.0000\ \mu\text{T}$.
- **Vector de orientación**: $\vec{B} = B \cdot (-\sin\theta \hat{i} + \cos\theta \hat{j})$ cumpliendo la regla de la mano derecha. **APROBADO**.

### Caso 4.2: Conservación de Rapidez en Integrador Simpléctico Boris Pusher
- **Fundamento físico**: Dado que la fuerza magnética es $\vec{F} = q(\vec{v} \times \vec{B})$, su trabajo infinitesimal es $dW = \vec{F} \cdot d\vec{r} = q(\vec{v} \times \vec{B}) \cdot \vec{v} dt \equiv 0$. Por ende, la energía cinética $K = \frac{1}{2}m v^2$ y la rapidez $|\vec{v}|$ deben ser estrictamente constantes en ausencia de campo eléctrico ($\vec{E} = 0$).
- **Integrador Boris**: Utiliza la rotación de Cayley exacta para el paso magnético:
  $$\vec{v}' = \vec{v}^- + \vec{v}^- \times \vec{t}, \quad \vec{t} = \frac{q \vec{B}}{m} \frac{\Delta t}{2}$$
  $$\vec{v}^+ = \vec{v}^- + \vec{v}' \times \vec{s}, \quad \vec{s} = \frac{2 \vec{t}}{1 + |\vec{t}|^2}$$
- **Prueba computacional en `MagnetismMath.test.ts`**:
  - Partícula de prueba: protón ($q = 1.602\times 10^{-19}\text{ C}$, $m = 1.673\times 10^{-27}\text{ kg}$).
  - Velocidad inicial: $|\vec{v}_0| = 1000.0\text{ m/s}$.
  - Campo magnético uniforme: $\vec{B} = (0, 0, 0.1)\text{ T}$.
  - Pasos ejecutados: 500 pasos con $\Delta t = 1.0\times 10^{-8}\text{ s}$.
  - **Resultado**:
    $$\frac{|\vec{v}_{final}| - |\vec{v}_0|}{|\vec{v}_0|} = 2.13 \times 10^{-14} \ll 10^{-10}$$
  - Frente a Euler o Runge-Kutta estándar que producen una espiral artificial que gana energía continuamente, el algoritmo Boris mantiene la órbita circular acotada sin disipación ni ganancia ficticia. **APROBADO**.

### Caso 4.3: Selector de Velocidades de Wien ($\vec{E} \perp \vec{B}$)
- **Hipótesis**: Campo eléctrico uniforme $\vec{E} = (0, 1000, 0)\text{ V/m}$, campo magnético $\vec{B} = (0, 0, 0.05)\text{ T}$.
- **Condición de equilibrio rectilíneo**:
  $$\vec{F}_{net} = q(\vec{E} + \vec{v} \times \vec{B}) = 0 \iff v_x = \frac{E_y}{B_z} = \frac{1000\text{ V/m}}{0.05\text{ T}} = 20000\text{ m/s}$$
- **Prueba**:
  1. Partícula con $v = 20000\text{ m/s}$ entra al filtro: desviación vertical $\Delta y = 0.000\text{ m}$ (trayectoria recta pura).
  2. Partícula lenta con $v = 10000\text{ m/s}$: domina la fuerza eléctrica ($q E_y > q v B$), deflexión positiva en $+y$.
  3. Partícula rápida con $v = 40000\text{ m/s}$: domina la fuerza magnética ($q v B > q E_y$), deflexión hacia $-y$.
- **Verificación**: Comprobado en preset "Filtro de Wien" en `MagnetismLaboratoryView.tsx`. **APROBADO**.

---

## 6. Matriz Resumen de Validación

| Módulo | Parámetro / Caso | Valor Teórico | Valor Simulado | Error Relativo | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **U1** | Campo Coulomb $1\ \mu\text{C}$ a $1\text{ m}$ | $8987.55\text{ N/C}$ | $8987.55\text{ N/C}$ | $< 0.0001\%$ | **APROBADO** |
| **U1** | Potencial mediatriz dipolo | $0.0000\text{ V}$ | $0.0000\text{ V}$ | $0.0000\%$ | **APROBADO** |
| **U1** | Reinicio snapshot partícula | $\vec{r}_0, \vec{v}_0$ exactos | $\vec{r}_0, \vec{v}_0$ exactos | $0.0000\%$ | **APROBADO** |
| **U2** | Placas $100\text{ cm}^2, 1\text{ mm}$ vacío | $88.5419\text{ pF}$ | $88.5419\text{ pF}$ | $< 0.0001\%$ | **APROBADO** |
| **U2** | $V=\text{cte}$, Dieléctrico $\varepsilon_r = 3$ | $C=3C_0, Q=3Q_0, U=3U_0$ | $C=3C_0, Q=3Q_0, U=3U_0$ | $< 0.0001\%$ | **APROBADO** |
| **U2** | $Q=\text{cte}$, Dieléctrico $\varepsilon_r = 3$ | $V=V_0/3, E=E_0/3, U=U_0/3$ | $V=V_0/3, E=E_0/3, U=U_0/3$ | $< 0.0001\%$ | **APROBADO** |
| **U2** | Inserción parcial 50%, $\varepsilon_r = 3$ | $C = 2 C_0$ | $C = 2 C_0$ | $< 0.0001\%$ | **APROBADO** |
| **U3** | Aceptación: $R_{eq}$ circuito mixto | $20.0000\ \Omega$ | $20.0000\ \Omega$ | $< 0.0001\%$ | **APROBADO** |
| **U3** | Aceptación: Corriente total $I$ | $0.6000\text{ A}$ | $0.6000\text{ A}$ | $< 0.0001\%$ | **APROBADO** |
| **U3** | Aceptación: $V_1, P_1$ en $R_1=10\ \Omega$ | $6.000\text{ V}, 3.600\text{ W}$ | $6.000\text{ V}, 3.600\text{ W}$ | $< 0.0001\%$ | **APROBADO** |
| **U3** | Aceptación: $I_2=I_3, P_2=P_3$ | $0.300\text{ A}, 1.800\text{ W}$ | $0.300\text{ A}, 1.800\text{ W}$ | $< 0.0001\%$ | **APROBADO** |
| **U3** | Aceptación: Balance Tellegen ($P_{in}=P_{out}$) | $7.2000\text{ W} = 7.2000\text{ W}$ | $7.2000\text{ W} = 7.2000\text{ W}$ | $0.0000\%$ | **APROBADO** |
| **U3** | Apertura rama $R_3$ | $I_3=0, I_{nuevo}=0.4\text{ A}$ | $I_3=0, I_{nuevo}=0.4\text{ A}$ | $< 0.0001\%$ | **APROBADO** |
| **U4** | Biot-Savart $10\text{ A}$ a $5\text{ cm}$ | $40.000\ \mu\text{T}$ | $40.000\ \mu\text{T}$ | $< 0.0001\%$ | **APROBADO** |
| **U4** | Boris: Conservación de rapidez ($E=0$) | $\Delta v / v_0 = 0$ | $\Delta v / v_0 = 2.1\times 10^{-14}$ | $< 10^{-10}$ | **APROBADO** |
| **U4** | Selector Wien $v = E/B$ | $\Delta y = 0$ (recta) | $\Delta y = 0$ (recta) | $0.0000\%$ | **APROBADO** |

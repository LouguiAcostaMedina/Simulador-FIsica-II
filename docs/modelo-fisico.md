# Modelo Físico y Fundamentos Teóricos — Laboratorio Vectorial

Este documento detalla las leyes físicas, modelos matemáticos, hipótesis simplificadoras y unidades del Sistema Internacional (SI) empleadas en cada módulo del simulador.

---

## 1. Constantes Físicas Fundamentales

Todas las constantes se encuentran centralizadas en `src/shared/domain/constants.ts` y operan en unidades SI:

| Constante | Símbolo | Valor Numérico | Unidades SI |
| :--- | :--- | :--- | :--- |
| **Permitividad del vacío** | $\varepsilon_0$ | $8.854187817 \times 10^{-12}$ | $\text{F/m} = \text{C}^2/(\text{N}\cdot\text{m}^2)$ |
| **Constante de Coulomb** | $k = \frac{1}{4\pi\varepsilon_0}$ | $8.987551792 \times 10^{9}$ | $\text{N}\cdot\text{m}^2/\text{C}^2$ |
| **Permeabilidad del vacío** | $\mu_0$ | $4\pi \times 10^{-7} \approx 1.256637 \times 10^{-6}$ | $\text{T}\cdot\text{m/A} = \text{N/A}^2$ |
| **Carga elemental** | $e$ | $1.602176634 \times 10^{-19}$ | $\text{C}$ |
| **Velocidad de la luz** | $c = \frac{1}{\sqrt{\varepsilon_0\mu_0}}$ | $299792458$ | $\text{m/s}$ |

---

## 2. Unidad 1 — Electricidad, Campo y Potencial Eléctrico

### 2.1. Ecuaciones Fundamentales
- **Ley de Coulomb y Principio de Superposición:**
  El campo eléctrico total generado por $N$ cargas puntuales $q_i$ situadas en posiciones $\vec{r}_i$ es la suma vectorial:
  $$\vec{E}(\vec{r}) = \frac{1}{4\pi\varepsilon_0} \sum_{i=1}^{N} \frac{q_i (\vec{r} - \vec{r}_i)}{|\vec{r} - \vec{r}_i|^3}$$
- **Potencial Electrostático Escalar:**
  $$V(\vec{r}) = \frac{1}{4\pi\varepsilon_0} \sum_{i=1}^{N} \frac{q_i}{|\vec{r} - \vec{r}_i|}$$
  con la condición de referencia $V(\infty) = 0$.
- **Fuerza y Aceleración sobre Carga de Prueba:**
  $$\vec{F} = q_t \vec{E}(\vec{r}), \quad \vec{a} = \frac{\vec{F}}{m}$$
- **Integración Numérica (Euler-Cromer Simpléctico):**
  $$\vec{v}(t + \Delta t) = \vec{v}(t) + \vec{a}(t) \Delta t$$
  $$\vec{r}(t + \Delta t) = \vec{r}(t) + \vec{v}(t + \Delta t) \Delta t$$

### 2.2. Isolíneas Equipotenciales (Marching Squares)
Para evitar bandas pixeladas, se evalúa una cuadrícula regular $V(x_c, y_r)$. Se detectan las celdas que contienen el valor isopotencial $V_{iso}$ y se interpolan linealmente las intersecciones en las aristas:
$$x_{interp} = x_0 + \frac{V_{iso} - V_0}{V_1 - V_0} (x_1 - x_0)$$
produciendo segmentos poligonales continuos y suaves.

### 2.3. Hipótesis y Limitaciones
- Se modelan cargas puntuales ideales en el vacío sin pérdidas por radiación electromagnética.
- Singularidad en la posición de cada carga ($r \to 0$): el dominio lanza un error controlado si $|\vec{r} - \vec{r}_i| < 10^{-6}\text{ m}$ evitando valores `NaN` o `Infinity`.

---

## 3. Unidad 2 — Capacitores y Dieléctricos

### 3.1. Ecuaciones Fundamentales
- **Capacitancia de Placas Paralelas Ideales:**
  $$C = \frac{\varepsilon_0 \varepsilon_r A}{d}$$
- **Carga Almacenada y Campo Interno:**
  $$Q = C V, \quad E = \frac{V}{d}$$
- **Energía Electrostática Almacenada:**
  $$U = \frac{1}{2} C V^2 = \frac{Q^2}{2 C} = \frac{1}{2} Q V$$

### 3.2. Modelo de Inserción Parcial de Dieléctrico
Cuando una lámina dieléctrica de constante $\varepsilon_r$ penetra una fracción $f = x/L \in [0, 1]$ entre las placas, la configuración es físicamente equivalente a dos capacitores conectados en paralelo:
- Zona con dieléctrico: $A_{diel} = f \cdot A \implies C_{diel} = \frac{\varepsilon_0 \varepsilon_r f A}{d}$.
- Zona en vacío: $A_{vac} = (1 - f) \cdot A \implies C_{vac} = \frac{\varepsilon_0 (1 - f) A}{d}$.
- Capacitancia equivalente total:
  $$C_{eq} = C_{diel} + C_{vac} = \frac{\varepsilon_0 A}{d} \left[ 1 + (\varepsilon_r - 1) f \right]$$
- **Fuerza Atractiva sobre la Lámina:**
  $$F_x = \frac{1}{2} V^2 \frac{dC}{dx} = \frac{\varepsilon_0 (\varepsilon_r - 1) W V^2}{2 d}$$
  donde $W = \sqrt{A}$ es el ancho transversal de las placas.

### 3.3. Modos de Fuente y Balances Energéticos
- **Modo Batería Conectada ($V$ constante):** Al insertar el dieléctrico, $C$ aumenta $\implies Q$ aumenta $\implies U$ aumenta. La batería suministra un trabajo:
  $$W_{bat} = \Delta Q \cdot V = V^2 \Delta C = 2 \Delta U$$
  El 50% de la energía suministrada por la batería se almacena en el capacitor ($\Delta U$) y el 50% restante realiza trabajo mecánico sobre la lámina dieléctrica ($W_{mec} = \Delta U$).
- **Modo Batería Desconectada ($Q$ constante):** La carga queda aislada. Al insertar el dieléctrico, $C$ aumenta $\implies V$ disminuye $\implies U$ disminuye. La disminución de energía electrostática es exactamente el trabajo realizado por la atracción del campo sobre la lámina ($W_{mec} = -\Delta U$).

---

## 4. Unidad 3 — Corriente, Resistencia y Circuitos DC

### 4.1. Electrodinámica y Modelo de Drude
- **Corriente y Densidad de Corriente:**
  $$I = \frac{\Delta Q}{\Delta t}, \quad J = \frac{I}{A} = n q v_d$$
- **Velocidad de Deriva de los Electrones:**
  $$v_d = \frac{I}{n e A}$$
  Para el cobre ($n \approx 8.5 \times 10^{28}\text{ m}^{-3}$), en un alambre de $1\text{ mm}^2$ con $1\text{ A}$, $v_d \approx 0.074\text{ mm/s}$. La transmisión casi instantánea de energía ocurre porque el campo electromagnético viaja a la velocidad de la luz en el medio ($v \sim 2\times 10^8\text{ m/s}$), no por la traslación de los electrones individuales.
- **Resistencia Geométrica:**
  $$R = \rho \frac{L}{A}$$

### 4.2. Análisis Nodal Modificado (MNA)
El solucionador formula la matriz de admitancias y restricciones de voltaje:
$$\begin{pmatrix} \mathbf{G} & \mathbf{B} \\ \mathbf{C} & \mathbf{D} \end{pmatrix} \begin{pmatrix} \mathbf{v} \\ \mathbf{j} \end{pmatrix} = \begin{pmatrix} \mathbf{i} \\ \mathbf{e} \end{pmatrix}$$
- $\mathbf{G}$: Matriz $N \times N$ con conductancias $g_k = 1/R_k$ entre nodos.
- $\mathbf{B}$ y $\mathbf{C}$: Matrices $N \times M$ y $M \times N$ que imponen la diferencia de potencial fijada por las fuentes ideales y amperímetros.
- $\mathbf{v}$: Vector de potenciales de nodo respecto a la referencia de tierra ($V_{ref} = 0$).
- $\mathbf{j}$: Vector de corrientes que atraviesan las fuentes independientes.
- **Conservación de Potencia:** $\sum P_{fuentes} = \sum P_{resistores}$, verificado con error menor a $10^{-6}\text{ W}$.

### 4.3. Circuito Transitorio RC
- **Carga:**
  $$V_C(t) = V_0 (1 - e^{-t/\tau}), \quad I(t) = \frac{V_0}{R} e^{-t/\tau}, \quad \tau = R C$$
- **Descarga:**
  $$V_C(t) = V_0 e^{-t/\tau}, \quad I(t) = -\frac{V_0}{R} e^{-t/\tau}$$
  El signo negativo representa físicamente que la corriente sale de la placa positiva en sentido opuesto a la corriente de carga.

---

## 5. Unidad 4 — Fuerza y Campo Magnético

### 5.1. Fuentes de Campo Magnético
- **Conductor Rectilíneo Infinito (Ley de Biot-Savart):**
  $$\vec{B}(\vec{r}) = \frac{\mu_0 I}{2\pi r} (\hat{u}_I \times \hat{u}_r)$$
  donde $r$ es la distancia perpendicular al eje del conductor.
- **Aproximación de Dipolo Magnético:**
  $$\vec{B}(\vec{r}) = \frac{\mu_0}{4\pi} \left[ \frac{3 (\vec{m} \cdot \vec{r}) \vec{r}}{r^5} - \frac{\vec{m}}{r^3} \right]$$

### 5.2. Fuerza de Lorentz e Integrador Boris Pusher
- **Ecuación del Movimiento:**
  $$\vec{F} = q (\vec{E} + \vec{v} \times \vec{B}) = m \frac{d\vec{v}}{dt}$$
- **Propiedad Fundamental cuando $\vec{E} = 0$:**
  La fuerza magnética $\vec{F}_B = q(\vec{v} \times \vec{B})$ es siempre ortogonal a la velocidad ($\vec{F}_B \cdot \vec{v} = 0$). Por lo tanto, el trabajo realizado es nulo y la rapidez $|\vec{v}|$ (así como la energía cinética $K = \frac{1}{2}m v^2$) es estrictamente constante.
- **Integrador Boris Pusher:**
  Descompone cada paso temporal en una aceleración eléctrica de medio paso, una rotación magnética ortogonal exacta (mediante la transformada de Cayley de la matriz de rotación) y un segundo semi-paso eléctrico. A diferencia de los métodos de Euler estándar que hacen que las partículas espiralicen hacia afuera de forma espuria, el Boris Pusher conserva la rapidez al $100\%$ de precisión numérica.
- **Radio de Larmor y Frecuencia de Ciclotrón:**
  $$r_L = \frac{m v_\perp}{|q| B}, \quad \omega_c = \frac{|q| B}{m}, \quad f_c = \frac{\omega_c}{2\pi}$$
- **Selector de Velocidades de Wien:**
  Bajo campos cruzados $\vec{E} \perp \vec{B}$, para partículas con velocidad $v_{sel} = E / B$, la fuerza eléctrica y la fuerza magnética se cancelan exactamente ($\vec{F} = 0$), permitiendo el paso rectilíneo no desviado.

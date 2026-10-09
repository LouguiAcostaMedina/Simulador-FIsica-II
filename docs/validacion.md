# Validación del Modelo Físico

Este documento registra los casos analíticos usados para validar los cálculos del simulador.

## U1: Electrostática (Campo y Potencial)
- **Caso 1:** Una carga de $1 \text{ \mu C}$ a $1 \text{ m}$.
  - Esperado $E = k \cdot q / r^2 \approx 9 \times 10^9 \cdot 10^{-6} / 1^2 = 8987.55 \text{ N/C}$
  - Obtenido: $8987.55 \text{ N/C}$ (Tolerancia < 0.1%)
- **Caso 2:** Potencial de un dipolo en el plano medio.
  - Esperado: $V = 0 \text{ V}$ (por superposición de $+q$ y $-q$).
  - Obtenido: $0 \text{ V}$

## U2: Capacitores y Dieléctricos
- **Caso 1:** Capacitor de placas paralelas (A=100 cm², d=1 mm, Aire).
  - $A = 0.01 \text{ m}^2$, $d = 0.001 \text{ m}$.
  - $C = \varepsilon_0 \cdot A / d = 8.854 \times 10^{-12} \cdot 0.01 / 0.001 = 88.54 \text{ pF}$.
  - Obtenido: $88.54 \text{ pF}$.
- **Caso 2:** Dieléctrico con $V$ constante y $\varepsilon_r = 2$.
  - Esperado: $C$ se duplica, $Q$ se duplica.
  - Obtenido: Comprobado en panel interactivo comparativo.

## U3: Corriente y Ley de Ohm
- **Caso 1:** Resistencia Equivalente Serie. Dos resistores de $10 \text{ \Omega}$.
  - Esperado: $R_{eq} = 20 \text{ \Omega}$.
  - Obtenido: $20 \text{ \Omega}$.
- **Caso 2:** Resistencia Equivalente Paralelo. Dos resistores de $10 \text{ \Omega}$.
  - Esperado: $R_{eq} = 5 \text{ \Omega}$.
  - Obtenido: $5 \text{ \Omega}$.
- **Caso 3:** Potencia disipada ($V = 10 \text{V}, R = 5 \text{ \Omega}$).
  - $I = V / R = 2 \text{ A}$. $P = V \cdot I = 20 \text{ W}$.
  - Obtenido: $I = 2 \text{ A}, P = 20 \text{ W}$.

## U4: Magnetismo y Fuerza de Lorentz
- **Caso 1:** Campo Magnético de Hilo Infinito.
  - $I = 10 \text{ A}$, distancia $r = 1 \text{ m}$.
  - $B = \mu_0 \cdot I / (2\pi \cdot r) = (4\pi \times 10^{-7} \cdot 10) / (2\pi \cdot 1) = 2 \times 10^{-6} \text{ T}$.
  - Obtenido: El logaritmo numérico y la simulación muestran la misma magnitud y regla de la mano derecha.
- **Caso 2:** Fuerza de Lorentz en E cruzado B.
  - Partícula con $\vec{v} = v \hat{k}$, entra en región con $\vec{B} = B \hat{i}$ y $\vec{E} = E \hat{j}$.
  - Si $v = E / B$, la fuerza total debe ser nula ($\vec{v} \times \vec{B} = v B \hat{j}$, pero negativo para E, dependiendo de los signos).
  - Obtenido: Ajustando E en la UI frena el giro y produce movimiento rectilíneo en condiciones de equilibrio.

# Guía y Guion del Video Demostrativo (5 a 10 Minutos)

**Proyecto**: Laboratorio Vectorial — Simulador y Laboratorio Virtual de Física II  
**Audiencia**: Comité Académico de Física II e Ingeniería de Sistemas  
**Duración estimada**: 8 minutos y 30 segundos  
**Requisitos técnicos**: Grabación en resolución $1920\times 1080$ a 60 FPS con micrófono claro y cursor del mouse visible con resaltado de clics.

---

## Estructura General del Guion

| Bloque | Minuto | Escena / Pantalla | Tema Principal |
| :---: | :---: | :--- | :--- |
| **1** | 0:00 - 1:00 | Portada Hub (`/`) | Presentación del proyecto, arquitectura y objetivos pedagógicos |
| **2** | 1:00 - 2:45 | Unidad 1 (`/electricidad`) | Campo eléctrico, Marching Squares, equipotenciales y partículas |
| **3** | 2:45 - 4:30 | Unidad 2 (`/capacitores`) | Placas paralelas, dieléctricos, $V$ cte vs $Q$ cte y balance energético |
| **4** | 4:30 - 7:15 | Unidad 3 (`/corriente`) | **Hito Clave**: Editor de Circuitos MNA, prueba de aceptación y Drude |
| **5** | 7:15 - 8:30 | Unidad 4 (`/magnetismo`) | Biot-Savart, Boris Pusher simpléctico y Filtro de Wien |
| **6** | 8:30 - 9:30 | Cierre y Repositorio | Suite de pruebas (47 tests), arquitectura limpia y conclusiones |

---

## Guion Detallado Paso a Paso

### Bloque 1: Introducción y Hub Principal (0:00 - 1:00)
- **Toma en Pantalla**: Vista completa del Hub en pantalla grande.
- **Acciones del Presentador**:
  1. Pasar el cursor sobre las cuatro tarjetas de unidad, mostrando las ilustraciones científicas vectoriales.
  2. Destacar que las 4 unidades están plenamente operativas (cero marcas de "Próximamente").
- **Locución sugerida**:
  > *"Estimados profesores y compañeros, presentamos **Laboratorio Vectorial**, un entorno web interactivo de simulación para Física II desarrollado con TypeScript y React. Nuestro objetivo ha sido construir una herramienta didáctica rigurosa, físicamente consistente y de alto rendimiento que corre enteramente en el cliente sin servidores lentos ni librerías opacas. Como observan en este Hub principal, cubrimos cuatro unidades: Electricidad, Capacitores, Corriente y Circuitos DC, y Magnetismo. Cada una cuenta con dos modalidades: el modo Simulador paramétrico y el nuevo modo Laboratorio interactivo."*

---

### Bloque 2: Unidad 1 — Electrostática y Equipotenciales (1:00 - 2:45)
- **Toma en Pantalla**: Navegación a `/electricidad`.
- **Acciones del Presentador**:
  1. Mostrar el modo Simulador: alternar entre vista 2D y 3D.
  2. Resaltar las líneas equipotenciales: explicar que están generadas en tiempo real con el algoritmo **Marching Squares**, garantizando curvas cerradas suaves y matemáticamente exactas.
  3. Cambiar al modo **Laboratorio** mediante el interruptor superior.
  4. Arrastrar una carga positiva $+1\ \mu\text{C}$ y una negativa $-1\ \mu\text{C}$ para formar un dipolo.
  5. Tomar la sonda de potencial (voltímetro) y colocarla en el plano medio para demostrar en vivo que $V = 0.00\text{ V}$.
  6. Lanzar una partícula de prueba cargada; dejar que trace su órbita y presionar **"Reiniciar"** para demostrar la restauración determinista mediante el *snapshot* inmutable.
- **Locución sugerida**:
  > *"Ingresamos a la Unidad 1. En lugar de mapas de colores aproximados, hemos implementado el algoritmo Marching Squares para generar isolíneas equipotenciales continuas. Al pasar al modo Laboratorio, tenemos un banco de trabajo directo. Aquí colocamos un dipolo eléctrico. Moviendo la sonda de potencial al eje mediatriz, comprobamos que el voltaje es rigurosamente cero por superposición. Además, la carga de prueba cuenta con almacenamiento inmutable de condiciones iniciales, lo que permite reiniciar la trayectoria sin perder precisión ni generar singularidades infinitas."*

---

### Bloque 3: Unidad 2 — Capacitores y Dieléctricos (2:45 - 4:30)
- **Toma en Pantalla**: Navegación a `/capacitores`.
- **Acciones del Presentador**:
  1. Mostrar las placas paralelas interactivas en modo Laboratorio.
  2. Arrastrar los *handles* de separación para variar $d$ y observar cómo la capacitancia se actualiza instantáneamente según $C = \varepsilon_0 A / d$.
  3. Deslizar el bloque dieléctrico (Vidrio Pyrex, $\varepsilon_r = 4.7$) para insertarlo parcialmente entre las placas.
  4. Mostrar el selector de modo: **Batería Conectada ($V = \text{cte}$)** vs **Batería Desconectada ($Q = \text{cte}$)**.
  5. Abrir el panel de métricas para mostrar el balance de energía: con $V$ constante, el aumento de energía electrostática $\Delta U$ se corresponde exactamente con la mitad del trabajo suministrado por la batería ($W_{bat} = 2 \Delta U$). Con $Q$ constante, la energía disminuye debido al trabajo mecánico que succiona el dieléctrico hacia el interior.
- **Locución sugerida**:
  > *"En la Unidad 2 estudiamos el almacenamiento electrostático. Mediante manipuladores directos en el lienzo, modificamos la distancia y el área de las placas. Al insertar un dieléctrico, el simulador resuelve la inserción parcial mediante un modelo continuo de capacitores equivalentes en paralelo. Pero lo más importante es el rigor pedagógico: al comparar el modo de voltaje fijo frente al de carga fija, el estudiante puede contrastar las diferencias energéticas y el trabajo realizado por la fuente o por el campo electrostático."*

---

### Bloque 4: Unidad 3 — Circuitos DC y Demostración Clave MNA (4:30 - 7:15)
- **Toma en Pantalla**: Navegación a `/corriente` en modo **Laboratorio**.
- **Acciones del Presentador**:
  1. Mostrar la paleta de componentes: Batería, Resistor, Bombilla, Interruptor, Fusible, Voltímetro, Amperímetro.
  2. Arrastrar una batería y una resistencia; presionar la tecla **`R`** para girar la resistencia $90^\circ$.
  3. Hacer clic en el preset: **"Circuito Mixto de Aceptación"**.
  4. Explicar la topología: Fuente de $12\text{ V}$, $R_1 = 10\ \Omega$ en serie con $(R_2 = 20\ \Omega \parallel R_3 = 20\ \Omega)$.
  5. Hacer clic en **"⚡ Energizar Circuito"**.
  6. Mostrar los resultados en el inspector y panel de métricas:
     - $R_{eq} = 20.00\ \Omega$
     - Corriente principal: $I = 0.60\text{ A}$
     - Caída en $R_1$: $V_1 = 6.00\text{ V}$, Potencia: $P_1 = 3.60\text{ W}$
     - Corrientes de rama en paralelo: $I_2 = 0.30\text{ A}$, $I_3 = 0.30\text{ A}$
     - Potencias disipadas: $P_2 = 1.80\text{ W}$, $P_3 = 1.80\text{ W}$
     - Potencia suministrada por la batería: $P_{fuente} = 12\text{ V} \times 0.60\text{ A} = 7.20\text{ W}$
     - **Balance de Tellegen**: $\sum P = 3.60 + 1.80 + 1.80 = 7.20\text{ W}$.
  7. Hacer clic en el interruptor de la rama 3 para **abrirlo**:
     - Mostrar que la rama 3 se desactiva instantáneamente ($I_3 = 0\text{ A}$).
     - El circuito recalcula automáticamente a serie puro ($R_1 + R_2 = 30\ \Omega$), con nueva corriente $I = 0.40\text{ A}$ y potencia $4.80\text{ W}$.
  8. Cambiar al modo **Simulador**:
     - Mostrar la pestaña de **Electrodinámica**: explicar el modelo de Drude, la densidad de corriente $J$ y la velocidad de deriva ($v_d \approx 10^{-4}\text{ m/s}$).
     - Mostrar la pestaña de **Circuito RC**: observar la curva de carga y la gráfica de descarga con el signo físico negativo de corriente.
- **Locución sugerida**:
  > *"Llegamos al núcleo de la Unidad 3: nuestro editor esquemático de circuitos DC. Todo el cálculo está gobernado por un motor de Análisis Nodal Modificado (MNA) desarrollado en TypeScript puro. Carguemos la prueba de aceptación canónica: una batería de 12V conectada a un resistor de 10 ohmios en serie con dos ramas en paralelo de 20 ohmios cada una. Al energizar, el solver resuelve el sistema matricial: la resistencia equivalente es exactamente 20 ohmios, la corriente total es 0.60 amperios, y se disipan 3.6 vatios en R1 y 1.8 vatios en cada una de las resistencias en paralelo. El balance de potencia es exacto: 7.20 vatios entregados igual a 7.20 vatios disipados. Ahora, abramos el interruptor de la rama 3: en tiempo real la rama cae a cero amperios y el resto del circuito se recalcula sin recargar la página. Además, en el modo Simulador podemos estudiar el modelo microscópico de Drude y los transitorios RC con signo físico riguroso."*

---

### Bloque 5: Unidad 4 — Magnetismo y Boris Pusher (7:15 - 8:30)
- **Toma en Pantalla**: Navegación a `/magnetismo`.
- **Acciones del Presentador**:
  1. Mostrar el modo Laboratorio con la vista de corte transversal de conductores.
  2. Mover la brújula interactiva alrededor del conductor saliente ($\odot$) demostrando la regla de la mano derecha para $\vec{B}$.
  3. Cargar el preset **"Filtro de Velocidades de Wien"**:
     - Mostrar campos cruzados $\vec{E} \perp \vec{B}$.
     - Lanzar partículas con $v = E/B$ (rectilínea), $v < E/B$ (deflexión eléctrica) y $v > E/B$ (deflexión magnética).
  4. Cargar el preset **"Ciclotrón"**:
     - Mostrar la órbita circular cerrada.
     - Resaltar la gráfica temporal de rapidez: gracias al algoritmo simpléctico **Boris Pusher**, la rapidez de la partícula no se incrementa artificialmente como ocurriría con el método de Euler, conservando la energía mecánica dentro de $10^{-14}$.
- **Locución sugerida**:
  > *"En la Unidad 4 abordamos el electromagnetismo dinámico. En el laboratorio 2D podemos manipular corrientes y explorar el campo mediante una brújula virtual. Para el movimiento de partículas bajo la fuerza de Lorentz, implementamos el integrador Boris Pusher, el estándar de oro en física de plasmas. A diferencia de integradores convencionales que introducen energía artificial haciendo que las partículas diverjan en espirales infinitas, el algoritmo Boris preserva exactamente la rapidez y la energía cinética en presencia de campo magnético puro. Aquí vemos el filtro de Wien y la órbita ciclotrónica perfecta."*

---

### Bloque 6: Calidad de Software, Tests y Cierre (8:30 - 9:30)
- **Toma en Pantalla**: Terminal de PowerShell ejecutando los tests y el build de producción.
- **Acciones del Presentador**:
  1. Mostrar la consola con la ejecución de `npm test`: 47 pruebas superadas en 12 suites.
  2. Mostrar la compilación limpia con `npm run build` y `npm run lint`.
  3. Regresar al Hub y cerrar la presentación.
- **Locución sugerida**:
  > *"Detrás de esta interfaz amigable existe una estricta base de ingeniería de software: 47 pruebas unitarias y de integración automáticas en Vitest que validan cada ecuación física y cada regla topológica, cero advertencias de TypeScript y ESLint, integración continua mediante GitHub Actions y una arquitectura limpia que separa totalmente el dominio físico de la capa gráfica. Laboratorio Vectorial demuestra cómo la programación científica y el diseño UX pueden unirse para crear una experiencia de aprendizaje sólida y transparente. Muchas gracias."*

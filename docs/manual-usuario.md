# Manual de Usuario — Laboratorio Vectorial

Bienvenido a **Laboratorio Vectorial**, una plataforma web interactiva y rigurosa diseñada para la enseñanza y experimentación de conceptos de **Física II e Ingeniería de Sistemas**. El software opera íntegramente en el navegador cliente en TypeScript puro, sin requerir servidores externos ni complementos adicionales.

---

## 1. Navegación General y Arquitectura de la Interfaz

### 1.1 El Hub Principal (`/`)
La portada del simulador presenta el acceso directo a las cuatro unidades temáticas:
1. **Unidad 1: Electricidad, Campo y Potencial**
2. **Unidad 2: Capacitores y Dieléctricos**
3. **Unidad 3: Corriente y Ley de Ohm (Circuitos DC)**
4. **Unidad 4: Fuerza y Campo Magnético**

Cada tarjeta de unidad incluye una ilustración vectorial científica descriptiva, un resumen de objetivos físicos y un acceso con un solo clic.

### 1.2 Selector Dual: Simulador vs Laboratorio
Al ingresar a cualquiera de las unidades, la barra superior ofrece una barra de herramientas persistente con un selector de modo:
- **Modo Simulador**: Orientado al análisis paramétrico cuantitativo, gráficas continuas y visualizaciones globales en 2D y 3D.
- **Modo Laboratorio**: Mesa de trabajo interactiva tipo banco de pruebas, con manipulación directa, arrastrar y soltar (drag & drop), cableado virtual, sondas de medición y retroalimentación visual en tiempo real.

### 1.3 Disposición del Laboratorio (`LabShell`)
La interfaz del modo Laboratorio se compone de cuatro zonas ergonómicas:
1. **Biblioteca de Componentes (Panel Izquierdo)**: Paleta de elementos físicos listos para arrastrar o hacer clic para agregarlos a la mesa de trabajo.
2. **Mesa de Trabajo / Lienzo Central**: Espacio interactivo con rejilla magnética (*snap-to-grid*), soporte para desplazamiento panorámico (*pan*) y zoom.
3. **Inspector Contextual (Panel Derecho)**: Al seleccionar cualquier carga, componente o sonda, muestra sus propiedades físicas editables con validación en tiempo real y teclado numérico sincronizado.
4. **Panel Inferior de Métricas y Gráficas**: Resumen de lecturas físicas (tensión, corriente, energía, balance de potencias) y gráficas científicas con retícula y cursor interactivo.

---

## 2. Unidad 1: Electricidad, Campo y Potencial

### 2.1 Modo Simulador
- **Inserción de Cargas**: Añada cargas especificando magnitud ($q$ en $\mu\text{C}$ o $\text{nC}$) y coordenadas $(x, y, z)$.
- **Representación 2D**:
  - **Vectores de Campo Eléctrico ($\vec{E}$)**: Flechas normalizadas con gradiente de color indicando magnitud y sentido.
  - **Líneas Equipotenciales**: Curvas continuas calculadas mediante el algoritmo *Marching Squares* en lugar de bandas discretas aproximadas.
- **Representación 3D**:
  - Superficies equipotenciales volumétricas y vectores tridimensionales. Si WebGL no está soportado en su equipo, la aplicación cambia de manera transparente y segura a la vista 2D.
- **Carga de Prueba**:
  - Configure masa $m$, carga $q_t$, posición y velocidad inicial $\vec{v}_0$.
  - Controles: **Lanzar**, **Pausar**, **Paso a paso** y **Reiniciar**.
  - El botón **Reiniciar** restaura exactamente las condiciones iniciales del *snapshot* inmutable sin acumular errores numéricos.

### 2.2 Modo Laboratorio (Mesa de Cargas)
- **Paleta de Cargas**: Arrastre cargas positivas ($+1\ \mu\text{C}$) y negativas ($-1\ \mu\text{C}$) directamente sobre la mesa.
- **Sondas de Medición**:
  - **Voltímetro con Sonda de Potencial**: Arrastre la sonda de prueba para leer el potencial escalar $V$ exacto en cualquier punto del espacio.
  - **Sonda Vectorial $\vec{E}$**: Muestra los componentes cartesianos $E_x, E_y$ y la magnitud $|E|$ en $\text{N/C}$.
- **Presets Rápidos**:
  - *Carga Aislada*: Explora la ley del inverso del cuadrado.
  - *Dipolo Simétrico*: Observa la superficie equipotencial nula en el eje de simetría.
  - *Cuadrupolo*: Cuatro cargas alternadas para analizar la caída rápida del potencial dipolar cuadrático.
  - *Capacitor Plano Discreto*: Serie de cargas discretas simulando placas paralelas.
- **Capas Visuales**: Active o desactive de forma independiente los vectores de campo, las equipotenciales por contornos o la rejilla de fondo.

---

## 3. Unidad 2: Capacitores y Dieléctricos

### 3.1 Modo Simulador
- Permite parametrizar el área de placas $A$, distancia de separación $d$ y voltaje aplicado $V$.
- Proporciona gráficas continuas de $C(d)$ y de la energía electrostática almacenada $U(V) = \frac{1}{2} C V^2$.
- Permite guardar un "Escenario de Referencia" para visualizar la comparación inmediata contra modificaciones subsecuentes.

### 3.2 Modo Laboratorio (Banco de Placas Interactivas)
- **Manipulación Directa**:
  - Arrastre los tiradores (*handles*) en pantalla para modificar visualmente la separación $d$ entre placas o el área $A$.
  - Arrastre el bloque dieléctrico para insertarlo parcialmente entre las placas (fracción de penetración $f \in [0, 1]$).
- **Biblioteca de Materiales Dieléctricos**:
  - Vacío ($\varepsilon_r = 1.0$)
  - Aire ($\varepsilon_r = 1.0006$)
  - Teflón ($\varepsilon_r = 2.1$)
  - Papel parafinado ($\varepsilon_r = 3.7$)
  - Vidrio Pyrex ($\varepsilon_r = 4.7$)
  - Titanato de Estroncio / Cerámica especial ($\varepsilon_r = 300.0$)
- **Selector de Régimen de Operación**:
  - **Batería Conectada ($V = \text{cte}$)**: Al insertar el dieléctrico, la capacitancia $C$, la carga $Q$ y la energía almacenada $U$ aumentan proporcionalmente. El sistema contabiliza el trabajo suministrado por la fuente ($W_{bat} = 2 \Delta U$).
  - **Batería Desconectada ($Q = \text{cte}$)**: Al insertar el dieléctrico con carga fija, la capacitancia $C$ aumenta pero el potencial $V$, el campo $E$ y la energía $U$ disminuyen. La diferencia de energía corresponde al trabajo mecánico realizado por el campo al succionar la placa dieléctrica.
- **Panel Comparativo Delta**: Muestra en tiempo real los cambios absolutos ($\Delta C, \Delta Q, \Delta V, \Delta U$) y porcentuales respecto al estado inicial sin dieléctrico.

---

## 4. Unidad 3: Corriente y Circuitos DC (MNA)

### 4.1 Modo Laboratorio: Editor Esquemático de Circuitos
El editor permite armar cualquier red eléctrica arbitraria en corriente continua mediante Análisis Nodal Modificado (MNA).

#### Componentes Disponibles
- **Batería DC**: Fuente de tensión independiente ideal ($V$ regulable, default $12\text{ V}$).
- **Resistor**: Resistencia lineal óhmica ($R$ en $\Omega$, default $10\ \Omega$ o $20\ \Omega$).
- **Bombilla**: Carga resistiva que enciende su filamento de forma realista según la potencia disipada calculada ($P = I^2 R$).
- **Interruptor**: Llave de paso con estados `Abierto` / `Cerrado`. Se commuta haciendo clic sobre el componente.
- **Fusible**: Elemento de protección con corriente nominal de ruptura $I_{max}$. Si $I > I_{max}$, el filamento se funde y abre la rama.
- **Voltímetro**: Instrumento de alta impedancia para medir diferencia de potencial entre dos nodos.
- **Amperímetro**: Instrumento de inserción en rama para medir intensidad de corriente.

#### Atajos de Teclado y Gestos de Edición
- **Arrastrar componente**: Clic y arrastre desde la paleta hasta la rejilla.
- **Seleccionar**: Clic sobre el cuerpo del componente.
- **Rotar componente**: Presione la tecla **`R`** o haga clic en el botón de giro en el inspector contextual. El componente rota $90^\circ$ manteniendo coherencia en los terminales.
- **Trazar Cable**:
  1. Pase el cursor sobre un terminal de un componente (se destacará un círculo de conexión).
  2. Haga clic sobre el terminal de origen.
  3. Mueva el cursor hacia el terminal de destino y haga clic. El cable queda registrado en el netlist.
- **Eliminar Elemento o Cable**: Seleccione el elemento y presione la tecla **`Supr`** (**`Delete`**) o use el botón "Eliminar" en el inspector.
- **Deshacer / Rehacer**: Use los botones **`Deshacer`** y **`Rehacer`** en la barra superior.

#### Energización y Diagnóstico
1. Haga clic en el botón **`⚡ Energizar Circuito`**.
2. El motor MNA resuelve simultáneamente todas las tensiones nodales y corrientes de rama.
3. Las ramas con corriente activa muestran partículas animadas que indican el sentido de flujo convencional.
4. Si el circuito presenta anomalías, el sistema no inventa números:
   - **Circuito Abierto**: Indica los nodos desconectados y muestra $0\text{ A}$ en ramas sin retorno.
   - **Cortocircuito**: Si la fuente está en cortocircuito directo, emite una advertencia de protección y previene la divergencia matemática.
   - **Nodo Flotante**: Señala terminales aislados sin ruta a la referencia (GND).

#### Presets Didácticos de Un Clic
- **Circuito Mixto de Aceptación**: Carga instantáneamente la red canónica: Fuente $12\text{ V}$, $R_1 = 10\ \Omega$ en serie con $(R_2 = 20\ \Omega \parallel R_3 = 20\ \Omega)$.
  - Al energizar, verifique: $I_{total} = 0.60\text{ A}$, $V_1 = 6.00\text{ V}$, $P_1 = 3.60\text{ W}$, $I_2 = I_3 = 0.30\text{ A}$, $P_2 = P_3 = 1.80\text{ W}$ y $P_{fuente} = 7.20\text{ W}$.
  - Abra el interruptor de la rama 3 haciendo clic sobre él y observe la transición inmediata a $I = 0.40\text{ A}$.
- **Circuito Serie**: Dos resistores en hilera simple.
- **Circuito Paralelo**: Dos bombillas en paralelo con voltajes idénticos.

### 4.2 Modo Simulador
- **Pestaña Electrodinámica**: Estudio microscópico del modelo de Drude. Modifique longitud $L$, sección transversal $A$ y el material conductor (Cobre, Aluminio, Plata, Oro, Hierro). Observe la densidad de corriente $J = I/A$ y la bajísima velocidad de arrastre de los electrones ($v_d \approx 10^{-4}\text{ m/s}$) frente a la velocidad de propagación de la señal electromagnética.
- **Pestaña Transitorio RC**: Gráfica de alta resolución del proceso de carga y descarga exponencial. Permite alternar la visualización de la corriente de descarga con su signo físico estricto ($-I(t)$) o en valor absoluto ($|I(t)|$).

---

## 5. Unidad 4: Magnetismo y Fuerza de Lorentz

### 5.1 Modo Simulador
- Visualización 3D y 2D de líneas de inducción magnética generadas por:
  - **Conductor rectilíneo infinito**: $B(r) \propto 1/r$.
  - **Dipolo magnético**: Simulación de momento magnético dipolar con líneas toroidales cerradas.
- Integrador simpléctico **Boris Pusher**: Permite simular partículas cargadas en movimiento sin pérdida ni ganancia artificial de energía cuando $\vec{E} = 0$.

### 5.2 Modo Laboratorio
- **Mesa de Experimentos 2D**:
  - Vista en corte transversal de conductores con corriente saliente ($\odot$) o entrante ($\otimes$).
  - **Brújula de Prueba**: Arrastre la aguja imantada por la pantalla. La aguja se orienta instantáneamente en la dirección del vector local $\vec{B}$, demostrando la regla de la mano derecha.
- **Laboratorio de Lorentz y Haces de Partículas**:
  - Lance iones o electrones en regiones con campos cruzados $\vec{E} \perp \vec{B}$.
  - **Preset Filtro de Wien**: Sintonice la velocidad de equilibrio $v = E/B$ para lograr que el haz no sufra ninguna deflexión.
  - **Preset Ciclotrón / Radio de Larmor**: Observe la órbita circular cerrada con radio $r_L = \frac{m v}{|q|B}$ y verifique que la rapidez se mantiene estrictamente constante.

---

## 6. Accesibilidad y Compatibilidad

- **Navegación por Teclado**: Todos los campos, botones y selectores cuentan con foco visible accesible (`outline-visible`) y atributos semánticos `aria-label`.
- **Sensibilidad al Movimiento**: Si el sistema operativo tiene activada la opción de reducir movimiento (`prefers-reduced-motion`), las animaciones de portadores de carga y partículas se atenúan o suspenden automáticamente.
- **Compatibilidad Gráfica**: La aplicación detecta automáticamente la disponibilidad de aceleración WebGL por hardware. Si falla la inicialización de Three.js, el simulador activa un respaldo (*fallback*) 2D interactivo sin bloquear al usuario ni interrumpir la sesión experimental.
- **Compatibilidad de Dispositivos**: La interfaz es plenamente adaptable y ha sido verificada en monitores de escritorio estándar ($1920\times 1080$), portátiles de recursos moderados ($1366\times 768$) y pantallas táctiles móviles.

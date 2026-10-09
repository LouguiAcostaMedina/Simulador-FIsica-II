# Guion del Video Demostrativo

Este guion es una propuesta de 5-10 minutos para la demostración del Simulador de Física II.

## 1. Introducción (1 minuto)
- **Pantalla:** Hub principal (Portada).
- **Acción:** Presentar el simulador, mencionar que cubre las unidades de Electrostática (Campo y Potencial), Capacitores, Corriente Continua (Ohm) y Magnetismo.
- **Narración:** "Bienvenidos a nuestro simulador interactivo de Física II. Este laboratorio virtual está diseñado para facilitar la visualización de los conceptos físicos. Empecemos explorando el campo eléctrico..."

## 2. Unidad 1: Campo y Potencial Eléctrico (2 minutos)
- **Pantalla:** Módulo U1 (Electricidad).
- **Acción:** 
  1. Añadir una carga positiva (+1 μC). Mostrar cómo se generan los vectores de campo divergentes.
  2. Añadir una carga negativa (-1 μC) cerca (o usar el Preset Dipolo).
  3. Mover las cargas por la pantalla y observar la actualización en tiempo real de las líneas de campo y equipotenciales.
  4. Usar la vista 3D para ver las superficies de potencial acotadas (las metaballs coloreadas).
  5. Cargar una partícula de prueba y lanzarla para observar la aceleración.
- **Narración:** "Aquí visualizamos el campo eléctrico y el potencial escalar..."

## 3. Unidad 2: Capacitores y Dieléctricos (2 minutos)
- **Pantalla:** Módulo U2 (Capacitores).
- **Acción:**
  1. Cambiar la distancia $d$ y área $A$ de las placas. Mostrar la gráfica de $C$ vs $d$.
  2. Cambiar de "V fijo" a "Q fijo" y modificar los valores.
  3. Insertar un dieléctrico ($\varepsilon_r > 1$) para ver la polarización esquemática (dipolos 3D).
  4. Ver la gráfica de Energía $U$.
- **Narración:** "El simulador muestra las placas 3D y permite interactuar con el área y distancia..."

## 4. Unidad 3: Corriente y Ley de Ohm (2 minutos)
- **Pantalla:** Módulo U3 (Corriente y Circuitos).
- **Acción:**
  1. Mostrar el árbol de resistencias. Añadir una resistencia en serie, luego una en paralelo.
  2. Cambiar el valor del voltaje de la fuente. Mostrar cómo cambian $I$, $R_{eq}$ y la potencia disipada total.
  3. Cambiar a la pestaña "Circuito RC". Ajustar R, C, V y observar las curvas de carga/descarga exponencial.
- **Narración:** "Para corriente continua, contamos con un resolver recursivo que calcula la equivalencia de redes complejas, además de simulación RC..."

## 5. Unidad 4: Magnetismo y Fuerza de Lorentz (2 minutos)
- **Pantalla:** Módulo U4 (Fuerza Magnética).
- **Acción:**
  1. Seleccionar "Hilo Rectilíneo" con corriente $I = 10 \text{ A}$. Mostrar el campo $B$ rotacional usando anillos de prueba.
  2. Lanzar la partícula ($q=1$, $v_z=5$) en el campo magnético puro.
  3. Agregar un Campo Eléctrico externo en $Y$ (Ey > 0) y observar el efecto del selector de velocidades / deriva $E \times B$.
- **Narración:** "En la sección final calculamos el campo Biot-Savart de un alambre, y calculamos con pasos temporales limitados la fuerza de Lorentz..."

## 6. Cierre (1 minuto)
- **Pantalla:** Volver al Hub.
- **Narración:** "El desarrollo garantiza que no hay dependencias opacas: los cálculos como superposición o resolución de malla resistiva se efectúan de manera transparente por el motor de React/TypeScript."

# CONTEXTO Y PROMPT MAESTRO PARA CLAUDE
## Laboratorio Vectorial — Rediseño UX/UI + laboratorios interactivos de Física II (V2)

> **Uso de este documento:** pega todo este contenido en Claude (o adjúntalo como archivo `.md`) cuando Claude tenga acceso al repositorio y al entorno de desarrollo. Es una **solicitud de implementación real**, no solo de ideas, mockups o una propuesta visual.
>
> **Proyecto:** `LouguiAcostaMedina/Simulador-FIsica-II`  
> **Repositorio:** https://github.com/LouguiAcostaMedina/Simulador-FIsica-II.git  
> **Aplicación declarada:** https://simulador-f-isica-ii.vercel.app  
> **Idioma de la app y la documentación:** español.  
> **Fecha del informe base:** 9 de noviembre de 2026. **Revalida el estado de GitHub al comenzar**.

---

# 0. INSTRUCCIÓN PRINCIPAL PARA CLAUDE

Actúa como **ingeniero senior de frontend, diseñador de producto UX/UI y desarrollador de simulaciones científicas**. Tu misión es **evolucionar el proyecto existente** a un entorno visual de aprendizaje moderno, interactivo y científicamente confiable.

**Mi principal problema actual es que las gráficas, las escenas y las interfaces de los laboratorios se ven demasiado simples y no resultan suficientemente interactivas ni didácticas.** Quiero una transformación visible del dashboard y de **las cuatro unidades**, sin perder el trabajo existente.

Para **cada unidad** implementa **dos modos complementarios**, accesibles mediante una selección clara en la interfaz:

1. **Modo Simulador (existente, rediseñado):** conserva y mejora el funcionamiento actual de la unidad, con resultados numéricos, controles, fórmulas, visualizaciones 2D/3D, gráficas más precisas y estados de simulación completos.
2. **Modo Laboratorio (nuevo):** área de experimentación visual donde el estudiante **crea, arrastra, coloca, conecta o manipula** elementos físicos, cambia propiedades desde un inspector lateral, ejecuta el experimento y observa su respuesta. Debe ser una funcionalidad real con motor físico; **no un video, dibujo fijo, maqueta ni animación desvinculada de cálculos**.

**Caso de uso obligatorio y de mayor prioridad:** en la unidad de **circuitos**, ofrecer un laboratorio gráfico donde pueda arrastrar una batería, resistencias, bombillas, interruptores, cables y medidores; conectar terminales; disponer componentes en serie, paralelo o mixto sin limitarme a una lista; seleccionar cada componente para editar variables desde un sidebar; energizar el circuito y visualizar qué partes reciben corriente, cuáles no, qué voltaje/corriente/potencia tiene cada pieza y qué errores o fallos existen. El cálculo debe respetar la conectividad real del circuito dibujado.

**No reemplaces la app por otra distinta ni elimines módulos para rediseñar.** Refactoriza incrementalmente, conserva rutas cuando sea viable y mantén la compatibilidad funcional.

---

# 1. CONTEXTO REAL DEL REPOSITORIO

## 1.1 Propósito académico

- Nombre: **Laboratorio Vectorial**.
- Aplicación web educativa de **Física II** para estudiantes de Ingeniería de Sistemas.
- Permite explorar electricidad, capacitancia, corriente y magnetismo mediante cálculos y visualizaciones.
- Se requiere un producto **pedagógico, verificable, intuitivo, responsive y apto para una demostración académica**.
- El usuario desarrolla principalmente en **Windows 11 / PowerShell**, con Git/GitHub y Antigravity; el hardware reportado es **Intel i3 y 8 GB de RAM**. Evita soluciones innecesariamente pesadas.

## 1.2 Stack declarado en `package.json` (no confundir con versiones exactas instaladas)

| Tecnología | Versión declarada | Uso |
|---|---:|---|
| React | `^18.3.1` | UI |
| TypeScript | `^5.6.3` | Modelos, lógica y tipado |
| Vite | `^5.4.8` | Build y desarrollo |
| Three.js | `^0.169.0` | Renderizado 3D |
| `@react-three/fiber` | `^8.17.9` | Three.js con React |
| `@react-three/drei` | `^9.114.0` | Herramientas 3D |
| React Router DOM | `^6.27.0` | Rutas |
| CSS | Nativo | Diseño visual |
| Vitest | `^2.1.2` | Tests |
| ESLint | `^9.12.0` | Lint |
| jsdom | `^29.1.1` | Entorno de tests |
| Vercel | Configurada | Despliegue web estático |

No hay backend ni base de datos obligatorios. **Los cálculos deben seguir ejecutándose en TypeScript, en el navegador**, salvo propuesta justificada y aprobada. Evita añadir autenticación, servicios de pago, un backend o IA porque no son necesarios para esta mejora.

## 1.3 Estructura observada

```text
src/
  app/
    App.tsx
    Hub.tsx
    Hub.css
  modules/
    electric/
      domain/FieldMath.ts
      application/ElectricSimulation.ts
      presentation/ElectricModule.tsx
      presentation/Electric2DView.tsx
      presentation/Electric3DView.tsx
    capacitors/
      domain/CapacitorMath.ts
      presentation/CapacitorsModule.tsx
      presentation/Capacitor3DView.tsx
    current/
      CurrentModule.tsx
      CircuitView.tsx
      RCView.tsx
      domain/CurrentMath.ts
      domain/CircuitSolver.ts
    magnetism/
      MagnetismModule.tsx
      domain/MagnetismMath.ts
      presentation/Magnetism3DView.tsx
  shared/
    domain/Vector3.ts
    domain/constants.ts
    ui/SimpleLineChart.tsx
    ui/SimulationLayout.css
    ui/isWebGLAvailable.ts
docs/
  arquitectura.md
  modelo-fisico.md
  validacion.md
  manual-usuario.md
  plan.md
  diseno-ui.md
  guia-video.md
  decisiones/ADR-001-stack.md
```

**Rutas identificadas:** `/`, `/electric`, `/capacitors`, `/current`, `/magnetism`.

## 1.4 Estado observado en la inspección anterior — revalidar antes de programar

- `main` observado con HEAD `272bd201f2777ecd0152a92ede3c95d5517129a3` (commit del **10/10/2026**).
- Ramas observadas: `main` y `develop`.
- `README.md` declara U1, U2, U3 y U4 terminadas; existe código para las cuatro.
- El Hub de `src/app/Hub.tsx` todavía presentaba **U3/U4 como “Próximamente”**, aunque sus rutas y módulos existen.
- Hay cinco archivos `*.test.ts` con **14 casos de prueba definidos**. Esto **no significa que se ejecutaron y pasaron ahora**.
- La integración GitHub/Vercel reportaba estado `success` para ese commit. **No sustituye una verificación real de la UI y de los builds actuales**.
- No se encontraron ejecuciones de GitHub Actions en el repositorio revisado.
- `docs/plan.md` seguía marcando U3/U4 como pendientes, y `docs/modelo-fisico.md` solo describía U1/U2.
- `src/modules/electric/presentation/ElectricModule.css` presentó datos de codificación anómalos, y `.gitignore` presentó bytes nulos; revisa los bytes reales y la dependencia de esos archivos antes de corregirlos.
- Hay archivos generados `vite.config.js` y `vite.config.d.ts` versionados: revisar si son artefactos sobrantes, sin borrar nada a ciegas.

### Hallazgos técnicos concretos que debes corregir

1. **U1 reinicio:** se restablecen tiempo/trayectoria, pero no se conservan y restauran explícitamente posición/velocidad iniciales. Crear snapshot de condiciones iniciales y una acción de reinicio consistente.
2. **U1 potencial 3D:** las `MarchingCubes` actuales se basan en metaballs cualitativas; **no representan equipotenciales físicos exactos**. Reemplazar por isosuperficies derivadas de `V(x,y,z)` si el presupuesto de rendimiento lo permite, o rotular claramente la aproximación y proporcionar una representación numéricamente válida alternativa.
3. **U4 integración:** usa un esquema numérico sencillo para Lorentz y puede introducir error energético. Evaluar y, si procede, implementar **Boris pusher** u otro método adecuado y probar conservación de rapidez con campo `E=0`.
4. **U3 circuitos:** el editor existente emplea un **árbol serie/paralelo** y no soporta colocación y cableado libre de componentes. Para el nuevo laboratorio se necesita **modelo de circuito por nodos/terminales** y solucionador apropiado, sin tratar la posición en pantalla como conexión eléctrica.
5. **Entradas:** validar valores positivos, finitud, divisiones por cero, singularidades, topologías abiertas, cortocircuitos y condiciones físicas no admitidas.
6. **WebGL:** U1 tiene ruta 2D de respaldo; U2/U4 necesitan alternativas significativas cuando no exista WebGL o se pierda el contexto.
7. **Calidad:** agregar CI, pruebas E2E/interacción, pruebas de modelos numéricos y documentación alineada al código real.

---

# 2. VISIÓN DEL REDISEÑO VISUAL

## 2.1 Estilo buscado

Quiero una aplicación **premium, moderna, rigurosa, técnica y agradable**, con identidad de **laboratorio científico interactivo**: mezcla de un buen software de ingeniería, una plataforma didáctica moderna y una simulación física en tiempo real. Puede inspirarse en la **claridad pedagógica** de PhET, la **manipulación interactiva** de un editor visual de circuitos y la **legibilidad técnica** de herramientas CAD, **sin copiar pantallas, marcas ni recursos protegidos**.

No quiero:
- Una cuadrícula de tarjetas genéricas idénticas ni un dashboard vacío.
- Gráficas simples que no se puedan inspeccionar ni relacionar con el experimento.
- Animaciones decorativas que den información física falsa.
- Efectos 3D que impidan editar, medir o entender el fenómeno.
- Una interfaz que solo funcione en una pantalla grande.
- Una sustitución del motor de cálculo por resultados hardcodeados.

Sí quiero:
- Diagramas y escenas **mucho más elaborados y legibles**.
- Equipos, componentes y símbolos científicos reconocibles.
- Interacciones fluidas: drag & drop, selección, edición, conectar/desconectar, zoom, pan y reiniciar.
- Resultados numéricos, ecuaciones, unidades y gráficas **sincronizados con el experimento**.
- Cámara 3D giratoria cuando realmente mejora la comprensión; vista 2D cuando mejora precisión o rendimiento.
- Transiciones discretas, jerarquía tipográfica, contraste y feedback claros.
- Experimentos guiados y modo libre, ejemplos reproducibles y reset.

## 2.2 Diseño del dashboard / Hub

Rediseñar integralmente la pantalla de inicio `/`:

- **Hero científico:** título “Laboratorio Vectorial”, descripción breve, acceso directo a “Continuar explorando”, escena 3D liviana o ilustración interactiva de física que no bloquee la carga ni sea decorativamente dominante.
- **Selector de unidades** con cuatro tarjetas **realmente operativas**, cada una con representación propia del fenómeno (no cuatro tarjetas iguales con un emoji), descripción, temas, modalidad de simulador/laboratorio y acceso explícito.
- **Previsualización interactiva** o microescena reducida solo si es ligera y no añade cálculos costosos al hub.
- **Recorridos de aprendizaje**: “Explorar con parámetros”, “Construir experimento”, “Consultar fórmulas”.
- **Sección de ayuda**: cómo interactuar, qué representa cada color/símbolo, límites del modelo, controles de cámara.
- **Estado de unidad fiel al código**, sin “Próximamente” para algo ya implementado.
- **Footer** con autoría académica, versión y límites educativos; no inventar afiliaciones ni validaciones.
- Diseño responsive para escritorio, tablet y móvil.

## 2.3 Layout estándar compartido por los cuatro módulos

En escritorio:

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Navegación / Unidad / Modo: [Simulador] [Laboratorio] / 2D-3D / Ayuda       │
├───────────────────┬───────────────────────────────────┬──────────────────────┤
│ Herramientas /    │                                   │ Inspector de objeto  │
│ biblioteca de     │       LIENZO INTERACTIVO          │ seleccionado          │
│ componentes       │      (2D/3D según unidad)         │ parámetros editables  │
│ / presets         │                                   │ unidades y errores    │
│                   │                                   │                      │
├───────────────────┴───────────────────────────────────┴──────────────────────┤
│ Gráficas, medidas, ecuaciones, estado, eventos y explicación de resultados  │
└──────────────────────────────────────────────────────────────────────────────┘
```

En móvil: canvas prioritario con bandejas desplegables para biblioteca, inspector y resultados; evitar que un sidebar fijo ocupe el ancho completo. Zoom táctil y controles grandes.

**El inspector derecho es contextual:** al seleccionar una resistencia muestra `R` y límites; al seleccionar una carga muestra `q`, posición, etc. No forzar al estudiante a buscar el componente en una lista aislada.

## 2.4 Sistema de diseño

- Conservar o evolucionar la identidad existente (`#111A20`, `#1C2930`, `#F4F0E8`, `#42D7C8`, `#F5A66A`, `#B69BE8`, `#F27C77`) si ofrece buen contraste. Mejorar tokens, no agregar colores sin semántica.
- Tipografía clara; números y unidades alineados; lenguaje español correcto.
- Estados: seleccionado, en ejecución, pausado, sin energía, circuito abierto, error, saturación, singularidad, WebGL no disponible.
- Iconografía coherente y diagramas propios. Colores con leyenda, no únicos indicadores.
- Ejes, escalas, cuadrícula conmutables, unidades SI, herramientas de medición y cursores con valores.
- Gráficas con hover/cursor, series con unidades, leyenda, marcas de tiempo y opción de reinicio/pausa; usar SVG/Canvas o una librería **solo si justifica su peso**.
- Controles accesibles por teclado, `aria-label` y foco visible; respetar `prefers-reduced-motion`.
- Errores junto al elemento relevante: qué ocurrió y cómo corregirlo.

---

# 3. DOS VISTAS OBLIGATORIAS POR UNIDAD

No confundir **modo de uso** (Simulador / Laboratorio) con **dimensión visual** (2D / 3D).

- **Modo Simulador:** modernización del módulo que ya existe; gráficas científicas mejoradas y controles paramétricos; conservar ecuaciones, resultados y escenarios válidos.
- **Modo Laboratorio:** construcción y manipulación libre de un experimento.
- En ambos modos, el modelo físico debe ser el mismo **o compartir operaciones de dominio**. No mantener dos implementaciones divergentes de una misma fórmula.
- Donde sea útil, permitir conmutar **2D/3D dentro del modo**, sin pérdida de parámetros. Si algún experimento solo tiene una dimensión físicamente útil, explicarlo.
- Guardar configuración temporal dentro de la sesión al alternar modos; no borrar los cambios sin aviso.
- Diferenciar la escena del experimento del modelo matemático: **renderiza el estado calculado**, nunca calcules física a partir del color de un cable, posición arbitraria o animación.

---

# 4. UNIDAD U1 — CAMPO Y POTENCIAL ELÉCTRICO

## 4.1 Modo Simulador (mejorar existente)

- Rediseñar `ElectricModule`, `Electric2DView` y `Electric3DView`.
- Mantener hasta diez cargas, arrastre, presets, inspector, campo y potencial, partícula de prueba y controles temporales.
- Mostrar cargas con magnitud, signo, coordenadas y unidades visibles; campo vectorial configurable con leyenda de longitud/color.
- Trazar líneas de campo integradas, distinguiendo fuentes y sumideros y estableciendo límites seguros.
- Mapa 2D de potencial con isolíneas trazadas con método apropiado (p. ej. **marching squares**), no depender solo de celdas coloreadas cercanas a múltiplos de voltaje.
- Vista 3D con campo/equipotenciales respaldados por cálculo; gestionar singularidades y presupuesto gráfico.
- Inspector de puntos con `Ex, Ey, Ez, |E|, V` y coordenadas; añadir lectura de signo, distancia y ecuación usada.
- Mejorar el historial de trayectoria con botones **Iniciar / Pausar / Paso / Reiniciar**, escala de tiempo físico, parámetros `q`, `m`, `v0` y posiciones iniciales editables.
- Corregir reinicio a estado reproducible de partícula.

## 4.2 Modo Laboratorio (nuevo)

Un **banco de electrostática** donde el estudiante pueda:

1. Arrastrar cargas `+q` y `-q` desde una biblioteca hacia una mesa 2D/3D.
2. Seleccionar cada carga y editar valor, coordenadas y, cuando corresponda, bloqueo de posición.
3. Crear y modificar arreglos: carga aislada, dipolo, cuadrupolo, distribución de cargas puntuales.
4. Arrastrar **sondas** de campo/potencial para medir magnitudes en posiciones elegidas.
5. Colocar una partícula de prueba, establecer su velocidad/carga/masa y ejecutar el movimiento.
6. Activar capas: líneas de campo, vectores, equipotenciales, trayectoria y ejes.
7. Guardar/restaurar un experimento dentro de la sesión; exportar/importar JSON si se implementa sin complicar la entrega.

**Requisito físico:** ley de Coulomb, superposición, singularidades explícitas y un integrador con parámetros y errores controlados. Un movimiento ilustrativo nunca debe presentarse como simulación exacta si no lo es.

---

# 5. UNIDAD U2 — CAPACITORES Y DIELÉCTRICOS

## 5.1 Modo Simulador (mejorar existente)

- Mantener modelo de placas paralelas, área `A`, distancia `d`, `εr`, fuente, voltaje/carga fija.
- Mejorar render 3D: placas visibles, separación medible, material dieléctrico distinguible y polarización **etiquetada como esquema**, no como escala molecular real.
- Mostrar claramente `C`, `Q`, `V`, `E`, `U`, modo de conservación y unidades.
- Gráficas útiles: `C(d)`, `U(V)` o `U(Q)` según modo, con cursor y punto actual.
- Comparación antes/después con diferencias absolutas y porcentuales cuando el denominador sea válido.
- Evitar cambiar físicamente el modo de batería sin conservar la magnitud correcta.
- Alternativa 2D real cuando WebGL falle.

## 5.2 Modo Laboratorio (nuevo)

Un **banco de capacitores** que permita:

1. Crear un capacitor de placas y cambiar **visualmente** área y separación (manijas/handles), con equivalencia numérica en el inspector.
2. Arrastrar una lámina dieléctrica desde una biblioteca e insertarla o retirarla del espacio entre placas.
3. Conectar/desconectar una fuente ideal con una representación clara del circuito (modo `V` fijo frente a `Q` fijo).
4. Colocar voltímetro, medidor de carga/campo conceptual y sondas donde el modelo sea válido.
5. Observar gráficas y magnitudes al mover el material, variando el modelo solo dentro de su rango implementado.
6. Probar escenarios: vacío/aire, material con `εr` editable, batería conectada y desconectada.
7. Mostrar una explicación corta de **qué permanece constante** y **qué aumenta/disminuye**.

**Importante:** si el dieléctrico se introduce parcialmente, implementar primero un modelo físico válido y documentado para la fracción de inserción (p. ej. capacitor equivalente por áreas) antes de animarlo como variable continua. Si no hay modelo, limitar a inserción completa y explicarlo. Mantener los supuestos de placas ideales y efectos de borde despreciados.

---

# 6. UNIDAD U3 — CORRIENTE, LEY DE OHM Y CIRCUITOS (PRIORIDAD ALTA)

## 6.1 Modo Simulador (mejorar existente)

- Preservar `CurrentModule`, `CircuitSolver`, `CircuitView`, `RCView` y `CurrentMath` con un rediseño visual profundo.
- Mantener el editor lógico actual de resistencias en serie/paralelo y su cálculo de equivalentes, corriente y potencia.
- Mejorar representación eléctrica con símbolos correctos, unidades, resultados por resistor y traza de caída de tensión.
- Integrar en UI las funciones actualmente aisladas: corriente `I=ΔQ/Δt`, densidad `J=I/A`, velocidad de deriva `v_d=I/(n|q|A)`, resistencia `R=ρL/A`.
- Presentar diferencias entre **corriente convencional** y deriva de electrones.
- Circuito RC: gráfica temporal físicamente consistente, controles de carga/descarga, `τ=RC`, unidades, tiempo, límites `R>0`, `C>0`, reinicio y pausa. Revisar el signo de corriente en descarga: mostrar magnitud o signo con convención clara.

## 6.2 Modo Laboratorio de circuitos (nuevo; imprescindible)

### Objetivo de UX

**Construir circuitos directamente en un lienzo**, como un laboratorio de circuitos o editor esquemático moderno; no solo pulsar “agregar resistencia en serie”. Debo poder colocar componentes donde quiera, moverlos y conectarlos con cables a través de terminales.

### Biblioteca mínima de componentes

- Batería / fuente DC configurable en voltios.
- Resistencia configurable en ohmios y, opcionalmente, potencia nominal.
- Bombilla representada visualmente, modelada inicialmente como carga resistiva documentada (no fingir un modelo térmico real).
- Interruptor abierto/cerrado.
- Cable conductor y puntos de unión.
- Voltímetro y amperímetro virtuales con medición real del circuito calculado; indicar cómo se conectan correctamente.
- Fusible / protector opcional, con umbral explícito si se introduce simulación de fallos.
- Herramientas de seleccionar, conectar, borrar, mover, girar, zoom, pan y restablecer.

### Interacción requerida

1. **Arrastrar** un componente desde la biblioteca y **soltarlo** en el lienzo con cuadrícula y ajuste opcional (`snap-to-grid`).
2. Seleccionar un objeto y ver su **inspector contextual** en el sidebar: nombre, identificador, valor, unidades, estado, potencia máxima, orientación, propiedades editables.
3. Mostrar puntos/puertos **terminales**. Clicar/arrastrar desde un terminal a otro para crear un conductor; las uniones deben ser comprensibles y editables.
4. Mover o girar componentes sin perder conexiones ni cambiar la topología eléctrica accidentalmente.
5. Selección múltiple si es factible; **deshacer/rehacer** al menos para agregar, borrar, editar y conectar.
6. Guardar presets: una fuente con resistor, dos resistores en serie, dos en paralelo, circuito mixto, interruptor abierto y circuito con bombilla.
7. Botón **Energizar / Simular** y botón **Detener / Reiniciar**.
8. Mostrar cables/ramas activos y sin corriente, con leyenda. La animación de puntos o flujo debe ser **simbólica**, sincronizada con la corriente calculada, y no representar literalmente la velocidad de electrones.
9. Al pulsar un componente, ver **voltaje en sus terminales, corriente, potencia, condición y dirección de corriente convencional**.
10. Panel global: voltaje de la fuente, corriente total, potencia suministrada, potencia disipada, número de nodos, advertencias de circuito.
11. Indicar visualmente si una bombilla se enciende/apaga en función del resultado físico y de un modelo definido; no depender solo de una animación aleatoria.
12. Detectar e informar **circuito abierto, nodo flotante, cortocircuito, elementos sin conexión o fuentes incompatibles**. No calcular un valor ficticio cuando la topología sea inválida.
13. Si se introduce “fallo”, especificar **mecanismo**: por ejemplo, potencia nominal excedida por un intervalo o fusible disparado por una corriente umbral. El fallo debe ser determinista y reproducible; no simular daño real no modelado.
14. Mostrar gráficas relevantes (`V-I`, potencia por componente, valores en el tiempo para RC). Datos vinculados a las mediciones.
15. Adaptar vista para teclado y móvil: creación por toque/selección como alternativa al drag & drop.

### Requisito de ingeniería CRÍTICO: topología eléctrica real

El `CircuitSolver.ts` actual está basado en un **árbol serie/paralelo**; esto es adecuado para su editor lógico, pero **NO basta para soportar libremente un circuito arbitrario dibujado con cables**.

Implementar para el laboratorio un modelo explícito de circuito:

- `Component` (id, tipo, parámetros, terminales, posición, orientación).
- `Terminal` / `Port` (id y referencia al componente).
- `Wire` / `Connection` (terminales o nodos unidos).
- `Netlist` (nodos eléctricos normalizados, resistores, fuentes y otros componentes soportados).
- `SimulationResult` (voltajes por nodo, corrientes por componente, potencias, errores, estado).

La **geometría visual** (posición en píxeles) es distinta de la **conectividad eléctrica** (nodos/terminales). Si dos cables se cruzan visualmente no se conectan a menos que exista una unión explícita, según convención de la app.

Para circuitos DC con resistencias y fuentes, utilizar **análisis nodal modificado (MNA)** u otro solucionador correctamente justificado y probado. Debe admitir topologías serie, paralelo y mixtas construidas mediante conexiones, no solamente árboles predefinidos.

Definir el alcance inicial con precisión:

- **Fase inicial viable:** una o varias fuentes DC ideales compatibles, resistencias, interruptores ideales con tratamiento cuidadoso, bombillas equivalentes a resistencias, instrumentos ideales o con modelo declarado.
- **Siguiente fase:** circuitos RC transitorios y más componentes, solo tras implementar el estado temporal y el solver correspondiente.
- Tratar casos degenerados (redes flotantes, cortos de fuente, matrices singulares, resistencia cero, instrumentos mal conectados) con mensajes concretos.
- No prometer simulación SPICE completa si no la implementas.

### Ejemplo de aceptación: circuito mixto

El usuario crea visualmente:

```text
              ┌────[ R2 = 20 Ω ]────┐
[ +12 V ]──[ R1 = 10 Ω ]             ├── retorno a fuente
              └────[ R3 = 20 Ω ]────┘
```

Este es un circuito con `R1` en serie con el paralelo `R2 || R3` (los segmentos dibujados deben conectar terminales correctamente).

**Resultados analíticos esperados:**

- `R2 || R3 = 10 Ω`.
- `Req = 20 Ω`.
- Corriente total `I = 12 V / 20 Ω = 0.6 A`.
- En R1: `V1 = 6 V`, `I1 = 0.6 A`, `P1 = 3.6 W`.
- En R2 y R3: `V2 = V3 = 6 V`, `I2 = I3 = 0.3 A`, `P2 = P3 = 1.8 W`.
- `Pfuente = 7.2 W` y `Σ Presistencias = 7.2 W`.

Al **abrir un interruptor en una de las ramas**, esa rama debe mostrar **corriente cero** y las magnitudes del resto deben recalcularse, con las convenciones apropiadas. Comprobar además casos completamente abiertos, resistores desconectados y cortocircuitos.

### Gráfica y representación de circuito

La escena no necesita 3D realista por obligación: una vista **esquemática 2D precisa, limpia y manipulable** es más útil para cableado. Puede existir un **modo visual 3D de mesa** para el laboratorio con cables y componentes estilizados, si se puede mantener coherencia con el netlist y rendimiento. Primero la exactitud, luego el atractivo visual.

---

# 7. UNIDAD U4 — MAGNETISMO Y FUERZA DE LORENTZ

## 7.1 Modo Simulador (mejorar existente)

- Conservar conductor rectilíneo, dipolo aproximado y fuerza de Lorentz.
- Mejorar líneas/vector de `B`, orientación de campo, indicadores del sentido de corriente, regla de la mano derecha y escala/leyenda.
- Mostrar valores de `B`, `F`, `v`, trayectoria y unidades de forma inspeccionable, no solo una animación 3D.
- Añadir un panel de parámetros reproducibles: carga, masa, posición, velocidad inicial, magnitudes/direcciones de `E` y `B`, integración, pausa, paso y reset.
- Separar el campo del alambre/dipolo del campo uniforme externo; explicar qué representa cada uno.
- Sustituir o mejorar el integrador para que conserve aproximadamente rapidez en campo puramente magnético dentro de una tolerancia comprobada.
- Manejar singularidades y pérdida de WebGL; ofrecer una visualización 2D apropiada.

## 7.2 Modo Laboratorio (nuevo)

Un **laboratorio electromagnético** en el que pueda:

1. Colocar un conductor rectilíneo virtual y manipular su corriente y orientación.
2. Colocar un dipolo magnético idealizado y modificar momento y dirección.
3. Arrastrar una sonda de campo `B` a distintas posiciones y leer componentes/magnitud.
4. Configurar una región de campo uniforme `E/B` y lanzar una partícula desde un punto elegido con `q`, `m` y `v0`.
5. Ver trayectoria, vector velocidad, fuerza instantánea y condiciones de referencia.
6. Crear presets: hilo con corriente, campo uniforme con carga positiva/negativa, movimiento circular o helicoidal cuando las condiciones y el modelo lo permitan.
7. Comparar escenarios y mostrar cuándo una trayectoria es física, cuándo se ha idealizado y qué límites tiene.

No simular polos magnéticos aislados como fuentes reales. Distinguir gráficas/esquemas de campos calculados y límites del modelo dipolar.

---

# 8. FÍSICA, PRECISIÓN Y VALIDACIÓN

La prioridad de todas las vistas es **visualizar bien lo que realmente se calcula**. La belleza gráfica no justifica datos falsos.

## Modelos físicos a respetar

- U1: `E(r) = k Σ[qᵢ(r−rᵢ)/|r−rᵢ|³]`, `V(r)=k Σ[qᵢ/|r−rᵢ|]`, `F=qE`, `a=F/m`.
- U2: `C=ε₀εr A/d`, `Q=CV`, `U=½CV²`, `E≈V/d` (idealización).
- U3: `V=IR`, `P=VI`, leyes de Kirchhoff, KCL/KVL en el solver de red, `τ=RC` en transitorios.
- U4: `B=μ₀I/(2πr)` para hilo largo ideal, campo de dipolo aproximado, `F=q(E+v×B)`.

## Reglas de exactitud

1. Dominio matemático separado del renderizado; preferiblemente sin dependencias React/Three.
2. Unidades SI internamente; conversiones explícitas solo en límites de UI.
3. No permitir `NaN`, `Infinity` o estados engañosos en las pantallas.
4. Tests analíticos en casos simples y pruebas de conservación donde corresponda.
5. Magnitudes animadas con escala/leyenda. La velocidad de un punto en un cable no es necesariamente la velocidad real de electrones.
6. Degradación gráfica en dispositivos modestos, sin alterar silenciosamente el modelo de cálculo ni los resultados de precisión.
7. Cuando se haga una simplificación (bombilla resistiva, pila ideal, campo ideal, polarización esquemática), mostrarla en una ayuda breve y documentarla.

---

# 9. ARQUITECTURA SUGERIDA (ADAPTAR TRAS INSPECCIONAR)

No mover archivos masivamente por gusto. Propongo un patrón por módulo que separa **domain** (física), **application** (estado y acciones) y **presentation** (modos de UI):

```text
src/
  app/
    App.tsx
    Hub.tsx
  shared/
    domain/              # Unidades, vectores, validadores, constantes
    simulation/          # Reloj, control de pasos, estados, snapshots
    ui/
      LabShell/           # Layout común y selector Simulador/Laboratorio
      Inspector/          # Editor de propiedades contextual
      Charts/             # Gráficas científicas
      CanvasTools/        # Zoom, pan, reset, guías
      Feedback/           # Error, ayuda, advertencias
      design-tokens/      # Variables de estilo
  modules/
    electric/
      domain/
      application/
      presentation/
        SimulatorView.tsx
        LaboratoryView.tsx
    capacitors/
      domain/
      application/
      presentation/
        SimulatorView.tsx
        LaboratoryView.tsx
    current/
      domain/
        # Mantener solver de árbol si continúa siendo útil
        CircuitSolver.ts
        # Nuevo netlist / solver DC para circuito dibujado
        CircuitNetlist.ts
        DCSolver.ts
      application/
      presentation/
        SimulatorView.tsx
        LaboratoryView.tsx
        CircuitCanvas.tsx
        ComponentPalette.tsx
        ComponentInspector.tsx
    magnetism/
      domain/
      application/
      presentation/
        SimulatorView.tsx
        LaboratoryView.tsx
```

**Librerías nuevas:** puedes evaluar `@xyflow/react` u otra alternativa para un editor de nodos y conexiones, o una implementación propia con SVG/Canvas, pero **justifica su elección, accesibilidad, mantenimiento y peso**. React Flow resuelve interacción visual, **no resuelve automáticamente leyes de Kirchhoff ni modelos eléctricos**. Para el circuito, el solver debe existir independientemente del editor.

No actualizar React/Three/Vite a versiones mayores solo para seguir tendencias. Primero verificar compatibilidad y estado de los tests. Mantener compilación estática Vercel.

---

# 10. RENDIMIENTO, RESPONSIVE Y ACCESIBILIDAD

El equipo local reportado es **i3 / 8 GB RAM**. Requisitos:

- Lazy loading por ruta/modo; no montar simultáneamente todas las escenas 3D.
- Limitar cantidad de geometrías, segmentos y partículas; reutilizar materiales; almacenar resultados calculados cuando tenga sentido.
- Usar `requestAnimationFrame` solo para animaciones activas, parar al pausar/ocultar pestaña cuando proceda.
- Evitar re-render de todo React a 60 Hz si basta actualizar geometría/estado derivado con un ritmo controlado.
- Cargas WebGL escalables y fallback 2D; mensajes claros al fallar.
- Cuadrículas, escenas y gráficas utilizables con 1366×768 y viewport móvil.
- Navegación y acciones críticas accesibles sin ratón: selección de componente, creación, edición y conexión por controles alternativos.
- Textos, etiquetas y foco visibles; colores distinguibles y no como única señal.
- No exigir emuladores ni servicios backend para ejecutar una app web estática.

---

# 11. REGLAS DE GIT Y GITHUB — TRABAJAR EN OTRA RAMA

**OBLIGATORIO: implementar todo en una rama independiente, sin trabajar directamente en `main` ni borrar trabajo existente.**

Antes de cualquier modificación, inspecciona:

```powershell
git status -sb
git branch --show-current
git remote -v
git fetch origin --prune
git branch -a
git log -1 --oneline
git diff --stat
```

1. Reporta estado real, rama actual, archivos modificados, remoto, HEAD y diferencias con `origin/main`.
2. **No uses `git reset --hard`, `push --force` ni sobrescribas cambios locales**; si hay cambios sin guardar, detente respecto de cualquier operación destructiva y conserva esos archivos.
3. Si el árbol de trabajo está limpio y `origin/main` es la base correcta, crea una rama con nombre propuesto: `feat/laboratorios-interactivos-ui-v2`. **Verifica antes que ese nombre no exista**; si existe, decide si corresponde continuarla o crear un nombre alternativo y explica cuál.
4. Trabaja por commits pequeños y coherentes. No mezcles cambios grandes de las cuatro unidades en un único commit si pueden separarse.
5. Publica la rama en GitHub **solo cuando el remoto/permiso estén disponibles y los tests del hito lo permitan**. No fusionar a `main` automáticamente.
6. Si es posible, crea un PR de `feat/...` hacia `main` con resumen, evidencia real, pruebas ejecutadas, limitaciones y capturas reales. Nunca inventes capturas, hashes, URLs ni validaciones.
7. Si la rama base cambió durante el desarrollo, revisa el historial y acuerda integración no destructiva. No reescribas el trabajo ajeno.
8. Evita incluir `node_modules`, builds, secretos, credenciales o assets sin licencia.

Ejemplo **solo si se verificó previamente un árbol limpio y se decidió partir de `main`**:

```powershell
git switch main
git pull --ff-only origin main
git switch -c feat/laboratorios-interactivos-ui-v2
```

Después de cada etapa: informar cambios, pruebas, archivos y decisiones. Ningún `git push` o merge debe ser presentado como realizado si el entorno no lo permitió.

---

# 12. PLAN DE IMPLEMENTACIÓN CON PRIORIDADES

**No te quedes en planificación indefinida.** Revisa el repositorio y comienza a implementar en la rama acordada. No declares terminado un módulo solo porque la UI se vea mejor.

### Hito 0 — Estado y línea base

- Confirmar Git y herramientas (`node -v`, `npm -v`).
- `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- Documentar resultados reales, incluso fallos previos al rediseño.
- Corregir bloqueos críticos de configuración/codificación, sin borrar archivos sin diagnóstico.

### Hito 1 — Base visual y dashboard

- Crear tokens de diseño, `LabShell`, componentes de navegación, inspector, ayuda y gráficas reutilizables.
- Rediseñar dashboard completo.
- Añadir selección de modos **Simulador / Laboratorio** en las cuatro rutas con tratamiento honesto de cualquier funcionalidad temporalmente no implementada.
- Corregir estado visual de U3/U4 y documentación del hub.

### Hito 2 — Laboratorio U3 (máxima prioridad)

- Crear biblioteca visual, lienzo interactivo, conectores, cables, propiedades, selección, mover/girar, presets, guardar estado, zoom/pan.
- Implementar netlist y solver DC verificados.
- Sincronizar cálculo con estado visual, inspector y gráficas.
- Modelar circuitos abiertos, cortos, switch y bombilla resistiva; mensajes físicos útiles.
- Probar el circuito mixto analítico descrito en este documento mediante **interacción en la UI** y tests del solver.

### Hito 3 — Renovación del Simulador U3 y reparación del modelo RC

- Refactor de diagramas actuales; métricas por rama/resistor; activar en UI corriente, deriva y resistividad.
- Mejorar gráficas, validaciones y simulación temporal de RC.

### Hito 4 — U1: simulador + laboratorio

- Mejorar contornos, 3D, medidas, snapshot/reinicio y trayectoria.
- Añadir mesa de cargas/sondas y editor contextual con presets.

### Hito 5 — U2: simulador + laboratorio

- Mejorar visualización, gráficas y comparación física.
- Añadir mesa de capacitor, ajuste visual de placas/dieléctrico y alternancia de fuente.

### Hito 6 — U4: simulador + laboratorio

- Mejorar motor temporal, magnitudes, pruebas y escenas.
- Añadir montaje de fuentes/sondas y lanzamiento de partículas.

### Hito 7 — Calidad y cierre

- Probar desktop y móvil, accesibilidad, WebGL/no WebGL y rendimiento razonable.
- Agregar GitHub Actions para lint, typecheck, unit tests y build.
- E2E con Playwright u otra solución comprobada; al menos hub → cada modo y construcción de circuito serie/paralelo/mixto.
- Actualizar README, plan, arquitectura, modelo físico, validación, manual y guía de demostración; añadir evidencia real.
- Documentar limitaciones y tareas no alcanzadas.

Si el trabajo requiere varios turnos/sesiones, deja una bitácora concreta con **implementado, probado, pendiente, bloqueado y siguiente archivo a modificar**, sin declarar trabajo futuro como terminado.

---

# 13. PRUEBAS Y CRITERIOS DE ACEPTACIÓN

Para considerar una etapa terminada:

## A. Dashboard y navegación
- [ ] Se ven las 4 unidades con estado veraz.
- [ ] Existe entrada clara a **Simulador** y **Laboratorio** para cada una.
- [ ] Interfaz usable en escritorio y móvil.
- [ ] Rutas directas y retroceso funcionan; sin error de rutas SPA en Vercel.

## B. Modos de cada unidad
- [ ] La vista previa sigue siendo funcional y ha mejorado visiblemente.
- [ ] El modo Laboratorio permite manipular objetos que afectan cálculos físicos reales.
- [ ] Inspector contextual edita variables del objeto seleccionado.
- [ ] Magnitudes, unidades y gráficas responden correctamente al cambio.
- [ ] Hay estados de pausa/reinicio y errores recuperables.
- [ ] Se prueban casos límite y alternativas sin WebGL donde correspondan.

## C. Laboratorio de circuitos U3
- [ ] Arrastrar/crear fuente, resistencias, bombilla, interruptor y cables.
- [ ] Conectar terminales, mover y editar sin perder netlist.
- [ ] Montar **solo serie**, **solo paralelo** y **mixto** mediante cableado gráfico.
- [ ] Obtener resultados por componente y globales correctos.
- [ ] Distinguir flujo simbólico, ramas activas e inactivas.
- [ ] Al abrir un interruptor, cambian los resultados con lógica física.
- [ ] Detectar circuito abierto, corto y conexiones inválidas.
- [ ] Caso mixto `12 V`, `10 Ω + (20 Ω || 20 Ω)` produce `0.6 A` y `7.2 W` totales.
- [ ] Balance de potencias dentro de tolerancia numérica.

## D. Validación técnica
- [ ] `npm run lint` exitoso o con hallazgos reportados.
- [ ] `npm run typecheck` exitoso o con hallazgos reportados.
- [ ] `npm test` exitoso o con hallazgos reportados.
- [ ] `npm run build` exitoso o con hallazgos reportados.
- [ ] Tests de física y de componentes agregados.
- [ ] Evidencia E2E o registro preciso de limitaciones.
- [ ] Documentación coherente con código.
- [ ] Rama separada con commits y remoto verificados, sin merge automático.

**No marques casillas como cumplidas sin evidencia real.**

---

# 14. FORMATO DE RESPUESTA QUE NECESITO DE CLAUDE

Al comenzar:

1. Resumen del **estado Git verificado**, rama y HEAD.
2. Resultado de los **comandos de línea base** (sin inventar).
3. Arquitectura propuesta **ajustada al código inspeccionado** y librerías adicionales justificadas.
4. Lista priorizada de archivos a modificar con alcance real.
5. **Inicio de implementación** del primer hito, no solo recomendaciones.

En cada entrega posterior:

| Campo | Contenido obligatorio |
|---|---|
| Estado | Hecho / En progreso / Pendiente / Bloqueado |
| Funcionalidad | Qué se puede usar de verdad |
| Archivos | Rutas modificadas/creadas |
| Física | Modelo y simplificaciones |
| Pruebas | Comandos ejecutados + resultados reales |
| Visual | Capturas reales si el entorno permite obtenerlas |
| Git | Rama, commit/push/PR reales si se realizaron |
| Riesgos | Defectos conocidos y límites |
| Próximo paso | Siguiente mejora concreta |

**Si tienes acceso al IDE y al repositorio, realiza los cambios allí.** Si no tienes acceso de escritura, entrega código y cambios concretos listos para aplicar, sin afirmar que ya implementaste nada. Mantén prioridad en U3 Lab, pero el objetivo final incluye **rediseño total del Hub y las cuatro unidades, con sus dos modos**.

---

# 15. MENSAJE FINAL DE EJECUCIÓN

> Claude: toma este archivo como contrato de trabajo. Quiero que mi **Laboratorio Vectorial** pase de una web con gráficos básicos a una herramienta didáctica de experimentación científica que yo pueda enseñar y demostrar. **Mejora lo existente y crea los laboratorios nuevos en paralelo**, con interacción real, diseño visual profesional, simulaciones físicas consistentes, componentes editables y validación. Empieza revisando el repositorio y Git; trabaja en una **rama nueva** independiente, implementa por hitos y deja evidencia verificable. **La prioridad más importante es construir gráficamente circuitos libres serie/paralelo/mixtos con cables, edición por componente y solución eléctrica real**, sin abandonar los demás módulos ni el dashboard.

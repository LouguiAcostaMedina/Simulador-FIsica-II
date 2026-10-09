AGENTS.md — Laboratorio Vectorial

> Instrucciones permanentes para el agente de Antigravity. Este archivo es la referencia inicial del proyecto y debe leerse completo al comenzar cada sesión. Fecha de definición: 2026-10-07. 0. Misión y regla de ejecución
> Construye un simulador interactivo de campos eléctricos y magnéticos en 3D, como aplicación web en español, para Física II e Ingeniería de Sistemas. Debe enseñar mediante controles manipulables, resultados verificables, representaciones 2D/3D y explicación de las leyes físicas. El usuario comienza con una carpeta vacía que contiene este archivo. La primera entrega implementa U1 y U2 completas, y prepara rutas, contratos y navegación para U3 y U4. La hoja de ruta cubre las cuatro unidades y los entregables finales.
> Trabaja de forma autónoma después de inspeccionar el estado real. No termines al crear un esqueleto, un mockup, una lista de tareas o una página bonita sin motor físico. Para cada funcionalidad, completa cálculos, interacción, estados, errores, prueba significativa y documentación. Si surge un error de build o una prueba falla, investígalo y repáralo antes de declarar la tarea terminada. Nunca inventes resultados, capturas, commits, URLs, PR o despliegues. Si una acción depende de credenciales, remoto, material docente faltante o acceso no disponible, termina primero lo independiente y registra el bloqueo exacto.

1. Contexto académico y alcance obligatorio
   La consigna original del producto final exige:
   Software web o de escritorio que visualice en tiempo real campos de distribuciones de carga, líneas equipotenciales y superficies, trayectorias de partículas cargadas, y circuitos con resistencias, capacitores y fuentes.
   Cuatro unidades como módulos y un hub principal desde el cual elegir simuladores.
   Entregables: código fuente en repositorio, manual de usuario, video demostrativo de 5–10 minutos, informe técnico de fundamentos físicos, arquitectura, algoritmos y validación, y presentación para defensa.
   Competencias visibles en el producto: modelamiento matemático, programación científica, arquitectura modular, UX/UI comprensible, visualización 2D/3D, simulación temporal y trabajo en equipo.
   Material académico base cuando se adjunte al workspace: guía de electrostática/campo (capítulo 21: carga, Coulomb, superposición y líneas), guía de capacitancia/dieléctricos (capítulo 24), guía y diapositivas de corriente (capítulo 25). La consigna también pide potencial, aunque el material de U1 recibido se centra en campo. No se proporcionó guía específica de U4: validar posteriormente su alcance con el profesor y documentar los modelos adoptados. Nunca copiar extensamente texto o imágenes del libro.
2. Mapa de producto y prioridades
   Fase Unidad Laboratorios requeridos Estado al terminar la primera entrega
   P0 Hub común Portada, selección de cuatro unidades, ayuda breve, navegación, accesibilidad, estado de disponibilidad. Operativo.
   P1 U1: electricidad, campo y potencial Hasta diez cargas puntuales en 2D/3D; campo, líneas, potencial/equipotenciales; consulta numérica y trayectoria de carga de prueba. Operativo y validado.
   P2 U2: capacitores y dieléctricos Placas paralelas 3D; área, distancia, dieléctrico, voltaje/carga, energía y comparación de escenarios. Operativo y validado.
   P3 U3: corriente y ley de Ohm Corriente/carga/tiempo, densidad y velocidad de deriva, resistividad y resistencia; ley de Ohm, potencia y circuitos resistivos serie/paralelo/mixtos válidos. Operativo y validado.
   P4 U4: fuerza y campo magnético Campo de conductor rectilíneo y aproximación de dipolo; trayectoria bajo E y B; fuerza de Lorentz. Operativo y validado.
   No presentar vistas vacías como laboratorios completos. Las rutas U3/U4 muestran una descripción clara y regreso al hub; la lógica se desarrollará en P3/P4. El alcance de U1/U2 tiene prioridad sobre adornos y exportaciones opcionales.
   P1 — U1: comportamiento detallado
   Crear, seleccionar, arrastrar y editar entre 1 y 10 cargas positivas o negativas; alternativa numérica para uso sin arrastre; eliminar y restaurar.
   Presets de una carga, dipolo y cuadrupolo; control de escala y restablecimiento sin perder la navegación.
   Vista de campo 2D con vectores y líneas integradas; mapa de potencial con curvas equipotenciales. Vista 3D con cargas, flechas/líneas y superficies de potencial acotadas. Si una superficie 3D completa excede el presupuesto de rendimiento, reducir resolución de forma visible y documentada, manteniendo una implementación real.
   Consultar un punto con coordenadas y mostrar `E_x`, `E_y`, `E_z`, `|E|` en N/C y `V` en V. Indicar dirección del vector, signos y origen del resultado.
   Simular una carga de prueba con `q`, `m`, posición y velocidad inicial; controles reproducir, pausar, paso, reiniciar y velocidad de reproducción. Diferenciar paso físico de velocidad de la animación. Evitar que una trayectoria cruce una singularidad sin detenerse o avisar.
   Explicar límites: cargas puntuales ideales, singularidad en la posición de una carga, campo estático, ausencia de colisiones y pérdidas, escala visual ilustrativa.
   P2 — U2: comportamiento detallado
   Manipular `A`, `d`, `ε_r` y fuente o carga inicial; seleccionar batería conectada: V fijo o desconectada: Q fijo. Mostrar en todo momento qué variable queda fija y cuál cambia.
   Mostrar placas 3D con distancia y material perceptibles, campo idealizado entre placas y polarización esquemática; permitir rotación de cámara sin impedir lectura de valores.
   Calcular `C`, `Q`, `V`, `E`, `U`. Comparar escenario original/con dieléctrico con diferencias absolutas y porcentuales cuando tengan sentido. Graficar `C(d)` y `U(V)` o gráficas equivalentes contextualizadas según el modo.
   Explicar que el campo `E≈V/d` y `C=ε₀ε_r A/d` suponen placas paralelas ideales y sin efectos de borde.
   No incluir carga/descarga RC temporal en U2 como si fuera solo capacitor: se puede añadir cuando U3 aporte resistencia y circuito, con documentación de la dependencia.
   P3/P4 — diseño anticipado
   U3: `I=ΔQ/Δt`, `J=I/A`, `v_d=I/(n|q|A)`, `R=ρL/A`, `V=IR`, `P=VI`, serie `R_eq=ΣR_i`, paralelo `1/R_eq=Σ1/R_i`. Circuitos mixtos se limitan a redes serie-paralelo construidas con un árbol de componentes; no aceptar arbitrariamente cualquier grafo sin solver. Aclarar sentido de corriente convencional frente a deriva de electrones y el carácter esquemático de animaciones.
   U4: conductor rectilíneo largo ideal `B=μ₀I/(2πr)` fuera del eje; dipolo magnético como aproximación identificada; `F=q(E+v×B)`. Verificar trayectoria en campo uniforme con integrador adecuado (por ejemplo Boris) y conservación aproximada de rapidez si `E=0`. Nunca dibujar polos magnéticos aislados como fuente real ni atribuir una aproximación a un imán exacto.
3. Física, unidades y resultados verificables
   El dominio calcula exclusivamente en SI. La UI acepta y muestra unidades convenientes: carga `C/mC/μC/nC`, distancia `m/cm/mm`, área `m²/cm²`, capacitancia `F/μF/nF/pF`, campo `N/C` o `V/m`, voltaje `V/mV`, energía `J/mJ/μJ`; escoger rangos didácticos explícitos. Conversión en el límite de entrada/salida, nunca repartida en componentes gráficos.
   Constantes, redondeo, formatos, vectores y límites se centralizan. No igualar la escala de render a escala física: flechas y partículas pueden ampliarse por visibilidad con leyenda.
   U1: `k=1/(4πε₀)`; `E(r)=k Σ[q_i(r-r_i)/|r-r_i|³]`; `V(r)=k Σ[q_i/|r-r_i|]`; `F=q_t E`; `a=F/m`. Validar campo y potencial por separado; cerca de singularidades devolver error de dominio concreto, no `NaN`, `Infinity` ni un valor falso por truncamiento silencioso.
   U2: `C=ε₀ ε_r A/d`, `Q=CV`, `U=½CV²=Q²/(2C)`, `E≈V/d`. Al insertar dieléctrico con V fijo, C/Q/U crecen; con Q fijo, C crece y V/E/U disminuyen. Documentar energía intercambiada con la batería si se explica el proceso, sin confundirla con energía final del capacitor.
   Pruebas analíticas mínimas: una carga a distancia r; dipolo simétrico con potencial nulo en el plano medio; invertir signo de carga de prueba invierte aceleración; duplicar A duplica C; duplicar d reduce C a la mitad; verificar ambos modos de dieléctrico; convertir `1 μC = 10⁻⁶ C` y `1 mm = 10⁻³ m`. Comparar salida numérica y tolerancias.
   Entradas: números finitos, masa/área/separación positivas, `ε_r≥1` en materiales ordinarios, hasta diez cargas, pasos/duración y malla acotados. Los límites de UI son didácticos, no leyes universales. Un valor inválido no debe borrar parámetros válidos ni romper escena.
4. Stack y arquitectura
   React + TypeScript + Vite, compilación estática para Vercel. Three.js y `@react-three/fiber` en rutas 3D; SVG/Canvas 2D para mapas, contornos y gráficas; CSS propio y componentes reutilizables. Fijar versiones compatibles verificadas de React/R3F en `package-lock.json` o lockfile equivalente.
   Vitest para dominio, conversión y simulación; Testing Library para formularios/estados; Playwright para recorridos críticos de escritorio y móvil; ESLint/TypeScript y GitHub Actions para `lint`, `typecheck`, `test`, `build`.
   Sin backend, autenticación, base de datos, API de IA ni proceso Python permanente en P0–P2. NumPy/SciPy pueden servir como comprobación externa opcional, pero el simulador publicado debe calcular con su motor TypeScript. No instalar bibliotecas solo porque aparezcan en la consigna como sugerencia.
   Clean Architecture pragmática: domain sin React ni Three, application con casos de uso/estado, presentation con vistas y adaptadores. Dependencias de UI hacia aplicación y dominio; nunca importar UI en dominio. Compartir unidades, vectores y reloj; mantener las leyes de cada unidad en su módulo.

```text
src/
  app/                     # rutas, shell, hub y carga diferida
  shared/
    domain/                # SI, conversiones, constantes, vectores, errores
    simulation/            # reloj, pasos, pausa y presupuestos de cálculo
    ui/                    # controles, paneles, modal, fórmulas y gráficos
  modules/
    electric/{domain,application,presentation}/
    capacitors/{domain,application,presentation}/
    current/              # contrato/ruta P3, sin simulación ficticia
    magnetism/            # contrato/ruta P4, sin simulación ficticia
docs/
  plan.md
  arquitectura.md
  modelo-fisico.md
  validacion.md
  manual-usuario.md
  guia-video.md
  diseno-ui.md
  decisiones/ADR-001-stack.md
```

Usar imports claros y casos de uso nombrados por acción (`evaluateField`, `traceParticle`, `evaluateCapacitor`). El estado de simulación sigue `sin configurar → listo → ejecutando ↔ pausado → terminado`; cualquier estado puede emitir un error recuperable con acción concreta. Una misma configuración produce los mismos resultados dentro de tolerancia. 5. Diseño visual y UX/UI exigidos
Dirección: «cuaderno experimental contemporáneo». La interfaz debe sentirse diseñada por alguien que entiende las magnitudes: retícula, escalas, anotaciones útiles, ecuaciones, símbolos `+q`, `−q`, `E`, `V`, `C`, y transiciones con propósito. Evitar plantilla de dashboard, iconos genéricos repetidos, tarjetas idénticas, gradients intensos, brillos excesivos y efectos que oculten los datos.
Tokens iniciales: tinta `#111A20`, superficie `#1C2930`, marfil `#F4F0E8`, campo turquesa `#42D7C8`, carga positiva cobre `#F5A66A`, potencial lila `#B69BE8`, error `#F27C77`. Ajustar contraste de texto y semántica; no depender solo del color. Tipografía editorial en títulos y sans legible en controles; no cargar muchas familias ni pesos. Dibujar símbolos y microilustraciones físicas propios mediante SVG/canvas/CSS.
Antes de cerrar diseño, producir en `docs/diseno-ui.md` dos conceptos del hub, una pantalla de U1, justificación de la variante elegida, estados de móvil, vacío/error/pausa y revisión visual con capturas reales. Figma puede usarse para bocetos si hay acceso, pero el proyecto debe poder avanzar con especificaciones y prototipos locales sin bloquearse por una cuenta externa.
Estructura de laboratorio: controles a un lado en escritorio; lienzo principal; resultados, fórmula y «qué cambió» al otro lado. En móvil usar paneles o bandejas que no tapen el lienzo. Entradas numéricas sincronizadas con sliders, presets, reset, leyendas, etiquetas accesibles, foco visible, controles por teclado, áreas táctiles adecuadas y respeto de `prefers-reduced-motion`.
Error junto al campo mientras se edita. Modal accesible solo al pulsar Simular con varios errores o ante un problema bloqueante; enfocar el resumen y ofrecer corrección concreta. Ejemplo: «La separación debe ser mayor que 0 mm. Introduce una distancia entre las placas». Si WebGL no funciona, cambiar a una vista 2D real sin perder datos. 6. Rendimiento y compatibilidad
El usuario puede trabajar en un equipo modesto; medir en portátil y viewport móvil. Cargar escenas 3D solo al entrar al módulo. Reutilizar geometrías/materiales, limitar líneas, semillas, muestras y resolución de superficies; diferenciar frecuencia física y frecuencia de render; detener `requestAnimationFrame` en pausa y pestaña oculta; degradar calidad con aviso si el dispositivo lo requiere. Evitar enviar librerías de documentación, MCP o diagramas al bundle de producción. Registrar tamaño de bundles y limitaciones medidas; no prometer un FPS sin medirlo. 7. Git: ramas, commits y revisiones
Inicializa Git si la carpeta está vacía. Inspecciona rama y cambios antes de operar. Trabaja desde `main` actualizado, en una rama pequeña por funcionalidad, con PR e integración secuencial. Nunca hacer `git reset --hard`, force push ni reemplazar cambios ajenos para resolver problemas. Si no existe remoto, completa el trabajo y commits locales; informa qué falta para crear/vincular GitHub. Si el remoto ya está configurado y el usuario autorizó publicarlo, usa el destino existente y verifica el resultado. No inventar cuentas.
Orden Rama Resultado y commits orientativos
0 `chore/base-laboratorio` Vite, arquitectura, rutas, CI y docs. `chore: preparar proyecto y controles de calidad`; `docs: definir arquitectura y alcance físico`.
1 `feat/hub-navegacion` Hub responsive. `feat(hub): crear selector de unidades y navegación`.
2 `feat/u1-campo-potencial` Dominio y vistas 2D/3D. `feat(u1): calcular campo y potencial por superposición`; `feat(u1): visualizar campo y equipotenciales`.
3 `feat/u1-trayectorias` Trayectoria, estados y seguridad numérica. `feat(u1): simular carga de prueba con pausa y reinicio`.
4 `feat/u2-capacitores` Motor y vistas de capacitor. `feat(u2): calcular capacitor con voltaje o carga fija`; `feat(u2): comparar dieléctricos y representar placas`.
5 `docs/entrega-u1-u2` Manual, pruebas, validación y video. `docs: registrar validación y manual de U1 y U2`.
6 `feat/u3-corriente`, luego ramas menores P3 de corriente, Ohm y circuitos.
7 `feat/u4-magnetismo`, luego ramas menores P4 de campo y trayectorias.
Un commit debe representar una unidad lógica de trabajo que compila. Mensaje en imperativo y descripción en cuerpo cuando la física, alcance o hipótesis necesiten explicación. Antes de PR: `lint`, `typecheck`, `test`, `build`, revisión de fórmulas, revisión visual y prueba móvil. PR: objetivo, cambios, pruebas realmente ejecutadas, capturas reales, hipótesis y riesgos, preview si existe. No hacer merge con checks fallidos. Registrar la SHA y estado final de cada rama. 8. Documentación como parte del producto
`README.md`: instalación, requisitos, comandos, rutas, preview/despliegue y estado verdadero de U1–U4.
`docs/plan.md`: alcance, backlog ordenado, dependencias y criterios de aceptación.
`docs/arquitectura.md`: diagrama y flujo del cálculo desde entrada hasta visualización; actualizarlo tras cada cambio estructural.
`docs/modelo-fisico.md`: fórmulas, unidades, constantes, supuestos, referencias y limitaciones por unidad.
`docs/validacion.md`: caso, entradas, resultado analítico esperado, resultado obtenido, tolerancia, comando/captura y fecha.
`docs/manual-usuario.md`: guía sencilla de hub, U1/U2, controles, unidades, ejemplos y solución de errores.
`docs/diseno-ui.md`: propuestas, decisiones, tokens, responsive y accesibilidad.
`docs/guia-video.md`: secuencia de demostración de 5–10 min para entrega final; en P2 cubrir lo disponible y señalar qué falta.
`docs/decisiones/ADR-001-stack.md`: por qué se eligió web estática, motor TypeScript, 2D/3D y alternativas descartadas.
Tras P4 preparar informe técnico final, video real y presentación de defensa. Mantener una sección `Estado y pendientes` en `README.md`; no marcar una unidad terminada sin su evidencia. 9. Herramientas opcionales y límites
`DeusData/codebase-memory-mcp` indexa código y permite explorar su grafo; su captura 3D no es una plantilla del simulador físico. Úsalo solo como apoyo local si está disponible y el repositorio crece; revisa su configuración/instalador. No es dependencia del sitio.
`tt-a1i/archify` puede generar diagramas HTML verificables de arquitectura, flujo y estados para documentación/defensa. Diagramar código existente con evidencia real; Mermaid sirve inicialmente. No es diseñador automático de UX.
Figma sirve para diseño visual si existe acceso. Ninguna herramienta opcional debe bloquear la entrega de U1/U2. 10. Definición de terminado y reporte del agente
P2 se considera terminado solo si: el hub y ambas unidades se pueden usar en escritorio/móvil; U1/U2 producen resultados correctos con unidades; las vistas 2D/3D y estados funcionan; entradas erróneas tienen mensajes útiles; los casos analíticos, lint, typecheck, tests y build pasan; existe respaldo 2D si WebGL falla; la documentación refleja lo construido; se registran capturas reales y commits reales. U3/U4 siguen indicadas como próximas y sus contratos no rompen el build.
Al terminar cada hito informa: funcionalidad entregada, archivos importantes, fórmula y caso comprobado, comandos con resultado real, captura/previsualización si aplica, rama/commit/PR reales y siguiente hito. No uses frases «completado» o «probado» sin esa evidencia. Si un hito falla, explica qué falla, corrige y vuelve a probar. Al final entrega una matriz `Requisito | Estado | Evidencia | Pendiente` y las limitaciones conocidas. La prioridad es un producto utilizable, físicamente consistente y defendible.

## Git y trazabilidad

Repositorio:
https://github.com/LouguiAcostaMedina/Simulador-FIsica-II.git

Ramas:

main -> estable
develop -> integración
feature/* -> funcionalidades
fix/* -> errores
test/* -> pruebas
refactor/* -> refactorización
docs/* -> documentación

Regla:

Nunca desarrollar directamente en main.
Se debe utilizar la convención Conventional Commits (feat, fix, chore, docs, test, refactor, style, perf).

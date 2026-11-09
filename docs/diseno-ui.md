# Sistema de Diseño UI/UX — Laboratorio Vectorial

**Concepto**: *"Cuaderno experimental contemporáneo"*  
**Versión**: 2.0 (Laboratorios Interactivos)  
**Objetivo visual**: Una estética que evoca la libreta de laboratorio de un físico moderno e ingeniero de sistemas: fondos oscuros de bajo deslumbramiento, retículas vectoriales de precisión, tipografía sobria con alta legibilidad en fórmulas y números, y colores semánticos con significado físico directo.

---

## 1. Tokens de Diseño y Paleta de Colores

Todos los tokens están definidos como variables CSS estándar en `src/shared/ui/design-tokens/tokens.css` y consumidos en toda la aplicación.

```css
:root {
  /* Fondos y Superficies */
  --color-bg-ink: #111a20;        /* Tinta base del lienzo */
  --color-surface-base: #1c2930;  /* Superficie de paneles y cards */
  --color-surface-raised: #24333c;/* Paneles elevados, barras y toolbars */
  --color-border-subtle: #2e3f4b; /* Bordes de paneles y separadores */
  --color-border-hover: #425866;  /* Borde interactivo al pasar el cursor */

  /* Textos y Contrastes */
  --color-text-ivory: #f4f0e8;    /* Texto principal marfil de alta legibilidad */
  --color-text-muted: #a2b2bd;    /* Texto secundario y etiquetas */
  --color-text-dim: #6c7f8c;      /* Unidades y leyendas sutiles */

  /* Semántica Física */
  --color-electric-turquoise: #42d7c8; /* Campo eléctrico (E) y flujo */
  --color-positive-copper: #f5a66a;    /* Carga positiva (+q) y bornes positivos */
  --color-negative-blue: #5b9bd5;      /* Carga negativa (-q) y bornes negativos */
  --color-potential-lilac: #b69be8;    /* Potencial eléctrico escalar (V) e isolíneas */
  --color-magnetic-green: #68d391;     /* Campo magnético (B) y solenoides */

  /* Estados y Alertas */
  --color-status-success: #48c78e;     /* Circuito energizado, validación exitosa */
  --color-status-warning: #f5c451;     /* Nodos flotantes, advertencia no crítica */
  --color-status-danger: #f27c77;      /* Cortocircuito, ruptura de fusible, singularidad */
}
```

---

## 2. Tipografía y Jerarquía Numérica

- **Fuentes de Interfaz**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `sans-serif`. Se priorizan pesos `400` (cuerpo), `500` (etiquetas e inputs) y `600` (títulos y métricas).
- **Fuentes Numéricas y Monospacio**: `ui-monospace`, `"JetBrains Mono"`, `"Consolas"`, `monospace`. Empleada en:
  - Valores de componentes ($12.00\text{ V}$, $10.0\ \Omega$).
  - Tablas de resultados y lecturas de sondas.
  - Inspector contextual para evitar saltos de ancho durante la edición en tiempo real.

---

## 3. Arquitectura de Componentes de Interfaz

### 3.1 Shell Unificado (`LabShell`)
El contenedor maestro de los laboratorios organiza el espacio en una cuadrícula ergonómica de tres columnas más panel inferior:
- **Cabecera Persistente**: Título del laboratorio, migas de pan (*breadcrumbs*), botón de retorno al Hub y **Selector Dual de Modo**:
  - `[Simulador]`: Vista orientada a gráficas analíticas globales y render 3D.
  - `[Laboratorio]`: Mesa interactiva de trabajo con paleta, lienzo y sondas.
- **Columna Izquierda (Biblioteca de Componentes)**:
  - Ancho fijo de $220\text{ px}$.
  - Tarjetas de componentes arrastrables con icono vectorial, etiqueta y tecla de acceso rápido.
- **Lienzo Central (Área de Trabajo)**:
  - Grilla magnética de fondo con espaciado de $20\text{ px}$.
  - Soporte de arrastre (*drag & drop*) y selección de elementos.
  - Indicación visual clara de terminales de conexión con radio de captura magnética ($12\text{ px}$).
- **Columna Derecha (Inspector Contextual)**:
  - Ancho de $280\text{ px}$.
  - Muestra las propiedades del elemento seleccionado (resistencia, tensión, capacitancia, coordenadas).
  - Incluye slider sincronizado con input numérico, botón de rotación ($90^\circ$, tecla `R`) y botón de eliminación.
- **Panel Inferior (Métricas y Gráficas)**:
  - Barra colapsable que exhibe magnitudes globales ($R_{eq}$, potencia de entrada vs salida, energía total almacenada).

### 3.2 Gráficas Científicas Vectoriales (`ScientificChart`)
- Construido con **SVG nativo responsivo**, eliminando librerías externas de gráficos pesadas (Chart.js, Recharts, Plotly) para proteger el presupuesto de memoria de la máquina (Intel i3 / 8 GB RAM).
- Soporte multiserie con código de colores según magnitud física (ej. Tensión en lila, Corriente en turquesa).
- Cursor interactivo de cruce (*crosshair*) en hover con cálculo continuo del punto más cercano e indicación de unidades en tooltip flotante.

---

## 4. Adaptabilidad y Accesibilidad (A11y)

### 4.1 Responsive Design (Pantallas de $1366\times 768$ y Móviles)
- En pantallas de portátil estándar ($1366\times 768$), los paneles laterales se contraen a $180\text{ px}$ y $240\text{ px}$ para otorgar al menos $800\text{ px}$ de espacio libre de trabajo al lienzo.
- En dispositivos móviles o tablets con ancho $< 768\text{ px}$:
  - La biblioteca y el inspector se transforman en bandejas inferiores colapsables tipo *drawer*.
  - Las acciones de arrastre cuentan con una alternativa de un solo toque: pulsar un componente en la biblioteca lo añade automáticamente en el centro de la rejilla.

### 4.2 Accesibilidad y Reducción de Movimiento
- **Foco por Teclado**: Los elementos interactivos (botones, terminales, presets) tienen estilos explícitos con `outline: 2px solid var(--color-electric-turquoise)`.
- **Preferencia de Movimiento Reducido (`prefers-reduced-motion: reduce`)**:
  - Se desactiva la animación de partículas de corriente en los cables.
  - Se suspenden las oscilaciones de agujas o desvanecimientos intensos, sustituyéndolos por cambios de estado discretos instantáneos.
- **Alternativa 2D ante Fallas de WebGL**:
  - En hardware antiguo o navegadores sin aceleración 3D habilitada, las unidades U1, U2 y U4 conmutan automáticamente a vistas 2D mediante Canvas/SVG sin arrojar excepciones ni perder los parámetros de la simulación.

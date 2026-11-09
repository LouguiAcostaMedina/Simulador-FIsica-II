# Bitácora de Desarrollo — Laboratorio Vectorial (V2)

## Hito 0 — Estado y línea base
- **Fecha:** 9 de noviembre de 2026
- **Rama:** `feat/laboratorios-interactivos-ui-v2` (creada a partir de `origin/main` @ `272bd20`)
- **Herramientas:**
  - Node.js: `v22.16.0`
  - npm: `11.5.2`
  - OS: Windows 11 (PowerShell)
- **Resultados de línea base:**
  - `npm ci`: Completado con éxito (361 paquetes, 0 errores).
  - `npm run lint`: Detectó 5 problemas (4 errores y 1 warning) en `Electric2DView.tsx` y `Magnetism3DView.tsx`. Reparados limpiamente (`prefer-const`, dependencias de `useEffect` y bloques `catch` vacíos).
  - `npm run typecheck`: Exitoso (0 errores TypeScript).
  - `npm test`: Exitoso (5 suites de prueba, 14 pruebas analíticas aprobadas).
  - `npm run build`: Exitoso (bundle generado en `dist/` en 41.6s).
- **Diagnóstico de archivos especiales:**
  - `.gitignore`: Tenía 99 bytes con caracteres nulos (`\x00`) producidos por la concatenación de líneas en codificación UTF-16LE en PowerShell sobre un archivo UTF-8. Reescrito limpiamente en UTF-8 estándar.
  - `src/modules/electric/presentation/ElectricModule.css`: Archivo anómalo de 6 bytes (`FF FE 0D 00 0A 00`, BOM UTF-16 y salto de línea vacío). Restaurado en UTF-8 con estilos completos.
  - `vite.config.js` y `vite.config.d.ts`: Preservados intactos en el repositorio conforme a la consigna.
- **Estado de Hito 0:** COMPLETADO (APROBADO).

---

## Hito 1 — Base visual, LabShell, Inspector, Gráficas y Hub Rediseñado
- **Estado:** En progreso
- **Objetivos:**
  - Tokens de diseño unificados (`src/shared/ui/design-tokens/`).
  - Layout `LabShell` estándar para las 4 unidades con selector `[Simulador] [Laboratorio]` y soporte 2D/3D.
  - Inspector contextual reutilizable.
  - Gráficas científicas reutilizables con cursor, leyenda y unidades.
  - Rediseño integral del Hub (`/`) con selector interactivo de unidades, estados reales y sin "Próximamente" para U3/U4.

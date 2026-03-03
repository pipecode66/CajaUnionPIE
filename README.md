# Caja Union PIE - Vitrina Empresarial

Aplicacion React + Vite + TypeScript para visualizar empresas y su menu comercial en **una sola pagina**.

## Enfoque actual

- Vista unica de empresas (sin panel admin, sin directorio separado, sin registro separado).
- Selector lateral de empresas + detalle completo en el mismo flujo.
- Menu de productos por empresa con modal de detalle y CTA de WhatsApp.
- Imagenes de productos/banners generadas por IA a partir de nombre + descripcion para mantener coherencia visual.
- Branding Caja Union con logo y favicon en `public/brand/`.

## Estructura principal

- `src/pages/CompaniesShowcasePage.tsx`: experiencia principal de visualizacion.
- `src/data/companies.seed.ts`: seed de empresas y enriquecimiento de imagenes IA.
- `src/context/CompaniesContext.tsx`: estado global y persistencia local.
- `src/components/company/`: cards y modal de producto.

## Ejecutar local

```bash
npm install
npm run dev
```

Build de produccion:

```bash
npm run build
npm run preview
```

## Notas

- El estado local usa `localStorage` con la clave `cajaunion-pie-companies-v2`.
- Logo y favicon activos:
  - `public/brand/logo-cajaunion.png`
  - `public/brand/favicon.png`

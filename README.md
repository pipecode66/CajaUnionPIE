# Caja Union PIE - Plataforma Digital de Conexion y Dinamizacion Comercial

MVP Frontend (React + Vite + TypeScript) para el **Programa de Integracion Empresarial** respaldado por Caja Union.

## Caracteristicas

- Landing institucional-comercial con branding Caja Union.
- Directorio empresarial con busqueda, filtros, ordenamiento y paginacion.
- Perfil de empresa con banner, servicios, marcas, galeria y mini catalogo.
- Modal de detalle de producto + CTA de WhatsApp prellenado.
- Registro/edicion de empresas con carga de imagenes validada (tipo/ext/tamano).
- Persistencia local en `localStorage` + seed data.
- Admin MVP con moderacion, edicion rapida e importacion masiva JSON/CSV.
- Boton de generacion demo para escalar a 150 empresas.

## Estructura principal

- `src/data/companies.seed.ts`: dataset inicial.
- `src/context/CompaniesContext.tsx`: estado global y operaciones CRUD/import.
- `src/pages/`: Home, Directorio, Perfil, Registro, Admin.
- `src/components/`: layout, componentes comunes y negocio.
- `src/utils/`: validaciones, storage y utilidades.

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

- El estado se guarda en localStorage con clave `cajaunion-pie-companies-v1`.
- Para reiniciar datos usa el boton **Restaurar seed inicial** en Admin.
- Logo y favicon estan en `public/brand/`.

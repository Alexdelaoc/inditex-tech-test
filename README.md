# Zara Web Challenge

Catálogo de teléfonos móviles con listado, buscador, detalle de producto y carrito de compra.

Aplicación construida con **Next.js (App Router)** y renderizado en servidor, de forma que las llamadas a la API y la `x-api-key` nunca salen del servidor: el cliente sólo habla con nuestro propio backend-for-frontend.

## Requisitos

- Node.js `>=18.18` (`.nvmrc` incluido)
- pnpm `10`

```bash
corepack enable
```

## Puesta en marcha

```bash
pnpm install
```

Copia `.env.example` a `.env` y rellena las variables `API_BASE_URL` y `API_KEY`. Al no llevar el prefijo `NEXT_PUBLIC_`, sólo son accesibles desde el servidor.

```bash
pnpm dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Scripts

| Script               | Descripción                                                  |
| -------------------- | ------------------------------------------------------------ |
| `pnpm dev`           | Modo desarrollo: assets sin minimizar, HMR y source maps     |
| `pnpm build`         | Modo producción: bundle concatenado, minimizado y optimizado |
| `pnpm start`         | Sirve el build de producción                                 |
| `pnpm lint`          | ESLint (falla ante cualquier warning)                        |
| `pnpm format`        | Prettier en modo escritura                                   |
| `pnpm format:check`  | Prettier en modo verificación                                |
| `pnpm typecheck`     | Comprobación de tipos con TypeScript                         |
| `pnpm test`          | Tests con Jest y React Testing Library                       |
| `pnpm test:coverage` | Tests con informe de cobertura                               |

## Modo desarrollo y modo producción

Ambos modos los cubre el toolchain de Next.js:

- `pnpm dev` sirve los assets sin minimizar, con source maps y recarga en caliente.
- `pnpm build && pnpm start` genera y sirve los assets concatenados, minimizados y con hashes de contenido para el cacheo a largo plazo.

## Estructura

```
src/
├── app/            Rutas del App Router (layouts, páginas y route handlers)
├── components/     Componentes de presentación
├── lib/api/        Cliente de la API, tipos del dominio y errores
├── styles/         Tokens en variables CSS, reset y estilos globales
└── types/          Declaraciones de tipos ambientales
```

## Notas sobre la API

**El listado trae IDs repetidos.** Pidiendo los 20 primeros productos llegan 20 entradas pero sólo 19 ids distintos: Un Xiaomi viene dos veces, ambos con el mismo contenido. Como el detalle se resuelve por `/products/{id}`, dos tarjetas con el mismo id llevarían al mismo sitio, así que `getProducts` se queda con la primera aparición y descarta el resto. 

Eso significa que con `limit=20` se pintan 19 tarjetas. Lo he preferido a pedir de más y recortar hasta cuadrar el número: `limit` es un contrato con el servidor, y si el cliente lo reinterpreta por su cuenta, la paginación romperá a la que haya una segunda página, porque `offset` deja de corresponderse con lo que realmente se ha mostrado. Prefiero enseñar 19 productos correctos a esconder el problema.

La deduplicación está en la capa de datos y no en los componentes, para que el resto de la aplicación pueda dar por hecho que los ids son únicos en lugar de tener que acordarse en cada sitio.

## Stack

- Next.js 15 · React 19 · TypeScript
- Sass (SCSS Modules) con variables CSS como design tokens
- Jest + React Testing Library
- ESLint + Prettier

# Zara Web Challenge

Catálogo de teléfonos móviles: listado con buscador, ficha de producto y carrito de compra.

Está montado sobre Next.js con el App Router y renderizado en servidor. La decisión de fondo es que la clave de la API no llegue nunca al navegador: las páginas piden los datos mientras se renderizan en el servidor y el HTML sale hacia el cliente con los productos ya dentro.

## Puesta en marcha

Hace falta Node 18.18 o superior y pnpm 10. En caso de no tener pnpm instalado, `corepack` viene con Node y se encarga de descargar la versión exacta que fija el `package.json`.

```bash
corepack enable
pnpm install
```

Copia `.env.example` a `.env` y rellena `API_BASE_URL` y `API_KEY`. No llevan el prefijo `NEXT_PUBLIC_` a propósito, dado que sin él, Next se niega a incluirlas en el bundle del cliente y la clave se queda donde tiene que estar, en el servidor.

```bash
pnpm dev
```

La aplicación queda en `http://localhost:3000`.

## Scripts

| Script               | Qué hace                                                                    |
| -------------------- | --------------------------------------------------------------------------- |
| `pnpm dev`           | Modo desarrollo: assets sin minimizar, Hot Module Replacement y source maps |
| `pnpm build`         | Modo producción: bundle concatenado, minimizado y optimizado                |
| `pnpm start`         | Sirve el build de producción                                                |
| `pnpm lint`          | ESLint, configurado para fallar ante cualquier warning                      |
| `pnpm format`        | Prettier en modo escritura                                                  |
| `pnpm format:check`  | Prettier en modo verificación                                               |
| `pnpm typecheck`     | Comprobación de tipos con TypeScript                                        |
| `pnpm test`          | Jest y React Testing Library                                                |
| `pnpm test:coverage` | Lo mismo, con informe de cobertura                                          |

## Modo desarrollo y modo producción

Los dos modos vienen de serie con el toolchain de Next. `pnpm dev` sirve los assets sin minimizar, con source maps y recarga en caliente, que es lo que hace falta para depurar. `pnpm build` seguido de `pnpm start` genera el bundle concatenado, minimizado y con el hash del contenido en el nombre del fichero, que es lo que permite cachearlo a largo plazo sin miedo a servir una versión vieja.

## Cómo está montado

Las páginas son Server Components y piden los datos durante el render en el lado del servidor. El navegador recibe el HTML terminado en lugar de encadenar peticiones al cargar, y las credenciales de la API no salen del servidor en ningún momento.

Todo lo que sabe hablar con el backend está en `lib/api`. Es el único sitio que conoce la URL, el que añade la cabecera `x-api-key` y el que convierte un fallo HTTP en un `ApiError` que arrastra el código de estado, para que quien lo reciba pueda distinguir un producto inexistente de una caída del servicio. Por encima de esa capa nadie sabe que hay una API detrás: se trabaja con tipos del dominio y ya está.

La separación entre `components/` y `modules/` no depende de si algo es un componente o no. En `components/` está la interfaz transversal, la que podrías llevarte a otro proyecto sin arrastrar nada detrás, como el `Header` o el `Icon`. En `modules/` está lo que sabe qué es un producto o qué es un carrito, con sus componentes y su lógica en la misma carpeta. El contexto del carrito irá en `modules/cart` junto a su persistencia en `localStorage`, porque nada de eso es un componente y colgarlo de `components/` sería mentir sobre lo que hay dentro.

Los errores de render se recogen en `app/error.tsx` y las rutas que no existen en `app/not-found.tsx`. El boundary de error muestra un mensaje genérico en lugar del original, y hay un test que lo vigila: si la API contesta con un 401, el texto "Invalid API key" no tiene por qué acabar en la pantalla de nadie.

```
src/
├── app/          Rutas del App Router: layouts, páginas y límites de error
├── components/   Interfaz transversal (Header, Icon)
├── lib/api/      Cliente de la API, tipos del dominio y errores
├── modules/      Código agrupado por dominio (products, cart)
├── styles/       Tokens en variables CSS, reset y estilos globales
└── types/        Declaraciones de tipos ambientales
```

## Despliegue

Cada push a `main` lanza el workflow de GitHub Actions. Instala con el lockfile congelado, pasa lint, tipos y tests, y sólo si todo eso va bien construye y despliega en Vercel. Las variables de entorno las trae del propio proyecto de Vercel con `vercel pull`, así que las credenciales de la API no están duplicadas en los secretos del repositorio.

## Stack

Next.js 15 y React 19 sobre TypeScript en modo estricto. Sass con módulos CSS para el ámbito local y variables CSS como design tokens. Jest y React Testing Library para las pruebas, ESLint y Prettier para el estilo.

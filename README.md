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

Las páginas son Server Components: piden los datos en el servidor y el navegador recibe el HTML terminado, sin que las credenciales de la API salgan de ahí.

`lib/api` es el único sitio que habla con el backend. Pone la cabecera `x-api-key` y convierte los fallos HTTP en un `ApiError` que arrastra el código de estado, para poder distinguir un producto inexistente de una caída del servicio.

El buscador escribe el término en la URL como `?search=` y el servidor devuelve la lista ya filtrada, así que una búsqueda se puede compartir por enlace. Va dentro de un `<form>` real y funciona sin JavaScript, lo que significa que el JavaScript sólo añade el filtrado según escribes. Leer `searchParams` hace que la home pase de prerenderizada a servirse bajo demanda.

En `components/` está la interfaz transversal y en `modules/` lo que conoce el dominio, con sus componentes y su lógica juntos. El criterio no es si algo es un componente, sino si sabe qué es un producto.

`app/error.tsx` y `app/not-found.tsx` recogen los fallos. El de error enseña un mensaje genérico en lugar del original, con un test que lo vigila: un 401 de la API no debería acabar mostrando "Invalid API key" en pantalla.


```
src/
├── app/          Rutas del App Router: layouts, páginas y límites de error
├── components/   Interfaz transversal (Header, Icon)
├── lib/api/      Cliente de la API, tipos del dominio y errores
├── modules/      Código agrupado por dominio (products, cart)
├── styles/       Tokens en variables CSS, reset y estilos globales
└── types/        Declaraciones de tipos ambientales
```

## La barra de carga

El diseño lleva una barra de 1px bajo la cabecera. Sólo aparece cuando la espera pasa de 150ms y se queda un mínimo en pantalla, así que en local casi nunca se ve: sin esos umbrales, una búsqueda que resuelve en 45ms produce un destello que se lee como un fallo de pintado. Para verla, estrangula la red desde las herramientas del navegador.

Es indeterminada, un segmento que barre de izquierda a derecha, porque no tenemos ninguna medida real del progreso. El prototipo presupone una aplicación que se dibuja en el cliente; aquí el HTML llega con los productos dentro, así que la barra se gana el sitio en las navegaciones y no en la primera carga.

## Despliegue

Cada push a `main` lanza el workflow de GitHub Actions. Instala con el lockfile congelado, pasa lint, tipos y tests, y sólo si todo eso va bien construye y despliega en Vercel. Las variables de entorno las trae del propio proyecto de Vercel con `vercel pull`, así que las credenciales de la API no están duplicadas en los secretos del repositorio.

## Stack

Next.js 15 y React 19 sobre TypeScript en modo estricto. Sass con módulos CSS para el ámbito local y variables CSS como design tokens. Jest y React Testing Library para las pruebas, ESLint y Prettier para el estilo.

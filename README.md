# Zara Web Challenge

Catálogo de teléfonos móviles con tres vistas: listado con buscador, ficha de producto y carrito
de compra.

Está construido con Next.js sobre el App Router y renderizado en servidor (SSR). La decisión de fondo es que la clave de la API enviada como cabecera no llegue al navegador y sea accesible para el resto de usuarios. Las páginas piden los datos mientras se renderizan en el servidor y el HTML navega al cliente con los productos ya dentro.

## Requisitos

| Herramienta | Versión                |
| ----------- | ---------------------- |
| Node        | 24 (LTS)               |
| pnpm        | 10 (fijado en el repo) |

Node y pnpm sólo hacen falta para levantar el proyecto con pnpm. Con Docker basta con tener Docker con Compose v2: Node y pnpm corren dentro de la imagen, con las mismas versiones que fija el repositorio.

El archivo PDF de la prueba técnica se pide en el apartado STACK TECNOLÓGICO Node 18, pero el proyecto corre sobre Node 24. Hay dos motivos:

- El primero es que usa Next.js 16, que declara `engines: { node: '>=20.9.0' }`: con Node 18 la instalación avisa y el build falla.
- El segundo es que 24 es la versión LTS vigente y la que ejecuta Vercel en el despliegue, de modo que entorno local, integración continua y producción corren sobre el mismo major.

Node 18, además, dejó de recibir soporte en abril de 2025, por lo que la versión queda fijada en `.nvmrc` y en el campo `engines` del `package.json`, y es la misma con la que se verifica en integración continua.

```bash
node --version
```

Si usas nvm, `nvm use` en la raíz del proyecto coge la versión del `.nvmrc`.

## Puesta en marcha

Hay dos formas de levantar el proyecto. Con pnpm se arranca el servidor de desarrollo, con recarga en caliente, y es la vía para trabajar sobre el código. Con Docker se construye y se sirve la build de producción dentro de un contenedor, sin instalar Node ni pnpm en la máquina. Las dos necesitan antes el fichero de variables de entorno.

### Variables de entorno

Copia el fichero de ejemplo y rellena los dos valores con los datos del enunciado: `API_BASE_URL` es la raíz sobre la que se piden los productos y `API_KEY` es la clave que viaja en la cabecera `x-api-key`.

Podemos, o bien copiar a mano las claves de `.env.example` en un archivo nuevo `.env`, o bien ejecutar este comando por consola (el cual duplicará el archivo .env.example, dándole al nuevo archivo el nombre `.env`):

```bash
cp .env.example .env
```

Tras esto deberemos insertar los valores de las variables si las conocemos.

Ninguna de las dos lleva el prefijo `NEXT_PUBLIC_`, así que Next no las incluirá en el bundle del cliente y la clave se queda donde debe estar. Sin ellas la aplicación arranca, pero cualquier vista que pida datos devolverá un error.

Para la vía Docker el fichero tiene que llamarse exactamente `.env`. Next también carga `.env.local`, pero Docker Compose sólo lee `.env`.

### Con pnpm

**1. pnpm.** La versión exacta está fijada en `package.json`. La vía recomendada es corepack, que
se distribuye con Node:

```bash
corepack enable
```

Si corepack no está disponible o da problemas de permisos, sirve igual instalarlo a mano:

```bash
npm install --global pnpm@10
```

**2. Dependencias.**

```bash
pnpm install
```

**3. Arrancar.**

```bash
pnpm dev
```

La aplicación queda en `http://localhost:3000`.

### Con Docker

```bash
docker compose up --build
```

La aplicación queda en `http://localhost:3000`, igual que con pnpm, y se para con `docker compose down`. Lo que corre en el contenedor es la build de producción, no el servidor de desarrollo, así que no hay recarga en caliente.

El `Dockerfile` construye en tres etapas: la primera instala las dependencias con el lockfile congelado, la segunda ejecuta `next build` y la tercera sólo copia el resultado. Next genera esa salida en modo `standalone` (`output: 'standalone'` en `next.config.ts`), que es un `server.js` acompañado únicamente de los módulos que usa en ejecución. Así la imagen final no lleva ni las dependencias de desarrollo ni el código fuente, y el proceso corre con el usuario `node` de la imagen base en lugar de como root.

La clave de la API hace falta también al construir, no sólo al ejecutar, porque las fichas se prerenderizan en el build con `generateStaticParams` y eso llama a la API. Pasarla como argumento de build (`ARG`) la dejaría grabada en el historial de la imagen, así que se entrega como secreto de BuildKit: se monta en `/run/secrets` sólo durante el paso del build y ninguna capa la conserva. No se monta como `/app/.env` a propósito, porque en modo `standalone` Next copia a la salida los `.env` que haya cargado y la clave acabaría dentro de la imagen. En ejecución, las variables llegan al contenedor desde el mismo `.env` a través de `env_file`.

Si el puerto 3000 está ocupado por otro proceso o contenedor, hay que liberarlo y recrear el contenedor. Reiniciarlo no basta, porque no vuelve a enlazar el puerto:

```bash
docker compose up -d --force-recreate
```

### Arranque en frío de la API

La API está desplegada en un plan gratuito que apaga el servicio cuando lleva un rato sin tráfico. La primera petición después de un tiempo parado puede tardar varios segundos en responder. Esto es intencional, ya que es el arranque en frío del backend. Con Docker se nota ya durante el build, que es el primero en llamar a la API.

## Scripts

| Script               | Qué hace                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| `pnpm dev`           | Modo desarrollo: assets sin minimizar, recarga en caliente y source maps |
| `pnpm build`         | Modo producción: bundle concatenado, minimizado y optimizado             |
| `pnpm start`         | Sirve el build de producción                                             |
| `pnpm lint`          | ESLint, configurado para fallar ante cualquier warning                   |
| `pnpm format`        | Prettier en modo escritura                                               |
| `pnpm format:check`  | Prettier en modo verificación                                            |
| `pnpm typecheck`     | Comprobación de tipos con TypeScript                                     |
| `pnpm test`          | Jest y React Testing Library                                             |
| `pnpm test:coverage` | Lo mismo, con informe de cobertura                                       |

## Modo desarrollo y modo producción

Los dos modos vienen de serie con el toolchain de Next. `pnpm dev` sirve los assets sin minimizar, con source maps y Hot Module Replacement. `pnpm build` seguido de `pnpm start` genera el bundle concatenado, minimizado y con el hash del contenido en el nombre del fichero, permitiendo así cachearlo a largo plazo sin arriesgarse a servir una versión vieja.

## Arquitectura

Las páginas son Server Components y los componentes de cliente son hojas del árbol. El navegador recibe el HTML terminado y sólo se hidrata lo que necesita interactividad: el buscador, el configurador de la ficha, el carrito y el carrusel de productos similares.

`lib/api` es el único punto que habla con el backend. Pone la cabecera `x-api-key`, convierte los fallos HTTP en un `ApiError` que arrastra el código de estado (para poder distinguir un producto inexistente de una caída del servicio) y cachea las respuestas durante una hora.

El buscador escribe el término en la URL como `?search=` y el servidor devuelve la lista ya filtrada, de modo que una búsqueda se puede compartir por enlace. Va dentro de un `<form>` real y funciona sin JavaScript; el JavaScript sólo añade el filtrado según se escribe, con 300 ms de margen (debouncer) para no lanzar una petición por tecla. Bajo la cabecera hay una barra de carga que sólo aparece si la espera pasa de 150 ms, para que una respuesta rápida no produzca un flicker.

Las fichas de producto se prerenderizan en el build con `generateStaticParams` y se revalidan cada hora.

La página arranca la petición y no la aguarda. Entrega de inmediato el documento con la cabecera y el buscador, y deja la cuadrícula dentro de un `<Suspense>`. Cuando la API contesta, el marcado de la cuadrícula viaja por la misma conexión HTTP y React lo coloca en su hueco. En casos como un arranque en frío del servidor el procesado lento de la petición se traduce en una pantalla en blanco o casi en blanco de varios segundos.

El contador de resultados vive dentro del buscador, que es un componente de cliente porque escribe en la URL. Recibe la promesa en lugar del número ya resuelto y la consume con `use`, así que el formulario se pinta y se puede usar antes de que haya resultados que contar.

El carrito vive en un contexto de React (`CartProvider`) montado en el layout y se persiste en `localStorage`. Lo que se lee del almacenamiento se valida campo a campo antes de usarse, así que un valor corrupto o de una versión anterior se descarta en lugar de romper la aplicación. La lectura no usa efectos: `localStorage` es un almacén externo a React y se consume con `useSyncExternalStore`, que es la herramienta que React ofrece para eso. La suscripción escucha además el evento `storage`, de modo que el carrito se mantiene sincronizado entre pestañas.

`app/error.tsx` y `app/not-found.tsx` recogen los fallos. El de error muestra un mensaje genérico en lugar del original, con un test que lo vigila: un 401 de la API no debería acabar enseñando "Invalid API key" en pantalla.

## Estructura

```
src/
├── app/          Rutas del App Router: layouts, páginas y límites de error
├── components/   Interfaz transversal (Header, Icon, Navigation, BackLink)
├── lib/api/      Cliente de la API, tipos del contrato y errores
├── modules/      Código agrupado por dominio (products, cart)
├── styles/       Tokens en variables CSS, breakpoints, reset y estilos globales
└── types/        Declaraciones de tipos ambientales
```

El criterio para separar `components/` de `modules/` no es si algo es un componente, sino si sabe qué es un producto o un carrito. Dentro de cada módulo conviven el componente, sus estilos y sus pruebas.

## Diseño y accesibilidad

Las tres vistas siguen los diseños de Figma y son responsive de móvil a escritorio. La tipografía es la que fija el enunciado, `Helvetica, Arial, sans-serif`. Los colores, espaciados y tiempos de animación están declarados como variables CSS y los estilos se escriben en Sass con módulos, de manera que cada clase queda acotada a su componente.

Los selectores de color y almacenamiento son `input type="radio"` reales agrupados con `role="group"`, así que funcionan con teclado y se anuncian correctamente por el lector de pantalla. El contador del carrito, los botones de borrado y los enlaces con sólo un icono llevan nombre accesible. Las animaciones respetan `prefers-reduced-motion`.

Los @keyframes viven en `styles/_animations.scss` como mixin y lo incluye cada módulo que los necesita. Los módulos CSS acotan también el nombre de las animaciones, así que una definición global queda sin efecto: la referencia dentro del .module.scss se reescribe con el prefijo del módulo y deja de apuntar a ella. El coste es una copia de la regla por módulo; a cambio la animación se escribe en un único sitio.

## Pruebas

93 pruebas con Jest y React Testing Library, escritas contra el comportamiento visible. Cubren el cliente de la API, el buscador, la cuadrícula, la ficha, el carrito y su persistencia.

```bash
pnpm test
```

## Despliegue

Cada push a `main` lanza el workflow de GitHub Actions: instala con el lockfile congelado, pasa lint, tipos y pruebas, y sólo si todo eso va bien construye y despliega en Vercel. Las variables de entorno las trae del propio proyecto de Vercel con `vercel pull`, así que las credenciales no están duplicadas en los secretos del repositorio.

El despliegue no pasa por Docker. Vercel construye con su propio builder, que no lee la opción `output` de Next: la carpeta `standalone` se genera igualmente durante el build, pero no se sube.

## Decisiones/dudas respecto al diseño.

- Cada "añadir al carrito" crea su propia línea. El diseño no contempla selector de cantidad, así
  que dos unidades del mismo modelo se muestran como dos líneas.
- Por lo que se ha podido observar, la API devuelve productos con IDs que no son únicos, esto significa que aparecen productos repetidos.
  Para evitar fallos de hidratación de React se ha optado por combinar IDs con la posición del mapeo (index) como claves identificativas de
  los componentes. Dado que el Figma contemplaba esos productos duplicados en la lista de dispositivos he tomado esta aproximación a la
  problemática por ceñirme al diseño, pero en otra ocasión podría haber "deduplicado" elementos con IDs repetidos a pesar de
  la complicación que conllevaría en cuanto a diseño del componente (pedir de más y recortar, añadir paginación a pesar de esto
  si se pidiera, etcétera).

## Stack

Next.js 16 y React 19 sobre TypeScript en modo estricto. Gestión de estado con Context API. Sass
con módulos CSS y variables CSS como design tokens. Jest y React Testing Library para las pruebas,
ESLint y Prettier para el estilo. Docker y Docker Compose para servir la build de producción en local.

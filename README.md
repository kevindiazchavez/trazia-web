# trazia-web

La página principal de Trazia: qué es la app y el botón de Google Play.

Está hecha con [Astro](https://astro.build) y sale como sitio estático, para
cualquier hosting estático (Netlify, Vercel, Cloudflare Pages…). Las
animaciones usan GSAP + ScrollTrigger y Lenis.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # deja el sitio en dist/
```

Hace falta Node.js 18.20 o más nuevo.

## Dónde está cada cosa

- `src/pages/index.astro`: arma la página con las secciones.
- `src/components/`: una sección por archivo (`Portada`,
  `Encuesta`, `QueHace`, `ComoFunciona`, `Emergencia`, `Final`, `Pie`), más el `Telefono`
  que se repite, el `BotonPlay` y los `Iconos` (Material Icons dibujados en
  `<symbol>`).
- `src/scripts/animations.ts`: **todo** el movimiento. Los componentes solo
  marcan qué se mueve con atributos `data-*`; la lista está al principio del
  archivo.
- `src/styles/global.css`: la paleta y lo compartido.
- `public/marca/`: el logo y la letra.
- `_anterior/index.html`: la versión anterior (HTML y CSS sin JavaScript).
  Se puede borrar cuando la nueva esté publicada.

## Páginas legales

`legales/` tiene las plantillas del backend tal cual (`trazia_back/src/main/resources/paginas/`).
`scripts/legales.mjs` corre antes de `npm run dev` y `npm run build` y las deja en
`public/` como `/privacidad.html`, `/terminos.html` y `/eliminar-cuenta.html`: rellena
el contacto, ajusta los enlaces y apunta el formulario de borrado al `BACKEND`.
Para cambiar un texto legal, cambialo en el backend y volvé a copiar el archivo a `legales/`.

El backend tiene que permitir el sitio en CORS (`CORS_ORIGENES=https://traziasv.com,https://www.traziasv.com`),
o el formulario de eliminar cuenta no va a poder llamarlo.

## Qué falta conectar

Todo está en `src/config.ts`:

- **`PLAY_URL`**: el enlace de la app en Google Play. Mientras esté vacío, el
  botón se ve pero no lleva a ningún lado.
- **`CORREO`**: el correo de contacto (sale en el pie y en las páginas legales).
  Confirmá que exista.

## La paleta

La web es clara, como las referencias de diseño: blanco, grises suaves y
botones negros, con el verde de la app de acento. Los verdes y los colores de
los avisos son los de la app (`ui/theme/Color.kt` del frontend Android), en
las variables de `:root` de `src/styles/global.css`: si cambian allá, se
cambian acá. El teléfono muestra la app tal cual, oscura; sus colores están en
`src/components/Telefono.astro`.

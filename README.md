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
  `QueHace`, `ComoFunciona`, `Seguridad`, `Final`, `Pie`), más el `Telefono`
  que se repite, el `BotonPlay` y los `Iconos` (Material Icons dibujados en
  `<symbol>`).
- `src/scripts/animations.ts`: **todo** el movimiento. Los componentes solo
  marcan qué se mueve con atributos `data-*`; la lista está al principio del
  archivo.
- `src/styles/global.css`: la paleta y lo compartido.
- `public/marca/`: el logo y la letra.
- `_anterior/index.html`: la versión anterior (HTML y CSS sin JavaScript).
  Se puede borrar cuando la nueva esté publicada.

## Qué falta conectar

- **URL del backend.** Las páginas legales (`/privacidad`, `/terminos`,
  `/eliminar-cuenta`) las sirve el backend y la web ahora vive en otro
  hosting: pon la URL del backend en `BACKEND`, en `src/config.ts`.
- **Botón de Google Play.** Hoy dice "Muy pronto en Google Play" y no lleva a
  ningún lado (`src/components/BotonPlay.astro`). Cuando la app esté
  publicada, cámbialo por un `<a class="boton" href="https://play.google.com/store/apps/details?id=...">`
  con "Descárgala en".
- **Correo de contacto.** En `src/components/Pie.astro` hay un comentario con
  el párrafo listo; cambia `CORREO` por el correo real.

## La paleta

La web es clara, como las referencias de diseño: blanco, grises suaves y
botones negros, con el verde de la app de acento. Los verdes y los colores de
los avisos son los de la app (`ui/theme/Color.kt` del frontend Android), en
las variables de `:root` de `src/styles/global.css`: si cambian allá, se
cambian acá. El teléfono muestra la app tal cual, oscura; sus colores están en
`src/components/Telefono.astro`.

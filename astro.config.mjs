import { defineConfig } from "astro/config";

// Sitio estático: `npm run build` deja todo en dist/, listo para cualquier hosting estático.
export default defineConfig({
    site: "https://traziasv.com",
    // Las páginas salen como archivos (privacidad.html, eliminar-cuenta.html):
    // son las URLs que se registran en Google Play.
    build: { format: "file" },
    // En local escucha en 127.0.0.1 (IPv4): si no, Astro solo responde por IPv6
    // y algunos navegadores o proxies no abren http://localhost:4321.
    server: { host: "127.0.0.1", port: 4321 },
});

import { defineConfig } from "astro/config";

// Sitio estático: `npm run build` deja todo en dist/, listo para cualquier hosting estático.
export default defineConfig({
    // En local escucha en 127.0.0.1 (IPv4): si no, Astro solo responde por IPv6
    // y algunos navegadores o proxies no abren http://localhost:4321.
    server: { host: "127.0.0.1", port: 4321 },
});

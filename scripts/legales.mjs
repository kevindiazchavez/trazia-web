/*
 * Arma las páginas legales del sitio a partir de las plantillas del backend.
 *
 * legales/*.html son copias tal cual de trazia_back/src/main/resources/paginas/.
 * Para actualizarlas, se vuelven a copiar ahí; este script corre solo antes de
 * `npm run dev` y `npm run build` y deja el resultado en public/ (que no va a git).
 *
 * Lo que cambia respecto de la plantilla, y nada más:
 *   - {{CONTACTO}}: el mismo párrafo que arma el backend (PaginasPublicasController),
 *     con el CORREO de src/config.ts.
 *   - nonce="{{NONCE}}": se quita (acá no hay CSP con nonce).
 *   - Los enlaces /privacidad, /terminos y /eliminar-cuenta pasan a .html, y el
 *     logo lleva a la portada.
 *   - El formulario de eliminar cuenta llama al BACKEND de src/config.ts en vez
 *     de a /api del mismo dominio.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const config = readFileSync(new URL("../src/config.ts", import.meta.url), "utf8");
const leer = (nombre) => {
    const valor = config.match(new RegExp(`export const ${nombre} = "([^"]*)"`))?.[1];
    if (valor === undefined) throw new Error(`No encontré ${nombre} en src/config.ts`);
    return valor;
};
const CORREO = leer("CORREO");
const BACKEND = leer("BACKEND").replace(/\/+$/, "");

// Las frases del backend (PaginasPublicasController.kt), tal cual.
const FRASES = {
    "eliminar-cuenta": "¿No recuerdas tu contraseña o necesitas ayuda? Escríbenos desde el correo de tu cuenta a %s y nosotros la borramos por ti.",
    privacidad: "Si tienes alguna pregunta sobre tus datos, o quieres pedir una copia de lo que guardamos sobre ti, escríbenos a %s.",
    terminos: "Si tienes preguntas sobre estos términos, o crees que borramos algo por error, escríbenos a %s.",
};

const escapar = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const contacto = (frase) => {
    if (!CORREO) return "";
    const c = escapar(CORREO);
    return `<p>${frase.replace("%s", `<a href="mailto:${c}">${c}</a>`)}</p>`;
};

mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
for (const [pagina, frase] of Object.entries(FRASES)) {
    let html = readFileSync(new URL(`../legales/${pagina}.html`, import.meta.url), "utf8");
    if (!html.includes("{{CONTACTO}}")) throw new Error(`legales/${pagina}.html no tiene {{CONTACTO}}`);

    html = html
        .replaceAll(' nonce="{{NONCE}}"', "")
        .replace("{{CONTACTO}}", contacto(frase))
        .replace(/href="\/(privacidad|terminos|eliminar-cuenta)(#[^"]*)?"/g, 'href="/$1.html$2"')
        .replace('<a class="logo" href="/privacidad.html">', '<a class="logo" href="/">');

    if (pagina === "eliminar-cuenta") {
        if (!html.includes("pedir('/api/")) throw new Error("legales/eliminar-cuenta.html cambió: revisar las llamadas a /api");
        html = html.replace("'use strict';", `'use strict';\n        var BACKEND = '${BACKEND}';`).replaceAll("pedir('/api/", "pedir(BACKEND + '/api/");
    }
    if (html.includes("{{")) throw new Error(`legales/${pagina}.html tiene otra marca {{…}} sin rellenar`);

    writeFileSync(new URL(`../public/${pagina}.html`, import.meta.url), html);
}
console.log("Páginas legales listas en public/.");

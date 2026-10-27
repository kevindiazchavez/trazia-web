/* Datos del sitio que se usan en varias páginas. scripts/legales.mjs también lee CORREO y BACKEND de acá. */

export const SITIO = "https://traziasv.com";

/*
 * El backend (Railway), al que llama el formulario de /eliminar-cuenta.html.
 * Es el TRAZIA_BACKEND_URL_RELEASE de la app. El backend tiene que permitir
 * este sitio en CORS_ORIGENES (https://traziasv.com,https://www.traziasv.com).
 */
export const BACKEND = "https://traziaback-production.up.railway.app";

/*
 * El enlace de la app en Google Play. Mientras esté vacío, el botón se ve
 * pero no lleva a ningún lado.
 * TODO: poner la URL cuando la app esté publicada
 * (https://play.google.com/store/apps/details?id=...).
 */
export const PLAY_URL = "";

/*
 * El correo de contacto. Sale en el pie y en las páginas legales; es el mismo
 * que CONTACTO_CORREO en el backend.
 */
export const CORREO = "soporte.trazia@gmail.com";

/* Las páginas legales: las genera scripts/legales.mjs a partir de legales/. */
export const legales = {
    privacidad: "/privacidad.html",
    terminos: "/terminos.html",
    eliminarCuenta: "/eliminar-cuenta.html",
};

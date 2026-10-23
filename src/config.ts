/*
 * Las páginas legales (/privacidad, /terminos, /eliminar-cuenta) las sirve el
 * backend. Ahora que la web vive en otro hosting, los enlaces tienen que
 * llevar la URL completa del backend.
 * TODO: poner la URL real, sin "/" al final (p. ej. "https://api.trazia.app").
 */
export const BACKEND = "";

export const legales = {
    privacidad: `${BACKEND}/privacidad`,
    terminos: `${BACKEND}/terminos`,
    eliminarCuenta: `${BACKEND}/eliminar-cuenta`,
};

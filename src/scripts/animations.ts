/*
 * TODO EL MOVIMIENTO DE LA PÁGINA, en un solo lugar.
 *
 * Los componentes solo marcan qué se mueve con atributos data-*:
 *   data-hero, data-hero-titulo, data-hero-pieza, data-hero-telefono  la entrada de la portada
 *   data-linea, data-bus (data-ruta, data-desde, data-duracion,       las rutas de la portada y los buses que las recorren
 *     data-vuelta)
 *   data-revela, data-revela-grupo="0.15"                             aparecer al entrar en vista (un grupo escalona a sus hijos)
 *   data-paso, data-pasos-telefono                                    los pasos de "Cómo funciona" y el teléfono que cambia con ellos
 *   data-contador                                                     las cifras de la encuesta, que cuentan desde 0
 *   data-telefono (data-tel-ruta, data-tel-bus, data-vista)           la ruta y el bus dentro de cada teléfono, y sus pantallas
 *   data-pulso                                                        las ondas que laten en la llamada del botón de emergencia
 *   data-paralaje, data-mancha, data-barra                            paralaje, degradados del fondo y la barra
 *
 * Reglas: solo se anima transform y opacity (más el trazo de las rutas SVG).
 * Con "reducir movimiento" quedan solo fundidos simples y los buses quietos.
 * En el teléfono (≤ 960 px) no hay paralaje, sticky, manchas ni buses
 * andando: solo fundidos.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const CON_MOVIMIENTO = "(prefers-reduced-motion: no-preference)";
const SIN_MOVIMIENTO = "(prefers-reduced-motion: reduce)";
const ESCRITORIO = "(min-width: 961px)";

const todos = <T extends Element = HTMLElement>(selector: string, dentro: ParentNode = document) =>
    Array.from(dentro.querySelectorAll<T>(selector));
const uno = <T extends Element = HTMLElement>(selector: string) => document.querySelector<T>(selector);

/* ═══ Scroll suave ═══ */
function scrollSuave() {
    const lenis = new Lenis({ anchors: { offset: -90 } });
    lenis.on("scroll", ScrollTrigger.update);
    const latir = (segundos: number) => lenis.raf(segundos * 1000);
    gsap.ticker.add(latir);
    gsap.ticker.lagSmoothing(0);
    return () => {
        gsap.ticker.remove(latir);
        lenis.destroy();
    };
}

/* ═══ Barra: fondo con blur en cuanto se baja un poco ═══ */
function barra() {
    const el = uno("[data-barra]");
    if (!el) return;
    ScrollTrigger.create({ start: 24, end: "max", toggleClass: { targets: el, className: "con-fondo" } });
}

/* Parte el título en una <span class="palabra"> por palabra, sin perder el <em>. */
function partirPalabras(titulo: HTMLElement) {
    const palabras: HTMLElement[] = [];
    const recorrer = (nodo: Node) => {
        for (const hijo of Array.from(nodo.childNodes)) {
            if (hijo.nodeType === Node.ELEMENT_NODE) {
                if (!(hijo as Element).classList.contains("palabra")) recorrer(hijo);
                continue;
            }
            if (hijo.nodeType !== Node.TEXT_NODE) continue;
            const trozo = document.createDocumentFragment();
            for (const parte of (hijo.textContent ?? "").split(/(\s+)/)) {
                if (!parte) continue;
                if (/^\s+$/.test(parte)) {
                    trozo.append(parte);
                    continue;
                }
                const span = document.createElement("span");
                span.className = "palabra";
                span.textContent = parte;
                trozo.append(span);
                palabras.push(span);
            }
            hijo.replaceWith(trozo);
        }
    };
    recorrer(titulo);
    return palabras;
}

/* ═══ 1. Entrada de la portada (~1.2 s) ═══
 * Las rutas se dibujan y los buses aparecen desde el primer momento; a la vez
 * entra el título palabra por palabra → bajada → botones, y el teléfono sube. */
function entradaPortada() {
    const titulo = uno("[data-hero-titulo]");
    const palabras = titulo ? partirPalabras(titulo) : [];
    const piezas = todos("[data-hero-pieza]");
    const telefono = uno("[data-hero-telefono]");
    const lineas = todos<SVGPathElement>("[data-linea]");
    const buses = todos<SVGGElement>("[data-bus]");

    if (titulo) gsap.set(titulo, { autoAlpha: 1 });
    gsap.set(uno(".lineas"), { autoAlpha: 1 });
    gsap.set(lineas, { strokeDasharray: 1, strokeDashoffset: 1 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.5 } });
    tl.to(lineas, { strokeDashoffset: 0, duration: 1.1, ease: "power2.out", stagger: 0.05 }, 0)
        .fromTo(buses, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: 0.04 }, 0.15)
        .fromTo([...palabras, ...piezas], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.06 }, 0)
        .fromTo(telefono, { autoAlpha: 0, y: 80, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9 }, "-=0.35");
}

/* El recorrido de un bus por su ruta: arranca en data-desde y da la vuelta
   completa (o al revés, con data-vuelta). Las rutas empiezan y terminan fuera
   de la portada, así el salto del final al principio no se ve. */
function recorrido(bus: SVGGElement): gsap.TweenVars {
    const ruta = todos<SVGPathElement>("[data-linea]")[Number(bus.dataset.ruta)];
    const desde = Number(bus.dataset.desde) || 0;
    const vuelta = bus.dataset.vuelta !== undefined;
    const hasta = vuelta ? desde - 1 : desde + 1;
    return {
        // El bus gira con la curva y mira hacia donde avanza, también el que va de vuelta.
        motionPath: { path: ruta, align: ruta, alignOrigin: [0.5, 0.5], start: desde, end: hasta, autoRotate: true },
        duration: Number(bus.dataset.duracion) || 20,
        ease: "none",
    };
}

/* ═══ 2. Scroll: aparecer al entrar en vista, una sola vez ═══ */
function revelar(y: number) {
    const desde = { autoAlpha: 0, y };
    const hasta = { autoAlpha: 1, y: 0, duration: y ? 0.8 : 0.6, ease: "power3.out" };

    todos("[data-revela]").forEach((el) => {
        gsap.fromTo(el, desde, { ...hasta, scrollTrigger: { trigger: el, start: "top 80%", once: true } });
    });
    todos("[data-revela-grupo]").forEach((grupo) => {
        gsap.fromTo(grupo.children, desde, {
            ...hasta,
            stagger: Number(grupo.dataset.revelaGrupo) || 0.15,
            scrollTrigger: { trigger: grupo, start: "top 80%", once: true },
        });
    });
    // Los pasos, cada uno al llegar: así salen en orden 01 → 04 mientras se baja.
    todos("[data-paso]").forEach((paso) => {
        const lado = paso.matches(":nth-child(odd)") ? 1 : -1;
        gsap.fromTo(paso, { autoAlpha: 0, y, x: y ? lado * 24 : 0 }, {
            ...hasta,
            x: 0,
            scrollTrigger: { trigger: paso, start: "top 80%", once: true },
        });
    });
}

/* Las cifras cuentan de 0 a su valor al entrar en vista. */
function contadores() {
    todos("[data-contador]").forEach((el) => {
        const fin = Number(el.dataset.contador);
        const cuenta = { v: 0 };
        el.textContent = "0";
        gsap.to(cuenta, {
            v: fin,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onUpdate: () => {
                el.textContent = String(Math.round(cuenta.v));
            },
        });
    });
}

/* ═══ Solo en escritorio ═══ */

/* Los buses de la portada andan por sus rutas sin parar. */
function busesEnRuta() {
    todos<SVGGElement>("[data-bus]").forEach((bus) => {
        gsap.to(bus, { ...recorrido(bus), repeat: -1 });
    });
}

/* El paso que está a la vista se marca, mientras el teléfono queda sticky al lado (el sticky es CSS). */
function pasoActivo() {
    todos("[data-paso]").forEach((paso, i) => {
        ScrollTrigger.create({
            trigger: paso,
            start: "top 60%",
            end: "bottom 40%",
            onToggle: ({ isActive }) => {
                if (isActive) pasos.porScroll = i;
                else if (pasos.porScroll === i) pasos.porScroll = null;
                marcarPaso();
            },
        });
    });
}

/* Qué paso se muestra: manda el puntero si está encima de los pasos; si no, el
   último tocado o el que está a la vista con el scroll. */
const pasos = { porScroll: null as number | null, porPuntero: null as number | null };

function marcarPaso() {
    const n = pasos.porPuntero ?? pasos.porScroll;
    todos("[data-paso]").forEach((p, i) => p.classList.toggle("es-activo", i === n));
    if (n === null) return;
    // El teléfono de al lado muestra la pantalla de ese paso (una data-vista por paso, en orden).
    const duration = matchMedia(CON_MOVIMIENTO).matches ? 0.4 : 0;
    todos("[data-pasos-telefono] [data-vista]").forEach((v, i) =>
        gsap.to(v, { autoAlpha: i === n ? 1 : 0, duration, ease: "power2.out", overwrite: true }),
    );
}

/* Al pasar el mouse por un paso, o al tocarlo o elegirlo con el teclado, el
   teléfono muestra su pantalla. En todas las pantallas y con o sin movimiento. */
function pasosConPuntero() {
    const lista = uno(".pasos");
    todos("[data-paso]").forEach((paso, i) => {
        paso.addEventListener("pointerenter", (e) => {
            if (e.pointerType !== "mouse") return;
            pasos.porPuntero = i;
            marcarPaso();
        });
        const elegir = () => {
            pasos.porScroll = i;
            marcarPaso();
        };
        paso.addEventListener("click", elegir);
        paso.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            elegir();
        });
    });
    lista?.addEventListener("pointerleave", () => {
        pasos.porPuntero = null;
        marcarPaso();
    });
}

/* En cada teléfono la ruta se dibuja y el bus la recorre. El de la portada arranca tras su entrada. */
function telefonos() {
    todos("[data-telefono]").forEach((tel) => {
        const ruta = tel.querySelector<SVGPathElement>("[data-tel-ruta]");
        const bus = tel.querySelector<SVGGElement>("[data-tel-bus]");
        if (!ruta || !bus) return;
        const enPortada = Boolean(tel.closest("[data-hero-telefono]"));
        const tl = gsap.timeline(
            enPortada ? { delay: 1.3 } : { scrollTrigger: { trigger: tel, start: "top 75%", once: true } },
        );
        tl.fromTo(ruta, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" })
            .fromTo(bus, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
            .to(bus, {
                motionPath: { path: ruta, align: ruta, alignOrigin: [0.5, 0.5] },
                duration: 7,
                ease: "none",
                repeat: -1,
            }, "<");
    });
}

/* Las ondas de la alerta salen del botón y se desvanecen, una tras otra. */
function pulsos() {
    gsap.fromTo(
        "[data-pulso]",
        { scale: 1, opacity: 0.7 },
        { scale: 2, opacity: 0, duration: 2.4, ease: "power1.out", stagger: { each: 0.8, repeat: -1 } },
    );
}

/* El teléfono del cierre se mueve más lento que el scroll. */
function paralaje() {
    todos("[data-paralaje]").forEach((el) => {
        gsap.fromTo(el, { yPercent: 12 }, {
            yPercent: -12,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        });
    });
}

/* Los degradados del fondo derivan muy despacio, casi sin notarse. */
function manchas() {
    todos("[data-mancha]").forEach((el) => {
        gsap.to(el, {
            xPercent: gsap.utils.random(-14, 14),
            yPercent: gsap.utils.random(-10, 10),
            scale: gsap.utils.random(0.9, 1.15),
            duration: gsap.utils.random(20, 28),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
        });
    });
}

/* ═══ Arranque ═══ */
const raiz = document.documentElement;
const medios = gsap.matchMedia();

barra();
pasosConPuntero();

medios.add(CON_MOVIMIENTO, () => {
    const pararScroll = scrollSuave();
    entradaPortada();
    revelar(40);
    contadores();
    return pararScroll;
});

medios.add(`${CON_MOVIMIENTO} and ${ESCRITORIO}`, () => {
    busesEnRuta();
    pasoActivo();
    telefonos();
    pulsos();
    paralaje();
    manchas();
});

// Reducir movimiento: la portada y las secciones solo se funden, sin desplazarse,
// y cada bus queda quieto en su punto de partida.
medios.add(SIN_MOVIMIENTO, () => {
    gsap.fromTo("[data-hero]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 });
    todos<SVGGElement>("[data-bus]").forEach((bus) => gsap.to(bus, { ...recorrido(bus), paused: true }).progress(1).progress(0));
    revelar(0);
});

raiz.classList.add("anim-listo");
// La letra cambia el alto de las secciones: recalcular dónde empieza cada animación.
document.fonts?.ready.then(() => ScrollTrigger.refresh());

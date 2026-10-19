// formaFicha.js — utilidad compartida entre vistas
//
// Construye la geometría SVG de una ficha (el bloque .forma-ficha de
// components.css). La usan tanto TableroView (para pintar el tablero) como
// AjustesView (para dibujar, dentro de cada botón de paleta, esas mismas
// formas ya coloreadas — así el selector de color enseña el conjunto de
// formas elegido de verdad), así que vive aquí en vez de duplicarse en cada
// vista. Sigue siendo una vista —toca SVG/DOM—, no un modelo: no decide qué
// conjunto o qué tipo tocan, solo sabe dibujarlos.

/** Espacio de nombres XML de SVG, obligatorio para crear sus elementos con
 *  createElementNS (createElement no vale para etiquetas SVG). */
export const NS_SVG = "http://www.w3.org/2000/svg";

/**
 * Geometría de cada tipo de ficha, por conjunto de formas, en un viewBox
 * cuadrado de 0 a 100. Formas reales (no aproximadas con
 * `border-radius`/`transform`): p. ej. el rombo de "clasica" es un
 * `<polygon>` con sus 4 vértices en su sitio, no un cuadrado rotado. Así la
 * imagen fantasma que genera el navegador al arrastrar —que se construye a
 * partir de la geometría renderizada, pero IGNORA cualquier `transform`
 * CSS— coincide siempre con la forma real de la ficha.
 *
 * El color (ver components.css, .forma-ficha__cuerpo--tipo-N) depende solo
 * del tipo y de la paleta, nunca del conjunto de formas: son ejes
 * independientes, igual que en Configuracion (CONJUNTOS_FORMA y PALETAS).
 */
export const FORMAS_POR_CONJUNTO = {
    clasica: [
        { etiqueta: "circle", atributos: { cx: "50", cy: "50", r: "42" } },
        { etiqueta: "rect", atributos: { x: "10", y: "10", width: "80", height: "80", rx: "20" } },
        { etiqueta: "polygon", atributos: { points: "50,6 94,50 50,94 6,50" } },
    ],
    angular: [
        { etiqueta: "polygon", atributos: { points: "50,8 92,86 8,86" } },
        { etiqueta: "polygon", atributos: { points: "50,6 90,28 90,72 50,94 10,72 10,28" } },
        { etiqueta: "polygon", atributos: { points: "38,8 62,8 62,34 88,34 88,62 62,62 62,92 38,92 38,62 12,62 12,34 38,34" } },
    ],
    estrellada: [
        { etiqueta: "ellipse", atributos: { cx: "50", cy: "50", rx: "46", ry: "32" } },
        { etiqueta: "polygon", atributos: { points: "50,6 91.9,36.4 75.9,85.6 24.1,85.6 8.2,36.4" } },
        {
            etiqueta: "polygon",
            atributos: {
                points: "50,4 61.2,34.6 93.8,35.8 68.1,55.9 77,87.2 50,69 23,87.2 31.9,55.9 6.3,35.8 38.8,34.6",
            },
        },
    ],
};

/**
 * Construye la forma SVG de una ficha: un `<svg class="forma-ficha">` con
 * la geometría de FORMAS_POR_CONJUNTO[conjuntoFormas][tipo] como único
 * cuerpo (color plano, sin relieve). Se usa `createElementNS`/
 * `setAttribute` en vez de `innerHTML`, igual que el resto de las vistas.
 * @param {number} tipo - 0, 1 o 2.
 * @param {string} conjuntoFormas - Una de CONJUNTOS_FORMA (Configuracion.js).
 * @returns {SVGSVGElement}
 */
export function crearFormaSvg(tipo, conjuntoFormas) {
    const svg = document.createElementNS(NS_SVG, "svg");
    svg.classList.add("forma-ficha");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    const { etiqueta, atributos } = FORMAS_POR_CONJUNTO[conjuntoFormas][tipo];
    const cuerpo = document.createElementNS(NS_SVG, etiqueta);
    cuerpo.classList.add("forma-ficha__cuerpo", `forma-ficha__cuerpo--tipo-${tipo + 1}`);
    Object.entries(atributos).forEach(([nombre, valor]) => cuerpo.setAttribute(nombre, valor));

    svg.appendChild(cuerpo);
    return svg;
}

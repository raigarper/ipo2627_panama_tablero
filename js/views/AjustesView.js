// AjustesView.js — vista
//
// Modal de ajustes de partida: tamaño del tablero (N), tamaño de ficha,
// conjunto de formas y paleta de color. Igual que AyudaView, flota con `position: absolute`
// sobre el resto de la interfaz y se abre/cierra por icono, respaldo,
// Escape o el botón "Cerrar".
//
// Esta vista NO decide si un N es válido: se limita a leer el valor del
// control pulsado y pasarlo al controlador mediante el callback
// correspondiente. Es el controlador (a través de Configuracion) quien
// acepta o rechaza el valor; esta vista solo refleja esa decisión con
// mostrarErrorN.
//
// Forma y paleta son ejes independientes, pero sus selectores no son
// independientes a la vista: el selector de forma se previsualiza en gris
// (no decide color), y el selector de paleta reutiliza esas MISMAS formas
// ya coloreadas — esta vista las repinta dentro de cada botón de paleta en
// cada actualizar(), así que el selector de color siempre enseña la
// combinación real con la que se va a jugar, sin necesitar una
// previsualización aparte.

import { crearFormaSvg } from "./formaFicha.js";

const TIPOS_FICHA = [0, 1, 2];

export class AjustesView {
    #contenedor;
    #respaldo;
    #botonApertura;
    #botonesN;
    #campoNPersonalizado;
    #elementoErrorN;
    #botonesTamano;
    #botonesForma;
    #botonesPaleta;

    /**
     * @param {HTMLElement} contenedor - El modal `[data-controles]`.
     * @param {HTMLElement} respaldo - La capa de fondo `[data-ajustes-respaldo]`.
     * @param {HTMLElement} botonApertura - El botón que abre este modal, para devolverle el foco al cerrar.
     * @param {{
     *   alCambiarN: (n:number)=>void,
     *   alCambiarTamano: (tamano:string)=>void,
     *   alCambiarForma: (conjuntoFormas:string)=>void,
     *   alCambiarPaleta: (paleta:string)=>void,
     *   alCerrar: ()=>void,
     * }} callbacks
     */
    constructor(contenedor, respaldo, botonApertura, callbacks) {
        this.#contenedor = contenedor;
        this.#respaldo = respaldo;
        this.#botonApertura = botonApertura;

        // Todos los controles se localizan por atributos data-*, nunca por
        // id ni por clase de estilo.
        this.#botonesN = Array.from(contenedor.querySelectorAll("[data-control='n']"));
        this.#campoNPersonalizado = contenedor.querySelector("[data-control='n-personalizado']");
        this.#elementoErrorN = contenedor.querySelector("[data-error-n]");
        this.#botonesTamano = Array.from(contenedor.querySelectorAll("[data-control='tamano']"));
        this.#botonesForma = Array.from(contenedor.querySelectorAll("[data-control='forma']"));
        this.#botonesPaleta = Array.from(contenedor.querySelectorAll("[data-control='paleta']"));
        const botonesCerrar = contenedor.querySelectorAll("[data-accion='cerrar-ajustes']");

        this.#botonesN.forEach((boton) => {
            boton.addEventListener("click", () => callbacks.alCambiarN(Number(boton.dataset.valor)));
        });
        this.#campoNPersonalizado.addEventListener("change", () => {
            callbacks.alCambiarN(Number(this.#campoNPersonalizado.value));
        });
        this.#botonesTamano.forEach((boton) => {
            boton.addEventListener("click", () => callbacks.alCambiarTamano(boton.dataset.valor));
        });
        this.#botonesForma.forEach((boton) => {
            boton.addEventListener("click", () => callbacks.alCambiarForma(boton.dataset.valor));
        });
        this.#botonesPaleta.forEach((boton) => {
            boton.addEventListener("click", () => callbacks.alCambiarPaleta(boton.dataset.valor));
        });
        botonesCerrar.forEach((boton) => {
            boton.addEventListener("click", () => callbacks.alCerrar());
        });

        contenedor.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape") {
                callbacks.alCerrar();
            }
        });
        respaldo.addEventListener("click", () => callbacks.alCerrar());
    }

    /**
     * Refleja la Configuracion actual marcando como activo el control que
     * corresponde a cada valor (N, tamaño, forma, paleta). Se llama después
     * de cada cambio para que la interfaz nunca muestre un valor
     * desincronizado del modelo.
     * @param {import("../models/Configuracion.js").Configuracion} configuracion
     */
    actualizar(configuracion) {
        this.#marcarActivo(this.#botonesN, String(configuracion.n), "segmento--activo");
        this.#campoNPersonalizado.value = String(configuracion.n);
        this.#marcarActivo(this.#botonesTamano, configuracion.tamanoFicha, "segmento--activo");
        this.#marcarActivo(this.#botonesForma, configuracion.conjuntoFormas, "muestra--activa");
        this.#marcarActivo(this.#botonesPaleta, configuracion.paleta, "muestra--activa");
        this.#pintarFormasEnPaleta(configuracion.conjuntoFormas);
        // Cualquier sincronización con una Configuracion válida deja atrás
        // un posible error de N mostrado anteriormente.
        this.mostrarErrorN(false);
    }

    /**
     * Repinta los 3 huecos `[data-paleta-forma]` de CADA botón de paleta
     * con la geometría del conjunto de formas actual (cada botón conserva
     * su propio tono vía `.muestra--azul/--violeta/--terracota`). Así el
     * selector de color siempre enseña su resultado real, sin necesitar una
     * previsualización aparte.
     * @param {string} conjuntoFormas - Una de CONJUNTOS_FORMA (Configuracion.js).
     */
    #pintarFormasEnPaleta(conjuntoFormas) {
        this.#botonesPaleta.forEach((boton) => {
            boton.querySelectorAll("[data-paleta-forma]").forEach((hueco) => {
                const tipo = TIPOS_FICHA[Number(hueco.dataset.paletaForma)];
                hueco.textContent = "";
                hueco.appendChild(crearFormaSvg(tipo, conjuntoFormas));
            });
        });
    }

    /**
     * Muestra u oculta el aviso de validación bajo el campo de N
     * personalizado. Quien decide si N es válido es el controlador (vía
     * Configuracion.validarN); esta vista solo refleja esa decisión con una
     * clase modificadora, un mensaje y el atributo `aria-invalid`.
     * @param {boolean} hayError
     */
    mostrarErrorN(hayError) {
        this.#campoNPersonalizado.classList.toggle("campo--invalido", hayError);
        this.#campoNPersonalizado.setAttribute("aria-invalid", String(hayError));
        this.#elementoErrorN.textContent = hayError ? "Debe ser un número entero de 3 en adelante." : "";
    }

    /**
     * Añade `claseActiva` al botón cuyo `data-valor` coincide con
     * `valorActivo` y la quita de los demás. También actualiza
     * `aria-pressed` para que un lector de pantalla anuncie cuál de las
     * opciones del grupo está seleccionada.
     * @param {HTMLElement[]} botones
     * @param {string} valorActivo
     * @param {string} claseActiva
     */
    #marcarActivo(botones, valorActivo, claseActiva) {
        botones.forEach((boton) => {
            const activo = boton.dataset.valor === valorActivo;
            boton.classList.toggle(claseActiva, activo);
            boton.setAttribute("aria-pressed", String(activo));
        });
    }

    /** Muestra el modal y mueve el foco a su primer control. */
    abrir() {
        this.#respaldo.classList.remove("respaldo--oculta");
        this.#contenedor.classList.remove("modal--oculta");
        this.#contenedor.querySelector("button")?.focus();
    }

    /** Oculta el modal y devuelve el foco al botón que lo abrió. */
    cerrar() {
        this.#contenedor.classList.add("modal--oculta");
        this.#respaldo.classList.add("respaldo--oculta");
        this.#botonApertura.focus();
    }
}

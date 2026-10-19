// AjustesView.js — vista
//
// Modal de ajustes de partida: tamaño del tablero (N), tamaño de ficha y
// paleta de color. Igual que AyudaView, flota con `position: absolute`
// sobre el resto de la interfaz y se abre/cierra por icono, respaldo,
// Escape o el botón "Cerrar".
//
// Esta vista NO decide si un N es válido: se limita a leer el valor del
// control pulsado y pasarlo al controlador mediante el callback
// correspondiente. Es el controlador (a través de Configuracion) quien
// acepta o rechaza el valor.

export class AjustesView {
    #contenedor;
    #respaldo;
    #botonApertura;
    #botonesN;
    #campoNPersonalizado;
    #botonesTamano;
    #botonesPaleta;

    /**
     * @param {HTMLElement} contenedor - El modal `[data-controles]`.
     * @param {HTMLElement} respaldo - La capa de fondo `[data-ajustes-respaldo]`.
     * @param {HTMLElement} botonApertura - El botón que abre este modal, para devolverle el foco al cerrar.
     * @param {{
     *   alCambiarN: (n:number)=>void,
     *   alCambiarTamano: (tamano:string)=>void,
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
        this.#botonesTamano = Array.from(contenedor.querySelectorAll("[data-control='tamano']"));
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
     * corresponde a cada valor (N, tamaño, paleta). Se llama después de
     * cada cambio para que la interfaz nunca muestre un valor desincronizado
     * del modelo.
     * @param {import("../models/Configuracion.js").Configuracion} configuracion
     */
    actualizar(configuracion) {
        this.#marcarActivo(this.#botonesN, String(configuracion.n), "segmento--activo");
        this.#campoNPersonalizado.value = String(configuracion.n);
        this.#marcarActivo(this.#botonesTamano, configuracion.tamanoFicha, "segmento--activo");
        this.#marcarActivo(this.#botonesPaleta, configuracion.paleta, "muestra--activa");
    }

    /**
     * Añade `claseActiva` al botón cuyo `data-valor` coincide con
     * `valorActivo` y la quita de los demás.
     * @param {HTMLElement[]} botones
     * @param {string} valorActivo
     * @param {string} claseActiva
     */
    #marcarActivo(botones, valorActivo, claseActiva) {
        botones.forEach((boton) => {
            boton.classList.toggle(claseActiva, boton.dataset.valor === valorActivo);
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

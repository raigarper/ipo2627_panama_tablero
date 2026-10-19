// AyudaView.js — vista
//
// Modal de asistencia al usuario: la capa flotante con las instrucciones de
// juego. Usa `position: absolute` sobre un ancla relativa (ver layout.css)
// precisamente porque debe superponerse al tablero sin desplazarlo ni
// empujar el resto del contenido — el único uso de `position` fuera de la
// ayuda y el aviso de victoria está prohibido por las normas del proyecto.
//
// Se abre/cierra con el icono de la cabecera, haciendo clic en el respaldo
// (la capa oscura de fondo) o pulsando Escape. El foco se mueve al botón de
// cerrar al abrir, y vuelve al botón que abrió el modal al cerrar.

export class AyudaView {
    #contenedor;
    #respaldo;
    #botonApertura;
    #botonCerrar;

    /**
     * @param {HTMLElement} contenedor - El modal `[data-ayuda]`.
     * @param {HTMLElement} respaldo - La capa de fondo `[data-ayuda-respaldo]`.
     * @param {HTMLElement} botonApertura - El botón que abre este modal, para devolverle el foco al cerrar.
     * @param {{alCerrar: ()=>void}} callbacks
     */
    constructor(contenedor, respaldo, botonApertura, { alCerrar }) {
        this.#contenedor = contenedor;
        this.#respaldo = respaldo;
        this.#botonApertura = botonApertura;
        this.#botonCerrar = contenedor.querySelector("[data-accion='cerrar-ayuda']");

        this.#botonCerrar.addEventListener("click", alCerrar);
        contenedor.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape") {
                alCerrar();
            }
        });
        respaldo.addEventListener("click", alCerrar);
    }

    /** Muestra el modal (quita las clases `--oculta`) y mueve el foco al botón de cerrar. */
    abrir() {
        this.#respaldo.classList.remove("respaldo--oculta");
        this.#contenedor.classList.remove("modal--oculta");
        this.#botonCerrar.focus();
    }

    /** Oculta el modal y devuelve el foco al botón que lo abrió. */
    cerrar() {
        this.#contenedor.classList.add("modal--oculta");
        this.#respaldo.classList.add("respaldo--oculta");
        this.#botonApertura.focus();
    }
}

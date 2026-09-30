// AyudaView.js — capa flotante de asistencia. Abre/cierra por clic, Escape o teclado.

export class AyudaView {
    #contenedor;
    #botonCerrar;
    #botonApertura;

    constructor(contenedor, botonApertura, { alCerrar }) {
        this.#contenedor = contenedor;
        this.#botonApertura = botonApertura;
        this.#botonCerrar = contenedor.querySelector("[data-ayuda-cerrar]");

        this.#botonCerrar.addEventListener("click", alCerrar);
        this.#contenedor.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape") {
                alCerrar();
            }
        });
    }

    abrir() {
        this.#contenedor.classList.remove("ayuda--oculta");
        this.#botonCerrar.focus();
    }

    cerrar() {
        this.#contenedor.classList.add("ayuda--oculta");
        this.#botonApertura.focus();
    }
}

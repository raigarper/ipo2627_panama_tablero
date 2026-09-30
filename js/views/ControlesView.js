// ControlesView.js — lee/escribe la barra de controles. Selección exclusiva por data-*.

export class ControlesView {
    #campoN;

    constructor(contenedor, callbacks) {
        const botonNuevaPartida = contenedor.querySelector("[data-accion='nueva-partida']");
        const campoN = contenedor.querySelector("[data-control='n']");
        const camposTamano = contenedor.querySelectorAll("[data-control='tamano']");
        const botonAspecto = contenedor.querySelector("[data-accion='cambiar-aspecto']");
        const botonAyuda = contenedor.querySelector("[data-accion='abrir-ayuda']");

        botonNuevaPartida.addEventListener("click", () => callbacks.alPedirNuevaPartida());

        campoN.addEventListener("change", () => callbacks.alCambiarN(Number(campoN.value)));

        camposTamano.forEach((campo) => {
            campo.addEventListener("change", () => {
                if (campo.checked) {
                    callbacks.alCambiarTamano(campo.value);
                }
            });
        });

        botonAspecto.addEventListener("click", () => callbacks.alCambiarAspecto());
        botonAyuda.addEventListener("click", () => callbacks.alAbrirAyuda());

        this.#campoN = campoN;
    }

    actualizar(configuracion) {
        this.#campoN.value = String(configuracion.n);
    }
}

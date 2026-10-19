// CabeceraView.js — vista
//
// La cabecera fija de la página: los marcadores de movimientos/tiempo y los
// tres botones de acción (reiniciar partida, abrir ayuda, abrir ajustes).
// Como cualquier vista, solo lee/escribe DOM y reenvía clics al controlador
// mediante callbacks; no decide nada por sí misma.

export class CabeceraView {
    #elementoMovimientos;
    #elementoTiempo;

    /**
     * @param {HTMLElement} contenedor - El elemento `[data-cabecera]`.
     * @param {{alReiniciar: ()=>void, alAbrirAyuda: ()=>void, alAbrirAjustes: ()=>void}} callbacks
     */
    constructor(contenedor, callbacks) {
        // Selección exclusivamente por atributos data-*, nunca por clase o id.
        const botonReiniciar = contenedor.querySelector("[data-accion='reiniciar']");
        const botonAyuda = contenedor.querySelector("[data-accion='abrir-ayuda']");
        const botonAjustes = contenedor.querySelector("[data-accion='abrir-ajustes']");

        this.#elementoMovimientos = contenedor.querySelector("[data-marcador-movimientos]");
        this.#elementoTiempo = contenedor.querySelector("[data-marcador-tiempo]");

        botonReiniciar.addEventListener("click", () => callbacks.alReiniciar());
        botonAyuda.addEventListener("click", () => callbacks.alAbrirAyuda());
        botonAjustes.addEventListener("click", () => callbacks.alAbrirAjustes());
    }

    /** @param {number} movimientos - Nº de intercambios realizados en la partida actual. */
    actualizarMovimientos(movimientos) {
        this.#elementoMovimientos.textContent = String(movimientos);
    }

    /**
     * Pinta el cronómetro como mm:ss a partir de segundos totales.
     * @param {number} segundosTotales
     */
    actualizarTiempo(segundosTotales) {
        const minutos = Math.floor(segundosTotales / 60);
        const segundos = segundosTotales % 60;
        const dosDigitos = (valor) => String(valor).padStart(2, "0");
        this.#elementoTiempo.textContent = `${dosDigitos(minutos)}:${dosDigitos(segundos)}`;
    }
}

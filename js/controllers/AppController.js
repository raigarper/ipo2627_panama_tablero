// AppController.js — controlador
//
// Único punto de encuentro entre vistas y modelo. Las vistas nunca se
// llaman entre sí ni conocen el modelo directamente: le notifican al
// controlador lo que el usuario pidió (mediante los callbacks que reciben
// en app.js) y el controlador decide qué hacer con el modelo y qué vistas
// repintar. El controlador, a su vez, NO toca el DOM: solo llama a métodos
// públicos de las vistas (`pintar`, `actualizar`, `abrir`, `cerrar`...).

/** Cada cuánto se refresca el cronómetro de la cabecera mientras no hay movimientos. */
const INTERVALO_RELOJ_MS = 1000;

export class AppController {
    #configuracion;
    #modelo;
    #tableroView;
    #cabeceraView;
    #ajustesView;
    #ayudaView;

    /**
     * @param {{
     *   configuracion: import("../models/Configuracion.js").Configuracion,
     *   modelo: import("../models/TableroModel.js").TableroModel,
     *   tableroView: import("../views/TableroView.js").TableroView,
     *   cabeceraView: import("../views/CabeceraView.js").CabeceraView,
     *   ajustesView: import("../views/AjustesView.js").AjustesView,
     *   ayudaView: import("../views/AyudaView.js").AyudaView,
     * }} piezas - Instancias ya creadas por app.js (composition root).
     */
    constructor({ configuracion, modelo, tableroView, cabeceraView, ajustesView, ayudaView }) {
        this.#configuracion = configuracion;
        this.#modelo = modelo;
        this.#tableroView = tableroView;
        this.#cabeceraView = cabeceraView;
        this.#ajustesView = ajustesView;
        this.#ayudaView = ayudaView;

        // Patrón observador: cuando el modelo cambia (nueva partida o
        // intercambio), el controlador repinta sin que el modelo sepa nada
        // de vistas ni de DOM.
        this.#modelo.addEventListener("cambio", () => this.#repintar());
    }

    /** Primer pintado y arranque del cronómetro visual. Se llama una vez desde app.js. */
    iniciar() {
        this.#ajustesView.actualizar(this.#configuracion);
        this.#repintar();
        setInterval(() => this.#actualizarTiempo(), INTERVALO_RELOJ_MS);
    }

    /**
     * Petición de intercambio originada en la vista del tablero (por Drag &
     * Drop o por la alternativa de teclado). Se delega entera en el
     * modelo: es él quien valida coordenadas y aplica el cambio.
     */
    solicitarIntercambio(fila1, columna1, fila2, columna2) {
        this.#modelo.intercambiar(fila1, columna1, fila2, columna2);
    }

    /** Botón "Reiniciar": nueva partida con la N actual. */
    reiniciar() {
        this.#modelo.reiniciar(this.#configuracion.n);
    }

    /**
     * Cambia la dimensión del tablero. Como pide el enunciado, cambiar N
     * siempre crea una partida nueva (nunca se conserva la disposición
     * anterior).
     * @param {number} n
     */
    cambiarN(n) {
        this.#configuracion = this.#configuracion.conN(n);
        this.#ajustesView.actualizar(this.#configuracion);
        this.#modelo.reiniciar(this.#configuracion.n);
    }

    /**
     * Cambia el tamaño visual de la ficha. También crea una partida nueva,
     * igual que cualquier cambio de ajustes.
     * @param {string} tamanoFicha
     */
    cambiarTamanoFicha(tamanoFicha) {
        this.#configuracion = this.#configuracion.conTamanoFicha(tamanoFicha);
        this.#ajustesView.actualizar(this.#configuracion);
        this.#modelo.reiniciar(this.#configuracion.n);
    }

    /**
     * Cambia la paleta de color de las fichas. También crea una partida nueva.
     * @param {string} paleta
     */
    cambiarPaleta(paleta) {
        this.#configuracion = this.#configuracion.conPaleta(paleta);
        this.#ajustesView.actualizar(this.#configuracion);
        this.#modelo.reiniciar(this.#configuracion.n);
    }

    /** Abre el modal de ayuda (asistencia sobre la mecánica del juego). */
    abrirAyuda() {
        this.#ayudaView.abrir();
    }

    /** Cierra el modal de ayuda. */
    cerrarAyuda() {
        this.#ayudaView.cerrar();
    }

    /** Abre el modal de ajustes de partida. */
    abrirAjustes() {
        this.#ajustesView.abrir();
    }

    /** Cierra el modal de ajustes de partida. */
    cerrarAjustes() {
        this.#ajustesView.cerrar();
    }

    /** Vuelve a pintar el tablero y los marcadores de la cabecera a partir del estado actual del modelo. */
    #repintar() {
        this.#tableroView.pintar(this.#modelo.tablero, this.#configuracion, this.#modelo.estaResuelto());
        this.#cabeceraView.actualizarMovimientos(this.#modelo.movimientos);
        this.#actualizarTiempo();
    }

    /** Refresca solo el cronómetro, sin repintar el tablero entero. */
    #actualizarTiempo() {
        this.#cabeceraView.actualizarTiempo(this.#modelo.segundosTranscurridos());
    }
}

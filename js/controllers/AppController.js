// AppController.js — único punto de encuentro entre vistas y modelo. No toca el DOM.

export class AppController {
    #configuracion;
    #modelo;
    #tableroView;
    #controlesView;
    #ayudaView;

    constructor({ configuracion, modelo, tableroView, controlesView, ayudaView }) {
        this.#configuracion = configuracion;
        this.#modelo = modelo;
        this.#tableroView = tableroView;
        this.#controlesView = controlesView;
        this.#ayudaView = ayudaView;

        this.#modelo.addEventListener("cambio", () => this.#repintar());
    }

    iniciar() {
        this.#controlesView.actualizar(this.#configuracion);
        this.#repintar();
    }

    solicitarIntercambio(fila1, columna1, fila2, columna2) {
        this.#modelo.intercambiar(fila1, columna1, fila2, columna2);
    }

    nuevaPartida() {
        this.#modelo.reiniciar(this.#configuracion.n);
    }

    cambiarN(n) {
        this.#configuracion = this.#configuracion.conN(n);
        this.#controlesView.actualizar(this.#configuracion);
        this.#modelo.reiniciar(this.#configuracion.n);
    }

    cambiarTamanoFicha(tamanoFicha) {
        this.#configuracion = this.#configuracion.conTamanoFicha(tamanoFicha);
        this.#modelo.reiniciar(this.#configuracion.n);
    }

    cambiarAspecto() {
        this.#configuracion = this.#configuracion.conAspectoSiguiente();
        this.#modelo.reiniciar(this.#configuracion.n);
    }

    abrirAyuda() {
        this.#ayudaView.abrir();
    }

    cerrarAyuda() {
        this.#ayudaView.cerrar();
    }

    #repintar() {
        this.#tableroView.pintar(this.#modelo.tablero, this.#configuracion, this.#modelo.estaResuelto());
    }
}

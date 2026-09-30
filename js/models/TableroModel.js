// TableroModel.js — genera partidas resolubles y aplica movimientos. Emite "cambio".

import { Tablero } from "./Tablero.js";

const FACTOR_BARAJADOS = 4;

export class TableroModel extends EventTarget {
    #tablero;

    constructor(n) {
        super();
        this.#tablero = TableroModel.#generarTableroResoluble(n);
    }

    // La resolubilidad se garantiza por construcción: se parte de un tablero
    // ya resuelto y se baraja SOLO con intercambios (el multiconjunto de fichas
    // es invariante). Si tras barajar el tablero queda resuelto, se repite.
    static #generarTableroResoluble(n) {
        let tablero;
        do {
            tablero = new Tablero(n);
            TableroModel.#barajar(tablero);
        } while (tablero.estaResuelto());
        return tablero;
    }

    static #barajar(tablero) {
        const numeroIntercambios = tablero.n * tablero.n * FACTOR_BARAJADOS;
        for (let i = 0; i < numeroIntercambios; i += 1) {
            const fila1 = Math.floor(Math.random() * tablero.n);
            const columna1 = Math.floor(Math.random() * tablero.n);
            const fila2 = Math.floor(Math.random() * tablero.n);
            const columna2 = Math.floor(Math.random() * tablero.n);
            tablero.intercambiar(fila1, columna1, fila2, columna2);
        }
    }

    get n() {
        return this.#tablero.n;
    }

    get tablero() {
        return this.#tablero;
    }

    reiniciar(n) {
        this.#tablero = TableroModel.#generarTableroResoluble(n);
        this.#emitirCambio();
    }

    intercambiar(fila1, columna1, fila2, columna2) {
        if (!this.#esCoordenadaValida(fila1, columna1) || !this.#esCoordenadaValida(fila2, columna2)) {
            return;
        }
        if (fila1 === fila2 && columna1 === columna2) {
            return;
        }
        this.#tablero.intercambiar(fila1, columna1, fila2, columna2);
        this.#emitirCambio();
    }

    estaResuelto() {
        return this.#tablero.estaResuelto();
    }

    #esCoordenadaValida(fila, columna) {
        return fila >= 0 && fila < this.#tablero.n && columna >= 0 && columna < this.#tablero.n;
    }

    #emitirCambio() {
        this.dispatchEvent(new CustomEvent("cambio"));
    }
}

// Tablero.js — matriz NxN de fichas y sus reglas puras. Sin document, sin DOM.

import { Ficha, TIPOS_FICHA } from "./Ficha.js";

export class Tablero {
    #n;
    #celdas;

    constructor(n) {
        this.#n = n;
        this.#celdas = Tablero.#crearCeldasResueltas(n);
    }

    static #crearCeldasResueltas(n) {
        const celdas = [];
        for (let fila = 0; fila < n; fila += 1) {
            const tipo = TIPOS_FICHA[fila % TIPOS_FICHA.length];
            const filaCeldas = [];
            for (let columna = 0; columna < n; columna += 1) {
                filaCeldas.push(new Ficha(tipo));
            }
            celdas.push(filaCeldas);
        }
        return celdas;
    }

    get n() {
        return this.#n;
    }

    obtenerFicha(fila, columna) {
        return this.#celdas[fila][columna];
    }

    intercambiar(fila1, columna1, fila2, columna2) {
        const temporal = this.#celdas[fila1][columna1];
        this.#celdas[fila1][columna1] = this.#celdas[fila2][columna2];
        this.#celdas[fila2][columna2] = temporal;
    }

    // Victoria: cada fila contiene fichas de un único tipo (no hace falta que las filas difieran entre sí)
    estaResuelto() {
        return this.#celdas.every((filaCeldas) =>
            filaCeldas.every((ficha) => ficha.tipo === filaCeldas[0].tipo)
        );
    }

    clonar() {
        const copia = new Tablero(this.#n);
        copia.#celdas = this.#celdas.map((filaCeldas) => filaCeldas.map((ficha) => ficha.clonar()));
        return copia;
    }

    forEachCelda(manejador) {
        this.#celdas.forEach((filaCeldas, fila) => {
            filaCeldas.forEach((ficha, columna) => {
                manejador(ficha, fila, columna);
            });
        });
    }
}

// Tablero.js — modelo
//
// Matriz NxN de fichas y las reglas puras del juego: cómo se construye un
// tablero resuelto, cómo se intercambian dos celdas y cómo se detecta la
// victoria. No importa nada de views/ ni controllers/, no usa `document` y
// no sabe nada de Drag & Drop: por eso se puede ejecutar y probar con Node,
// sin abrir un navegador.

import { Ficha, TIPOS_FICHA } from "./Ficha.js";

/**
 * Tablero — matriz NxN de Fichas.
 *
 * Se construye SIEMPRE ya resuelto (cada fila de un único tipo). El barajado
 * para generar la partida inicial no es responsabilidad de esta clase: vive
 * en TableroModel, que aplica intercambios sobre un Tablero ya construido
 * aquí. Así la resolubilidad queda garantizada por construcción, nunca por
 * comprobación posterior.
 */
export class Tablero {
    #n;
    #celdas;

    /**
     * @param {number} n - Dimensión del tablero (NxN). Se asume válida
     *   (N >= 3); la validación de entrada del usuario vive en Configuracion.
     */
    constructor(n) {
        this.#n = n;
        this.#celdas = Tablero.#crearCeldasResueltas(n);
    }

    /**
     * Construye la matriz de partida: la fila `f` se llena entera con el
     * tipo `f % 3`, repitiendo tipos si N > 3. Es el único punto donde se
     * crean Fichas nuevas a partir de la nada.
     * @param {number} n
     * @returns {Ficha[][]}
     */
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

    /** @returns {number} La dimensión N del tablero. */
    get n() {
        return this.#n;
    }

    /**
     * @param {number} fila
     * @param {number} columna
     * @returns {Ficha} La ficha situada en esa celda.
     */
    obtenerFicha(fila, columna) {
        return this.#celdas[fila][columna];
    }

    /**
     * Único movimiento permitido por el juego: intercambia el contenido de
     * dos celdas. Al ser un intercambio (y no una asignación libre), el
     * multiconjunto de fichas del tablero nunca cambia, así que un tablero
     * que empezó siendo resoluble lo sigue siendo tras cualquier número de
     * intercambios.
     */
    intercambiar(fila1, columna1, fila2, columna2) {
        const temporal = this.#celdas[fila1][columna1];
        this.#celdas[fila1][columna1] = this.#celdas[fila2][columna2];
        this.#celdas[fila2][columna2] = temporal;
    }

    /**
     * Condición de victoria: cada fila contiene fichas de un único tipo.
     * No se exige que los tipos difieran entre filas (dos filas podrían
     * resolverse ambas con el mismo tipo).
     * @returns {boolean}
     */
    estaResuelto() {
        return this.#celdas.every((filaCeldas) =>
            filaCeldas.every((ficha) => ficha.tipo === filaCeldas[0].tipo)
        );
    }

    /**
     * Copia profunda: nueva matriz con Fichas nuevas, para que modificar la
     * copia no afecte al original.
     * @returns {Tablero}
     */
    clonar() {
        const copia = new Tablero(this.#n);
        copia.#celdas = this.#celdas.map((filaCeldas) => filaCeldas.map((ficha) => ficha.clonar()));
        return copia;
    }

    /**
     * Recorre todas las celdas en orden de fila y columna. Es el único
     * punto de lectura que usa la vista para pintar el tablero completo.
     * @param {(ficha: Ficha, fila: number, columna: number) => void} manejador
     */
    forEachCelda(manejador) {
        this.#celdas.forEach((filaCeldas, fila) => {
            filaCeldas.forEach((ficha, columna) => {
                manejador(ficha, fila, columna);
            });
        });
    }
}

// TableroModel.js — modelo
//
// Capa que envuelve un Tablero y añade todo lo que necesita una PARTIDA en
// curso: cómo se genera el tablero inicial (siempre resoluble, nunca ya
// resuelto), la validación de los intercambios que llegan desde el
// controlador, y el contador de movimientos/tiempo. Es un EventTarget: en
// vez de que la vista pregunte "¿cambió algo?", el modelo avisa emitiendo
// "cambio" cada vez que su estado se actualiza (patrón observador).
//
// Igual que Tablero.js, no toca el DOM: se puede generar un TableroModel y
// comprobar sus invariantes (resolubilidad, no-resuelto-de-partida) desde
// Node, sin navegador.

import { Tablero } from "./Tablero.js";

/** Nº de intercambios de barajado = N² × este factor. Cuanto más alto, más
 *  mezclado queda el tablero inicial (y más improbable que salga resuelto
 *  por azar en la primera pasada). */
const FACTOR_BARAJADOS = 4;

/**
 * TableroModel — una partida: el Tablero actual más movimientos y tiempo.
 *
 * Emite el evento "cambio" (sin datos adicionales) cada vez que el tablero
 * se reinicia o se intercambian dos celdas. El controlador se suscribe a
 * ese evento para pedir a las vistas que vuelvan a pintarse.
 */
export class TableroModel extends EventTarget {
    #tablero;
    #movimientos = 0;
    #inicio = Date.now();

    /** @param {number} n - Dimensión del tablero inicial. */
    constructor(n) {
        super();
        this.#tablero = TableroModel.#generarTableroResoluble(n);
    }

    /**
     * Genera un tablero de partida garantizado resoluble y garantizado NO
     * resuelto de entrada.
     *
     * La resolubilidad se consigue por construcción, no por comprobación:
     * se parte de un Tablero ya resuelto (new Tablero(n)) y se baraja
     * aplicando ÚNICAMENTE intercambios (Tablero.intercambiar). Como un
     * intercambio nunca crea ni destruye fichas, el multiconjunto de fichas
     * tras barajar es el mismo que el de un tablero resuelto, así que
     * siempre existe una secuencia de intercambios que deshace el barajado
     * y vuelve a dejarlo resuelto.
     *
     * Si el barajado (que usa posiciones al azar) tiene la mala suerte de
     * devolver un tablero que ya está resuelto, se repite desde cero: no
     * tendría sentido entregarle al jugador una partida ya terminada.
     * @param {number} n
     * @returns {Tablero}
     */
    static #generarTableroResoluble(n) {
        let tablero;
        do {
            tablero = new Tablero(n);
            TableroModel.#barajar(tablero);
        } while (tablero.estaResuelto());
        return tablero;
    }

    /**
     * Aplica N² × FACTOR_BARAJADOS intercambios entre celdas elegidas al
     * azar (pueden coincidir origen y destino; ese intercambio es un no-op
     * pero no afecta a la corrección, solo "desperdicia" una iteración).
     * @param {Tablero} tablero - Se modifica en el sitio.
     */
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

    /** @returns {number} Dimensión del tablero actual. */
    get n() {
        return this.#tablero.n;
    }

    /** @returns {Tablero} El tablero de la partida en curso. */
    get tablero() {
        return this.#tablero;
    }

    /** @returns {number} Movimientos (intercambios válidos) realizados. */
    get movimientos() {
        return this.#movimientos;
    }

    /**
     * Tiempo transcurrido desde que empezó la partida actual (se reinicia
     * en cada `reiniciar`). Se calcula a partir de un timestamp guardado en
     * vez de con un `setInterval` propio: así el valor es siempre exacto,
     * lo pida quien lo pida y cuando lo pida.
     * @returns {number} Segundos completos transcurridos.
     */
    segundosTranscurridos() {
        return Math.floor((Date.now() - this.#inicio) / 1000);
    }

    /**
     * Empieza una partida nueva: genera un tablero resoluble de dimensión
     * `n`, pone a cero movimientos y cronómetro, y avisa a las vistas.
     * @param {number} n
     */
    reiniciar(n) {
        this.#tablero = TableroModel.#generarTableroResoluble(n);
        this.#movimientos = 0;
        this.#inicio = Date.now();
        this.#emitirCambio();
    }

    /**
     * Intenta aplicar el movimiento del jugador: intercambiar dos celdas.
     * Si alguna coordenada está fuera del tablero, o si origen y destino
     * son la misma celda (no sería un movimiento real), la petición se
     * ignora sin lanzar error y sin contar como movimiento. La vista no
     * valida nada de esto por sí misma: solo recoge coordenadas y las pasa
     * aquí a través del controlador.
     */
    intercambiar(fila1, columna1, fila2, columna2) {
        if (!this.#esCoordenadaValida(fila1, columna1) || !this.#esCoordenadaValida(fila2, columna2)) {
            return;
        }
        if (fila1 === fila2 && columna1 === columna2) {
            return;
        }
        this.#tablero.intercambiar(fila1, columna1, fila2, columna2);
        this.#movimientos += 1;
        this.#emitirCambio();
    }

    /** @returns {boolean} Si la partida actual está resuelta (ver Tablero.estaResuelto). */
    estaResuelto() {
        return this.#tablero.estaResuelto();
    }

    /** @returns {boolean} Si (fila, columna) cae dentro del tablero actual. */
    #esCoordenadaValida(fila, columna) {
        return fila >= 0 && fila < this.#tablero.n && columna >= 0 && columna < this.#tablero.n;
    }

    /** Notifica a quien esté escuchando que el estado de la partida cambió. */
    #emitirCambio() {
        this.dispatchEvent(new CustomEvent("cambio"));
    }
}

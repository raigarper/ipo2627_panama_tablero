// Ficha.js — modelo
//
// Representa una ficha individual del tablero. Es un "value object": no tiene
// identidad propia ni referencia a su posición, solo un tipo. La forma y el
// color con los que se pinta cada tipo son decisión de la vista (vía CSS);
// aquí solo se guarda el número de tipo (0, 1 o 2).

/** Tipos de ficha válidos. Siempre son exactamente 3 (lo exige el enunciado). */
export const TIPOS_FICHA = Object.freeze([0, 1, 2]);

/**
 * Ficha — una pieza del tablero.
 *
 * Inmutable desde fuera: una vez creada, su tipo no cambia. Para "moverla"
 * de celda no se modifica la ficha, se intercambia su posición en el
 * Tablero (ver Tablero.intercambiar).
 */
export class Ficha {
    #tipo;

    /**
     * @param {number} tipo - Uno de los valores de TIPOS_FICHA.
     * @throws {Error} si el tipo no es válido.
     */
    constructor(tipo) {
        if (!TIPOS_FICHA.includes(tipo)) {
            throw new Error(`Tipo de ficha inválido: ${tipo}`);
        }
        this.#tipo = tipo;
    }

    /** @returns {number} El tipo de la ficha (0, 1 o 2). */
    get tipo() {
        return this.#tipo;
    }

    /**
     * Crea una ficha nueva con el mismo tipo. Se usa para clonar un Tablero
     * sin compartir referencias con el original (p. ej. al duplicar estado).
     * @returns {Ficha}
     */
    clonar() {
        return new Ficha(this.#tipo);
    }
}

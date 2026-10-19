// Configuracion.js — modelo
//
// Representa el estado de la partida que NO es el tablero en sí: dimensión
// N, tamaño visual de la ficha y paleta de color. Es el único sitio del
// proyecto donde viven los valores por defecto y los valores permitidos
// (p. ej. las tres magnitudes de ficha), para que no queden constantes
// repartidas por otros ficheros.
//
// Es un objeto inmutable: cada "con*" devuelve una Configuracion NUEVA en
// vez de mutar la actual. Esto evita que una vista guarde una referencia a
// la configuración y se quede con datos obsoletos tras un cambio.

/** Magnitudes de ficha admitidas. */
export const TAMANOS_FICHA = Object.freeze(["pequena", "mediana", "grande"]);

/** Paletas de color admitidas para las fichas. */
export const PALETAS = Object.freeze(["azul", "violeta", "terracota"]);

const VALORES_POR_DEFECTO = Object.freeze({
    n: 4,
    tamanoFicha: "mediana",
    paleta: "azul",
});

/**
 * Configuracion — N, tamaño de ficha y paleta de la partida actual.
 *
 * Cualquier valor inválido recibido en el constructor o en un "con*" se
 * ignora en silencio y se sustituye por el valor anterior (o el valor por
 * defecto si no había uno): así el llamador no necesita validar antes de
 * construir, la clase se defiende sola.
 */
export class Configuracion {
    #n;
    #tamanoFicha;
    #paleta;

    /**
     * @param {{n?: number, tamanoFicha?: string, paleta?: string}} opciones
     */
    constructor({
        n = VALORES_POR_DEFECTO.n,
        tamanoFicha = VALORES_POR_DEFECTO.tamanoFicha,
        paleta = VALORES_POR_DEFECTO.paleta,
    } = {}) {
        this.#n = Configuracion.validarN(n) ? n : VALORES_POR_DEFECTO.n;
        this.#tamanoFicha = TAMANOS_FICHA.includes(tamanoFicha) ? tamanoFicha : VALORES_POR_DEFECTO.tamanoFicha;
        this.#paleta = PALETAS.includes(paleta) ? paleta : VALORES_POR_DEFECTO.paleta;
    }

    /**
     * Regla del dominio: el tablero es NxN con N >= 3. Se expone como
     * estática para que el controlador pueda rechazar una entrada de
     * usuario (p. ej. del campo de N personalizado) sin tener que construir
     * una Configuracion de prueba.
     * @param {number} n
     * @returns {boolean}
     */
    static validarN(n) {
        return Number.isInteger(n) && n >= 3;
    }

    /** @returns {number} */
    get n() {
        return this.#n;
    }

    /** @returns {string} Una de TAMANOS_FICHA. */
    get tamanoFicha() {
        return this.#tamanoFicha;
    }

    /** @returns {string} Una de PALETAS. */
    get paleta() {
        return this.#paleta;
    }

    /**
     * @param {number} n
     * @returns {Configuracion} Una nueva Configuracion con N actualizado, o
     *   `this` sin cambios si `n` no es válido.
     */
    conN(n) {
        if (!Configuracion.validarN(n)) {
            return this;
        }
        return new Configuracion({ n, tamanoFicha: this.#tamanoFicha, paleta: this.#paleta });
    }

    /**
     * @param {string} tamanoFicha
     * @returns {Configuracion} Nueva instancia con el tamaño actualizado, o
     *   `this` si el valor no está en TAMANOS_FICHA.
     */
    conTamanoFicha(tamanoFicha) {
        if (!TAMANOS_FICHA.includes(tamanoFicha)) {
            return this;
        }
        return new Configuracion({ n: this.#n, tamanoFicha, paleta: this.#paleta });
    }

    /**
     * @param {string} paleta
     * @returns {Configuracion} Nueva instancia con la paleta actualizada, o
     *   `this` si el valor no está en PALETAS.
     */
    conPaleta(paleta) {
        if (!PALETAS.includes(paleta)) {
            return this;
        }
        return new Configuracion({ n: this.#n, tamanoFicha: this.#tamanoFicha, paleta });
    }
}

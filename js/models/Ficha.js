// Ficha.js — value object: tipo de ficha (forma y color los resuelve la vista vía CSS)

export const TIPOS_FICHA = Object.freeze([0, 1, 2]);

export class Ficha {
    #tipo;

    constructor(tipo) {
        if (!TIPOS_FICHA.includes(tipo)) {
            throw new Error(`Tipo de ficha inválido: ${tipo}`);
        }
        this.#tipo = tipo;
    }

    get tipo() {
        return this.#tipo;
    }

    clonar() {
        return new Ficha(this.#tipo);
    }
}

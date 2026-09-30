// Configuracion.js — estado de partida: N, tamaño de ficha y aspecto. Inmutable.

export const TAMANOS_FICHA = Object.freeze(["pequena", "mediana", "grande"]);
export const ASPECTOS = Object.freeze(["clasico", "alterno"]);

const VALORES_POR_DEFECTO = Object.freeze({
    n: 4,
    tamanoFicha: "mediana",
    aspecto: "clasico",
});

export class Configuracion {
    #n;
    #tamanoFicha;
    #aspecto;

    constructor({
        n = VALORES_POR_DEFECTO.n,
        tamanoFicha = VALORES_POR_DEFECTO.tamanoFicha,
        aspecto = VALORES_POR_DEFECTO.aspecto,
    } = {}) {
        this.#n = Configuracion.validarN(n) ? n : VALORES_POR_DEFECTO.n;
        this.#tamanoFicha = TAMANOS_FICHA.includes(tamanoFicha) ? tamanoFicha : VALORES_POR_DEFECTO.tamanoFicha;
        this.#aspecto = ASPECTOS.includes(aspecto) ? aspecto : VALORES_POR_DEFECTO.aspecto;
    }

    static validarN(n) {
        return Number.isInteger(n) && n >= 3;
    }

    get n() {
        return this.#n;
    }

    get tamanoFicha() {
        return this.#tamanoFicha;
    }

    get aspecto() {
        return this.#aspecto;
    }

    conN(n) {
        if (!Configuracion.validarN(n)) {
            return this;
        }
        return new Configuracion({ n, tamanoFicha: this.#tamanoFicha, aspecto: this.#aspecto });
    }

    conTamanoFicha(tamanoFicha) {
        if (!TAMANOS_FICHA.includes(tamanoFicha)) {
            return this;
        }
        return new Configuracion({ n: this.#n, tamanoFicha, aspecto: this.#aspecto });
    }

    conAspectoSiguiente() {
        const indiceActual = ASPECTOS.indexOf(this.#aspecto);
        const siguiente = ASPECTOS[(indiceActual + 1) % ASPECTOS.length];
        return new Configuracion({ n: this.#n, tamanoFicha: this.#tamanoFicha, aspecto: siguiente });
    }
}

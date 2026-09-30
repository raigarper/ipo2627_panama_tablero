// TableroView.js — pinta el tablero (Grid) y traduce interacción (Drag & Drop
// y su alternativa de teclado) en coordenadas. No decide si un movimiento es válido.

export class TableroView {
    #contenedor;
    #elementoEstado;
    #alSolicitarIntercambio;
    #celdaSeleccionada = null;

    constructor(contenedor, elementoEstado, { alSolicitarIntercambio }) {
        this.#contenedor = contenedor;
        this.#elementoEstado = elementoEstado;
        this.#alSolicitarIntercambio = alSolicitarIntercambio;

        this.#contenedor.addEventListener("dragstart", this.#manejarDragStart);
        this.#contenedor.addEventListener("dragend", this.#manejarDragEnd);
        this.#contenedor.addEventListener("dragover", this.#manejarDragOver);
        this.#contenedor.addEventListener("dragenter", this.#manejarDragEnter);
        this.#contenedor.addEventListener("dragleave", this.#manejarDragLeave);
        this.#contenedor.addEventListener("drop", this.#manejarDrop);
        this.#contenedor.addEventListener("click", this.#manejarClick);
        this.#contenedor.addEventListener("keydown", this.#manejarKeydown);
    }

    pintar(tablero, configuracion, resuelto) {
        this.#celdaSeleccionada = null;
        this.#contenedor.style.setProperty("--n", tablero.n);
        this.#actualizarModificadores(configuracion, resuelto);
        this.#contenedor.textContent = "";

        tablero.forEachCelda((ficha, fila, columna) => {
            const celda = document.createElement("div");
            celda.classList.add("tablero__celda");
            celda.dataset.celda = "";
            celda.dataset.fila = String(fila);
            celda.dataset.columna = String(columna);
            celda.dataset.tipo = String(ficha.tipo);
            celda.tabIndex = 0;
            celda.setAttribute("role", "gridcell");
            celda.setAttribute(
                "aria-label",
                `Fila ${fila + 1}, columna ${columna + 1}, ficha tipo ${ficha.tipo + 1}`
            );

            const fichaElemento = document.createElement("div");
            fichaElemento.classList.add("ficha", `ficha--tipo-${ficha.tipo + 1}`);
            fichaElemento.dataset.ficha = "";
            fichaElemento.draggable = true;

            celda.appendChild(fichaElemento);
            this.#contenedor.appendChild(celda);
        });

        this.#elementoEstado.textContent = resuelto
            ? "¡Tablero resuelto! Cada fila tiene fichas de un único tipo."
            : "";
    }

    #actualizarModificadores(configuracion, resuelto) {
        this.#contenedor.classList.remove(
            "tablero--pequena",
            "tablero--mediana",
            "tablero--grande",
            "tablero--aspecto-alterno",
            "tablero--resuelto"
        );
        this.#contenedor.classList.add(`tablero--${configuracion.tamanoFicha}`);
        if (configuracion.aspecto === "alterno") {
            this.#contenedor.classList.add("tablero--aspecto-alterno");
        }
        if (resuelto) {
            this.#contenedor.classList.add("tablero--resuelto");
        }
    }

    #manejarDragStart = (evento) => {
        const fichaElemento = evento.target.closest("[data-ficha]");
        if (!fichaElemento) {
            return;
        }
        const celda = fichaElemento.closest("[data-celda]");
        const fila = Number(celda.dataset.fila);
        const columna = Number(celda.dataset.columna);
        evento.dataTransfer.setData("application/json", JSON.stringify({ fila, columna }));
        fichaElemento.classList.add("ficha--en-arrastre");
    };

    #manejarDragEnd = (evento) => {
        const fichaElemento = evento.target.closest("[data-ficha]");
        fichaElemento?.classList.remove("ficha--en-arrastre");
    };

    #manejarDragOver = (evento) => {
        const celda = evento.target.closest("[data-celda]");
        if (!celda) {
            return;
        }
        // Imprescindible: sin preventDefault en dragover el navegador no permite el drop.
        evento.preventDefault();
    };

    #manejarDragEnter = (evento) => {
        const celda = evento.target.closest("[data-celda]");
        celda?.classList.add("tablero__celda--en-sobrevuelo");
    };

    #manejarDragLeave = (evento) => {
        const celda = evento.target.closest("[data-celda]");
        celda?.classList.remove("tablero__celda--en-sobrevuelo");
    };

    #manejarDrop = (evento) => {
        const celdaDestino = evento.target.closest("[data-celda]");
        if (!celdaDestino) {
            return;
        }
        // Evita que algunos navegadores hagan una redirección al soltar.
        evento.preventDefault();
        celdaDestino.classList.remove("tablero__celda--en-sobrevuelo");

        const datos = evento.dataTransfer.getData("application/json");
        if (!datos) {
            return;
        }
        const { fila: filaOrigen, columna: columnaOrigen } = JSON.parse(datos);
        const filaDestino = Number(celdaDestino.dataset.fila);
        const columnaDestino = Number(celdaDestino.dataset.columna);
        this.#alSolicitarIntercambio(filaOrigen, columnaOrigen, filaDestino, columnaDestino);
    };

    #manejarClick = (evento) => {
        const celda = evento.target.closest("[data-celda]");
        if (!celda) {
            return;
        }
        this.#seleccionarOIntercambiar(celda);
    };

    #manejarKeydown = (evento) => {
        if (evento.key !== "Enter" && evento.key !== " ") {
            return;
        }
        const celda = evento.target.closest("[data-celda]");
        if (!celda) {
            return;
        }
        evento.preventDefault();
        this.#seleccionarOIntercambiar(celda);
    };

    #seleccionarOIntercambiar(celda) {
        if (!this.#celdaSeleccionada) {
            this.#celdaSeleccionada = celda;
            celda.classList.add("tablero__celda--seleccionada");
            return;
        }

        if (this.#celdaSeleccionada === celda) {
            celda.classList.remove("tablero__celda--seleccionada");
            this.#celdaSeleccionada = null;
            return;
        }

        const filaOrigen = Number(this.#celdaSeleccionada.dataset.fila);
        const columnaOrigen = Number(this.#celdaSeleccionada.dataset.columna);
        const filaDestino = Number(celda.dataset.fila);
        const columnaDestino = Number(celda.dataset.columna);

        this.#celdaSeleccionada.classList.remove("tablero__celda--seleccionada");
        this.#celdaSeleccionada = null;

        this.#alSolicitarIntercambio(filaOrigen, columnaOrigen, filaDestino, columnaDestino);
    }
}

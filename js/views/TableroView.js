// TableroView.js — vista
//
// Pinta el tablero (una rejilla CSS Grid de N×N celdas) y traduce la
// interacción del usuario — arrastrar y soltar, o seleccionar con teclado —
// en coordenadas de origen/destino. Es la ÚNICA vista que conoce el Drag &
// Drop y la ÚNICA que lee atributos `data-*` del tablero.
//
// No decide si un movimiento es válido ni comprueba la victoria: eso es
// responsabilidad del modelo. Esta vista solo recoge (fila, columna) y se
// las pasa al controlador a través del callback `alSolicitarIntercambio`.

export class TableroView {
    #contenedor;
    #elementoEstado;
    #alSolicitarIntercambio;
    /** Celda marcada como origen por la alternativa de teclado (null si no hay ninguna). */
    #celdaSeleccionada = null;

    /**
     * @param {HTMLElement} contenedor - El elemento `[data-tablero]`.
     * @param {HTMLElement} elementoEstado - Elemento `aria-live` donde se
     *   anuncia la victoria para lectores de pantalla.
     * @param {{alSolicitarIntercambio: (f1:number,c1:number,f2:number,c2:number)=>void}} callbacks
     */
    constructor(contenedor, elementoEstado, { alSolicitarIntercambio }) {
        this.#contenedor = contenedor;
        this.#elementoEstado = elementoEstado;
        this.#alSolicitarIntercambio = alSolicitarIntercambio;

        // Los tres eventos imprescindibles del contrato de Drag & Drop:
        // dragstart en el origen, dragover y drop en el destino.
        this.#contenedor.addEventListener("dragstart", this.#manejarDragStart);
        this.#contenedor.addEventListener("dragend", this.#manejarDragEnd);
        this.#contenedor.addEventListener("dragover", this.#manejarDragOver);
        this.#contenedor.addEventListener("dragenter", this.#manejarDragEnter);
        this.#contenedor.addEventListener("dragleave", this.#manejarDragLeave);
        this.#contenedor.addEventListener("drop", this.#manejarDrop);
        // Alternativa accesible sin ratón: clic o Enter/Espacio en origen y luego destino.
        this.#contenedor.addEventListener("click", this.#manejarClick);
        this.#contenedor.addEventListener("keydown", this.#manejarKeydown);
    }

    /**
     * Vuelca el estado del modelo en el DOM: borra el tablero anterior y
     * crea una celda y una ficha por cada posición de la matriz. Se llama
     * en cada "cambio" del modelo (nueva partida o intercambio).
     * @param {import("../models/Tablero.js").Tablero} tablero
     * @param {import("../models/Configuracion.js").Configuracion} configuracion
     * @param {boolean} resuelto
     */
    pintar(tablero, configuracion, resuelto) {
        this.#celdaSeleccionada = null;
        // Única escritura permitida sobre .style desde JS: actualiza la
        // custom property que CSS usa para fijar el número de columnas del
        // Grid (ver layout.css). Nunca se toca gridTemplateColumns directamente.
        this.#contenedor.style.setProperty("--n", tablero.n);
        this.#actualizarModificadores(configuracion, resuelto);
        this.#contenedor.textContent = "";

        tablero.forEachCelda((ficha, fila, columna) => {
            const celda = document.createElement("div");
            celda.classList.add("tablero__celda");
            // Anclajes data-* que identifican la celda: el JS nunca busca
            // por id ni por clase de estilo, solo por estos atributos.
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

    /**
     * Aplica las clases modificadoras del tablero: tamaño de ficha, paleta
     * de color y el aviso visual de victoria. Siempre con classList, nunca
     * con `.style`.
     */
    #actualizarModificadores(configuracion, resuelto) {
        this.#contenedor.classList.remove(
            "tablero--pequena",
            "tablero--mediana",
            "tablero--grande",
            "tablero--paleta-violeta",
            "tablero--paleta-terracota",
            "tablero--resuelto"
        );
        this.#contenedor.classList.add(`tablero--${configuracion.tamanoFicha}`);
        if (configuracion.paleta === "violeta") {
            this.#contenedor.classList.add("tablero--paleta-violeta");
        } else if (configuracion.paleta === "terracota") {
            this.#contenedor.classList.add("tablero--paleta-terracota");
        }
        if (resuelto) {
            this.#contenedor.classList.add("tablero--resuelto");
        }
    }

    /**
     * Al empezar a arrastrar una ficha, se guardan en `dataTransfer` las
     * COORDENADAS de su celda (nunca el elemento del DOM ni la ficha en
     * sí): es lo único que viaja de origen a destino en el Drag & Drop.
     */
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

    /** Quita el estado visual de "en arrastre" al soltar, en cualquier destino (válido o no). */
    #manejarDragEnd = (evento) => {
        const fichaElemento = evento.target.closest("[data-ficha]");
        fichaElemento?.classList.remove("ficha--en-arrastre");
    };

    /**
     * `dragover` debe llamar a `preventDefault()`: sin ella el navegador
     * no permite el `drop` sobre la celda. Es la causa más común de que el
     * Drag & Drop "no funcione".
     */
    #manejarDragOver = (evento) => {
        const celda = evento.target.closest("[data-celda]");
        if (!celda) {
            return;
        }
        evento.preventDefault();
    };

    /** Marca la celda bajo el cursor como posible destino (feedback visual de sobrevuelo). */
    #manejarDragEnter = (evento) => {
        const celda = evento.target.closest("[data-celda]");
        celda?.classList.add("tablero__celda--en-sobrevuelo");
    };

    /** Quita la marca de sobrevuelo al salir de la celda sin soltar. */
    #manejarDragLeave = (evento) => {
        const celda = evento.target.closest("[data-celda]");
        celda?.classList.remove("tablero__celda--en-sobrevuelo");
    };

    /**
     * Al soltar sobre una celda: lee las coordenadas de origen que viajaban
     * en `dataTransfer`, las coordenadas de destino del propio elemento, y
     * delega el intercambio en el controlador. `preventDefault()` evita que
     * algunos navegadores interpreten el drop como una navegación.
     */
    #manejarDrop = (evento) => {
        const celdaDestino = evento.target.closest("[data-celda]");
        if (!celdaDestino) {
            return;
        }
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

    /** Clic con ratón sobre una celda: mismo camino que la selección por teclado. */
    #manejarClick = (evento) => {
        const celda = evento.target.closest("[data-celda]");
        if (!celda) {
            return;
        }
        this.#seleccionarOIntercambiar(celda);
    };

    /**
     * Alternativa de teclado al Drag & Drop (obligatoria: el arrastre no es
     * accesible sin ratón). Enter o Espacio sobre una celda la selecciona
     * como origen; repetir la operación sobre otra celda la selecciona como
     * destino y dispara el intercambio.
     */
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

    /**
     * Lógica compartida por clic y teclado: la primera celda pulsada se
     * marca como origen (clase `--seleccionada`); pulsar la misma celda la
     * deselecciona; pulsar una segunda celda distinta dispara el
     * intercambio y limpia la selección.
     * @param {HTMLElement} celda
     */
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

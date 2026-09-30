// app.js — composition root: instancia las piezas, las conecta y arranca. Sin lógica.

import { Configuracion } from "./models/Configuracion.js";
import { TableroModel } from "./models/TableroModel.js";
import { TableroView } from "./views/TableroView.js";
import { ControlesView } from "./views/ControlesView.js";
import { AyudaView } from "./views/AyudaView.js";
import { AppController } from "./controllers/AppController.js";

function arrancar() {
    const contenedorTablero = document.querySelector("[data-tablero]");
    const elementoEstado = document.querySelector("[data-estado]");
    const contenedorControles = document.querySelector("[data-controles]");
    const contenedorAyuda = document.querySelector("[data-ayuda]");
    const botonAbrirAyuda = contenedorControles.querySelector("[data-accion='abrir-ayuda']");

    const configuracion = new Configuracion();
    const modelo = new TableroModel(configuracion.n);

    let controlador;

    const tableroView = new TableroView(contenedorTablero, elementoEstado, {
        alSolicitarIntercambio: (fila1, columna1, fila2, columna2) =>
            controlador.solicitarIntercambio(fila1, columna1, fila2, columna2),
    });

    const ayudaView = new AyudaView(contenedorAyuda, botonAbrirAyuda, {
        alCerrar: () => controlador.cerrarAyuda(),
    });

    const controlesView = new ControlesView(contenedorControles, {
        alPedirNuevaPartida: () => controlador.nuevaPartida(),
        alCambiarN: (n) => controlador.cambiarN(n),
        alCambiarTamano: (tamano) => controlador.cambiarTamanoFicha(tamano),
        alCambiarAspecto: () => controlador.cambiarAspecto(),
        alAbrirAyuda: () => controlador.abrirAyuda(),
    });

    controlador = new AppController({
        configuracion,
        modelo,
        tableroView,
        controlesView,
        ayudaView,
    });

    controlador.iniciar();
}

try {
    arrancar();
} catch (error) {
    console.error("No se pudo iniciar el tablero:", error);
}

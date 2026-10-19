// app.js — composition root
//
// Único `<script type="module">` cargado desde index.html. Su trabajo es
// exclusivamente "fontanería": localizar los elementos del DOM relevantes,
// instanciar modelo, vistas y controlador, conectarlos entre sí mediante
// callbacks, y arrancar. No contiene ninguna regla del juego ni decide nada
// por sí mismo — eso vive en models/ y controllers/.

import { Configuracion } from "./models/Configuracion.js";
import { TableroModel } from "./models/TableroModel.js";
import { TableroView } from "./views/TableroView.js";
import { CabeceraView } from "./views/CabeceraView.js";
import { AjustesView } from "./views/AjustesView.js";
import { AyudaView } from "./views/AyudaView.js";
import { AppController } from "./controllers/AppController.js";

/**
 * Localiza los elementos del DOM, crea las piezas MVC y las conecta.
 *
 * Las vistas se construyen ANTES que el controlador porque necesitan sus
 * callbacks ya en el constructor (para enlazar los `addEventListener`), y el
 * controlador aún no existe en ese momento. Se resuelve con la variable
 * `controlador` capturada por clausura: los callbacks son funciones flecha
 * que la invocan en el momento del evento, no en el momento de la
 * declaración, así que para entonces `controlador` ya está asignado.
 */
function arrancar() {
    // Todos los elementos se buscan por atributos data-*, nunca por id ni por clase.
    const contenedorTablero = document.querySelector("[data-tablero]");
    const elementoEstado = document.querySelector("[data-estado]");
    const cabecera = document.querySelector("[data-cabecera]");

    const contenedorAyuda = document.querySelector("[data-ayuda]");
    const respaldoAyuda = document.querySelector("[data-ayuda-respaldo]");
    const botonAbrirAyuda = document.querySelector("[data-accion='abrir-ayuda']");

    const contenedorAjustes = document.querySelector("[data-controles]");
    const respaldoAjustes = document.querySelector("[data-ajustes-respaldo]");
    const botonAbrirAjustes = document.querySelector("[data-accion='abrir-ajustes']");

    const configuracion = new Configuracion();
    const modelo = new TableroModel(configuracion.n);

    let controlador;

    const tableroView = new TableroView(contenedorTablero, elementoEstado, {
        alSolicitarIntercambio: (fila1, columna1, fila2, columna2) =>
            controlador.solicitarIntercambio(fila1, columna1, fila2, columna2),
    });

    const cabeceraView = new CabeceraView(cabecera, {
        alReiniciar: () => controlador.reiniciar(),
        alAbrirAyuda: () => controlador.abrirAyuda(),
        alAbrirAjustes: () => controlador.abrirAjustes(),
    });

    const ayudaView = new AyudaView(contenedorAyuda, respaldoAyuda, botonAbrirAyuda, {
        alCerrar: () => controlador.cerrarAyuda(),
    });

    const ajustesView = new AjustesView(contenedorAjustes, respaldoAjustes, botonAbrirAjustes, {
        alCambiarN: (n) => controlador.cambiarN(n),
        alCambiarTamano: (tamano) => controlador.cambiarTamanoFicha(tamano),
        alCambiarPaleta: (paleta) => controlador.cambiarPaleta(paleta),
        alCerrar: () => controlador.cerrarAjustes(),
    });

    controlador = new AppController({
        configuracion,
        modelo,
        tableroView,
        cabeceraView,
        ajustesView,
        ayudaView,
    });

    controlador.iniciar();
}

try {
    arrancar();
} catch (error) {
    // Único console.log/error permitido fuera de contexto de depuración:
    // captura un fallo de arranque (p. ej. un selector que no encontró su
    // elemento) para que no quede en silencio en consola.
    console.error("No se pudo iniciar el tablero:", error);
}

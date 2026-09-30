# AGENTS.md — Reglas de desarrollo del proyecto

Instrucciones obligatorias para cualquier agente que trabaje en este repositorio.
El enunciado y los objetivos están en [README.md](README.md); aquí van las **normas** de desarrollo.
Ante un conflicto entre lo que hace el código y lo que dice este documento, manda este documento.
Ante un conflicto entre este documento y el enunciado, manda el enunciado.

## Contexto en una línea

Juego de fichas sobre un tablero NxN, práctica de Interacción Persona-Ordenador. HTML + CSS + JavaScript
Vanilla, patrón MVC. **Sin dependencias, sin framework, sin build.** El proyecto se evalúa por la calidad de
la interfaz (diseño cromático, tipográfico y espacial), por el uso correcto de Drag & Drop y por la limpieza
de la arquitectura.

## Los cuatro ejes que el enunciado evalúa explícitamente

Todo lo demás es secundario frente a esto. Cada uno tiene su sección más abajo:

1. **Composición con Flexbox y Grid**, eligiendo el sistema adecuado en cada nodo (unidimensional frente a
   bidimensional). El tablero es Grid; no se negocia.
2. **Interacción con la API Drag & Drop y `dataTransfer`** para mover las fichas.
3. **Selección desde JS por atributos `data-*`**, nunca por clase de estilo ni por `id`.
4. **`position` justificado** para la asistencia al usuario (la ayuda sobre la mecánica del juego).

---

## Prohibiciones absolutas

Estas reglas vienen del temario de la asignatura. Incumplir cualquiera invalida el trabajo:

| Nunca | Siempre |
|---|---|
| `var` | `const`, y `let` solo si hay reasignación |
| `onclick`, `ondragstart` u otros atributos de evento en el HTML | `addEventListener` con manejador nombrado |
| `elemento.style.loQueSea = …` | `classList.add/remove/toggle` |
| `innerHTML` con datos | `createElement` + `textContent` |
| Nombres de color (`red`), `#hex` o `rgb()` en componentes | `hsl()` parametrizado desde `:root` |
| Valores de color, tamaño o espacio sueltos en un componente | `var(--variable)` declarada en `variables.css` |
| `px` (salvo el grosor de bordes finos) | `rem`/`em` en texto; `%`, `vh`, `clamp()`, `min()` en contenedores |
| Selectores de `id` o `!important` en CSS | Clases BEM |
| `float` o `position` para maquetar | Grid y Flexbox |
| Añadir librerías, CDN, npm o pasos de compilación | Plataforma web nativa |

Cualquier excepción a la regla del `px` se documenta aquí, en esta misma sección, en el mismo commit que la
introduce.

---

## Arquitectura: qué puede hacer cada capa

```
Vista ──eventos──▶ Controlador ──llamadas──▶ Modelo
  ▲                     │                       │
  └──órdenes de pintado─┘◀──eventos (observador)┘
```

- **`js/models/`** — estado del tablero y reglas del juego. **No puede** tocar el DOM, ni importar vistas, ni
  conocer `document`, ni saber nada de Drag & Drop. Avisa de los cambios emitiendo eventos. **Debe poder
  ejecutarse en Node**: es como se prueban la generación resoluble y la condición de victoria.
- **`js/views/`** — leen y escriben el DOM, escuchan eventos (incluidos los de arrastre) y pintan.
  **No pueden** contener reglas del juego, ni decidir si un movimiento es válido, ni hablar con otra vista.
- **`js/controllers/`** — el único punto donde vistas y modelo se encuentran. **No manipula el DOM.**
- **`js/app.js`** — *composition root*: instancia las piezas, las conecta y arranca. Nada de lógica.

Regla práctica: si aparece `document` fuera de `js/views/`, está mal colocado. Si aparece `dataTransfer` fuera
de `js/views/`, también.

### Estructura de ficheros

```
ipo2627_panama_tablero/
├── index.html
├── css/
│   ├── reset.css          Reset unificado
│   ├── variables.css      :root — paleta, tipografía, escalas
│   ├── layout.css         Composición (Grid y Flexbox)
│   └── components.css     Bloques BEM
└── js/
    ├── app.js             Punto de entrada
    ├── models/            Ficha, Tablero, TableroModel, Configuracion
    ├── views/             TableroView, ControlesView, AyudaView
    └── controllers/       AppController
```

El orden de los CSS en el `<head>` es fijo: `reset` → `variables` → `layout` → `components`. Un solo
`<script type="module" src="js/app.js">` en el `<head>`; los demás módulos los importa él.

---

## Reglas del dominio (invariantes del juego)

Estas reglas viven **en el modelo** y son las que hay que probar. Ninguna vista puede reimplementarlas.

- **Tablero**: cuadrado NxN con **N ≥ 3**. Toda entrada de N se valida; por debajo de 3 se rechaza.
- **Fichas**: exactamente **3 tipos**, distinguibles **por forma y por color a la vez**. Nunca solo por color
  —hay usuarios que no distinguen colores—, y nunca solo por forma.
- **Movimiento**: el jugador **intercambia** el contenido de dos celdas. Un intercambio nunca crea ni destruye
  fichas.
- **Victoria**: el tablero está resuelto cuando **cada fila contiene fichas de un único tipo**. Fíjate en que
  no se exige que las filas tengan tipos distintos entre sí.
- **Tablero inicial resoluble** — la regla más importante y la que más fácil se incumple: como el movimiento
  es un intercambio, el **multiconjunto de fichas es invariante**. Un reparto aleatorio sin más puede ser
  irresoluble. Por tanto el tablero de partida se genera **siempre** así:
  1. Se construye un tablero **ya resuelto** (cada fila de un solo tipo).
  2. Se baraja aplicando **únicamente intercambios** de celdas.

  Así la resolubilidad está garantizada por construcción, no por comprobación. **Nunca** generes el tablero
  rellenando celdas al azar.
- Hay que **evitar entregar un tablero ya resuelto**: tras barajar, si el tablero cumple la victoria, se
  vuelve a barajar.
- **Cambiar N, el tamaño o el aspecto de las fichas crea una partida nueva.** No se conserva la disposición
  anterior: lo dice el enunciado.

---

## Drag & Drop: el contrato

Se sigue el patrón de `buenas-practicas/www-drag&drop/`. Vive **solo** en la vista del tablero.

**Los tres eventos imprescindibles** (`dragstart` en el origen, `dragover` y `drop` en el destino):

```js
origen.addEventListener("dragstart", comienzoArrastre);
destino.addEventListener("dragover", sobrevolandoDestino);
destino.addEventListener("drop", soltadoEnDestino);
```

**Las dos llamadas que no se pueden olvidar**, y que son pregunta segura del profesor:

- `e.preventDefault()` en **`dragover`** — sin ella el navegador **no permite** el `drop`. Es la causa número
  uno de que «el drag and drop no funcione».
- `e.preventDefault()` en **`drop`** — evita que algunos navegadores hagan una redirección al soltar.

**`dataTransfer`**: lo que viaja son **las coordenadas de la celda de origen**, nunca el elemento del DOM ni
la ficha:

```js
// dragstart
e.dataTransfer.setData("application/json", JSON.stringify({ fila, columna }));

// drop
const { fila, columna } = JSON.parse(e.dataTransfer.getData("application/json"));
```

**Quién decide qué**: la vista recoge las coordenadas de origen y destino y se las pasa al controlador; **el
modelo** es quien valida e intercambia. La vista no mueve fichas por su cuenta ni comprueba la victoria.

**Estados visuales** (`dragstart`/`dragend`, `dragenter`/`dragleave`): se reflejan **con clases
modificadoras** —`--en-arrastre`, `--en-sobrevuelo`—, nunca tocando `.style`. Son importantes para la
usabilidad: el usuario tiene que ver qué está arrastrando y sobre qué celda va a soltar.

**Alternativa sin arrastre — obligatoria**: Drag & Drop no es accesible por teclado. Debe existir un camino
equivalente (pulsar la celda de origen y luego la de destino, con la selección marcada por una clase y
accesible con `Enter`/`Espacio`). La asignatura evalúa usabilidad, y dejar el juego injugable sin ratón es un
fallo de diseño, no un extra.

---

## Selección por atributos `data-*`

Obligatorio, y es uno de los objetivos del enunciado. El JS **nunca** busca por clase de estilo ni por `id`:

```js
const tablero = document.querySelector("[data-tablero]");
const celdas = tablero.querySelectorAll("[data-celda]");
const fila = celda.dataset.fila;        // lee data-fila
```

Anclajes mínimos: `data-tablero`, `data-celda`, `data-fila`, `data-columna`, `data-tipo` (el tipo de ficha),
`data-controles`, `data-ayuda`. Los nombres van en español, en kebab-case, y se leen con `dataset`.

**Por qué**: las clases pertenecen al diseño. Si se renombra una clase por motivos visuales, el JavaScript no
debe enterarse. Los `data-*` son el contrato entre HTML y JS.

---

## Composición: elegir bien Grid o Flexbox

El enunciado evalúa «selección de composiciones apropiadas (unidimensional, bidimensional)». El criterio:

| Nodo | Sistema | Por qué |
|---|---|---|
| **El tablero** | **Grid** | Es bidimensional por definición. `grid-template-columns: repeat(var(--n), 1fr)` con `aspect-ratio: 1` en las celdas |
| Estructura de la página | Grid | Es una plantilla de filas y columnas |
| Barras de controles, grupos de botones, cabecera, pie | Flexbox | Son unidimensionales: cosas en una línea |
| Contenido de una celda | Flexbox | Centrar la ficha dentro de la celda |
| Texto corrido de la ayuda | Flujo normal | Son hojas de texto (`p`, `li`) |

**Maquetar el tablero con Flexbox y `wrap` se considera un error**: es una rejilla, y fingirla en una
dimensión rompe la correspondencia entre el modelo (matriz NxN) y la vista.

La **N es variable**, así que el número de columnas se pasa al CSS con una custom property desde el JS. Esta
es la **única** escritura permitida desde JavaScript sobre estilos, y se hace sobre la variable, no sobre la
propiedad:

```js
tablero.style.setProperty("--n", n);   // permitido: actualiza el CSSOM
tablero.style.gridTemplateColumns = …; // PROHIBIDO
```

El **tamaño de ficha** (pequeña, mediana, grande) se resuelve igual: tres clases modificadoras o una variable
`--tamano-ficha` en `:root`, nunca calculando píxeles en JS.

---

## `position`: aquí sí, y justificado

A diferencia de otras prácticas, el enunciado **pide** posicionamiento para «el diseño de la asistencia al
usuario». Es decir: la ayuda sobre la mecánica del juego (panel flotante, *tooltip* o capa superpuesta).

Reglas:

- Se usa `position` **solo** donde algo deba salir del flujo y flotar sobre el resto: la ayuda, y si acaso un
  aviso de victoria.
- El patrón es **`relative` en el ancla + `absolute` en el flotante**, con `inset-*` lógicos
  (`inset-block-start`, `inset-inline`) y `z-index` explícito.
- **Nunca** se usa `position` para colocar el tablero, las celdas, las fichas ni los controles: eso es Grid y
  Flexbox.
- Hay que saber justificarlo en la defensa: «lo posiciono porque debe flotar sobre el tablero sin desplazarlo;
  todo lo demás compone con Grid o Flex».

---

## Convenciones de código

- **Idioma**: todo el dominio y la API interna, en español (`Tablero`, `Ficha`, `intercambiar`, `barajar`,
  `estaResuelto`). Comentarios en español, y solo para explicar **por qué**, nunca qué hace la línea
  siguiente.
- **Módulos ES nativos** con extensión explícita en los imports (`"./Tablero.js"`). Un fichero, una clase.
- **Indentación**: 2 espacios en JS y HTML, 4 en CSS (respeta lo que ya hay en cada fichero).
- El estado del juego vive **solo** en el modelo. Las vistas guardan como mucho lo suyo (qué celda está
  marcada como origen), nunca la disposición de las fichas.
- Nada de `console.log` fuera del `catch` de arranque.
- Las reglas del juego se escriben de forma **comprobable sin navegador**: funciones que reciben y devuelven
  datos, no que leen el DOM.

---

## Convenciones de CSS

- Orden de cascada fijo en el `<head>`: `reset` → `variables` → `layout` → `components`. No añadas más hojas
  sin una razón estructural; si la hay, enlázala en su sitio dentro de ese orden.
- `variables.css` es la **única** fuente de colores, tipografías, escalas y espacios. Un componente que
  necesita un valor nuevo declara antes la variable aquí.
- **La estrategia cromática se fija una sola vez y se declara en `:root`**, derivando todo de un tono base con
  `calc()`. Como hay exactamente **tres tipos de ficha**, una paleta **triádica**
  (`--tono`, `calc(var(--tono) + 120)`, `calc(var(--tono) + 240)`) encaja de forma natural y es fácil de
  defender; confírmalo con el equipo antes de escribirla. Lo que no es negociable: un solo punto de verdad,
  `hsl()` parametrizado y cero colores literales.
- **Tipografía**: dos familias contrastadas (o una con niveles de realce claramente distintos), declaradas en
  `:root`. Jerarquía intencionada entre título, controles y ayuda.
- **BEM** (`bloque__elemento--modificador`) con **anidamiento nativo**: los elementos de un bloque se escriben
  dentro de la llave de ese bloque.
- Los estados son **clases modificadoras** (`--en-arrastre`, `--en-sobrevuelo`, `--seleccionada`,
  `--resuelto`), aplicadas desde el JS.

---

## Criterios de diseño que no se pueden degradar

- **Proximidad (Gestalt)**: las celdas del tablero se perciben como una unidad; los controles, agrupados por
  función y separados del tablero. El hueco entre grupos debe ser claramente mayor que el hueco dentro de un
  grupo.
- **Semejanza**: las fichas del mismo tipo son idénticas en forma y color; lo que es control se ve como
  control y lo que es tablero se ve como tablero.
- **Figura y fondo**: el tablero es la figura; controles y ayuda, servicio.
- **Región común**: el tablero tiene un límite visual propio (fondo o borde) que lo separa del resto.
- **Retroalimentación**: el usuario debe ver en todo momento qué arrastra, dónde puede soltar y cuándo ha
  ganado. Un juego que no responde al movimiento es un fallo de usabilidad, no un detalle.
- **Accesibilidad**: contraste ≥ 4.5:1, foco visible, juego completo por teclado, controles con etiqueta
  asociada, y el tipo de ficha nunca codificado solo con color.

---

## Datos y configuración

No hay fichero de datos: el tablero se **genera**. La configuración de la partida —N, tamaño de ficha, forma y
color— es **estado del modelo**, no constantes repartidas por el código. Los valores por defecto y los
permitidos (por ejemplo, las tres magnitudes de ficha) se declaran en un único sitio del modelo.

Si en algún momento se externaliza la configuración a un JSON, se hace **detrás de una abstracción** que el
modelo consuma, para no acoplarlo al origen de los datos.

---

## Antes de dar algo por terminado

```bash
# Sin antipatrones en JS/HTML (debe salir vacío)
grep -rn "var \|on[a-z]*=\"\|\.style\.\|innerHTML" js/ index.html

# Sin px ni colores literales en CSS (solo las excepciones documentadas arriba)
grep -rn "px\|rgb(\|#[0-9a-fA-F]\{3,6\}" css/

# El preventDefault de dragover tiene que estar
grep -rn "preventDefault" js/views/
```

Y comprueba en el navegador, sirviendo la aplicación por HTTP (`python -m http.server 8000`), nunca con
`file://`:

1. Carga sin errores en consola.
2. Nueva partida: el tablero aparece desordenado pero **resoluble**, y no ya resuelto.
3. Cambiar N a 3, a 5 y a un valor inválido: el tablero se regenera y el valor inválido se rechaza.
4. Cambiar tamaño de ficha y aspecto: se regenera la partida.
5. Arrastrar una ficha sobre otra celda: se intercambian, y se ve el estado de arrastre y de sobrevuelo.
6. Completar una partida: se detecta la victoria cuando cada fila es de un solo tipo.
7. Jugar una partida entera **sin ratón**, solo con teclado.
8. Abrir la ayuda: flota sobre el contenido sin desplazarlo.
9. Estrechar la ventana: sin scroll horizontal y el tablero sigue cuadrado.

La lógica del modelo se prueba sin navegador ejecutándola con Node: generar cien tableros y comprobar que
todos son resolubles (mismo multiconjunto de fichas que un tablero resuelto), que ninguno nace ya resuelto y
que `estaResuelto` detecta bien la victoria. Es la forma más rápida de validar cambios en las reglas.

---

## Alcance

Es una práctica de asignatura evaluada por su interfaz y su arquitectura. **No añadas funcionalidad que no se
haya pedido**: ni backend, ni persistencia de partidas, ni contador de puntuaciones, ni animaciones
elaboradas, ni modo oscuro. Si detectas algo que mejoraría el resultado, propónlo antes de implementarlo.

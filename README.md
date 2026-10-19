# Proyecto Tablero

El proyecto consiste en una aplicación que implementa un juego de fichas dispuestas en un tablero.

## Qué es esta aplicación, explicado sin tecnicismos

Es un pequeño juego de lógica que se juega en el navegador, sin instalar nada: se abre una página y
aparece un tablero cuadrado lleno de fichas de colores.

**El objetivo** es ordenar el tablero para que, en cada fila, todas las fichas sean del mismo tipo. Hay
tres tipos de fichas y cada uno se reconoce por dos pistas a la vez —su forma y su color—, para que el
juego se pueda jugar igual aunque no se distingan bien los colores.

**Cómo se juega:**
- El único movimiento permitido es intercambiar el sitio de dos fichas cualesquiera del tablero.
- Con el ratón: se arrastra una ficha y se suelta encima de otra; las dos cambian de sitio.
- Sin ratón, solo con el teclado: se mueve el foco con la tecla Tab hasta la ficha de origen, se pulsa
  Enter o Espacio, se hace lo mismo sobre la ficha de destino, y ambas se intercambian igual que con el
  ratón. Esto garantiza que cualquier persona pueda completar la partida aunque no pueda (o no quiera)
  usar un ratón.
- Arriba a la derecha hay dos contadores: cuántos movimientos se han hecho y cuánto tiempo lleva la
  partida en marcha. Son solo informativos, no afectan a si se gana o se pierde.
- Cuando cada fila del tablero queda con un único tipo de ficha, el tablero lo señala como resuelto y
  aparece un mensaje de victoria.

**Cada partida nueva se reparte "a propósito":** el tablero nunca se llena al azar sin más, porque eso
podría generar un reparto imposible de resolver. En su lugar, siempre se parte de un tablero ya ordenado
y se desordena moviendo fichas de sitio (nunca añadiendo ni quitando ninguna), así que toda partida que
empieza se puede terminar. Tampoco se entrega nunca una partida que ya esté resuelta desde el principio:
si el desorden sale "ya ganado" por casualidad, se vuelve a desordenar.

**Qué se puede personalizar** (icono de engranaje, arriba a la derecha):
- El tamaño del tablero: de 3×3 hasta el tamaño que se quiera (nunca menos de 3×3).
- El tamaño con el que se dibujan las fichas: pequeña, mediana o grande.
- La paleta de color de las fichas, manteniendo siempre las mismas tres formas.

Cualquiera de estos cambios empieza una partida completamente nueva: no se conserva el progreso de la
partida anterior, porque cambiar el tablero o las fichas es, en la práctica, empezar a jugar otra vez.

**Ayuda dentro de la propia aplicación:** el icono con el signo de interrogación abre un panel flotante
con las instrucciones del juego (objetivo, cómo mover fichas, cómo personalizar la partida) sin necesidad
de salir de la pantalla de juego ni perder la partida en curso.

**Pensado para que lo pueda usar cualquiera:** los textos tienen suficiente contraste para leerse bien,
se puede jugar entera solo con el teclado, el elemento que tiene el foco en cada momento se ve con
claridad, y como ya se ha dicho, el tipo de cada ficha nunca depende solo del color.

# Objetivos

El proyecto será una aplicación web usando HTML, CSS y JS nativos, sin bibliotecas ni frameworks auxiliares.

Los objetivos del proyecto son: 
- Composición apoyándada en Flexbox & Grid
- Interacción mediante la API `Drag & Drop` (y `dataTransfer`) para el movimiento de fichas. 
- Selección desde JS de elementos HTML mediante atributos `data-*`
- Posicionamiento `position` para el diseño de la asistencia al usuario


# Descripción

El sistema interactúa con un único actor que es el usuario encargado de jugar al juego. 

El tablero donde se practica el juego es una estructura cuadrada NxN con N>=3. En cada celda del tablero se muestra una única ficha, teniendo en cuenta que existen 3 tipos de fichas distinguibles por su forma y color. 

El sistema permitirá al jugador realizar las siguientes acciones:
- Comenzar una nueva partida (tablero inicial)
- Cambiar la dimensión N (con N>=3) del tablero NxN 
- Cambiar el tamaño de las fichas, admitiendo tres magnitudes: pequeña, mediana y grande.
- Modificar el aspecto - forma y color - de las fichas. Por ejemplo: las fichas podrían ser círculos, cuadrados, triángulos, etc.
- Obtener información sobre la mecánica del juego. 


La modificación de las características del tablero o las fichas supondrá la creación de un nuevo tablero de partida. 

La mecánica del juego es la siguiente:
- Comienzo: el tablero de partida consiste en una distribución de fichas aleatorias teniendo en cuenta que las fichas seleccionadas permita que el juego pueda concluir.
- Movimiento: el jugador podrá intercambiar las fichas situadas en dos celdas. 
- Fin: el tablero se completa cuando cada una de las filas del tablero contiene fichas del mismo tipo.


# Diseño

- La aplicación deberá estar implementada siguiendo un patrón MVC (_Model-View-Controller_) con objeto de clarificar y diferenciar las distintas responsabilidades. 
- Tanto la distribución del código de los ficheros como la propia organización de los ficheros incluidos en la carpeta del proyecto deberán facilitar la comprensión y el mantenimiento de la solución aportada. 


## Interacción 

La implementación de la interacción estará guiada para favorecer la usabilidad de la aplicación.

# Buenas prácticas HTML/CSS/JS

- Vinculación moderna de los componentes HTML, CSS y JS
- Etiquetado HTML semántico y moderno. 
- Estrategia de selectores CSS mantenible.
- Selección de composiciones apropiadas (unidimensional, bidmiensional)
- Aplicación justificada del posicionamiento. 
- Separación clara y organizada de los distintos aspectos estilísticos considerados: diseño cromático, tipográfico y espacial. Y cada uno estará cimentado en una sólida estrategia:
  - diseño cromático: monocromático, triádico, complementario, etc.
  - diseño tipográfico: dos fuentes contrastadas, una única fuente con niveles distintos de realce, etc.
  - diseño espacial: selección de unidades de medida y contenedores, principios de diseño `Gestalt`, etc. 


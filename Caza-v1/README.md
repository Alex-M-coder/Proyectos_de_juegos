# 🌌 Batalla Estelar: El Desafío Final

¡Bienvenido a **Batalla Estelar**, un electrizante videojuego arcade espacial diseñado en HTML5 Canvas con una estética retro neón premium! Toma el control de tu caza estelar, ábrete paso a través de múltiples sectores plagados de enjambres alienígenas, esquiva lluvias de meteoros y destruye a los colosales Jefes Nodriza en una batalla campal por el destino de la galaxia.

---

## 🚀 Características del Juego

- **Campaña de 10 Sectores Dinámicos:** Enfréntate a desafíos cambiantes a medida que avanzas en los cuadrantes espaciales:
  - **Sectores 1 al 3:** Invasión inicial y patrullas de reconocimiento.
  - **Sector 4:** Enjambre denso preparatorio para el comandante.
  - **Sector 5:** ⚔️ Enfrentamiento contra la **Nave Nodriza** (Jefe de Fase Media).
  - **Sector 6:** Tormentas erráticas de asteroides veloces.
  - **Sector 7:** Bloqueo coordinado en cuadrícula ("La Muralla").
  - **Sector 8:** 🛡️ Duelo contra los temibles **Guardianes Gemelos** en órbitas cruzadas.
  - **Sector 9:** Campo gravitatorio alrededor de un **Agujero Negro** central.
  - **Sector 10:** 🔥 **Batalla Final** contra el legendario *Emperador del Caos Estelar*.
- **Mecánica de Dash Táctico:** Desplázate a hipervelocidad de forma instantánea para esquivar proyectiles enemigos en situaciones límite (con un enfriamiento de 2 segundos).
- **Potenciador de Láser Doble (Double Laser Powerup):** Recoge núcleos de energía dorados caídos del enemigo para duplicar temporalmente tu potencia de fuego.
- **Sistema de Combo y Multiplicador:** Conecta bajas consecutivas rápidamente para aumentar tu multiplicador de puntuación y pulverizar récords.
- **Minimapa Radar en Tiempo Real:** Mantén controlado el cuadrante con el minimapa táctico holográfico en la esquina inferior derecha.
- **Efectos Visuales Premium:** Sacudida de pantalla (*screen shake*), efectos de cámara lenta (*slow motion*) al vencer a los jefes, estelas de partículas (*trail effect*) y distorsiones gravitatorias animadas.
- **Persistencia de Puntuación:** Registro local (`localStorage`) automático de victorias, derrotas y puntuación récord.

---

## 🎮 Controles del Teclado

| Tecla / Acción | Función |
| :--- | :--- |
| **`W` / `A` / `S` / `D`** o **⬅️ ➡️ ⬆️ ⬇️** | Movimiento de la Nave (Izquierda, Derecha, Arriba, Abajo) |
| **`Espacio`** o **`E`** | Disparar Láser de Plasma |
| **`Shift` (Mayús)** | **DASH:** Desplazamiento rápido en la dirección actual de movimiento |
| **`P`** o **`Escape`** | Pausar / Reanudar la misión |
| **`M`** | Silenciar / Activar la banda sonora y efectos de audio |

---

## 🛠️ Stack Tecnológico

El proyecto está desarrollado completamente utilizando tecnologías web puras (Vanilla Web Stack) para maximizar el rendimiento de dibujado y renderizado:

1. **HTML5 Canvas API:** Gestión del ciclo de dibujado (`requestAnimationFrame`), colisiones por máscara de círculos y rectángulos, físicas de partículas vectoriales y distorsiones visuales.
2. **CSS3 Premium Styling:** Diseño responsivo de overlays con desenfoque de fondo (*glassmorphism*), tipografía personalizada (`Orbitron` vía Google Fonts) y sombras neón pulsantes.
3. **Vanilla JavaScript (ES6+):** Programación orientada a objetos para efectos de partículas, controlador dinámico de entrada por teclado, lógica modular de audio y bucle de juego reactivo.

---

## 📁 Estructura de Archivos

```plaintext
Juegito/
├── index.html          # Interfaz principal, overlays HUD y contenedor de Canvas.
├── css/
│   └── styles.css      # Sistema de diseño con variables CSS, efectos neón y animación glassmorphism.
├── js/
│   ├── game.js         # Bucle del juego, físicas, IA enemiga, mecánicas de niveles y colisiones.
│   └── audio.js        # Motor de audio con sintetizador/reproductor web de efectos y música de fondo.
├── assets/
│   └── fondo.webp      # Textura espacial de fondo en alta resolución con scroll parallax.
├── .gitignore          # Archivo de exclusión de git para IDEs y temporales.
└── README.md           # Esta guía de usuario y documentación técnica.
```

---

## 🕹️ Cómo Ejecutar el Juego

Como el juego está desarrollado con tecnologías puras del lado del cliente, **no requiere ningún proceso de compilación**.

### Método Directo
1. Descarga o clona el repositorio.
2. Haz doble clic en [index.html](./index.html) para abrir el juego directamente en cualquier navegador web moderno (Chrome, Firefox, Edge, Safari).

### Método Servidor Local (Recomendado)
Para asegurar que el motor de audio y las cargas de recursos no tengan restricciones de directivas CORS según el navegador, se recomienda cargarlo a través de un servidor local:
- Si utilizas **VS Code**, puedes usar la extensión **Live Server** haciendo clic derecho sobre `index.html` y seleccionando `Open with Live Server`.
- Si tienes **Python** instalado, puedes iniciar un servidor ejecutando en consola desde la carpeta raíz del juego:
  ```bash
  python -m http.server 8000
  ```
  Y luego abre en tu navegador `http://localhost:8000`.

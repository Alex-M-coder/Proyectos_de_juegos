# 🕹️ Tetris Neon - Sincronía Cyberpunk

Una implementación moderna, fluida y visualmente impactante del clásico juego arcade **Tetris** utilizando tecnologías web nativas. Diseñado con una estética retro-cyberpunk y synthwave que resalta los bloques mediante colores neón vibrantes, efectos de brillo dinámicos y transiciones fluidas.

---

## 🎨 Características Destacadas

*   **Estética Neon Synthwave:** Colores HSL adaptados que brillan en la oscuridad, acompañados de un fondo de rejilla cibernética y un filtro opcional que simula las pantallas analógicas CRT.
*   **Proyección Fantasma (Ghost Piece):** Muestra de forma translúcida dónde caerá la pieza actual para permitir una planificación táctica de movimientos.
*   **Mecánica de Reserva (Hold Block):** Guarda una pieza presionando la tecla `C` o `Shift` para usarla estratégicamente en cualquier momento del juego.
*   **Efectos Dinámicos:** Partículas interactivas que explotan al completar líneas, sacudidas de pantalla al bloquear con fuerza o limpiar filas, y fogonazos de luz al realizar un *Tetris* (4 líneas a la vez).
*   **Síntesis de Audio Web API:** Todos los sonidos (giros, caídas, subida de nivel, game over, líneas completadas) se generan en tiempo real de forma algorítmica por el navegador, garantizando rendimiento instantáneo sin recurrir a recursos multimedia externos pesados.
*   **Progresión Dinámica:** La velocidad del juego aumenta conforme subes de nivel (cada 10 líneas despejadas).
*   **Puntuaciones Altas:** Conserva tu puntuación récord en la memoria local del navegador (`localStorage`).

---

## 🎮 Controles de Juego

Puedes controlar el juego usando el teclado físico de tu computadora:

| Tecla / Combinación | Acción |
| :--- | :--- |
| **`A` / `D` / `Flecha Izquierda / Derecha`** | Mover la pieza hacia los lados |
| **`W` / `Flecha Arriba`** | Rotar la pieza (incluye sistema de acomodación de paredes / Wall Kick) |
| **`S` / `Flecha Abajo`** | Caída suave (avanza más rápido e incrementa puntos) |
| **`Espacio (Space)`** | Caída rápida instantánea (bloquea la pieza inmediatamente con sacudida de pantalla) |
| **`C` / `Shift`** | Guardar la pieza actual en la zona de reserva / Intercambiar con la guardada |
| **`P`** | Pausar y reanudar la simulación |

---

## 🛠️ Estructura del Código

El juego está diseñado siguiendo estándares limpios y modulares sin dependencias externas:

```plaintext
tetris-v1/
├── index.html        # Estructura del juego, pantallas flotantes y HUD glassmorphism
├── css/
│   └── styles.css    # Paleta de colores neón, variables HSL, overlays y efectos de sacudida
├── js/
│   ├── game.js       # Bucle de animación (requestAnimationFrame), colisiones y partículas
│   └── audio.js      # Motor sintetizador de audio (Oscillators, Envelopes, Gain nodes)
└── README.md         # Documentación de las mecánicas
```

---

## 🚀 Cómo Ejecutar el Juego

1.  Abre una terminal y navega hasta la carpeta del proyecto:
    ```bash
    cd Proyectos_de_juegos/tetris-v1
    ```
2.  Dado que los módulos no dependen de imports estrictos que requieran CORS, puedes abrir el archivo `index.html` directamente en tu navegador preferido:
    ```bash
    # En Windows
    start index.html
    ```
    *O bien, sírvelo localmente con cualquier servidor HTTP ligero si lo prefieres:*
    ```bash
    npx http-server
    ```
3.  ¡Pulsa en **"INICIAR OPERACIÓN"** para empezar a jugar!

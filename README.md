# 🕹️ Catálogo de Proyectos de Juegos

¡Bienvenido al repositorio central de **Proyectos de Juegos**! Esta carpeta sirve como un portafolio y área de experimentación para el desarrollo de videojuegos independientes utilizando tecnologías web modernas, diseño vectorial, animaciones avanzadas y motores de renderizado optimizados.

---

## 📂 Directorio de Juegos Disponibles

A continuación se detallan los juegos creados en esta carpeta y sus especificaciones técnicas:

| Proyecto / Enlace | Título del Juego | Stack de Tecnologías | Características Clave |
| :--- | :--- | :--- | :--- |
| 🚀 [**Juegito**](./Juegito/README.md) | **Batalla Estelar: El Desafío Final** | HTML5 Canvas, Vanilla JS, Vanilla CSS, Web Audio API | Batallas espaciales, 10 niveles/sectores, jefes con múltiples fases de combate, sistema de combos, dash táctico, sacudidas de cámara y efectos de cámara lenta. |

---

## 🌟 Estándares y Organización del Repositorio

Para mantener el orden y la calidad del código en todos los proyectos futuros, se aconseja seguir las siguientes pautas de desarrollo:

### 1. Estructura de Carpetas Recomendada
Cada juego debe estar contenido en su propia subcarpeta con la estructura organizada de la siguiente manera:
```plaintext
Nombre_Del_Juego/
├── index.html        # Punto de entrada principal
├── css/              # Hojas de estilo y diseño visual
│   └── styles.css
├── js/               # Lógica del juego, físicas, entidades
│   ├── game.js
│   └── audio.js      # Opcional (motor de audio dedicado)
├── assets/           # Recursos estáticos (imágenes, audios, fuentes)
│   ├── images/
│   └── audio/
├── .gitignore        # Exclusiones locales de Git
└── README.md         # Documentación detallada del juego
```

### 2. Principios de Rendimiento en Web
- **Ciclo de Animación:** Utiliza siempre `requestAnimationFrame` en lugar de `setInterval` o `setTimeout` para el bucle principal de dibujado, garantizando una tasa de refresco adaptada al monitor del usuario (usualmente 60Hz o superior).
- **Control de Tiempo (Delta Time):** Para movimientos físicos e IA, calcula e integra un factor de escala de tiempo (multiplicador de frames) para evitar que la velocidad del juego dependa de la tasa de frames por segundo (FPS).
- **Limpieza de Memoria:** Destruye o elimina los objetos fuera de la pantalla (proyectiles, partículas, enemigos derrotados) para evitar fugas de memoria y degradación del rendimiento gráfico.

---

## ➕ Cómo Añadir un Nuevo Juego

Si deseas añadir una nueva entrega a este catálogo, sigue estos pasos:
1. Crea una nueva subcarpeta en `Proyectos_de_juegos/` (por ejemplo, `PingPong/` o `NeonRunner/`).
2. Sigue la estructura de archivos recomendada descrita en la sección anterior.
3. Copia un archivo `.gitignore` estándar para evitar subir dependencias y temporales.
4. Redacta un `README.md` dentro de la carpeta del juego con sus mecánicas, controles y cómo ejecutarlo.
5. Edita este archivo `README.md` general para añadir tu juego a la tabla del **Directorio de Juegos Disponibles**.

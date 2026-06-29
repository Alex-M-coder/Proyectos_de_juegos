/**
 * Tetris Neon - Lógica de juego, físicas de bloques, DAS/ARR, Lock Delay, Leaderboard y soporte móvil.
 */
class TetrisGame {
    constructor() {
        // Inicialización de Canvases
        this.canvas = document.getElementById('tetris-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.nextCanvas = document.getElementById('next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.holdCanvas = document.getElementById('hold-canvas');
        this.holdCtx = this.holdCanvas.getContext('2d');

        // Inicialización de Audio
        this.audio = new NeonAudio();

        // Configuración de la Matriz (10 columnas x 20 filas)
        this.ROWS = 20;
        this.COLS = 10;
        this.BLOCK_SIZE = 30; // Tamaño de cada bloque en píxeles

        // Estado del Juego
        this.board = [];
        this.score = 0;
        this.highscore = parseInt(localStorage.getItem('tetris_neon_highscore')) || 0;
        this.leaderboard = JSON.parse(localStorage.getItem('tetris_neon_leaderboard')) || [];
        this.lines = 0;
        this.level = 1;
        this.gameInterval = null;
        this.dropCounter = 0;
        this.lastTime = 0;
        this.isPaused = false;
        this.gameOverState = false;
        this.gameStarted = false;

        // Variables de Piezas
        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.hasHeldThisTurn = false;

        // Variables de DAS (Delayed Auto Shift) y ARR (Auto Repeat Rate)
        this.keysPressed = {};
        this.dasTimer = 0;
        this.arrTimer = 0;
        this.dasLimit = 170; // Retraso inicial para deslizar en ms
        this.arrLimit = 30;  // Velocidad de deslizamiento continuo en ms
        this.currentPressedDir = 0;
        this.softDropTimer = 0;

        // Variables de Lock Delay
        this.isLanded = false;
        this.lockDelayTimer = 0;
        this.lockDelayLimit = 500; // Tiempo de tolerancia al tocar el suelo en ms
        this.lockDelayResets = 0;
        this.lockDelayMaxResets = 15; // Límite de movimientos en el suelo para evitar deslizamiento infinito

        // Efectos Visuales
        this.particles = [];
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        this.flashTimer = 0;

        // Definición de las 7 piezas y sus colores de neón
        this.PIECES = {
            'I': {
                matrix: [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ],
                color: 'hsl(182, 100%, 50%)', // Cyan
                shadowColor: 'rgba(0, 243, 255, 0.6)'
            },
            'O': {
                matrix: [
                    [1, 1],
                    [1, 1]
                ],
                color: 'hsl(54, 100%, 50%)', // Amarillo
                shadowColor: 'rgba(255, 230, 0, 0.6)'
            },
            'T': {
                matrix: [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: 'hsl(280, 100%, 55%)', // Morado
                shadowColor: 'rgba(162, 0, 255, 0.6)'
            },
            'S': {
                matrix: [
                    [0, 1, 1],
                    [1, 1, 0],
                    [0, 0, 0]
                ],
                color: 'hsl(116, 100%, 50%)', // Verde
                shadowColor: 'rgba(0, 255, 26, 0.6)'
            },
            'Z': {
                matrix: [
                    [1, 1, 0],
                    [0, 1, 1],
                    [0, 0, 0]
                ],
                color: 'hsl(328, 100%, 54%)', // Rosa/Rojo
                shadowColor: 'rgba(253, 29, 134, 0.6)'
            },
            'J': {
                matrix: [
                    [1, 0, 0],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: 'hsl(220, 100%, 55%)', // Azul
                shadowColor: 'rgba(26, 85, 255, 0.6)'
            },
            'L': {
                matrix: [
                    [0, 0, 1],
                    [1, 1, 1],
                    [0, 0, 0]
                ],
                color: 'hsl(24, 100%, 50%)', // Naranja
                shadowColor: 'rgba(255, 102, 0, 0.6)'
            }
        };

        this.initDOM();
        this.resetStats();
    }

    /**
     * Vincula los elementos del DOM, controles de volumen, botones móviles y eventos de teclado.
     */
    initDOM() {
        // Pantallas Overlays
        this.overlayInicio = document.getElementById('overlay-inicio');
        this.overlayPausa = document.getElementById('overlay-pausa');
        this.overlayGameOver = document.getElementById('overlay-gameover');

        // Botones de overlays
        document.getElementById('btn-empezar').addEventListener('click', () => this.startGame());
        document.getElementById('btn-reanudar').addEventListener('click', () => this.togglePause());
        document.getElementById('btn-reiniciar-pausa').addEventListener('click', () => this.restartGame());
        document.getElementById('btn-reiniciar-fin').addEventListener('click', () => this.restartGame());
        document.getElementById('box-pausa').addEventListener('click', () => this.togglePause());
        
        // Control de volumen deslizante
        const volSlider = document.getElementById('volume-slider');
        volSlider.addEventListener('input', (e) => {
            const val = e.target.value / 100;
            this.audio.setVolume(val);
        });

        // Botón de silenciar/activar en el panel
        const btnMute = document.getElementById('box-mute');
        btnMute.addEventListener('click', () => {
            const isMuted = this.audio.toggleMute();
            btnMute.textContent = isMuted ? '🔇' : '🔊';
            btnMute.classList.toggle('muted', isMuted);
            volSlider.value = isMuted ? 0 : this.audio.volume * 100;
        });

        // Evitar que los controles de volumen y botones retengan el foco y capturen las flechas/espacio
        const preventFocus = (element) => {
            if (!element) return;
            element.addEventListener('click', () => element.blur());
            element.addEventListener('focus', () => element.blur());
            element.addEventListener('keydown', (e) => {
                if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
                    e.preventDefault();
                    element.blur();
                }
            });
        };
        preventFocus(volSlider);
        preventFocus(btnMute);
        preventFocus(document.getElementById('box-pausa'));

        // Controles de teclado
        window.addEventListener('keydown', (e) => {
            this.keysPressed[e.code] = true;
            this.handleSinglePressInput(e);
        });
        window.addEventListener('keyup', (e) => {
            delete this.keysPressed[e.code];
        });

        // En pantallas móviles o de pérdida de foco, limpiamos las teclas presionadas
        window.addEventListener('blur', () => {
            this.keysPressed = {};
        });

        // Controles táctiles virtuales
        this.initTouchControls();
    }

    /**
     * Vincula eventos táctiles para soporte de móviles.
     */
    initTouchControls() {
        const bindTouch = (id, action) => {
            const btn = document.getElementById(id);
            if (btn) {
                // Prevenir scroll en móviles al pulsar
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (this.gameStarted && !this.isPaused && !this.gameOverState) {
                        action();
                    }
                }, { passive: false });
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if (this.gameStarted && !this.isPaused && !this.gameOverState) {
                        action();
                    }
                });
            }
        };

        bindTouch('touch-left', () => this.move(-1));
        bindTouch('touch-right', () => this.move(1));
        bindTouch('touch-rotate', () => this.rotate());
        bindTouch('touch-down', () => this.drop());
        bindTouch('touch-drop', () => this.hardDrop());
        bindTouch('touch-hold', () => this.holdCurrentPiece());
    }

    /**
     * Resetea las estadísticas en la interfaz y en memoria.
     */
    resetStats() {
        this.board = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.holdPiece = null;
        this.hasHeldThisTurn = false;
        this.particles = [];
        
        // Resetear DAS e inputs
        this.keysPressed = {};
        this.dasTimer = 0;
        this.arrTimer = 0;
        this.currentPressedDir = 0;
        this.softDropTimer = 0;

        // Resetear Lock Delay
        this.isLanded = false;
        this.lockDelayTimer = 0;
        this.lockDelayResets = 0;

        this.updateHUD();
        this.drawHold();
    }

    /**
     * Actualiza el HUD en la interfaz.
     */
    updateHUD() {
        document.getElementById('val-score').textContent = String(this.score).padStart(6, '0');
        document.getElementById('val-highscore').textContent = String(this.highscore).padStart(6, '0');
        document.getElementById('val-lines').textContent = this.lines;
        document.getElementById('val-level').textContent = this.level;
    }

    /**
     * Inicia una partida de juego.
     */
    startGame() {
        this.audio.init();
        this.audio.stopBgm();
        this.resetStats();
        this.gameOverState = false;
        this.isPaused = false;
        this.gameStarted = true;

        // Ocultar overlays
        this.overlayInicio.classList.remove('active');
        this.overlayPausa.classList.remove('active');
        this.overlayGameOver.classList.remove('active');

        // Habilitar botón de pausa en HUD
        document.getElementById('box-pausa').disabled = false;

        // Generar piezas iniciales
        this.nextPiece = this.generatePiece();
        this.spawnPiece();

        // Reproducir música
        this.audio.updateTempo(this.level);
        this.audio.startBgm();

        // Arrancar el ciclo de animación
        this.lastTime = performance.now();
        if (this.gameInterval) cancelAnimationFrame(this.gameInterval);
        this.gameLoop();
    }

    /**
     * Reinicia el juego actual.
     */
    restartGame() {
        this.startGame();
    }

    /**
     * Alterna la pausa del juego.
     */
    togglePause() {
        if (!this.gameStarted || this.gameOverState) return;

        this.isPaused = !this.isPaused;
        const btnPausa = document.getElementById('box-pausa');
        
        if (this.isPaused) {
            this.audio.stopBgm();
            this.overlayPausa.classList.add('active');
            btnPausa.textContent = '▶ REANUDAR';
        } else {
            this.overlayPausa.classList.remove('active');
            btnPausa.textContent = '⏸ PAUSA';
            this.audio.startBgm();
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }

    /**
     * Genera una pieza aleatoria.
     */
    generatePiece() {
        const types = Object.keys(this.PIECES);
        const randType = types[Math.floor(Math.random() * types.length)];
        const pieceData = this.PIECES[randType];

        return {
            type: randType,
            matrix: JSON.parse(JSON.stringify(pieceData.matrix)), // Clonar matriz
            color: pieceData.color,
            shadowColor: pieceData.shadowColor,
            x: 0,
            y: 0
        };
    }

    /**
     * Coloca la siguiente pieza en juego.
     */
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.generatePiece();
        this.hasHeldThisTurn = false;

        // Posicionar en el centro arriba
        this.currentPiece.x = Math.floor((this.COLS - this.currentPiece.matrix[0].length) / 2);
        this.currentPiece.y = this.currentPiece.type === 'I' ? -1 : 0; // Centrado exacto

        // Si spawnea en colisión, fin de juego instantáneo
        if (this.checkCollision(this.currentPiece)) {
            this.triggerGameOver();
        }

        this.drawNext();
    }

    /**
     * Intercambia la pieza actual con la de reserva (Hold).
     */
    holdCurrentPiece() {
        if (this.isPaused || this.gameOverState || !this.gameStarted || this.hasHeldThisTurn) return;

        this.audio.playOsc('sine', 420, 0.09, 0.15);

        const currentType = this.currentPiece.type;

        if (!this.holdPiece) {
            // Guardar actual y sacar siguiente
            this.holdPiece = {
                type: currentType,
                matrix: this.PIECES[currentType].matrix,
                color: this.currentPiece.color,
                shadowColor: this.currentPiece.shadowColor
            };
            this.spawnPiece();
        } else {
            // Intercambiar actual y guardada
            const temp = {
                type: currentType,
                matrix: this.PIECES[currentType].matrix,
                color: this.currentPiece.color,
                shadowColor: this.currentPiece.shadowColor
            };
            this.currentPiece = {
                type: this.holdPiece.type,
                matrix: JSON.parse(JSON.stringify(this.holdPiece.matrix)),
                color: this.holdPiece.color,
                shadowColor: this.holdPiece.shadowColor,
                x: Math.floor((this.COLS - this.holdPiece.matrix[0].length) / 2),
                y: this.holdPiece.type === 'I' ? -1 : 0
            };
            this.holdPiece = temp;
        }

        // Restablecer el estado de aterrizaje (Lock Delay) al cambiar de pieza
        this.isLanded = false;
        this.lockDelayTimer = 0;
        this.lockDelayResets = 0;

        this.hasHeldThisTurn = true;
        this.drawHold();
    }

    /**
     * Finaliza la partida actual, actualiza leaderboard y almacena puntuaciones.
     */
    triggerGameOver() {
        this.gameOverState = true;
        this.gameStarted = false;
        this.audio.playGameOver();

        // Guardar record absoluto
        if (this.score > this.highscore) {
            this.highscore = this.score;
            localStorage.setItem('tetris_neon_highscore', this.highscore);
        }

        // Agregar score a la lista de mejores récords (Tabla de Líderes)
        const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        this.leaderboard.push({ score: this.score, date: dateStr });
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 5); // Mantener top 5
        localStorage.setItem('tetris_neon_leaderboard', JSON.stringify(this.leaderboard));

        // Renderizar tabla
        this.displayLeaderboard();

        document.getElementById('val-puntos-final').textContent = this.score;
        this.overlayGameOver.classList.add('active');
        document.getElementById('box-pausa').disabled = true;
    }

    /**
     * Dibuja los mejores récords en la pantalla de Fin de Juego.
     */
    displayLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = '';
        this.leaderboard.forEach((item) => {
            const li = document.createElement('li');
            li.innerHTML = `Puntos: <span class="score-val">${item.score}</span><span class="score-date">${item.date}</span>`;
            list.appendChild(li);
        });
    }

    /**
     * Comprueba si una pieza en una posición específica tiene colisiones.
     */
    checkCollision(piece, dx = 0, dy = 0, customMatrix = null) {
        const matrix = customMatrix || piece.matrix;
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c]) {
                    const nextX = piece.x + c + dx;
                    const nextY = piece.y + r + dy;

                    // Colisión con límites laterales e inferiores
                    if (nextX < 0 || nextX >= this.COLS || nextY >= this.ROWS) {
                        return true;
                    }

                    // Colisión con bloques consolidados del tablero
                    if (nextY >= 0 && this.board[nextY][nextX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Mueve la pieza de manera lateral. Aplica reinicio de Lock Delay si ha aterrizado.
     */
    move(dir) {
        if (this.isPaused || this.gameOverState || !this.gameStarted) return;
        
        if (!this.checkCollision(this.currentPiece, dir, 0)) {
            this.currentPiece.x += dir;
            this.audio.playMove();

            // Si está apoyado en el suelo, reiniciar lock delay al moverse (evita bloqueos injustos)
            if (this.isLanded) {
                if (this.lockDelayResets < this.lockDelayMaxResets) {
                    this.lockDelayTimer = 0;
                    this.lockDelayResets++;
                }
            }
        }
    }

    /**
     * Rota la pieza actual aplicando SRS wall kicks. Restablece el Lock Delay si ha aterrizado.
     */
    rotate() {
        if (this.isPaused || this.gameOverState || !this.gameStarted) return;

        const p = this.currentPiece;
        const n = p.matrix.length;
        
        // Clonar y rotar 90 grados horario
        const tempMatrix = Array.from({ length: n }, () => Array(n).fill(0));
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                tempMatrix[c][n - 1 - r] = p.matrix[r][c];
            }
        }

        // Intentar encajar la rotación usando desplazamientos (Wall Kick)
        const kicks = [0, -1, 1, -2, 2];
        for (let kick of kicks) {
            if (!this.checkCollision(p, kick, 0, tempMatrix)) {
                p.matrix = tempMatrix;
                p.x += kick;
                this.audio.playRotate();

                // Si está apoyado en el suelo, reiniciar lock delay al rotar
                if (this.isLanded) {
                    if (this.lockDelayResets < this.lockDelayMaxResets) {
                        this.lockDelayTimer = 0;
                        this.lockDelayResets++;
                    }
                }
                return;
            }
        }
    }

    /**
     * Baja la pieza un nivel de forma natural o por el jugador.
     */
    drop() {
        if (this.isPaused || this.gameOverState || !this.gameStarted) return;

        if (!this.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            this.score += 1; // Puntos adicionales por caída suave
            this.updateHUD();
            
            // Si la pieza ya no colisiona hacia abajo, desactivar estado landed
            this.isLanded = false;
            this.lockDelayTimer = 0;
        } else {
            // Colisiona con el fondo/otra pieza: Activar fase de aterrizaje
            this.isLanded = true;
        }
    }

    /**
     * Hace caer la pieza instantáneamente al fondo del tablero (Hard Drop).
     */
    hardDrop() {
        if (this.isPaused || this.gameOverState || !this.gameStarted) return;

        let droppedRows = 0;
        while (!this.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            droppedRows++;
        }
        
        this.score += droppedRows * 2; // Puntos por caída rápida
        this.triggerShake(5, 120); 
        this.audio.playDrop();
        
        // Bloqueo instantáneo saltándose el Lock Delay
        this.isLanded = false;
        this.lockPiece();
        this.updateHUD();
    }

    /**
     * Fija la pieza actual al tablero de juego.
     */
    lockPiece() {
        const p = this.currentPiece;
        for (let r = 0; r < p.matrix.length; r++) {
            for (let c = 0; c < p.matrix[r].length; c++) {
                if (p.matrix[r][c]) {
                    const gridY = p.y + r;
                    const gridX = p.x + c;
                    
                    if (gridY >= 0) {
                        this.board[gridY][gridX] = {
                            color: p.color,
                            shadowColor: p.shadowColor
                        };
                    }
                }
            }
        }

        // Restablecer contadores de bloqueo
        this.isLanded = false;
        this.lockDelayTimer = 0;
        this.lockDelayResets = 0;

        this.clearLines();
        this.spawnPiece();
    }

    /**
     * Busca y elimina las líneas completadas en el tablero.
     */
    clearLines() {
        let linesCleared = 0;
        
        for (let r = this.ROWS - 1; r >= 0; r--) {
            if (this.board[r].every(cell => cell !== 0)) {
                this.spawnRowParticles(r);
                
                this.board.splice(r, 1);
                this.board.unshift(Array(this.COLS).fill(0));
                
                linesCleared++;
                r++; // Reevaluar la misma fila desplazada
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            
            const scores = [0, 100, 300, 500, 800];
            this.score += scores[linesCleared] * this.level;

            if (linesCleared === 4) {
                this.triggerFlash();
                this.triggerShake(12, 250);
            } else {
                this.triggerShake(6, 150);
            }

            this.audio.playLineClear(linesCleared);

            // Subir nivel cada 10 líneas
            const targetLevel = Math.floor(this.lines / 10) + 1;
            if (targetLevel > this.level) {
                this.level = targetLevel;
                this.audio.updateTempo(this.level);
                this.audio.playLevelUp();
            }
        }
    }

    /**
     * Genera partículas brillantes de neón en una fila específica.
     */
    spawnRowParticles(rowY) {
        for (let c = 0; c < this.COLS; c++) {
            const cellColor = this.board[rowY][c].color || 'hsl(180, 100%, 50%)';
            const startX = c * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
            const startY = rowY * this.BLOCK_SIZE + this.BLOCK_SIZE / 2;
            
            const particleCount = 4 + Math.floor(Math.random() * 3);
            for (let i = 0; i < particleCount; i++) {
                this.particles.push({
                    x: startX,
                    y: startY,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8 - 2.5,
                    radius: 2 + Math.random() * 3.5,
                    color: cellColor,
                    alpha: 1,
                    decay: 0.02 + Math.random() * 0.03
                });
            }
        }
    }

    /**
     * Activa el efecto de agitación de la pantalla de la matriz.
     */
    triggerShake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
        const container = document.getElementById('panel-matriz');
        container.classList.add('shake');
        
        setTimeout(() => {
            container.classList.remove('shake');
            this.shakeIntensity = 0;
            this.shakeTimer = 0;
        }, duration);
    }

    /**
     * Activa un destello blanco en la rejilla al hacer un Tetris.
     */
    triggerFlash() {
        const container = document.getElementById('panel-matriz');
        container.classList.add('flash');
        setTimeout(() => {
            container.classList.remove('flash');
        }, 300);
    }

    /**
     * Calcula la posición fantasma (proyección inferior de la pieza).
     */
    getGhostY() {
        let ghostY = this.currentPiece.y;
        while (!this.checkCollision(this.currentPiece, 0, ghostY - this.currentPiece.y + 1)) {
            ghostY++;
        }
        return ghostY;
    }

    /**
     * Administra las entradas del teclado de pulsación única (no repetibles de forma automática).
     */
    handleSinglePressInput(e) {
        if (!this.gameStarted) return;
        
        switch (e.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.rotate();
                break;
            case 'Space':
                this.hardDrop();
                e.preventDefault();
                break;
            case 'KeyC':
            case 'ShiftLeft':
            case 'ShiftRight':
                this.holdCurrentPiece();
                e.preventDefault();
                break;
            case 'KeyP':
                this.togglePause();
                break;
        }
    }

    /**
     * Procesa los eventos de teclas continuas (DAS/ARR) y soft drop.
     */
    processInput(deltaTime) {
        if (this.isPaused || this.gameOverState || !this.gameStarted) {
            this.currentPressedDir = 0;
            this.dasTimer = 0;
            this.arrTimer = 0;
            return;
        }

        const left = this.keysPressed['ArrowLeft'] || this.keysPressed['KeyA'];
        const right = this.keysPressed['ArrowRight'] || this.keysPressed['KeyD'];
        const down = this.keysPressed['ArrowDown'] || this.keysPressed['KeyS'];

        // 1. Gestión del desplazamiento lateral (DAS y ARR)
        let targetDir = 0;
        if (left) targetDir = -1;
        if (right) targetDir = 1;

        if (targetDir !== 0) {
            if (this.currentPressedDir !== targetDir) {
                // Primer toque instantáneo
                this.currentPressedDir = targetDir;
                this.move(targetDir);
                this.dasTimer = 0;
                this.arrTimer = 0;
            } else {
                // Manteniendo pulsada la dirección
                this.dasTimer += deltaTime;
                if (this.dasTimer >= this.dasLimit) {
                    this.arrTimer += deltaTime;
                    while (this.arrTimer >= this.arrLimit) {
                        this.move(targetDir);
                        this.arrTimer -= this.arrLimit;
                    }
                }
            }
        } else {
            // Reiniciar DAS al soltar teclas direccionales
            this.currentPressedDir = 0;
            this.dasTimer = 0;
            this.arrTimer = 0;
        }

        // 2. Caída suave continua (Soft Drop)
        if (down) {
            this.softDropTimer += deltaTime;
            const softDropInterval = 35; // Drop cada 35ms
            while (this.softDropTimer >= softDropInterval) {
                this.drop();
                this.softDropTimer -= softDropInterval;
            }
        } else {
            this.softDropTimer = 0;
        }
    }

    /**
     * Dibuja los bloques de neón con gradientes y sombras.
     */
    drawBlock(ctx, x, y, color, shadowColor, isGhost = false) {
        const pad = 1;
        const rx = x * this.BLOCK_SIZE + pad;
        const ry = y * this.BLOCK_SIZE + pad;
        const rw = this.BLOCK_SIZE - pad * 2;
        const rh = this.BLOCK_SIZE - pad * 2;
        const rad = 4; // Radio de redondeo

        ctx.save();
        
        if (isGhost) {
            // Estilo fantasma: borde de neón translúcido
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.3;
            ctx.shadowBlur = 8;
            ctx.shadowColor = shadowColor;
            
            ctx.beginPath();
            ctx.roundRect(rx, ry, rw, rh, rad);
            ctx.stroke();
        } else {
            // Estilo bloque de neón sólido y brillante
            ctx.shadowBlur = 9;
            ctx.shadowColor = shadowColor;
            
            const gradient = ctx.createLinearGradient(rx, ry, rx, ry + rh);
            gradient.addColorStop(0, '#ffffff'); // Núcleo brillante
            gradient.addColorStop(0.25, color);
            gradient.addColorStop(1, this.shadeColor(color, -40)); // Sombreado inferior
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(rx, ry, rw, rh, rad);
            ctx.fill();

            // Borde interior fino
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
        
        ctx.restore();
    }

    /**
     * Genera tonalidades oscuras a partir de colores HSL.
     */
    shadeColor(colorStr, percent) {
        const matches = colorStr.match(/\d+/g);
        if (matches && matches.length >= 3) {
            const h = matches[0];
            const s = matches[1];
            let l = parseInt(matches[2]);
            l = Math.max(0, Math.min(100, l + percent));
            return `hsl(${h}, ${s}%, ${l}%)`;
        }
        return colorStr;
    }

    /**
     * Dibuja todo el tablero y los efectos en el Canvas principal.
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Aplicar vibración de cámara
        if (this.shakeTimer > 0) {
            const dx = (Math.random() - 0.5) * this.shakeIntensity;
            const dy = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.save();
            this.ctx.translate(dx, dy);
        }

        // 1. Dibujar fondo de cuadrícula cibernética
        this.ctx.strokeStyle = 'rgba(59, 34, 110, 0.15)';
        this.ctx.lineWidth = 0.5;
        for (let r = 0; r <= this.ROWS; r++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, r * this.BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, r * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
        for (let c = 0; c <= this.COLS; c++) {
            this.ctx.beginPath();
            this.ctx.moveTo(c * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(c * this.BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }

        // 2. Dibujar celdas consolidadas en el tablero
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                if (this.board[r][c]) {
                    const block = this.board[r][c];
                    this.drawBlock(this.ctx, c, r, block.color, block.shadowColor);
                }
            }
        }

        // 3. Dibujar pieza en juego y su proyección fantasma
        if (this.currentPiece) {
            const p = this.currentPiece;
            const ghostY = this.getGhostY();

            // Dibujar fantasma primero (por debajo)
            for (let r = 0; r < p.matrix.length; r++) {
                for (let c = 0; c < p.matrix[r].length; c++) {
                    if (p.matrix[r][c] && p.y + r >= 0) {
                        this.drawBlock(this.ctx, p.x + c, ghostY + r, p.color, p.shadowColor, true);
                    }
                }
            }

            // Dibujar pieza real
            for (let r = 0; r < p.matrix.length; r++) {
                for (let c = 0; c < p.matrix[r].length; c++) {
                    if (p.matrix[r][c] && p.y + r >= 0) {
                        this.drawBlock(this.ctx, p.x + c, p.y + r, p.color, p.shadowColor, false);
                    }
                }
            }
        }

        // 4. Dibujar y actualizar partículas
        this.drawParticles();

        if (this.shakeTimer > 0) {
            this.ctx.restore();
        }
    }

    /**
     * Dibuja y actualiza la lista de partículas en pantalla.
     */
    drawParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    /**
     * Renderiza la pieza siguiente en su canvas correspondiente.
     */
    drawNext() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        if (!this.nextPiece) return;

        const m = this.nextPiece.matrix;
        const size = this.nextPiece.type === 'I' || this.nextPiece.type === 'O' ? 20 : 22;
        
        const offsetX = (this.nextCanvas.width - m[0].length * size) / 2;
        const offsetY = (this.nextCanvas.height - m.length * size) / 2;

        for (let r = 0; r < m.length; r++) {
            for (let c = 0; c < m[r].length; c++) {
                if (m[r][c]) {
                    this.drawPreviewBlock(this.nextCtx, offsetX + c * size, offsetY + r * size, size, this.nextPiece.color, this.nextPiece.shadowColor);
                }
            }
        }
    }

    /**
     * Renderiza la pieza guardada en su canvas correspondiente.
     */
    drawHold() {
        this.holdCtx.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
        if (!this.holdPiece) return;

        const m = this.holdPiece.matrix;
        const size = this.holdPiece.type === 'I' || this.holdPiece.type === 'O' ? 20 : 22;
        
        const offsetX = (this.holdCanvas.width - m[0].length * size) / 2;
        const offsetY = (this.holdCanvas.height - m.length * size) / 2;

        for (let r = 0; r < m.length; r++) {
            for (let c = 0; c < m[r].length; c++) {
                if (m[r][c]) {
                    this.drawPreviewBlock(this.holdCtx, offsetX + c * size, offsetY + r * size, size, this.holdPiece.color, this.holdPiece.shadowColor);
                }
            }
        }
    }

    /**
     * Dibuja los bloques de previsualización en miniatura.
     */
    drawPreviewBlock(ctx, x, y, size, color, shadowColor) {
        ctx.save();
        ctx.shadowBlur = 6;
        ctx.shadowColor = shadowColor;
        
        const gradient = ctx.createLinearGradient(x, y, x, y + size);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, color);
        gradient.addColorStop(1, this.shadeColor(color, -30));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + 0.5, y + 0.5, size - 1, size - 1, 2.5);
        ctx.fill();
        ctx.restore();
    }

    /**
     * Bucle de animación del juego guiado por requestAnimationFrame.
     */
    gameLoop(time = 0) {
        if (this.isPaused || this.gameOverState) return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        // Procesar inputs de teclado y deslizamientos continuos (DAS/ARR)
        this.processInput(deltaTime);

        // Contador de caída natural según nivel
        this.dropCounter += deltaTime;
        const dropInterval = Math.max(100, 1000 - (this.level - 1) * 80);

        if (this.isLanded) {
            // Lógica de tolerancia (Lock Delay)
            this.lockDelayTimer += deltaTime;
            if (this.lockDelayTimer >= this.lockDelayLimit) {
                this.lockPiece();
            }
        } else if (this.dropCounter >= dropInterval) {
            this.drop();
            this.dropCounter = 0;
        }

        // Decrementar temporizador de agitación de pantalla
        if (this.shakeTimer > 0) {
            this.shakeTimer -= deltaTime;
        }

        this.draw();
        
        this.gameInterval = requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// Crear la instancia global al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new TetrisGame();
});

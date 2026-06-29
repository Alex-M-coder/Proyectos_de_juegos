/**
 * NeonAudio - Generador de efectos de sonido y música synthwave sintetizada en tiempo real.
 * Utiliza la Web Audio API para reproducir efectos y un bucle de música secuenciado.
 */
class NeonAudio {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.volume = 0.5; // Volumen general (0.0 a 1.0)
        
        // Propiedades de la música de fondo (BGM)
        this.bgmPlaying = false;
        this.bgmTempo = 135; // BPM (Pulsos por minuto)
        this.currentStep = 0;
        this.bgmTimer = null;
        this.nextNoteTime = 0.0;
        
        // Secuencia de Melodía: Korobeiniki (Notas MIDI, 0 es silencio)
        this.melody = [
            76, 0, 71, 72, 74, 0, 72, 71,
            69, 0, 69, 72, 76, 0, 74, 72,
            71, 0, 71, 72, 74, 0, 76, 0,
            72, 0, 69, 0, 69, 0, 0, 0,
            
            74, 0, 74, 77, 81, 0, 79, 77,
            76, 0, 72, 0, 76, 0, 74, 72,
            71, 0, 71, 72, 74, 0, 76, 0,
            72, 0, 69, 0, 69, 0, 0, 0
        ];
        
        // Secuencia de Bajo: Acompañamiento rítmico (Notas MIDI graves)
        this.bass = [
            45, 45, 45, 45, 45, 45, 45, 45,
            45, 45, 45, 45, 45, 45, 45, 45,
            40, 40, 40, 40, 40, 40, 40, 40,
            45, 45, 45, 45, 45, 45, 45, 45,
            
            50, 50, 50, 50, 50, 50, 50, 50,
            48, 48, 48, 48, 48, 48, 48, 48,
            40, 40, 40, 40, 40, 40, 40, 40,
            45, 45, 45, 45, 45, 45, 45, 45
        ];
    }

    /**
     * Inicializa o reanuda el contexto de audio.
     */
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Activa o desactiva el sonido general.
     */
    setMute(isMuted) {
        this.muted = isMuted;
        if (this.muted) {
            this.stopBgm();
        } else if (window.gameInstance && window.gameInstance.gameStarted && !window.gameInstance.isPaused) {
            this.startBgm();
        }
    }

    /**
     * Alterna el estado de silencio.
     */
    toggleMute() {
        this.setMute(!this.muted);
        return this.muted;
    }

    /**
     * Actualiza el volumen (0.0 a 1.0).
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
    }

    /**
     * Actualiza el ritmo de la música según el nivel del juego.
     */
    updateTempo(level) {
        this.bgmTempo = 135 + Math.min(45, (level - 1) * 6); // Acelera con el nivel
    }

    /**
     * Arranca la reproducción del bucle de música secuenciado.
     */
    startBgm() {
        if (this.muted || this.bgmPlaying) return;
        this.init();
        
        this.bgmPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.05;
        
        // Intervalo del planificador de notas (corre cada 40ms)
        this.bgmTimer = setInterval(() => this.scheduler(), 40);
    }

    /**
     * Detiene la reproducción de la música.
     */
    stopBgm() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    /**
     * Planificador de notas: programa osciladores con antelación para evitar retrasos de audio.
     */
    scheduler() {
        if (!this.bgmPlaying || !this.ctx) return;
        
        // Planificar notas que ocurren en los próximos 100 milisegundos
        while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
            const stepDuration = 60 / this.bgmTempo / 2; // Duración de una corchea (8vo de nota)
            
            // Programar nota de melodía si hay una definida
            const melMidi = this.melody[this.currentStep];
            if (melMidi > 0) {
                this.playBgmNote(melMidi, this.nextNoteTime, stepDuration * 1.4, false);
            }
            
            // Programar nota de bajo acompañante
            const bassMidi = this.bass[this.currentStep];
            if (bassMidi > 0) {
                this.playBgmNote(bassMidi, this.nextNoteTime, stepDuration * 0.7, true);
            }
            
            this.nextNoteTime += stepDuration;
            this.currentStep = (this.currentStep + 1) % this.melody.length;
        }
    }

    /**
     * Sintetiza una nota específica de BGM con envolvente de volumen y retardo (delay).
     */
    playBgmNote(midiNote, time, duration, isBass = false) {
        if (this.muted || !this.ctx) return;
        
        const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
        
        try {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = isBass ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, time);
            
            // Volumen ajustado según tipo y volumen del slider
            const baseVol = isBass ? 0.08 : 0.035;
            const volumeEnv = baseVol * this.volume;
            
            gainNode.gain.setValueAtTime(volumeEnv, time);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration - 0.01);
            
            if (!isBass) {
                // Efecto de eco/retardo espacial de synthwave para la melodía principal
                const delay = this.ctx.createDelay();
                const feedback = this.ctx.createGain();
                
                delay.delayTime.value = 0.22; // Retardo de 220ms
                feedback.gain.value = 0.3; // Retroalimentación del 30%
                
                osc.connect(gainNode);
                gainNode.connect(this.ctx.destination);
                
                // Ruta de eco
                gainNode.connect(delay);
                delay.connect(feedback);
                feedback.connect(delay); // Bucle
                feedback.connect(this.ctx.destination);
            } else {
                // El bajo va directo para evitar enturbiar las frecuencias graves
                osc.connect(gainNode);
                gainNode.connect(this.ctx.destination);
            }
            
            osc.start(time);
            osc.stop(time + duration);
        } catch (e) {}
    }

    /**
     * Generador genérico de sonidos de efectos de acción cortos.
     */
    playOsc(type, freq, duration, gainStart, gainEnd = 0.0001) {
        if (this.muted) return;
        this.init();
        
        try {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            const volumeEnv = gainStart * this.volume;
            gainNode.gain.setValueAtTime(volumeEnv, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(gainEnd, this.ctx.currentTime + duration);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    /**
     * Sonido de movimiento lateral de la pieza.
     */
    playMove() {
        this.playOsc('triangle', 180, 0.04, 0.15);
    }

    /**
     * Sonido al rotar la pieza (barrido ascendente).
     */
    playRotate() {
        if (this.muted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(260, now);
            osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);
            
            const volumeEnv = 0.1 * this.volume;
            gainNode.gain.setValueAtTime(volumeEnv, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(now + 0.08);
        } catch (e) {}
    }

    /**
     * Sonido al realizar una caída rápida o bloquear la pieza (impacto grave).
     */
    playDrop() {
        if (this.muted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
            
            const volumeEnv = 0.28 * this.volume;
            gainNode.gain.setValueAtTime(volumeEnv, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
            
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(now + 0.12);
        } catch (e) {}
    }

    /**
     * Sonido al limpiar líneas (arpegio ascendente).
     */
    playLineClear(lines) {
        if (this.muted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const isTetris = lines === 4;
            const baseFreq = isTetris ? 261.63 : 329.63; // C4 o E4
            const intervals = isTetris ? [0, 4, 7, 12, 16, 19, 24] : [0, 4, 7, 12];
            const tempo = isTetris ? 0.06 : 0.08;
            
            intervals.forEach((semitones, idx) => {
                const noteFreq = baseFreq * Math.pow(2, semitones / 12);
                const playTime = now + idx * tempo;
                
                const osc = this.ctx.createOscillator();
                const gainNode = this.ctx.createGain();
                
                osc.type = isTetris ? 'sawtooth' : 'sine';
                osc.frequency.setValueAtTime(noteFreq, playTime);
                
                const baseVal = isTetris ? 0.06 : 0.12;
                const volumeEnv = baseVal * this.volume;
                gainNode.gain.setValueAtTime(volumeEnv, playTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, playTime + 0.35);
                
                osc.connect(gainNode);
                gainNode.connect(this.ctx.destination);
                
                osc.start(playTime);
                osc.stop(playTime + 0.35);
            });
        } catch (e) {}
    }

    /**
     * Sonido de subida de nivel (melodía victoriosa rápida).
     */
    playLevelUp() {
        if (this.muted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            
            notes.forEach((freq, idx) => {
                const playTime = now + idx * 0.1;
                const osc = this.ctx.createOscillator();
                const gainNode = this.ctx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, playTime);
                
                const volumeEnv = 0.14 * this.volume;
                gainNode.gain.setValueAtTime(volumeEnv, playTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, playTime + 0.22);
                
                osc.connect(gainNode);
                gainNode.connect(this.ctx.destination);
                
                osc.start(playTime);
                osc.stop(playTime + 0.22);
            });
        } catch (e) {}
    }

    /**
     * Sonido al perder la partida (arpegio de notas tristes descendentes).
     */
    playGameOver() {
        this.stopBgm();
        if (this.muted) return;
        this.init();
        try {
            const now = this.ctx.currentTime;
            const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
            
            notes.forEach((freq, idx) => {
                const playTime = now + idx * 0.16;
                const osc = this.ctx.createOscillator();
                const gainNode = this.ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, playTime);
                osc.frequency.linearRampToValueAtTime(freq - 40, playTime + 0.25);
                
                const volumeEnv = 0.18 * this.volume;
                gainNode.gain.setValueAtTime(volumeEnv, playTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, playTime + 0.25);
                
                osc.connect(gainNode);
                gainNode.connect(this.ctx.destination);
                
                osc.start(playTime);
                osc.stop(playTime + 0.25);
            });
        } catch (e) {}
    }
}

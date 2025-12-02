export class AudioManager {
    constructor() {
        this.bgm = null;
        this.sfx = {};
        this.currentTrack = null;
        this.isMuted = false;

        // Preload sounds if possible, or just define paths
        this.tracks = {
            'Title': 'Audio/title_music_box.mp3',
            'Prologue': 'Audio/prologue_strings.mp3',
            'Objective': 'Audio/objective_strings.mp3',
            'Game': 'Audio/game_flute.mp3',
            'Boss': 'Audio/boss_orchestral.mp3',
            'GameOver': 'Audio/gameover_tragic.mp3',
            'Epilogue': 'Audio/epilogue_joyful.mp3',
            'Ending': 'Audio/ending_calm.mp3'
        };

        this.sfxFiles = {
            'confirm': 'Audio/sfx_confirm.mp3',
            'cancel': 'Audio/sfx_cancel.mp3',
            'attack_small': 'Audio/sfx_attack_small.mp3',
            'attack_medium': 'Audio/sfx_attack_medium.mp3',
            'attack_large': 'Audio/sfx_attack_large.mp3',
            'item_get': 'Audio/sfx_item_get.mp3',
            'item_use': 'Audio/sfx_item_use.mp3',
            '1up': 'Audio/sfx_1up.mp3',
            'flush': 'Audio/sfx_flush.mp3',
            'enemy_death': 'Audio/sfx_enemy_death.mp3',
            'enemy_attack': 'Audio/sfx_enemy_attack.mp3'
        };

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sfxBuffers = {};
        // this.loadSFX(); // Manual load from main.js
    }

    async loadSFX(onProgress) {
        const entries = Object.entries(this.sfxFiles);
        const total = entries.length;
        let loaded = 0;

        for (const [name, path] of entries) {
            try {
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.sfxBuffers[name] = audioBuffer;
            } catch (e) {
                console.log(`Failed to load SFX: ${name}`, e);
            }

            loaded++;
            if (onProgress) onProgress(loaded / total);
        }
    }

    playBGM(trackName) {
        if (this.currentTrack === trackName) return;

        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }

        const path = this.tracks[trackName];
        if (!path) return;

        this.bgm = new Audio(path);
        this.bgm.loop = true;
        this.bgm.volume = 0.5;
        this.bgm.play().catch(e => console.log('Audio play failed (user interaction needed):', e));
        this.currentTrack = trackName;
    }

    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
            this.currentTrack = null;
        }
    }

    playSFX(name) {
        const buffer = this.sfxBuffers[name];
        if (!buffer) return;

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        // Create gain node for volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.7;

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        source.start(0);
    }
}

export const audioManager = new AudioManager();

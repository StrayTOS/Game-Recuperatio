import { GameLoop } from './GameEngine/GameLoop.js';
import { SceneManager } from './GameEngine/SceneManager.js';
import { InputManager } from './GameEngine/InputManager.js';
import { Renderer } from './GameEngine/Renderer.js';
import { TitleScreen } from './Screens/TitleScreen.js';
import { PrologueScreen } from './Screens/PrologueScreen.js';
import { ObjectiveScreen } from './Screens/ObjectiveScreen.js';
import { ShootingScreen } from './Screens/ShootingScreen.js';
import { GameOverScreen } from './Screens/GameOverScreen.js';
import { EpilogueScreen } from './Screens/EpilogueScreen.js';
import { EndingScreen } from './Screens/EndingScreen.js';
import { audioManager } from './GameEngine/AudioManager.js';
import { textureManager } from './GameEngine/TextureManager.js';

class Game {
    constructor() {
        this.renderer = new Renderer();
        this.inputManager = new InputManager();
        this.sceneManager = new SceneManager(this);

        this.sceneManager.addScene('Title', TitleScreen);
        this.sceneManager.addScene('Prologue', PrologueScreen);
        this.sceneManager.addScene('Objective', ObjectiveScreen);
        this.sceneManager.addScene('Game', ShootingScreen);
        this.sceneManager.addScene('GameOver', GameOverScreen);
        this.sceneManager.addScene('Epilogue', EpilogueScreen);
        this.sceneManager.addScene('Ending', EndingScreen);

        this.gameLoop = new GameLoop(this);

        this.init();
    }

    async init() {
        const gameScreen = document.getElementById('game-container').appendChild(this.renderer.domElement);
        gameScreen.focus();

        await this.preload();

        this.sceneManager.switchTo('Title');
        this.gameLoop.start();
    }

    async preload() {
        const loadingText = document.getElementById('loading-text');
        const loadingScreen = document.getElementById('loading-screen');

        // Define all textures to preload
        const texturesToLoad = [
            'TextureImage/background_forest.png',
            'TextureImage/title_logo_only.png',
            'TextureImage/prologue_window.png',
            'TextureImage/stage1_atlas.png',
            'TextureImage/objective_bg.png',
            'TextureImage/player_wizard.png',
            'TextureImage/enemy_ghost.png',
            'TextureImage/enemy_skeleton.png',
            'TextureImage/enemy_dragon.png',
            'TextureImage/enemy_boss.png',
            'TextureImage/item_box.png',
            'TextureImage/item_health.png',
            'TextureImage/item_magic.png',
            'TextureImage/icon_hat.png',
            'TextureImage/epilogue_diary.png',
            'TextureImage/gameover_bg.png',
            'TextureImage/ending_bg.png'
        ];

        // Combined loading progress
        let audioProgress = 0;
        let textureProgress = 0;

        const updateProgress = () => {
            const total = (audioProgress * 0.2) + (textureProgress * 0.8);
            const percent = Math.round(total * 100);
            if (loadingText) loadingText.innerText = `Loading... ${percent}%`;
        };

        const audioPromise = audioManager.loadSFX((p) => {
            audioProgress = p;
            updateProgress();
        });

        const texturePromise = textureManager.loadTextures(texturesToLoad, (p) => {
            textureProgress = p;
            updateProgress();
        });

        await Promise.all([audioPromise, texturePromise]);

        // Small delay to ensure 100% is seen
        await new Promise(r => setTimeout(r, 200));

        // Fade out
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            await new Promise(r => setTimeout(r, 500));
            loadingScreen.style.display = 'none';
        }
    }

    update(deltaTime) {
        this.sceneManager.update(deltaTime);
        this.renderer.render(this.sceneManager.currentScene);
    }
}

window.game = new Game();

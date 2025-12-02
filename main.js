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

        await audioManager.loadSFX((progress) => {
            const percent = Math.round(progress * 100);
            if (loadingText) loadingText.innerText = `Loading... ${percent}%`;
        });

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

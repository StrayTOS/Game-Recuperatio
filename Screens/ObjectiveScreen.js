import * as THREE from 'three';
import { BaseScene } from '../GameEngine/BaseScene.js';
import { audioManager } from '../GameEngine/AudioManager.js';

export class ObjectiveScreen extends BaseScene {
    setup() {
        audioManager.playBGM('Objective');

        // Half-screen window with magical character
        const loader = new THREE.TextureLoader();
        loader.load('TextureImage/objective_bg.png', (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            const geometry = new THREE.PlaneGeometry(16, 16);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const bg = new THREE.Mesh(geometry, material);
            bg.position.z = -1;
            this.scene.add(bg);

            // Start Background Animation
            this.startBackgroundAnimation(bg, { x: 6.8, y: -8 - 3.8 }, { x: 0, y: 0 }, 2, 1.02, 6.0);
        }, undefined, () => {
            this.scene.background = new THREE.Color(0x221133);
        });

        this.createUI();
    }

    createUI() {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%,-50%)';
        container.style.width = '80%';
        container.style.color = 'white';
        container.style.fontFamily = 'serif';
        container.style.textShadow = '1px 1px 5px rgba(20, 4, 22, 0.75)';
        container.style.fontSize = '40px';
        let controlExplain = '';
        if (isTouchDevice) {
            controlExplain =
                `Arrows : Move
                A : Attack (Hold to Charge)
                B : Use Item
                ESC : Menu`;
        } else {
            controlExplain =
                `Arrows : Move
                Z : Attack (Hold to Charge)
                X : Use Item`;
        }

        container.innerText =
            `[Objective of visit]
            While defeating the threat of monsters,
             you will reach the deepest the forest and
            unravel the depths of the strange phenomenon.
            
            [Controls]
            ` + controlExplain;
        container.style.textAlign = 'center';

        this.uiContainer.appendChild(container);

        // Magic Circle Icon (Progress)
        const magicCircle = document.createElement('div');
        magicCircle.style.position = 'absolute';
        magicCircle.style.bottom = '8%';
        magicCircle.style.left = '50%';
        magicCircle.style.transform = 'translateX(-50%)';
        magicCircle.style.width = '90px';
        magicCircle.style.height = '90px';
        magicCircle.style.borderRadius = '50%';
        magicCircle.style.border = '2px solid cyan';
        magicCircle.style.boxShadow = '0 0 10px cyan';
        magicCircle.style.cursor = 'pointer';
        magicCircle.style.pointerEvents = 'auto';

        // Inner design
        const inner = document.createElement('div');
        inner.style.width = '64px';
        inner.style.height = '64px';
        inner.style.border = '2px solid cyan';
        inner.style.transform = 'rotate(45deg)';
        inner.style.margin = '8px';
        magicCircle.appendChild(inner);

        // Fade animation (5s cycle)
        magicCircle.animate([
            { opacity: 0 },
            { opacity: 1 },
            { opacity: 0 }
        ], {
            duration: 5000,
            iterations: Infinity
        });

        const startGame = () => {
            audioManager.playSFX('confirm');
            this.transitionTo('Game');
        };

        magicCircle.onclick = () => {
            if (!this.inputLocked) startGame();
        };

        this.uiContainer.appendChild(magicCircle);
        this.startGameAction = startGame; // Store for update loop
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.handleFullscreenInput()) return;
        const input = this.game.inputManager.getInput();
        if (input.confirm && !this.inputLocked) {
            if (this.startGameAction) this.startGameAction();
        }
    }
}

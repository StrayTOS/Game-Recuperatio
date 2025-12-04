import * as THREE from 'three';
import { BaseScene } from '../GameEngine/BaseScene.js';
import { audioManager } from '../GameEngine/AudioManager.js';
import { textureManager } from '../GameEngine/TextureManager.js';

export class EpilogueScreen extends BaseScene {
    setup() {
        audioManager.playBGM('Epilogue');

        // Diary Background
        const texture = textureManager.getTexture('TextureImage/epilogue_diary.png');
        if (texture) {
            const geometry = new THREE.PlaneGeometry(16, 16);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const bg = new THREE.Mesh(geometry, material);
            bg.position.z = -1;
            this.scene.add(bg);

            // Start Background Animation
            this.startBackgroundAnimation(bg, { x: 0, y: 0 }, { x: 0, y: 0 }, 2.5, 1.02, 10);
        } else {
            this.scene.background = new THREE.Color(0x332211);
        }

        this.createUI();
    }

    createUI() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '22%';
        container.style.left = '15%';
        container.style.width = '70%';
        container.style.color = 'white';
        container.style.fontFamily = 'cursive';
        container.style.fontSize = '40px';
        container.style.textShadow = '2px 2px 5px black';
        container.style.textAlign = 'center';

        const lines = [
            "Observations on the subjugation of the Great Tree Forest",
            "",
            "For now, the forest is safe.",
            "",
            "The evil tree that was the main cause has been felled,",
            "",
            " but I sense an ominous flow of magical power,",
            "",
            " and I feel as if an even greater darkness lurks elsewhere...",
            "",
            "I must continue my journey to recover pure magical power."
        ];

        this.textLines = [];
        lines.forEach((lineText, index) => {
            const line = document.createElement('div');
            line.innerText = lineText;
            line.style.opacity = '0';
            line.style.transition = 'opacity 1s';
            line.style.minHeight = '1em'; // Maintain spacing for empty lines
            container.appendChild(line);
            this.textLines.push(line);
        });

        this.uiContainer.appendChild(container);
        this.lineTimer = 0;
        this.currentLineIndex = 0;

        // Next Icon
        const nextIcon = document.createElement('div');
        nextIcon.style.position = 'absolute';
        nextIcon.style.bottom = '20px';
        nextIcon.style.right = '20px';
        nextIcon.style.width = '40px';
        nextIcon.style.height = '40px';
        nextIcon.style.borderRight = '4px solid black';
        nextIcon.style.borderBottom = '4px solid black';
        nextIcon.style.transform = 'rotate(-45deg)';
        nextIcon.style.cursor = 'pointer';
        nextIcon.style.pointerEvents = 'auto';

        // Blink
        nextIcon.animate([
            { opacity: 1 },
            { opacity: 0.2 },
            { opacity: 1 }
        ], {
            duration: 5000,
            iterations: Infinity
        });
        this.uiContainer.appendChild(nextIcon);

        // Click anywhere to return to title
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.cursor = 'pointer';
        overlay.style.pointerEvents = 'auto';
        overlay.onclick = () => {
            if (!this.inputLocked) this.nextScene();
        };
        this.uiContainer.appendChild(overlay);

        // Play Icon (Progress Button)
        const playIcon = document.createElement('div');
        playIcon.style.position = 'absolute';
        playIcon.style.bottom = '64px';
        playIcon.style.right = '64px';
        playIcon.style.width = '90px';
        playIcon.style.height = '90px';
        playIcon.style.border = '6px solid white';
        playIcon.style.borderRadius = '50%';
        playIcon.style.cursor = 'pointer';
        playIcon.style.pointerEvents = 'auto';

        // Triangle shape
        const triangle = document.createElement('div');
        triangle.style.width = '0';
        triangle.style.height = '0';
        triangle.style.borderTop = '25px solid transparent';
        triangle.style.borderBottom = '25px solid transparent';
        triangle.style.borderLeft = '50px solid white';
        triangle.style.position = 'absolute';
        triangle.style.top = '50%';
        triangle.style.left = '55%';
        triangle.style.transform = 'translate(-50%, -50%)';
        playIcon.appendChild(triangle);

        // Blink animation
        playIcon.animate([
            { opacity: 1 },
            { opacity: 0.2 },
            { opacity: 1 }
        ], {
            duration: 5000,
            iterations: Infinity
        });

        playIcon.onclick = () => {
            if (!this.inputLocked) this.nextScene();
        };

        this.uiContainer.appendChild(playIcon);
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.handleFullscreenInput()) return;
        // Fade in lines sequentially
        this.lineTimer += deltaTime;
        if (this.lineTimer > 0.75 && this.currentLineIndex < this.textLines.length) {
            const line = this.textLines[this.currentLineIndex];
            line.style.opacity = '1';
            setTimeout(() => {
                line.style.transition = 'none';
            }, 1000);
            this.currentLineIndex++;
            this.lineTimer = 0;
        }

        const input = this.game.inputManager.getInput();
        if (input.confirm && !this.inputLocked) this.nextScene();
    }

    nextScene() {
        audioManager.playSFX('confirm');
        this.transitionTo('Ending');
    }
}

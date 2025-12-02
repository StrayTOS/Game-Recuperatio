import * as THREE from 'three';
import { BaseScene } from '../GameEngine/BaseScene.js';
import { audioManager } from '../GameEngine/AudioManager.js';

export class GameOverScreen extends BaseScene {
    setup() {
        audioManager.playBGM('GameOver');

        // Dark room with spotlight on hat
        const loader = new THREE.TextureLoader();
        loader.load('TextureImage/gameover_bg.png', (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            const geometry = new THREE.PlaneGeometry(16, 16);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const bg = new THREE.Mesh(geometry, material);
            bg.position.y = -2;
            bg.position.z = -1;
            this.scene.add(bg);

            // Start Background Animation
            this.startBackgroundAnimation(bg, { x: 0, y: -8 - 3.8 }, { x: 0, y: 0 }, 2, 1.02, 8.0);
        }, undefined, () => {
            this.scene.background = new THREE.Color(0x110000);
        });

        this.createUI();
    }

    createUI() {
        // GAME OVER TEXT
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.textAlign = 'center';
        container.style.color = 'red';
        container.style.fontFamily = 'serif';
        container.style.fontSize = '64px';
        container.style.textShadow = '0px 2px 20px rgba(0,0,0,0.75)';
        container.innerText = "GAME OVER";
        container.style.opacity = '0'; // Start invisible
        container.style.transition = 'opacity 2s'; // Fade in over 2 seconds
        this.gameOverText = container; // Store reference

        this.uiContainer.appendChild(container);

        // Return to Title Button Frame
        const retryBtnFrame = document.createElement('div');
        retryBtnFrame.style.position = 'absolute';
        retryBtnFrame.style.top = '65%';
        retryBtnFrame.style.left = '50%';
        retryBtnFrame.style.transform = 'translate(-50%, -50%)';
        retryBtnFrame.style.textAlign = 'center';
        retryBtnFrame.style.color = 'white';
        retryBtnFrame.style.textShadow = '2px 2px 4px #000';
        retryBtnFrame.style.width = '100%';
        retryBtnFrame.style.opacity = '0'; // Start invisible
        retryBtnFrame.style.transition = 'opacity 2s'; // Fade in over 2 seconds
        this.retryBtnFrame = retryBtnFrame; // Store reference

        // Return to Title Button
        const retryBtn = document.createElement('button');
        retryBtn.textContent = 'Return to Title';
        retryBtn.style.fontSize = '32px';
        retryBtn.style.padding = '10px 30px';
        retryBtn.style.marginTop = '20%';
        retryBtn.style.cursor = 'pointer';
        retryBtn.style.fontFamily = 'serif';
        retryBtn.style.backgroundColor = 'rgba(0,0,0,0.5)';
        retryBtn.style.color = 'white';
        retryBtn.style.border = '1px solid white';
        retryBtn.style.borderRadius = '20px';
        retryBtn.style.pointerEvents = 'auto';

        retryBtn.onclick = () => {
            if (!this.inputLocked) {
                audioManager.playSFX('confirm');
                this.transitionTo('Title');
            }
        };
        retryBtnFrame.appendChild(retryBtn);
        this.uiContainer.appendChild(retryBtnFrame);
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.handleFullscreenInput()) return;
        // Fade in text after animation finishes (5s)
        if (this.bgAnim && this.bgAnim.elapsed >= 5) {
            if (this.gameOverText && this.gameOverText.style.opacity !== '1') {
                this.gameOverText.style.opacity = '1';
                setTimeout(() => {
                    if (this.gameOverText) this.gameOverText.style.transition = 'none';
                }, 2000);
            }
            if (this.retryBtnFrame && this.retryBtnFrame.style.opacity !== '1') {
                this.retryBtnFrame.style.opacity = '1';
                setTimeout(() => {
                    if (this.retryBtnFrame) this.retryBtnFrame.style.transition = 'none';
                }, 2000);
            }
        }

        const input = this.game.inputManager.getInput();
        if (input.confirm && !this.inputLocked) {
            audioManager.playSFX('confirm');
            this.transitionTo('Title');
        }
    }
}

import * as THREE from 'three';
import { BaseScene } from '../GameEngine/BaseScene.js';
import { audioManager } from '../GameEngine/AudioManager.js';
import { textureManager } from '../GameEngine/TextureManager.js';

export class EndingScreen extends BaseScene {
    setup() {
        audioManager.playBGM('Ending');

        // Witch smiling background
        const texture = textureManager.getTexture('TextureImage/ending_bg.png');
        if (texture) {
            const geometry = new THREE.PlaneGeometry(16, 16);
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const bg = new THREE.Mesh(geometry, material);
            bg.position.y = -2;
            bg.position.z = -1;
            this.scene.add(bg);

            // Start Background Animation
            this.startBackgroundAnimation(bg, { x: -6.8, y: -7.8 - 3.85 }, { x: 0, y: -2.0 }, 2, 1.02, 7);
        } else {
            this.scene.background = new THREE.Color(0xCCCCFF);
        }

        this.createUI();
    }

    createUI() {
        const finaleText = document.createElement('div');
        finaleText.style.position = 'absolute';
        finaleText.style.bottom = '20px';
        finaleText.style.left = '0px';
        finaleText.style.width = '100%';
        finaleText.style.color = 'white';
        finaleText.style.fontFamily = 'serif';
        finaleText.style.fontSize = '64px';
        finaleText.style.textShadow = '2px 2px 5px black';
        finaleText.style.textAlign = 'center';
        finaleText.innerText = "Finale\nThank you for playing!!";
        finaleText.style.opacity = '0'; // Start invisible
        finaleText.style.transition = 'opacity 2s'; // Fade in over 2 seconds
        this.finaleText = finaleText; // Store reference

        this.uiContainer.appendChild(finaleText);

        // Click anywhere to return to title
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.cursor = 'pointer';
        overlay.style.pointerEvents = 'auto';
        overlay.onclick = () => {
            if (!this.inputLocked) {
                audioManager.playSFX('confirm');
                this.transitionTo('Title');
            }
        };
        this.uiContainer.appendChild(overlay);
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.handleFullscreenInput()) return;

        // Fade in text after animation finishes (5s)
        if (this.bgAnim && this.bgAnim.elapsed >= 5) {
            if (this.finaleText && this.finaleText.style.opacity !== '1') {
                this.finaleText.style.opacity = '1';
                setTimeout(() => {
                    if (this.finaleText) this.finaleText.style.transition = 'none';
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

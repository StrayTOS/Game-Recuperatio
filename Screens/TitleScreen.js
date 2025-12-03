import * as THREE from 'three';
import { BaseScene } from '../GameEngine/BaseScene.js';
import { audioManager } from '../GameEngine/AudioManager.js';
import { textureManager } from '../GameEngine/TextureManager.js';

export class TitleScreen extends BaseScene {
    setup() {
        // Audio
        audioManager.playBGM('Title');

        // Layer 1: Background
        const bgTexture = textureManager.getTexture('TextureImage/background_forest.png');
        if (bgTexture) {
            const geometry = new THREE.PlaneGeometry(16, 16);
            const material = new THREE.MeshBasicMaterial({ map: bgTexture });
            const bg = new THREE.Mesh(geometry, material);
            bg.position.z = -1;
            this.scene.add(bg);

            // Start Background Animation
            this.startBackgroundAnimation(bg, { x: 0, y: -7.8 - 3.8 }, { x: 0, y: 0 }, 2, 1.01, 4);
        } else {
            console.log('Background image not found, using fallback color.');
            this.scene.background = new THREE.Color(0x224422);
        }

        // Layer 2: Title Logo
        const logoTexture = textureManager.getTexture('TextureImage/title_logo_only.png');
        if (logoTexture) {
            const geometry = new THREE.PlaneGeometry(8, 8);
            const material = new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true });
            const logo = new THREE.Mesh(geometry, material);
            logo.position.y = 1;
            logo.position.z = 0;
            this.scene.add(logo);
        }

        // UI Elements
        this.createUI();
    }

    createUI() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '65%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.textAlign = 'center';
        container.style.color = 'white';
        container.style.textShadow = '2px 2px 4px #000';
        container.style.width = '100%';
        container.style.opacity = '0'; // Start invisible
        container.style.transition = 'opacity 2s'; // Fade in over 2 seconds

        const startBtn = document.createElement('button');
        startBtn.textContent = 'START';
        startBtn.style.fontSize = '32px';
        startBtn.style.padding = '10px 30px';
        startBtn.style.marginTop = '360px';
        startBtn.style.cursor = 'pointer';
        startBtn.style.fontFamily = 'serif';
        startBtn.style.backgroundColor = 'rgba(0,0,0,0.5)';
        startBtn.style.color = 'white';
        startBtn.style.border = '1px solid white';
        startBtn.style.borderRadius = '20px';
        startBtn.style.pointerEvents = 'auto';

        startBtn.onclick = () => {
            if (!this.inputLocked) {
                audioManager.playSFX('confirm');
                this.transitionTo('Prologue');
            }
        };
        container.appendChild(startBtn);

        const copyright = document.createElement('div');
        copyright.textContent = '© 2025 Magnus Crunch Strayers. All rights reserved.';
        copyright.style.marginTop = '100px';
        copyright.style.fontSize = '28px';
        container.appendChild(copyright);

        // Notice Group
        const noticeGroup = document.createElement('div');
        noticeGroup.style.display = 'flex';
        noticeGroup.style.justifyContent = 'space-between';
        noticeGroup.style.marginTop = '100px';
        container.appendChild(noticeGroup);

        // Version
        const version = document.createElement('div');
        version.textContent = 'Version 0.2.0';
        version.style.marginLeft = '32px';
        version.style.textAlign = 'left';
        version.style.fontSize = '24px';
        version.style.opacity = '0.7';
        noticeGroup.appendChild(version);

        // AI Notice
        const aiNotice = document.createElement('div');
        aiNotice.textContent = "Created using Google Antigravity's Gemini 3 Pro (High).";
        aiNotice.style.marginRight = '32px';
        aiNotice.style.textAlign = 'right';
        aiNotice.style.fontSize = '24px';
        aiNotice.style.opacity = '0.7';
        noticeGroup.appendChild(aiNotice);

        this.uiContainer.appendChild(container);

        // Trigger fade in immediately
        setTimeout(() => {
            container.style.opacity = '1';
            setTimeout(() => {
                container.style.transition = 'none';
            }, 2000);
        }, 100);
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.handleFullscreenInput()) return;
        const input = this.game.inputManager.getInput();
        if (input.confirm && !this.inputLocked) {
            audioManager.playSFX('confirm');
            this.transitionTo('Prologue');
        }
    }
}

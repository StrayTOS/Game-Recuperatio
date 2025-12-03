import * as THREE from 'three';
import { BaseScene } from '../GameEngine/BaseScene.js';
import { audioManager } from '../GameEngine/AudioManager.js';
import { textureManager } from '../GameEngine/TextureManager.js';

export class PrologueScreen extends BaseScene {
    setup() {
        audioManager.playBGM('Prologue');

        // Background (Vine design window)
        const texture = textureManager.getTexture('TextureImage/prologue_window.png');
        if (texture) {
            const geometry = new THREE.PlaneGeometry(16, 16);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
            const bg = new THREE.Mesh(geometry, material);
            bg.position.z = -1;
            this.scene.add(bg);

            // Sub Background to create a sense of depth
            this.setup_sub_bg(bg);

            // Start Background Animation
            this.startBackgroundAnimation(bg, { x: 0, y: 8 - 3.8 }, { x: 0, y: -2 }, 1.02, 1.02, 22.5);
        } else {
            this.scene.background = new THREE.Color(0x112211);
        }

        this.createUI();
    }

    setup_sub_bg(parent) {
        // Background
        this.sub_bg = new THREE.Group();
        parent.add(this.sub_bg);

        const texture = textureManager.getTexture('TextureImage/stage1_atlas.png');
        if (texture) {
            const meshWidth = 9;
            const meshHeight = 9;
            const geometry = new THREE.PlaneGeometry(meshWidth, meshHeight);

            // TODO  Ideally, the mechanism for setting UVs from the atlas texture, including generating BG in the ShootingScreen, should be separated as a game system, but currently it is run locally in a fixed loop to save time. Unlike the background, there is no need to set coordinates, so the process is commented out and skipped.
            for (let i = 0; i < 16; i++) {

                // TODO : This is a temporary process as it is a local, one-time loop. This process will no longer be necessary once a UV specification mechanism is in place in the game system.
                if (i !== 13) {
                    continue;
                }

                // Clone geometry to modify UVs
                const geo = geometry.clone();
                const uvs = geo.attributes.uv;

                // Calculate UVs
                // 4 Rows, 4 Columns
                const row = Math.floor(i / 4);
                const col = i % 4;

                // V is inverted in Three.js (0 is bottom)
                // Row 0 (Top) -> V: 0.75 to 1.0
                // Row 1 -> V: 0.5 to 0.75
                // Row 2 -> V: 0.25 to 0.5
                // Row 3 -> V: 0.0 to 0.25
                const vMin = 1.0 - ((row + 1) * 0.25);
                const vMax = 1.0 - (row * 0.25);
                const uMin = col * 0.25;
                const uMax = (col + 1) * 0.25;

                // Quad UVs: BL, BR, TL, TR (indexed)
                // We want:
                // 0: (uMin, vMax)
                // 1: (uMax, vMax)
                // 2: (uMin, vMin)
                // 3: (uMax, vMin)

                uvs.setXY(0, uMin, vMax);
                uvs.setXY(1, uMax, vMax);
                uvs.setXY(2, uMin, vMin);
                uvs.setXY(3, uMax, vMin);

                const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
                const mesh = new THREE.Mesh(geo, material);
                // mesh.position.x = i * meshWidth;
                this.sub_bg.add(mesh);
            }

            // Coordinates are specified behind the background to create a sense of depth.
            this.sub_bg.position.z = -3.5;
            this.sub_bg.scale.set(2.0, 2.0, 1);
        }
    }

    createUI() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '5%';
        container.style.left = '10%';
        container.style.width = '80%';
        container.style.height = '90%';
        container.style.overflow = 'hidden';
        container.style.color = 'white';
        container.style.fontFamily = 'serif';
        container.style.fontSize = '32px';
        container.style.textShadow = '1px 1px 4px black';

        const textContent = document.createElement('div');
        textContent.innerText =
            `In a world where magic whispers\n through the ancient trees...\n\n
            A darkness has befallen the land.\n\n
            The Great Tree, source of all mana, is withering.\n\n
            You, a young wizard, must embark on a journey\n to retrieve the lost mana crystals.\n\n
            Only then can the balance be restored.\n\n
            Fly forth, and bring light back to the forest.`;
        textContent.style.position = 'absolute';
        textContent.style.top = '100%';
        textContent.style.width = '100%';
        textContent.style.textAlign = 'center';

        // Scrolling animation
        textContent.animate([
            { top: '100%' },
            { top: '-150%' }
        ], {
            duration: 25000,
            iterations: 1,
            fill: 'forwards'
        });

        container.appendChild(textContent);
        this.uiContainer.appendChild(container);

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

    nextScene() {
        audioManager.playSFX('confirm');
        this.transitionTo('Objective');
    }

    update(deltaTime) {
        super.update(deltaTime);
        if (this.handleFullscreenInput()) return;
        const input = this.game.inputManager.getInput();
        if (input.confirm && !this.inputLocked) {
            this.nextScene();
        }
    }
}

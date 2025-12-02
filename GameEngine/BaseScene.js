import * as THREE from 'three';

export class BaseScene {
    constructor(game) {
        this.game = game;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
        this.camera.position.z = 5;

        this.uiContainer = document.getElementById('ui-layer');

        // Fade Overlay
        this.fadeOverlay = document.createElement('div');
        this.fadeOverlay.style.position = 'absolute';
        this.fadeOverlay.style.top = '0';
        this.fadeOverlay.style.left = '0';
        this.fadeOverlay.style.width = '100%';
        this.fadeOverlay.style.height = '100%';
        this.fadeOverlay.style.backgroundColor = 'black';
        this.fadeOverlay.style.opacity = '1'; // Start black
        this.fadeOverlay.style.pointerEvents = 'none';
        this.fadeOverlay.style.transition = 'opacity 1s';
        this.fadeOverlay.style.zIndex = '1000';
        this.uiContainer.appendChild(this.fadeOverlay);
    }

    enter() {
        console.log(`Entering ${this.constructor.name}`);
        this.inputLocked = true;
        setTimeout(() => { this.inputLocked = false; }, 1500);

        this.setup();

        // Re-append fade overlay to ensure it's on top if setup() cleared UI
        if (!this.uiContainer.contains(this.fadeOverlay)) {
            this.uiContainer.appendChild(this.fadeOverlay);
        }

        // Create Fullscreen Dialog (Common UI)
        this.createFullscreenDialog();

        // Trigger Fade In
        // Slight delay to ensure DOM is ready
        setTimeout(() => {
            this.fadeOverlay.style.opacity = '0';
            // Remove transition after animation to save GPU
            setTimeout(() => {
                this.fadeOverlay.style.transition = 'none';
            }, 1000);
        }, 50);
    }

    exit() {
        console.log(`Exiting ${this.constructor.name}`);
        this.teardown();
        // Clear UI but keep fade overlay if needed? 
        // Actually SceneManager switches scenes, so new scene will create its own overlay.
        this.uiContainer.innerHTML = '';
    }

    transitionTo(sceneName) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.fadeOverlay.style.transition = 'opacity 1s'; // Re-enable transition
        // Force reflow to ensure transition applies
        this.fadeOverlay.offsetHeight;
        this.fadeOverlay.style.opacity = '1';
        setTimeout(() => {
            this.game.sceneManager.switchTo(sceneName);
        }, 1000); // Match transition duration
    }

    setup() {
        // Override in subclasses
    }

    teardown() {
        // Override in subclasses
        // Dispose of Three.js objects
        this.scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }

    startBackgroundAnimation(mesh, startPos = { x: -3, y: -3 }, endPos = { x: 0, y: 0 }, startScale = 2, endScale = 1, duration = 5) {
        this.bgMesh = mesh;
        this.bgAnim = {
            startPos: { ...startPos },
            endPos: { ...endPos },
            startScale: startScale,
            endScale: endScale,
            duration: duration,
            elapsed: 0,
            active: true
        };

        // Set initial state
        this.bgMesh.position.set(startPos.x, startPos.y, this.bgMesh.position.z);
        this.bgMesh.scale.setScalar(startScale);
    }

    update(deltaTime) {
        // Background Animation
        if (this.bgAnim && this.bgAnim.active) {
            this.bgAnim.elapsed += deltaTime;
            const t = Math.min(1, this.bgAnim.elapsed / this.bgAnim.duration);

            // Ease out cubic
            const ease = 1 - Math.pow(1 - t, 3);

            // Interpolate Position
            this.bgMesh.position.x = this.bgAnim.startPos.x + (this.bgAnim.endPos.x - this.bgAnim.startPos.x) * ease;
            this.bgMesh.position.y = this.bgAnim.startPos.y + (this.bgAnim.endPos.y - this.bgAnim.startPos.y) * ease;

            // Interpolate Scale
            const scale = this.bgAnim.startScale + (this.bgAnim.endScale - this.bgAnim.startScale) * ease;
            this.bgMesh.scale.setScalar(scale);

            if (t >= 1) {
                this.bgAnim.active = false;
            }
        }

        // Input Cooldown
        if (this.inputCooldown > 0) {
            this.inputCooldown -= deltaTime;
        }
    }

    createFullscreenDialog() {
        // Container: 50% height, centered
        this.fsDialog = document.createElement('div');
        this.fsDialog.style.position = 'absolute';
        this.fsDialog.style.top = '50%';
        this.fsDialog.style.left = '50%';
        this.fsDialog.style.transform = 'translate(-50%, -50%)';
        this.fsDialog.style.width = '40%';
        this.fsDialog.style.height = '30%'; // 30% screen height
        this.fsDialog.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.fsDialog.style.border = '4px solid rgba(255, 255, 255, 0.8)';
        this.fsDialog.style.borderRadius = '50px';
        this.fsDialog.style.display = 'flex'; // Always flex, control visibility with opacity
        this.fsDialog.style.flexDirection = 'column';
        this.fsDialog.style.justifyContent = 'space-between';
        this.fsDialog.style.alignItems = 'center';
        this.fsDialog.style.padding = '20px';
        this.fsDialog.style.zIndex = '30000'; // High z-index
        this.fsDialog.style.pointerEvents = 'none'; // Start hidden
        this.fsDialog.style.opacity = '0';
        this.fsDialog.style.transition = 'opacity 0.3s';

        // Text
        const text = document.createElement('div');
        text.innerText = 'Enter full screen mode?';
        text.style.color = 'rgba(255, 255, 255, 0.9)';
        text.style.fontSize = '44px';
        text.style.textAlign = 'center';
        text.style.marginTop = '5%';
        text.style.fontFamily = 'serif';
        this.fsDialog.appendChild(text);

        // Button Container
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.justifyContent = 'space-around';
        btnContainer.style.width = '70%';
        btnContainer.style.margin = '10%';
        this.fsDialog.appendChild(btnContainer);

        // Yes Button
        this.fsYesBtn = document.createElement('div');
        this.fsYesBtn.innerText = 'Yes';
        this.fsYesBtn.style.height = '100%';
        this.fsYesBtn.style.aspectRatio = '1.5/1';
        this.fsYesBtn.style.backgroundColor = 'rgba(255, 150, 150, 0.1)';
        this.fsYesBtn.style.color = 'rgba(255, 255, 255, 0.9)';
        this.fsYesBtn.style.display = 'flex';
        this.fsYesBtn.style.justifyContent = 'center';
        this.fsYesBtn.style.alignItems = 'center';
        this.fsYesBtn.style.padding = '1%';
        this.fsYesBtn.style.fontSize = '54px';
        this.fsYesBtn.style.borderRadius = '20px';
        this.fsYesBtn.style.border = '4px solid rgba(255, 255, 255, 0.8)';
        this.fsYesBtn.style.cursor = 'pointer';
        btnContainer.appendChild(this.fsYesBtn);

        // No Button
        this.fsNoBtn = document.createElement('div');
        this.fsNoBtn.innerText = 'No';
        this.fsNoBtn.style.height = '100%';
        this.fsNoBtn.style.aspectRatio = '1.5/1';
        this.fsNoBtn.style.backgroundColor = 'rgba(96, 160, 255, 0.1)';
        this.fsNoBtn.style.color = 'rgba(255, 255, 255, 0.9)';
        this.fsNoBtn.style.display = 'flex';
        this.fsNoBtn.style.justifyContent = 'center';
        this.fsNoBtn.style.alignItems = 'center';
        this.fsNoBtn.style.padding = '1%';
        this.fsNoBtn.style.fontSize = '54px';
        this.fsNoBtn.style.borderRadius = '20px';
        this.fsNoBtn.style.border = '4px solid rgba(255, 255, 255, 0.8)';
        this.fsNoBtn.style.cursor = 'pointer';
        btnContainer.appendChild(this.fsNoBtn);

        // Touch Events
        this.fsYesBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.enableFullscreen(); });
        this.fsYesBtn.addEventListener('click', () => this.enableFullscreen());

        this.fsNoBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.disableFullscreen(); });
        this.fsNoBtn.addEventListener('click', () => this.disableFullscreen());

        this.uiContainer.appendChild(this.fsDialog);
    }

    toggleFullscreenDialog() {
        // Only for touch devices? User said "This fullscreen feature is only for smartphones."
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isTouchDevice) return;

        this.isFullscreenDialogOpen = !this.isFullscreenDialogOpen;

        if (this.isFullscreenDialogOpen) {
            this.fsDialog.style.opacity = '1';
            this.fsDialog.style.pointerEvents = 'auto';
        } else {
            this.fsDialog.style.opacity = '0';
            this.fsDialog.style.pointerEvents = 'none';
        }

        // Reset cooldown
        this.inputCooldown = 0.5;
    }

    enableFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
        this.isFullscreenDialogOpen = false;
        this.fsDialog.style.opacity = '0';
        this.fsDialog.style.pointerEvents = 'none';
    }

    disableFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => {
                console.log(`Error attempting to exit fullscreen: ${err.message}`);
            });
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
        this.isFullscreenDialogOpen = false;
        this.fsDialog.style.opacity = '0';
        this.fsDialog.style.pointerEvents = 'none';
    }

    handleFullscreenInput() {
        const input = this.game.inputManager.getInput();

        if (input.cancel && (!this.inputCooldown || this.inputCooldown <= 0)) {
            this.toggleFullscreenDialog();
            this.inputCooldown = 0.5;
        }

        if (this.isFullscreenDialogOpen) {
            if (!this.inputCooldown || this.inputCooldown <= 0) {
                if (input.confirm || input.attack) { // A Button / Yes
                    this.enableFullscreen();
                    this.inputCooldown = 0.5;
                } else if (input.item) { // B Button / No
                    this.disableFullscreen();
                    this.inputCooldown = 0.5;
                }
            }
            return true; // Dialog is open, should pause
        }
        return false;
    }
}

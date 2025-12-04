import * as THREE from 'three';
import { audioManager } from '../GameEngine/AudioManager.js';
import { ChargeEffect } from './ChargeEffect.js';
import { textureManager } from '../GameEngine/TextureManager.js';

export class Player {
    GRAVITY_FACTOR = 0.35;
    spawnPosition = new THREE.Vector3(-8, 0, 0.003);
    constructor(scene, bulletManager, inputManager) {
        this.scene = scene;
        this.bulletManager = bulletManager;
        this.inputManager = inputManager;

        this.speed = 5;
        this.maxHp = 100;
        this.hp = 100;
        this.magic = 100;
        this.lives = 3;
        this.isDead = false;
        this.isInvulnerable = false;
        this.invulnerableTime = 0;
        this.inventory = null; // 'health' or 'magic'
        this.radius = 0.4;
        this.time = 0; // For floating animation

        this.isIntro = true; // Start in intro mode

        this.mesh = null;
        this.velocity = new THREE.Vector3();
        this.chargeEffect = new ChargeEffect(this.scene);
        this.setupMesh();
    }

    setupMesh() {
        const texture = textureManager.getTexture('TextureImage/player_wizard.png');
        if (texture) {
            const geometry = new THREE.PlaneGeometry(1.5, 1.5);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.position.set(this.spawnPosition.x, this.spawnPosition.y, this.spawnPosition.z); // Start off-screen left
            this.scene.add(this.mesh);
        }
    }

    update(deltaTime) {
        if (!this.mesh) return;

        this.time += deltaTime;

        // Death Animation
        if (this.isDead) {
            // Apply Knockback Velocity
            this.mesh.position.addScaledVector(this.velocity, deltaTime);

            // Shrink and Fade
            const shrinkSpeed = 0.08;
            const currentScale = this.mesh.scale.x;
            if (currentScale > 0) {
                const newScale = Math.max(0, currentScale - shrinkSpeed * deltaTime);
                this.mesh.scale.setScalar(newScale);
                this.mesh.material.opacity = newScale; // Fade with scale
            }
            // Apply Gravity while fading
            this.velocity.y -= 9.8 * deltaTime * this.GRAVITY_FACTOR; // Gravity

            return;
        }

        // Intro Animation
        if (this.isIntro) {
            this.velocity.set(2, 0, 0);
            this.mesh.position.addScaledVector(this.velocity, deltaTime);

            if (this.mesh.position.x >= -5) {
                this.mesh.position.x = -5;
                this.isIntro = false;
                this.velocity.set(0, 0, 0);

                // Reset attack charge to prevent auto-fire
                const inputState = this.inputManager.getInput();
                if (inputState.attack) {
                    inputState.attackStartTime = Date.now();
                } else {
                    inputState.attackStartTime = 0;
                }
                inputState.attackDuration = 0;
            }
            return; // Skip other updates during intro
        }

        // Magic Recovery (1 per second)
        if (this.magic < 100) {
            this.magic += 1 * deltaTime;
            if (this.magic > 100) this.magic = 100;
        }

        // Invulnerability Blink Logic
        if (this.isInvulnerable) {
            this.invulnerableTime -= deltaTime;

            // Blink 2 times per second (Period = 0.5s)
            // Visible for 0.25s, Invisible/Red for 0.25s
            const blinkPeriod = 0.5;
            const phase = this.invulnerableTime % blinkPeriod;

            if (phase > blinkPeriod / 2) {
                this.mesh.visible = true;
                // If damaged (short invulnerability), flash red.
                // We use a threshold to distinguish damage invuln (2s) from respawn (5s) if needed,
                // but spec says "red silhouette after taking damage".
                // Let's just use red tint when invulnerable from damage.
                // Since we don't track source, we'll assume < 2.1s is damage range usually, 
                // but respawn counts down through it. 
                // However, respawn sets color to white. Damage sets to red.
                // So we just toggle opacity/visibility.
                this.mesh.material.opacity = 1.0;
            } else {
                // Flicker opacity
                this.mesh.material.opacity = 0.2;
            }

            if (this.invulnerableTime <= 0) {
                this.isInvulnerable = false;
                this.mesh.visible = true;
                this.mesh.material.opacity = 1.0;
                this.mesh.material.color.setHex(0xffffff);
            }
        }

        // Movement
        const input = this.inputManager.getInput();
        this.velocity.set(0, 0, 0);

        // Analog Movement (Priority)
        if (input.moveVector && (input.moveVector.x !== 0 || input.moveVector.y !== 0)) {
            // moveVector is already normalized (max length 1) in InputManager
            // Multiply by speed
            this.velocity.set(input.moveVector.x, input.moveVector.y, 0).multiplyScalar(this.speed);
        } else {
            // Digital Movement (Fallback)
            // If left and right or top and bottom are input at the same time,
            // the process that is judged later in the left and right and top
            // and bottom detection process adds it to the current value
            // and cancels it out, so that it is treated as if it was not input.
            if (input.left) this.velocity.x = -1;
            if (input.right) this.velocity.x += 1;
            if (input.up) this.velocity.y = 1;
            if (input.down) this.velocity.y += -1;

            // Normalize if moving diagonally
            if (this.velocity.lengthSq() > 0) {
                this.velocity.normalize().multiplyScalar(this.speed);
            }
        }

        // Floating Sway (Sine wave on Y)
        // Amplitude: 0.25 (speed modification), Frequency: 3.0
        this.velocity.y += Math.sin(this.time * 3.0) * 0.25;

        // Apply Velocity
        this.mesh.position.addScaledVector(this.velocity, deltaTime);

        // Clamp to screen (16:9 aspect ratio, height ~9 units, width ~16 units)
        // Screen limits: x: -8 to 8, y: -4.5 to 4.5
        // Player size: 1x1 (radius 0.5)
        // Bounds: x: -6.7 to 6.7, y: -3.7 to 3.7
        this.mesh.position.x = Math.max(-6.7, Math.min(6.7, this.mesh.position.x));
        this.mesh.position.y = Math.max(-3.7, Math.min(3.7, this.mesh.position.y));

        // Attack
        if (input.attack) {
            // Charging handled by InputManager duration
        } else {
            // On release
            const chargeTime = this.inputManager.getDuration('attack');
            if (chargeTime > 0) {
                this.fire(chargeTime);
            }
            this.chargeEffect.stop();
        }

        // Update Charge Effect
        if (input.attack) {
            const chargeTime = this.inputManager.getDuration('attack');
            this.chargeEffect.update(deltaTime, chargeTime, this.mesh.position, this.magic);
        } else {
            this.chargeEffect.update(deltaTime, 0, this.mesh.position, this.magic);
        }

        // Item Use
        if (input.item) {
            this.useItem();
        }
    }

    fire(chargeTime) {
        // Clamp charge time to max 5 seconds
        const t = Math.min(chargeTime, 5.0);

        // Calculate Power
        let power = 1;
        if (t >= 1.0) {
            power = Math.pow(2, t);
        }

        // Check Magic
        if (this.magic < power) {
            power = this.magic;
        }

        // If there is no magic, do not fire.
        if (this.magic < 1) {
            return;
        }

        // Deduct Magic
        this.magic -= power;

        // Calculate Size (0.3 at Power 1, 2.0 at Power 32)
        // Linear interpolation based on power
        // t=0->1 (p=1), t=5->32 (p=32)
        // We map Power 1..32 to Size 0.3..2.0
        // This means size scales with power, which scales exponentially with time.
        const minPower = 1;
        const maxPower = 32;
        const minSize = 0.3;
        const maxSize = 2.0;

        // Avoid division by zero if maxPower == minPower (unlikely)
        const ratio = (power - minPower) / (maxPower - minPower);
        // Clamp ratio for safety (e.g. if power < 1 due to low magic)
        const clampedRatio = Math.max(0, Math.min(1, ratio));

        const size = minSize + (maxSize - minSize) * clampedRatio;

        // Calculate Color (Yellow to Red)
        // Yellow: 0xFFFF00 (R=255, G=255, B=0)
        // Red:    0xFF0000 (R=255, G=0,   B=0)
        // Interpolate Green from 255 to 0
        const g = Math.floor(255 * (1 - clampedRatio));
        const color = (0xFF << 16) | (g << 8) | 0x00;

        this.bulletManager.spawnBullet(this.mesh.position, size, power, color);
        audioManager.playSFX('attack_player');
    }

    useItem() {
        if (!this.inventory) return;

        if (this.inventory === 'health') {
            if (this.hp < 100) {
                this.hp = 100;
                audioManager.playSFX('item_use');
            } else {
                this.lives++;
                audioManager.playSFX('1up');
            }
        } else if (this.inventory === 'magic') {
            if (this.magic < 100) {
                this.magic = 100;
                audioManager.playSFX('item_use');
            } else {
                // TODO : Add new specification as the game screen will flash
                // and all enemies will take 32 damage.
                audioManager.playSFX('flush');
            }
        }

        this.inventory = null;
    }

    collectItem(type) {
        this.inventory = type;
        audioManager.playSFX('item_get');
    }

    takeDamage(amount) {
        if (this.isInvulnerable || this.isDead) return;

        this.hp -= amount;
        audioManager.playSFX('damage');

        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        } else {
            // Invulnerable for 2 seconds
            this.isInvulnerable = true;
            this.invulnerableTime = 2.0;
            // Flash red
            this.mesh.material.color.setHex(0xff0000);
        }
    }

    die() {
        this.isDead = true;
        this.lives--;
        // audioManager.playSFX('player_death'); 

        // Knockback velocity (Upwards)
        const knockbackVec =
            this.velocity.clone().multiplyScalar(-1)
                .normalize().multiplyScalar(this.speed * 0.25)
                .add(new THREE.Vector3(0, 1.25, 0));
        this.velocity.copy(knockbackVec);
        // this.velocity.add(new THREE.Vector3(0, 2.0, 0));

        if (this.lives >= 0) {
            // Respawn after delay
            setTimeout(() => {
                this.respawn();
            }, 3000);
        }
    }

    respawn() {
        this.isDead = false;
        this.hp = this.maxHp;
        this.magic = 100;
        this.mesh.visible = true;
        this.mesh.scale.setScalar(1); // Reset scale
        this.mesh.material.opacity = 1; // Reset opacity
        this.mesh.position.set(this.spawnPosition.x, this.spawnPosition.y, this.spawnPosition.z);
        this.isIntro = true;

        // Invulnerable for 3 seconds
        this.isInvulnerable = true;
        this.invulnerableTime = 3.0;
        this.mesh.material.color.setHex(0xffffff);
    }
}

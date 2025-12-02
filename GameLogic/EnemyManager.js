import * as THREE from 'three';
import { BulletManager } from './BulletManager.js';
import { audioManager } from '../GameEngine/AudioManager.js';

export class EnemyManager {
    constructor(scene, bulletManager, player) {
        this.scene = scene;
        this.bulletManager = bulletManager;
        this.player = player;
        this.enemies = [];
        this.totalTime = 0;
        this.isBossSpawned = false;
        this.hardFac = 1;
        this.lastSpawnTime = 0;
    }

    update(deltaTime) {
        this.totalTime += deltaTime;

        // TODO : In the future, I would like to create a pattern for
        // enemy characters to appear in order to show some kind of control.

        // Spawning Logic (Limit frequency to once every 0.4s)
        if (this.totalTime - this.lastSpawnTime > 0.4) {
            if (Math.random() < (0.011 * this.hardFac)) {
                this.spawnEnemy();
                this.lastSpawnTime = this.totalTime;
            }
        }

        // Item Box Spawn (Every 20s)
        if (Math.floor(this.totalTime) % 20 === 0 && Math.floor(this.totalTime - deltaTime) % 20 !== 0) {
            this.spawnEnemy('itembox');
        }

        // Boss Spawn (At 60s)
        if (Math.floor(this.totalTime) === 60 && Math.floor(this.totalTime - deltaTime) !== 60) {
            this.spawnEnemy('boss');
        }

        this.enemies.forEach(enemy => enemy.update(deltaTime, this.player));

        // Cleanup dead enemies
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.shouldRemove) {
                if (enemy.mesh) this.scene.remove(enemy.mesh);
                return false;
            }
            return true;
        });
    }

    spawnEnemy(forceType = null) {
        // If boss is active, only allow itembox
        if (forceType !== 'itembox') {
            if (this.isBossSpawned) {
                return;
            }
        }

        let type = 'ghost';
        if (forceType) {
            type = forceType;
        } else {
            // Progression
            // TODO : The fixed value of 60 set here stores the scroll end time, so it needs to be managed as a global variable in the game screen class. In the future, it will be necessary to be able to handle changes to the time it takes to reach the deepest part.
            const progressFac = this.totalTime / 60;
            if (this.totalTime > 8 && Math.random() < (0.18 + 0.22 * progressFac)) type = 'skeleton';
            if (this.totalTime > 16 && Math.random() < (0.10 + 0.1 * progressFac)) type = 'dragon';
        }

        const enemy = new Enemy(this.scene, type, this.bulletManager, this.hardFac);
        if (type === 'boss') {
            this.isBossSpawned = true;
        }
        this.enemies.push(enemy);
    }
}

class Enemy {
    GRAVITY_FACTOR = 0.35
    constructor(scene, type, bulletManager, hardFac = 1) {
        this.scene = scene;
        this.type = type;
        this.bulletManager = bulletManager;
        this.active = true;
        this.timeAlive = 0;
        this.shootTimer = 0;
        this.state = 'entering'; // Start in entering state

        // Randomize size
        const varFac = Math.random() * 0.15;

        // Visuals
        const loader = new THREE.TextureLoader();
        let texturePath = 'TextureImage/enemy_ghost.png';
        let width = 1.2 + varFac;
        let height = 1.2 + varFac;

        if (type === 'skeleton') {
            texturePath = 'TextureImage/enemy_skeleton.png';
            width = 2 + varFac;
            height = 2 + varFac;
        } else if (type === 'dragon') {
            texturePath = 'TextureImage/enemy_dragon.png';
            width = 3.2 + varFac;
            height = 3.2 + varFac;
        } else if (type === 'boss') {
            texturePath = 'TextureImage/enemy_boss.png';
            width = 5.5;
            height = 5.5;
        } else if (type === 'itembox') {
            texturePath = 'TextureImage/item_box.png';
            width = 1;
            height = 1;
        }

        loader.load(texturePath, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            this.createEnemyMesh(texture, width, height, null);
        }, undefined, () => {
            // Fallback
            let color = 0xffffff;
            if (this.type === 'ghost') color = 0xaaaaaa;
            else if (this.type === 'skeleton') color = 0xdddddd;
            else if (this.type === 'dragon') color = 0x00ff00;
            else if (this.type === 'boss') color = 0x8B4513;
            else if (this.type === 'itembox') color = 0x808080;

            this.createEnemyMesh(null, width, height, color);
        });

        // TODO : hardFac is a multiplier value that will be used as a parameter to change
        //  the difficulty in the optional game mode settings that will be developed later.

        // TODO : Since varFac is random, the enemy collision radius should be based on the enemy size.
        //  Ideally, pixel-perfect collision detection would be ideal,
        //  but considering that this will be replaced by 3D models in the future,
        //  it seems safer to stick with collision detection based on radius distance.

        // Stats
        if (this.type === 'ghost') {
            this.hp = (1) * hardFac;
            this.speed = 2.5;
            this.radius = 0.4;
            this.attackDamage = 10;
            this.scoreValue = 100;
        } else if (this.type === 'skeleton') {
            this.hp = (32 * 0.20) * hardFac;
            this.speed = 1.5;
            this.radius = 0.65;
            this.attackDamage = 15;
            this.scoreValue = 300;
        } else if (this.type === 'dragon') {
            this.hp = (32 * 0.5) * hardFac;
            this.speed = 1;
            this.radius = 0.9;
            this.attackDamage = 20;
            this.scoreValue = 1000;
        } else if (this.type === 'boss') {
            this.hp = (32 * 6.00) * hardFac;
            this.speed = 1.4;
            this.radius = 1.2;
            this.attackDamage = 30;
            this.scoreValue = 10000;
            audioManager.playBGM('Boss');
        } else if (this.type === 'itembox') {
            this.hp = (32 * 0.10) * hardFac;
            this.speed = 0.6;
            this.radius = 0.4;
            this.attackDamage = 0;
            this.scoreValue = 10;
        }

        this.velocity = new THREE.Vector3();
        this.flashTimer = 0;
    }

    createEnemyMesh(texture, width, height, color) {
        const geometry = new THREE.PlaneGeometry(width, height);
        let material;
        if (texture) {
            material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        } else {
            material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
        }

        this.mesh = new THREE.Mesh(geometry, material);

        if (this.type === 'boss') {
            this.mesh.position.set(7 + width, 0, 0); // Start off-screen right
        } else if (this.type === 'itembox') {
            this.mesh.position.set(7 + width, (Math.random() - 0.5) * (6.5 - height * 0.5), 0.002);
        } else {
            // Random start Y
            const y = (Math.random() - 0.5) * (7.5 - height * 0.5); // random * (max - half of height) as consider character size
            this.mesh.position.set(7 + width, y, 0); // Start off-screen right
        }
        this.scene.add(this.mesh);
    }

    update(deltaTime, player) {
        if (!this.mesh) return;
        this.timeAlive += deltaTime;
        this.shootTimer += deltaTime;

        // Flash Logic
        if (this.flashTimer > 0) {
            this.flashTimer -= deltaTime;
            if (this.flashTimer <= 0) {
                this.mesh.material.color.set(0xffffff);
                this.flashTimer = 0;
            }
        }

        // Fading Logic
        if (this.isFading) {
            this.fadeTime -= deltaTime;
            const alpha = Math.max(0, this.fadeTime / 1);
            if (this.mesh.material) {
                this.mesh.material.opacity = alpha;
                this.mesh.material.transparent = true; // Ensure transparency is enabled
            }

            // Shrink while fading (Dispersion effect)
            const scale = 1 - (1 - this.fadeTime) * 0.08;
            this.mesh.scale.setScalar(scale);

            if (this.fadeTime <= 0) {
                this.shouldRemove = true;
            }

            // Apply Gravity while fading
            this.velocity.y -= 9.8 * deltaTime * this.GRAVITY_FACTOR; // Gravity

            // Do NOT return here, allow movement logic to run (which will apply velocity)
        } else {
            // Only run entrance/active logic if NOT fading
            // Entrance Logic
            if (this.state === 'entering') {
                if (this.type === 'boss') {
                    // Move to x=2 from right (starts at 10)
                    if (this.mesh.position.x > 3.5) {
                        this.velocity.set(-this.speed, 0, 0);
                    } else {
                        this.mesh.position.x = 3.5; // Snap to target
                        this.state = 'active';
                        this.velocity.set(0, 0, 0);
                    }
                } else {
                    // Others enter instantly/are already placed
                    this.state = 'active';
                    // Initialize velocity based on type
                    if (this.type === 'ghost') {
                        const sy = (Math.random() - 0.5) * this.speed * 0.25;
                        this.velocity.set(-this.speed, sy, 0);
                    } else if (this.type === 'skeleton') {
                        const sy = (Math.random() - 0.5) * this.speed * 0.3;
                        this.velocity.set(-this.speed, sy, 0);
                    } else if (this.type === 'dragon') {
                        this.velocity.set(-this.speed, 0, 0);
                    } else if (this.type === 'itembox') {
                        this.velocity.set(-this.speed, 0, 0);
                    }
                }
            }

            if (this.state === 'active') {
                // Movement Logic
                if (this.type === 'ghost') {
                    // Constant velocity, already set
                } else if (this.type === 'skeleton') {
                    // Zigzag: Modify Y component of velocity
                    this.velocity.y = Math.cos(this.timeAlive * 5) * 2;

                    // Shoot
                    if (this.shootTimer > 2) {
                        this.bulletManager.spawnEnemyBullet(this.mesh.position, new THREE.Vector3(-5, 0, 0), 'energy', 0.5);
                        audioManager.playSFX('attack_enemy');
                        this.shootTimer = 0;
                    }
                } else if (this.type === 'dragon') {
                    // Chase player Y (Update every 1 second)
                    if (Math.floor(this.timeAlive) > Math.floor(this.timeAlive - deltaTime)) {
                        if (player && player.mesh) {
                            const before_vx = this.velocity.x;
                            const playerDirection = player.mesh.position.clone().sub(this.mesh.position).normalize();
                            const targetVelocity = playerDirection.multiplyScalar(this.speed);
                            this.velocity.lerp(targetVelocity, 0.5);
                            this.velocity.x = before_vx;
                            this.velocity.z = 0; // Ensure no Z movement
                        }
                    }

                    // Fire
                    if (Math.floor(this.timeAlive) % 2 === 0 && Math.floor(this.timeAlive - deltaTime) % 2 !== 0) {
                        const defaultVec = new THREE.Vector3(-1, 0, 0); // Default left
                        const bulletVec = new THREE.Vector3(-1, 0, 0); // Default left
                        if (player && player.mesh) {
                            // Aim at player
                            bulletVec.subVectors(player.mesh.position, this.mesh.position).normalize();
                            bulletVec.lerp(defaultVec, 0.65); // slightly aim to forward
                        }
                        bulletVec.multiplyScalar(7);
                        this.bulletManager.spawnEnemyBullet(this.mesh.position, bulletVec, 'fire', 0.8);
                        audioManager.playSFX('attack_enemy');
                    }
                } else if (this.type === 'boss') {
                    // Up and down
                    this.velocity.y = Math.cos(this.timeAlive) * 3;

                    // Spiral attack
                    if (this.shootTimer > 0.2) {
                        const angle = this.timeAlive * 1.5;
                        const dir = new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0).multiplyScalar(2);
                        this.bulletManager.spawnEnemyBullet(this.mesh.position, dir, 'nut', 0.45);
                        audioManager.playSFX('attack_enemy');
                        this.shootTimer = 0;
                    }
                }
            }
        }

        // Apply Velocity
        this.mesh.position.addScaledVector(this.velocity, deltaTime);

        // Bounds check
        if (this.mesh.position.x < -10) {
            this.active = false;
            this.shouldRemove = true; // Immediate removal
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
        } else {
            this.mesh.material.color.set(0xff0000);
            this.flashTimer = 0.1;
        }
    }

    die() {
        this.active = false;
        this.isFading = true;
        this.fadeTime = 1;

        // Drop item if itembox
        // Dropped item velocity must be inherited before the item box has knockback velocity applied.
        if (this.type === 'itembox') {
            this.droppedItem = Math.random() < 0.5 ? 'health' : 'magic';
            // Pass current velocity to spawnItem so item continues moving
            this.dropVelocity = this.velocity.clone();
        }

        // Apply Knockback (Retreat slightly)
        // Add a positive X velocity (rightwards)
        this.velocity.add(new THREE.Vector3(this.speed * 1.0, 0, 0));

        audioManager.playSFX('enemy_death');

    }
}

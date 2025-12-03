import * as THREE from 'three';
import { BaseScene } from '../GameEngine/BaseScene.js';
import { Player } from '../GameLogic/Player.js';
import { EnemyManager } from '../GameLogic/EnemyManager.js';
import { BulletManager } from '../GameLogic/BulletManager.js';
import { ItemManager } from '../GameLogic/ItemManager.js';
import { audioManager } from '../GameEngine/AudioManager.js';
import { textureManager } from '../GameEngine/TextureManager.js';

export class ShootingScreen extends BaseScene {
    setup() {
        this.score = 0;
        this.displayScore = 0;
        this.isGameOver = false;
        this.bossMaxHp = -1;
        this.stageTime = 0;

        // Setup Scene
        // this.scene.background = new THREE.Color(0x000000); // Replaced with scrolling BG

        // Background
        this.backgroundGroup = new THREE.Group();
        this.scene.add(this.backgroundGroup);

        const texture = textureManager.getTexture('TextureImage/stage1_atlas.png');
        if (texture) {
            const meshWidth = 9;
            const meshHeight = 9;
            const geometry = new THREE.PlaneGeometry(meshWidth, meshHeight);

            for (let i = 0; i < 16; i++) {
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
                mesh.position.x = i * meshWidth;
                this.backgroundGroup.add(mesh);
            }

            // Initial Position: Left edge at screen left (-8)
            this.backgroundGroup.position.x = -2.4;
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 10, 10);
        this.scene.add(directionalLight);

        // Managers : Order is important
        this.bulletManager = new BulletManager(this.scene);
        this.player = new Player(this.scene, this.bulletManager, this.game.inputManager);
        this.itemManager = new ItemManager(this.scene);
        this.enemyManager = new EnemyManager(this.scene, this.bulletManager, this.player);

        // UI
        this.createUI();

        // Audio
        audioManager.playBGM('Game');
    }

    createUI() {
        // HUD Container
        const hud = document.createElement('div');
        hud.style.position = 'absolute';
        hud.style.top = '0';
        hud.style.left = '0';
        hud.style.width = '100%';
        hud.style.height = '100%';
        hud.style.pointerEvents = 'none';
        hud.style.fontFamily = 'serif';
        hud.style.color = 'white';
        hud.style.textShadow = '1px 1px 2px black';

        // 1. Score (Top Center)
        this.scoreElement = document.createElement('div');
        this.scoreElement.style.position = 'absolute';
        this.scoreElement.style.top = '10px';
        this.scoreElement.style.left = '50%';
        this.scoreElement.style.transform = 'translateX(-50%)';
        this.scoreElement.style.fontSize = '32px';
        this.scoreElement.style.fontWeight = 'bold';
        this.scoreElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.75)';
        this.scoreElement.style.letterSpacing = '2px';
        this.scoreElement.innerText = '0000000000';
        hud.appendChild(this.scoreElement);

        // Container for Gauges/Items/Lives (Row below score)
        const statsRowTop = '64px';

        // 2. Health Gauge
        const healthContainer = document.createElement('div');
        healthContainer.style.position = 'absolute';
        healthContainer.style.top = statsRowTop;
        healthContainer.style.left = '32px';
        healthContainer.style.width = '650px';
        healthContainer.style.height = '24px';
        healthContainer.style.border = '4px solid gold';
        healthContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';

        this.healthBar = document.createElement('div');
        this.healthBar.style.width = '100%';
        this.healthBar.style.height = '100%';
        this.healthBar.style.backgroundColor = 'green';
        healthContainer.appendChild(this.healthBar);
        hud.appendChild(healthContainer);

        // Health Value
        this.healthValue = document.createElement('div');
        this.healthValue.style.position = 'absolute';
        this.healthValue.style.top = statsRowTop;
        this.healthValue.style.left = '700px';
        this.healthValue.style.fontSize = '32px';
        this.healthValue.style.fontWeight = 'bold';
        this.healthValue.style.textShadow = '2px 2px 4px rgba(0,0,0,0.75)';
        this.healthValue.style.verticalAlign = 'baseline';
        this.healthValue.style.transform = 'translateY(-5px)';
        this.healthValue.innerText = '100';
        hud.appendChild(this.healthValue);

        // 3. Magic Gauge
        const magicContainer = document.createElement('div');
        magicContainer.style.position = 'absolute';
        magicContainer.style.top = '110px'; // Below health
        magicContainer.style.left = '32px';
        magicContainer.style.width = '650px';
        magicContainer.style.height = '24px';
        magicContainer.style.border = '4px solid rgba(37, 70, 177, 1)';
        magicContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';

        this.magicBar = document.createElement('div');
        this.magicBar.style.width = '100%';
        this.magicBar.style.height = '100%';
        this.magicBar.style.backgroundColor = 'lightblue';
        magicContainer.appendChild(this.magicBar);
        hud.appendChild(magicContainer);

        // Magic Value
        this.magicValue = document.createElement('div');
        this.magicValue.style.position = 'absolute';
        this.magicValue.style.top = '110px';
        this.magicValue.style.left = '700px';
        this.magicValue.style.fontSize = '32px';
        this.magicValue.style.fontWeight = 'bold';
        this.magicValue.style.textShadow = '2px 2px 4px rgba(0,0,0,0.75)';
        this.magicValue.style.verticalAlign = 'baseline';
        this.magicValue.style.transform = 'translateY(-5px)';
        this.magicValue.innerText = '100';
        hud.appendChild(this.magicValue);

        // 4. Owned Item (Ruby Frame) - Center of screen (below score?)
        // User said "center of the game screen".
        // Let's place it at top center, below score.
        const itemContainer = document.createElement('div');
        itemContainer.style.position = 'absolute';
        itemContainer.style.top = '60px';
        itemContainer.style.left = '50%';
        itemContainer.style.transform = 'translateX(-50%)';
        itemContainer.style.width = '96px';
        itemContainer.style.height = '96px';
        itemContainer.style.borderRadius = '20%';
        itemContainer.style.border = '3px solid #E0115F'; // Ruby color
        itemContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
        itemContainer.style.boxShadow = '0 0 5px #E0115F';

        this.itemIcon = document.createElement('img');
        this.itemIcon.style.width = '100%';
        this.itemIcon.style.height = '100%';
        this.itemIcon.style.display = 'none';
        itemContainer.appendChild(this.itemIcon);
        hud.appendChild(itemContainer);

        // 5. Lives (Witch Hat Icon) - Right side
        this.livesContainer = document.createElement('div');
        this.livesContainer.style.position = 'absolute';
        this.livesContainer.style.top = statsRowTop;
        this.livesContainer.style.right = statsRowTop;
        this.livesContainer.style.width = '96px';
        this.livesContainer.style.height = '96px';
        this.livesContainer.style.backgroundImage = 'url("TextureImage/icon_hat.png")';
        this.livesContainer.style.backgroundSize = 'contain';
        this.livesContainer.style.backgroundRepeat = 'no-repeat';
        this.livesContainer.style.backgroundPosition = 'center';

        this.livesText = document.createElement('div');
        this.livesText.style.position = 'absolute';
        this.livesText.style.top = '50%';
        this.livesText.style.left = '50%';
        this.livesText.style.transform = 'translate(-50%, -40%)'; // Adjust for hat shape
        this.livesText.style.color = 'rgba(255,255,128,1)';
        this.livesText.style.fontSize = '32px';
        this.livesText.style.fontWeight = 'bold';
        this.livesText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.75)';
        this.livesText.innerText = '03';
        this.livesContainer.appendChild(this.livesText);
        hud.appendChild(this.livesContainer);

        // 6. Boss HP Bar (Bottom Center)
        this.bossHpContainer = document.createElement('div');
        this.bossHpContainer.style.position = 'absolute';
        this.bossHpContainer.style.bottom = '20px';
        this.bossHpContainer.style.left = '50%';
        this.bossHpContainer.style.transform = 'translateX(-50%)';
        this.bossHpContainer.style.width = '60%';
        this.bossHpContainer.style.height = '20px';
        this.bossHpContainer.style.border = '3px solid gold';
        this.bossHpContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.bossHpContainer.style.display = 'none'; // Hidden by default
        this.bossHpContainer.style.transition = 'opacity 1s';

        this.bossHpBar = document.createElement('div');
        this.bossHpBar.style.width = '100%';
        this.bossHpBar.style.height = '100%';
        this.bossHpBar.style.backgroundColor = 'red';
        this.bossHpBar.style.transition = 'width 0.2s';
        this.bossHpContainer.appendChild(this.bossHpBar);
        hud.appendChild(this.bossHpContainer);

        // 7. Victory Text (Hidden by default)
        this.victoryText = document.createElement('div');
        this.victoryText.style.position = 'absolute';
        this.victoryText.style.top = '50%';
        this.victoryText.style.left = '50%';
        this.victoryText.style.transform = 'translate(-50%, -50%)';
        this.victoryText.style.fontSize = '80px';
        this.victoryText.style.fontWeight = 'bold';
        this.victoryText.style.color = 'gold';
        this.victoryText.style.textShadow = '0 0 20px white, 2px 2px 4px black';
        this.victoryText.style.fontFamily = 'serif';
        this.victoryText.style.opacity = '0';
        this.victoryText.style.transition = 'opacity 1s';
        this.victoryText.innerText = 'Victory!!';
        hud.appendChild(this.victoryText);

        this.uiContainer.appendChild(hud);

        this.uiContainer.appendChild(hud);
    }

    spawnItem(position, type, velocity) {
        this.itemManager.spawnItem(position, type, velocity);
    }

    update(deltaTime) {
        super.update(deltaTime);

        // Check for Fullscreen Dialog
        if (this.handleFullscreenInput()) return;

        if (this.isGameOver) return;

        this.player.update(deltaTime);
        this.bulletManager.update(deltaTime);
        this.enemyManager.update(deltaTime, this.player);
        this.itemManager.update(deltaTime);

        // Scroll Background
        // Scroll Background
        if (this.backgroundGroup) {
            this.stageTime += deltaTime;

            // TODO : The fixed value of the scroll end time,
            //  so it needs to be managed as a global variable in the game screen class.
            //  In the future, it will be necessary to be able to handle changes
            //  to the time it takes to reach the deepest part.

            // Easing Logic
            // Total distance 132.6 units over 60 seconds
            // Ease-in (3s) -> Constant (54s) -> Ease-out (3s)
            // Max Speed v = 132.6 / (3*0.5 + 54 + 3*0.5) = 132.6 / 57
            const maxSpeed = 132.6 / (60 - (3 + 5) * 0.5);
            let speed = 0;

            if (this.stageTime < 3) {
                speed = maxSpeed * (this.stageTime / 3);
            } else if (this.stageTime < 55) {
                speed = maxSpeed;
            } else if (this.stageTime < 60) {
                speed = maxSpeed * ((60 - this.stageTime) / 5);
            } else {
                speed = 0;
            }

            if (this.backgroundGroup.position.x > -132.6) { // -132.6 Allow slightly more range to ensure completion
                this.backgroundGroup.position.x -= speed * deltaTime;
            }
        }

        // Collision Detection
        this.checkCollisions();

        // Update UI
        this.updateUI();

        // Check Game Over
        if (this.player.lives < 0) {
            setTimeout(() => {
                this.transitionTo('GameOver');
            }, 3000);
        }
    }

    checkCollisions() {
        const enemies = this.enemyManager.enemies;

        // Enemy Bullets/Bodies vs Player
        const enemyBullets = this.bulletManager.enemyBullets;

        if (!this.player.isDead && !this.player.isInvulnerable && !this.transitioning) {
            // Check bullets
            enemyBullets.forEach(bullet => {
                if (bullet.active && this.isColliding(bullet, this.player)) {
                    if (bullet.damage > 0) {
                        this.player.takeDamage(bullet.damage);
                        this.bulletManager.deactivate(bullet);
                    }
                }
            });

            // Check bodies
            enemies.forEach(enemy => {
                if (enemy.active && this.isColliding(enemy, this.player)) {
                    // Item Box deals 0 damage, others deal attackDamage
                    if (enemy.attackDamage > 0) {
                        this.player.takeDamage(enemy.attackDamage);
                    }
                }
            });
        }

        // Player Bullets vs Enemies
        const playerBullets = this.bulletManager.bullets;

        playerBullets.forEach(bullet => {
            enemies.forEach(enemy => {
                if (enemy.state !== 'entering' && bullet.active && enemy.active && this.isColliding(bullet, enemy)) {
                    const restDamage = bullet.damage - enemy.hp
                    enemy.takeDamage(bullet.damage);
                    // When the enemy's HP is subtracted, if the bullet still has enough power to continue moving because
                    // "bullet.damage - enemy.hp > 0", the difference in power value
                    // will remain in the bullet and it will continue to move.
                    if (restDamage > 1 && bullet.damage > 0) {
                        // Changing the display of the bullet and the size of
                        // the hit detection when the attack power of the bullet changes. 
                        const sizeFac = restDamage / bullet.damage;
                        bullet.mesh.scale.multiplyScalar(sizeFac);
                        bullet.radius *= sizeFac;
                        // Adapt residual damage to bullets
                        bullet.damage = restDamage;
                    } else {
                        // Bullet Impact Effect
                        this.bulletManager.createImpact(bullet.mesh.position, bullet.mesh.material.color, bullet.radius * 1.3);
                        this.bulletManager.deactivate(bullet);
                    }

                    if (!enemy.active) {
                        // Enemy died
                        this.addScore(enemy.scoreValue || 0);
                        if (enemy.droppedItem) {
                            // Pass velocity to item so it moves with same speed/direction
                            this.spawnItem(enemy.mesh.position, enemy.droppedItem, enemy.dropVelocity);
                            enemy.droppedItem = null;
                        }
                    }
                }
            });
        });

        // Player vs Items
        const items = this.itemManager.items;
        if (!this.player.isDead) {
            items.forEach(item => {
                if (item.active && this.isColliding(item, this.player)) {
                    this.player.collectItem(item.type);
                    this.itemManager.collect(item);
                }
            });
        }
    }

    isColliding(obj1, obj2) {
        if (!obj1.mesh || !obj2.mesh) return false;
        const dist = obj1.mesh.position.distanceTo(obj2.mesh.position);
        const r1 = obj1.radius || 0.5;
        const r2 = obj2.radius || 0.5;
        return dist < (r1 + r2);
    }

    updateUI() {
        // Animate Score
        if (this.displayScore < this.score) {
            const diff = this.score - this.displayScore;
            const step = Math.ceil(diff * 0.1); // 10% per frame or at least 1
            this.displayScore += step;
            if (this.displayScore > this.score) this.displayScore = this.score;
        }

        this.scoreElement.innerText = this.displayScore.toString().padStart(10, '0');
        this.healthBar.style.width = `${this.player.hp}%`;
        this.magicBar.style.width = `${this.player.magic}%`;
        this.livesText.innerText = this.player.lives <= 0 ? '00' : this.player.lives.toString().padStart(2, '0');

        this.healthValue.innerText = Math.floor(this.player.hp).toString().padStart(3, '0');
        this.magicValue.innerText = Math.floor(this.player.magic).toString().padStart(3, '0');

        if (this.player.hp < 30) {
            this.healthBar.style.backgroundColor = 'red';
            if (this.player.hp < 10) {
                // Blink
                this.healthBar.style.opacity = Math.sin(Date.now() / 100) > 0 ? '1' : '0';
            } else {
                this.healthBar.style.opacity = '1';
            }
        } else {
            this.healthBar.style.backgroundColor = 'green';
            this.healthBar.style.opacity = '1';
        }

        // Update Item Icon
        if (this.player.inventory) {
            this.itemIcon.style.display = 'block';
            this.itemIcon.src = this.player.inventory === 'health' ? 'TextureImage/item_health.png' : 'TextureImage/item_magic.png';
        } else {
            this.itemIcon.style.display = 'none';
        }

        // Update Boss HP
        const boss = this.enemyManager.enemies.find(e => e.type === 'boss');
        if (boss && boss.active) {
            if (this.bossMaxHp < 0) {
                this.bossMaxHp = boss.hp;
            }
            this.bossHpContainer.style.display = 'block';
            this.bossHpContainer.style.opacity = '1';
            const hpPercent = (boss.hp / this.bossMaxHp) * 100; // Max HP is 100
            this.bossHpBar.style.width = `${hpPercent}%`;
            this.bossWasActive = true;
        } else {
            this.bossHpContainer.style.opacity = '0';
            // Wait for fade out to hide? Simple check for now.
            if (this.bossHpContainer.style.opacity === '0') {
                setTimeout(() => { if (!boss) this.bossHpContainer.style.display = 'none'; }, 1000);
            }

            // Check for Boss Defeat Transition
            if (this.bossWasActive && !this.isGameOver && !this.transitioning) {
                // Boss was active, now gone. Victory!
                this.transitioning = true;
                this.victory();
            }
        }
    }

    addScore(points) {
        this.score += points;
    }

    gameOver() {
        this.isGameOver = true;
        audioManager.stopBGM();
        setTimeout(() => {
            this.transitionTo('GameOver');
        }, 1500);
    }

    victory() {
        console.log("Victory! Transitioning to Epilogue...");
        audioManager.stopBGM();

        // Show Victory Text
        if (this.victoryText) {
            this.victoryText.style.opacity = '1';
        }

        // BaseScene transitionTo handles fade
        setTimeout(() => {
            this.transitionTo('Epilogue');
        }, 5000);
    }
}

import * as THREE from 'three';

export class BulletManager {
    constructor(scene) {
        this.scene = scene;
        this.bullets = [];
        this.enemyBullets = [];
        this.impacts = [];
    }

    spawnBullet(position, size, power, color) {
        // Player bullet
        const radius = 0.5 * size; // Visual size
        const geometry = new THREE.SphereGeometry(radius, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 1 });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.copy(position);
        this.scene.add(mesh);

        this.bullets.push({
            mesh: mesh,
            active: true,
            damage: power,
            velocity: new THREE.Vector3(10, 0, 0),
            radius: radius,
            isPlayerBullet: true
        });
    }

    spawnEnemyBullet(position, velocity, type, size = 0.5) {
        let color = 0xff00ff;
        if (type === 'fire') color = 0xff4500;
        else if (type === 'nut') color = 0x8B4513;

        // Ensure size is within 5-15% of screen height (9) -> 0.45 - 1.35
        size = Math.max(0.45, Math.min(1.35, size));

        const geometry = new THREE.SphereGeometry(size / 2, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 1 });
        const bullet = new THREE.Mesh(geometry, material);

        bullet.position.copy(position);
        this.scene.add(bullet);

        let damage = 10;
        if (type === 'fire') damage = 20;
        else if (type === 'nut') damage = 5;

        this.enemyBullets.push({
            mesh: bullet,
            velocity: velocity,
            active: true,
            radius: size / 2,
            isPlayerBullet: false,
            damage: damage
        });
    }

    createImpact(position, color, size) {
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        this.scene.add(mesh);

        this.impacts.push({
            mesh: mesh,
            life: 0.2 // seconds
        });
    }

    update(deltaTime) {
        // Player Bullets
        this.bullets.forEach(bullet => {
            if (!bullet.active) return;
            bullet.mesh.position.add(bullet.velocity.clone().multiplyScalar(deltaTime));
            if (Math.abs(bullet.mesh.position.x) > 10) this.deactivate(bullet, this.bullets);
        });

        // Enemy Bullets
        this.enemyBullets.forEach(bullet => {
            if (!bullet.active) return;
            bullet.mesh.position.add(bullet.velocity.clone().multiplyScalar(deltaTime));
            if (Math.abs(bullet.mesh.position.x) > 10 || Math.abs(bullet.mesh.position.y) > 6) {
                this.deactivate(bullet, this.enemyBullets);
            }
        });

        // Impacts
        this.impacts.forEach(impact => {
            impact.life -= deltaTime;
            const scale = 1 + (0.2 - impact.life) * 0.03; // Expand
            impact.mesh.scale.setScalar(scale);
            impact.mesh.material.opacity = impact.life / 0.2;

            if (impact.life <= 0) {
                this.scene.remove(impact.mesh);
                impact.active = false; // Mark for removal
            }
        });

        // Cleanup
        this.bullets = this.bullets.filter(b => b.active);
        this.enemyBullets = this.enemyBullets.filter(b => b.active);
        this.impacts = this.impacts.filter(i => i.life > 0);
    }

    deactivate(bullet, list) {
        bullet.active = false;
        if (bullet.mesh) this.scene.remove(bullet.mesh);
    }
}

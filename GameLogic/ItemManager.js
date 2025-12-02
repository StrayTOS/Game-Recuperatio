import * as THREE from 'three';

export class ItemManager {
    constructor(scene) {
        this.scene = scene;
        this.items = [];
    }

    spawnItem(position, type, velocity) {
        const loader = new THREE.TextureLoader();
        const texturePath = type === 'health' ? 'TextureImage/item_health.png' : 'TextureImage/item_magic.png';

        loader.load(texturePath, (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            const geometry = new THREE.PlaneGeometry(0.75, 0.75);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            this.setupItemMesh(mesh, position, type, velocity);
        }, undefined, () => {
            // Fallback
            const geometry = new THREE.PlaneGeometry(0.75, 0.75);
            const color = type === 'health' ? 0xff0000 : 0x0000ff;
            const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            this.setupItemMesh(mesh, position, type, velocity);
        });
    }

    setupItemMesh(mesh, position, type, velocity) {
        mesh.position.copy(position);
        this.scene.add(mesh);

        this.items.push({
            mesh: mesh,
            type: type,
            active: true,
            velocity: velocity ? velocity.clone() : new THREE.Vector3(-1, 0, 0) // Use passed velocity or default drift
        });
    }

    update(deltaTime) {
        this.items.forEach(item => {
            if (item.shouldRemove) return; // Already marked for removal

            if (item.isFading) {
                item.fadeTime -= deltaTime;
                const alpha = Math.max(0, item.fadeTime / 2.5);
                if (item.mesh && item.mesh.material) {
                    item.mesh.material.opacity = alpha;
                    item.mesh.material.transparent = true;
                }
                if (item.fadeTime <= 0) {
                    item.shouldRemove = true;
                }

                // If collected, move towards inventory frame (Top Center)
                if (item.isCollected) {
                    const target = new THREE.Vector3(0, 3.5, 0);
                    const dir = new THREE.Vector3().subVectors(target, item.mesh.position).normalize();
                    const speed = 15; // Fast speed
                    item.mesh.position.addScaledVector(dir, speed * deltaTime);

                    // If close to target, remove
                    if (item.mesh.position.distanceTo(target) < 0.5) {
                        item.shouldRemove = true;
                    }
                    return;
                }

                // If just fading (not collected, e.g. maybe timeout?), continue normal movement?
                // Currently only deactivate() sets isFading, which is used for off-screen.
                // But off-screen removes immediately.
                // So isFading is mainly for collection now.
                // But let's keep the return here to skip normal movement if fading.
                return;
            }

            if (!item.active) return;
            if (!item.mesh) return;

            item.mesh.position.add(item.velocity.clone().multiplyScalar(deltaTime));

            // Bounds check
            if (item.mesh.position.x < -10) {
                item.active = false;
                item.shouldRemove = true;
            }
        });

        // Cleanup
        this.items = this.items.filter(item => {
            if (item.shouldRemove) {
                if (item.mesh) this.scene.remove(item.mesh);
                return false;
            }
            return true;
        });
    }

    collect(item) {
        item.active = false;
        item.isFading = true;
        item.isCollected = true;
        item.fadeTime = 2.5;
    }

    // TODO: Is this method used? Remove it if it's no longer used.
    deactivate(item) {
        item.active = false;
        item.isFading = true;
        item.fadeTime = 2.5;
    }
}

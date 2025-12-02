import * as THREE from 'three';

export class ChargeEffect {
    constructor(scene) {
        this.scene = scene;
        this.maxParticles = 200;
        this.geometry = new THREE.BufferGeometry();

        // Attributes
        const positions = new Float32Array(this.maxParticles * 3);
        const sizes = new Float32Array(this.maxParticles);
        const opacities = new Float32Array(this.maxParticles);

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

        // Texture
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(175, 238, 238, 1)'); // Pale Blue
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;

        // Shader Material
        const material = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: texture }
            },
            vertexShader: `
                attribute float size;
                attribute float opacity;
                varying float vOpacity;
                void main() {
                    vOpacity = opacity;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying float vOpacity;
                void main() {
                    gl_FragColor = texture2D(pointTexture, gl_PointCoord);
                    gl_FragColor.a *= vOpacity;
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.system = new THREE.Points(this.geometry, material);
        this.system.frustumCulled = false; // Always render
        this.scene.add(this.system);

        // Pool logic
        this.pool = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.pool.push({
                index: i,
                active: false,
                life: 0,
                maxLife: 0,
                velocity: new THREE.Vector3(),
                position: new THREE.Vector3()
            });
        }

        this.spawnTimer = 0;
    }

    update(deltaTime, chargeTime, playerPosition, currentMagic = 100) {
        if (!playerPosition) return;

        // Calculate intensity based on chargeTime (0 to 5)
        // Cap based on available magic
        // Power = 2^t. Max Power <= Magic.
        // t <= log2(Magic).
        const maxTime = (currentMagic > 1) ? Math.log2(currentMagic) : 0;
        const effectiveTime = Math.min(chargeTime, maxTime);
        const intensity = Math.max(0, Math.min(effectiveTime, 5.0) / 5.0); // 0 to 1

        // Spawn Logic
        // More charge = faster spawn
        const spawnInterval = 0.1 - (intensity * 0.08); // 0.1s down to 0.02s
        this.spawnTimer += deltaTime;

        if (chargeTime > 0) {
            while (this.spawnTimer > spawnInterval) {
                this.spawnTimer -= spawnInterval;
                this.spawnParticle(playerPosition, intensity);
            }
        } else {
            this.spawnTimer = 0;
        }

        // Update Particles
        const positions = this.geometry.attributes.position.array;
        const sizes = this.geometry.attributes.size.array;
        const opacities = this.geometry.attributes.opacity.array;
        let activeCount = 0;

        this.pool.forEach(p => {
            if (p.active) {
                p.life -= deltaTime;
                if (p.life <= 0) {
                    p.active = false;
                    opacities[p.index] = 0;
                } else {
                    // Lerp velocity to player direction
                    const particleSpeed = p.velocity.length();
                    const playerDirection = playerPosition.clone().sub(p.position).normalize().normalize();
                    const targetVelocity = playerDirection.multiplyScalar(particleSpeed);
                    p.velocity.lerp(targetVelocity, 0.1);

                    // Move towards center (player)
                    // Or just use the velocity we set (which is inward)
                    p.position.addScaledVector(p.velocity, deltaTime);

                    // Update Attribute Arrays
                    positions[p.index * 3] = p.position.x;
                    positions[p.index * 3 + 1] = p.position.y;
                    positions[p.index * 3 + 2] = p.position.z;

                    // Fade in/out
                    // Life: max -> 0
                    // Opacity: Fade in quickly, then fade out
                    const lifeRatio = p.life / p.maxLife;
                    if (lifeRatio > 0.8) {
                        opacities[p.index] = (1 - lifeRatio) * 5; // 0 to 1
                    } else {
                        opacities[p.index] = lifeRatio; // 0.8 to 0
                    }

                    // Size plusing?
                    // Grow slightly
                    sizes[p.index] += deltaTime * 5.0;
                }
                activeCount++;
            } else {
                // Hide inactive
                opacities[p.index] = 0;
                // Move offscreen to be safe? Not needed if opacity is 0
                positions[p.index * 3] = 0;
                positions[p.index * 3 + 1] = 0;
                positions[p.index * 3 + 2] = 0;
            }
        });

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.opacity.needsUpdate = true;
    }

    spawnParticle(center, intensity) {
        // Find inactive particle
        const p = this.pool.find(p => !p.active);
        if (!p) return;

        p.active = true;
        p.maxLife = 0.5 + Math.random() * 0.5;
        p.life = p.maxLife;

        // Spawn at random radius
        // Spread outward based on charge (intensity)
        // Start close (0.25) and expand to 1.20
        const angle = Math.random() * Math.PI * 2;
        const radius = (0.25 + (intensity * 1.20));

        p.position.set(
            center.x + Math.cos(angle) * radius,
            center.y + Math.sin(angle) * radius,
            center.z + 0.1 // Slightly in front
        );

        // Velocity inwards
        // Speed increases with intensity
        const speed = 1.0 + (intensity * 5.0);
        const randomAngle = (Math.random() - 0.5) * Math.PI / 180 * 90; // 90 degrees
        p.velocity.set(
            -Math.cos(angle + randomAngle) * speed,
            -Math.sin(angle + randomAngle) * speed,
            0
        );

        // Size
        const sizes = this.geometry.attributes.size.array;
        sizes[p.index] = 0.1 + (intensity * 0.5) + Math.random() * 0.1;
    }

    stop() {
        this.pool.forEach(p => {
            p.active = false;
        });
        const opacities = this.geometry.attributes.opacity.array;
        for (let i = 0; i < this.maxParticles; i++) {
            opacities[i] = 0;
        }
        this.geometry.attributes.opacity.needsUpdate = true;
    }
}

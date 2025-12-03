import * as THREE from 'three';

export class TextureManager {
    constructor() {
        this.textures = new Map();
        this.loadingManager = new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    }

    async loadTextures(textureList, onProgress) {
        return new Promise((resolve, reject) => {
            let loadedCount = 0;
            const total = textureList.length;

            if (total === 0) {
                resolve();
                return;
            }

            textureList.forEach(path => {
                this.textureLoader.load(
                    path,
                    (texture) => {
                        // Default settings for pixel art games
                        texture.colorSpace = THREE.SRGBColorSpace;
                        texture.magFilter = THREE.NearestFilter;
                        texture.minFilter = THREE.NearestFilter;

                        // Store by filename (or full path if needed, but filename is usually easier)
                        // Let's store by the path string provided to keep it simple and unique
                        this.textures.set(path, texture);

                        loadedCount++;
                        if (onProgress) {
                            onProgress(loadedCount / total);
                        }

                        if (loadedCount === total) {
                            resolve();
                        }
                    },
                    undefined,
                    (err) => {
                        console.error(`Failed to load texture: ${path}`, err);
                        // Resolve anyway to not block the game, but maybe log error
                        loadedCount++;
                        if (onProgress) {
                            onProgress(loadedCount / total);
                        }
                        if (loadedCount === total) {
                            resolve();
                        }
                    }
                );
            });
        });
    }

    getTexture(path) {
        return this.textures.get(path);
    }
}

export const textureManager = new TextureManager();

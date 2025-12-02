import * as THREE from 'three';

export class Renderer {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        // Initial resize
        this.onWindowResize();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    get domElement() {
        return this.renderer.domElement;
    }

    onWindowResize() {
        const BASE_WIDTH = 1920;
        const BASE_HEIGHT = 1080;
        const targetAspect = BASE_WIDTH / BASE_HEIGHT;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const windowAspect = windowWidth / windowHeight;

        let scale;
        if (windowAspect > targetAspect) {
            // Window is wider than 16:9, fit to height
            scale = windowHeight / BASE_HEIGHT;
        } else {
            // Window is narrower than 16:9, fit to width
            scale = windowWidth / BASE_WIDTH;
        }

        // Set fixed internal resolution
        this.renderer.setSize(BASE_WIDTH, BASE_HEIGHT);

        // Apply scaling to Canvas
        const canvasStyles = {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${scale})`,
            width: `${BASE_WIDTH}px`,
            height: `${BASE_HEIGHT}px`,
            overflow: 'hidden'
        };
        Object.assign(this.renderer.domElement.style, canvasStyles);

        // Apply scaling to UI Layer
        const uiLayer = document.getElementById('ui-layer');
        if (uiLayer) {
            const uiStyles = {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${scale})`,
                width: `${BASE_WIDTH}px`,
                height: `${BASE_HEIGHT}px`,
                pointerEvents: 'none',
                overflow: 'visible'
            };
            Object.assign(uiLayer.style, uiStyles);
        }

        // Apply scaling to Virtual Gamepad
        const gamepadLayer = document.getElementById('virtual-gamepad');
        if (gamepadLayer) {
            const gamepadStyles = {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${scale})`,
                width: `${BASE_WIDTH}px`,
                height: `${BASE_HEIGHT}px`,
                pointerEvents: 'none',
                overflow: 'visible',
                zIndex: '2000' // Ensure it stays on top
            };
            Object.assign(gamepadLayer.style, gamepadStyles);
        }

        // Camera aspect is always 16:9
        this.camera.aspect = targetAspect;
        this.camera.updateProjectionMatrix();
    }

    render(scene) {
        if (scene && scene.scene) {
            this.renderer.render(scene.scene, scene.camera || this.camera);
        }
    }
}

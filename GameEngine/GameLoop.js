export class GameLoop {
    constructor(game) {
        this.game = game;
        this.lastTime = 0;
        this.isRunning = false;
        this.animate = this.animate.bind(this);
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.animate);
        }
    }

    stop() {
        this.isRunning = false;
    }

    animate(currentTime) {
        if (!this.isRunning) return;

        let deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Clamp deltaTime to prevent time jump issues (max 0.1s)
        // This prevents physics explosions or logic errors when the browser is minimized or sleeps.
        if (deltaTime > 0.1) deltaTime = 0.1;

        this.game.update(deltaTime);

        requestAnimationFrame(this.animate);
    }
}

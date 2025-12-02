export class SceneManager {
    constructor(game) {
        this.game = game;
        this.currentScene = null;
        this.scenes = {};
    }

    addScene(name, sceneClass) {
        this.scenes[name] = sceneClass;
    }

    switchTo(name) {
        if (this.currentScene) {
            this.currentScene.exit();
        }

        const SceneClass = this.scenes[name];
        if (SceneClass) {
            this.currentScene = new SceneClass(this.game);
            this.currentScene.enter();
        } else {
            console.error(`Scene ${name} not found`);
        }
    }

    update(deltaTime) {
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
        }
    }
}

export class InputManager {
    constructor() {
        this.keys = {};
        this.touchStart = null;

        // Keyboard mapping
        this.keyMap = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'z': 'attack',
            'Z': 'attack',
            'x': 'item',
            'X': 'item',
            ' ': 'confirm',
            'Escape': 'cancel'
        };

        this.inputState = {
            up: false,
            down: false,
            left: false,
            right: false,
            attack: false,
            item: false,
            confirm: false,
            cancel: false,
            attackDuration: 0
        };

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Touch/Virtual Controller setup will be added here
        this.setupVirtualController();
    }

    setupVirtualController() {
        // Check if touch is supported
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!isTouchDevice) return;

        // Use persistent container
        const gamepadContainer = document.getElementById('virtual-gamepad');
        if (!gamepadContainer) return;

        // Clear existing if any (though should be empty initially)
        gamepadContainer.innerHTML = '';

        // Prevent default on container to block scrolling/zooming globally in this area
        const preventDefault = (e) => {
            if (e.cancelable) e.preventDefault();
        };
        gamepadContainer.addEventListener('touchstart', preventDefault, { passive: false });
        gamepadContainer.addEventListener('touchmove', preventDefault, { passive: false });
        gamepadContainer.addEventListener('touchend', preventDefault, { passive: false });

        // Prevent pinch-zoom on iOS
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());

        // --- Touch Zone (Left 40%) ---
        const touchZone = document.createElement('div');
        touchZone.style.position = 'absolute';
        touchZone.style.top = '0';
        touchZone.style.left = '0';
        touchZone.style.width = '40%';
        touchZone.style.height = '100%';
        touchZone.style.touchAction = 'none';
        touchZone.style.pointerEvents = 'auto'; // Enable touch events
        gamepadContainer.appendChild(touchZone);

        // --- Analog Stick (Bottom Left) ---
        const stickContainer = document.createElement('div');
        stickContainer.style.position = 'absolute';
        stickContainer.style.bottom = '4%'; // Relative to container height
        stickContainer.style.left = '3.5%';
        stickContainer.style.height = '20%';
        stickContainer.style.width = 'auto'; // Let aspect ratio handle width
        stickContainer.style.aspectRatio = '1/1';

        stickContainer.style.borderRadius = '50%';
        stickContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        stickContainer.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        stickContainer.style.pointerEvents = 'none';
        stickContainer.style.touchAction = 'none';
        gamepadContainer.appendChild(stickContainer);

        const stick = document.createElement('div');
        stick.style.position = 'absolute';
        stick.style.top = '50%';
        stick.style.left = '50%';
        stick.style.width = '45%';
        stick.style.height = '45%';
        stick.style.borderRadius = '50%';
        stick.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        stick.style.transform = 'translate(-50%, -50%)';
        stick.style.pointerEvents = 'none';
        stickContainer.appendChild(stick);

        // Stick Logic
        let stickId = null;
        let stickCenter = null; // Store the logical center of the stick
        // We need to recalculate maxRadius on interaction in case of resize

        const handleStickMove = (clientX, clientY) => {
            const rect = stickContainer.getBoundingClientRect();
            const maxRadius = rect.height / 1;

            let centerX, centerY;
            if (stickCenter) {
                centerX = stickCenter.x;
                centerY = stickCenter.y;
            } else {
                centerX = rect.left + rect.width / 2;
                centerY = rect.top + rect.height / 2;
            }

            let dx = clientX - centerX;
            let dy = clientY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Clamp stick visual
            const limit = maxRadius * 1.0;
            if (distance > limit) {
                const ratio = limit / distance;
                dx *= ratio;
                dy *= ratio;
            }

            stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

            // Input Mapping
            const threshold = maxRadius * 0.05;
            this.inputState.right = (clientX - centerX) > threshold;
            this.inputState.left = (clientX - centerX) < -threshold;
            this.inputState.down = (clientY - centerY) > threshold;
            this.inputState.up = (clientY - centerY) < -threshold;
        };

        const resetStick = () => {
            stick.style.transform = 'translate(-50%, -50%)';
            this.inputState.left = false;
            this.inputState.right = false;
            this.inputState.up = false;
            this.inputState.down = false;
            stickId = null;
            stickCenter = null;
        };

        touchZone.addEventListener('touchstart', (e) => {
            // e.preventDefault(); // Handled by container
            const touch = e.changedTouches[0];
            stickId = touch.identifier;

            // Move Stick to Touch Position
            const containerRect = gamepadContainer.getBoundingClientRect();
            const relX = touch.clientX - containerRect.left;
            const relY = touch.clientY - containerRect.top;

            // Set logical center to the touch point
            stickCenter = { x: touch.clientX, y: touch.clientY };

            handleStickMove(touch.clientX, touch.clientY);
        }, { passive: false });

        touchZone.addEventListener('touchmove', (e) => {
            // e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === stickId) {
                    handleStickMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
                    break;
                }
            }
        }, { passive: false });

        const endStick = (e) => {
            // e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === stickId) {
                    resetStick();
                    break;
                }
            }
        };
        touchZone.addEventListener('touchend', endStick);
        touchZone.addEventListener('touchcancel', endStick);


        // --- Buttons Container ---
        // Attack Button (Left)
        const attackBtn = document.createElement('div');
        attackBtn.style.position = 'absolute';
        attackBtn.style.bottom = '4%';
        attackBtn.style.right = '15%'; // Offset
        attackBtn.style.height = '15%'; // 15% screen height
        attackBtn.style.width = 'auto';
        attackBtn.style.aspectRatio = '1/1';

        attackBtn.style.borderRadius = '50%';
        attackBtn.style.backgroundColor = 'rgba(255, 150, 150, 0.1)';
        attackBtn.style.border = '2px solid rgba(255, 255, 255, 0.15)';
        attackBtn.style.pointerEvents = 'auto';
        attackBtn.style.touchAction = 'none';

        const attackLabel = document.createElement('div');
        attackLabel.innerText = 'A';
        attackLabel.style.position = 'absolute';
        attackLabel.style.top = '50%';
        attackLabel.style.left = '50%';
        attackLabel.style.transform = 'translate(-50%, -50%)';
        attackLabel.style.color = 'rgba(255, 255, 255, 0.5)';
        attackLabel.style.fontSize = '70px';
        attackLabel.style.pointerEvents = 'none';
        attackBtn.appendChild(attackLabel);
        gamepadContainer.appendChild(attackBtn);

        // Item Button (Right)
        const itemBtn = document.createElement('div');
        itemBtn.style.position = 'absolute';
        itemBtn.style.bottom = '16%';
        itemBtn.style.right = '3.5%';
        itemBtn.style.height = '15%'; // 15% screen height
        itemBtn.style.width = 'auto';
        itemBtn.style.aspectRatio = '1/1';

        itemBtn.style.borderRadius = '50%';
        itemBtn.style.backgroundColor = 'rgba(96, 160, 255, 0.1)';
        itemBtn.style.border = '2px solid rgba(255, 255, 255, 0.15)';
        itemBtn.style.pointerEvents = 'auto';
        itemBtn.style.touchAction = 'none';

        const itemLabel = document.createElement('div');
        itemLabel.innerText = 'B';
        itemLabel.style.position = 'absolute';
        itemLabel.style.top = '50%';
        itemLabel.style.left = '50%';
        itemLabel.style.transform = 'translate(-50%, -50%)';
        itemLabel.style.color = 'rgba(255, 255, 255, 0.5)';
        itemLabel.style.fontSize = '70px';
        itemLabel.style.pointerEvents = 'none';
        itemBtn.appendChild(itemLabel);
        gamepadContainer.appendChild(itemBtn);

        // Cancel Button (Bottom Center)
        const cancelBtn = document.createElement('div');
        cancelBtn.style.position = 'absolute';
        cancelBtn.style.bottom = '4%';
        cancelBtn.style.left = '67%';
        cancelBtn.style.transform = 'translateX(-50%)';
        cancelBtn.style.height = '10%'; // 10% screen height
        cancelBtn.style.width = 'auto';
        cancelBtn.style.aspectRatio = '1.5/1'; // Wider

        cancelBtn.style.borderRadius = '20px';
        cancelBtn.style.backgroundColor = 'rgba(120, 120, 100, 0.15)';
        cancelBtn.style.border = '2px solid rgba(255, 255, 255, 0.3)';
        cancelBtn.style.pointerEvents = 'auto';
        cancelBtn.style.touchAction = 'none';

        const cancelLabel = document.createElement('div');
        cancelLabel.innerText = 'ESC';
        cancelLabel.style.position = 'absolute';
        cancelLabel.style.top = '50%';
        cancelLabel.style.left = '50%';
        cancelLabel.style.transform = 'translate(-50%, -50%)';
        cancelLabel.style.color = 'rgba(255, 255, 255, 0.5)';
        cancelLabel.style.fontSize = '45px';
        cancelLabel.style.pointerEvents = 'none';
        cancelBtn.appendChild(cancelLabel);
        gamepadContainer.appendChild(cancelBtn);

        // Button Logic Helper
        const setupButton = (element, actionKeys) => {
            element.addEventListener('touchstart', (e) => {
                // e.preventDefault();
                actionKeys.forEach(key => {
                    this.inputState[key] = true;
                    if (key === 'attack' && this.inputState.attackDuration === 0) {
                        this.inputState.attackStartTime = Date.now();
                    }
                });
                element.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }, { passive: false });

            const endButton = (e) => {
                // e.preventDefault();
                actionKeys.forEach(key => {
                    this.inputState[key] = false;
                    if (key === 'attack') {
                        this.inputState.attackDuration = (Date.now() - this.inputState.attackStartTime) / 1000;
                        this.inputState.attackStartTime = 0;
                    }
                });
                if (element === attackBtn) element.style.backgroundColor = 'rgba(255, 150, 150, 0.1)';
                else if (element === itemBtn) element.style.backgroundColor = 'rgba(96, 160, 255, 0.1)';
                else if (element === cancelBtn) element.style.backgroundColor = 'rgba(120, 120, 100, 0.15)';
            };
            element.addEventListener('touchend', endButton);
            element.addEventListener('touchcancel', endButton);
        };

        setupButton(attackBtn, ['attack', 'confirm']);
        setupButton(itemBtn, ['item']);
        setupButton(cancelBtn, ['cancel']);
    }

    onKeyDown(e) {
        const action = this.keyMap[e.key];
        if (action) {
            this.inputState[action] = true;
            if (action === 'attack' && this.inputState.attackDuration === 0) {
                this.inputState.attackStartTime = Date.now();
            }
        }
    }

    onKeyUp(e) {
        const action = this.keyMap[e.key];
        if (action) {
            this.inputState[action] = false;
            if (action === 'attack') {
                this.inputState.attackDuration = (Date.now() - this.inputState.attackStartTime) / 1000;
                this.inputState.attackStartTime = 0;
            }
        }
    }

    getInput() {
        // Update attack duration if button is held
        if (this.inputState.attack && this.inputState.attackStartTime > 0) {
            this.inputState.attackDuration = (Date.now() - this.inputState.attackStartTime) / 1000;
        }
        return this.inputState;
    }

    getDuration(action) {
        if (action === 'attack') {
            const duration = this.inputState.attackDuration;
            // Only reset if key is not held (consumed on release)
            if (!this.inputState.attack) {
                this.inputState.attackDuration = 0;
            }
            return duration;
        }
        return 0;
    }
}

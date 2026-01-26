// Input handler for keyboard controls
class InputHandler {
    constructor() {
        this.keys = {};
        this.setupKeyboardListeners();
    }

    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.keys[e.key.toLowerCase()] = true;

            // Prevent default browser behavior for game keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Escape', 'p', 'P'].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
            this.keys[e.key.toLowerCase()] = false;
        });

        // Handle window losing focus (pause game)
        window.addEventListener('blur', () => {
            this.keys = {}; // Clear all keys when window loses focus
        });
    }

    isKeyPressed(key) {
        return this.keys[key] === true;
    }

    // Movement helpers
    isUpPressed() {
        return this.isKeyPressed('ArrowUp') || this.isKeyPressed('w');
    }

    isDownPressed() {
        return this.isKeyPressed('ArrowDown') || this.isKeyPressed('s');
    }

    isLeftPressed() {
        return this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a');
    }

    isRightPressed() {
        return this.isKeyPressed('ArrowRight') || this.isKeyPressed('d');
    }

    isShootPressed() {
        return this.isKeyPressed(' ') || this.isKeyPressed('Spacebar');
    }

    isPausePressed() {
        return this.isKeyPressed('Escape') || this.isKeyPressed('p');
    }

    isEnterPressed() {
        return this.isKeyPressed('Enter');
    }

    // Clear all key states
    clearKeys() {
        this.keys = {};
    }
}

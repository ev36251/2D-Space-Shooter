// Base GameObject class that all game entities inherit from
class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = { x: 0, y: 0 };
        this.alive = true;
    }

    update(deltaTime) {
        // Override in subclasses
    }

    render(ctx) {
        // Override in subclasses
    }

    // Get center position
    getCenterX() {
        return this.x + this.width / 2;
    }

    getCenterY() {
        return this.y + this.height / 2;
    }

    // Check if object is off screen
    isOffScreen(canvasWidth, canvasHeight) {
        return this.x + this.width < 0 ||
               this.x > canvasWidth ||
               this.y + this.height < 0 ||
               this.y > canvasHeight;
    }
}

// Helper math functions
const MathUtils = {
    // Clamp value between min and max
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    // Linear interpolation
    lerp: function(start, end, t) {
        return start + (end - start) * t;
    },

    // Random integer between min and max (inclusive)
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Random float between min and max
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Distance between two points
    distance: function(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Angle between two points (in radians)
    angleBetween: function(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
};

// Animation helper
class Animation {
    constructor(frames, frameDuration) {
        this.frames = frames; // Array of images or frame indices
        this.frameDuration = frameDuration; // Time per frame in seconds
        this.currentFrame = 0;
        this.timer = 0;
        this.loop = true;
        this.finished = false;
    }

    update(deltaTime) {
        if (this.finished && !this.loop) return;

        this.timer += deltaTime;
        if (this.timer >= this.frameDuration) {
            this.timer = 0;
            this.currentFrame++;

            if (this.currentFrame >= this.frames.length) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.frames.length - 1;
                    this.finished = true;
                }
            }
        }
    }

    getCurrentFrame() {
        return this.frames[this.currentFrame];
    }

    reset() {
        this.currentFrame = 0;
        this.timer = 0;
        this.finished = false;
    }
}

// Game constants
const GameConfig = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    PLAYER_SPEED: 300,
    PLAYER_FIRE_RATE: 0.15, // Seconds between shots
    ENEMY_BASE_SPEED: 100,
    POWERUP_DROP_CHANCE: 0.15,
    PARTICLE_LIFETIME: 1.0,

    // Scoring
    SCORE_SMALL_ENEMY: 100,
    SCORE_MEDIUM_ENEMY: 250,
    SCORE_LARGE_ENEMY: 500,
    SCORE_BOSS: 2000,
    SCORE_POWERUP: 50,
    SCORE_STAGE_BONUS: 1000,

    // Stage targets
    STAGE_1_TARGET: 5000,
    STAGE_2_TARGET: 12000,
    STAGE_3_TARGET: 25000
};

// Color palette for retro aesthetic
const Colors = {
    PLAYER: '#00CCFF',
    PLAYER_LASER: '#00FFFF',
    ENEMY_BASIC: '#FF0066',
    ENEMY_ADVANCED: '#FF6600',
    ENEMY_ELITE: '#9900FF',
    ENEMY_BULLET: '#FF0000',
    POWERUP_WEAPON: '#FFFF00',
    POWERUP_SHIELD: '#00FF00',
    POWERUP_LIFE: '#FF1493',
    EXPLOSION: ['#FFFF00', '#FF6600', '#FF0000', '#990000'],
    UI_TEXT: '#00FF00',
    UI_BORDER: '#00FF00'
};

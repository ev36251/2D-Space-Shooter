// Global asset storage
const assets = {
    images: {},
    audio: {}
};

// Asset loader class
class AssetLoader {
    constructor() {
        this.imagesToLoad = 0;
        this.imagesLoaded = 0;
        this.loadingComplete = false;
        this.onComplete = null;
    }

    loadImage(name, path) {
        this.imagesToLoad++;

        const img = new Image();

        img.onload = () => {
            this.imagesLoaded++;
            this.updateProgress();
            this.checkAllLoaded();
        };

        img.onerror = () => {
            console.warn(`Failed to load image: ${path}`);
            this.imagesLoaded++;
            this.updateProgress();
            this.checkAllLoaded();
        };

        img.src = path;
        assets.images[name] = img;
    }

    updateProgress() {
        const progress = this.getProgress();
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        if (progressFill) {
            progressFill.style.width = `${progress * 100}%`;
        }

        if (progressText) {
            progressText.textContent = `${Math.floor(progress * 100)}%`;
        }
    }

    checkAllLoaded() {
        if (this.imagesLoaded >= this.imagesToLoad && !this.loadingComplete) {
            this.loadingComplete = true;
            console.log('All assets loaded!');

            if (this.onComplete) {
                this.onComplete();
            }
        }
    }

    getProgress() {
        if (this.imagesToLoad === 0) return 1;
        return this.imagesLoaded / this.imagesToLoad;
    }

    loadAllAssets() {
        // Only load assets that actually exist!

        // Player assets
        this.loadImage('playerShip', 'assets/images/player/ship.png');

        // Enemy assets
        this.loadImage('enemyDrone1', 'assets/images/enemies/drone-1.png');
        this.loadImage('enemyDrone2', 'assets/images/enemies/drone-2.png');
        this.loadImage('enemyDrone3', 'assets/images/enemies/drone-3.png');
        this.loadImage('enemyFighter', 'assets/images/enemies/fighter.png');
        this.loadImage('enemyKamikaze', 'assets/images/enemies/kamikaze.png');
        this.loadImage('enemyTurret', 'assets/images/enemies/turret.png');
        this.loadImage('enemyInterceptor', 'assets/images/enemies/interceptor.png');
        this.loadImage('enemyBomber', 'assets/images/enemies/bomber.png');
        this.loadImage('enemyCarrier', 'assets/images/enemies/carrier.png');

        // Boss assets
        this.loadImage('boss1', 'assets/images/bosses/boss-1-body.png');
        this.loadImage('boss1New', 'assets/images/bosses/boss-1-new.png');
        this.loadImage('boss2', 'assets/images/bosses/boss-2-main.png');
        this.loadImage('boss3', 'assets/images/bosses/boss-3-core.png');

        // Projectile assets
        this.loadImage('playerLaser', 'assets/images/projectiles/player-laser.png');
        this.loadImage('playerLaserUpgraded', 'assets/images/projectiles/player-laser-upgraded.png');
        this.loadImage('enemyBullet', 'assets/images/projectiles/enemy-bullet-basic.png');
        this.loadImage('enemyBulletFast', 'assets/images/projectiles/enemy-bullet-fast.png');
        this.loadImage('enemyMissile', 'assets/images/projectiles/enemy-missile.png');

        // Power-up assets
        this.loadImage('powerupWeapon', 'assets/images/powerups/weapon-upgrade.png');
        this.loadImage('powerupShield', 'assets/images/powerups/shield.png');
        this.loadImage('powerupLife', 'assets/images/powerups/extra-life.png');
        this.loadImage('powerupMultiplier', 'assets/images/powerups/multiplier.png');

        // Effect assets
        this.loadImage('explosionSmall', 'assets/images/effects/explosion-small.png');
        this.loadImage('explosionLarge', 'assets/images/effects/explosion-large.png');
        this.loadImage('shieldBubble', 'assets/images/effects/shield-bubble.png');
        this.loadImage('hitSpark', 'assets/images/effects/hit-spark.png');

        // UI assets
        this.loadImage('heartFull', 'assets/images/ui/heart-full.png');
        this.loadImage('heartEmpty', 'assets/images/ui/heart-empty.png');

        // Background images
        this.loadImage('stage1Bg', 'assets/images/backgrounds/stage-1-bg.png');
        this.loadImage('stage2Bg', 'assets/images/backgrounds/stage-2-bg.png');
        this.loadImage('stage3Bg', 'assets/images/backgrounds/stage-3-bg.png');

        // Note: Title/Game Over screens are rendered with text, no images needed

        console.log(`Loading ${this.imagesToLoad} images...`);

        // If no images to load, mark as complete
        if (this.imagesToLoad === 0) {
            this.loadingComplete = true;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }
}

// Initialize game when page loads
let game;

window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    if (!canvas || !ctx) {
        console.error('Failed to get canvas or context');
        return;
    }

    // Create asset loader
    const loader = new AssetLoader();

    // Set up completion callback
    loader.onComplete = () => {
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 500);
        }

        // Initialize game
        game = new Game(canvas, ctx);

        // Load audio (doesn't block)
        game.audioManager.loadAllAudio();

        // Create initial stage for menu background
        game.stage = new Stage(1, game);

        // Start game loop
        game.start();

        console.log('Game initialized! Press Enter to start.');
    };

    // Load all assets
    loader.loadAllAssets();

    // If all assets fail to load or there are none, still start the game
    setTimeout(() => {
        if (!loader.loadingComplete && loader.imagesToLoad > 0) {
            console.warn('Some assets failed to load, starting anyway...');
            loader.loadingComplete = true;
            if (loader.onComplete) {
                loader.onComplete();
            }
        }
    }, 10000); // 10 second timeout
});

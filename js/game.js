// Game states
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    STAGE_TRANSITION: 'stage_transition',
    STAGE_COMPLETE: 'stage_complete',
    BOSS_WARNING: 'boss_warning',
    GAME_OVER: 'game_over',
    VICTORY: 'victory'
};

// Score manager
class ScoreManager {
    constructor() {
        this.score = 0;
        this.multiplier = 1;
        this.multiplierTimer = 0;
        this.multiplierDuration = 0;
        this.combo = 0;
        this.leaderboard = this.loadLeaderboard();
        this.highScore = this.leaderboard.length > 0 ? this.leaderboard[0].score : 0;
    }

    addScore(points) {
        this.score += points * this.multiplier;
        this.combo++;

        // Natural combo multiplier
        if (this.combo > 10) this.multiplier = Math.max(this.multiplier, 2);
        if (this.combo > 25) this.multiplier = Math.max(this.multiplier, 3);
    }

    activateMultiplier(mult, duration) {
        this.multiplier = mult;
        this.multiplierDuration = duration;
        this.multiplierTimer = 0;
    }

    update(deltaTime) {
        if (this.multiplierDuration > 0) {
            this.multiplierTimer += deltaTime;
            if (this.multiplierTimer >= this.multiplierDuration) {
                this.multiplier = 1;
                this.multiplierDuration = 0;
                this.multiplierTimer = 0;
            }
        }
    }

    resetCombo() {
        this.combo = 0;
        if (this.multiplierDuration === 0) {
            this.multiplier = 1;
        }
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('cosmicDefender_highScore', this.score.toString());
        }
    }

    loadHighScore() {
        const saved = localStorage.getItem('cosmicDefender_highScore');
        return saved ? parseInt(saved) : 0;
    }

    reset() {
        this.score = 0;
        this.multiplier = 1;
        this.combo = 0;
        this.multiplierTimer = 0;
        this.multiplierDuration = 0;
    }
}

// Main Game class
class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.state = GameState.MENU;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.running = false;

        // Game objects
        this.player = new Player(
            GameConfig.CANVAS_WIDTH / 2 - 24,
            GameConfig.CANVAS_HEIGHT - 100
        );
        this.enemies = [];
        this.boss = null;
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        this.powerups = [];

        // Systems
        this.collisionSystem = new CollisionSystem();
        this.particleSystem = new ParticleSystem();
        this.scoreManager = new ScoreManager();
        this.ui = new UI();
        this.audioManager = new AudioManager();
        this.input = new InputHandler();

        // Stage management
        this.currentStage = 1;
        this.stage = null;
        this.stateTimer = 0;
        this.stateDuration = 0;

        // Boss fight powerup spawning
        this.bossPowerupTimer = 0;
        this.bossPowerupSpawnRate = 8.0; // Spawn powerup every 8 seconds during boss fight

        // Pause handling
        this.pausePressed = false;
    }

    get score() {
        return this.scoreManager.score;
    }

    get highScore() {
        return this.scoreManager.highScore;
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }

    gameLoop(currentTime) {
        if (!this.running) return;

        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent spiral of death
        this.deltaTime = Math.min(this.deltaTime, 0.1);

        // Update and render
        this.update(this.deltaTime);
        this.render();

        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Handle pause input
        if (this.input.isPausePressed() && !this.pausePressed) {
            this.pausePressed = true;
            if (this.state === GameState.PLAYING) {
                this.setState(GameState.PAUSED);
            } else if (this.state === GameState.PAUSED) {
                this.setState(GameState.PLAYING);
            }
        } else if (!this.input.isPausePressed()) {
            this.pausePressed = false;
        }

        // Handle Enter key for state transitions
        if (this.input.isEnterPressed()) {
            if (this.state === GameState.MENU) {
                this.startNewGame();
            } else if (this.state === GameState.GAME_OVER || this.state === GameState.VICTORY) {
                this.resetToMenu();
            }
        }

        // Update based on state
        switch (this.state) {
            case GameState.MENU:
                this.ui.update(deltaTime);
                break;

            case GameState.PLAYING:
                this.updatePlaying(deltaTime);
                break;

            case GameState.PAUSED:
                // Handle volume control inputs
                this.handleVolumeControls(deltaTime);
                break;

            case GameState.STAGE_TRANSITION:
            case GameState.STAGE_COMPLETE:
            case GameState.BOSS_WARNING:
                this.updateTimedState(deltaTime);
                break;

            case GameState.GAME_OVER:
            case GameState.VICTORY:
                this.ui.update(deltaTime);
                break;
        }
    }

    updatePlaying(deltaTime) {
        // Update player
        this.player.update(deltaTime, this.input, this);

        // Update stage
        if (this.stage) {
            this.stage.update(deltaTime);

            // Check if stage completed
            if (this.stage.completed) {
                this.onStageComplete();
            }
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].update(deltaTime, this);
            if (!this.enemies[i].alive) {
                this.enemies.splice(i, 1);
            }
        }

        // Update boss
        if (this.boss && this.boss.alive) {
            this.boss.update(deltaTime, this);

            // Spawn random powerups during boss fight
            this.bossPowerupTimer += deltaTime;
            if (this.bossPowerupTimer >= this.bossPowerupSpawnRate) {
                this.spawnBossPowerup();
                this.bossPowerupTimer = 0;
            }
        } else {
            // Reset timer when not in boss fight
            this.bossPowerupTimer = 0;
        }

        // Update projectiles
        this.updateProjectiles(deltaTime);

        // Update power-ups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            this.powerups[i].update(deltaTime);
            if (!this.powerups[i].alive) {
                this.powerups.splice(i, 1);
            }
        }

        // Update particles
        this.particleSystem.update(deltaTime);

        // Check collisions
        this.collisionSystem.checkAllCollisions(this);

        // Update score manager
        this.scoreManager.update(deltaTime);
    }

    updateProjectiles(deltaTime) {
        // Player projectiles
        for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
            this.playerProjectiles[i].update(deltaTime);
            if (!this.playerProjectiles[i].alive) {
                this.playerProjectiles.splice(i, 1);
            }
        }

        // Enemy projectiles
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const proj = this.enemyProjectiles[i];

            // Update homing missiles with player reference
            if (proj instanceof EnemyMissile) {
                proj.update(deltaTime, this.player);
            } else {
                proj.update(deltaTime);
            }

            if (!proj.alive) {
                this.enemyProjectiles.splice(i, 1);
            }
        }
    }

    handleVolumeControls(deltaTime) {
        if (!this.audioManager) return;

        const volumeStep = 0.05; // 5% per key press

        // Left/Right arrows adjust volume
        if (this.input.isLeftPressed()) {
            // Decrease music volume
            const newVolume = Math.max(0, this.audioManager.musicVolume - volumeStep);
            this.audioManager.setMusicVolume(newVolume);
        }
        if (this.input.isRightPressed()) {
            // Increase music volume
            const newVolume = Math.min(1, this.audioManager.musicVolume + volumeStep);
            this.audioManager.setMusicVolume(newVolume);
        }
        if (this.input.isDownPressed()) {
            // Decrease SFX volume
            const newVolume = Math.max(0, this.audioManager.sfxVolume - volumeStep);
            this.audioManager.setSfxVolume(newVolume);
        }
        if (this.input.isUpPressed()) {
            // Increase SFX volume
            const newVolume = Math.min(1, this.audioManager.sfxVolume + volumeStep);
            this.audioManager.setSfxVolume(newVolume);
        }
    }

    updateTimedState(deltaTime) {
        this.stateTimer += deltaTime;

        if (this.stateTimer >= this.stateDuration) {
            this.onTimedStateComplete();
        }
    }

    render() {
        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render based on state
        switch (this.state) {
            case GameState.MENU:
                this.renderMenu();
                break;

            case GameState.PLAYING:
            case GameState.PAUSED:
            case GameState.BOSS_WARNING:
                this.renderPlaying();
                break;

            case GameState.STAGE_TRANSITION:
                this.renderStageTransition();
                break;

            case GameState.STAGE_COMPLETE:
                this.renderStageComplete();
                break;

            case GameState.GAME_OVER:
                this.renderGameOver();
                break;

            case GameState.VICTORY:
                this.renderVictory();
                break;
        }
    }

    renderMenu() {
        // Render animated background
        if (this.stage) {
            this.stage.renderBackground(this.ctx);
        } else {
            this.ctx.fillStyle = '#000033';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.ui.renderMenu(this.ctx);
    }

    renderPlaying() {
        // Render background
        if (this.stage) {
            this.stage.renderBackground(this.ctx);
        }

        // Render particles (background layer)
        this.particleSystem.render(this.ctx);

        // Render power-ups
        this.powerups.forEach(powerup => powerup.render(this.ctx));

        // Render projectiles
        this.playerProjectiles.forEach(proj => proj.render(this.ctx));
        this.enemyProjectiles.forEach(proj => proj.render(this.ctx));

        // Render enemies
        this.enemies.forEach(enemy => enemy.render(this.ctx));

        // Render boss
        if (this.boss) {
            this.boss.render(this.ctx);
        }

        // Render player
        this.player.render(this.ctx);

        // Render HUD
        this.ui.renderHUD(this.ctx, this);

        // Render pause menu on top if paused
        if (this.state === GameState.PAUSED) {
            this.ui.renderPauseMenu(this.ctx, this.audioManager);
        }

        // Render boss warning if active
        if (this.state === GameState.BOSS_WARNING) {
            this.ui.renderBossWarning(this.ctx);
        }
    }

    renderStageTransition() {
        // Render game in background
        if (this.stage) {
            this.stage.renderBackground(this.ctx);
        }

        this.ui.renderStageTransition(this.ctx, this.currentStage);
    }

    renderStageComplete() {
        // Render game in background
        if (this.stage) {
            this.stage.renderBackground(this.ctx);
        }

        this.ui.renderStageComplete(this.ctx, this.currentStage - 1, GameConfig.SCORE_STAGE_BONUS);
    }

    renderGameOver() {
        this.ui.renderGameOver(this.ctx, this.score, this.highScore);
    }

    renderVictory() {
        this.ui.renderVictory(this.ctx, this.score, this.highScore);
    }

    // State management
    setState(newState) {
        this.state = newState;

        switch (newState) {
            case GameState.MENU:
                if (this.audioManager) {
                    this.audioManager.playMusic('menuTheme');
                }
                break;

            case GameState.PLAYING:
                if (this.audioManager) {
                    this.audioManager.resumeMusic();
                }
                break;

            case GameState.PAUSED:
                if (this.audioManager) {
                    this.audioManager.pauseMusic();
                }
                break;
        }
    }

    setTimedState(newState, duration) {
        this.state = newState;
        this.stateTimer = 0;
        this.stateDuration = duration;
    }

    onTimedStateComplete() {
        if (this.state === GameState.STAGE_TRANSITION) {
            this.setState(GameState.PLAYING);
            this.startStage(this.currentStage);
        } else if (this.state === GameState.STAGE_COMPLETE) {
            this.advanceToNextStage();
        } else if (this.state === GameState.BOSS_WARNING) {
            this.setState(GameState.PLAYING);
        }
    }

    // Game flow
    startNewGame() {
        // Reset everything
        this.currentStage = 1;
        this.scoreManager.reset();
        this.player.reset();
        this.clearAllObjects();

        // Initialize audio
        if (this.audioManager) {
            this.audioManager.initialize();
        }

        // Show stage transition
        this.setTimedState(GameState.STAGE_TRANSITION, 2.0);
    }

    startStage(stageNumber) {
        this.stage = new Stage(stageNumber, this);

        // Play stage music
        if (this.audioManager) {
            this.audioManager.playMusic(`stage${stageNumber}Theme`);
        }
    }

    advanceToNextStage() {
        this.currentStage++;

        if (this.currentStage > 3) {
            // Victory!
            this.onVictory();
        } else {
            // Next stage
            this.clearAllObjects();
            this.setTimedState(GameState.STAGE_TRANSITION, 2.0);
        }
    }

    onStageComplete() {
        // Award bonus
        this.scoreManager.addScore(GameConfig.SCORE_STAGE_BONUS);

        // Play sound
        if (this.audioManager) {
            this.audioManager.playSound('stageComplete');
        }

        this.setTimedState(GameState.STAGE_COMPLETE, 3.0);
    }

    // Event handlers
    onEnemyDestroyed(enemy) {
        // Award points
        this.scoreManager.addScore(enemy.scoreValue);

        // Create explosion
        this.createExplosion(enemy.getCenterX(), enemy.getCenterY(), 'medium');

        // Play sound
        if (this.audioManager) {
            this.audioManager.playSound('enemyExplode');
        }

        // Chance to drop power-up
        if (Math.random() < GameConfig.POWERUP_DROP_CHANCE) {
            // Don't spawn weapon powerups if player is at max level (3 guns)
            const excludeWeapon = this.player.weaponLevel >= 3;
            this.powerups.push(createRandomPowerup(enemy.getCenterX(), enemy.getCenterY(), excludeWeapon));
        }
    }

    onBossDestroyed(boss) {
        // Award points
        this.scoreManager.addScore(boss.scoreValue);

        // Create massive explosion
        this.createExplosion(boss.getCenterX(), boss.getCenterY(), 'large');

        // Play sound
        if (this.audioManager) {
            this.audioManager.playSound('enemyExplode');
            this.audioManager.playSound('bossHit');
        }

        // Always drop power-up from boss
        this.powerups.push(createRandomPowerup(boss.getCenterX(), boss.getCenterY()));
    }

    onPlayerDeath() {
        // Play sound
        if (this.audioManager) {
            this.audioManager.playSound('playerDeath');
        }

        // Create explosion
        this.createExplosion(this.player.getCenterX(), this.player.getCenterY(), 'large');

        // Reset combo
        this.scoreManager.resetCombo();

        // Game over
        this.scoreManager.saveHighScore();
        this.setTimedState(GameState.GAME_OVER, 3.0);

        setTimeout(() => {
            this.setState(GameState.GAME_OVER);
        }, 3000);
    }

    onPowerupCollected(powerup) {
        // Apply power-up effect
        powerup.apply(this.player, this);

        // Award points
        this.scoreManager.addScore(GameConfig.SCORE_POWERUP);

        // Play sound
        if (this.audioManager) {
            this.audioManager.playSound('powerupCollect');
        }
    }

    onVictory() {
        this.scoreManager.saveHighScore();
        this.setState(GameState.VICTORY);
    }

    // Helper methods
    createExplosion(x, y, size) {
        this.particleSystem.createExplosion(x, y, size);
    }

    createHitEffect(x, y) {
        this.particleSystem.createHitSpark(x, y);
    }

    spawnBossPowerup() {
        // Spawn powerup at random position at top of screen
        const x = MathUtils.randomFloat(50, GameConfig.CANVAS_WIDTH - 50);
        const y = -30; // Start above screen

        // Don't spawn weapon powerups if player is at max level
        const excludeWeapon = this.player.weaponLevel >= 3;
        this.powerups.push(createRandomPowerup(x, y, excludeWeapon));
    }

    clearAllObjects() {
        this.enemies = [];
        this.boss = null;
        this.playerProjectiles = [];
        this.enemyProjectiles = [];
        this.powerups = [];
        this.particleSystem.clear();
    }

    resetToMenu() {
        this.clearAllObjects();
        this.player.reset();
        this.currentStage = 1;
        this.stage = null;
        this.setState(GameState.MENU);
    }
}

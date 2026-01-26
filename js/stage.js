// Stage manager class
class Stage {
    constructor(stageNumber, game) {
        this.number = stageNumber;
        this.game = game;
        this.spawnTimer = 0;
        this.spawnInterval = this.getSpawnInterval();
        this.enemiesSpawned = 0;
        this.enemiesBeforeBoss = this.getEnemiesBeforeBoss();
        this.bossSpawned = false;
        this.completed = false;
        this.wavePattern = 0;
        this.backgroundLayers = this.createBackgroundLayers();
    }

    getSpawnInterval() {
        switch (this.number) {
            case 1: return 1.5; // Slow spawning
            case 2: return 1.0; // Medium spawning
            case 3: return 0.7; // Fast spawning
            default: return 1.5;
        }
    }

    getEnemiesBeforeBoss() {
        switch (this.number) {
            case 1: return 30;
            case 2: return 40;
            case 3: return 50;
            default: return 30;
        }
    }

    createBackgroundLayers() {
        // Single scrolling background layer
        return [
            { y: 0, speed: 30, sprite: `stage${this.number}Bg` }
        ];
    }

    update(deltaTime) {
        if (this.completed) return;

        // Update background scrolling
        this.backgroundLayers.forEach(layer => {
            layer.y += layer.speed * deltaTime;
            if (layer.y >= GameConfig.CANVAS_HEIGHT) {
                layer.y = 0;
            }
        });

        // Spawn enemies
        if (!this.bossSpawned && this.enemiesSpawned < this.enemiesBeforeBoss) {
            this.spawnTimer += deltaTime;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnEnemy();
                this.spawnTimer = 0;
            }
        }

        // Check if should spawn boss
        if (!this.bossSpawned && this.enemiesSpawned >= this.enemiesBeforeBoss) {
            // Wait for all enemies to be defeated
            const activeEnemies = this.game.enemies.filter(e => e.alive).length;
            if (activeEnemies === 0) {
                this.spawnBoss();
            }
        }

        // Check if stage is complete (boss defeated)
        if (this.bossSpawned && this.game.boss && !this.game.boss.alive) {
            this.completed = true;
        }
    }

    spawnEnemy() {
        const x = MathUtils.randomInt(50, GameConfig.CANVAS_WIDTH - 50);
        let enemy;

        switch (this.number) {
            case 1:
                enemy = this.spawnStage1Enemy(x);
                break;
            case 2:
                enemy = this.spawnStage2Enemy(x);
                break;
            case 3:
                enemy = this.spawnStage3Enemy(x);
                break;
        }

        if (enemy) {
            this.game.enemies.push(enemy);
            this.enemiesSpawned++;
        }
    }

    spawnStage1Enemy(x) {
        const rand = Math.random();

        if (rand < 0.7) {
            return new BasicDrone(x, -32);
        } else {
            const direction = Math.random() < 0.5 ? -1 : 1;
            return new SideDrone(x, -32, direction);
        }
    }

    spawnStage2Enemy(x) {
        this.wavePattern++;
        const patternIndex = this.wavePattern % 10;

        if (patternIndex < 4) {
            return new AdvancedFighter(x, -40);
        } else if (patternIndex < 7) {
            return new KamikazeShip(x, -28, this.game.player);
        } else {
            return new TurretPlatform(x, -48);
        }
    }

    spawnStage3Enemy(x) {
        this.wavePattern++;
        const patternIndex = this.wavePattern % 12;

        if (patternIndex < 3) {
            return new EliteInterceptor(x, -36);
        } else if (patternIndex < 6) {
            return new HeavyBomber(x, -56);
        } else if (patternIndex < 9) {
            return new AdvancedFighter(x, -40);
        } else {
            return new ShieldedCarrier(x, -64);
        }
    }

    spawnBoss() {
        switch (this.number) {
            case 1:
                this.game.boss = new Stage1Boss();
                break;
            case 2:
                this.game.boss = new Stage2Boss();
                break;
            case 3:
                this.game.boss = new Stage3Boss();
                break;
        }

        this.bossSpawned = true;

        // Play boss music
        if (this.game.audioManager) {
            this.game.audioManager.playMusic('bossTheme');
        }
    }

    renderBackground(ctx) {
        // Fill base color
        const colors = ['#000033', '#1a0033', '#000011'];
        ctx.fillStyle = colors[this.number - 1] || '#000000';
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // Render scrolling background
        this.backgroundLayers.forEach(layer => {
            if (layer.sprite && assets.images[layer.sprite]) {
                const img = assets.images[layer.sprite];

                // Calculate how many tiles we need vertically
                const tileHeight = 512; // Background images are 512x512
                const numTilesY = Math.ceil(GameConfig.CANVAS_HEIGHT / tileHeight) + 1;
                const numTilesX = Math.ceil(GameConfig.CANVAS_WIDTH / 512) + 1;

                // Calculate scroll offset within a tile
                const scrollOffset = layer.y % tileHeight;

                // Draw tiled background with scrolling
                for (let ty = 0; ty < numTilesY; ty++) {
                    for (let tx = 0; tx < numTilesX; tx++) {
                        ctx.drawImage(
                            img,
                            tx * 512,
                            ty * tileHeight - scrollOffset,
                            512,
                            512
                        );
                    }
                }
            } else {
                // Draw placeholder stars
                this.drawStars(ctx, layer.y, layer.speed);
            }
        });
    }

    drawStars(ctx, offsetY, speed) {
        // Simple star field
        const starCount = Math.floor(speed); // More stars for faster layers
        ctx.fillStyle = '#FFFFFF';

        for (let i = 0; i < starCount; i++) {
            const x = (i * 53) % GameConfig.CANVAS_WIDTH; // Pseudo-random distribution
            const y = ((i * 71) + offsetY) % GameConfig.CANVAS_HEIGHT;
            const size = speed > 30 ? 2 : 1;

            ctx.fillRect(x, y, size, size);
        }
    }
}

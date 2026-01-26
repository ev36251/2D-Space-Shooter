// Base Boss class
class Boss extends Enemy {
    constructor(x, y, width, height, health, scoreValue) {
        super(x, y, width, height, health, scoreValue);
        this.phase = 1;
        this.maxPhases = 3;
        this.entering = true;
        this.entryTargetY = 100;
        this.entrySpeed = 80;
    }

    updatePhase() {
        const healthPercent = this.health / this.maxHealth;

        if (healthPercent <= 0.66 && this.phase === 1) {
            this.phase = 2;
            this.onPhaseChange();
        } else if (healthPercent <= 0.33 && this.phase === 2) {
            this.phase = 3;
            this.onPhaseChange();
        }
    }

    onPhaseChange() {
        // Override in subclasses
    }

    render(ctx) {
        super.render(ctx);

        // Boss health bar at top of screen
        this.renderBossHealthBar(ctx);
    }

    renderBossHealthBar(ctx) {
        const barWidth = GameConfig.CANVAS_WIDTH - 40;
        const barHeight = 20;
        const barX = 20;
        const barY = 20;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

        // Border
        ctx.strokeStyle = Colors.UI_BORDER;
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Health fill
        const healthPercent = this.health / this.maxHealth;
        const fillWidth = barWidth * healthPercent;

        const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        gradient.addColorStop(0, '#FF0000');
        gradient.addColorStop(0.5, '#FFFF00');
        gradient.addColorStop(1, '#00FF00');

        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, fillWidth, barHeight);

        // Boss name
        ctx.fillStyle = Colors.UI_TEXT;
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(this.name || 'BOSS', GameConfig.CANVAS_WIDTH / 2, barY + 15);
        ctx.textAlign = 'left';
    }
}

// Stage 1 Boss: Mothership with rotating turrets
class MothershipBoss extends Boss {
    constructor() {
        super(
            GameConfig.CANVAS_WIDTH / 2 - 100,
            -150,
            200,
            150,
            180, // Increased health from 100 to 180
            GameConfig.SCORE_BOSS
        );
        this.name = 'DESTROYER';
        this.sprite = 'boss1New'; // Use bomber sprite scaled up
        this.rotationAngle = 0;
        this.turrets = [
            { angle: 0, offset: 60 },
            { angle: Math.PI, offset: 60 },
            { angle: Math.PI / 2, offset: 60 }
        ];
    }

    update(deltaTime, game) {
        // Entry animation
        if (this.entering) {
            if (this.y < this.entryTargetY) {
                this.y += this.entrySpeed * deltaTime;
            } else {
                this.entering = false;
            }
        } else {
            // Move side to side
            this.movementTimer += deltaTime;
            this.x = GameConfig.CANVAS_WIDTH / 2 - this.width / 2 +
                     Math.sin(this.movementTimer) * 150;

            // Rotate turrets
            this.rotationAngle += deltaTime * 2;
        }

        // Update phase based on health
        this.updatePhase();

        // Shooting pattern - much faster and more aggressive
        this.fireTimer += deltaTime;
        const fireRate = this.phase === 3 ? 0.5 : this.phase === 2 ? 0.7 : 0.9;
        if (this.fireTimer > fireRate && !this.entering) {
            this.shoot(game);
            this.fireTimer = 0;
        }
    }

    shoot(game) {
        // Shoot from turrets
        this.turrets.forEach(turret => {
            const angle = this.rotationAngle + turret.angle;
            const turretX = this.getCenterX() + Math.cos(angle) * turret.offset;
            const turretY = this.getCenterY() + Math.sin(angle) * turret.offset;

            if (game.player.alive) {
                const dx = game.player.getCenterX() - turretX;
                const dy = game.player.getCenterY() - turretY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                game.enemyProjectiles.push(new EnemyBullet(
                    turretX,
                    turretY,
                    dx / dist,
                    dy / dist
                ));
            }
        });
    }

    onPhaseChange() {
        // Add more turrets in later phases - now even more aggressive!
        if (this.phase === 2) {
            this.turrets.push({ angle: Math.PI / 2, offset: 60 });
            this.turrets.push({ angle: -Math.PI / 2, offset: 60 });
        } else if (this.phase === 3) {
            // Final phase - add diagonal turrets
            this.turrets.push({ angle: Math.PI / 4, offset: 60 });
            this.turrets.push({ angle: -Math.PI / 4, offset: 60 });
        }
    }
}

// Stage 2 Boss: Battlecruiser with multiple weapon turrets
class BattlecruiserBoss extends Boss {
    constructor() {
        super(
            GameConfig.CANVAS_WIDTH / 2 - 100,
            -180,
            200,
            140,
            300, // Increased from 200
            GameConfig.SCORE_BOSS
        );
        this.name = 'BATTLECRUISER';
        this.sprite = 'boss2';
        this.fireRate = 1.0;
    }

    update(deltaTime, game) {
        // Entry animation
        if (this.entering) {
            if (this.y < this.entryTargetY) {
                this.y += this.entrySpeed * deltaTime;
            } else {
                this.entering = false;
            }
        } else {
            // Move in figure-8 pattern
            this.movementTimer += deltaTime;
            const speed = 100;
            this.x += Math.sin(this.movementTimer) * speed * deltaTime;
            this.y = this.entryTargetY + Math.sin(this.movementTimer * 2) * 30;

            // Keep on screen
            this.x = MathUtils.clamp(this.x, 0, GameConfig.CANVAS_WIDTH - this.width);
        }

        this.updatePhase();

        // Shooting
        this.fireTimer += deltaTime;
        const fireRate = this.phase === 3 ? 0.5 : this.phase === 2 ? 0.7 : 1.0;
        if (this.fireTimer > fireRate && !this.entering) {
            this.shoot(game);
            this.fireTimer = 0;
        }
    }

    shoot(game) {
        const patterns = [
            this.shootStraight.bind(this),
            this.shootSpread.bind(this),
            this.shootCircle.bind(this)
        ];

        // Use more complex patterns in later phases
        const patternIndex = Math.min(this.phase - 1, patterns.length - 1);
        patterns[patternIndex](game);
    }

    shootStraight(game) {
        game.enemyProjectiles.push(new EnemyBullet(
            this.getCenterX(),
            this.y + this.height,
            0,
            1
        ));
    }

    shootSpread(game) {
        for (let i = -2; i <= 2; i++) {
            game.enemyProjectiles.push(new EnemyBullet(
                this.getCenterX(),
                this.y + this.height,
                i * 0.4,
                1
            ));
        }
    }

    shootCircle(game) {
        const bulletCount = 8;
        for (let i = 0; i < bulletCount; i++) {
            const angle = (Math.PI * 2 * i) / bulletCount;
            game.enemyProjectiles.push(new EnemyBullet(
                this.getCenterX(),
                this.getCenterY(),
                Math.cos(angle),
                Math.sin(angle)
            ));
        }
    }
}

// Stage 3 Boss: Massive Command Ship with multi-phase battle
class CommandShipBoss extends Boss {
    constructor() {
        super(
            GameConfig.CANVAS_WIDTH / 2 - 120,
            -200,
            240,
            180,
            450, // Increased from 300 - final boss should be tough!
            GameConfig.SCORE_BOSS
        );
        this.name = 'COMMAND SHIP';
        this.sprite = 'boss3';
        this.fireRate = 0.8;
        this.specialAttackTimer = 0;
        this.specialAttackRate = 5.0;
    }

    update(deltaTime, game) {
        // Entry animation
        if (this.entering) {
            if (this.y < this.entryTargetY) {
                this.y += this.entrySpeed * deltaTime;
            } else {
                this.entering = false;
            }
        } else {
            // Aggressive movement
            this.movementTimer += deltaTime;

            // Phase 1: Side to side
            if (this.phase === 1) {
                this.x += Math.sin(this.movementTimer * 2) * 120 * deltaTime;
            }
            // Phase 2: Erratic movement
            else if (this.phase === 2) {
                this.x += Math.sin(this.movementTimer * 3) * 150 * deltaTime;
                this.y = this.entryTargetY + Math.cos(this.movementTimer * 2) * 20;
            }
            // Phase 3: Aggressive swoops
            else {
                this.x += Math.sin(this.movementTimer * 4) * 180 * deltaTime;
                this.y = this.entryTargetY + Math.sin(this.movementTimer * 3) * 40;
            }

            this.x = MathUtils.clamp(this.x, 0, GameConfig.CANVAS_WIDTH - this.width);
            this.y = MathUtils.clamp(this.y, 50, 200);
        }

        this.updatePhase();

        // Regular shooting
        this.fireTimer += deltaTime;
        const fireRate = this.phase === 3 ? 0.4 : this.phase === 2 ? 0.6 : 0.8;
        if (this.fireTimer > fireRate && !this.entering) {
            this.shoot(game);
            this.fireTimer = 0;
        }

        // Special attacks
        this.specialAttackTimer += deltaTime;
        if (this.specialAttackTimer > this.specialAttackRate && !this.entering) {
            this.specialAttack(game);
            this.specialAttackTimer = 0;
        }
    }

    shoot(game) {
        if (this.phase === 1) {
            // Spread pattern
            for (let i = -1; i <= 1; i++) {
                game.enemyProjectiles.push(new EnemyBullet(
                    this.getCenterX() + i * 30,
                    this.y + this.height,
                    i * 0.3,
                    1
                ));
            }
        } else if (this.phase === 2) {
            // Aimed shots
            const dx = game.player.getCenterX() - this.getCenterX();
            const dy = game.player.getCenterY() - this.getCenterY();
            const dist = Math.sqrt(dx * dx + dy * dy);

            for (let i = -1; i <= 1; i++) {
                game.enemyProjectiles.push(new EnemyBullet(
                    this.getCenterX() + i * 40,
                    this.y + this.height,
                    (dx / dist) + i * 0.2,
                    (dy / dist)
                ));
            }
        } else {
            // Phase 3: Bullet hell
            for (let i = -2; i <= 2; i++) {
                game.enemyProjectiles.push(new EnemyBullet(
                    this.getCenterX() + i * 25,
                    this.y + this.height,
                    i * 0.4,
                    1
                ));
            }
        }
    }

    specialAttack(game) {
        if (this.phase === 1) {
            // Circular bullet pattern
            const bulletCount = 12;
            for (let i = 0; i < bulletCount; i++) {
                const angle = (Math.PI * 2 * i) / bulletCount;
                game.enemyProjectiles.push(new EnemyBullet(
                    this.getCenterX(),
                    this.getCenterY(),
                    Math.cos(angle),
                    Math.sin(angle)
                ));
            }
        } else if (this.phase === 2) {
            // Spiral pattern
            const bulletCount = 16;
            for (let i = 0; i < bulletCount; i++) {
                const angle = (Math.PI * 2 * i) / bulletCount + this.movementTimer;
                game.enemyProjectiles.push(new EnemyBullet(
                    this.getCenterX(),
                    this.getCenterY(),
                    Math.cos(angle) * 0.8,
                    Math.sin(angle) * 0.8
                ));
            }
        } else {
            // Phase 3: Massive barrage
            for (let i = 0; i < 20; i++) {
                const angle = MathUtils.randomFloat(0, Math.PI * 2);
                const speed = MathUtils.randomFloat(0.5, 1.5);
                game.enemyProjectiles.push(new EnemyBullet(
                    this.getCenterX() + MathUtils.randomFloat(-this.width / 2, this.width / 2),
                    this.y + this.height,
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                ));
            }
        }
    }

    onPhaseChange() {
        // Speed up attacks
        this.specialAttackRate *= 0.8;
    }
}

// Stage 1 Boss implementation
class Stage1Boss extends MothershipBoss {
    constructor() {
        super();
    }
}

// Stage 2 Boss implementation
class Stage2Boss extends BattlecruiserBoss {
    constructor() {
        super();
    }
}

// Stage 3 Boss implementation
class Stage3Boss extends CommandShipBoss {
    constructor() {
        super();
    }
}

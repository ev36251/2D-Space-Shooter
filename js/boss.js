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
        this.pulseTimer = 0;
    }

    render(ctx) {
        if (!this.alive) return;

        this.pulseTimer += 0.05;
        const pulse = Math.sin(this.pulseTimer) * 0.1 + 0.9;

        ctx.save();
        ctx.translate(this.getCenterX(), this.getCenterY());

        // Main hull - angular battleship shape
        ctx.fillStyle = '#4A0080';
        ctx.beginPath();
        // Front point
        ctx.moveTo(0, -this.height / 2);
        // Right side angles
        ctx.lineTo(this.width * 0.3, -this.height * 0.3);
        ctx.lineTo(this.width * 0.5, -this.height * 0.1);
        ctx.lineTo(this.width * 0.5, this.height * 0.3);
        ctx.lineTo(this.width * 0.3, this.height * 0.5);
        // Back
        ctx.lineTo(-this.width * 0.3, this.height * 0.5);
        // Left side angles
        ctx.lineTo(-this.width * 0.5, this.height * 0.3);
        ctx.lineTo(-this.width * 0.5, -this.height * 0.1);
        ctx.lineTo(-this.width * 0.3, -this.height * 0.3);
        ctx.closePath();
        ctx.fill();

        // Hull detail stripes
        ctx.strokeStyle = '#8800FF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Central command tower
        ctx.fillStyle = '#6B00B3';
        ctx.fillRect(-30, -20, 60, 50);
        ctx.strokeStyle = '#AA00FF';
        ctx.lineWidth = 2;
        ctx.strokeRect(-30, -20, 60, 50);

        // Engine glow (back)
        const engineGlow = ctx.createRadialGradient(0, this.height * 0.4, 5, 0, this.height * 0.4, 40);
        engineGlow.addColorStop(0, `rgba(255, 100, 255, ${pulse})`);
        engineGlow.addColorStop(1, 'rgba(128, 0, 255, 0)');
        ctx.fillStyle = engineGlow;
        ctx.beginPath();
        ctx.arc(-40, this.height * 0.4, 25, 0, Math.PI * 2);
        ctx.arc(40, this.height * 0.4, 25, 0, Math.PI * 2);
        ctx.fill();

        // Weapon turrets (glowing)
        const turretGlow = `rgba(255, 0, 100, ${0.5 + pulse * 0.3})`;
        ctx.fillStyle = turretGlow;
        ctx.beginPath();
        ctx.arc(-60, 0, 12, 0, Math.PI * 2);
        ctx.arc(60, 0, 12, 0, Math.PI * 2);
        ctx.arc(0, -40, 15, 0, Math.PI * 2);
        ctx.fill();

        // Turret cores
        ctx.fillStyle = '#FF0066';
        ctx.beginPath();
        ctx.arc(-60, 0, 6, 0, Math.PI * 2);
        ctx.arc(60, 0, 6, 0, Math.PI * 2);
        ctx.arc(0, -40, 8, 0, Math.PI * 2);
        ctx.fill();

        // Phase indicator lights
        const phaseColor = this.phase === 3 ? '#FF0000' : this.phase === 2 ? '#FFAA00' : '#00FF00';
        ctx.fillStyle = phaseColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = phaseColor;
        ctx.beginPath();
        ctx.arc(-20, 10, 5, 0, Math.PI * 2);
        ctx.arc(20, 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        // Boss health bar
        this.renderBossHealthBar(ctx);
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
        this.pulseTimer = 0;
        this.rotationAngle = 0;
    }

    render(ctx) {
        if (!this.alive) return;

        this.pulseTimer += 0.03;
        this.rotationAngle += 0.02;
        const pulse = Math.sin(this.pulseTimer) * 0.15 + 0.85;

        ctx.save();
        ctx.translate(this.getCenterX(), this.getCenterY());

        // Outer ring (rotating)
        ctx.save();
        ctx.rotate(this.rotationAngle);
        ctx.strokeStyle = `rgba(0, 255, 200, ${pulse * 0.5})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.width * 0.48, 0, Math.PI * 2);
        ctx.stroke();

        // Ring segments
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            ctx.fillStyle = '#00FFAA';
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * this.width * 0.45, Math.sin(angle) * this.width * 0.45, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // Main body - hexagonal command ship
        ctx.fillStyle = '#001133';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
            const x = Math.cos(angle) * this.width * 0.38;
            const y = Math.sin(angle) * this.height * 0.38;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Hull outline
        ctx.strokeStyle = '#0088FF';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Inner hexagon
        ctx.fillStyle = '#002255';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
            const x = Math.cos(angle) * this.width * 0.25;
            const y = Math.sin(angle) * this.height * 0.25;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#00AAFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Central core (pulsing based on phase)
        const coreColor = this.phase === 3 ? '#FF0000' : this.phase === 2 ? '#FF6600' : '#00FFFF';
        const coreGlow = ctx.createRadialGradient(0, 0, 5, 0, 0, 40);
        coreGlow.addColorStop(0, coreColor);
        coreGlow.addColorStop(0.5, `rgba(${this.phase === 3 ? '255,0,0' : this.phase === 2 ? '255,100,0' : '0,255,255'}, ${pulse})`);
        coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = coreGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 40 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Core center
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Weapon pods at each hexagon vertex
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
            const x = Math.cos(angle) * this.width * 0.38;
            const y = Math.sin(angle) * this.height * 0.38;

            // Pod glow
            ctx.fillStyle = `rgba(255, 50, 50, ${0.3 + pulse * 0.4})`;
            ctx.beginPath();
            ctx.arc(x, y, 18, 0, Math.PI * 2);
            ctx.fill();

            // Pod core
            ctx.fillStyle = '#FF3333';
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();

            // Pod center
            ctx.fillStyle = '#FFAAAA';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Engine exhausts (bottom corners)
        const exhaustGlow = ctx.createRadialGradient(0, this.height * 0.35, 5, 0, this.height * 0.35, 50);
        exhaustGlow.addColorStop(0, `rgba(0, 150, 255, ${pulse})`);
        exhaustGlow.addColorStop(1, 'rgba(0, 50, 150, 0)');
        ctx.fillStyle = exhaustGlow;
        ctx.beginPath();
        ctx.arc(-50, this.height * 0.35, 35, 0, Math.PI * 2);
        ctx.arc(50, this.height * 0.35, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Boss health bar
        this.renderBossHealthBar(ctx);
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

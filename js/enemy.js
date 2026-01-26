// Base Enemy class
class Enemy extends GameObject {
    constructor(x, y, width, height, health, scoreValue) {
        super(x, y, width, height);
        this.health = health;
        this.maxHealth = health;
        this.scoreValue = scoreValue;
        this.sprite = null;
        this.radius = width / 2;
        this.fireTimer = 0;
        this.fireRate = 2.0; // Time between shots
        this.movementTimer = 0;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
        }
    }

    shoot(game) {
        // Override in subclasses
    }

    render(ctx) {
        if (!this.alive) return;

        if (this.sprite && assets.images[this.sprite]) {
            ctx.drawImage(
                assets.images[this.sprite],
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else {
            // Draw placeholder
            ctx.fillStyle = this.getColor();
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Health bar
            if (this.health < this.maxHealth) {
                this.renderHealthBar(ctx);
            }
        }
    }

    renderHealthBar(ctx) {
        const barWidth = this.width;
        const barHeight = 4;
        const barX = this.x;
        const barY = this.y - 8;

        ctx.fillStyle = '#FF0000';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = '#00FF00';
        const healthWidth = (this.health / this.maxHealth) * barWidth;
        ctx.fillRect(barX, barY, healthWidth, barHeight);
    }

    getColor() {
        return Colors.ENEMY_BASIC;
    }
}

// Stage 1 Enemies
class BasicDrone extends Enemy {
    constructor(x, y) {
        super(x, y, 32, 32, 1, GameConfig.SCORE_SMALL_ENEMY);
        this.velocity.y = 100;
        this.sprite = 'enemyDrone1';
    }

    update(deltaTime, game) {
        // Simple downward movement
        this.y += this.velocity.y * deltaTime;

        // Occasional shooting
        this.fireTimer += deltaTime;
        if (this.fireTimer > this.fireRate) {
            this.shoot(game);
            this.fireTimer = 0;
        }

        // Remove if off screen
        if (this.y > GameConfig.CANVAS_HEIGHT) {
            this.alive = false;
        }
    }

    shoot(game) {
        game.enemyProjectiles.push(new EnemyBullet(
            this.getCenterX(),
            this.y + this.height,
            0,
            1
        ));
    }

    getColor() {
        return Colors.ENEMY_BASIC;
    }
}

class SideDrone extends Enemy {
    constructor(x, y, direction) {
        super(x, y, 32, 32, 1, GameConfig.SCORE_SMALL_ENEMY);
        this.velocity.y = 80;
        this.velocity.x = direction * 60; // Moves diagonally
        this.sprite = 'enemyDrone2';
    }

    update(deltaTime, game) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;

        if (this.y > GameConfig.CANVAS_HEIGHT || this.x < -this.width || this.x > GameConfig.CANVAS_WIDTH) {
            this.alive = false;
        }
    }

    getColor() {
        return '#FF3366';
    }
}

// Stage 2 Enemies
class AdvancedFighter extends Enemy {
    constructor(x, y) {
        super(x, y, 40, 40, 3, GameConfig.SCORE_MEDIUM_ENEMY);
        this.velocity.y = 120;
        this.sprite = 'enemyFighter';
        this.zigzagAmplitude = 100;
        this.zigzagFrequency = 2;
    }

    update(deltaTime, game) {
        this.movementTimer += deltaTime;

        // Zigzag movement
        this.x += Math.sin(this.movementTimer * this.zigzagFrequency) * this.zigzagAmplitude * deltaTime;
        this.y += this.velocity.y * deltaTime;

        // Shoot occasionally
        this.fireTimer += deltaTime;
        if (this.fireTimer > this.fireRate) {
            this.shoot(game);
            this.fireTimer = MathUtils.randomFloat(0, 1); // Randomize next shot
        }

        if (this.y > GameConfig.CANVAS_HEIGHT) {
            this.alive = false;
        }
    }

    shoot(game) {
        // Shoot toward player
        const dx = game.player.getCenterX() - this.getCenterX();
        const dy = game.player.getCenterY() - this.getCenterY();
        const distance = Math.sqrt(dx * dx + dy * dy);

        game.enemyProjectiles.push(new EnemyBullet(
            this.getCenterX(),
            this.y + this.height,
            dx / distance,
            dy / distance
        ));
    }

    getColor() {
        return Colors.ENEMY_ADVANCED;
    }
}

class KamikazeShip extends Enemy {
    constructor(x, y, player) {
        super(x, y, 28, 28, 2, GameConfig.SCORE_MEDIUM_ENEMY);
        this.sprite = 'enemyKamikaze';
        this.targetX = player.getCenterX();
        this.targetY = player.getCenterY();
        this.speed = 200;
        this.calculateVelocity();
    }

    calculateVelocity() {
        const dx = this.targetX - this.getCenterX();
        const dy = this.targetY - this.getCenterY();
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.velocity.x = (dx / distance) * this.speed;
            this.velocity.y = (dy / distance) * this.speed;
        }
    }

    update(deltaTime, game) {
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;

        if (this.isOffScreen(GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT)) {
            this.alive = false;
        }
    }

    getColor() {
        return '#FF9900';
    }
}

class TurretPlatform extends Enemy {
    constructor(x, y) {
        super(x, y, 48, 48, 5, GameConfig.SCORE_MEDIUM_ENEMY);
        this.velocity.y = 40; // Slow movement
        this.sprite = 'enemyTurret';
        this.fireRate = 1.0; // Fast firing
    }

    update(deltaTime, game) {
        this.y += this.velocity.y * deltaTime;

        // Stop moving when in upper third of screen
        if (this.y > GameConfig.CANVAS_HEIGHT * 0.2 && this.y < GameConfig.CANVAS_HEIGHT * 0.4) {
            this.velocity.y = 0;
        }

        // Rapid fire
        this.fireTimer += deltaTime;
        if (this.fireTimer > this.fireRate) {
            this.shoot(game);
            this.fireTimer = 0;
        }

        if (this.y > GameConfig.CANVAS_HEIGHT) {
            this.alive = false;
        }
    }

    shoot(game) {
        // Shoot 3 bullets in spread pattern
        for (let i = -1; i <= 1; i++) {
            game.enemyProjectiles.push(new EnemyBullet(
                this.getCenterX(),
                this.y + this.height,
                i * 0.5,
                1
            ));
        }
    }

    getColor() {
        return '#CC00CC';
    }
}

// Stage 3 Enemies
class EliteInterceptor extends Enemy {
    constructor(x, y) {
        super(x, y, 36, 36, 4, GameConfig.SCORE_LARGE_ENEMY);
        this.velocity.y = 150;
        this.sprite = 'enemyInterceptor';
        this.phase = 0;
    }

    update(deltaTime, game) {
        this.movementTimer += deltaTime;

        // Complex movement pattern - circular swoops
        const radius = 80;
        const angularSpeed = 3;
        this.x += Math.cos(this.movementTimer * angularSpeed) * radius * deltaTime;
        this.y += this.velocity.y * deltaTime;

        this.fireTimer += deltaTime;
        if (this.fireTimer > 1.5) {
            this.shoot(game);
            this.fireTimer = 0;
        }

        if (this.y > GameConfig.CANVAS_HEIGHT) {
            this.alive = false;
        }
    }

    shoot(game) {
        // Shoot burst of 3 bullets
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (this.alive && game.player.alive) {
                    const dx = game.player.getCenterX() - this.getCenterX();
                    const dy = game.player.getCenterY() - this.getCenterY();
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    game.enemyProjectiles.push(new EnemyBullet(
                        this.getCenterX(),
                        this.y + this.height,
                        dx / dist,
                        dy / dist
                    ));
                }
            }, i * 100);
        }
    }

    getColor() {
        return Colors.ENEMY_ELITE;
    }
}

class HeavyBomber extends Enemy {
    constructor(x, y) {
        super(x, y, 56, 56, 8, GameConfig.SCORE_LARGE_ENEMY);
        this.velocity.y = 60; // Slow but tough
        this.sprite = 'enemyBomber';
        this.fireRate = 2.5;
    }

    update(deltaTime, game) {
        this.y += this.velocity.y * deltaTime;

        this.fireTimer += deltaTime;
        if (this.fireTimer > this.fireRate) {
            this.shoot(game);
            this.fireTimer = 0;
        }

        if (this.y > GameConfig.CANVAS_HEIGHT) {
            this.alive = false;
        }
    }

    shoot(game) {
        // Drop mines/bombs
        game.enemyProjectiles.push(new EnemyBullet(
            this.getCenterX() - 15,
            this.y + this.height,
            0,
            0.5
        ));
        game.enemyProjectiles.push(new EnemyBullet(
            this.getCenterX() + 15,
            this.y + this.height,
            0,
            0.5
        ));
    }

    getColor() {
        return '#990000';
    }
}

class ShieldedCarrier extends Enemy {
    constructor(x, y) {
        super(x, y, 64, 64, 10, GameConfig.SCORE_LARGE_ENEMY);
        this.velocity.y = 50;
        this.sprite = 'enemyCarrier';
        this.fireRate = 3.0;
        this.spawnTimer = 0;
        this.spawnRate = 4.0;
    }

    update(deltaTime, game) {
        this.y += this.velocity.y * deltaTime;

        // Spawn smaller enemies
        this.spawnTimer += deltaTime;
        if (this.spawnTimer > this.spawnRate && this.y > 50 && this.y < GameConfig.CANVAS_HEIGHT - 100) {
            this.spawnMinion(game);
            this.spawnTimer = 0;
        }

        this.fireTimer += deltaTime;
        if (this.fireTimer > this.fireRate) {
            this.shoot(game);
            this.fireTimer = 0;
        }

        if (this.y > GameConfig.CANVAS_HEIGHT) {
            this.alive = false;
        }
    }

    spawnMinion(game) {
        // Spawn small drone from carrier
        game.enemies.push(new BasicDrone(this.getCenterX() - 20, this.y));
        game.enemies.push(new BasicDrone(this.getCenterX() + 20, this.y));
    }

    shoot(game) {
        game.enemyProjectiles.push(new EnemyBullet(
            this.getCenterX(),
            this.y + this.height,
            0,
            1
        ));
    }

    getColor() {
        return '#6600CC';
    }

    render(ctx) {
        super.render(ctx);

        // Draw shield effect
        if (this.health > this.maxHealth / 2) {
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.arc(this.getCenterX(), this.getCenterY(), this.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
    }
}

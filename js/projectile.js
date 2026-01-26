// Projectile class for bullets and lasers
class Projectile extends GameObject {
    constructor(x, y, velocityX, velocityY, damage, isPlayerProjectile = true) {
        super(x, y, 6, 14); // Default size for projectiles
        this.velocity.x = velocityX;
        this.velocity.y = velocityY;
        this.damage = damage;
        this.isPlayerProjectile = isPlayerProjectile;
        this.radius = 4; // For circular collision
        this.sprite = null; // Will be set when assets loaded
    }

    update(deltaTime) {
        // Move based on velocity
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;

        // Mark as dead if off screen
        if (this.isOffScreen(GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT)) {
            this.alive = false;
        }
    }

    render(ctx) {
        if (!this.alive) return;

        if (this.sprite && assets.images[this.sprite]) {
            // Draw sprite if available
            ctx.drawImage(
                assets.images[this.sprite],
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        } else {
            // Draw placeholder
            ctx.fillStyle = this.isPlayerProjectile ? Colors.PLAYER_LASER : Colors.ENEMY_BULLET;
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);

            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.isPlayerProjectile ? Colors.PLAYER_LASER : Colors.ENEMY_BULLET;
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            ctx.shadowBlur = 0;
        }
    }
}

// Player laser projectile
class PlayerLaser extends Projectile {
    constructor(x, y, weaponLevel = 1) {
        super(x, y, 0, -600, weaponLevel, true); // Speed -600 (upward)
        this.sprite = 'playerLaser';
        this.width = 8;
        this.height = 16;
    }
}

// Enemy bullet projectile
class EnemyBullet extends Projectile {
    constructor(x, y, targetX = 0, targetY = 1) {
        const speed = 300;
        const angle = Math.atan2(targetY, targetX);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        super(x, y, vx, vy, 8, false); // 8 damage for health bar system
        this.sprite = 'enemyBullet';
        this.width = 6;
        this.height = 12;
    }

    render(ctx) {
        if (!this.alive) return;

        // Visual size (1.8x larger for visibility)
        const visualWidth = this.width * 1.8;
        const visualHeight = this.height * 1.8;

        if (this.sprite && assets.images[this.sprite]) {
            // Draw sprite larger with bright red tint
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';

            // Draw larger sprite
            ctx.drawImage(
                assets.images[this.sprite],
                this.x - visualWidth / 2,
                this.y - visualHeight / 2,
                visualWidth,
                visualHeight
            );

            // Add bright red overlay
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = '#FF3333';
            ctx.fillRect(this.x - visualWidth / 2, this.y - visualHeight / 2, visualWidth, visualHeight);

            ctx.restore();
        } else {
            // Draw bright red placeholder
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x - visualWidth / 2, this.y - visualHeight / 2, visualWidth, visualHeight);

            // Add intense glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#FF0000';
            ctx.fillRect(this.x - visualWidth / 2, this.y - visualHeight / 2, visualWidth, visualHeight);
            ctx.shadowBlur = 0;
        }
    }
}

// Enemy missile (slower, homing)
class EnemyMissile extends Projectile {
    constructor(x, y) {
        super(x, y, 0, 200, 12, false); // 12 damage - more dangerous
        this.sprite = 'enemyMissile';
        this.width = 8;
        this.height = 16;
        this.homingSpeed = 50;
    }

    update(deltaTime, player) {
        // Basic homing toward player
        if (player && player.alive) {
            const dx = player.getCenterX() - this.getCenterX();
            const dy = player.getCenterY() - this.getCenterY();
            const angle = Math.atan2(dy, dx);

            this.velocity.x += Math.cos(angle) * this.homingSpeed * deltaTime;
            this.velocity.y += Math.sin(angle) * this.homingSpeed * deltaTime;

            // Limit max speed
            const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
            if (speed > 300) {
                this.velocity.x = (this.velocity.x / speed) * 300;
                this.velocity.y = (this.velocity.y / speed) * 300;
            }
        }

        super.update(deltaTime);
    }

    render(ctx) {
        if (!this.alive) return;

        // Visual size (2x larger for missiles - more dangerous)
        const visualWidth = this.width * 2;
        const visualHeight = this.height * 2;

        if (this.sprite && assets.images[this.sprite]) {
            // Draw sprite larger with bright red tint
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';

            // Draw larger sprite
            ctx.drawImage(
                assets.images[this.sprite],
                this.x - visualWidth / 2,
                this.y - visualHeight / 2,
                visualWidth,
                visualHeight
            );

            // Add bright red overlay
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = '#FF6666';
            ctx.fillRect(this.x - visualWidth / 2, this.y - visualHeight / 2, visualWidth, visualHeight);

            ctx.restore();
        } else {
            // Draw bright red placeholder
            ctx.fillStyle = '#FF3333';
            ctx.fillRect(this.x - visualWidth / 2, this.y - visualHeight / 2, visualWidth, visualHeight);

            // Add intense glow effect (stronger for missiles)
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#FF0000';
            ctx.fillRect(this.x - visualWidth / 2, this.y - visualHeight / 2, visualWidth, visualHeight);
            ctx.shadowBlur = 0;
        }
    }
}

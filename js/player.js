// Player ship class
class Player extends GameObject {
    constructor(x, y) {
        super(x, y, 48, 48); // Player ship size
        this.speed = GameConfig.PLAYER_SPEED;
        this.health = 100; // Health bar system
        this.maxHealth = 100;
        this.weaponLevel = 1;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleDuration = 1.5; // 1.5 seconds after taking damage
        this.fireTimer = 0;
        this.fireRate = GameConfig.PLAYER_FIRE_RATE;
        this.radius = 20; // For circular collision
        this.sprite = 'playerShip';
        this.trailTimer = 0;
        this.shieldActive = false;
        this.shieldHits = 0; // Shield lasts for 3 hits
        this.missiles = 0; // Missile ammo count
        this.maxMissiles = 9; // Maximum missiles player can hold
        this.missileFireTimer = 0;
        this.missileFireRate = 0.5; // Can fire a missile every 0.5 seconds
    }

    update(deltaTime, input, game) {
        if (!this.alive) return;

        // Handle movement
        this.handleMovement(deltaTime, input);

        // Handle shooting
        this.handleShooting(deltaTime, input, game);

        // Handle missile firing
        this.handleMissileFiring(deltaTime, input, game);

        // Update invincibility
        if (this.invincible) {
            this.invincibleTimer += deltaTime;
            if (this.invincibleTimer >= this.invincibleDuration) {
                this.invincible = false;
                this.invincibleTimer = 0;
            }
        }

        // Shield is now permanent until it takes 3 hits (handled in takeDamage)

        // Create engine trail
        this.trailTimer += deltaTime;
        if (this.trailTimer > 0.05) {
            game.particleSystem.createEngineTrail(
                this.getCenterX(),
                this.y + this.height
            );
            this.trailTimer = 0;
        }
    }

    handleMovement(deltaTime, input) {
        let dx = 0;
        let dy = 0;

        if (input.isLeftPressed()) dx -= 1;
        if (input.isRightPressed()) dx += 1;
        if (input.isUpPressed()) dy -= 1;
        if (input.isDownPressed()) dy += 1;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        // Apply movement
        this.x += dx * this.speed * deltaTime;
        this.y += dy * this.speed * deltaTime;

        // Keep player on screen with padding
        const padding = 10;
        this.x = MathUtils.clamp(this.x, padding, GameConfig.CANVAS_WIDTH - this.width - padding);
        this.y = MathUtils.clamp(this.y, padding, GameConfig.CANVAS_HEIGHT - this.height - padding);
    }

    handleShooting(deltaTime, input, game) {
        this.fireTimer += deltaTime;

        if (input.isShootPressed() && this.fireTimer >= this.fireRate) {
            this.shoot(game);
            this.fireTimer = 0;
        }
    }

    handleMissileFiring(deltaTime, input, game) {
        this.missileFireTimer += deltaTime;

        if (input.isMissilePressed() && this.missiles > 0 && this.missileFireTimer >= this.missileFireRate) {
            this.fireMissile(game);
            this.missileFireTimer = 0;
        }
    }

    fireMissile(game) {
        if (this.missiles <= 0) return;

        this.missiles--;

        const centerX = this.getCenterX();
        const topY = this.y;

        game.playerProjectiles.push(new PlayerMissile(centerX, topY));

        // Play missile sound (use a different sound if available)
        if (game.audioManager) {
            game.audioManager.playSound('playerShoot');
        }
    }

    addMissiles(count) {
        this.missiles = Math.min(this.missiles + count, this.maxMissiles);
    }

    shoot(game) {
        const centerX = this.getCenterX();
        const topY = this.y;

        // Different shooting patterns based on weapon level
        switch (this.weaponLevel) {
            case 1: // Single shot
                game.playerProjectiles.push(new PlayerLaser(centerX, topY, 1));
                break;

            case 2: // Dual shot
                game.playerProjectiles.push(new PlayerLaser(centerX - 12, topY, 1));
                game.playerProjectiles.push(new PlayerLaser(centerX + 12, topY, 1));
                break;

            case 3: // Triple shot (max level)
                game.playerProjectiles.push(new PlayerLaser(centerX, topY, 1));
                game.playerProjectiles.push(new PlayerLaser(centerX - 15, topY + 10, 1));
                game.playerProjectiles.push(new PlayerLaser(centerX + 15, topY + 10, 1));
                break;
        }

        // Play shoot sound
        if (game.audioManager) {
            game.audioManager.playSound('playerShoot');
        }
    }

    takeDamage(amount) {
        if (this.invincible) return;

        // Shield blocks damage but loses a hit
        if (this.shieldActive) {
            this.shieldHits--;
            if (this.shieldHits <= 0) {
                this.shieldActive = false;
                this.shieldHits = 0;
            }
            // Grant brief invincibility after shield hit
            this.invincible = true;
            this.invincibleTimer = 0;
            return;
        }

        // Take actual damage
        this.health -= amount;

        // Lose a weapon level if at max level (3 guns)
        if (this.weaponLevel === 3) {
            this.weaponLevel = 2;
        }

        if (this.health <= 0) {
            this.health = 0;
            this.alive = false;
        } else {
            // Grant temporary invincibility
            this.invincible = true;
            this.invincibleTimer = 0;
        }
    }

    upgradeWeapon() {
        if (this.weaponLevel < 3) {
            this.weaponLevel++;
        }
        // Max level is 3 (triple shot) - don't upgrade beyond that
    }

    activateShield() {
        this.shieldActive = true;
        this.shieldHits = 3; // Shield lasts for 3 hits
    }

    addLife() {
        // Heal 25 health (was "add life")
        this.health = Math.min(this.health + 25, this.maxHealth);
    }

    render(ctx) {
        if (!this.alive) return;

        // Draw shield if active
        if (this.shieldActive) {
            ctx.strokeStyle = Colors.POWERUP_SHIELD;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
            ctx.beginPath();
            ctx.arc(this.getCenterX(), this.getCenterY(), this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }

        // Flash when invincible
        if (this.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.sprite && assets.images[this.sprite]) {
            // Draw sprite
            ctx.drawImage(
                assets.images[this.sprite],
                this.x,
                this.y,
                this.width,
                this.height
            );
        } else {
            // Draw placeholder (triangle shape)
            ctx.fillStyle = Colors.PLAYER;
            ctx.beginPath();
            ctx.moveTo(this.getCenterX(), this.y); // Top point
            ctx.lineTo(this.x, this.y + this.height); // Bottom left
            ctx.lineTo(this.x + this.width, this.y + this.height); // Bottom right
            ctx.closePath();
            ctx.fill();

            // Add glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = Colors.PLAYER;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1.0;
    }

    reset() {
        this.x = GameConfig.CANVAS_WIDTH / 2 - this.width / 2;
        this.y = GameConfig.CANVAS_HEIGHT - 100;
        this.health = 100;
        this.alive = true;
        this.weaponLevel = 1;
        this.invincible = true;
        this.invincibleTimer = 0;
        this.shieldActive = false;
        this.fireRate = GameConfig.PLAYER_FIRE_RATE;
        this.missiles = 0;
        this.missileFireTimer = 0;
    }
}

// Power-up types
const PowerupType = {
    WEAPON: 'weapon',
    SHIELD: 'shield',
    LIFE: 'life',
    MULTIPLIER: 'multiplier',
    MISSILE: 'missile',
    SPEED: 'speed'
};

// Power-up class
class Powerup extends GameObject {
    constructor(x, y, type) {
        super(x, y, 24, 24);
        this.type = type;
        this.velocity.y = 120; // Float downward
        this.radius = 12;
        this.sprite = this.getSpriteForType();
        this.bobTimer = 0;
        this.bobOffset = 0;
        this.rotation = 0;
    }

    getSpriteForType() {
        switch (this.type) {
            case PowerupType.WEAPON: return 'powerupWeapon';
            case PowerupType.SHIELD: return 'powerupShield';
            case PowerupType.LIFE: return 'powerupLife';
            case PowerupType.MULTIPLIER: return 'powerupMultiplier';
            case PowerupType.MISSILE: return 'powerupMissile';
            case PowerupType.SPEED: return 'powerupSpeed';
            default: return null;
        }
    }

    getColor() {
        switch (this.type) {
            case PowerupType.WEAPON: return Colors.POWERUP_WEAPON;
            case PowerupType.SHIELD: return Colors.POWERUP_SHIELD;
            case PowerupType.LIFE: return Colors.POWERUP_LIFE;
            case PowerupType.MULTIPLIER: return '#FFD700';
            case PowerupType.MISSILE: return '#FF6600';
            case PowerupType.SPEED: return '#00FFFF';
            default: return '#FFFFFF';
        }
    }

    update(deltaTime) {
        // Float downward
        this.y += this.velocity.y * deltaTime;

        // Bob up and down slightly
        this.bobTimer += deltaTime * 3;
        this.bobOffset = Math.sin(this.bobTimer) * 5;

        // Rotate
        this.rotation += deltaTime * 2;

        // Remove if off screen
        if (this.y > GameConfig.CANVAS_HEIGHT + this.height) {
            this.alive = false;
        }
    }

    render(ctx) {
        if (!this.alive) return;

        const centerX = this.getCenterX();
        const centerY = this.getCenterY() + this.bobOffset;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        if (this.sprite && assets.images[this.sprite]) {
            ctx.drawImage(
                assets.images[this.sprite],
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
        } else {
            // Draw placeholder
            ctx.fillStyle = this.getColor();

            // Draw icon based on type
            switch (this.type) {
                case PowerupType.WEAPON:
                    // Draw arrow up
                    ctx.beginPath();
                    ctx.moveTo(0, -10);
                    ctx.lineTo(-8, 6);
                    ctx.lineTo(-4, 6);
                    ctx.lineTo(-4, 10);
                    ctx.lineTo(4, 10);
                    ctx.lineTo(4, 6);
                    ctx.lineTo(8, 6);
                    ctx.closePath();
                    ctx.fill();
                    break;

                case PowerupType.SHIELD:
                    // Draw shield
                    ctx.beginPath();
                    ctx.arc(0, 0, 10, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = this.getColor();
                    ctx.stroke();
                    break;

                case PowerupType.LIFE:
                    // Draw heart
                    ctx.beginPath();
                    ctx.moveTo(0, 2);
                    ctx.bezierCurveTo(-10, -6, -10, 4, 0, 10);
                    ctx.bezierCurveTo(10, 4, 10, -6, 0, 2);
                    ctx.fill();
                    break;

                case PowerupType.MULTIPLIER:
                    // Draw star
                    const spikes = 5;
                    const outerRadius = 10;
                    const innerRadius = 5;
                    ctx.beginPath();
                    for (let i = 0; i < spikes * 2; i++) {
                        const radius = i % 2 === 0 ? outerRadius : innerRadius;
                        const angle = (Math.PI * i) / spikes;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.fill();
                    break;

                case PowerupType.MISSILE:
                    // Draw missile icon
                    ctx.beginPath();
                    // Missile body
                    ctx.moveTo(0, -10);
                    ctx.lineTo(4, -6);
                    ctx.lineTo(4, 6);
                    ctx.lineTo(7, 10);
                    ctx.lineTo(-7, 10);
                    ctx.lineTo(-4, 6);
                    ctx.lineTo(-4, -6);
                    ctx.closePath();
                    ctx.fill();
                    // Fins
                    ctx.fillRect(-8, 4, 4, 6);
                    ctx.fillRect(4, 4, 4, 6);
                    break;

                case PowerupType.SPEED:
                    // Draw lightning bolt
                    ctx.beginPath();
                    ctx.moveTo(2, -10);
                    ctx.lineTo(-6, 0);
                    ctx.lineTo(-1, 0);
                    ctx.lineTo(-3, 10);
                    ctx.lineTo(6, 0);
                    ctx.lineTo(1, 0);
                    ctx.closePath();
                    ctx.fill();
                    break;
            }

            // Add glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.getColor();
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    apply(player, game) {
        switch (this.type) {
            case PowerupType.WEAPON:
                player.upgradeWeapon();
                break;

            case PowerupType.SHIELD:
                player.activateShield(); // Shield lasts for 3 hits
                break;

            case PowerupType.LIFE:
                player.addLife();
                break;

            case PowerupType.MULTIPLIER:
                if (game.scoreManager) {
                    game.scoreManager.activateMultiplier(2, 10.0);
                }
                break;

            case PowerupType.MISSILE:
                player.addMissiles(3); // Add 3 missiles
                break;

            case PowerupType.SPEED:
                player.activateSpeedBoost(10.0); // 10 seconds of speed boost
                break;
        }
    }
}

// Helper function to create random power-up
function createRandomPowerup(x, y, excludeWeapon = false) {
    let types;
    let weights;

    if (excludeWeapon) {
        // Don't spawn weapon powerups if player is at max level
        types = [
            PowerupType.SHIELD,
            PowerupType.LIFE,
            PowerupType.MULTIPLIER,
            PowerupType.MISSILE,
            PowerupType.SPEED
        ];
        weights = [10, 10, 10, 10, 60]; // Speed boost 60% for testing
    } else {
        types = [
            PowerupType.WEAPON,
            PowerupType.SHIELD,
            PowerupType.LIFE,
            PowerupType.MULTIPLIER,
            PowerupType.MISSILE,
            PowerupType.SPEED
        ];
        weights = [10, 10, 5, 5, 10, 60]; // Speed boost 60% for testing
    }

    // Weighted random selection
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < types.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return new Powerup(x, y, types[i]);
        }
    }

    return new Powerup(x, y, excludeWeapon ? PowerupType.SHIELD : PowerupType.WEAPON);
}

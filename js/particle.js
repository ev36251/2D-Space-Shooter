// Particle class for visual effects
class Particle {
    constructor(x, y, velocityX, velocityY, color, size, lifetime) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.color = color;
        this.size = size;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.alive = true;
    }

    update(deltaTime) {
        // Move particle
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

        // Apply gravity/deceleration
        this.velocityX *= 0.99;
        this.velocityY *= 0.99;

        // Decrease lifetime
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.alive = false;
        }
    }

    render(ctx) {
        if (!this.alive) return;

        const alpha = this.lifetime / this.maxLifetime;
        ctx.globalAlpha = alpha;

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);

        ctx.globalAlpha = 1.0;
    }
}

// Particle system manager
class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    createExplosion(x, y, size = 'small') {
        const particleCount = size === 'small' ? 15 : size === 'medium' ? 30 : 50;
        const colorPalette = Colors.EXPLOSION;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + MathUtils.randomFloat(-0.3, 0.3);
            const speed = MathUtils.randomFloat(100, 300);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            const particleSize = MathUtils.randomInt(2, size === 'large' ? 8 : 5);
            const lifetime = MathUtils.randomFloat(0.3, 0.8);

            this.particles.push(new Particle(x, y, vx, vy, color, particleSize, lifetime));
        }
    }

    createHitSpark(x, y) {
        for (let i = 0; i < 5; i++) {
            const angle = MathUtils.randomFloat(0, Math.PI * 2);
            const speed = MathUtils.randomFloat(50, 150);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            this.particles.push(new Particle(
                x, y, vx, vy,
                '#FFFFFF',
                MathUtils.randomInt(2, 4),
                0.2
            ));
        }
    }

    createEngineTrail(x, y, color = '#00CCFF') {
        const vx = MathUtils.randomFloat(-20, 20);
        const vy = MathUtils.randomFloat(50, 100); // Trail goes downward

        this.particles.push(new Particle(
            x, y, vx, vy,
            color,
            MathUtils.randomInt(2, 4),
            0.5
        ));
    }

    update(deltaTime) {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(deltaTime);

            // Remove dead particles
            if (!this.particles[i].alive) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        this.particles.forEach(particle => particle.render(ctx));
    }

    clear() {
        this.particles = [];
    }
}

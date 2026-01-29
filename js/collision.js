// Collision detection system
class CollisionSystem {
    constructor() {
        this.collisions = [];
    }

    // AABB (Axis-Aligned Bounding Box) collision - rectangular collision
    checkAABB(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    // Circular collision - more accurate for rounded sprites
    checkCircular(obj1, obj2) {
        const dx = obj1.getCenterX() - obj2.getCenterX();
        const dy = obj1.getCenterY() - obj2.getCenterY();
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Use radius from object if available, otherwise use width/2
        const radius1 = obj1.radius || obj1.width / 2;
        const radius2 = obj2.radius || obj2.width / 2;

        return distance < (radius1 + radius2);
    }

    // Check collision with some tolerance (makes gameplay more forgiving)
    checkWithTolerance(obj1, obj2, tolerance = 0.8) {
        const reducedObj1 = {
            x: obj1.x + obj1.width * (1 - tolerance) / 2,
            y: obj1.y + obj1.height * (1 - tolerance) / 2,
            width: obj1.width * tolerance,
            height: obj1.height * tolerance,
            getCenterX: obj1.getCenterX.bind(obj1),
            getCenterY: obj1.getCenterY.bind(obj1)
        };

        return this.checkCircular(reducedObj1, obj2);
    }

    // Check all collisions for the game
    checkAllCollisions(game) {
        // Player projectiles vs enemies
        this.checkProjectileEnemyCollisions(game);

        // Enemy projectiles vs player
        this.checkEnemyProjectilePlayerCollisions(game);

        // Player vs power-ups
        this.checkPlayerPowerupCollisions(game);

        // Player vs enemies (collision damage)
        this.checkPlayerEnemyCollisions(game);
    }

    checkProjectileEnemyCollisions(game) {
        for (let i = game.playerProjectiles.length - 1; i >= 0; i--) {
            const projectile = game.playerProjectiles[i];
            if (!projectile.alive) continue;

            // Check against enemies
            for (let j = game.enemies.length - 1; j >= 0; j--) {
                const enemy = game.enemies[j];
                if (!enemy.alive) continue;

                if (this.checkCircular(projectile, enemy)) {
                    projectile.alive = false;
                    enemy.takeDamage(projectile.damage);

                    // Handle missile explosion
                    if (projectile.isMissile) {
                        this.createMissileExplosion(game, projectile.x, projectile.y, projectile.explosionRadius, projectile.explosionDamage);
                    }

                    if (!enemy.alive) {
                        game.onEnemyDestroyed(enemy);
                    }

                    game.createHitEffect(projectile.x, projectile.y);
                    break; // Projectile can only hit one enemy
                }
            }

            // Check against bosses
            if (game.boss && game.boss.alive) {
                if (this.checkCircular(projectile, game.boss)) {
                    projectile.alive = false;
                    game.boss.takeDamage(projectile.damage);

                    // Handle missile explosion
                    if (projectile.isMissile) {
                        this.createMissileExplosion(game, projectile.x, projectile.y, projectile.explosionRadius, projectile.explosionDamage);
                    }

                    if (!game.boss.alive) {
                        game.onBossDestroyed(game.boss);
                    }

                    game.createHitEffect(projectile.x, projectile.y);
                }
            }
        }
    }

    // Create missile explosion that damages nearby enemies
    createMissileExplosion(game, x, y, radius, damage) {
        // Create large explosion visual
        game.particleSystem.createExplosion(x, y, 'large');

        // Play explosion sound
        if (game.audioManager) {
            game.audioManager.playSound('enemyExplode');
        }

        // Damage all enemies within explosion radius
        for (let enemy of game.enemies) {
            if (!enemy.alive) continue;

            const dx = enemy.getCenterX() - x;
            const dy = enemy.getCenterY() - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                enemy.takeDamage(damage);
                game.createHitEffect(enemy.getCenterX(), enemy.getCenterY());

                if (!enemy.alive) {
                    game.onEnemyDestroyed(enemy);
                }
            }
        }

        // Also damage boss if within range
        if (game.boss && game.boss.alive) {
            const dx = game.boss.getCenterX() - x;
            const dy = game.boss.getCenterY() - y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < radius) {
                game.boss.takeDamage(damage);
                game.createHitEffect(game.boss.getCenterX(), game.boss.getCenterY());

                if (!game.boss.alive) {
                    game.onBossDestroyed(game.boss);
                }
            }
        }
    }

    checkEnemyProjectilePlayerCollisions(game) {
        if (!game.player.alive || game.player.invincible) return;

        for (let i = game.enemyProjectiles.length - 1; i >= 0; i--) {
            const projectile = game.enemyProjectiles[i];
            if (!projectile.alive) continue;

            if (this.checkWithTolerance(game.player, projectile, 0.7)) {
                projectile.alive = false;
                game.player.takeDamage(projectile.damage);
                game.createHitEffect(game.player.getCenterX(), game.player.getCenterY());

                if (!game.player.alive) {
                    game.onPlayerDeath();
                }
            }
        }
    }

    checkPlayerPowerupCollisions(game) {
        if (!game.player.alive) return;

        for (let i = game.powerups.length - 1; i >= 0; i--) {
            const powerup = game.powerups[i];
            if (!powerup.alive) continue;

            if (this.checkCircular(game.player, powerup)) {
                powerup.alive = false;
                game.onPowerupCollected(powerup);
            }
        }
    }

    checkPlayerEnemyCollisions(game) {
        if (!game.player.alive || game.player.invincible) return;

        // Check against regular enemies
        for (let i = game.enemies.length - 1; i >= 0; i--) {
            const enemy = game.enemies[i];
            if (!enemy.alive) continue;

            if (this.checkWithTolerance(game.player, enemy, 0.75)) {
                enemy.alive = false;
                game.player.takeDamage(15); // Collision does significant damage
                game.createExplosion(enemy.getCenterX(), enemy.getCenterY(), 'medium');

                if (!game.player.alive) {
                    game.onPlayerDeath();
                }
            }
        }

        // Check against boss
        if (game.boss && game.boss.alive) {
            if (this.checkWithTolerance(game.player, game.boss, 0.7)) {
                game.player.takeDamage(25); // Boss collision is very dangerous
                game.createHitEffect(game.player.getCenterX(), game.player.getCenterY());

                if (!game.player.alive) {
                    game.onPlayerDeath();
                }
            }
        }
    }
}

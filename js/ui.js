// UI manager class
class UI {
    constructor() {
        this.blinkTimer = 0;
        this.blinkState = true;
    }

    update(deltaTime) {
        // Update blink animation for "Press Enter"
        this.blinkTimer += deltaTime;
        if (this.blinkTimer > 0.5) {
            this.blinkState = !this.blinkState;
            this.blinkTimer = 0;
        }
    }

    renderMenu(ctx) {
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // Title
        ctx.fillStyle = Colors.UI_TEXT;
        ctx.font = '48px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = Colors.UI_TEXT;
        ctx.fillText('COSMIC', GameConfig.CANVAS_WIDTH / 2, 180);
        ctx.fillText('DEFENDER', GameConfig.CANVAS_WIDTH / 2, 240);
        ctx.shadowBlur = 0;

        // Instructions
        ctx.font = '14px "Press Start 2P"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Arrow Keys / WASD - Move', GameConfig.CANVAS_WIDTH / 2, 320);
        ctx.fillText('SPACEBAR - Shoot', GameConfig.CANVAS_WIDTH / 2, 350);
        ctx.fillText('P / ESC - Pause', GameConfig.CANVAS_WIDTH / 2, 380);

        // Press Enter to start (blinking)
        if (this.blinkState) {
            ctx.font = '20px "Press Start 2P"';
            ctx.fillStyle = Colors.UI_TEXT;
            ctx.fillText('PRESS ENTER TO START', GameConfig.CANVAS_WIDTH / 2, 480);
        }

        ctx.textAlign = 'left';
    }

    renderHUD(ctx, game) {
        ctx.font = '16px "Press Start 2P"';
        ctx.fillStyle = Colors.UI_TEXT;

        // Score
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${game.score}`, 20, 30);

        // High Score
        ctx.fillText(`HI-SCORE: ${game.highScore}`, 20, 55);

        // Health Bar
        ctx.fillText('HEALTH:', 20, GameConfig.CANVAS_HEIGHT - 20);

        const healthBarX = 140;
        const healthBarY = GameConfig.CANVAS_HEIGHT - 35;
        const healthBarWidth = 200;
        const healthBarHeight = 20;

        // Health bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(healthBarX - 2, healthBarY - 2, healthBarWidth + 4, healthBarHeight + 4);

        // Health bar border
        ctx.strokeStyle = Colors.UI_BORDER;
        ctx.lineWidth = 2;
        ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

        // Health fill (color changes based on health percentage)
        const healthPercent = game.player.health / game.player.maxHealth;
        const fillWidth = healthBarWidth * healthPercent;

        // Color gradient based on health
        let healthColor;
        if (healthPercent > 0.6) {
            healthColor = '#00FF00'; // Green - healthy
        } else if (healthPercent > 0.3) {
            healthColor = '#FFFF00'; // Yellow - damaged
        } else {
            healthColor = '#FF0000'; // Red - critical
        }

        ctx.fillStyle = healthColor;
        ctx.fillRect(healthBarX, healthBarY, fillWidth, healthBarHeight);

        // Health text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.ceil(game.player.health)}%`, healthBarX + healthBarWidth / 2, healthBarY + 15);
        ctx.textAlign = 'left';

        // Stage indicator
        ctx.textAlign = 'right';
        ctx.fillStyle = Colors.UI_TEXT;
        ctx.fillText(`STAGE ${game.currentStage}`, GameConfig.CANVAS_WIDTH - 20, 30);

        // Weapon level
        ctx.fillText(`WEAPON: ${'I'.repeat(game.player.weaponLevel)}`, GameConfig.CANVAS_WIDTH - 20, 55);

        // Shield indicator
        if (game.player.shieldActive) {
            ctx.fillStyle = Colors.POWERUP_SHIELD;
            ctx.fillText('SHIELD', GameConfig.CANVAS_WIDTH - 20, 80);
        }

        ctx.textAlign = 'left';
    }

    renderPauseMenu(ctx) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // Pause text
        ctx.fillStyle = Colors.UI_TEXT;
        ctx.font = '48px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = Colors.UI_TEXT;
        ctx.fillText('PAUSED', GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2);
        ctx.shadowBlur = 0;

        // Instructions
        ctx.font = '16px "Press Start 2P"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Press P or ESC to Resume', GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2 + 60);

        ctx.textAlign = 'left';
    }

    renderGameOver(ctx, score, highScore) {
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // Game Over text
        ctx.fillStyle = '#FF0000';
        ctx.font = '56px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#FF0000';
        ctx.fillText('GAME OVER', GameConfig.CANVAS_WIDTH / 2, 200);
        ctx.shadowBlur = 0;

        // Score
        ctx.font = '20px "Press Start 2P"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`FINAL SCORE: ${score}`, GameConfig.CANVAS_WIDTH / 2, 280);

        if (score > highScore) {
            ctx.fillStyle = Colors.UI_TEXT;
            ctx.fillText('NEW HIGH SCORE!', GameConfig.CANVAS_WIDTH / 2, 320);
        } else {
            ctx.fillText(`HIGH SCORE: ${highScore}`, GameConfig.CANVAS_WIDTH / 2, 320);
        }

        // Restart prompt
        if (this.blinkState) {
            ctx.font = '16px "Press Start 2P"';
            ctx.fillStyle = Colors.UI_TEXT;
            ctx.fillText('PRESS ENTER TO RESTART', GameConfig.CANVAS_WIDTH / 2, 420);
        }

        ctx.textAlign = 'left';
    }

    renderVictory(ctx, score, highScore) {
        // Victory overlay
        ctx.fillStyle = 'rgba(0, 0, 50, 0.9)';
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // Victory text
        ctx.fillStyle = Colors.UI_TEXT;
        ctx.font = '56px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 30;
        ctx.shadowColor = Colors.UI_TEXT;
        ctx.fillText('VICTORY!', GameConfig.CANVAS_WIDTH / 2, 180);
        ctx.shadowBlur = 0;

        // Congratulations
        ctx.font = '16px "Press Start 2P"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Galaxy Saved!', GameConfig.CANVAS_WIDTH / 2, 240);

        // Score
        ctx.font = '20px "Press Start 2P"';
        ctx.fillText(`FINAL SCORE: ${score}`, GameConfig.CANVAS_WIDTH / 2, 300);

        if (score > highScore) {
            ctx.fillStyle = Colors.UI_TEXT;
            ctx.fillText('NEW HIGH SCORE!', GameConfig.CANVAS_WIDTH / 2, 340);
        } else {
            ctx.fillText(`HIGH SCORE: ${highScore}`, GameConfig.CANVAS_WIDTH / 2, 340);
        }

        // Restart prompt
        if (this.blinkState) {
            ctx.font = '16px "Press Start 2P"';
            ctx.fillStyle = Colors.UI_TEXT;
            ctx.fillText('PRESS ENTER TO PLAY AGAIN', GameConfig.CANVAS_WIDTH / 2, 460);
        }

        ctx.textAlign = 'left';
    }

    renderStageTransition(ctx, stageNumber) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // Stage text
        ctx.fillStyle = Colors.UI_TEXT;
        ctx.font = '48px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = Colors.UI_TEXT;
        ctx.fillText(`STAGE ${stageNumber}`, GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2);
        ctx.shadowBlur = 0;

        // Stage name
        const stageNames = ['ASTEROID BELT', 'NEBULA GAUNTLET', 'GALACTIC CORE'];
        ctx.font = '20px "Press Start 2P"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(stageNames[stageNumber - 1] || '', GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2 + 60);

        ctx.textAlign = 'left';
    }

    renderStageComplete(ctx, stageNumber, bonus) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // Stage Clear text
        ctx.fillStyle = Colors.UI_TEXT;
        ctx.font = '48px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = Colors.UI_TEXT;
        ctx.fillText('STAGE CLEAR!', GameConfig.CANVAS_WIDTH / 2, 220);
        ctx.shadowBlur = 0;

        // Bonus
        ctx.font = '20px "Press Start 2P"';
        ctx.fillStyle = '#FFFF00';
        ctx.fillText(`BONUS: ${bonus}`, GameConfig.CANVAS_WIDTH / 2, 300);

        ctx.textAlign = 'left';
    }

    renderBossWarning(ctx) {
        // Warning overlay with flashing effect
        const alpha = 0.3 + Math.sin(Date.now() / 100) * 0.3;
        ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // Warning text
        ctx.fillStyle = '#FF0000';
        ctx.font = '56px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#FF0000';
        ctx.fillText('WARNING!', GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2 - 40);

        ctx.font = '24px "Press Start 2P"';
        ctx.fillText('BOSS APPROACHING', GameConfig.CANVAS_WIDTH / 2, GameConfig.CANVAS_HEIGHT / 2 + 20);
        ctx.shadowBlur = 0;

        ctx.textAlign = 'left';
    }
}

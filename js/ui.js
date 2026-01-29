// UI manager class
class UI {
    constructor() {
        this.blinkTimer = 0;
        this.blinkState = true;
        this.selectedVolumeControl = 0; // 0 = music, 1 = sfx
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
        ctx.fillText('SHIFT - Fire Missile', GameConfig.CANVAS_WIDTH / 2, 380);
        ctx.fillText('P / ESC - Pause', GameConfig.CANVAS_WIDTH / 2, 410);

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

        // Weapon level with gun icons
        ctx.fillStyle = Colors.UI_TEXT;
        ctx.fillText('WEAPON:', GameConfig.CANVAS_WIDTH - 180, 55);

        // Draw gun icons based on weapon level
        for (let i = 0; i < 3; i++) {
            const iconX = GameConfig.CANVAS_WIDTH - 100 + (i * 25);
            const iconY = 48;

            if (i < game.player.weaponLevel) {
                // Active gun icon (filled)
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(iconX, iconY, 8, 12);
                ctx.fillRect(iconX + 2, iconY - 3, 4, 3);
            } else {
                // Inactive gun icon (outline)
                ctx.strokeStyle = '#00FF00';
                ctx.lineWidth = 1;
                ctx.strokeRect(iconX, iconY, 8, 12);
                ctx.strokeRect(iconX + 2, iconY - 3, 4, 3);
            }
        }

        // Missile count display
        ctx.font = '16px "Press Start 2P"';
        ctx.fillStyle = Colors.UI_TEXT;
        ctx.fillText('MISSILES:', GameConfig.CANVAS_WIDTH - 180, 80);

        // Draw missile icons
        for (let i = 0; i < game.player.maxMissiles; i++) {
            const iconX = GameConfig.CANVAS_WIDTH - 65 + (i % 3) * 18;
            const iconY = 68 + Math.floor(i / 3) * 16;

            if (i < game.player.missiles) {
                // Active missile icon (filled)
                ctx.fillStyle = '#FF6600';
                ctx.beginPath();
                ctx.moveTo(iconX + 4, iconY);
                ctx.lineTo(iconX + 8, iconY + 4);
                ctx.lineTo(iconX + 8, iconY + 10);
                ctx.lineTo(iconX, iconY + 10);
                ctx.lineTo(iconX, iconY + 4);
                ctx.closePath();
                ctx.fill();
            } else {
                // Inactive missile icon (outline)
                ctx.strokeStyle = '#FF6600';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(iconX + 4, iconY);
                ctx.lineTo(iconX + 8, iconY + 4);
                ctx.lineTo(iconX + 8, iconY + 10);
                ctx.lineTo(iconX, iconY + 10);
                ctx.lineTo(iconX, iconY + 4);
                ctx.closePath();
                ctx.stroke();
            }
        }

        // Shield indicator
        if (game.player.shieldActive) {
            ctx.fillStyle = Colors.POWERUP_SHIELD;
            ctx.fillText('SHIELD', GameConfig.CANVAS_WIDTH - 20, 120);
        }

        ctx.textAlign = 'left';
    }

    renderPauseMenu(ctx, audioManager) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // Pause text
        ctx.fillStyle = Colors.UI_TEXT;
        ctx.font = '48px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = Colors.UI_TEXT;
        ctx.fillText('PAUSED', GameConfig.CANVAS_WIDTH / 2, 150);
        ctx.shadowBlur = 0;

        // Volume Controls Section
        ctx.font = '20px "Press Start 2P"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('VOLUME', GameConfig.CANVAS_WIDTH / 2, 250);

        // Music Volume
        ctx.font = '14px "Press Start 2P"';
        ctx.textAlign = 'right';
        ctx.fillText('MUSIC', GameConfig.CANVAS_WIDTH / 2 - 30, 300);

        this.renderVolumeSlider(ctx, GameConfig.CANVAS_WIDTH / 2 - 20, 285,
                               audioManager ? audioManager.musicVolume : 0.3);

        // SFX Volume
        ctx.fillText('SFX', GameConfig.CANVAS_WIDTH / 2 - 30, 350);

        this.renderVolumeSlider(ctx, GameConfig.CANVAS_WIDTH / 2 - 20, 335,
                               audioManager ? audioManager.sfxVolume : 0.5);

        // Instructions
        ctx.font = '12px "Press Start 2P"';
        ctx.fillStyle = '#AAAAAA';
        ctx.textAlign = 'center';
        ctx.fillText('LEFT/RIGHT - Music Volume', GameConfig.CANVAS_WIDTH / 2, 420);
        ctx.fillText('UP/DOWN - SFX Volume', GameConfig.CANVAS_WIDTH / 2, 445);

        ctx.font = '16px "Press Start 2P"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Press P or ESC to Resume', GameConfig.CANVAS_WIDTH / 2, 500);

        ctx.textAlign = 'left';
    }

    renderVolumeSlider(ctx, x, y, volume) {
        const sliderWidth = 200;
        const sliderHeight = 20;

        // Slider background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x - 2, y - 2, sliderWidth + 4, sliderHeight + 4);

        // Slider border
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, sliderWidth, sliderHeight);

        // Volume fill
        const fillWidth = sliderWidth * volume;
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(x, y, fillWidth, sliderHeight);

        // Volume percentage
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(volume * 100)}%`, x + sliderWidth / 2, y + 15);
    }

    renderNameEntry(ctx, score, playerName) {
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // Congratulations text
        ctx.fillStyle = Colors.UI_TEXT;
        ctx.font = '36px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = Colors.UI_TEXT;
        ctx.fillText('TOP 10 SCORE!', GameConfig.CANVAS_WIDTH / 2, 150);
        ctx.shadowBlur = 0;

        // Score
        ctx.font = '20px "Press Start 2P"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`SCORE: ${score}`, GameConfig.CANVAS_WIDTH / 2, 220);

        // Instructions
        ctx.font = '14px "Press Start 2P"';
        ctx.fillText('ENTER YOUR NAME:', GameConfig.CANVAS_WIDTH / 2, 280);

        // Name input box
        const boxWidth = 400;
        const boxHeight = 50;
        const boxX = GameConfig.CANVAS_WIDTH / 2 - boxWidth / 2;
        const boxY = 300;

        // Box background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(boxX - 2, boxY - 2, boxWidth + 4, boxHeight + 4);

        // Box border
        ctx.strokeStyle = Colors.UI_TEXT;
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Player name text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '24px "Press Start 2P"';
        const displayName = playerName || '_';
        ctx.fillText(displayName, GameConfig.CANVAS_WIDTH / 2, boxY + 35);

        // Character limit
        ctx.font = '10px "Press Start 2P"';
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText(`${playerName.length}/15`, GameConfig.CANVAS_WIDTH / 2, boxY + boxHeight + 20);

        // Submit prompt
        if (this.blinkState) {
            ctx.font = '16px "Press Start 2P"';
            ctx.fillStyle = Colors.UI_TEXT;
            ctx.fillText('PRESS ENTER TO SUBMIT', GameConfig.CANVAS_WIDTH / 2, 450);
        }

        ctx.textAlign = 'left';
    }

    renderGameOver(ctx, score, highScore, leaderboard) {
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // Game Over text
        ctx.fillStyle = '#FF0000';
        ctx.font = '56px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#FF0000';
        ctx.fillText('GAME OVER', GameConfig.CANVAS_WIDTH / 2, 120);
        ctx.shadowBlur = 0;

        // Score
        ctx.font = '20px "Press Start 2P"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`FINAL SCORE: ${score}`, GameConfig.CANVAS_WIDTH / 2, 180);

        // Leaderboard
        this.renderLeaderboard(ctx, leaderboard, 220);

        // Restart prompt
        if (this.blinkState) {
            ctx.font = '16px "Press Start 2P"';
            ctx.fillStyle = Colors.UI_TEXT;
            ctx.fillText('PRESS ENTER TO RESTART', GameConfig.CANVAS_WIDTH / 2, 540);
        }

        ctx.textAlign = 'left';
    }

    renderVictory(ctx, score, highScore, leaderboard) {
        // Victory overlay
        ctx.fillStyle = 'rgba(0, 0, 50, 0.9)';
        ctx.fillRect(0, 0, GameConfig.CANVAS_WIDTH, GameConfig.CANVAS_HEIGHT);

        // Victory text
        ctx.fillStyle = Colors.UI_TEXT;
        ctx.font = '56px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 30;
        ctx.shadowColor = Colors.UI_TEXT;
        ctx.fillText('VICTORY!', GameConfig.CANVAS_WIDTH / 2, 100);
        ctx.shadowBlur = 0;

        // Congratulations
        ctx.font = '16px "Press Start 2P"';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('Galaxy Saved!', GameConfig.CANVAS_WIDTH / 2, 140);

        // Score
        ctx.font = '20px "Press Start 2P"';
        ctx.fillText(`FINAL SCORE: ${score}`, GameConfig.CANVAS_WIDTH / 2, 180);

        // Leaderboard
        this.renderLeaderboard(ctx, leaderboard, 220);

        // Restart prompt
        if (this.blinkState) {
            ctx.font = '16px "Press Start 2P"';
            ctx.fillStyle = Colors.UI_TEXT;
            ctx.fillText('PRESS ENTER TO PLAY AGAIN', GameConfig.CANVAS_WIDTH / 2, 540);
        }

        ctx.textAlign = 'left';
    }

    renderLeaderboard(ctx, leaderboard, startY) {
        // Leaderboard title
        ctx.font = '18px "Press Start 2P"';
        ctx.fillStyle = Colors.UI_TEXT;
        ctx.textAlign = 'center';
        ctx.fillText('TOP SCORES', GameConfig.CANVAS_WIDTH / 2, startY);

        // Leaderboard entries
        ctx.font = '12px "Press Start 2P"';
        const lineHeight = 25;

        for (let i = 0; i < Math.min(10, leaderboard.length); i++) {
            const entry = leaderboard[i];
            const y = startY + 35 + (i * lineHeight);

            // Rank
            ctx.fillStyle = i < 3 ? '#FFD700' : '#FFFFFF'; // Gold for top 3
            ctx.textAlign = 'left';
            ctx.fillText(`${i + 1}.`, GameConfig.CANVAS_WIDTH / 2 - 180, y);

            // Name
            ctx.textAlign = 'left';
            ctx.fillText(entry.name, GameConfig.CANVAS_WIDTH / 2 - 150, y);

            // Score
            ctx.textAlign = 'right';
            ctx.fillText(entry.score.toString(), GameConfig.CANVAS_WIDTH / 2 + 180, y);
        }

        // Show placeholder if empty
        if (leaderboard.length === 0) {
            ctx.fillStyle = '#888888';
            ctx.textAlign = 'center';
            ctx.fillText('No scores yet!', GameConfig.CANVAS_WIDTH / 2, startY + 50);
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

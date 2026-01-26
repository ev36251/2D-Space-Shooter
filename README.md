# Cosmic Defender - Retro Space Shooter

A classic retro-style 2D space shooter game built with HTML5 Canvas and vanilla JavaScript.

## Game Features

- **Three Epic Stages**: Battle through Asteroid Belt, Nebula Gauntlet, and Galactic Core
- **Progressive Difficulty**: Each stage introduces new enemy types and attack patterns
- **Boss Battles**: Face massive bosses at the end of each stage with unique attack patterns
- **Power-Up System**: Collect weapon upgrades, shields, extra lives, and score multipliers
- **Retro Aesthetic**: Classic pixel art style with authentic arcade feel
- **High Score Tracking**: Beat your personal best with local storage

## Controls

- **Arrow Keys / WASD**: Move your ship
- **Spacebar**: Shoot
- **P / ESC**: Pause game
- **Enter**: Start game / Restart after game over

## How to Play

1. Open `index.html` in your web browser
2. Press Enter to start
3. Destroy enemies and avoid their bullets
4. Collect power-ups to upgrade your weapons
5. Defeat the boss at the end of each stage
6. Complete all 3 stages to save the galaxy!

## Scoring

- Small Enemy: 100 points
- Medium Enemy: 250 points
- Large Enemy: 500 points
- Boss: 2,000 points
- Power-up Collection: 50 points
- Stage Completion Bonus: 1,000 points
- Build combos to increase your multiplier!

## Stage Overview

### Stage 1: Asteroid Belt Assault
- Environment: Dark space with asteroid field
- Enemies: Basic drones and asteroids
- Boss: Mothership with rotating turrets
- Target Score: 5,000 points

### Stage 2: Nebula Gauntlet
- Environment: Colorful nebula with energy storms
- Enemies: Advanced fighters, kamikaze ships, turrets
- Boss: Massive battlecruiser
- Target Score: 12,000 points

### Stage 3: Galactic Core Invasion
- Environment: Swirling galaxy near black hole
- Enemies: Elite interceptors, heavy bombers, shielded carriers
- Boss: Command ship with multi-phase battle
- Target Score: 25,000 points

## Development

### Local Testing

Simply open `index.html` in a modern web browser (Chrome, Firefox, Safari).

For local development with live reload:
```bash
# If you have Python installed:
python3 -m http.server 8000

# Then visit: http://localhost:8000
```

Or use VS Code's Live Server extension.

### File Structure

```
├── index.html              # Main entry point
├── styles.css              # Game styling
├── js/                     # All game logic
│   ├── main.js            # Asset loading & initialization
│   ├── game.js            # Core game loop
│   ├── player.js          # Player ship
│   ├── enemy.js           # Enemy types
│   ├── boss.js            # Boss enemies
│   ├── projectile.js      # Bullets/lasers
│   ├── powerup.js         # Power-up items
│   ├── particle.js        # Visual effects
│   ├── collision.js       # Collision detection
│   ├── input.js           # Keyboard input
│   ├── stage.js           # Stage management
│   ├── ui.js              # Menus and HUD
│   ├── audio.js           # Sound manager
│   └── utils.js           # Helper functions
└── assets/                # Game assets
    ├── images/            # Sprites and backgrounds
    └── audio/             # Music and SFX
```

## Deployment

### GitHub Pages
1. Repository: https://github.com/ev36251/2D-Space-Shooter
2. Enable GitHub Pages in repository settings
3. Game URL: https://ev36251.github.io/2D-Space-Shooter/

### Vercel
Deploy automatically via Vercel for better performance and CDN.

## Asset Credits

Graphics from:
- Space Shooter Redux by Kenney - CC0 License
- Seamless Space Backgrounds by OpenGameArt.org

Music from:
- OpenGameArt.org - CC0 License

## Tech Stack

- HTML5 Canvas API
- Vanilla JavaScript (ES6+)
- CSS3
- No frameworks or dependencies

## Browser Compatibility

- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Target: 60 FPS
- Optimized with object pooling and efficient collision detection
- Tested with 50+ simultaneous objects on screen

## License

This game code is provided as-is for educational purposes.
Assets are credited to their respective creators.

---

**Made with HTML5 Canvas & JavaScript**

Enjoy playing Cosmic Defender!

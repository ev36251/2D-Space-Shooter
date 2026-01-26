# 🚀 Cosmic Defender

A retro-style 2D space shooter game built with HTML5 Canvas and JavaScript.

## 🎮 Play Now

**[Play Cosmic Defender](https://ev36251.github.io/2D-Space-Shooter/)**

## 🕹️ How to Play

- **Arrow Keys / WASD** - Move your ship
- **SPACEBAR** - Shoot
- **P / ESC** - Pause game
- **LEFT/RIGHT** (in pause) - Adjust music volume
- **UP/DOWN** (in pause) - Adjust SFX volume

## ✨ Features

- **3 Unique Stages** with increasing difficulty
- **Epic Boss Battles** at the end of each stage
- **Power-ups System**:
  - 🔫 Weapon Upgrades (up to triple shot)
  - 🛡️ Shield (absorbs 3 hits)
  - ❤️ Health Restore (+25 HP)
  - ⭐ Score Multiplier (2x for 10 seconds)
- **Global Leaderboard** - Compete with players worldwide! (Firebase-powered with localStorage fallback)
- **Volume Controls** - Adjust music and sound effects
- **Retro Pixel Art** aesthetic with smooth animations

## 🎯 Game Stages

1. **Asteroid Belt** - Navigate through space debris and basic enemies
2. **Nebula Gauntlet** - Face advanced fighters and coordinated attacks
3. **Galactic Core** - Survive intense bullet patterns and the final boss

## 🏆 Leaderboard

The game features a **global leaderboard**. When you achieve a top 10 score, you can enter your name and compete with players worldwide. The leaderboard automatically syncs across all players and falls back to local storage if Firebase is unavailable.

## 🛠️ Technologies Used

- HTML5 Canvas API
- Vanilla JavaScript (ES6)
- CSS3
- Firebase Firestore (global leaderboard)
- LocalStorage (fallback & backup)

## 📦 Running Locally

1. Clone this repository
2. Open `index.html` in your web browser
3. That's it! No build process required.

## 🔥 Firebase Setup (Optional)

The game works perfectly with the local leaderboard, but you can enable the global Firebase leaderboard:

1. Follow the instructions in [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
2. Configure your own Firebase project (free tier)
3. Update `js/firebase-config.js` with your credentials
4. Global leaderboard will automatically activate!

## 🎨 Credits

- Game sprites: [OpenGameArt.org - Space Shooter Redux](https://opengameart.org/content/space-shooter-redux)
- Font: Press Start 2P (Google Fonts)

## 📝 License

This project is open source and available for educational purposes.

---

// Audio manager class
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.currentMusic = null;
        this.muted = false;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.initialized = false;
    }

    loadSound(name, path, isMusic = false) {
        const audio = new Audio(path);
        audio.volume = isMusic ? this.musicVolume : this.sfxVolume;

        if (isMusic) {
            audio.loop = true;
        }

        this.sounds[name] = {
            audio: audio,
            isMusic: isMusic
        };
    }

    playSound(name) {
        if (this.muted || !this.sounds[name]) return;

        const sound = this.sounds[name];
        if (sound.isMusic) return; // Don't play music with playSound

        // Clone the audio element to allow multiple instances
        const audioClone = sound.audio.cloneNode();
        audioClone.volume = this.sfxVolume;

        audioClone.play().catch(err => {
            // Handle autoplay restrictions
            console.log('Audio play failed:', err);
        });
    }

    playMusic(name) {
        if (this.muted || !this.sounds[name]) return;

        const sound = this.sounds[name];
        if (!sound.isMusic) return; // Only play music tracks

        // Stop current music if playing
        if (this.currentMusic && this.currentMusic !== name) {
            this.stopMusic();
        }

        if (this.currentMusic === name && !sound.audio.paused) {
            return; // Already playing this track
        }

        this.currentMusic = name;
        sound.audio.currentTime = 0;
        sound.audio.volume = this.musicVolume;

        sound.audio.play().catch(err => {
            console.log('Music play failed:', err);
        });
    }

    stopMusic() {
        if (this.currentMusic && this.sounds[this.currentMusic]) {
            this.sounds[this.currentMusic].audio.pause();
            this.sounds[this.currentMusic].audio.currentTime = 0;
        }
        this.currentMusic = null;
    }

    pauseMusic() {
        if (this.currentMusic && this.sounds[this.currentMusic]) {
            this.sounds[this.currentMusic].audio.pause();
        }
    }

    resumeMusic() {
        if (this.currentMusic && this.sounds[this.currentMusic]) {
            this.sounds[this.currentMusic].audio.play().catch(err => {
                console.log('Music resume failed:', err);
            });
        }
    }

    toggleMute() {
        this.muted = !this.muted;

        if (this.muted) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }

        return this.muted;
    }

    setMusicVolume(volume) {
        this.musicVolume = MathUtils.clamp(volume, 0, 1);

        Object.values(this.sounds).forEach(sound => {
            if (sound.isMusic) {
                sound.audio.volume = this.musicVolume;
            }
        });
    }

    setSfxVolume(volume) {
        this.sfxVolume = MathUtils.clamp(volume, 0, 1);
    }

    // Initialize audio context (call after user interaction)
    initialize() {
        if (this.initialized) return;

        // Attempt to play and pause a sound to unlock audio
        Object.values(this.sounds).forEach(sound => {
            sound.audio.play().then(() => {
                sound.audio.pause();
                sound.audio.currentTime = 0;
            }).catch(() => {});
        });

        this.initialized = true;
    }

    loadAllAudio() {
        // Music tracks
        this.loadSound('menuTheme', 'assets/audio/music/menu-theme.mp3', true);
        this.loadSound('stage1Theme', 'assets/audio/music/stage-1-theme.mp3', true);
        this.loadSound('stage2Theme', 'assets/audio/music/stage-2-theme.mp3', true);
        this.loadSound('stage3Theme', 'assets/audio/music/stage-3-theme.ogg', true);
        this.loadSound('bossTheme', 'assets/audio/music/boss-theme.wav', true);

        // Sound effects
        this.loadSound('playerShoot', 'assets/audio/sfx/player-shoot.wav', false);
        this.loadSound('playerHit', 'assets/audio/sfx/player-hit.wav', false);
        this.loadSound('playerDeath', 'assets/audio/sfx/player-death.wav', false);
        this.loadSound('enemyExplode', 'assets/audio/sfx/enemy-explode.wav', false);
        this.loadSound('powerupCollect', 'assets/audio/sfx/powerup-collect.wav', false);
        this.loadSound('bossHit', 'assets/audio/sfx/boss-hit.wav', false);
        this.loadSound('stageComplete', 'assets/audio/sfx/stage-complete.wav', false);
    }
}

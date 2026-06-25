/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Retro audio synthesizer using Web Audio API for "CORRE, PROF!"
 */

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext is lazily initialized on first user gesture
  }

  private initContext() {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch((err) => {
          // Ignore autoplay restriction errors quietly
        });
      }
    } catch (e) {
      // Quietly handle situations where AudioContext is blocked or unsupported initially
    }
  }

  toggleSound(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) {
      this.initContext();
    }
  }

  isEnabled() {
    return this.enabled;
  }

  playShoot() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playHit() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.setValueAtTime(80, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playPlayerDamage() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    // A sad noise
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playLevelUp() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    
    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.08);

      gain.gain.setValueAtTime(0.12, now + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.15);
    });
  }

  playCoin() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  playBossSpawn() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [110, 98, 87, 73]; // Descending ominous tones

    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + index * 0.15);

      gain.gain.setValueAtTime(0.18, now + index * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + index * 0.15);
      osc.stop(now + index * 0.15 + 0.3);
    });
  }

  playVictory() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // Major chord C4-G5
    
    chord.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.05);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.3 + index * 0.05);

      gain.gain.setValueAtTime(0.08, now + index * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + index * 0.05);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + index * 0.05);
      osc.stop(now + 0.5 + index * 0.05);
    });
  }

  playGameOver() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [220, 207.65, 196.00, 174.61, 146.83]; // Descending minor/sad notes

    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + index * 0.18);

      gain.gain.setValueAtTime(0.15, now + index * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.18 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + index * 0.18);
      osc.stop(now + index * 0.18 + 0.3);
    });
  }
}

export const audio = new SoundEffectsManager();

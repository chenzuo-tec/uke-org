import { STRING_FREQUENCIES } from '../constants';

class AudioService {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      this.gainNode.gain.value = 0.3; // Master volume
    }
  }

  // Calculate frequency for a specific string and fret
  private getFrequency(stringIndex: number, fret: number): number {
    const baseFreq = STRING_FREQUENCIES[stringIndex];
    // Formula: f = f0 * (2 ^ (n/12))
    return baseFreq * Math.pow(2, fret / 12);
  }

  public async playColumn(notes: (number | null)[], duration: number = 0.3) {
    this.init();
    if (!this.ctx || !this.gainNode) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    notes.forEach((fret, stringIndex) => {
      if (fret !== null && fret >= 0) {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'triangle'; // Triangle wave sounds a bit closer to a plucked string than sine
        osc.frequency.value = this.getFrequency(stringIndex, fret);
        
        // Envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.02); // Attack
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Decay

        osc.connect(gain);
        gain.connect(this.gainNode!);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      }
    });
  }
}

export const audioService = new AudioService();
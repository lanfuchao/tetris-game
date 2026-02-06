export class AudioManager {
    private audioContext: AudioContext;

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    private playSound(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playMoveSound(): void {
        this.playSound(200, 0.05);
    }

    playRotateSound(): void {
        this.playSound(300, 0.08);
    }

    playDropSound(): void {
        this.playSound(150, 0.1);
    }

    playLandSound(): void {
        this.playSound(100, 0.15, 'square');
    }

    playClearSound(): void {
        this.playSound(440, 0.2);
        setTimeout(() => this.playSound(554, 0.2), 100);
        setTimeout(() => this.playSound(659, 0.3), 200);
    }

    playGameOverSound(): void {
        this.playSound(440, 0.2);
        setTimeout(() => this.playSound(392, 0.2), 150);
        setTimeout(() => this.playSound(349, 0.2), 300);
        setTimeout(() => this.playSound(293, 0.5), 450);
    }
}

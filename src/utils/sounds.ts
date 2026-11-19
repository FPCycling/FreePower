let audioContext: AudioContext;

export function playSound() {
    const context = getAudioContext();
    const o = context.createOscillator();
    const g = context.createGain();
    o.type = 'sine';
    o.connect(g);
    o.frequency.value = 400;
    g.connect(context.destination);
    o.start(0);
    g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 1.5);
}

// Rising C major arpeggio that lands on a held chord.
export function playFinishSound() {
    const context = getAudioContext();
    const start = context.currentTime;
    const arpeggio = [523.25, 659.25, 783.99];
    arpeggio.forEach((frequency, i) => playNote(context, frequency, start + i * 0.15, 0.3));
    const chordStart = start + arpeggio.length * 0.15;
    [523.25, 659.25, 783.99, 1046.5].forEach((frequency) => playNote(context, frequency, chordStart, 1.8, 0.12));
}

function playNote(context: AudioContext, frequency: number, at: number, duration: number, volume = 0.25) {
    const o = context.createOscillator();
    const g = context.createGain();
    o.type = 'triangle';
    o.frequency.value = frequency;
    o.connect(g);
    g.connect(context.destination);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(volume, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    o.start(at);
    o.stop(at + duration);
}

export function activateAudioContext() {
    getAudioContext().resume();
}

function getAudioContext() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }

    return audioContext;
}

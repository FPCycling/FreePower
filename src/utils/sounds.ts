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

export function activateAudioContext() {
    getAudioContext().resume();
}

function getAudioContext() {
    if (!audioContext) {
        audioContext = new AudioContext();
    }

    return audioContext;
}

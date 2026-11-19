import type { WorkoutCue } from './workoutCues';

let audioContext: AudioContext;

const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const B5 = 987.77;
const C6 = 1046.5;

export function playWorkoutCue(cue: WorkoutCue) {
    const context = getAudioContext();
    const start = context.currentTime;

    switch (cue) {
        case 'countdown':
            playNote(context, E5, start, 0.12, { type: 'square', attack: 0.005 });
            break;
        case 'powerUp':
            playNote(context, E5, start, 0.18);
            playNote(context, B5, start + 0.14, 0.3);
            break;
        case 'powerDown':
            playNote(context, B5, start, 0.18);
            playNote(context, E5, start + 0.14, 0.3);
            break;
        case 'finish':
            playFinish(context, start);
            break;
    }
}

// Rising C major arpeggio that lands on a held chord.
function playFinish(context: AudioContext, start: number) {
    const arpeggio = [C5, E5, G5];
    arpeggio.forEach((frequency, i) => playNote(context, frequency, start + i * 0.15, 0.3, { attack: 0.02 }));
    const chordStart = start + arpeggio.length * 0.15;
    [C5, E5, G5, C6].forEach((frequency) =>
        playNote(context, frequency, chordStart, 1.8, { volume: 0.12, attack: 0.02 }),
    );
}

interface NoteOptions {
    type?: OscillatorType;
    volume?: number;
    attack?: number;
}

function playNote(
    context: AudioContext,
    frequency: number,
    at: number,
    duration: number,
    { type = 'triangle', volume = 0.25, attack = 0.01 }: NoteOptions = {},
) {
    const o = context.createOscillator();
    const g = context.createGain();
    o.type = type;
    o.frequency.value = frequency;
    o.connect(g);
    g.connect(context.destination);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(volume, at + attack);
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

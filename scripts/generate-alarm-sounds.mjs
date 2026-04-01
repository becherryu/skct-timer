import fs from 'node:fs/promises';
import path from 'node:path';

const sampleRate = 44100;
const outputDir = path.resolve('public/sounds');

function clampSample(value) {
    return Math.max(-1, Math.min(1, value));
}

function applyEnvelope(progress, attack = 0.02, release = 0.18) {
    if (progress < attack) return progress / attack;
    if (progress > 1 - release) return Math.max(0, (1 - progress) / release);
    return 1;
}

function render(durationSec, buildSample) {
    const totalSamples = Math.floor(durationSec * sampleRate);
    const samples = new Float32Array(totalSamples);
    for (let i = 0; i < totalSamples; i += 1) {
        const time = i / sampleRate;
        samples[i] = clampSample(buildSample(time, i, totalSamples));
    }
    return samples;
}

function tone({ time, start, duration, freq, type = 'sine', gain = 0.5, glide = 0 }) {
    const local = time - start;
    if (local < 0 || local > duration) return 0;
    const progress = local / duration;
    const env = applyEnvelope(progress, 0.03, 0.22);
    const currentFreq = freq * (1 + glide * progress);
    const phase = 2 * Math.PI * currentFreq * local;

    if (type === 'square') return Math.sign(Math.sin(phase)) * gain * env;
    if (type === 'triangle') return (2 / Math.PI) * Math.asin(Math.sin(phase)) * gain * env;
    if (type === 'saw') return (2 * ((local * currentFreq) % 1) - 1) * gain * env;
    return Math.sin(phase) * gain * env;
}

function mix(parts) {
    const duration = Math.max(...parts.map((part) => part.start + part.duration)) + 0.08;
    return render(duration, (time) => parts.reduce((sum, part) => sum + tone({ time, ...part }), 0) * 0.7);
}

function encodeWav(samples) {
    const byteRate = sampleRate * 2;
    const blockAlign = 2;
    const buffer = Buffer.alloc(44 + samples.length * 2);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + samples.length * 2, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(samples.length * 2, 40);

    for (let i = 0; i < samples.length; i += 1) {
        buffer.writeInt16LE(Math.round(clampSample(samples[i]) * 32767), 44 + i * 2);
    }

    return buffer;
}

const presets = {
    'classic-bell.wav': mix([
        { start: 0, duration: 0.24, freq: 880, type: 'sine', gain: 0.7 },
        { start: 0.2, duration: 0.28, freq: 1175, type: 'triangle', gain: 0.6 },
        { start: 0.42, duration: 0.44, freq: 1568, type: 'sine', gain: 0.55 },
    ]),
    'digital-beep.wav': mix([
        { start: 0, duration: 0.09, freq: 1320, type: 'square', gain: 0.7 },
        { start: 0.12, duration: 0.09, freq: 1660, type: 'square', gain: 0.7 },
        { start: 0.24, duration: 0.16, freq: 2093, type: 'square', gain: 0.7 },
    ]),
    'double-bell.wav': mix([
        { start: 0, duration: 0.2, freq: 988, type: 'triangle', gain: 0.65 },
        { start: 0.18, duration: 0.24, freq: 1318, type: 'sine', gain: 0.55 },
        { start: 0.48, duration: 0.22, freq: 988, type: 'triangle', gain: 0.65 },
        { start: 0.66, duration: 0.28, freq: 1318, type: 'sine', gain: 0.55 },
    ]),
    'arcade-alert.wav': mix([
        { start: 0, duration: 0.1, freq: 1046, type: 'square', gain: 0.7 },
        { start: 0.12, duration: 0.1, freq: 1318, type: 'square', gain: 0.7 },
        { start: 0.24, duration: 0.12, freq: 1568, type: 'square', gain: 0.65 },
        { start: 0.38, duration: 0.24, freq: 2093, type: 'triangle', gain: 0.55 },
    ]),
    'siren-alert.wav': mix([
        { start: 0, duration: 0.22, freq: 740, type: 'square', gain: 0.6, glide: 0.65 },
        { start: 0.18, duration: 0.22, freq: 740, type: 'saw', gain: 0.4, glide: 0.65 },
        { start: 0.42, duration: 0.22, freq: 920, type: 'square', gain: 0.58, glide: 0.9 },
        { start: 0.64, duration: 0.28, freq: 920, type: 'saw', gain: 0.38, glide: 0.9 },
    ]),
    'clean-chime.wav': mix([
        { start: 0, duration: 0.22, freq: 784, type: 'sine', gain: 0.7 },
        { start: 0.18, duration: 0.28, freq: 1046, type: 'triangle', gain: 0.55 },
        { start: 0.42, duration: 0.42, freq: 1318, type: 'sine', gain: 0.48 },
    ]),
};

await fs.mkdir(outputDir, { recursive: true });

await Promise.all(
    Object.entries(presets).map(([fileName, samples]) =>
        fs.writeFile(path.join(outputDir, fileName), encodeWav(samples)),
    ),
);

console.log(`Generated ${Object.keys(presets).length} sound files in ${outputDir}`);

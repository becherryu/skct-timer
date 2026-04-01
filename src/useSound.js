import { Howl } from 'howler';
import { DEFAULT_SOUND_PRESET, SOUND_OPTIONS } from './soundPresets.js';

const soundMap = new Map(SOUND_OPTIONS.map((option) => [option.id, option]));
const ALARM_DURATION_MS = 2000;
const FADE_OUT_MS = 180;

export { DEFAULT_SOUND_PRESET, SOUND_OPTIONS };

export function useSound() {
    const instances = new Map();
    const stopTimers = new Map();
    let soundPreset = DEFAULT_SOUND_PRESET;
    let muted = false;

    function resolvePreset(presetId) {
        return soundMap.get(presetId) ?? soundMap.get(DEFAULT_SOUND_PRESET);
    }

    function getInstance(presetId) {
        const preset = resolvePreset(presetId);
        if (!instances.has(preset.id)) {
            instances.set(
                preset.id,
                new Howl({
                    src: [preset.src],
                    preload: true,
                    volume: 1,
                }),
            );
        }

        return instances.get(preset.id);
    }

    function playWithPreset(presetId, kind = 'bell') {
        if (muted) return;
        const preset = resolvePreset(presetId);
        const sound = getInstance(preset.id);
        const existingTimer = stopTimers.get(preset.id);
        if (existingTimer) clearTimeout(existingTimer);

        sound.stop();
        const playbackId = sound.play();
        sound.seek(0, playbackId);
        sound.volume(1, playbackId);
        sound.rate(kind === 'break' ? 1.04 : 1, playbackId);

        const fadeDelay = Math.max(ALARM_DURATION_MS - FADE_OUT_MS, 0);
        const timerId = window.setTimeout(() => {
            sound.fade(1, 0, FADE_OUT_MS, playbackId);
            window.setTimeout(() => {
                sound.stop(playbackId);
                stopTimers.delete(preset.id);
            }, FADE_OUT_MS);
        }, fadeDelay);

        stopTimers.set(preset.id, timerId);
    }

    function setSoundPreset(nextPreset) {
        soundPreset = soundMap.has(nextPreset) ? nextPreset : DEFAULT_SOUND_PRESET;
    }

    function stopAll() {
        stopTimers.forEach((timerId) => clearTimeout(timerId));
        stopTimers.clear();
        instances.forEach((sound) => sound.stop());
    }

    function setMuted(nextMuted) {
        muted = Boolean(nextMuted);
        if (muted) stopAll();
    }

    function playBell() {
        playWithPreset(soundPreset, 'bell');
    }

    function playBreakEnd() {
        playWithPreset(soundPreset, 'break');
    }

    function previewSound(nextPreset = soundPreset) {
        playWithPreset(nextPreset, 'bell');
    }

    return { playBell, playBreakEnd, previewSound, setMuted, setSoundPreset };
}

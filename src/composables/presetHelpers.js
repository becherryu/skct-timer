import { DEFAULT_SOUND_PRESET, SOUND_OPTIONS } from '../soundPresets.js';

const STORAGE_KEY = 'skct-timer-state-v1';
const LEGACY_SKCT_DEFAULT = {
    min: 15,
    sec: 10,
    breakMin: 1,
    breakSec: 0,
    repeatCount: 1,
};

export function clampNumber(value, min, max, fallback) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

export function createDefaultPhases() {
    return [
        { type: 'study', name: '', min: 25, sec: 0 },
        { type: 'break', name: '', min: 5, sec: 0 },
    ];
}

export function createDefaultSkctConfig() {
    return {
        min: 15,
        sec: 0,
        breakMin: 1,
        breakSec: 0,
        repeatCount: 1,
    };
}

export function createCustomTab(index = 1) {
    return {
        id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        name: `사용자 지정 ${index}`,
        repeatCount: 1,
        phases: createDefaultPhases(),
    };
}

export function normalizePhases(phases) {
    const nextPhases = Array.isArray(phases) ? phases : [];
    const normalized = nextPhases
        .map((phase, index) => ({
            type: phase?.type === 'break' ? 'break' : 'study',
            name:
                typeof phase?.name === 'string' && phase.name.trim()
                    ? phase.name.trim()
                    : phase?.type === 'break'
                      ? `인터벌 ${index + 1}`
                      : `세션 ${index + 1}`,
            min: clampNumber(phase?.min, 0, 180, phase?.type === 'break' ? 5 : 25),
            sec: clampNumber(phase?.sec, 0, 59, 0),
        }))
        .filter((phase) => phase.min * 60 + phase.sec > 0);

    if (!normalized.some((phase) => phase.type === 'study')) {
        return createDefaultPhases();
    }

    return normalized.length ? normalized : createDefaultPhases();
}

export function normalizeSkctConfig(config) {
    return {
        min: clampNumber(config?.min, 0, 60, 15),
        sec: clampNumber(config?.sec, 0, 59, 0),
        breakMin: clampNumber(config?.breakMin, 0, 60, 1),
        breakSec: clampNumber(config?.breakSec, 0, 59, 0),
        repeatCount: clampNumber(config?.repeatCount, 1, 10, 1),
    };
}

function isLegacyDefaultSkctConfig(config) {
    return (
        config?.min === LEGACY_SKCT_DEFAULT.min &&
        config?.sec === LEGACY_SKCT_DEFAULT.sec &&
        config?.breakMin === LEGACY_SKCT_DEFAULT.breakMin &&
        config?.breakSec === LEGACY_SKCT_DEFAULT.breakSec &&
        config?.repeatCount === LEGACY_SKCT_DEFAULT.repeatCount
    );
}

export function normalizeCustomTab(tab, index) {
    return {
        id: typeof tab?.id === 'string' && tab.id ? tab.id : createCustomTab(index + 1).id,
        name: typeof tab?.name === 'string' && tab.name.trim() ? tab.name.trim() : `사용자 지정 ${index + 1}`,
        repeatCount: clampNumber(tab?.repeatCount, 1, 10, 1),
        phases: normalizePhases(tab?.phases),
    };
}

export function resolveActiveTabId(tabId, tabs) {
    if (tabId === 'skct') return 'skct';
    return tabs.some((tab) => tab.id === tabId) ? tabId : 'skct';
}

export function createEditorState(activeId, skctConfig, tabs) {
    if (activeId === 'skct') {
        return {
            type: 'skct',
            ...normalizeSkctConfig(skctConfig),
        };
    }

    const activeCustomTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
    if (!activeCustomTab) {
        return {
            type: 'skct',
            ...normalizeSkctConfig(skctConfig),
        };
    }

    return {
        type: 'custom',
        id: activeCustomTab.id,
        name: activeCustomTab.name,
        repeatCount: activeCustomTab.repeatCount,
        phases: activeCustomTab.phases.map((phase) => ({ ...phase })),
    };
}

export function loadPersistedState() {
    if (typeof window === 'undefined') {
        return {
            skctConfig: createDefaultSkctConfig(),
            customTabs: [],
            activeTabId: 'skct',
            soundPreset: DEFAULT_SOUND_PRESET,
        };
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return {
                skctConfig: createDefaultSkctConfig(),
                customTabs: [],
                activeTabId: 'skct',
                soundPreset: DEFAULT_SOUND_PRESET,
            };
        }

        const parsed = JSON.parse(stored);
        const customTabs = Array.isArray(parsed?.customTabs)
            ? parsed.customTabs.map((tab, index) => normalizeCustomTab(tab, index))
            : [];

        const normalizedSkctConfig = normalizeSkctConfig(parsed?.skctConfig);

        return {
            skctConfig: isLegacyDefaultSkctConfig(normalizedSkctConfig)
                ? createDefaultSkctConfig()
                : normalizedSkctConfig,
            customTabs,
            activeTabId: resolveActiveTabId(parsed?.activeTabId, customTabs),
            soundPreset: SOUND_OPTIONS.some((option) => option.id === parsed?.soundPreset)
                ? parsed.soundPreset
                : DEFAULT_SOUND_PRESET,
        };
    } catch {
        return {
            skctConfig: createDefaultSkctConfig(),
            customTabs: [],
            activeTabId: 'skct',
            soundPreset: DEFAULT_SOUND_PRESET,
        };
    }
}

export function persistPresetState({ activeTabId, customTabs, skctConfig, soundPreset }) {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            activeTabId,
            customTabs,
            skctConfig,
            soundPreset,
        }),
    );
}

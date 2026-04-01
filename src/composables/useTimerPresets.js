import { computed, ref } from 'vue';
import { DEFAULT_SOUND_PRESET, SOUND_OPTIONS } from '../soundPresets.js';
import {
    createCustomTab,
    createEditorState,
    loadPersistedState,
    normalizeCustomTab,
    normalizeSkctConfig,
    persistPresetState,
    resolveActiveTabId,
} from './presetHelpers.js';

export function useTimerPresets() {
    const initialState = loadPersistedState();

    const skctConfig = ref(initialState.skctConfig);
    const customTabs = ref(initialState.customTabs);
    const activeTabId = ref(resolveActiveTabId(initialState.activeTabId, customTabs.value));
    const soundPreset = ref(initialState.soundPreset);
    const editor = ref(createEditorState(activeTabId.value, skctConfig.value, customTabs.value));

    const activeTabLabel = computed(() => {
        if (activeTabId.value === 'skct') return 'SKCT';
        return customTabs.value.find((tab) => tab.id === activeTabId.value)?.name ?? '사용자 지정';
    });

    function persistState() {
        persistPresetState({
            activeTabId: activeTabId.value,
            customTabs: customTabs.value,
            skctConfig: skctConfig.value,
            soundPreset: soundPreset.value,
        });
    }

    function syncEditor() {
        editor.value = createEditorState(activeTabId.value, skctConfig.value, customTabs.value);
    }

    function buildActiveTimerSettings() {
        if (activeTabId.value === 'skct') {
            return {
                mode: 'skct',
                ...normalizeSkctConfig(skctConfig.value),
                soundPreset: soundPreset.value,
            };
        }

        const currentTab = customTabs.value.find((tab) => tab.id === activeTabId.value) ?? customTabs.value[0];
        if (!currentTab) return null;

        return {
            mode: 'custom',
            phases: currentTab.phases.map((phase) => ({ ...phase })),
            repeatCount: currentTab.repeatCount,
            soundPreset: soundPreset.value,
        };
    }

    function selectTab(tabId) {
        activeTabId.value = resolveActiveTabId(tabId, customTabs.value);
        syncEditor();
        persistState();
        return buildActiveTimerSettings();
    }

    function createCustomPreset() {
        const nextTab = createCustomTab(customTabs.value.length + 1);
        customTabs.value = [...customTabs.value, nextTab];
        activeTabId.value = nextTab.id;
        syncEditor();
        persistState();
        return buildActiveTimerSettings();
    }

    function removeCustomPreset(tabId) {
        const targetId = tabId ?? activeTabId.value;
        customTabs.value = customTabs.value.filter((tab) => tab.id !== targetId);
        if (activeTabId.value === targetId) activeTabId.value = 'skct';
        syncEditor();
        persistState();
        return buildActiveTimerSettings();
    }

    function addCustomPhase(type) {
        if (editor.value.type !== 'custom') return;
        editor.value = {
            ...editor.value,
            phases: [
                ...editor.value.phases,
                { type, name: '', min: type === 'break' ? 5 : 25, sec: 0 },
            ],
        };
    }

    function removeCustomPhase(index) {
        if (editor.value.type !== 'custom' || editor.value.phases.length <= 1) return;
        editor.value = {
            ...editor.value,
            phases: editor.value.phases.filter((_, phaseIndex) => phaseIndex !== index),
        };
    }

    function updateEditorField(field, value) {
        editor.value = { ...editor.value, [field]: value };
    }

    function updateEditorPhase({ index, field, value }) {
        if (editor.value.type !== 'custom') return;
        editor.value = {
            ...editor.value,
            phases: editor.value.phases.map((phase, phaseIndex) =>
                phaseIndex === index ? { ...phase, [field]: value } : phase,
            ),
        };
    }

    function saveActivePreset() {
        if (activeTabId.value === 'skct') {
            skctConfig.value = normalizeSkctConfig(editor.value);
            syncEditor();
            persistState();
            return buildActiveTimerSettings();
        }

        const nextTab = normalizeCustomTab(
            editor.value,
            customTabs.value.findIndex((tab) => tab.id === activeTabId.value),
        );
        customTabs.value = customTabs.value.map((tab) => (tab.id === nextTab.id ? nextTab : tab));
        syncEditor();
        persistState();
        return buildActiveTimerSettings();
    }

    function updateSoundPreset(nextPreset) {
        soundPreset.value = SOUND_OPTIONS.some((option) => option.id === nextPreset) ? nextPreset : DEFAULT_SOUND_PRESET;
        persistState();
    }

    return {
        activeTabId,
        activeTabLabel,
        customTabs,
        editor,
        soundPreset,
        addCustomPhase,
        buildActiveTimerSettings,
        createCustomPreset,
        removeCustomPhase,
        removeCustomPreset,
        saveActivePreset,
        selectTab,
        updateEditorField,
        updateEditorPhase,
        updateSoundPreset,
    };
}

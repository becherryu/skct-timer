<template>
    <div class="page" :class="{ 'is-fullscreen': isFullscreen }">
        <div class="card" :class="{ 'is-fullscreen': isFullscreen }">
            <div v-if="finished" class="finished">
                <p class="finished-title">완료</p>
                <p class="finished-sub">
                    {{ activeTabId === 'skct' ? DEFAULT_SUBJECTS.length + '과목' : studyTotal + '개 루틴' }}
                    x {{ repeatCount }}회 완료
                </p>
                <button class="btn-main" @click="reset">다시 시작</button>
            </div>

            <template v-else>
                <PresetTabs
                    :active-tab-id="activeTabId"
                    :custom-tabs="customTabs"
                    @add="handleCreateCustomTab"
                    @remove="handleRemoveCustomTab"
                    @select="handleSelectTab"
                />

                <TimerBoard
                    :active-tab-id="activeTabId"
                    :active-tab-label="activeTabLabel"
                    :current-phase="currentPhase"
                    :current-study-num="currentStudyNum"
                    :default-time-str="defaultTimeStr"
                    :is-break="isBreak"
                    :is-warning="isWarning"
                    :next-subject-name="nextSubjectName"
                    :progress-pct="progressPct"
                    :running="running"
                    :sequence="sequence"
                    :started="started"
                    :step-status="stepStatus"
                    :study-total="studyTotal"
                    :time-str="timeStr"
                    @reset="reset"
                    @skip="skip"
                    @start="start"
                >
                    <template #actions>
                        <AppTopBar
                            :is-dark="isDark"
                            :is-fullscreen="isFullscreen"
                            @open-config="openConfigModal"
                            @toggle-dark="toggleDark"
                            @toggle-fullscreen="toggleFullscreen"
                        />
                    </template>
                </TimerBoard>
            </template>
        </div>

        <ConfigModal
            :active-tab-id="activeTabId"
            :active-tab-label="activeTabLabel"
            :default-subjects="DEFAULT_SUBJECTS"
            :editor="editor"
            :selected-sound-preset="soundPreset"
            :show="showConfigModal"
            :sound-options="SOUND_OPTIONS"
            @add-phase="addCustomPhase"
            @close="closeConfigModal"
            @remove-phase="removeCustomPhase"
            @save="handleApply"
            @update-field="handleEditorFieldUpdate"
            @update-phase="handleEditorPhaseUpdate"
            @update-sound="handleSoundPresetUpdate"
        />
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import AppTopBar from './components/AppTopBar.vue';
import ConfigModal from './components/ConfigModal.vue';
import PresetTabs from './components/PresetTabs.vue';
import TimerBoard from './components/TimerBoard.vue';
import { useTimerPresets } from './composables/useTimerPresets.js';
import { SOUND_OPTIONS } from './soundPresets.js';
import { DEFAULT_SUBJECTS, useTimer } from './useTimer.js';

const timer = useTimer();
const presets = useTimerPresets();

const isDark = ref(false);
const isFullscreen = ref(false);
const showConfigModal = ref(false);

const defaultTimeStr = computed(() => {
    const first = timer.sequence.value[0];
    if (!first) return '00:00';
    const minutes = String(Math.floor(first.duration / 60)).padStart(2, '0');
    const seconds = String(first.duration % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
});

function applyTimerSettings(settings) {
    if (settings) timer.applySettings(settings);
}

function openConfigModal() {
    showConfigModal.value = true;
}

function closeConfigModal() {
    showConfigModal.value = false;
}

function handleSelectTab(tabId) {
    applyTimerSettings(presets.selectTab(tabId));
    showConfigModal.value = false;
}

function handleCreateCustomTab() {
    applyTimerSettings(presets.createCustomPreset());
    showConfigModal.value = true;
}

function handleRemoveCustomTab(tabId) {
    const wasActive = presets.activeTabId.value === tabId;
    applyTimerSettings(presets.removeCustomPreset(tabId));
    if (wasActive) showConfigModal.value = false;
}

function handleApply() {
    applyTimerSettings(presets.saveActivePreset());
    showConfigModal.value = false;
}

function handleEditorFieldUpdate(payload) {
    presets.updateEditorField(payload.field, payload.value);
}

function handleEditorPhaseUpdate(payload) {
    presets.updateEditorPhase(payload);
}

function handleSoundPresetUpdate(nextPreset) {
    presets.updateSoundPreset(nextPreset);
    applyTimerSettings(presets.buildActiveTimerSettings());
    previewSound('bell');
}

function toggleDark() {
    isDark.value = !isDark.value;
    document.documentElement.classList.toggle('dark', isDark.value);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
}

function onFullscreenChange() {
    isFullscreen.value = !!document.fullscreenElement;
}

onMounted(() => {
    document.addEventListener('fullscreenchange', onFullscreenChange);
    applyTimerSettings(presets.buildActiveTimerSettings());
});

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', onFullscreenChange);
});

const {
    currentPhase,
    currentRepeat,
    currentStudyNum,
    finished,
    isBreak,
    isWarning,
    nextSubjectName,
    progressPct,
    previewSound,
    repeatCount,
    running,
    sequence,
    skip,
    start,
    started,
    stepStatus,
    studyTotal,
    timeStr,
    reset,
} = timer;

const { activeTabId, activeTabLabel, customTabs, editor, soundPreset, addCustomPhase, removeCustomPhase } = presets;
</script>

<template>
    <div class="timer-panel">
        <div class="timer-top-row">
            <div class="phase-meta">
                <span class="phase-label" :class="{ 'is-break': isBreak }">
                    {{ isBreak ? currentPhase?.name || '인터벌' : currentStudyNum + ' / ' + studyTotal }}
                </span>
                <span v-if="nextSubjectName" class="next-label">다음 -> {{ nextSubjectName }}</span>
            </div>
            <slot name="actions" />
        </div>

        <div class="timer-main">
            <div class="subject-name" :class="{ 'is-break': isBreak }">
                {{ started ? currentPhase?.name : activeTabId === 'skct' ? 'SKCT 모의고사' : activeTabLabel }}
            </div>

            <div class="timer" :class="{ warning: isWarning, 'is-break': isBreak, idle: !started }">
                {{ started ? timeStr : defaultTimeStr }}
            </div>

            <div class="progress-wrap">
                <div
                    class="progress-fill"
                    :class="{ warning: isWarning, 'is-break': isBreak }"
                    :style="{ width: (started ? progressPct : 0) + '%' }"
                />
            </div>

            <div class="steps" :class="{ 'custom-steps': activeTabId !== 'skct' }">
                <template
                    v-for="(item, index) in displaySequence"
                    :key="`${item.type}-${index}-${item.virtual ? 'virtual' : 'real'}`"
                >
                    <div
                        class="step"
                        :class="[item.type, getStepState(item, index), { virtual: item.virtual, 'show-label': shouldShowStepLabel(item) }]"
                    >
                        <div class="dot" />
                        <span class="step-label">{{ getStepLabel(item) }}</span>
                    </div>
                </template>
            </div>

            <div class="controls">
                <button v-if="started" class="btn-sub" @click="$emit('reset')">초기화</button>
                <button class="btn-main" @click="$emit('start')">
                    {{ !started ? '시작' : running ? '일시정지' : '계속' }}
                </button>
                <button v-if="started" class="btn-sub" @click="$emit('skip')">다음</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    activeTabId: { type: String, required: true },
    activeTabLabel: { type: String, required: true },
    currentPhase: { type: Object, default: null },
    currentStudyNum: { type: Number, required: true },
    defaultTimeStr: { type: String, required: true },
    isBreak: { type: Boolean, required: true },
    isWarning: { type: Boolean, required: true },
    nextSubjectName: { type: String, default: null },
    progressPct: { type: Number, required: true },
    running: { type: Boolean, required: true },
    sequence: { type: Array, required: true },
    started: { type: Boolean, required: true },
    stepStatus: { type: Function, required: true },
    studyTotal: { type: Number, required: true },
    timeStr: { type: String, required: true },
});

const displaySequence = computed(() => {
    if (
        props.activeTabId !== 'skct' &&
        props.sequence.length === 1 &&
        props.sequence[0]?.type === 'subject'
    ) {
        return [...props.sequence, { type: 'break', name: '휴식', virtual: true, showLabel: true }];
    }

    return props.sequence;
});

function getStepState(item, index) {
    if (item.virtual) return 'idle';
    return props.stepStatus(index);
}

function shouldShowStepLabel(item) {
    return item.type === 'subject' || item.showLabel || (props.activeTabId !== 'skct' && item.type === 'break');
}

function getStepLabel(item) {
    if (item.type === 'subject') return item.name;
    if (item.showLabel || (props.activeTabId !== 'skct' && item.type === 'break')) return item.name;
    return '';
}

defineEmits(['reset', 'skip', 'start']);
</script>

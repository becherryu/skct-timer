<template>
    <div class="timer-panel">
        <div class="timer-top-row">
            <div class="phase-meta">
                <span class="phase-label" :class="{ 'is-break': isBreak }">
                    {{ phaseMetaLabel }}
                </span>
                <span v-if="nextSubjectName" class="next-label">다음 -> {{ nextSubjectName }}</span>
            </div>
            <slot name="actions" />
        </div>

        <div class="timer-main">
            <div class="subject-name" :class="{ 'is-break': isBreak }">
                {{ subjectTitle }}
            </div>

            <div
                class="timer"
                :class="{ warning: isWarning, 'is-break': isBreak, idle: !started, 'is-countdown': isCountingDown }"
            >
                <template v-if="isCountingDown">
                    <span class="countdown-value">{{ countdownRemaining }}</span>
                    <span class="countdown-unit">초</span>
                </template>
                <template v-else>
                    {{ started ? timeStr : defaultTimeStr }}
                </template>
            </div>

            <div class="progress-wrap">
                <div
                    class="progress-fill"
                    :class="{ warning: isWarning, 'is-break': isBreak }"
                    :style="{ width: (started ? progressPct : 0) + '%' }"
                />
            </div>

            <div
                class="steps"
                :class="{ 'custom-steps': activeTabId !== 'skct', 'skct-steps': activeTabId === 'skct' }"
                :style="stepsStyle"
            >
                <template
                    v-for="(item, index) in displaySequence"
                    :key="`${item.type}-${index}-${item.virtual ? 'virtual' : 'real'}`"
                >
                    <div
                        class="step"
                        :class="[
                            item.type,
                            getStepState(item, index),
                            { virtual: item.virtual, 'show-label': shouldShowStepLabel(item) },
                        ]"
                    >
                        <div v-if="item.type === 'countdown'" class="dot countdown-dot">
                            <svg class="countdown-play" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path class="countdown-play-path" d="M5 3.5l6.2 4.5L5 12.5v-9z" />
                            </svg>
                        </div>
                        <div v-else class="dot" />
                        <span class="step-label">{{ getStepLabel(item) }}</span>
                    </div>
                </template>
            </div>

            <div class="controls">
                <button v-if="started" class="btn-sub" @click="$emit('reset')">초기화</button>
                <button class="btn-main" @click="$emit('start')">
                    {{ actionLabel }}
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
    countdownRemaining: { type: Number, required: true },
    currentPhase: { type: Object, default: null },
    currentStudyNum: { type: Number, required: true },
    defaultTimeStr: { type: String, required: true },
    isBreak: { type: Boolean, required: true },
    isCountingDown: { type: Boolean, required: true },
    isWarning: { type: Boolean, required: true },
    nextSubjectName: { type: String, default: null },
    progressPct: { type: Number, required: true },
    running: { type: Boolean, required: true },
    sequence: { type: Array, required: true },
    startDelayEnabled: { type: Boolean, required: true },
    startDelaySeconds: { type: Number, required: true },
    started: { type: Boolean, required: true },
    stepStatus: { type: Function, required: true },
    studyTotal: { type: Number, required: true },
    timeStr: { type: String, required: true },
});

const displaySequence = computed(() => {
    const baseSequence =
        props.activeTabId !== 'skct' && props.sequence.length === 1 && props.sequence[0]?.type === 'subject'
            ? [...props.sequence, { type: 'break', name: '휴식', virtual: true, showLabel: true }]
            : props.sequence;

    if (props.startDelayEnabled && props.startDelaySeconds > 0) {
        return [{ type: 'countdown', name: '준비', virtual: true, showLabel: true }, ...baseSequence];
    }

    return baseSequence;
});
const stepsStyle = computed(() =>
    props.activeTabId === 'skct' ? { '--step-count': String(displaySequence.value.length) } : {}
);

const subjectTitle = computed(() => {
    if (props.isCountingDown) return '준비';
    return props.started
        ? props.currentPhase?.name
        : props.activeTabId === 'skct'
          ? 'SKCT 모의고사'
          : props.activeTabLabel;
});
const phaseMetaLabel = computed(() => {
    if (props.isCountingDown) return '시작 전';
    return props.isBreak ? props.currentPhase?.name || '인터벌' : props.currentStudyNum + ' / ' + props.studyTotal;
});
const actionLabel = computed(() => {
    if (props.isCountingDown) return '취소';
    if (!props.started) return '시작';
    return props.running ? '일시정지' : '계속';
});

function getStepState(item, index) {
    if (item.type === 'countdown') {
        if (props.isCountingDown) return 'active';
        return props.started ? 'done' : 'idle';
    }
    if (item.virtual) return 'idle';
    return props.stepStatus(props.startDelayEnabled && props.startDelaySeconds > 0 ? index - 1 : index);
}

function shouldShowStepLabel(item) {
    return (
        item.type === 'countdown' ||
        item.type === 'subject' ||
        item.showLabel ||
        (props.activeTabId !== 'skct' && item.type === 'break')
    );
}

function getStepLabel(item) {
    if (item.type === 'countdown') return item.name;
    if (item.type === 'subject') return item.name;
    if (item.showLabel || (props.activeTabId !== 'skct' && item.type === 'break')) return item.name;
    return '';
}

defineEmits(['reset', 'skip', 'start']);
</script>

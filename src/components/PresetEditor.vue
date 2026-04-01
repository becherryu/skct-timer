<template>
    <div class="config-panel">
        <template v-if="activeTabId === 'skct'">
            <div class="config-grid">
                <div class="setting-card">
                    <p class="settings-section">SKCT 시간</p>
                    <div class="setting-row">
                        <label>과목당 시간</label>
                        <div class="input-group">
                            <input
                                type="number"
                                :value="editor.min"
                                min="0"
                                max="60"
                                @input="updateNumber('min', $event)"
                            />
                            <span class="unit">분</span>
                            <input
                                type="number"
                                :value="editor.sec"
                                min="0"
                                max="59"
                                @input="updateNumber('sec', $event)"
                            />
                            <span class="unit">초</span>
                        </div>
                    </div>
                    <div class="setting-row">
                        <label>쉬는 시간</label>
                        <div class="input-group">
                            <input
                                type="number"
                                :value="editor.breakMin"
                                min="0"
                                max="60"
                                @input="updateNumber('breakMin', $event)"
                            />
                            <span class="unit">분</span>
                            <input
                                type="number"
                                :value="editor.breakSec"
                                min="0"
                                max="59"
                                @input="updateNumber('breakSec', $event)"
                            />
                            <span class="unit">초</span>
                        </div>
                    </div>
                    <div class="setting-row">
                        <label>반복 횟수</label>
                        <div class="input-group">
                            <input
                                type="number"
                                :value="editor.repeatCount"
                                min="1"
                                max="10"
                                @input="updateNumber('repeatCount', $event)"
                            />
                            <span class="unit">회</span>
                        </div>
                    </div>
                </div>

                <div class="setting-card">
                    <p class="settings-section">과목</p>
                    <div class="skct-chips">
                        <span v-for="subject in defaultSubjects" :key="subject" class="skct-chip">{{ subject }}</span>
                    </div>
                </div>

                <div class="setting-card">
                    <p class="settings-section">알람 소리</p>
                    <div class="sound-options">
                        <button
                            v-for="option in soundOptions"
                            :key="option.id"
                            :class="['sound-option', { active: selectedSoundPreset === option.id }]"
                            @click="$emit('update-sound', option.id)"
                        >
                            <strong>{{ option.label }}</strong>
                            <span>{{ option.description }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <template v-else>
            <div class="config-grid">
                <div class="setting-card">
                    <p class="settings-section">탭 정보</p>
                    <div class="setting-row">
                        <label>탭 이름</label>
                        <input
                            type="text"
                            :value="editor.name"
                            class="subject-input wide-input"
                            placeholder="사용자 지정 탭 이름"
                            @input="updateText('name', $event)"
                        />
                    </div>
                    <div class="setting-row">
                        <label>반복 횟수</label>
                        <div class="input-group">
                            <input
                                type="number"
                                :value="editor.repeatCount"
                                min="1"
                                max="10"
                                @input="updateNumber('repeatCount', $event)"
                            />
                            <span class="unit">회</span>
                        </div>
                    </div>
                    <div class="settings-divider" />
                    <p class="settings-section">알람 소리</p>
                    <div class="sound-options">
                        <button
                            v-for="option in soundOptions"
                            :key="option.id"
                            :class="['sound-option', { active: selectedSoundPreset === option.id }]"
                            @click="$emit('update-sound', option.id)"
                        >
                            <strong>{{ option.label }}</strong>
                            <span>{{ option.description }}</span>
                        </button>
                    </div>
                </div>

                <div class="setting-card">
                    <div class="subjects-header">
                        <p class="settings-section" style="margin-bottom: 0">루틴 구성</p>
                        <div class="add-actions">
                            <button class="btn-add" @click="$emit('add-phase', 'study')">+ 세션</button>
                            <button class="btn-add" @click="$emit('add-phase', 'break')">+ 인터벌</button>
                        </div>
                    </div>
                    <p class="config-help">각 루틴은 이름을 자유롭게 정하고 시간만 맞추면 됩니다.</p>
                    <div class="subjects-list">
                        <div v-for="(phase, index) in editor.phases" :key="index" class="custom-phase-row">
                            <span class="phase-type-badge" :class="phase.type">
                                {{ phase.type === 'study' ? '세션' : '인터벌' }}
                            </span>
                            <div class="custom-phase-main">
                                <input
                                    type="text"
                                    :value="phase.name"
                                    class="subject-input"
                                    :placeholder="phase.type === 'study' ? '문제풀이' : '휴식'"
                                    @input="updatePhaseText(index, 'name', $event)"
                                />
                                <div class="phase-time-group">
                                    <input
                                        type="number"
                                        :value="phase.min"
                                        min="0"
                                        max="180"
                                        class="time-input"
                                        @input="updatePhaseNumber(index, 'min', $event)"
                                    />
                                    <span class="unit">분</span>
                                    <input
                                        type="number"
                                        :value="phase.sec"
                                        min="0"
                                        max="59"
                                        class="time-input"
                                        @input="updatePhaseNumber(index, 'sec', $event)"
                                    />
                                    <span class="unit">초</span>
                                </div>
                            </div>
                            <button
                                class="btn-remove"
                                @click="$emit('remove-phase', index)"
                                :disabled="editor.phases.length <= 1"
                            >
                                x
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </template>

    </div>
</template>

<script setup>
const props = defineProps({
    activeTabId: {
        type: String,
        required: true,
    },
    defaultSubjects: {
        type: Array,
        required: true,
    },
    editor: {
        type: Object,
        required: true,
    },
    selectedSoundPreset: {
        type: String,
        required: true,
    },
    soundOptions: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits(['add-phase', 'remove-phase', 'update-field', 'update-phase', 'update-sound']);

function updateNumber(field, event) {
    emit('update-field', { field, value: Number(event.target.value) });
}

function updateText(field, event) {
    emit('update-field', { field, value: event.target.value });
}

function updatePhaseNumber(index, field, event) {
    emit('update-phase', { index, field, value: Number(event.target.value) });
}

function updatePhaseText(index, field, event) {
    emit('update-phase', { index, field, value: event.target.value });
}
</script>

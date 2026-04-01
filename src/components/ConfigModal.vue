<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
                <div class="modal-shell">
                    <div class="modal-header">
                        <div>
                            <p class="modal-title">{{ activeTabLabel }} 설정</p>
                            <p class="modal-subtitle">탭 구성과 알람음을 여기서 조정할 수 있습니다.</p>
                        </div>
                        <button class="btn-icon" @click="$emit('close')" title="닫기">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path
                                    d="M1 1l12 12M13 1L1 13"
                                    stroke="currentColor"
                                    stroke-width="1.4"
                                    stroke-linecap="round"
                                />
                            </svg>
                        </button>
                    </div>

                    <div ref="modalBody" class="modal-body">
                        <PresetEditor
                            :active-tab-id="activeTabId"
                            :default-subjects="defaultSubjects"
                            :editor="editor"
                            :selected-sound-preset="selectedSoundPreset"
                            :sound-options="soundOptions"
                            @add-phase="$emit('add-phase', $event)"
                            @remove-phase="$emit('remove-phase', $event)"
                            @update-field="$emit('update-field', $event)"
                            @update-phase="$emit('update-phase', $event)"
                            @update-sound="$emit('update-sound', $event)"
                        />
                    </div>

                    <div class="modal-footer">
                        <span class="config-hint">브라우저에 자동 저장됩니다.</span>
                        <button class="btn-apply" @click="$emit('save')">저장</button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { nextTick, onUnmounted, ref, watch } from 'vue';
import PresetEditor from './PresetEditor.vue';

const modalBody = ref(null);

const props = defineProps({
    activeTabId: {
        type: String,
        required: true,
    },
    activeTabLabel: {
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
    show: {
        type: Boolean,
        required: true,
    },
    soundOptions: {
        type: Array,
        required: true,
    },
});

defineEmits(['add-phase', 'close', 'remove-phase', 'save', 'update-field', 'update-phase', 'update-sound']);

watch(
    () => props.show,
    async (isOpen) => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        if (!isOpen) return;
        await nextTick();
        modalBody.value?.scrollTo({ top: 0, behavior: 'auto' });
    },
);

onUnmounted(() => {
    document.body.style.overflow = '';
});
</script>

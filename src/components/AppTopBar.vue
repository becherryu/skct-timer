<template>
    <div class="top-bar">
        <div class="top-actions">
            <button class="btn-icon" @click="$emit('open-config')" title="설정">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M6.5 1.5h3l.5 1.5a4.5 4.5 0 0 1 1.06.62l1.54-.46 1.5 2.6-1.2 1.06a4.6 4.6 0 0 1 0 1.36l1.2 1.06-1.5 2.6-1.54-.46A4.5 4.5 0 0 1 10 12.02l-.5 1.48h-3l-.5-1.48a4.5 4.5 0 0 1-1.06-.62l-1.54.46-1.5-2.6 1.2-1.06a4.6 4.6 0 0 1 0-1.36L1.9 5.78l1.5-2.6 1.54.46A4.5 4.5 0 0 1 6 2.98L6.5 1.5z"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linejoin="round"
                    />
                    <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.2" />
                </svg>
            </button>
            <button class="btn-icon" @click="$emit('toggle-muted')" :title="isMuted ? '소리 켜기' : '소리 끄기'">
                <svg v-if="!isMuted" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M2 6.5h2.4L7.8 4v8L4.4 9.5H2v-3z"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M10.4 5.2a3.8 3.8 0 0 1 0 5.6M12.2 3.6a6.2 6.2 0 0 1 0 8.8"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linecap="round"
                    />
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M2 6.5h2.4L7.8 4v8L4.4 9.5H2v-3z"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linejoin="round"
                    />
                    <path
                        d="M10.5 6l3 4M13.5 6l-3 4"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linecap="round"
                    />
                </svg>
            </button>
            <button
                v-if="showFullscreen"
                class="btn-icon"
                @click="$emit('toggle-fullscreen')"
                :title="isFullscreen ? '전체화면 종료' : '전체화면'"
            >
                <svg v-if="!isFullscreen" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M1 6V1h5M10 1h5v5M15 10v5h-5M6 15H1v-5"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M6 1v5H1M10 1v5h5M10 15v-5h5M6 15v-5H1"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>
            <button class="btn-icon" @click="$emit('toggle-dark')" :title="isDark ? '라이트 모드' : '다크 모드'">
                <svg v-if="isDark" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="3.5" stroke="currentColor" stroke-width="1.2" />
                    <path
                        d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.93 2.93l1.06 1.06M12.01 12.01l1.06 1.06M2.93 13.07l1.06-1.06M12.01 3.99l1.06-1.06"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linecap="round"
                    />
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    isDark: {
        type: Boolean,
        required: true,
    },
    isFullscreen: {
        type: Boolean,
        required: true,
    },
    isMuted: {
        type: Boolean,
        required: true,
    },
    showFullscreen: {
        type: Boolean,
        required: true,
    },
});

defineEmits(['open-config', 'toggle-dark', 'toggle-fullscreen', 'toggle-muted']);
</script>

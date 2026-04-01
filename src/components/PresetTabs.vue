<template>
    <div class="tab-section">
        <div class="tab-scroll">
            <button :class="['main-tab', { active: activeTabId === 'skct' }]" @click="$emit('select', 'skct')">SKCT</button>
            <div v-for="tab in customTabs" :key="tab.id" :class="['main-tab', 'with-remove', { active: activeTabId === tab.id }]">
                <button class="main-tab-trigger" @click="$emit('select', tab.id)">
                    <span class="main-tab-label">{{ tab.name }}</span>
                </button>
                <button class="main-tab-remove" title="탭 삭제" @click="$emit('remove', tab.id)">x</button>
            </div>
            <button class="main-tab add" @click="$emit('add')" title="사용자 지정 탭 추가">+</button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    activeTabId: {
        type: String,
        required: true,
    },
    customTabs: {
        type: Array,
        required: true,
    },
});

defineEmits(['add', 'remove', 'select']);
</script>

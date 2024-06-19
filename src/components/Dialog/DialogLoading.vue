<template>
    <div class="dialog-loading-box" v-if="props.visible">
        <div class="loading-bar">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div class="dialog-body" v-if="props.content">
            {{ content  }}
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
    dialogId?: number;
    visible?: boolean;
    content?: string;
}>();

let timeHandle = 0;
const count = ref(0);

const content = computed(() => {
    if (!props.content) {
        return ''; 
    }
    return props.content + '.'.repeat(count.value);
})

function start() {
    stop();
    if (!props.content) {
        return;
    }
    timeHandle = setInterval(() => {
        if (count.value > 8) {
            count.value = 0;
            return;
        }
        count.value ++;
    }, 500);
}

function stop() {
    if (timeHandle > 0) {
        clearInterval(timeHandle);
        timeHandle = 0;
    }
}

watch(() => props.visible, value => {
    if (value) {
        start();
    } else {
        stop();
    }
});
onUnmounted(() => {
    stop();
})
</script>
<style lang="scss">
@import '../../assets/css/theme';
.dialog-loading-box {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 201;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--#{$prefix}-primary-text);
    user-select: none;
    .dialog-body {
        margin-top: 2rem;
    }
}
.loading-bar {
    --#{$prefix}-loading-color: var(--#{$prefix}-primary-text);
    --#{$prefix}-loading-size: 2rem;
}
</style>
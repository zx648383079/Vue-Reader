<template>
    <transition @after-leave="onAfterLeave">
        <div class="dialog-message-box" v-if="visible" v-bind:style="boxStyle" @click="close()">
            <div class="dialog-body" v-bind:class="[props.theme, props.offset > 0 ? 'is-offset' : '']">
                <div class="message-icon" v-if="props.icon">
                    <i class="iconfont" v-bind:class="props.icon"></i>
                </div>
                <div class="message-body">
                    <div class="message-title" v-if="props.title">{{ props.title }}</div>
                    <div class="message-content" v-if="props.content">{{ props.content }}</div>
                </div>
            </div>
        </div>
    </transition>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDialog } from './plugin';

const service = useDialog();
const props = withDefaults(defineProps<{
    dialogId?: number;
    offset?: number;
    icon?: string;
    theme?: string;
    title?: string;
    content?: string;
    time?: number;
}>(), {
    offset: 0,
    time: 2000,
});

const visible = ref(true);
let timeHandle = 0;

const boxStyle = computed(() => {
    return {
        top: props.offset + 'px'
    };
});

function close() {
    visible.value = false;
    if (timeHandle) {
        clearTimeout(timeHandle);
        timeHandle = 0;
    }
}

function onAfterLeave() {
    service?.close(props.dialogId);
}


timeHandle = setTimeout(() => {
    visible.value = false;
    timeHandle = 0;
}, props.time || 2000);

</script>

<style lang="scss">
@import '../../assets/css/theme';
.dialog-message-box {
    position: fixed;
    top: 0;
    width: 100%;
    text-align: center;
    transition: all 500ms ease-in;
    z-index: 999;
    .dialog-body {
        min-height: 3rem;
        display: inline-flex;
        padding: 0.2em .8em;
        background-color: var(--#{$prefix}-dialog);
        box-shadow: 0 1px 3px var(--#{$prefix}-shadow);;
        min-width: 18.75rem;
        border-radius: 0 0 .3em .3em;
        &.is-offset {
            border-radius: .3em;
        }
    }
    .message-icon {
        font-size: 2em;
        padding-right: .4em;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .message-body {
        flex: 1;
        text-align: left;
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .message-success {
        color: var(--#{$prefix}-success-text);
        background-color: var(--#{$prefix}-success);
    }
    .message-waining {
        color: var(--#{$prefix}-warning-text);
        background-color: var(--#{$prefix}-warning);
    }
    .message-error {
        color: var(--#{$prefix}-danger-text);
        background-color: var(--#{$prefix}-danger);
    }
    .message-info {
        color: var(--#{$prefix}-primary-text);
        background-color: var(--#{$prefix}-primary);
    }
}

</style>
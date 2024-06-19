<template>
    <div ref="el">
        <div class="dialog-mask" v-if="maskVisible" @click="close()"></div>
        <DialogToast v-for="item in toastItems" :key="item.id" v-bind="item"></DialogToast>
        <DialogConfirmBox v-bind="confirmData"></DialogConfirmBox>
        <DilaogLoading v-bind="loadingData"></DilaogLoading>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DialogConfirmBox from './DialogConfirmBox.vue';
import DialogToast from './DialogToast.vue';
import DilaogLoading from './DialogLoading.vue';
import type { DialogConfirmOption, DialogTipOption } from './plugin';

const props = withDefaults(
    defineProps<{
        container?: Element
    }>(),
    {
        container: document.body as  any
    }
);
const toastItems = ref<DialogTipOption[]>([]);
const confirmData = ref<DialogConfirmOption>({});
const loadingData = ref<DialogOption>({});

const maskVisible = ref(false);
const el = ref<HTMLDivElement>();
const toastOuterHeight = 60;


function close(id?: any) {
    maskVisible.value = false;
    if (!id) {
        toastItems.value = [];
        confirmData.value = {};
        loadingData.value = {};
        return;
    }
    if (confirmData.value.dialogId === id) {
        confirmData.value = {};
        return;
    }
    if (loadingData.value.dialogId === id) {
        loadingData.value = {};
        return;
    }
    toastItems.value = toastItems.value.filter(i => i.dialogId !== id).map((item, i) => {
        item.offset = i * toastOuterHeight;
        return item;
    });
    
}

function addToast(option: DialogTipOption) {
    option.visible = true;
    const themeItems: any = {
        success: {
            icon: 'icon-check-circle'
        },
        info: {
            icon: 'icon-exclamation-circle',
        },
        waining: {
            icon: 'icon-exclamation-triangle',
        },
        error: {
            icon: 'icon-close'
        }
    };
    const item = themeItems[option.type];
    option.icon = item?.icon || ('icon-' + option.type);
    option.theme = item?.theme || ('message-' + option.type);
    option.offset = toastOuterHeight * toastItems.value.length;
    toastItems.value.push(option);
}

function addConfirm(option: DialogConfirmOption) {
    maskVisible.value = true;
    option.visible = true;
    confirmData.value = option;
}

function addLoading(option: DialogOption) {
    maskVisible.value = true;
    option.visible = true;
    loadingData.value = option;
}

function removeElement(node: Element) {
    if (typeof node.remove === 'undefined') {
        node.remove();
    } else if(node.parentNode) {
        node.parentNode.removeChild(node);
    } 
}

onMounted(() => {
    if (!el.value) {
        return;
    }
    const container = props.container;
    removeElement(el.value);
    container?.appendChild(el.value);
});

defineExpose({
    addToast,
    addConfirm,
    addLoading,
    close,
});
</script>
<style lang="scss">
@import '../../assets/css/theme';
.dialog-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 200;
    background-color: var(--#{$prefix}-dialog-mask);;
}
</style>
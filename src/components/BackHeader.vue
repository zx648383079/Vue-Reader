<template>
    <header class="top" :class="{fixed: !props.fixed}">
        <a class="back" @click="tapBack">
            <i class="iconfont icon-chevron-left" aria-hidden="true"></i>
        </a>
        <span class="title">
            {{ props.title }}
        </span>
        <slot></slot>
    </header>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
const props = withDefaults(defineProps<{
    title?: string,
    fixed?: boolean
}>(), {
    fixed: true,
    title: ''
});

const router = useRouter();

function tapBack(): void {
    if (window.history.length <= 1) {
        router.push('/');
        return;
    }
    router.go(-1);
}
</script>
<style lang="scss" scoped>
@import '../assets/css/theme';
header {
    width: 100%;
    height: 2.75rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: var(--#{$prefix}-primary);
    color: var(--#{$prefix}-primary-text);
    text-align: center;
    z-index: 99;
    border: 0;
    .back {
        top: 50%;
        margin-top: -1rem;
        font-size: 1.5625rem;
        position: absolute;
        left: 0.625rem;
    }
    .title {
        line-height: 2.75rem;
    }
}
</style>


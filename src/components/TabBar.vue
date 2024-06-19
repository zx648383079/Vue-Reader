<template>
    <footer class="tab-bar">
        <a v-for="(item, index) in menus" :key="index" :class="[item.url === $route.name ? 'active' : '']" @click="tapMenu(item)">
            <i :class="item.icon" aria-hidden="true"></i>
            {{ item.name }}
        </a>
    </footer>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

interface IMenu {
    name: string,
    icon: string,
    url: string
}

const menus: IMenu[]  = [
    {
        name: t('nav_home'),
        icon: 'iconfont icon-book',
        url: 'home',
    },
    {
        name: t('nav_category'),
        icon: 'iconfont icon-table',
        url: 'category',
    },
    {
        name: t('nav-search'),
        icon: 'iconfont icon-search',
        url: 'search',
    },
    {
        name: t('nav_my'),
        icon: 'iconfont icon-user',
        url: 'member',
    },
];
function tapMenu(item: IMenu) {
    router.push({ name: item.url});
}
</script>

<style lang="scss" scoped>
@import '../assets/css/theme';
.tab-bar {
    --#{$prefix}-tab: var(--#{$prefix}-panel);
    --#{$prefix}-tab-border: var(--#{$prefix}-border);
    --#{$prefix}-tab-text: var(--#{$prefix}-body-text);
    --#{$prefix}-tab-active-text: var(--#{$prefix}-danger);
    display: flex;
    justify-content: space-around;
    flex-flow: row nowrap;
    position: fixed;
    z-index: 5;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 3rem;
    background-color: var(--#{$prefix}-tab);
    border-top: 1px solid var(--#{$prefix}-tab-border);
    border-right: none;
    border-bottom: none;
    border-left: none;
    a {
        position: relative;
        text-align: center;
        color: var(--#{$prefix}-tab-text);
        span {
            display: block;
            margin-top: .09333rem;
            font-size: .32rem;
            color: var(--#{$prefix}-tab-text);
            line-height: 1;
        }
        .iconfont {
            font-size: 1.5rem;
            display: block;
        }
        .tip {
            position: absolute;
            top: 0;
            right: -0.75rem;
            background-color: var(--#{$prefix}-danger);
            color: var(--#{$prefix}-danger-text);
            border-radius: 50%;
            text-align: center;
            line-height: 1.1875rem;
            font-size: 0.75rem;
            width: 1.25rem;
            height: 1.25rem;
            font-style: normal;
        }
        &.active {
            span,
            .iconfont {
                color: var(--#{$prefix}-tab-active-text);
            }
        }
    }
}
</style>

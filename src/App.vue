<template>
    <div id="app" v-zo-title="$route.meta.title">
        <keep-alive>
            <router-view v-if="$route.meta.keepAlive"></router-view>
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive"></router-view>
    </div>
</template>

<style lang="scss">
@import './assets/css/theme.scss';
</style>

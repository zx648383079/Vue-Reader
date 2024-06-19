<template>
    <RouterView v-slot="{ Component, route }">
        <transition :name="`${route.meta.transition || 'fade'}`">
            <component :is="Component"></component>
        </transition>
    </RouterView>
</template>
<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useAuth } from './services';
import { useAuthStore } from './stores/auth';
const store = useAuthStore()

store.isLoading = true;
useAuth().systemBoot().then(res => {
    store.isLoading = false;
    store.guest = !res;
    store.user = res;
});
</script>
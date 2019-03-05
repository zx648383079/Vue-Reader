<template>
    <header>
        <a class="back" @click="tapBack">
            <i class="fa fa-chevron-left" aria-hidden="true"></i>
        </a>
        <span class="title">
            {{ title }}
        </span>
        <slot></slot>
    </header>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
      data() {
        return {
        };
    },
    props: {
        title: String,
    },
    methods: {
        tapBack() {
            if (window.history.length <= 1) {
                this.$router.push('/');
                return;
            }
            this.$router.go(-1);
        },
    }
})
</script>


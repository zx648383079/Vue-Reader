<template>
    <header>
        <div class="search-box">
            <div class="search-input">
                <i class="fa fa-search" aria-hidden="true" @click="tapSearch"></i>
                <input type="text" :value="value"
                @input="updateVal($event.target.value)" @keyup="onKeyUp" placeholder="搜索" autocomplete="off">
                <i class="fa fa-times-circle" v-if="currrent && currrent.length > 0" @click="tapClear"></i>
            </div>
            <a class="cancel-btn" @click="tapBack">取消</a>
        </div>
    </header>
</template>
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
      data() {
        return {
            currrent: ''
        };
    },
    props: ['value'],
    methods: {
        tapBack() {
            if (window.history.length <= 1) {
                this.$router.push('/');
                return;
            }
            this.$router.go(-1);
        },
        updateVal(val: string) {
            this.$emit('input', val);
            this.currrent = val;
        },
        tapClear() {
            this.updateVal('');
        },
        onKeyUp(event: any) {
            if (!this.value || this.value.trim().length === 0) {
                return;
            }
            if (event.which === 13) {
                this.$emit('enter', this.value);
                return;
            }
            this.$emit('keyup', event);
        },
        tapSearch() {
            this.$emit('enter', this.value);
        }
    }
})
</script>
<style lang="scss" scoped>
header {
    width: 100%;
    height: 2.75rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgb(240, 78, 73);
    color: #fff;
    text-align: center;
    z-index: 99;
    border: 0;
    .search-box {
        padding: 5px;
        line-height: 36px;
        display: grid;
        grid-template-columns: 1fr 54px;
        .search-input {
            position: relative;
        }
        .fa {
            position: absolute;
            top: 10px;
            z-index: 99;
            color: #666;
            &.fa-search {
                left: 5px;
            }
            &.fa-times-circle {
                right: 5px;
            }
        }
        input {
            margin-top: 0.125rem;
            width: 100%;
            font-size: 1.25rem;
            padding: 4px 29px;
            box-sizing: border-box;
            background-color: #f4f4f4;
            border: 0;
        }
        .cancel-btn {
            color: #fff;
        }
    }
}
</style>


<template>
    <div>
        <div class="pager" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend">
            <div ref="prevPage" class="prev-page">

            </div>
            <div ref="currentPage" class="current-page">

            </div>
            <div ref="nextPage" class="next-page">

            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { Pager } from '@/utils/pager';
export default Vue.extend({
    data() {
        let pager: Pager = new Pager('');
        return {
            pager
        };
    },
    props: {
        width: Number,
        height: Number,
    },
    methods: {
        refreshPager(text: string) {
            this.pager = new Pager(text);
        },
        touchstart(e: TouchEvent) {
            console.log(e.targetTouches[0].clientX);
        },
        touchmove(e: TouchEvent) {

        },
        touchend(e: TouchEvent) {

        },
        goPager(page: number) {
            this.$refs.currentPage.innerHTML = this.pager.toHtml(page, 18, 10, 2, this.width, this.height);
        },
        goNext() {
            for (const item of this.$refs.currentPage.children) {
                this.$refs.prevPage.appendChild(item);
            }
            this.goPager(2);
        }
    },
});
</script>
<style lang="scss" scoped>
.pager {
    .current-page,
    .prev-page,
    .next-page {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 100%;
        transition: 1s left;
    }
}
</style>



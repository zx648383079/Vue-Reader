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
            pager,
            page: 1,
            count: 0,
            startX: 0,
            endX: 0,
            isRight: 0
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
            this.startX = e.targetTouches[0].clientX;
            this.isRight = 0;
        },
        touchmove(e: TouchEvent) {
            if (this.isRight === 3) {
                return;
            }
            this.endX = e.targetTouches[0].clientX;
            const diff = this.endX - this.startX;
            if (this.isRight === 0) {
                this.isRight = diff < 0 ? 1 : 2;
                if (!this.readyPage()) {
                    return;
                }
            } else if (
                (this.isRight === 1 && diff > 0) 
                || (this.isRight === 2 && diff < 0)
            ) {
                return;
            }
            if (this.isRight) {
                this.$refs.currentPage.style.left = diff + 'px';
                return;
            }
            this.$refs.prevPage.style.left = diff - this.width + 'px';
        },
        touchend(e: TouchEvent) {
            if (this.isRight !== 1 && this.isRight !== 2) {
                return;
            }
            const diff = this.endX - this.startX;
            if (
                (this.isRight === 1 && diff > 0) 
                || (this.isRight === 2 && diff < 0)
            ) {
                return;
            }
            if (this.isRight) {
                this.animation(this.$refs.currentPage, diff, - this.width, () => {
                    this.applyNext();
                });
                return;
            }
            this.animation(this.$refs.prevPage, diff, this.width, () => {
                this.applyPrev();
            });
        },
        readyPage() {
            if (this.isRight === 1 && this.page < 2) {
                this.isRight = 3;
                return false;
            }
            if (this.isRight) {
                this.applyPage(this.$refs.nextPage, this.page + 1);
            } else {
                this.applyPage(this.$refs.prevPage, this.page - 1);
            }
            return true;
        },
        applyNext() {
            this.swapHtml(this.$refs.nextPage, this.$refs.currentPage);
            this.$refs.currentPage.style.left = '0px';
        },
        applyPrev() {
            this.swapHtml(this.$refs.prevPage, this.$refs.currentPage);
            this.$refs.prevPage.style.left = - this.width +'px';
        },
        // 补间动画
        animation(element: HTMLDivElement, start: number, end: number, endHandle: Function) {
            element.style.left = end + 'px';
            endHandle();
        },
        swapHtml(src: HTMLDivElement, dist: HTMLDivElement) {
            for (const item of dist.children) {
                dist.removeChild(item);
            }
            for (const item of src.children) {
                dist.appendChild(item);
            }
        },
        applyPage(element: HTMLDivElement, page: number) {
            element.innerHTML = this.pager.toHtml(page, 18, 10, 2, this.width, this.height);
        },
        goPager(page: number) {
            this.page = page;
            this.applyPage(this.$refs.currentPage, page);
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
    overflow: hidden;
    .current-page,
    .prev-page,
    .next-page {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 100%;
        box-shadow: 10px 0 10px #767676;
    }
}
</style>



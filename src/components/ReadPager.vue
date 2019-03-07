<template>
    <div>
        <div :class="['pager', font]" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend" :style="{color: color, 'font-size': fontSize + 'px '}">
            <div ref="prevPage" :class="['prev-page', theme]">

            </div>
            <div ref="currentPage" :class="['current-page', theme]">

            </div>
            <div ref="nextPage" :class="['next-page', theme]">

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
            pageCount: 0,
            startX: 0,       //  开始的滑动位置
            isSilde: false,  // 记录是否是滑动事件
            isRight: 0       // 记录一开始滑动的方向 0 未设置 1 右滑动 2 左滑动 3 已完成切换
        };
    },
    props: {
        width: {
            type: Number,
            default: 0
        },
        height: {
            type: Number,
            default: 0
        },
        fontSize: {
            type: Number,
            default: 18
        }, 
        lineSpace: {
            type: Number,
            default: 10
        },
        letterSpace: {
            type: Number,
            default: 4
        },
        left: {
            type: Number,
            default: 10
        },
        top: {
            type: Number,
            default: 10
        },
        color: {
            type: String,
            default: '#333'
        },
        font: String,
        theme: String
    },
    methods: {
        isToRight() {
            return this.isRight === 1;
        },
        isToLeft() {
            return this.isRight === 2;
        },
        refreshPager(text: string) {
            this.pager = new Pager(text);
        },
        tapIfClick(x: number, y: number) {
            const centerX = this.width / 2;
            if (Math.abs(centerX  - x) < 50 && Math.abs(this.height / 2 - y) < 50) {
                // 点击中间，触发设置
                this.$emit('middle');
                return;
            }
            this.$emit('middle', false);
            if (centerX > x) {
                // 上一页
                this.goPrev();
                return;
            }
            this.goNext();
        },
        touchstart(e: TouchEvent) {
            this.startX = e.targetTouches[0].clientX;
            this.isRight = 0;
            this.isSilde = false;
        },
        touchmove(e: TouchEvent) {
            this.isSilde = true;
            this.$emit('middle', false);
            if (this.isRight === 3) {
                return;
            }
            const diff = e.targetTouches[0].clientX - this.startX;
            if (this.isRight === 0) {
                this.isRight = diff < 0 ? 1 : 2;
                if (!this.readyPage()) {
                    return;
                }
            } else if (
                (this.isToRight() && diff > 0) 
                || (this.isToLeft() && diff < 0)
            ) {
                return;
            }
            if (Math.abs(diff) > this.width) {
                this.isToRight() ? this.applyNext() : this.applyPrev();
                return;
            }
            if (this.isToRight()) {
                this.$refs.currentPage.style.left = diff + 'px';
                return;
            }
            this.$refs.prevPage.style.left = diff - this.width + 'px';
        },
        touchend(e: TouchEvent) {
            if (!this.isSilde) {
                this.tapIfClick(this.startX, e.changedTouches[0].clientY);
                return;
            }
            if (this.isRight !== 1 && this.isRight !== 2) {
                return;
            }
            const diff = e.changedTouches[0].clientX - this.startX;
            if (
                (this.isToRight() && diff > 0) 
                || (this.isToLeft() && diff < 0)
            ) {
                return;
            }
            if (this.isToRight()) {
                this.animation(this.$refs.currentPage, diff, - this.width, () => {
                    this.applyNext();
                });
                return;
            }
            this.animation(this.$refs.prevPage, diff, 0, () => {
                this.applyPrev();
            });
        },
        /**
         * 根据滑动方向准备内容
         */
        readyPage() {
            if (this.isToRight()) {
                return this.readyPrev();
            }
            return this.readyNext();
        },
        /**
         * 准备上一页的内容
         */
        readyPrev() {
            if (this.page < 2) {
                this.isRight = 3;
                return false;
            }
            this.applyPage(this.$refs.prevPage, this.page - 1);
            return true;
        },
        /**
         * 准备下一页的内容
         */
        readyNext() {
            if (this.page >= this.pageCount) {
                return false;
            }
            this.applyPage(this.$refs.nextPage, this.page + 1);
            return true;
        },
        /**
         * 动画执行完成，把内容放到正确的元素上，并把其他元素移开
         */
        applyNext() {
            this.page ++;
            this.swapHtml(this.$refs.nextPage, this.$refs.currentPage);
            this.$refs.currentPage.style.left = '0px';
            this.isRight = 3;
            this.notifyProgress();
        },
        /**
         * 动画执行完成，把内容放到正确的元素上，并把其他元素移开
         */
        applyPrev() {
            this.page --;
            this.swapHtml(this.$refs.prevPage, this.$refs.currentPage);
            this.$refs.prevPage.style.left = - this.width * 1.1 +'px';
            this.isRight = 3;
            this.notifyProgress();
        },
        /**
         * 补间动画
         */
        animation(
            element: HTMLDivElement, start: number, end: number, endHandle: Function) {
            const diff = start > end ? -1 : 1;
            let step = 1;
            let handle = setInterval(() => {
                start += (step ++) * diff;
                if ((diff > 0 && start >= end) || (diff < 0 && start <= end)) {
                    clearInterval(handle);
                    element.style.left = end + 'px';
                    endHandle();
                    return;
                }
                element.style.left = start + 'px';
            }, 16);
        },
        /**
         * 移动内容到另一个元素上
         */
        swapHtml(src: HTMLDivElement, dist: HTMLDivElement) {
            for (const item of dist.children) {
                dist.removeChild(item);
            }
            for (const item of src.children) {
                dist.appendChild(item);
            }
        },
        /**
         * 加载第几页的内容到元素上
         */
        applyPage(element: HTMLDivElement, page: number) {
            element.innerHTML = this.pager.toHtml(page, this.fontSize, this.lineSpace, this.letterSpace, this.width - 2 * this.left, this.height - 2* this.top, this.left, this.top);
        },
        /**
         * 更改了其他东西更改内容
         */
        refreshPage() {
            const old_count = this.pageCount;
            this.pageCount = this.pager.getPageCountWithSize(this.fontSize, this.lineSpace, this.letterSpace, this.width - 2 * this.left, this.height - 2* this.top);
            if (old_count > 0 && this.pageCount !== old_count) {
                this.page = Math.floor(this.page * this.pageCount / old_count); // 按比例复原当前页
                this.notifyProgress();
            }
            if (this.page < 1) {
                this.page = 1;
            } else if (this.page > this.pageCount) {
                this.page = this.pageCount;
            }
            this.applyPage(this.$refs.currentPage, this.page);
        },
        /**
         * 通知进度
         */
        notifyProgress() {
            this.$emit('progress', {
                page: this.page,
                count: this.pageCount,
                progress: Math.ceil(this.page * 100 / this.pageCount)
            });
        },
        /**
         * 跳转到第几页（无动画）
         */
        goPager(page: number) {
            this.page = page;
            this.refreshPage();
        },
        /**
         * 根据百分比的进度跳转页面
         */
        goProgress(progress: number) {
            this.goPager(Math.floor(progress * this.pageCount / 100));
        },
        /**
         * 直接切换到上一页
         */
        goPrev() {
            if (!this.readyPrev()) {
                return false;
            }
            this.animation(this.$refs.prevPage, -this.width, 0, () => {
                this.applyPrev();
            });
        },
        /**
         * 直接切换到下一页
         */
        goNext() {
            if (!this.readyNext()) {
                return false;
            }
            this.animation(this.$refs.currentPage, 0, - this.width, () => {
                this.applyNext();
            });
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
    .prev-page {
        left: -110%;
        z-index: 3;
    }
    .current-page {
        z-index: 2;
    }
    .next-page {
        z-index: 1;
    }
}
</style>



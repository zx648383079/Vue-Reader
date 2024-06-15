<template>
    <div>
        <div :class="['pager', font]" @touchstart="touchstart" @touchmove="touchmove" @touchend="touchend" :style="{color: color, 'font-size': fontsize + 'px '}">
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
import { Vue, Prop } from 'vue-property-decorator'
import { Pager } from '@/utils/pager';

export default class ReadPager extends Vue {
    public pager = new Pager('');

    public page = 1;
    public pageCount = 0;
    public startX = 0; //  开始的滑动位置
    public isSilde = false; // 记录是否是滑动事件
    public isRight = 0; // 记录一开始滑动的方向 0 未设置 1 右滑动 2 左滑动 3 已完成切换
    @Prop({type: Number, default: 0}) public readonly width!: number;
    @Prop({type: Number, default: 0}) public readonly height!: number;
    @Prop({type: Number, default: 18}) public readonly fontsize!: number;
    @Prop({type: Number, default: 10}) public readonly linespace!: number;
    @Prop({type: Number, default: 4}) public readonly letterspace!: number;
    @Prop({type: Number, default: 10}) public readonly left!: number;
    @Prop({type: Number, default: 10}) public readonly top!: number;
    @Prop({type: String, default: '#333'}) public readonly color!: string;
    @Prop(String) public readonly font!: string;
    @Prop(String) public readonly theme!: string;

    public getWidth() {
        if (this.width < 1) {
            return (this.$parent as any).width;
        }
        return this.width;
    }
    public getHeight() {
        if (this.height < 1) {
            return (this.$parent as any).height;
        }
        return this.height;
    }

    public isToRight() {
        return this.isRight === 1;
    }
    public isToLeft() {
        return this.isRight === 2;
    }
    public refreshPager(text: string) {
        this.pager = new Pager(text);
    }
    public tapIfClick(x: number, y: number) {
        const centerX = this.getWidth() / 2;
        if (Math.abs(centerX  - x) < 50 && Math.abs(this.getHeight() / 2 - y) < 50) {
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
    }
    public touchstart(e: TouchEvent) {
        this.startX = e.targetTouches[0].clientX;
        this.isRight = 0;
        this.isSilde = false;
    }
    public touchmove(e: TouchEvent) {
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
        if (Math.abs(diff) > this.getWidth()) {
            this.isToRight() ? this.applyNext() : this.applyPrev();
            return;
        }
        if (this.isToRight()) {
            (this.$refs.currentPage as HTMLDivElement).style.left = diff + 'px';
            return;
        }
        (this.$refs.prevPage as HTMLDivElement).style.left = diff - this.getWidth() + 'px';
    }
    public touchend(e: TouchEvent) {
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
            this.animation(this.$refs.currentPage  as HTMLDivElement, diff, - this.getWidth(), () => {
                this.applyNext();
            });
            return;
        }
        this.animation(this.$refs.prevPage as HTMLDivElement, diff - this.getWidth(), 0, () => {
            this.applyPrev();
        });
    }
    /**
     * 根据滑动方向准备内容
     */
    public readyPage() {
        if (this.isToRight()) {
            return this.readyNext();
        }
        return this.readyPrev();
    }
    /**
     * 准备上一页的内容
     */
    public readyPrev() {
        if (this.page < 2) {
            this.isRight = 3;
            this.$emit('prev');
            return false;
        }
        this.applyPage(this.$refs.prevPage as HTMLDivElement, this.page - 1);
        return true;
    }
    /**
     * 准备下一页的内容
     */
    public readyNext() {
        if (this.page >= this.pageCount) {
            this.$emit('next');
            return false;
        }
        this.applyPage(this.$refs.nextPage as HTMLDivElement, this.page + 1);
        return true;
    }
    /**
     * 动画执行完成，把内容放到正确的元素上，并把其他元素移开
     */
    public applyNext() {
        this.page ++;
        this.swapHtml(this.$refs.nextPage as HTMLDivElement, this.$refs.currentPage as HTMLDivElement);
        (this.$refs.currentPage as HTMLDivElement).style.left = '0px';
        this.isRight = 3;
        this.notifyProgress();
    }
    /**
     * 动画执行完成，把内容放到正确的元素上，并把其他元素移开
     */
    public applyPrev() {
        this.page --;
        this.swapHtml(this.$refs.prevPage as HTMLDivElement, this.$refs.currentPage as HTMLDivElement);
        (this.$refs.prevPage as HTMLDivElement).style.left = - this.getWidth() * 1.1 + 'px';
        this.isRight = 3;
        this.notifyProgress();
    }
    /**
     * 补间动画
     */
    public animation(
        element: HTMLDivElement, start: number, end: number, endHandle: () => void) {
        const diff = start > end ? -1 : 1;
        let step = 1;
        const handle = setInterval(() => {
            start += (step ++) * diff;
            if ((diff > 0 && start >= end) || (diff < 0 && start <= end)) {
                clearInterval(handle);
                element.style.left = end + 'px';
                endHandle();
                return;
            }
            element.style.left = start + 'px';
        }, 16);
    }
    /**
     * 移动内容到另一个元素上
     */
    public swapHtml(src: HTMLDivElement, dist: HTMLDivElement) {
        for (const item of dist.children) {
            dist.removeChild(item);
        }
        for (const item of src.children) {
            dist.appendChild(item);
        }
    }
    /**
     * 加载第几页的内容到元素上
     */
    public applyPage(element: HTMLDivElement, page: number) {
        element.innerHTML = this.pager.toHtml(page, this.fontsize,
        this.linespace, this.letterspace,
        this.getWidth() - 2 * this.left,
        this.getHeight() - 2 * this.top, this.left, this.top);
    }
    /**
     * 更改了其他东西更改内容
     */
    public refreshPage() {
        const oldCount = this.pageCount;
        this.pageCount = this.pager.getPageCountWithSize(this.fontsize,
        this.linespace, this.letterspace, this.getWidth() - 2 * this.left,
        this.getHeight() - 2 * this.top);
        if (oldCount > 0 && this.pageCount !== oldCount) {
            this.page = Math.floor(this.page * this.pageCount / oldCount); // 按比例复原当前页
            this.notifyProgress();
        }
        if (this.page < 1) {
            this.page = 1;
        } else if (this.pageCount > 0 && this.page > this.pageCount) {
            this.page = this.pageCount;
        }
        this.applyPage(this.$refs.currentPage as HTMLDivElement, this.page);
    }
    /**
     * 通知进度
     */
    public notifyProgress() {
        this.$emit('progress', {
            page: this.page,
            count: this.pageCount,
            progress: Math.ceil(this.page * 100 / this.pageCount),
        });
    }
    /**
     * 跳转到第几页（无动画）
     */
    public goPager(page: number) {
        this.page = page;
        this.refreshPage();
    }
    /**
     * 根据百分比的进度跳转页面
     */
    public goProgress(progress: number) {
        this.goPager(Math.floor(progress * this.pageCount / 100));
    }
    /**
     * 直接切换到上一页
     */
    public goPrev() {
        if (!this.readyPrev()) {
            return false;
        }
        this.animation(this.$refs.prevPage as HTMLDivElement, -this.getWidth(), 0, () => {
            this.applyPrev();
        });
    }
    /**
     * 直接切换到下一页
     */
    public goNext() {
        if (!this.readyNext()) {
            return false;
        }
        this.animation(this.$refs.currentPage as HTMLDivElement, 0, - this.getWidth(), () => {
            this.applyNext();
        });
    }
}
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



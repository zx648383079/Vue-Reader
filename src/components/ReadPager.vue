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
<script lang="ts" setup>
import { Pager } from '@/utils/pager';
import { getCurrentInstance, reactive, ref } from 'vue';

const emit = defineEmits(['middle', 'prev', 'next', 'progress']);
const props = withDefaults(defineProps<{
    width: number;
    height: number;
    fontsize: number;
    linespace: number;
    letterspace: number;
    left: number;
    top: number;
    color: string;
    font: string;
    theme: string;
}>(), {
    width: 0,
    height: 0,
    fontsize: 18,
    linespace: 10,
    letterspace: 4,
    left: 10,
    top: 10,
    color: '#333'
});
let pager = new Pager('');
const prevPage = ref<HTMLDivElement>();
const currentPage = ref<HTMLDivElement>();
const nextPage = ref<HTMLDivElement>();
const input = reactive({
    page: 1,
    pageCount: 0,
    startX: 0,//  开始的滑动位置
    isSilde: false, // 记录是否是滑动事件
    isRight: 0 // 记录一开始滑动的方向 0 未设置 1 右滑动 2 左滑动 3 已完成切换
});
const instance = getCurrentInstance();

function getWidth() {
    if (props.width < 1) {
        return (instance?.parent as any).width;
    }
    return props.width;
}
function getHeight() {
    if (props.height < 1) {
        return (instance?.parent as any).height;
    }
    return props.height;
}

function isToRight() {
    return input.isRight === 1;
}
function isToLeft() {
    return input.isRight === 2;
}
function refreshPager(text: string) {
    pager = new Pager(text);
}
function tapIfClick(x: number, y: number) {
    const centerX = getWidth() / 2;
    if (Math.abs(centerX  - x) < 50 && Math.abs(getHeight() / 2 - y) < 50) {
        // 点击中间，触发设置
        emit('middle');
        return;
    }
    emit('middle', false);
    if (centerX > x) {
        // 上一页
        goPrev();
        return;
    }
    goNext();
}
function touchstart(e: TouchEvent) {
    input.startX = e.targetTouches[0].clientX;
    input.isRight = 0;
    input.isSilde = false;
}
function touchmove(e: TouchEvent) {
    input.isSilde = true;
    emit('middle', false);
    if (input.isRight === 3) {
        return;
    }
    const diff = e.targetTouches[0].clientX - input.startX;
    if (input.isRight === 0) {
        input.isRight = diff < 0 ? 1 : 2;
        if (!readyPage()) {
            return;
        }
    } else if (
        (isToRight() && diff > 0)
        || (isToLeft() && diff < 0)
    ) {
        return;
    }
    if (Math.abs(diff) > getWidth()) {
        isToRight() ? applyNext() : applyPrev();
        return;
    }
    if (isToRight()) {
        currentPage.value!.style.left = diff + 'px';
        return;
    }
    prevPage.value!.style.left = diff - getWidth() + 'px';
}
function touchend(e: TouchEvent) {
    if (!input.isSilde) {
        tapIfClick(input.startX, e.changedTouches[0].clientY);
        return;
    }
    if (input.isRight !== 1 && input.isRight !== 2) {
        return;
    }
    const diff = e.changedTouches[0].clientX - input.startX;
    if (
        (isToRight() && diff > 0)
        || (isToLeft() && diff < 0)
    ) {
        return;
    }
    if (isToRight()) {
        animation(currentPage.value!, diff, - getWidth(), () => {
            applyNext();
        });
        return;
    }
    animation(prevPage.value!, diff - getWidth(), 0, () => {
        applyPrev();
    });
}
/**
 * 根据滑动方向准备内容
 */
function readyPage() {
    if (isToRight()) {
        return readyNext();
    }
    return readyPrev();
}
/**
 * 准备上一页的内容
 */
function readyPrev() {
    if (input.page < 2) {
        input.isRight = 3;
        emit('prev');
        return false;
    }
    applyPage(prevPage.value!, input.page - 1);
    return true;
}
/**
 * 准备下一页的内容
 */
function readyNext() {
    if (input.page >= input.pageCount) {
        emit('next');
        return false;
    }
    applyPage(nextPage.value!, input.page + 1);
    return true;
}
/**
 * 动画执行完成，把内容放到正确的元素上，并把其他元素移开
 */
function applyNext() {
    input.page ++;
    swapHtml(nextPage.value!, currentPage.value!);
    currentPage.value!.style.left = '0px';
    input.isRight = 3;
    notifyProgress();
}
/**
 * 动画执行完成，把内容放到正确的元素上，并把其他元素移开
 */
function applyPrev() {
    input.page --;
    swapHtml(prevPage.value!, currentPage.value!);
    prevPage.value!.style.left = - getWidth() * 1.1 + 'px';
    input.isRight = 3;
    notifyProgress();
}
/**
 * 补间动画
 */
function animation(
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
function swapHtml(src: HTMLDivElement, dist: HTMLDivElement) {
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
function applyPage(element: HTMLDivElement, page: number) {
    element.innerHTML = pager.toHtml(page, props.fontsize,
    props.linespace, props.letterspace,
    getWidth() - 2 * props.left,
    getHeight() - 2 * props.top, props.left, props.top);
}
/**
 * 更改了其他东西更改内容
 */
function refreshPage() {
    const oldCount = input.pageCount;
    input.pageCount = pager.getPageCountWithSize(props.fontsize,
    props.linespace, props.letterspace, getWidth() - 2 * props.left,
    getHeight() - 2 * props.top);
    if (oldCount > 0 && input.pageCount !== oldCount) {
        input.page = Math.floor(input.page * input.pageCount / oldCount); // 按比例复原当前页
        notifyProgress();
    }
    if (input.page < 1) {
        input.page = 1;
    } else if (input.pageCount > 0 && input.page > input.pageCount) {
        input.page = input.pageCount;
    }
    applyPage(currentPage.value!, input.page);
}
/**
 * 通知进度
 */
function notifyProgress() {
    emit('progress', {
        page: input.page,
        count: input.pageCount,
        progress: Math.ceil(input.page * 100 / input.pageCount),
    });
}
/**
 * 跳转到第几页（无动画）
 */
function goPager(page: number) {
    input.page = page;
    refreshPage();
}
/**
 * 根据百分比的进度跳转页面
 */
function goProgress(progress: number) {
    goPager(Math.floor(progress * input.pageCount / 100));
}
/**
 * 直接切换到上一页
 */
function goPrev() {
    if (!readyPrev()) {
        return false;
    }
    animation(prevPage.value!, -getWidth(), 0, () => {
        applyPrev();
    });
}
/**
 * 直接切换到下一页
 */
function goNext() {
    if (!readyNext()) {
        return false;
    }
    animation(currentPage.value!, 0, - getWidth(), () => {
        applyNext();
    });
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



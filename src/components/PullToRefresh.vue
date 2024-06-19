<template>
    <div class="pull-to-refresh-scroll" 
        ref="pullScroll"
        @touchstart="touchStart" 
        @touchmove="touchMove" 
        @touchend="touchEnd">
        <div class="scroll-top" :style="{height: input.topHeight + 'px'}">
            <slot name="top">
                <div v-if="input.state == ESTATE.PULL">
                    <i class="iconfont icon-arrow-down"></i>
                    下拉刷新
                </div>
                 <div v-if="input.state == ESTATE.PULLED">
                    <i class="iconfont icon-arrow-up"></i>
                    松开刷新
                </div>
                <div v-if="input.state == ESTATE.REFRESHING">
                    <i class="iconfont icon-refresh"></i>
                    刷新中
                </div>
                 <div v-if="input.state == ESTATE.REFRESHED">
                    <i class="iconfont icon-check"></i>
                    刷新完成
                </div>
                <div v-if="input.state == ESTATE.CANCEL">
                    <i class="iconfont icon-arrow-up"></i>
                    停止刷新
                </div>
            </slot>
        </div>
        <div class="scroll-body">
            <slot></slot>
        </div>
        <div class="scroll-bottom">
            <slot name="bottom">
                <div v-if="input.state == ESTATE.MORE">
                    <i class="iconfont icon-refresh"></i>
                    加载更多
                </div>
                 <div v-if="input.state == ESTATE.LOADING">
                    <i class="iconfont icon-check"></i>
                    加载中
                </div>
                <div v-if="input.state == ESTATE.LOADED">
                    <i class="iconfont icon-arrow-up"></i>
                    加载完成
                </div>
            </slot>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'

enum ESTATE {
    NONE = 0,
    PULL = 1,
    PULLED = 2,
    CANCEL = 3,
    REFRESHING = 4,
    REFRESHED = 5,
    MORE = 6,
    LOADING = 7,
    LOADED = 8,
}

enum EDIRECTION {
    NONE = 0,
    DOWN = 1,
    UP = 2,
}

const emit = defineEmits(['change', 'top.height.change', 'more', 'refresh']);
const props = withDefaults(defineProps<{
    refresh?: boolean,
    more?: boolean,
    loading?: boolean,
    distance?: number;
    maxHeight?: number;
}>(), {
    refresh: true,
    more: true,
    loading: false,
    distance: 10,
    maxHeight: 100,
});

const input = reactive({
    state: ESTATE.NONE,
    startY: 0,
    startUp: EDIRECTION.NONE, // 一开始滑动的方向
    scrollTop: 0,
    topHeight: 0,
});

const pullScroll = ref<HTMLDivElement>();


watch(() => input.state, (val: ESTATE, oldVal: ESTATE) => {
    emit('change', val, oldVal);
});
watch(() => props.more, (val: boolean) => {
    if (!val && input.state === ESTATE.MORE) {
        input.state = ESTATE.NONE;
    }
});
watch(() => input.topHeight, (val: number, oldVal: number) => {
    emit('top.height.change', val, oldVal);
});
watch(() => props.loading, (val: boolean, oldVal: boolean) => {
    if (val && !oldVal) {
        if (input.state === ESTATE.PULLED) {
            input.state =  ESTATE.REFRESHING;
            return;
        }
        if (input.state === ESTATE.MORE) {
            input.state =  ESTATE.LOADING;
            return;
        }
    }

    if (oldVal && !val) {
        if (input.state === ESTATE.LOADING) {
            input.state = ESTATE.LOADED;
            reset();
            return;
        }
        if (input.state === ESTATE.REFRESHING) {
            input.state = ESTATE.REFRESHED;
            reset();
            return;
        }
        if (input.state === ESTATE.MORE) {
            input.state =  ESTATE.NONE;
            return;
        }
    }
});

onMounted(() => {
    window.addEventListener('scroll', onScroll)
});

onUnmounted(() => {
    window.removeEventListener('scroll', onScroll);
});

function onScroll() {
    if (!props.more) {
        return;
    }
    if (getScrollBottomHeight() > props.distance) {
        return;
    }
    input.state = ESTATE.MORE;
    emit('more');
}
function touchStart(event: TouchEvent) {
    if (input.scrollTop > 0) {
        return;
    }
    input.startY = event.targetTouches[0].pageY;
    input.startUp = EDIRECTION.NONE;
}
function touchMove(event: TouchEvent) {
    if (input.scrollTop > 0 && input.state === ESTATE.NONE) {
        return;
    }
    const diff = event.changedTouches[0].pageY - input.startY;
    if (input.startUp === EDIRECTION.NONE) {
        input.startUp = diff > 0 ? EDIRECTION.DOWN : EDIRECTION.UP;
    }
    // 进行滑动操作
    if (input.startUp === EDIRECTION.DOWN) {
        if (input.state === ESTATE.NONE && diff > 0) {
            input.state = ESTATE.PULL;
        }
        if (input.state === ESTATE.PULL && diff >= props.maxHeight) {
            input.state = ESTATE.PULLED;
        }
        if (input.state === ESTATE.PULLED && diff < props.maxHeight) {
            input.state = ESTATE.CANCEL;
        }
        if (input.state === ESTATE.PULL) {
            input.topHeight = diff;
        }
    }
    // 上拉加载更多
    if (input.startUp === EDIRECTION.UP && props.more) {
        input.state = Math.abs(diff) > props.distance ? ESTATE.MORE : ESTATE.NONE;
    }
}
function touchEnd() {
    if (input.scrollTop > 0) {
        return;
    }
    // const diff = event.changedTouches[0].pageY - input.startY;
    if (input.state === ESTATE.PULL || input.state === ESTATE.CANCEL) {
        input.state = ESTATE.NONE;
        return;
    }
    if (input.state === ESTATE.PULLED) {
        emit('refresh');
        return;
    }
    if (input.state === ESTATE.MORE) {
        emit('more');
    }
}
function animation(
    start: number, end: number, endHandle?: () => void) {
    const diff = start > end ? -1 : 1;
    let step = 1;
    const handle = setInterval(() => {
        start += (step ++) * diff;
        if ((diff > 0 && start >= end) || (diff < 0 && start <= end)) {
            clearInterval(handle);
            input.topHeight = end;
            if (endHandle) {
                endHandle();
            }
            return;
        }
        input.topHeight = start;
    }, 16);
}
function reset() {
    animation(input.topHeight, 0, () => {
        input.state = ESTATE.NONE;
    });
}
// 滚动条到底部的距离
function getScrollBottomHeight() {
    input.scrollTop = getScrollTop();
    return getPageHeight() - input.scrollTop - getWindowHeight();
}
// 页面高度
function getPageHeight() {
    const box = document.querySelector('html');
    if (!box) {
        return 0;
    }
    return box.scrollHeight
}
// 滚动条顶 高度
function getScrollTop() {
    let scrollTop = 0;
    let bodyScrollTop = 0;
    let documentScrollTop = 0;
    if (document.body) {
        bodyScrollTop = document.body.scrollTop;
    }
    if (document.documentElement) {
        documentScrollTop = document.documentElement.scrollTop;
    }
    scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
    return scrollTop;
}
function getWindowHeight() {
    let windowHeight = 0;
    if (document.compatMode === 'CSS1Compat') {
        windowHeight = document.documentElement.clientHeight;
    } else {
        windowHeight = document.body.clientHeight;
    }
    return windowHeight;
}

</script>
<style lang="scss">
.pull-to-refresh-scroll {
    min-height: 300px;
    .scroll-bottom,
    .scroll-top {
        text-align: center;
    }
    .scroll-top {
        position: relative;
        div {
            position: absolute;
            bottom: 10px;
            width: 100%;
        }
    }
}

</style>

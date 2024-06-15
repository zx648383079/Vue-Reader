<template>
    <div class="slider-box">
        <header>
            <span>目录</span>
            <a class="right" @click="tapSort" v-if="!isSort">
                <i class="fa fa-arrow-up"></i>
                正序
            </a>
            <a class="right" @click="tapSort" v-else>
                <i class="fa fa-arrow-down"></i>
                倒序
            </a>
        </header>
        <div class="box">
            <div v-for="item in items" :key="item.id" :class="['item', item.id == chapter ? 'active' : '']" @click="tapChapter(item)">
                <div class="title">{{ item.title }}</div>
                <div class="size">{{ item.size }}</div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Prop } from 'vue-property-decorator';
import { IChapter } from '../api/book';
import { dispatchChapters } from '@/store/dispatches';

export default class SliderMenu extends Vue {
    public items?: IChapter[] = [];
    public isSort = false;
    @Prop(Number) public readonly chapter!: number;


    public refresh(book: number) {
        dispatchChapters(book).then(res => {
            this.items = res;
        });
    }

    public tapChapter(item: IChapter) {
        this.$emit('read', item);
    }

    public tapSort() {
        this.isSort = !this.isSort;
        if (this.items) {
            this.items.reverse();
        }
    }
}
</script>

<style lang="scss" scoped>
.slider-box {
    z-index: 999;
    position: fixed;
    width: 62%;
    background-color: #fff;
    top: 0;
    bottom: 0;
    header {
        line-height: 2.75rem;
        background-color: #ccc;
        color: #fff;
        text-align: center;
        font-weight: 700;
        position: absolute;
        width: 100%;
        z-index: 99;
    }
}
.box {
    background-color: #fff;
    overflow-y: auto;
    height: 100%;
    padding-top: 2.75rem;
    .item {
        margin: 0 10px;
        padding: 5px 0;
        position: relative;
        .title {
            line-height: 30px;
            font-weight: 300;
            font-size: 14px;
            margin-right: 30px;
        }
        .size {
            font-size: 12px;
            color: #767676;
            position: absolute;
            right: 10px;
            top: 12px;
        }
        &.active {
            .title {
                color: #f00;
                font-weight: 600;
            }
        }
        &:not(:last-of-type) {
            border-bottom: 1px solid #ccc;
        }
    }
}
.right {
    top: 0;
    position: absolute;
    right: 0.625rem;
    font-size: 13px;
    font-weight: 300;
}
</style>

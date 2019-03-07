<template>
    <div>
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
import { Vue, Component, Prop } from 'vue-property-decorator';
import { IChapter, getChapters } from '../api/book';
import { dispatchChapters } from '@/store/dispatches';

@Component
export default class SliderMenu extends Vue {
    items?: IChapter[] = [];
    isSort: boolean = false;
    @Prop(Number) book?: number;
    @Prop(Number) chapter?: number;

    created() {
        dispatchChapters(this.book).then(res => {
            this.items = res;
        });
    }

    tapChapter(item: IChapter) {
        this.$emit('read', item);
    }

    tapSort() {
        this.isSort = !this.isSort;
        if (this.items) {
            this.items.reverse();
        }
    }
}
</script>

<style lang="scss" scoped>
.box {
    margin-top: 2.75rem;
    background-color: #fff;
    .item {
        margin: 0 10px;
        padding: 5px 0 10px;
        .title {
            line-height: 30px;
            font-weight: 600;
        }
        .size {
            font-size: 12px;
            color: #767676;
            float: right;
        }
        &.active {
            .title {
                color: #f00;
            }
        }
        &:not(:last-of-type) {
            border-bottom: 1px solid #ccc;
        }
    }
}
.right {
    top: 50%;
    margin-top: -.7rem;
    position: absolute;
    right: 0.625rem;
}
</style>

<template>
    <div>
        <BackHeader title="目录">
            <a class="right" @click="tapSort" v-if="!isSort">
                <i class="iconfont icon-arrow-up"></i>
                正序
            </a>
            <a class="right" @click="tapSort" v-else>
                <i class="iconfont icon-arrow-down"></i>
                倒序
            </a>
        </BackHeader>

        <div class="box">
            <div v-for="item in items" :key="item.id" @click="tapChapter(item)" :class="['item', activeChapter == item.id ? 'active' : '']">
                <div class="title">{{ item.title }}</div>
                <div class="time">{{ item.created_at }}</div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import type { IChapter } from '@/api/model';
import BackHeader from '@/components/BackHeader.vue';
import { useBook } from '@/services';
import { useBookStore } from '@/stores/book';
import { parseNumber } from '@/utils';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const book = useBook();
const store = useBookStore();
const items = ref<IChapter[]>([]);
const isSort = ref(false);
const activeChapter = ref(0);

function tapChapter(item: IChapter) {
    router.push('/read/' + item.id);
}

function tapSort() {
    isSort.value = !isSort.value;
    if (items.value) {
        items.value.reverse();
    }
}

onMounted(() => {
    const bookId = parseNumber(route.params.book);
    if (!bookId) {
        return;
    }
    store.getChapters(bookId).then(res => {
        items.value = res;
    });
    const record = book.getItem(bookId);
    if (record) {
        activeChapter.value = record.chapter_id;
    }
});
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
        .time {
            font-size: 12px;
            color: #767676;
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


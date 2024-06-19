<template>
    <div>
        <BackHeader :title="input.title"></BackHeader>
        <div class="has-header">
            <div class="tab-header">
                <a v-for="(item, index) in tabItems" :key="index" :class="input.activeTab == index ? 'active': ''" @click="tapTab(index)">{{ item.name }}</a>
            </div>
            <PullToRefresh class="box" @more="loadMore" @refresh="refresh">
                <BookItem v-for="(item, index) in items" :key="index" :book="item"></BookItem>
            </PullToRefresh>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { getBookList } from '@/api/book';
import type { IBook } from '@/api/model';
import BackHeader from '@/components/BackHeader.vue';
import BookItem from '@/components/BookItem.vue';
import PullToRefresh from '@/components/PullToRefresh.vue';
import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const tabItems = [
    {
        name: '总榜',
        key: 'all',
    },
    {
        name: '月榜',
        key: 'month',
    },
    {
        name: '周榜',
        key: 'week',
    },
];

const input = reactive({
    activeTab: 0,
    category: 0,
    title: '分类榜单',
    hasMore: true,
    page: 1,
    isLoading: false
});
const items = ref<IBook[]>([]);

function tapTab(index: number) {
    input.activeTab = index;
    refresh();
}

function loadMore() {
    goPage( ++ input.page);
}

/**
 * refresh
 */
function refresh() {
    items.value = [];
    input.isLoading = false;
    input.hasMore = true;
    goPage(input.page = 1);
}

function goPage(page: number) {
    if (input.isLoading || !input.hasMore) {
        return;
    }
    input.isLoading = true;
    getBookList({
        category: input.category,
        top: tabItems[input.activeTab].key,
        page,
    }).then(res => {
        input.hasMore = res.paging.more;
        input.isLoading = false;
        res.data.forEach((item: IBook) => {
            items.value.push(item);
        });
    })
}

input.category = parseInt(route.query.category + '', 10);
input.title = route.meta.title = route.query.title + '榜单';
refresh();

</script>
<style lang="scss" scoped>
.tab-header {
    display: flex;
    justify-content: space-around;
    flex-flow: row nowrap;
    line-height: 3rem;
    height: 3rem;
    position: static;
    background: #f04e49;
    border: none;
    color: #fff;
    font-weight: 300;
    padding-bottom: 5px;
    a {
        // display: block;
        // width: 33.33%;
        text-align: center;
        &.active {
            border-bottom: 5px solid #fff;
            font-weight: 700;
        }
    }
}
</style>



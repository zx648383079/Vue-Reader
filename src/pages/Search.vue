<template>
    <div>
        <SearchBar :value="input.keywords" @input="updateVal" @focus="tapFocusSearch" @search="tapSearch"></SearchBar>

        <div class="has-header" v-show="!input.isSearch">
            <PullToRefresh class="box" @more="loadMore">
                <BookItem v-for="(item, index) in items" :key="index" :book="item"></BookItem>
            </PullToRefresh>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { getBookList } from '@/api/book';
import type { IBook, ICategory } from '@/api/model';
import BookItem from '@/components/BookItem.vue';
import SearchBar from '@/components/SearchBar.vue';
import PullToRefresh from '@/components/PullToRefresh.vue';
import { reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const input = reactive({
    isSearch: true,
    keywords: '',
    category: 0,
    author: 0,
    hasMore: true,
    page: 1,
    isLoading: false
});

const categories = ref<ICategory[]>([]);
const items = ref<IBook[]>([]);


input.isSearch = Object.keys(route.query).length === 0;
if (!input.isSearch) {
    input.category = parseInt(route.query.category + '', 10);
    input.author = parseInt(route.query.author + '', 10);
    input.keywords = route.query.keywords + '';
}
// getCategories().then(res => {
//     categories.value = res.data;
// });
refresh();

function tapFocusSearch() {
    input.isSearch = true;
}

function updateVal(val: string) {
    input.keywords = val;
    if (!val || val.length < 1) {
        input.isSearch = true;
    }
}

function tapCategory(item: ICategory) {
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
        keywords: input.keywords,
        category: input.category,
        author: input.author,
        page,
    }).then(res => {
        input.hasMore = res.paging.more;
        input.isLoading = false;
        res.data.forEach((item: IBook) => {
            items.value.push(item);
        });
    })
}

function tapSearch(keywords: string) {
    input.keywords = keywords
    input.isSearch = false
    // searchRusult();
}

function tapEnterSearch() {
    input.keywords = input.keywords
    input.isSearch = true
}

function tapNewSearch() {
    input.keywords = input.keywords = ''
    input.isSearch = true
}
</script>
<style lang="scss" scoped>
.box {
    border-top: 10px solid #f4f4f4;
}
</style>


<template>
    <div>
        <SearchBar :value="keywords" @input="updateVal" @focus="tapFocusSearch" @search="tapSearch"></SearchBar>

        <div class="has-header" v-show="!isSearch">
            <div class="box"
                v-infinite-scroll="loadMore"
                infinite-scroll-disabled="isLoading"
                infinite-scroll-distance="10">
                <BookItem v-for="(item, index) in items" :key="index" :book="item"></BookItem>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import { ICategory, getCategories, IBook, getBookList } from '../api/book';
import BookItem from '@/components/BookItem.vue';
import SearchBar from '@/components/SearchBar.vue';
import { InfiniteScroll } from 'mint-ui';

@Options({
  components: {
    BookItem,
    SearchBar,
  },
})
export default class Search extends Vue {

    public isSearch = true;
    public keywords = '';
    public category?: number;
    public author?: number;
    public categories?: ICategory[] = [];
    public items: IBook[] = [];
    public hasMore = true;
    public page = 1;
    public isLoading = false;

    public created() {
        this.isSearch = Object.keys(this.$route.query).length === 0;
        if (!this.isSearch) {
            this.category = parseInt(this.$route.query.category + '', 10);
            this.author = parseInt(this.$route.query.author + '', 10);
            this.keywords = this.$route.query.keywords + '';
        }
        // getCategories().then(res => {
        //     this.categories = res.data;
        // });
        this.refresh();
    }

    public tapFocusSearch() {
        this.isSearch = true;
    }

    public updateVal(val: string) {
        this.keywords = val;
        if (!val || val.length < 1) {
            this.isSearch = true;
        }
    }

    public tapCategory(item: ICategory) {
        // 
    }

    public loadMore() {
        this.goPage( ++ this.page);
    }

    /**
     * refresh
     */
    public refresh() {
        this.items = [];
        this.isLoading = false;
        this.hasMore = true;
        this.goPage(this.page = 1);
    }

    public goPage(page: number) {
        if (this.isLoading || !this.hasMore) {
            return;
        }
        this.isLoading = true;
        getBookList({
            keywords: this.keywords,
            category: this.category,
            author: this.author,
            page,
        }).then(res => {
            this.hasMore = res.paging.more;
            this.isLoading = false;
            res.data.forEach((item: IBook) => {
                this.items.push(item);
            });
        })
    }

    public tapSearch(keywords: string) {
        this.keywords = keywords
        this.isSearch = false
        // this.searchRusult();
    }

    public tapEnterSearch() {
        this.keywords = this.keywords
        this.isSearch = true
    }

    public tapNewSearch() {
        this.keywords = this.keywords = ''
        this.isSearch = true
    }

}
</script>
<style lang="scss" scoped>
.box {
    border-top: 10px solid #f4f4f4;
}
</style>


<template>
    <div>
        <SearchBar :value="keywords" @input="updateVal" @focus="tapFocusSearch" @search="tapSearch"></SearchBar>

        <div class="has-header" v-show="!isSearch">
            <div class="box"
                v-infinite-scroll="loadMore"
                infinite-scroll-disabled="is_loading"
                infinite-scroll-distance="10">
                <BookItem v-for="(item, index) in items" :key="index" :book="item"></BookItem>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { ICategory, getCategories, IBook, getBookList } from '../api/book';
import BookItem from '@/components/BookItem.vue';
import SearchBar from '@/components/SearchBar.vue';
import { InfiniteScroll } from 'mint-ui';

Vue.use(InfiniteScroll);

@Component({
  components: {
    BookItem,
    SearchBar,
  },
})
export default class Search extends Vue {

    isSearch: boolean = true;
    keywords: string = '';
    category?: number;
    author?: number;
    categories?: ICategory[] = [];
    items: IBook[] = [];
    has_more = true;
    page = 1;
    is_loading = false;
    
    created() {
        this.isSearch = Object.keys(this.$route.query).length == 0;
        if (!this.isSearch) {
            this.category = this.$route.query.category;
            this.author = this.$route.query.author;
            this.keywords = this.$route.query.keywords + '';
        }
        // getCategories().then(res => {
        //     this.categories = res.data;
        // });
        this.refresh();
    }

    tapFocusSearch() {
        this.isSearch = true;
    }

    updateVal(val: string) {
        this.keywords = val;
        if (!val || val.length < 1) {
            this.isSearch = true;
        }
    }

    public tapCategory(item: ICategory) {
    }

    public loadMore() {
        this.goPage( ++ this.page);
    }

    /**
     * refresh
     */
    public refresh() {
        this.items = [];
        this.is_loading = false;
        this.has_more = true;
        this.goPage(this.page = 1);
    }

    public goPage(page: number) {
        if (this.is_loading || !this.has_more) {
            return;
        }
        this.is_loading = true;
        getBookList({
            keywords: this.keywords,
            category: this.category,
            author: this.author,
            page,
        }).then(res => {
            this.has_more = res.paging.more;
            this.is_loading = false;
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


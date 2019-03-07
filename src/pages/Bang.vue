<template>
    <div>
        <BackHeader :title="title"></BackHeader>
        <div class="has-header">
            <div class="tab-header">
                <a v-for="(item, index) in tabs" :key="index" :class="activeTab == index ? 'active': ''" @click="tapTab(index)"></a>
            </div>
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
import BackHeader from '@/components/BackHeader.vue';
import BookItem from '@/components/BookItem.vue';
import { InfiniteScroll } from 'mint-ui';
import { IBook, getBookList } from '@/api/book';

Vue.use(InfiniteScroll);

@Component({
  components: {
    BackHeader,
    BookItem,
  },
})
export default class Bang extends Vue {
    tabs: any[] = [
        {
            name: '总榜',
            key: 'all'
        },
        {
            name: '月榜',
            key: 'all'
        },
        {
            name: '周榜',
            key: 'all'
        }
    ];
    activeTab: number = 0;
    category: number = 0;
    title: string = '分类榜单';
    items: IBook[] = [];
    has_more = true;
    page = 1;
    is_loading = false;

    created() {
        this.category = parseInt(this.$route.query.category);
        this.title = this.$route.meta.title = this.$route.query.title + '榜单';
        this.refresh();
    }

    tapTab(index: number) {
        this.activeTab = index;
        this.refresh();
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
            category: this.category,
            top: this.tabs[this.activeTab],
            page,
        }).then(res => {
            this.has_more = res.paging.more;
            this.is_loading = false;
            res.data.forEach((item: IBook) => {
                this.items.push(item);
            });
        })
    }
}
</script>


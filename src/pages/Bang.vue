<template>
    <div>
        <BackHeader :title="title"></BackHeader>
        <div class="has-header">
            <div class="tab-header">
                <a v-for="(item, index) in tabs" :key="index" :class="activeTab == index ? 'active': ''" @click="tapTab(index)">{{ item.name }}</a>
            </div>
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
    public tabs: any[] = [
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
    public activeTab: number = 0;
    public category: number = 0;
    public title: string = '分类榜单';
    public items: IBook[] = [];
    public hasMore = true;
    public page = 1;
    public isLoading = false;

    public created() {
        this.category = parseInt(this.$route.query.category + '', 10);
        this.title = this.$route.meta.title = this.$route.query.title + '榜单';
        this.refresh();
    }

    public tapTab(index: number) {
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
            category: this.category,
            top: this.tabs[this.activeTab].key,
            page,
        }).then(res => {
            this.hasMore = res.paging.more;
            this.isLoading = false;
            res.data.forEach((item: IBook) => {
                this.items.push(item);
            });
        })
    }
}
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



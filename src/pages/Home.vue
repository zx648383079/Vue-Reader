<template>
    <div>
        <div class="box" v-if="items && items.length > 0">
            <div class="book-item" v-for="(item, index) in items" :key="index" @click="tapBook(item)">
                <div class="cover">
                    <img :src="item.cover">
                </div>
                <div class="info">
                    <div class="name">{{ item.name }}</div>
                    <div class="tag">{{ item.author_name }}</div>
                    <div class="desc">{{ item.read_at | ago }}· {{ item.chapter_title }}</div>
                </div>
            </div>
        </div>
        <div class="empty" v-else>
          您的书架空空如也
        </div>
        <TabBar/>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TabBar from '@/components/TabBar.vue';
import Book,{ IBookRecord } from '@/utils/book';

@Component({
  components: {
    TabBar,
  },
})
export default class Home extends Vue {
    items?: IBookRecord[] = [];

    created() {
        this.items = Book.getItems();
    }

    tapBook(item: IBookRecord) {
        this.$router.push('/read/' + item.chapter_id);
    }
}
</script>
<style lang="scss" scoped>
.empty {
    font-size: 30px;
    color: #ccc;
    margin-top: 30vh;
    text-align: center;
}
.book-item {
    position: relative;
    height: 130px;
    overflow: hidden;
    background-color: #fff;
    padding: 10px;
    .cover {
        position: absolute;
        img {
            width: 85px;
            height: 110px;
        }
        .tip {
            position: absolute;
            bottom: 20px;
            text-align: center;
            color: #fff;
            width: 100%;
            font-size: 12px;
        }
    }
    .info {
        margin-left: 90px;
        .name {
            font-weight: 700;
            line-height: 30px;
        }
        .tag {
            color: #767676;
            line-height: 20px;
            font-size: 13px;
        }
        .desc {
            height: 60px;
            overflow: hidden;
            word-break: break-word;
            overflow-wrap: break-word;
            line-height: 20px;
        }
    }
    &:not(:last-of-type) {
        border-bottom: 1px solid #f4f4f4;
    }
}
</style>


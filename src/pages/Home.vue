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
</style>


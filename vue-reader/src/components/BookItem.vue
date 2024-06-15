<template>
    <div class="book-item" @click="tapBook()">
        <div class="cover">
            <img :src="book.cover">
            <div class="tip" v-if="book.click_count > 0">{{ formatSize(book.click_count) }}人气</div>
        </div>
        <div class="info">
            <div class="name">{{ book.name }}</div>
            <div class="tag">{{book.author?.name}}·{{ book.category?.name }}·{{ formatStatus(book.over_at) }}·{{ formatSize(book.size) }}字</div>
            <div class="desc">{{ book.description }}</div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Prop } from 'vue-property-decorator'
import {IBook} from '../api/book';
import { sizeFilter, statusFilter } from '../pipes';

export default class BookItem extends Vue {
    @Prop(Object) public readonly book!: IBook

    public formatSize(v: number) {
        return sizeFilter(v);
    }

    public formatStatus(v: number) {
        return statusFilter(v);
    }

    public tapBook() {
        this.$router.push('/book/' + this.book.id);
    }
}
</script>
<style lang="scss" scoped>
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


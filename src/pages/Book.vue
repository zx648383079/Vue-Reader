<template>
    <div>
        <header>
            <a class="back" @click="tapBack">
                <i class="fa fa-chevron-left" aria-hidden="true"></i>
            </a>
            <a class="more" href="">
                <i class="fa fa-ellipsis-h"></i>
            </a>
            <div class="cover">
                <img :src="book.cover" alt="">
            </div>
            <div class="name">{{ book.name }}</div>
            <div class="tag">
                <span v-if="book.author">{{book.author.name}}</span>
                ·
                <span v-if="book.category">{{ book.category.name }}</span>
            </div>
        </header>
        <div class="tab-bar">
            <a href="">
                <span>{{ book.size|size }}字</span>
                <span>{{ book.over_at | status }}</span>
            </a>
            <a href="">
                <span>{{ book.click_count|size }}</span>
                <span>点击</span>
            </a>
            <a href="">
                <span>{{ book.click_count|size }}</span>
                <span>点击</span>
            </a>
        </div>

        <mt-cell title="目录" label="连载至" :to="'/chapter/' + book.id" is-link></mt-cell>

        <footer>
            <a href="">
                <i class="fa fa-plus"></i>
                加入书架
            </a>
            <a href="">
                立即阅读
            </a>
        </footer>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { IBook, getBook } from '../api/book';
import {Cell} from 'mint-ui';

Vue.component(Cell.name, Cell);

@Component({})
export default class Book extends Vue {
    book?: IBook;

    created() {
        this.book = {
            id: parseInt(this.$route.params.id)
        };
        getBook(this.book.id).then(res => {
            this.book = res
        });
    }

    tapBack() {
        if (window.history.length <= 1) {
            this.$router.push('/');
            return;
        }
        this.$router.go(-1);
    }
}
</script>
<style lang="scss" scoped>

</style>


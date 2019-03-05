<template>
    <div class="book-item">
        <div class="cover">
            <img :src="book.cover">
            <div class="tip">{{ book.click_count | size }}人气</div>
        </div>
        <div class="info">
            <div class="name">{{ book.name }}</div>
            <div class="tag">{{book.author.name}}·{{ book.category.name }}·{{ book.over_at | status }}·{{ book.size | size }}字</div>
            <div class="desc">{{ book.description }}</div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import {IBook} from '../api/book';

@Component
export default class BookItem extends Vue {
  @Prop(Object) readonly book!: IBook

}
</script>
<style lang="scss" scoped>

</style>


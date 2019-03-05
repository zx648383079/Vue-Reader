<template>
    <div>

    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { ICategory, getCategories, IBook } from '../api/book';
import BookItem from '@/components/BookItem.vue';

@Component({
  components: {
    BookItem,
  },
})
export default class Search extends Vue {

    keywords: string = '';
    category?: number;
    categories?: ICategory[] = [];
    items: IBook[] = [];
    
    created() {
        getCategories().then(res => {
            this.categories = res.data;
        });
    }

    tapCategory(item: ICategory) {
    }
}
</script>
<style lang="scss" scoped>

</style>


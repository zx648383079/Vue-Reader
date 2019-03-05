<template>
    <div>
        <div class="box">
            <div class="item" v-for="(item, index) in categories" :key="index" @click="tapCategory(item)">
                {{ item.name }}
            </div>
        </div>
        <TabBar/>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { ICategory, getCategories } from '../api/book';
import TabBar from '@/components/TabBar.vue';

@Component({
  components: {
    TabBar,
  },
})
export default class Category extends Vue {
    categories?: ICategory[] = [];
    
    created() {
        getCategories().then(res => {
            this.categories = res.data;
        });
    }

    tapCategory(item: ICategory) {
        this.$router.push({
            name: 'search',
            query: {
                category: item.id + '', 
                title: item.name
            }
        });
    }
}
</script>
<style lang="scss" scoped>
.box {
    text-align: center;
    margin-top: 10vh;
}
.item {
    display: inline-block;
    line-height: 40px;
    width: 120px;
    text-align: center;
    border: 1px solid;
    margin: 2px;
    cursor: pointer;
}
</style>


<template>
    <div>
        <BackHeader :title="$route.meta.title"/>
        <div class="box">
            <div class="item" v-for="(item, index) in categories" :key="index" @click="tapCategory(item)">
                {{ item.name }}
            </div>
        </div>
        <TabBar/>
    </div>
</template>
<script lang="ts">
import { Vue, Options } from 'vue-property-decorator';
import { ICategory } from '../api/book';
import TabBar from '@/components/TabBar.vue';
import BackHeader from '@/components/BackHeader.vue';
import { dispatchCategories } from '@/store/dispatches';

@Options({
    components: {
        BackHeader,
        TabBar,
    },
})
export default class Category extends Vue {
    public categories?: ICategory[] = [];

    public created() {
        dispatchCategories().then(res => {
            this.categories = res;
        });
    }

    public tapCategory(item: ICategory) {
        this.$router.push({
            name: 'bang',
            query: {
                category: item.id + '',
                title: item.name,
            },
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


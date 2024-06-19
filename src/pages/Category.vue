<template>
    <div>
        <BackHeader :title="$route.meta.title as any"/>
        <div class="box">
            <div class="item" v-for="(item, index) in categories" :key="index" @click="tapCategory(item)">
                {{ item.name }}
            </div>
        </div>
        <TabBar/>
    </div>
</template>
<script lang="ts" setup>
import TabBar from '@/components/TabBar.vue';
import BackHeader from '@/components/BackHeader.vue';
import { onMounted, ref } from 'vue';
import type { ICategory } from '@/api/model';
import { useBookStore } from '@/stores/book';
import { useRouter } from 'vue-router';


const store = useBookStore();
const router = useRouter();
const categories  = ref<ICategory[]>([]);

function tapCategory(item: ICategory) {
    router.push({
        name: 'bang',
        query: {
            category: item.id + '',
            title: item.name,
        },
    });
}

onMounted(() => {
    store.getCategories().then(res => {
        categories.value = res;
    });
});

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


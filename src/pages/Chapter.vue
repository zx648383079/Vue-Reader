<template>
    <div>
        <BackHeader title="目录">
            <a href="" v-if="!isSort">
                <i class="fa fa-arrow-up"></i>
                正序
            </a>
            <a href="" v-else>
                <i class="fa fa-arrow-down"></i>
                倒序
            </a>
        </BackHeader>

        <div class="box">
            <div class="item" v-for="item in items" :key="item.id" @click="tapChapter(item)">
                <div class="title">{{ item.title }}</div>
                <div class="time">{{ item.created_at }}</div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { IChapter, getChapters } from '../api/book';
import BackHeader from '@/components/BackHeader.vue';

@Component({
    components: {
        BackHeader
    }
})
export default class Chapter extends Vue {
    items?: IChapter[] = [];
    isSort: boolean = false;

    created() {
        getChapters(parseInt(this.$route.params.book)).then(res => {
            this.items = res.data;
        });
    }

    tapChapter(item: IChapter) {
        this.$router.push('/read/' + item.id);
    }
}
</script>
<style lang="scss" scoped>

</style>


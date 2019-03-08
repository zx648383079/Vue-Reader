<template>
    <div>
        <BackHeader title="目录">
            <a class="right" @click="tapSort" v-if="!isSort">
                <i class="fa fa-arrow-up"></i>
                正序
            </a>
            <a class="right" @click="tapSort" v-else>
                <i class="fa fa-arrow-down"></i>
                倒序
            </a>
        </BackHeader>

        <div class="box">
            <div v-for="item in items" :key="item.id" @click="tapChapter(item)" :class="['item', activeChapter == item.id ? 'active' : '']">
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
import { dispatchChapters } from '@/store/dispatches';
import BookRecord from '@/utils/book';

@Component({
    components: {
        BackHeader
    }
})
export default class Chapter extends Vue {
    items?: IChapter[] = [];
    isSort: boolean = false;
    activeChapter: number = 0;

    created() {
        const book_id = parseInt(this.$route.params.book);
        if (!book_id) {
            return;
        }
        dispatchChapters(book_id).then(res => {
            this.items = res;
        });
        const record = BookRecord.getItem(book_id);
        if (record) {
            this.activeChapter = record.chapter_id;
        }
    }

    tapChapter(item: IChapter) {
        this.$router.push('/read/' + item.id);
    }

    tapSort() {
        this.isSort = !this.isSort;
        if (this.items) {
            this.items.reverse();
        }
    }
}
</script>
<style lang="scss" scoped>
.box {
    margin-top: 2.75rem;
    background-color: #fff;
    .item {
        margin: 0 10px;
        padding: 5px 0 10px;
        .title {
            line-height: 30px;
            font-weight: 600;
        }
        .time {
            font-size: 12px;
            color: #767676;
        }
        &.active {
            .title {
                color: #f00;
            }
        }
        &:not(:last-of-type) {
            border-bottom: 1px solid #ccc;
        }
    }
}
.right {
    top: 50%;
    margin-top: -.7rem;
    position: absolute;
    right: 0.625rem;
}
</style>


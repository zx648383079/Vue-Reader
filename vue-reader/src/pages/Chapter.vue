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
import { Vue, Options } from 'vue-property-decorator';
import { IChapter } from '../api/book';
import BackHeader from '@/components/BackHeader.vue';
import { dispatchChapters } from '@/store/dispatches';
import BookRecord from '@/utils/book';

@Options({
    components: {
        BackHeader,
    },
})
export default class Chapter extends Vue {
    public items?: IChapter[] = [];
    public isSort = false;
    public activeChapter = 0;

    public created() {
        const bookId = parseInt(this.$route.params.book as string, 10);
        if (!bookId) {
            return;
        }
        dispatchChapters(bookId).then(res => {
            this.items = res;
        });
        const record = BookRecord.getItem(bookId);
        if (record) {
            this.activeChapter = record.chapter_id;
        }
    }

    public tapChapter(item: IChapter) {
        this.$router.push('/read/' + item.id);
    }

    public tapSort() {
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


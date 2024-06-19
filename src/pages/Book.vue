<template>
    <div v-if="book">
        <header>
            <a class="back" @click="tapBack">
                <i class="iconfont icon-chevron-left" aria-hidden="true"></i>
            </a>
            <a class="more" href="javascript:;">
                <i class="iconfont icon-ellipsis-h"></i>
            </a>
            <div class="cover">
                <img :src="assetsFilter(book.cover)" alt="">
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
                <span>{{ sizeFilter(book.size) }}字</span>
                <span>{{ statusFilter(book.over_at) }}</span>
            </a>
            <a href="">
                <span>{{ sizeFilter(book.click_count) }}</span>
                <span>点击</span>
            </a>
            <a href="">
                <span>{{ sizeFilter(book.chapter_count) }}</span>
                <span>章节</span>
            </a>
        </div>

        <div class="line-item" @click="tapChapter">
            <span>目录</span>
            <div class="right">
                <span v-if="book.last_chapter">连载至{{ book.last_chapter.title?.substring(0, 10) }}</span>
                <i class="iconfont icon-chevron-right"></i>
            </div>
        </div>

        <footer>
            <a v-if="!isFollow" @click="tapFollow">
                <i class="iconfont icon-plus"></i>
                加入书架
            </a>
            <a class="followed" v-else>
                <i class="iconfont icon-check"></i>
                已在书架
            </a>
            <a @click="tapRead">
                立即阅读
            </a>
        </footer>
    </div>
</template>
<script lang="ts" setup>
import type { IBook } from '@/api/model';
import { useDialog } from '@/components/Dialog';
import { useBook } from '@/services';
import { useBookStore } from '@/stores/book';
import { parseNumber } from '@/utils';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { assetsFilter } from '@/pipes';
import { sizeFilter } from '@/pipes';
import { statusFilter } from '@/pipes';

const record = useBook();
const store = useBookStore();
const route = useRoute();
const router = useRouter();
const toast = useDialog();
const book = ref<IBook>();
const isFollow = ref(false);


function tapBack() {
    if (window.history.length <= 1) {
        router.push('/');
        return;
    }
    router.go(-1);
}

function tapChapter() {
    if (!book.value) {
        return;
    }
    router.push('/chapter/' + book.value.id);
}

function tapRead() {
    if (!book.value || !book.value.first_chapter) {
        return;
    }
    const re = record.getItem(book.value.id);
    router.push('/read/' + (re ? re.chapter_id : book.value.first_chapter.id));
}

function tapFollow() {
    if (!book.value || !book.value.first_chapter) {
        return;
    }
    record.add(book.value, book.value.first_chapter, 0);
    isFollow.value = true;
    toast.success('已成功加入书架');
}

onMounted(() => {
    book.value = {
        id: parseNumber(route.params.id),
    };
    isFollow.value = record.has(book.value.id);
    store.getBook(book.value.id).then(res => {
        if (!res) {
            toast.error('书籍已失联');
            tapBack();
            return;
        }
        book.value = res;
        route.meta.title = res.name;
    }).catch(err => {
        toast.error('书籍已失联');
        tapBack();
    });
});

</script>
<style lang="scss" scoped>
header {
    position: relative;
    text-align: center;
    background-color: rgba(98, 76, 78, .9);
    height: 200px;
    padding: 10px;
    color: #fff;
    .back,
    .more {
        position: absolute;
        top: 10px;
        color: #fff;
    }
    .back {
        left: 20px;
    }
    .more {
        right: 20px;
    }
    .cover {
        img {
            width: 85px;
            height: 110px;
        }
    }
    .name {
        line-height: 40px;
        font-size: 30px;
        font-weight: 700;
    }
    .tag {
        font-size: 12px;
    }
}
.tab-bar {
    display: flex;
    justify-content: space-around;
    flex-flow: row nowrap;
    padding: 10px 0;
    background: #fff;
    border-bottom: 1px solid #ccc;
    a {
        text-align: center;
        span {
            display: block;
            font-size: 16px;
            font-weight: 700;
            color: #333;
            &:last-of-type {
                font-size: 12px;
                color: #767676;
            }
        }
    }
}
.line-item {
    line-height: 40px;
    background-color: #fff;
    color: #333;
    padding: 0 10px;
    font-weight: 600;
    .right {
        float: right;
        color: #767676;
        font-size: 14px;
        font-weight: 300;
        span {
            margin-right: 5px;
        }
    }
    &:not(:last-of-type) {
        border-bottom: 4px solid #f4f4f4;
    }
}
footer {
    display: flex;
    justify-content: space-around;
    flex-flow: row nowrap;
    position: fixed;
    bottom: 0;
    width: 100%;
    background: #fff;
    border-top: 1px solid #ccc;
    a {
        display: block;
        width: 50%;
        text-align: center;
        padding: 14px 0;
        &:last-of-type {
            background-color: #f00;
            color: #fff;
        }
        &.followed {
            color: #767676;
        }
    }
    
}
</style>


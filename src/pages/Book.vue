<template>
    <div>
        <header>
            <a class="back" @click="tapBack">
                <i class="fa fa-chevron-left" aria-hidden="true"></i>
            </a>
            <a class="more" href="javascript:;">
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
                <span>{{ book.chapter_count|size }}</span>
                <span>章节</span>
            </a>
        </div>

        <div class="line-item" @click="tapChapter">
            <span>目录</span>
            <div class="right">
                <span v-if="book.last_chapter">连载至{{ book.last_chapter.title.substr(0, 10) }}</span>
                <i class="fa fa-chevron-right"></i>
            </div>
        </div>

        <footer>
            <a v-if="!isFollow" @click="tapFollow">
                <i class="fa fa-plus"></i>
                加入书架
            </a>
            <a class="followed" v-else>
                <i class="fa fa-check"></i>
                已在书架
            </a>
            <a @click="tapRead">
                立即阅读
            </a>
        </footer>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { IBook, getBook } from '../api/book';
import {Cell, Toast} from 'mint-ui';
import BookRecord from '@/utils/book';
import { dispatchBook } from '@/store/dispatches';

Vue.component(Cell.name, Cell);

@Component
export default class Book extends Vue {
    public book?: IBook;
    public isFollow: boolean = false;

    public created() {
        this.book = {
            id: parseInt(this.$route.params.id, 10),
        };
        this.isFollow = BookRecord.has(this.book.id);
        dispatchBook(this.book.id).then(res => {
            if (!res) {
                Toast('书籍已失联');
                this.tapBack();
                return;
            }
            this.book = res;
            this.$route.meta.title = res.name;
            this.$forceUpdate();
        }).catch(err => {
            Toast('书籍已失联');
            this.tapBack();
        });
    }

    public tapBack() {
        if (window.history.length <= 1) {
            this.$router.push('/');
            return;
        }
        this.$router.go(-1);
    }

    public tapChapter() {
        if (!this.book) {
            return;
        }
        this.$router.push('/chapter/' + this.book.id);
    }

    public tapRead() {
        if (!this.book || !this.book.first_chapter) {
            return;
        }
        const record = BookRecord.getItem(this.book.id);
        this.$router.push('/read/' + (record ? record.chapter_id : this.book.first_chapter.id));
    }

    public tapFollow() {
        if (!this.book || !this.book.first_chapter) {
            return;
        }
        BookRecord.add(this.book, this.book.first_chapter, 0);
        this.isFollow = true;
        Toast('已成功加入书架');
    }
}
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


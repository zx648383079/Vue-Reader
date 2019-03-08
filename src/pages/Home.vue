<template>
    <div>
        <div class="box" v-if="items && items.length > 0">
            <ul>
                <li class="list-item" v-for="(item, index) in items" :key="index" :data-type="activeSwiper == index ? 1 : 0">
                    <div class="book-item" @touchstart.capture="touchStart" :data-index="index" @touchend.capture="touchEnd" @click="tapBook(item)">
                        <div class="cover">
                            <img :src="item.cover">
                        </div>
                        <div class="info">
                            <div class="name">{{ item.name }}</div>
                            <div class="tag">{{ item.author_name }}</div>
                            <div class="desc">{{ item.read_at | ago }}· {{ item.chapter_title }}</div>
                        </div>
                    </div>
                    <div class="delete" @click="deleteItem" :data-index="index">删除</div>
                </li>
            </ul>
        </div>
        <div class="empty" v-else>
          您的书架空空如也
        </div>
        <TabBar/>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TabBar from '@/components/TabBar.vue';
import Book,{ IBookRecord } from '@/utils/book';

@Component({
  components: {
    TabBar,
  },
})
export default class Home extends Vue {
    items?: IBookRecord[] = [];
    startX: number = 0;
    endX: number = 0;
    activeSwiper: number = -1;

    created() {
        this.items = Book.getItems();
    }

    tapBook(item: IBookRecord) {
        this.$router.push('/read/' + item.chapter_id);
    }

    //滑动开始
    touchStart(e: TouchEvent){
        this.startX = e.touches[0].clientX;
    }
    //滑动结束
    touchEnd(e: TouchEvent){
        this.endX = e.changedTouches[0].clientX;
        if(this.startX - this.endX > 30){
            this.activeSwiper = e.currentTarget.dataset.index;
        }
        if(this.startX - this.endX < -30){
            this.activeSwiper = -1;
        }
        this.startX = 0;
        this.endX = 0;
    }
    //判断当前是否有滑块处于滑动状态
    checkSlide(){
        return this.activeSwiper > -1;
    }
    //删除
    deleteItem(e: any){
        let index = e.currentTarget.dataset.index;
        this.activeSwiper = -1;
        const item = this.items[index];
        this.items.splice(index, 1);
        Book.remove(item.id);
    }
}
</script>
<style lang="scss" scoped>
.empty {
    font-size: 30px;
    color: #ccc;
    margin-top: 30vh;
    text-align: center;
}
.book-item {
    position: relative;
    height: 130px;
    overflow: hidden;
    background-color: #fff;
    padding: 10px;
    .cover {
        position: absolute;
        img {
            width: 85px;
            height: 110px;
        }
        .tip {
            position: absolute;
            bottom: 20px;
            text-align: center;
            color: #fff;
            width: 100%;
            font-size: 12px;
        }
    }
    .info {
        margin-left: 90px;
        .name {
            font-weight: 700;
            line-height: 30px;
        }
        .tag {
            color: #767676;
            line-height: 20px;
            font-size: 13px;
        }
        .desc {
            height: 60px;
            overflow: hidden;
            word-break: break-word;
            overflow-wrap: break-word;
            line-height: 20px;
        }
    }
    &:not(:last-of-type) {
        border-bottom: 1px solid #f4f4f4;
    }
}
.box {
    overflow: hidden;
}
.list-item{
    position: relative;
    height: 130px;
    transition: all 0.2s;
    .delete{
        width: 80px;
        height: 130px;
        background: #ff4949;
        font-size: 17px;
        color: #fff;
        text-align: center;
        line-height: 130px;
        position: absolute;
        top:0;
        right: -80px;
    }
    &[data-type="0"]{
        transform: translate3d(0,0,0);
    }
    &[data-type="1"]{
        transform: translate3d(-80px,0,0);
    }
}
</style>


<template>
    <div>
        <BackHeader v-if="readMode > 0" :title="chapter.title"/>
        <ReadPager ref="pager"></ReadPager>
        <footer v-if="readMode > 0">
            <div class="pager">
                <a href="">上一章</a>
                <mt-range v-model="progress"></mt-range>
                <a href="">下一章</a>
            </div>
            <div class="setting" v-if="readMode == 2">
                <div class="theme-box">
                    <span class="theme-0 active"></span>
                    <span class="theme-1"></span>
                    <span class="theme-2"></span>
                    <span class="theme-3"></span>
                    <span class="theme-4"></span>
                    <span class="theme-5"></span>
                    <span class="theme-6"></span>
                </div>
                <div class="font-box">
                    <span>雅黑</span>
                    <span>宋体</span>
                    <span>楷书</span>
                    <span class="active">启体</span>
                </div>
                <div class="line-item">
                    <span>字体大小</span>
                    <div class="size-box">
                        <i class="fa fa-minus"></i>
                        <span class="lang">18</span>
                        <i class="fa fa-plus"></i>
                    </div>
                </div>
                <div class="line-item">
                    <span>行距</span>
                    <div class="size-box">
                        <i class="fa fa-minus"></i>
                        <span class="lang">10</span>
                        <i class="fa fa-plus"></i>
                    </div>
                </div>
                <div class="line-item">
                    <span>间距</span>
                    <div class="size-box">
                        <i class="fa fa-minus"></i>
                        <span class="lang">10</span>
                        <i class="fa fa-plus"></i>
                    </div>
                </div>
            </div>
            <div class="tab-bar">
                <a @click="tapChapter">
                    <i class="fa fa-bars"></i>
                    目录
                </a>
                <a @click="tapEye" :class="readMode == 3 ? 'active' : ''">
                    <i class="fa fa-eye"></i>
                    护眼
                </a>
                <a @click="tapSetting"  :class="readMode == 2 ? 'active' : ''">
                    <i class="fa fa-cog"></i>
                    设置
                </a>
            </div>
        </footer>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { IChapter, getChapters, getChapter, IBook } from '../api/book';
import ReadPager from '@/components/ReadPager.vue'
import BackHeader from '@/components/BackHeader.vue';
import {Range, MessageBox, Toast} from 'mint-ui';
import { getLocalStorage } from '@/utils';
import BookRecord from '@/utils/book';

Vue.component(Range.name, Range);

@Component({
    components: {
        ReadPager,
        BackHeader
    },
})
export default class Read extends Vue {

    width: number = window.innerWidth;
    height: number = window.innerHeight;
    progress: number = 0;
    chapter?: IChapter;
    book?: IBook;
    readMode: number = 0;
    
    created() {
        getChapter(parseInt(this.$route.params.id)).then(res => {
            this.chapter = res;
        });
    }

    mounted () {
        window.onresize = () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        }
    }

    tapSetting() {
        this.readMode = 2;
    }

    tapEye() {
        this.readMode = 3;
    }

    tapChapter() {

    }

     beforeRouteLeave(to: any, from: any, next: Function) {
        if (!this.chapter) {
            next();
            return;
        }
        if (!BookRecord.has(this.chapter.book_id)) {
            MessageBox.confirm('是否将小说加入书架？').then(() => {
                //this.recordReadHis()
                Toast('添加成功！')
                next()
            }, () => {
                next()
            })
            return;
        }
        //this.recordReadHis()
        next()
    }
}
</script>
<style lang="scss" scoped>
footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    background-color: #333;
    color: #fff;
    a {
        color: #fff;
    }
    .pager {
        display: grid;
        grid-template-columns: 60px 1fr 60px;
        padding: 10px 0;
        text-align: center;
    }
    .tab-bar {
        border-top: 0.0625rem solid #e1e1e1;
        display: flex;
        justify-content: space-around;
        flex-flow: row nowrap;
        height: 3rem;
        a {
            width: 33.333%;
            text-align: center;
            display: block;
            padding-top: 0.25rem;
            box-sizing: border-box;
            position: relative;
            font-size: .9rem;
            text-decoration: none;
            position: relative;
            text-align: center;
            .fa {
                font-size: 1.5rem;
                display: block;
            }
            &.active {
                color: #b4282d;
                .fa {
                    color: #b4282d;
                }
            }
        }
    }
    .theme-box {
        padding-bottom: 10px;
        text-align: center;
        span {
            border-radius: 50%;
            display: inline-block;
            width: 30px;
            height: 30px;
            border: 1px solid #fff;
            box-sizing: border-box;
            margin-right: 5px;
            &.active {
                border: 4px solid #f00;
            }
        }
    }
    .font-box {
        padding-bottom: 10px;
        text-align: center;
        span {
            border: 1px solid #fff;
            padding: 2px 5px;
            margin-right: 5px;
            &.active {
                border-color: #f00;
            }
        }
    }
    .line-item {
        display: grid;
        grid-template-columns: 100px 1fr;
        line-height: 30px;
        padding: 0 10px;
        .size-box {
            text-align: center;
            font-size: 20px;
            .lang {
                padding: 0 10px;
            }
        }
    }
}
.theme-0 {
    background: #ede7da;
    .chapte-box,
    .chapter-sidebar,
    #setting-box {
        background: #f8f3e9;
    }
}

.theme-1 {
    background: #e0ce9e;
    .chapte-box,
    .chapter-sidebar,
    #setting-box {
        background: #f3e9c6;
    }
}

.theme-2 {
    background: #cddfcd;
    .chapte-box,
    .chapter-sidebar,
    #setting-box {
        background: #e2eee2;
    }
}

.theme-3 {
    background: #cfdde1;
    .chapte-box,
    .chapter-sidebar,
    #setting-box {
        background: #e2eff3;
    }
}

.theme-4 {
    background: #ebcece;
    .chapte-box,
    .chapter-sidebar,
    #setting-box {
        background: #f5e4e4;
    }
}

.theme-5 {
    background: #d0d0d0;
    .chapte-box,
    .chapter-sidebar,
    #setting-box {
        background: #dcdcdc;
    }
}

</style>


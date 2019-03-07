<template>
    <div>
        <BackHeader v-if="readMode > 0" :title="chapter.title"/>
        <ReadPager ref="pager" :width="width" :height="height" :fontSize="configs.size" :lineSpace="configs.line" :letterSpace="configs.letter" :font="'font-' + configs.font" :theme="'theme-' + configs.theme"  @middle="tapMiddle" @progress="tapProgress" @prev="tapPrev" @next="tapNext"></ReadPager>
        <footer v-if="readMode > 0">
            <div class="pager">
                <a @click="tapPrev">上一章</a>
                <mt-range :value="progress" @input="tapMoveProgress"></mt-range>
                <a @click="tapNext">下一章</a>
            </div>
            <div class="setting" v-if="readMode == 2">
                <div class="theme-box">
                    <span v-for="(item, index) in theme_list" :key="index" :class="['theme-' + index, configs.theme == index ? 'active' : '']" @click="configs.theme = index"></span>
                </div>
                <div class="font-box">
                    <span v-for="(item, index) in font_list" :key="index" :class="[configs.font == index ? 'active' : '']" @click="configs.font = index">{{ item }}</span>
                </div>
                <div class="line-item">
                    <span>字体大小</span>
                    <div class="size-box">
                        <i class="fa fa-minus" @click="tapMinus('size')"></i>
                        <span class="lang">{{ configs.size }}</span>
                        <i class="fa fa-plus" @click="tapPlus('size')"></i>
                    </div>
                </div>
                <div class="line-item">
                    <span>行距</span>
                    <div class="size-box">
                        <i class="fa fa-minus" @click="tapMinus('line')"></i>
                        <span class="lang">{{ configs.line }}</span>
                        <i class="fa fa-plus" @click="tapPlus('line')"></i>
                    </div>
                </div>
                <div class="line-item">
                    <span>间距</span>
                    <div class="size-box">
                        <i class="fa fa-minus" @click="tapMinus('letter')"></i>
                        <span class="lang">{{ configs.letter }}</span>
                        <i class="fa fa-plus" @click="tapPlus('letter')"></i>
                    </div>
                </div>
            </div>
            <div class="tab-bar">
                <a @click="tapChapter">
                    <i class="fa fa-bars"></i>
                    目录
                </a>
                <a @click="tapEye" :class="configs.theme == 7 ? 'active' : ''">
                    <i class="fa fa-eye"></i>
                    夜间
                </a>
                <a @click="tapSetting"  :class="readMode == 2 ? 'active' : ''">
                    <i class="fa fa-cog"></i>
                    设置
                </a>
            </div>
        </footer>
        <SliderMenu v-if="chapter" v-show="readMode == 4" :book="chapter.book_id" :chapter="chapter.id" @read="tapRead"></SliderMenu>
    </div>
</template>
<script lang="ts">
import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import { IChapter, getChapters, getChapter, IBook } from '../api/book';
import ReadPager from '@/components/ReadPager.vue'
import BackHeader from '@/components/BackHeader.vue';
import SliderMenu from '@/components/SliderMenu.vue';
import {Range, MessageBox, Toast, Indicator} from 'mint-ui';
import { getLocalStorage } from '@/utils';
import BookRecord from '@/utils/book';
import { dispatchChapter, dispatchBook } from '@/store/dispatches';

interface IProgress {
    page: number,
    count: number,
    progress: number
}

Vue.component(Range.name, Range);

Component.registerHooks([
  'beforeRouteLeave'
]);

@Component({
    components: {
        ReadPager,
        BackHeader,
        SliderMenu
    },
})
export default class Read extends Vue {

    width: number = 0;
    height: number = 0;
    progress: number = 0;
    chapter?: IChapter;
    book?: IBook;
    readMode: number = 0;
    isReady = false;
    isPagerReady = false;
    theme_list = [0, 1, 2, 3, 4, 5];
    font_list = ['雅黑', '宋体', '楷书', '启体'];
    configs = {
        font: 3,
        theme: 0,
        old_theme: 0, // 记录夜间模式切换
        size: 18,
        line: 10,
        letter: 4
    };
    size_round =  {
        size: [12, 2, 40],
        line: [2, 1, 40],
        letter: [1, 1, 40],
    };

    beforeRouteLeave(to: any, from: any, next: Function) {
        if (!this.chapter) {
            next();
            return;
        }
        if (!BookRecord.has(this.chapter.book_id)) {
            MessageBox.confirm('是否将小说加入书架？').then(() => {
                this.recordFollow();
                Toast('添加成功！')
                next()
            }, () => {
                next()
            })
            return;
        }
        this.recordFollow();
        next()
    }
    
    created() {
        dispatchChapter(parseInt(this.$route.params.id)).then(res => {
            this.chapter = res;
            this.refreshPager();
        });
    }

    mounted () {
        this.isReady = true;
        window.onresize = () => {
            this.refreshSize();
        }
        this.refreshSize();
        this.refreshPager();
    }

    recordFollow() {
        if (!this.chapter) {
            return;
        }
        dispatchBook(this.chapter.book_id).then(book => {
            BookRecord.add(book, this.chapter, this.progress);
        })
    }

    refreshSize() {
        let size = this.getClientSize();
        this.width = size.width;
        this.height = size.height;
    }

    getClientSize() {
        if(window.innerHeight !== undefined){
            return {
                'width': window.innerWidth,
                'height': window.innerHeight
            }
        }
        if(document.compatMode === "CSS1Compat"){
            return {
                'width': document.documentElement.clientWidth,
                'height': document.documentElement.clientHeight
            }
        }
        return {
            'width': document.body.clientWidth,
            'height': document.body.clientHeight
        }
    }

    refreshPager(page: number = 1) {
        if (!this.isReady || this.isPagerReady) {
            return;
        }
        if (!this.chapter) {
            return;
        }
        this.isPagerReady = true;
        this.$route.meta.title = this.chapter.title;
        this.$refs.pager.refreshPager(this.chapter.content);
        this.goPager(page);
    }

    tapPrev() {
        if (!this.chapter || !this.chapter.previous) {
            Toast('已到第一章节，无法前进了');
            return;
        }
        Indicator.open('获取《' + this.chapter.previous.title + '》中');
        getChapter(this.chapter.previous.id).then(res => {
            Indicator.close();
            this.chapter = res;
            this.isPagerReady = false;
            this.refreshPager();
        });
    }

    tapRead(item: IChapter) {
        this.chapter = item;
        Indicator.open('获取《' + item.title + '》中');
        getChapter(item.id).then(res => {
            Indicator.close();
            this.chapter = res;
            this.isPagerReady = false;
            this.refreshPager();
        });
    }

    tapNext() {
       if (!this.chapter || !this.chapter.next) {
            Toast('已到最新章节，没有更多了');
            return;
        }
        Indicator.open('获取《' + this.chapter.next.title + '》中');
        getChapter(this.chapter.next.id).then(res => {
            Indicator.close();
            this.chapter = res;
            this.isPagerReady = false;
            this.refreshPager();
        });
    }

    tapProgress(data: IProgress) {
        this.progress = data.progress;
    }

    goPager(page: number) {
        this.$refs.pager.goPager(page);
    }

    tapMoveProgress(val: number) {
        this.progress = val;
        this.$refs.pager.goProgress(val)
    }

    tapMiddle(toggle?: boolean) {
        if (typeof toggle == 'undefined') {
            this.readMode = this.readMode > 0 ? 0 : 1;
            return;
        }
        if (this.readMode > 0) {
            this.readMode = 0;
        }
    }

    tapSetting() {
        this.readMode = 2;
    }

    tapEye() {
        if (this.configs.theme == 7) {
            this.configs.theme = this.configs.old_theme;
            return;
        }
        this.configs.old_theme = this.configs.theme;
        this.configs.theme = 7;
    }

    tapMinus(name: string) {
        if (!this.configs.hasOwnProperty(name)) {
            return;
        }
        const round = {
            size: [12, 2, 40],
            line: [2, 1, 40],
            letter: [1, 1, 40],
        };
        this.configs[name] = Math.min(Math.max(this.configs[name] - this.size_round[name][1], this.size_round[name][0]), this.size_round[name][2]);
        this.$refs.pager.refreshPage();
    }

    tapPlus(name: string) {
        if (!this.configs.hasOwnProperty(name)) {
            return;
        }
        this.configs[name] = Math.min(Math.max(this.configs[name] + this.size_round[name][1], this.size_round[name][0]), this.size_round[name][2]);
        this.$refs.pager.refreshPage();
    }

    tapChapter() {
        this.readMode = 4;
    }
}
</script>
<style lang="scss" scoped>
footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    z-index: 99;
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
</style>

<style lang="scss">
.theme-0 {
    background: #ede7da;
}

.theme-1 {
    background: #e0ce9e;
}

.theme-2 {
    background: #cddfcd;
}

.theme-3 {
    background: #cfdde1;
}

.theme-4 {
    background: #ebcece;
}

.theme-5 {
    background: #d0d0d0;
}
.theme-7 {
    background: #000;
    color: #fff;
}
.font-0 {
    font-family: 'Microsoft YaHei',PingFangSC-Regular,HelveticaNeue-Light,'Helvetica Neue Light',sans-serif;
}
.font-1 {
    font-family: PingFangSC-Regular,'-apple-system',Simsun;
}
.font-2 {
    font-family: Kaiti;
}
.font-3 {
    font-family: 方正启体简体,"Microsoft YaHei",微软雅黑,宋体;
}
</style>


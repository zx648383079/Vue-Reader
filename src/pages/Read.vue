<template>
    <div>
        <BackHeader v-if="readMode > 0" :title="chapter.title"/>
        <canvas ref="reader" style="float: left;"></canvas>
        <footer v-if="readMode > 0">
            <div class="pager">
                <a @click="tapPrev">上一章</a>
                <mt-range :value="progress" @input="tapMoveProgress"></mt-range>
                <a @click="tapNext">下一章</a>
            </div>
            <div class="setting" v-if="readMode == 2">
                <div class="line-item">
                    <span>字体颜色</span>
                    <div class="color-box">
                        <ColorPicker v-model="configs.color">
                            <span class="color" :style="'background-color: ' + configs.color"></span>
                        </ColorPicker>
                    </div>
                </div>
                <div class="line-item">
                    <span>背景颜色</span>
                    <div class="color-box">
                        <ColorPicker v-model="configs.background">
                            <span class="color" :style="'background-color: ' + configs.background"></span>
                        </ColorPicker>
                        <span class="add-img" @click="tapBackgroundImg()">
                            <i class="fa fa-image"></i>
                        </span>
                    </div>
                </div>
                <div class="line-item">
                    <span>翻页效果</span>
                    <div class="font-box">
                        <span v-for="(item, index) in flipList" :key="index" :class="[configs.flip == index ? 'active' : '']" @click="configs.flip = index">{{ item }}</span>
                    </div>
                </div>
                <div class="line-item">
                    <span>字体</span>
                    <div class="font-box">
                        <span v-for="(item, index) in fontList" :key="index" :class="[configs.font == index ? 'active' : '']" @click="configs.font = index">{{ item }}</span>
                    </div>
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
        <SliderMenu ref="slider" v-show="readMode == 4" :chapter="chapter.id" @read="tapRead"></SliderMenu>
        <div class="dialog-mask" v-if="readMode == 4" @click="readMode = 0"></div>
    </div>
</template>
<script lang="ts">
import { Vue, Watch } from 'vue-property-decorator';
import Component from 'vue-class-component';
import { IChapter, getChapters, getChapter, IBook } from '../api/book';
import ReadPager from '@/components/ReadPager.vue'
import BackHeader from '@/components/BackHeader.vue';
import SliderMenu from '@/components/SliderMenu.vue';
import ColorPicker from '@/components/ColorPicker.vue';
import {Range, MessageBox, Toast, Indicator} from 'mint-ui';
import { getLocalStorage } from '@/utils';
import BookRecord, { ITheme } from '@/utils/book';
import { dispatchChapter, dispatchBook } from '@/store/dispatches';
import { constants } from 'fs';
import { THEME_CONFIGS_KEY } from '@/store/types';
import { FlipViewer, FlipDirect, FlipKind } from '../utils/flipViewer';

interface IProgress {
    page: number,
    count: number,
    progress: number,
}

Vue.component(Range.name, Range);

Component.registerHooks([
  'beforeRouteLeave',
]);

@Component({
    components: {
        ReadPager,
        BackHeader,
        SliderMenu,
        ColorPicker,
    },
})
export default class Read extends Vue {

    public width: number = 0;
    public height: number = 0;
    public progress: number = 0;
    public chapter?: IChapter = {id: 0};
    public book?: IBook;
    public readMode: number = 0;
    public isReady = false;
    public isPagerReady = false;
    public fontList = ['雅黑', '宋体', '楷书', '启体'];
    public flipList = ['无', '覆盖', '仿真', '滚屏'];
    public configs: ITheme = {
        font: 3,
        background: '#fff',
        oldTheme: '', // 记录夜间模式切换
        size: 18,
        line: 10,
        letter: 4,
        color: '#333',
        flip: FlipKind.Flip,
    };
    public sizeRound: {[key: string]: number[]} = {
        size: [12, 2, 40],
        line: [2, 1, 40],
        letter: [1, 1, 40],
    };
    private flipViewer!: FlipViewer;


    public beforeRouteLeave(to: any, from: any, next: () => void) {
        if (!this.chapter) {
            next();
            return;
        }
        if (!BookRecord.has(this.chapter.book_id as number)) {
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

    public created() {
        dispatchChapter(parseInt(this.$route.params.id, 10)).then(res => {
            this.chapter = res;
            this.refreshPager();
            // (this.$refs.slider as SliderMenu).refresh(res.book_id as number);
        });
        this.configs = BookRecord.getTheme();
    }

    public mounted() {
        this.isReady = true;
        window.onresize = () => {
            this.refreshSize();
        }
        this.refreshSize();
        this.refreshPager();
    }

    public recordFollow() {
        if (!this.chapter) {
            return;
        }
        if (BookRecord.has(this.chapter.book_id as number)) {
            BookRecord.update(this.chapter, this.progress);
            return;
        }
        dispatchBook(this.chapter.book_id as number).then(book => {
            BookRecord.add(book, this.chapter as IChapter, this.progress);
        })
    }

    public refreshSize() {
        const size = this.getClientSize();
        this.width = size.width;
        this.height = size.height;
        if (this.flipViewer) {
            this.flipViewer.reset(size.width, size.height);
        }
    }

    public getClientSize() {
        if (window.innerHeight !== undefined){
            return {
                width: window.innerWidth,
                height: window.innerHeight,
            };
        }
        if (document.compatMode === 'CSS1Compat'){
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight,
            };
        }
        return {
            width: document.body.clientWidth,
            height: document.body.clientHeight,
        };
    }

    public refreshPager(page: number = 1) {
        if (!this.flipViewer) {
            this.flipViewer = new FlipViewer(this.$refs.reader as HTMLCanvasElement,
            this.width, this.height, (direct, next) => {
                if (!this.chapter) {
                    return;
                }
                if (direct === FlipDirect.Current) {
                    next(this.chapter.content as string);
                    return;
                }
                if (direct === FlipDirect.Prevous) {
                    this.tapPrev();
                    return;
                }
                if (direct === FlipDirect.Next) {
                    this.tapNext();
                    return;
                }
            }, (val) => {
                this.progress = val;
            }, () => {
                this.tapMiddle();
            });
            this.applyConfigs();
        }
        if (!this.isReady || this.isPagerReady) {
            return;
        }
        if (!this.chapter || this.chapter.id < 1) {
            return;
        }
        this.isPagerReady = true;
        this.$route.meta.title = this.chapter.title;
        this.flipViewer.setContent(this.chapter.content as string);
        // (this.$refs.pager as ReadPager).refreshPager(this.chapter.content + '');
        // this.goPager(page);
    }

    public tapPrev() {
        if (!this.chapter || !this.chapter.previous) {
            Toast('已到第一章节，无法前进了');
            if (this.flipViewer) {
                this.flipViewer.setContent();
            }
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

    public tapRead(item: IChapter) {
        this.readMode = 0;
        if (this.chapter
            && item.id === this.chapter.id) {
            return;
        }
        this.chapter = item;
        Indicator.open('获取《' + item.title + '》中');
        getChapter(item.id).then(res => {
            Indicator.close();
            this.chapter = res;
            this.isPagerReady = false;
            this.refreshPager();
        });
    }

    public tapNext() {
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

    public tapBackgroundImg() {
        const name = 'file-input';
        let fileELment: HTMLInputElement = document.querySelector('.' + name) as HTMLInputElement;
        const that = this;
        const changeEventHandle = function(this: GlobalEventHandlers) {
                const files = (this as HTMLInputElement).files;
                if (!files || files.length < 1) {
                    return;
                }
                that.flipViewer.setBackgroundImage(window.URL.createObjectURL(files[0]));
            };
        if (!fileELment) {
            fileELment = document.createElement('input');
            fileELment.type = 'file';
            fileELment.className = name;
            fileELment.multiple = false;
            fileELment.accept = 'image/*';
            document.body.appendChild(fileELment);
            fileELment.onchange = changeEventHandle;
        } else {
            fileELment.value = '';
            fileELment.multiple = false;
            fileELment.accept = 'image/*';
            fileELment.onchange = changeEventHandle;
        }
        fileELment.dispatchEvent(new MouseEvent('click'));
    }

    public tapProgress(data: IProgress) {
        this.progress = data.progress;
    }

    public goPager(page: number) {
        // (this.$refs.pager as ReadPager).goPager(page);
    }

    public tapMoveProgress(val: number) {
        this.progress = val;

        // (this.$refs.pager as ReadPager).goProgress(val)
        if (this.flipViewer) {
            this.flipViewer.progress = val;
        }
    }

    public tapMiddle(toggle?: boolean) {
        if (typeof toggle === 'undefined') {
            this.readMode = this.readMode > 0 ? 0 : 1;
            return;
        }
        if (this.readMode > 0) {
            this.readMode = 0;
        }
    }

    public tapSetting() {
        this.readMode = 2;
    }

    public tapEye() {
        if (this.configs.theme === 7) {
            this.configs.theme = 1;
            [this.configs.background, this.configs.color] = this.configs.oldTheme.split('|');
            return;
        }
        this.configs.oldTheme = [this.configs.background, this.configs.color].join('|');
        this.configs.background = '#000';
        this.configs.color = '#fff';
        this.configs.theme = 7;
    }

    public tapMinus(name: 'size' | 'line' | 'letter') {
        if (!this.configs.hasOwnProperty(name)) {
            return;
        }
        const round = {
            size: [12, 2, 40],
            line: [2, 1, 40],
            letter: [1, 1, 40],
        };
        this.configs[name] = Math.min(Math.max(this.configs[name] as number - this.sizeRound[name][1],
        this.sizeRound[name][0]), this.sizeRound[name][2]);
        // (this.$refs.pager as ReadPager).refreshPage();
    }

    public tapPlus(name: 'size' | 'line' | 'letter') {
        if (!this.configs.hasOwnProperty(name)) {
            return;
        }
        this.configs[name] = Math.min(Math.max(this.configs[name] as number + this.sizeRound[name][1],
        this.sizeRound[name][0]), this.sizeRound[name][2]);
        // (this.$refs.pager as ReadPager).refreshPage();
    }

    @Watch('configs', {deep: true})
    public onThemeChange(val: ITheme, old: any) {
        BookRecord.saveTheme(this.configs);
        this.applyConfigs();
    }

    public tapChapter() {
        this.readMode = 4;
    }

    private applyConfigs() {
        if (!this.flipViewer) {
            return;
        }
        this.flipViewer.batchRefresh(viwer => {
            viwer.fontSize = this.configs.size as number;
            const fontList = ['Microsoft YaHei', 'PingFangSC-Regular', 'Kaiti', '方正启体简体']
            viwer.fontFamily = fontList[this.configs.font as number];
            viwer.lineSpace = this.configs.line as number;
            viwer.kind = this.configs.flip as FlipKind || FlipKind.Flip;
            viwer.letterSpace = this.configs.letter as number;
            viwer.background = this.configs.background as string || '#fff';
            viwer.color = this.configs.color as string || '#333';
            viwer.margin = 10;
        });
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
        .color-box {
            .color {
                display: inline-block;
                width: 30px;
                height: 30px;
                border: 1px solid #f00;
            }
            .add-img {
                display: inline-block;
                width: 30px;
                height: 30px;
                font-size: 25px;
                line-height: 30px;
                text-align: center;
                vertical-align: super;
                margin-left: 20px;
            }
        }
    }
}
.dialog-mask {
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background: rgba(#000, .2);
    z-index: 980;
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


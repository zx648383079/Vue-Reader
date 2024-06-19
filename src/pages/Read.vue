<template>
    <div>
        <BackHeader v-if="input.readMode > 0" :title="chapter.title"/>
        <canvas ref="reader" style="float: left;"></canvas>
        <footer v-if="input.readMode > 0">
            <div class="pager">
                <a @click="tapPrev">上一章</a>
                <mt-range :value="input.progress" @input="tapMoveProgress"></mt-range>
                <a @click="tapNext">下一章</a>
            </div>
            <div class="setting" v-if="input.readMode == 2">
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
                            <i class="iconfont icon-image"></i>
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
                        <i class="iconfont icon-minus" @click="tapMinus('size')"></i>
                        <span class="lang">{{ configs.size }}</span>
                        <i class="iconfont icon-plus" @click="tapPlus('size')"></i>
                    </div>
                </div>
                <div class="line-item">
                    <span>行距</span>
                    <div class="size-box">
                        <i class="iconfont icon-minus" @click="tapMinus('line')"></i>
                        <span class="lang">{{ configs.line }}</span>
                        <i class="iconfont icon-plus" @click="tapPlus('line')"></i>
                    </div>
                </div>
                <div class="line-item">
                    <span>间距</span>
                    <div class="size-box">
                        <i class="iconfont icon-minus" @click="tapMinus('letter')"></i>
                        <span class="lang">{{ configs.letter }}</span>
                        <i class="iconfont icon-plus" @click="tapPlus('letter')"></i>
                    </div>
                </div>
            </div>
            <div class="tab-bar">
                <a @click="tapChapter">
                    <i class="iconfont icon-bars"></i>
                    目录
                </a>
                <a @click="tapEye" :class="configs.theme == 7 ? 'active' : ''">
                    <i class="iconfont icon-eye"></i>
                    夜间
                </a>
                <a @click="tapSetting"  :class="input.readMode == 2 ? 'active' : ''">
                    <i class="iconfont icon-cog"></i>
                    设置
                </a>
            </div>
        </footer>
        <SliderMenu ref="slider" v-show="input.readMode == 4" :chapter="chapter.id" @read="tapRead"></SliderMenu>
        <div class="dialog-mask" v-if="input.readMode == 4" @click="input.readMode = 0"></div>
    </div>
</template>
<script lang="ts" setup>
// import ReadPager from '@/components/ReadPager.vue';
import BackHeader from '@/components/BackHeader.vue';
import SliderMenu from '@/components/SliderMenu.vue';
// import ColorPicker from '@/components/ColorPicker.vue';
import { FlipViewer, FlipDirect, FlipKind } from '../utils/flipViewer';
import { onMounted, reactive, ref, watch } from 'vue';
import type { ITheme } from '@/services/book';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import type { IBook, IChapter } from '@/api/model';
import { useDialog } from '@/components/Dialog';
import { useBookStore } from '@/stores/book';
import { eachObject, parseNumber } from '@/utils';
import { getChapter } from '@/api/book';
import { useBook } from '@/services';

interface IProgress {
    page: number,
    count: number,
    progress: number,
}

const toast = useDialog();
const route = useRoute();
const store = useBookStore();
const record = useBook();

const sizeRound: {[key: string]: number[]} = {
    size: [12, 2, 40],
    line: [2, 1, 40],
    letter: [1, 1, 40],
};
const fontList = ['雅黑', '宋体', '楷书', '启体'];
const flipList = ['无', '覆盖', '仿真', '滚屏'];
const configs = reactive<ITheme>({
    font: 3,
    background: '#fff',
    oldTheme: '', // 记录夜间模式切换
    size: 18,
    line: 10,
    letter: 4,
    color: '#333',
    flip: FlipKind.Flip,
});

const chapter = ref<IChapter>({id: 0});
const book = ref<IBook>();
const reader = ref<HTMLCanvasElement>();
const input = reactive({
    width: 0,
    height: 0,
    progress: 0,
    readMode: 0,
    isReady: false,
    isPagerReady: false,
});
let flipViewer!: FlipViewer;


function recordFollow() {
    if (!chapter.value) {
        return;
    }
    if (record.has(chapter.value.book_id as number)) {
        record.update(chapter.value, input.progress);
        return;
    }
    store.getBook(chapter.value.book_id as number).then(book => {
        record.add(book, chapter.value as IChapter, input.progress);
    })
}

function refreshSize() {
    const size = getClientSize();
    input.width = size.width;
    input.height = size.height;
    if (flipViewer) {
        flipViewer.reset(size.width, size.height);
    }
}

function getClientSize() {
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

function refreshPager(page: number = 1) {
    if (!flipViewer) {
        flipViewer = new FlipViewer(reader.value!,
        input.width, input.height, (direct, next) => {
            if (!chapter.value) {
                return;
            }
            if (direct === FlipDirect.Current) {
                next(chapter.value.content as string);
                return;
            }
            if (direct === FlipDirect.Prevous) {
                tapPrev();
                return;
            }
            if (direct === FlipDirect.Next) {
                tapNext();
                return;
            }
        }, (val) => {
            input.progress = val;
        }, () => {
            tapMiddle();
        });
        applyConfigs();
    }
    if (!input.isReady || input.isPagerReady) {
        return;
    }
    if (!chapter.value || chapter.value.id < 1) {
        return;
    }
    input.isPagerReady = true;
    route.meta.title = chapter.value.title;
    flipViewer.setContent(chapter.value.content as string);
    // (this.$refs.pager as ReadPager).refreshPager(chapter.value.content + '');
    // this.goPager(page);
}

function tapPrev() {
    if (!chapter.value || !chapter.value.previous) {
        toast.warning('已到第一章节，无法前进了');
        if (flipViewer) {
            flipViewer.setContent();
        }
        return;
    }
    toast.loading('获取《' + chapter.value.previous.title + '》中');
    getChapter(chapter.value.previous.id).then(res => {
        toast.close();
        chapter.value = res;
        input.isPagerReady = false;
        refreshPager();
    });
}

function tapRead(item: IChapter) {
    input.readMode = 0;
    if (chapter.value
        && item.id === chapter.value.id) {
        return;
    }
    chapter.value = item;
    toast.loading('获取《' + item.title + '》中');
    getChapter(item.id).then(res => {
        toast.close();
        chapter.value = res;
        input.isPagerReady = false;
        refreshPager();
    });
}

function tapNext() {
    if (!chapter.value || !chapter.value.next) {
        toast.warning('已到最新章节，没有更多了');
        return;
    }
    toast.loading('获取《' + chapter.value.next.title + '》中');
    getChapter(chapter.value.next.id).then(res => {
        toast.close();
        chapter.value = res;
        input.isPagerReady = false;
        refreshPager();
    });
}

function tapBackgroundImg() {
    const name = 'file-input';
    let fileELment: HTMLInputElement = document.querySelector('.' + name) as HTMLInputElement;
    const changeEventHandle = function(this: GlobalEventHandlers) {
            const files = (this as HTMLInputElement).files;
            if (!files || files.length < 1) {
                return;
            }
            flipViewer.setBackgroundImage(window.URL.createObjectURL(files[0]));
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

function tapProgress(data: IProgress) {
    input.progress = data.progress;
}

function goPager(page: number) {
    // (this.$refs.pager as ReadPager).goPager(page);
}

function tapMoveProgress(val: number) {
    input.progress = val;

    // (this.$refs.pager as ReadPager).goProgress(val)
    if (flipViewer) {
        flipViewer.progress = val;
    }
}

function tapMiddle(toggle?: boolean) {
    if (typeof toggle === 'undefined') {
        input.readMode = input.readMode > 0 ? 0 : 1;
        return;
    }
    if (input.readMode > 0) {
        input.readMode = 0;
    }
}

function tapSetting() {
    input.readMode = 2;
}

function tapEye() {
    if (configs.theme === 7) {
        configs.theme = 1;
        [configs.background, configs.color] = configs.oldTheme.split('|');
        return;
    }
    configs.oldTheme = [configs.background, configs.color].join('|');
    configs.background = '#000';
    configs.color = '#fff';
    configs.theme = 7;
}

function tapMinus(name: 'size' | 'line' | 'letter') {
    if (!configs.hasOwnProperty(name)) {
        return;
    }
    const round = {
        size: [12, 2, 40],
        line: [2, 1, 40],
        letter: [1, 1, 40],
    };
    configs[name] = Math.min(Math.max(configs[name] as number - sizeRound[name][1],
    sizeRound[name][0]), sizeRound[name][2]);
    // (this.$refs.pager as ReadPager).refreshPage();
}

function tapPlus(name: 'size' | 'line' | 'letter') {
    if (!configs.hasOwnProperty(name)) {
        return;
    }
    configs[name] = Math.min(Math.max(configs[name] as number + sizeRound[name][1],
    sizeRound[name][0]), sizeRound[name][2]);
    // (this.$refs.pager as ReadPager).refreshPage();
}


function tapChapter() {
    input.readMode = 4;
}

function applyConfigs() {
    if (!flipViewer) {
        return;
    }
    flipViewer.batchRefresh(viwer => {
        viwer.fontSize = configs.size as number;
        const fontList = ['Microsoft YaHei', 'PingFangSC-Regular', 'Kaiti', '方正启体简体']
        viwer.fontFamily = fontList[configs.font as number];
        viwer.lineSpace = configs.line as number;
        viwer.kind = configs.flip as FlipKind || FlipKind.Flip;
        viwer.letterSpace = configs.letter as number;
        viwer.background = configs.background as string || '#fff';
        viwer.color = configs.color as string || '#333';
        viwer.margin = 10;
    });
}

watch(() => configs, () => {
    record.saveTheme(configs);
    applyConfigs();
});

onBeforeRouteLeave((to: any, from: any, next: () => void) => {
    if (!chapter.value?.id) {
        next();
        return;
    }
    if (!record.has(chapter.value.book_id as number)) {
        toast.confirm('是否将小说加入书架？').then(() => {
            recordFollow();
            toast.success('添加成功！')
            next()
        }, () => {
            next()
        })
        return;
    }
    recordFollow();
    next()
});

onMounted(() => {
    input.isReady = true;
    window.onresize = () => {
        refreshSize();
    }
    refreshSize();
    refreshPager();
});

store.getChapter(parseNumber(route.params.id)).then(res => {
    chapter.value = res;
    refreshPager();
    // (this.$refs.slider as SliderMenu).refresh(res.book_id as number);
});
eachObject(record.getTheme(), (v, k) => {
    configs[k] = v;
});

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
            .iconfont {
                font-size: 1.5rem;
                display: block;
            }
            &.active {
                color: #b4282d;
                .iconfont {
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


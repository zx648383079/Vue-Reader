<template>
    <div>
        <SearchHeader :value="value" @input="updateVal" @enter="tapSearch" @keyup="onKeyUp" @focus="tapFocus"></SearchHeader>
        <div class="has-header" v-if="!isMini">
            <div class="search-recommend-box" v-if="!tipList || tipList.length == 0">
                <div class="panel" v-if="historyList && historyList.length > 0">
                    <div class="panel-header">
                        <span>历史记录</span>
                        <i class="fa fa-trash" @click="tapClearHistory"></i>
                    </div>
                    <div class="panel-body">
                        <a v-for="(item, index) in historyList" :key="index" @click="tapSearch(item)">{{ item }}</a>
                    </div>
                </div>
                <div class="panel" v-if="hotKeywords && hotKeywords.length > 0">
                    <div class="panel-header">
                        <span>热门搜索</span>
                    </div>
                    <div class="panel-body">
                        <a v-for="(item, index) in hotKeywords" :key="index" @click="tapSearch(item)">{{ item }}</a>
                    </div>
                </div>
            </div>
            <ul class="search-tip-box" v-else>
                <li v-for="(item, index) in tipList" :key="index">
                    <a @click="tapSearch(item)">{{ item }}</a>
                </li>
            </ul>

        </div>
    </div>
</template>
<script lang="ts">
import { removeLocalStorage, getLocalStorage, setLocalStorage } from '@/utils';
import { getTips, getHot } from '@/api/book';
const KEYWORDS_HISTORY = 'KEYWORDS_HISTORY';
import { Vue, Prop, Emit, Options } from 'vue-property-decorator';
import SearchHeader from './SearchHeader.vue';

@Options({
    components: {
        SearchHeader,
    },
})
export default class SearchBar extends Vue {
    @Prop(String) public readonly value!: string;

    public hotKeywords?: string[] = [];
    public tipList?: string[] = [];
    public historyList: string[] = [];
    public isMini = false;

    public created() {
        this.isMini = Object.keys(this.$route.query).length > 0;
        this.historyList = getLocalStorage<string[]>(KEYWORDS_HISTORY, true) || [];
        getHot().then(res => {
            this.hotKeywords = res.data
        })
    }


    public updateVal(val: string) {
        this.$emit('input', val);
        if (!val || val.length < 1) {
            this.tipList = [];
            this.isMini = false;
        }
    }

    public tapClearHistory() {
        this.historyList = []
        removeLocalStorage(KEYWORDS_HISTORY)
    }

    public addHistory(keywords: string) {
        if (this.historyList.indexOf(keywords) >= 0) {
            return;
        }
        this.historyList.push(keywords);
        if (this.historyList.length > 8) {
            this.historyList.splice(8);
        }
        setLocalStorage(KEYWORDS_HISTORY, this.historyList)
    }

    public onKeyUp() {
        if (!this.value || this.value.length < 1) {
            this.tipList = [];
            return;
        }
        getTips(this.value).then(res => {
            this.tipList = res.data
        });
    }

    public tapSearch(keywords: string) {
        if (!keywords || keywords.trim().length === 0) {
            return;
        }
        this.addHistory(keywords);
        this.$emit('search', keywords);
        this.isMini = true;
    }

    @Emit('focus')
    public tapFocus() {
        this.isMini = false;
    }
}
</script>
<style lang="scss" scoped>
</style>
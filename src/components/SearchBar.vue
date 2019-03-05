<template>
    <div>
        <header class="top">
            <div class="search-box">
                <form onsubmit="return false;">
                    <i class="fa fa-search" aria-hidden="true"></i>
                    <input type="text" name="keywords" v-model="keywords" @keyup="onKeyUp" placeholder="搜索" autocomplete="off">
                    <i class="fa fa-times-circle" v-if="keywords && keywords.length > 0" @click="tapClearSearch"></i>
                </form>
                <a class="cancel-btn" @click="tapBack">取消</a>
            </div>
        </header>
        <div class="has-header">
            <div class="search-recommend-box" v-if="!tip_list || tip_list.length == 0">
                <div class="panel" v-if="history_list && history_list.length > 0">
                    <div class="panel-header">
                        <span>历史记录</span>
                        <i class="fa fa-trash" @click="tapClearHistory"></i>
                    </div>
                    <div class="panel-body">
                        <a v-for="(item, index) in history_list" :key="index" @click="tapSearch(item)">{{ item }}</a>
                    </div>
                </div>
                <div class="panel" v-if="hot_keywords && hot_keywords.length > 0">
                    <div class="panel-header">
                        <span>热门搜索</span>
                    </div>
                    <div class="panel-body">
                        <a v-for="(item, index) in hot_keywords" :key="index" @click="tapSearch(item)">{{ item }}</a>
                    </div>
                </div>
            </div>
            <ul class="search-tip-box" v-else>
                <li v-for="(item, index) in tip_list" :key="index">
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
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class SearchBar extends Vue {
    @Prop(String) keywords?: string;

    hot_keywords?: string[] = [];
    tip_list?: string[] = [];
    history_list: string[] = [];
    created() {
        this.history_list = getLocalStorage<string[]>(KEYWORDS_HISTORY, true) || []
        getHot().then(res => {
            this.hot_keywords = res.data
        })
    }

    tapBack() {
        if (window.history.length <= 1) {
            this.$router.push('/')
            return;
        }
        this.$router.go(-1)
    }

    tapClearHistory() {
        this.history_list = []
        removeLocalStorage(KEYWORDS_HISTORY)
    }

    tapClearSearch() {
        this.keywords = ''
        this.tip_list = []
    }

    addHistory(keywords: string) {
        if (this.history_list.indexOf(keywords) >= 0) {
            return;
        }
        this.history_list.push(keywords);
        if (this.history_list.length > 8) {
            this.history_list.splice(8);
        }
        setLocalStorage(KEYWORDS_HISTORY, this.history_list)
    }

    onKeyUp(event: any) {
        if (!this.keywords || this.keywords.trim().length === 0) {
            return;
        }
        if (event.which === 13) {
            this.addHistory(this.keywords);
            this.tapSearch(this.keywords);
            return;
        }
        getTips(this.keywords).then(res => {
            this.tip_list = res.data
        })
    }

    tapSearch(keywords: string) {
        this.$emit('search', keywords);
    }
}
</script>
<style lang="scss" scoped>
</style>
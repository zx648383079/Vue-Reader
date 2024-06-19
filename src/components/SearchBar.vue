<template>
    <div>
        <SearchHeader :value="model" @input="updateVal" @enter="tapSearch" @keyup="onKeyUp" @focus="tapFocus"></SearchHeader>
        <div class="has-header" v-if="!isMini">
            <div class="search-recommend-box" v-if="!tipList || tipList.length == 0">
                <div class="panel" v-if="historyList && historyList.length > 0">
                    <div class="panel-header">
                        <span>历史记录</span>
                        <i class="iconfont icon-trash" @click="tapClearHistory"></i>
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
<script setup lang="ts">
const KEYWORDS_HISTORY = 'KEYWORDS_HISTORY';
import SearchHeader from './SearchHeader.vue';
import { getHot, getTips } from '@/api/book';
import { ref } from 'vue'
import { useRoute } from 'vue-router';
import { useCache } from '../services';

const route = useRoute();
const cache = useCache();
const emit = defineEmits(['focus', 'search']);
const model = defineModel({type: String, default: ''});

const hotKeywords = ref<string[]>([]);
const tipList = ref<string[]>([]);
const historyList = ref<string[]>([]);
const isMini = ref(false);

function updateVal(val: string) {
    model.value = val;
    if (!val || val.length < 1) {
        tipList.value = [];
        isMini.value = false;
    }
}
function tapClearHistory() {
    historyList.value = []
    cache.remove(KEYWORDS_HISTORY)
}
function addHistory(keywords: string) {
    if (historyList.value.indexOf(keywords) >= 0) {
        return;
    }
    historyList.value.push(keywords);
    if (historyList.value.length > 8) {
        historyList.value.splice(8);
    }
    cache.set(KEYWORDS_HISTORY, historyList)
}
function onKeyUp() {
    if (!model.value || model.value.length < 1) {
        tipList.value = [];
        return;
    }
    getTips(model.value).then(res => {
        tipList.value = res.data as any;
    });
}
function tapSearch(keywords: string) {
    if (!keywords || keywords.trim().length === 0) {
        return;
    }
    addHistory(keywords);
    emit('search', keywords);
    isMini.value = true;
}
function tapFocus() {
    emit('focus');
    isMini.value = false;
}

isMini.value = Object.keys(route.query).length > 0;
historyList.value = cache.get<string[]>(KEYWORDS_HISTORY, true) as any || [];
getHot().then(res => {
    hotKeywords.value = res.data as any;
});
</script>
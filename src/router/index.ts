import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/pages/Home.vue';
import Category from '@/pages/Category.vue';
import Search from '@/pages/Search.vue';
import Book from '@/pages/Book.vue';
import Chapter from '@/pages/Chapter.vue';
import Read from '@/pages/Read.vue';
import Bang from '@/pages/Bang.vue';
import Member from '@/pages/Member.vue';
import Login from '@/pages/Login.vue';

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
            meta: {
                title: '我的书架',
            },
        },
        {
            path: '/category',
            name: 'category',
            component: Category,
            meta: {
                title: '分类',
            },
        },
        {
            path: '/bang',
            name: 'bang',
            component: Bang,
            meta: {
                title: '分类榜单',
            },
        },
        {
            path: '/member',
            name: 'member',
            component: Member,
            meta: {
                title: '会员中心',
            },
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: {
                title: '登录',
            },
        },
        {
            path: '/search',
            name: 'search',
            component: Search,
            meta: {
                title: '搜索',
            },
        },
        {
            path: '/book/:id',
            name: 'book',
            component: Book,
            meta: {
                title: '书籍信息',
            },
        },
        {
            path: '/chapter/:book',
            name: 'chapter',
            component: Chapter,
            meta: {
                title: '书籍目录',
            },
        },
        {
            path: '/read/:id',
            name: 'read',
            component: Read,
            meta: {
                title: '阅读',
            },
        },
    ],
})

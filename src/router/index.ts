import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home.vue'
import Category from '@/pages/Category.vue'
import Search from '@/pages/Search.vue'
import Book from '@/pages/Book.vue'
import Chapter from '@/pages/Chapter.vue'
import Read from '@/pages/Read.vue'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
        },
        {
            path: '/category',
            name: 'category',
            component: Category,
        },
        {
            path: '/search',
            name: 'search',
            component: Search,
        },
        {
            path: '/book/{:id}',
            name: 'book',
            component: Book,
        },
        {
            path: '/chapter/{:book}',
            name: 'chapter',
            component: Chapter,
        },
        {
            path: '/read/{:id}',
            name: 'read',
            component: Read,
        },
    ],
})

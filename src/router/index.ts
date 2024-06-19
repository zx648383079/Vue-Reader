import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import Home from '@/pages/Home.vue';
import Category from '@/pages/Category.vue';
import Search from '@/pages/Search.vue';
import Book from '@/pages/Book.vue';
import Chapter from '@/pages/Chapter.vue';
import Read from '@/pages/Read.vue';
import Bang from '@/pages/Bang.vue';
import Member from '@/pages/Member.vue';
import Login from '@/pages/Login.vue';
import { globalSingleton } from '@/globe';
import { handleChangeLocale } from '@/i18n';
import { useAuth, useTheme } from '@/services';


const routes: Readonly<RouteRecordRaw[]> = [
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
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(this: Router, to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition;
        }
        const position: any = {};
        if (to.hash) {
            position.selector = to.hash;
            if (document.querySelector(to.hash)) {
                return position;
            }
            return;
        }
        return new Promise(resolve => {
            if (to.matched.some(m => m.meta.scrollToTop)) {
                position.x = 0
                position.y = 0
            }
            globalSingleton.once('scroll', () => {
                resolve(position);
            });
        });
    },
});

router.beforeEach(async(to, from, next) => {
    const auth = useAuth();
    if (to.meta.requireAuth && auth.isGuest) {
        return next({
            path: '/login',
            query: {
                redirect_uri: to.fullPath,
            }, // 将跳转的路由path作为参数，登录成功后跳转到该路由
        });
    }
    await handleChangeLocale(to.params.locale as string);
    return next();
});
router.afterEach((to, from) => {
    if (to.meta.title) {
        useTheme().setTitle(to.meta.title as string);
    }
});

export default router

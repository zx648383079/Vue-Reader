import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Http from './utils/http'
import Title from './utils/title'

import { assetsFilter, statusFilter, sizeFilter, agoFilter } from './pipes'
import { getSessionStorage } from './utils';
import { TOKEN_KEY } from './store/types';

import '@fortawesome/fontawesome-free/css/all.css';

Vue.filter('assets', assetsFilter);
Vue.filter('status', statusFilter);
Vue.filter('size', sizeFilter);
Vue.filter('ago', agoFilter);
Vue.use(Http)
Vue.use(Title)

router.beforeEach((to, from, next) => {
    const token = getSessionStorage<string>(TOKEN_KEY) // 获取本地存储的token
    if (to.meta.requireAuth) { // 判断该路由是否需要登录权限
        if (token && token.length > 0) { // 通过vuex state获取当前的token是否存
            next()
        } else {
            next({
                path: '/login',
                query: {
                    redirect: to.fullPath,
                }, // 将跳转的路由path作为参数，登录成功后跳转到该路由
            })
        }
    } else {
        next()
    }
})

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');

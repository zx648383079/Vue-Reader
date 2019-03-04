// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import Vuex from 'vuex'
import store from './store'
import Http from './utils/http'
import MintUI from 'mint-ui'
import VueTouch from 'vue-touch'
import 'mint-ui/lib/style.css'

Vue.config.productionTip = false
Vue.use(Vuex)
Vue.use(MintUI)
Vue.use(Http)
Vue.use(VueTouch, {name: 'v-touch'})

router.beforeEach((to, from, next) => {
  store.state.token = sessionStorage.getItem('token') // 获取本地存储的token
  if (to.meta.requireAuth) { // 判断该路由是否需要登录权限
    if (store.state.token !== '') { // 通过vuex state获取当前的token是否存
      next()
    } else {
      next({
        path: '/login',
        query: {
          redirect: to.fullPath
        }// 将跳转的路由path作为参数，登录成功后跳转到该路由
      })
    }
  } else {
    next()
  }
})

// http response 拦截器
axios.interceptors.response.use(
  response => {
    if (response.data.errCode === 2) {
      router.push({
        path: '/login',
        querry: {
          redirect: router.currentRoute.fullPath
        } // 从哪个页面跳转
      })
    }
    return response
  },
  error => {
    return Promise.reject(error)
  }
)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

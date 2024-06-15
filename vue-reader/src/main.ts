import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import http from './utils/http'

createApp(App).use(http).use(store).use(router).mount('#app')

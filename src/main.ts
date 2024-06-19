import './assets/iconfont/iconfont.css';
import './assets/css/style.scss';


import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { createSerive } from './services';
import { globalSingleton } from './globe';
import { i18n } from './i18n';
import { createDialog } from './components/Dialog';

globalSingleton.reload();
const app = createApp(App, {
    onscroll(e: Event) {
        globalSingleton.emit('scroll', e);
    }
});


app.use(createPinia());
app.use(createSerive());
app.use(createDialog());
app.use(i18n);
app.use(router);

app.mount('#app');

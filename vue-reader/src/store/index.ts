import { createStore } from 'vuex';
import { AuthModule } from './modules/auth';
import { BookModule } from './modules/book';

const store = createStore({});

export const authModule = new AuthModule({store, name: 'auth'});
export const bookModule = new BookModule({store, name: 'book'});

export default store;
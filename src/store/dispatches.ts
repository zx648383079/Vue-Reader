import store from './';
import { IBook, IChapter, ICategory, IUser } from '@/api/book';

export const dispatchBook = (id: number): Promise<IBook> => store.dispatch('getBook', id);

export const dispatchChapters = (book: number): Promise<IChapter[]> => store.dispatch('getChapters', book);

export const dispatchChapter = (id: number): Promise<IChapter> => store.dispatch('getChapter', id);

export const dispatchCategories = (): Promise<ICategory[]> => store.dispatch('getCategories');


export const dispatchUser = (): Promise<IUser> => store.dispatch('getUser');

export const dispatchSetToken = (token: string) => store.dispatch('setToken', token);

export const dispatchLogin =
    (param: any): Promise<IUser> => store.dispatch('loginUser', param);

export const dispatchLogout = (): Promise<any> => store.dispatch('logoutUser');

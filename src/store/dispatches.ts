import store from './';
import { IBook, IChapter, ICategory } from '@/api/book';

export const dispatchBook = (id: number): Promise<IBook> => store.dispatch('getBook', id);

export const dispatchChapters = (book: number): Promise<IChapter[]> => store.dispatch('getChapters', book);

export const dispatchChapter = (id: number): Promise<IChapter> => store.dispatch('getChapter', id);

export const dispatchCategories = (): Promise<ICategory[]> => store.dispatch('getCategories');

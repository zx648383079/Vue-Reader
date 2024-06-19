import { fetch, post } from '../utils/http'
import type { IData, IPage, IBook, ICategory, IAuthor, IChapter, IUser } from './model';

export const getHot = () => fetch<IData<string>>('book/home/hot');

export const getTips = (keywords: string) => fetch<IData<string>>('book/home/suggest', {keywords});

export const getBookList = (params: any) => fetch<IPage<IBook>>('book', params);

export const getCategories = () => fetch<IData<ICategory>>('book/category');

export const getAuthors = () => fetch<IData<IAuthor>>('book/author');

export const getBook = (id: number) => fetch<IBook>('book', {id});

export const getChapters = (book: number, page = 1, perPage = 2000) =>
    fetch<IPage<IChapter>>('book/chapter', {book, page, per_page: perPage});

export const getChapter = (id: number) => fetch<IChapter>('book/chapter', {id});

export const getHistory = () => fetch<IData<any>>('book/history');
export const recordHistory = (book: number, chapter: number, progress: number) =>
    post<any>('book/history/record', {book, chapter, progress});

export const getTheme = () => fetch<IData<any>>('book/theme');
export const saveTheme = (params: any) =>
    post<any>('book/theme/save', params);

export const login = (param: any) => post<IUser>('auth/login', param);

export const logout = () => fetch('auth/logout');

export const getProfile = () => fetch<IUser>('auth/user');

import { fetch, post } from '../utils/http'

export interface IPaging {
    limit: number;
    offset: number;
    total: number;
    more: boolean;
}

export interface IPage<T> {
    paging: IPaging;
    data: T[];
}

export interface IBaseResponse {
    appid?: string;
    sign?: string;
    sign_type?: string;
    timestamp?: string;
    encrypt?: string;
    encrypt_type?: string;
}
export interface IData<T> extends IBaseResponse {
    data?: T[];
}

export interface ICategory {
    id: number,
    name: string,
    book_count?: number,
}

export interface IAuthor {
    id: number,
    name: string,
    book_count?: number,
}

export interface IBook {
    id: number,
    name: string,
    cover: string,
    description: string,
    size: number,
    click_count: number,
    classify: number,
    chapter_count: number,
    over_at: number,
    updated_at: string,
    category?: ICategory,
    author?: IAuthor,
    last_chapter?: IChapter,
    first_chapter?: IChapter,
}

export interface IChapter {
    id: number,
    title?: string,
    size?: number,
    content?: string,
    book_id?: number,
    previous?: IChapter,
    next?: IChapter,
}

export interface IUser {
    id: number;
    email: string;
    name: string;
    avatar: string;
    token?: string;
}

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

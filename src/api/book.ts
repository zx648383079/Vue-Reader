import { fetch } from '../utils/http'

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
    cover: number,
    description: string,
    size: number,
    click_count: number,
    classify: number,
    chapter_count?: number,
    over_at: number,
    updated_at: string,
    category?: ICategory,
    author?: IAuthor,
    last_chapter?: IChapter,
}

export interface IChapter {
    id: number,
    title: string,
    size: number,
    content?: string,
    previous?: IChapter,
    next?: IChapter,
}

export const getHot = () => fetch<IData<string>>('book/home/hot');

export const getTips = () => fetch<IData<string>>('book/home/suggest');

export const getBookList = (params: any) => fetch<IPage<IBook>>('book', params);

export const getCategories = () => fetch<IData<ICategory>>('book/category');

export const getAuthors = () => fetch<IData<IAuthor>>('book/author');

export const getBook = (id: number) => fetch<IBook>('book', {id});

export const getChapters = (book: number) => fetch<IData<IChapter>>('book/chapter', {book});

export const getChapter = (id: number) => fetch<IChapter>('book/chapter', {id});

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
    name?: string,
    cover?: string,
    description?: string,
    size?: number,
    click_count?: number,
    classify?: number,
    chapter_count?: number,
    over_at?: number,
    updated_at?: string,
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
    created_at?: string;
    previous?: IChapter,
    next?: IChapter,
}

export interface ILogin {
    email?: string;
    password?: string;
    mobile?: string;
    captcha?: any;
    captcha_token?: string;
    code?: string;
    agree?: number|boolean;
}

export interface IRegister {
    name: string;
    email?: string;
    password?: string;
    confirm_password?: string;
    invite_code?: string;
    mobile?: string;
    code?: string;
    agree?: number|boolean;
}

export interface IUser {
    id: number;
    email: string;
    name: string;
    avatar: string;
    token?: string;
}
import { saveTheme, recordHistory } from '@/api/book';
import { FOLLOW_BOOK, THEME_CONFIGS_KEY } from '@/stores/types';
import { FlipKind } from '../utils/flipViewer';
import type { IBook, IChapter } from '@/api/model';
import { useCache } from './register';

export interface IBookRecord extends IBook {
    author_name: string,
    read_at: number,
    chapter_id: number;
    chapter_title: string,
    process: number
}

export interface ITheme {
    [key: string]: any,
    font?: number,
    theme?: number,
    oldTheme?: any, // 记录夜间模式切换
    size?: number,
    line?: number,
    letter?: number,
    background?: string,
    color?: string,
    flip?: number| FlipKind,
}

interface TBookRecord {
    [id: number]: IBookRecord
}

export class BookService {
    public get(): TBookRecord {
        return useCache().get<TBookRecord>(FOLLOW_BOOK, true) || {};
    }

    /**
     * getItems
     */
    public getItems(): IBookRecord[] {
        const books = [];
        const data = this.get();
        for (const id in data) {
            if (data.hasOwnProperty(id)) {
                books.push(data[id]);
            }
        }
        return books;
    }

    public save(books: TBookRecord) {
        useCache().set(FOLLOW_BOOK, books);
    }

    /**
     * has
     */
    public has(id: number): boolean {
        return this.get().hasOwnProperty(id);
    }

    /**
     * 获取
     * @param id
     */
    public getItem(id: number): IBookRecord | undefined {
        return this.has(id) ? this.get()[id] : undefined;
    }

    /**
     * remove
     */
    public remove(id: number) {
        if (!this.has(id)) {
            return;
        }
        const books = this.get();
        delete books[id];
        this.save(books);
    }

    public add(book: IBook, chapter: IChapter, process: number = 0) {
        const record: IBookRecord = {
            id: book.id,
            name: book.name,
            cover: book.cover,
            author_name: book.author ? book.author.name : '',
            chapter_id: chapter.id,
            chapter_title: chapter.title + '',
            process,
            read_at: new Date().getTime(),
        } as any;
        const books = this.get();
        books[book.id] = record;
        this.save(books);
        recordHistory(book.id, chapter.id, process).then(() => {});
    }

    public update(chapter: IChapter, process: number = 0) {
        if (!chapter.book_id) {
            return;
        }
        const books = this.get();
        books[chapter.book_id].chapter_id = chapter.id;
        books[chapter.book_id].chapter_title = chapter.title + '';
        books[chapter.book_id].process = process;
        books[chapter.book_id].read_at = new Date().getTime();
        this.save(books);
        recordHistory(chapter.book_id, chapter.id, process).then(() => {});
    }

    /**
     * getTheme
     */
    public getTheme(): ITheme {
        const theme = useCache().get<ITheme>(THEME_CONFIGS_KEY, true);
        if (theme) {
            return theme;
        }
        return {
            font: 3,
            theme: 0,
            oldTheme: '#fff|#333', // 记录夜间模式切换
            size: 18,
            line: 10,
            letter: 4,
            flip: 1,
            background: '#fff',
            color: '#333',
        };
    }

    public saveTheme(theme: ITheme) {
        useCache().set(THEME_CONFIGS_KEY, theme);
        saveTheme(theme).then(() => {

        });
    }
}

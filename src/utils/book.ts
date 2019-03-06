import { IChapter, IBook } from '@/api/book';
import { getLocalStorage, setLocalStorage } from '.';
import { FOLLOW_BOOK } from '@/store/types';

export interface IBookRecord extends IBook {
    author_name: string,
    read_at: number,
    chapter_id: number;
    chapter_title: string,
    process: number
}

interface TBookRecord {
    [id: number]: IBookRecord
}

class Book {
    public get(): TBookRecord {
        return getLocalStorage<TBookRecord>(FOLLOW_BOOK, true) || {};
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
        setLocalStorage(FOLLOW_BOOK, books);
    }

    /**
     * has
     */
    public has(id: number): boolean {
        return this.get().hasOwnProperty(id);
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
            chapter_title: chapter.title,
            process,
            read_at: new Date().getTime(),
        };
        const books = this.get();
        books[book.id] = record;
        this.save(books);
    }
}

export default new Book();

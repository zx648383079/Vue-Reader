import { defineStore } from "pinia";
import type { IBook, ICategory, IChapter, IUser } from "../api/model";
import { withBoot } from "../utils";
import { getBook, getCategories, getChapter, getChapters } from "@/api/book";


interface BookState {
    bookInfo: IBook | null,
    chapters: IChapter[],
    categories: ICategory[],
};

export const useBookStore = defineStore('book', {
    state(): BookState {
        return {
            bookInfo: null,
            chapters: [],
            categories: [],
        };
    },
    
    actions: {
        getBook(id: number) {
            return new Promise<IBook>((resolve, reject) => {
                if (this.bookInfo && this.bookInfo.id === id) {
                    resolve(this.bookInfo);
                    return;
                }
                getBook(id).then(res => {
                    this.bookInfo = res;
                    resolve(res);
                }).catch(reject);
            });
        },
        getCategories() {
            return new Promise<ICategory[]>((resolve, reject) => {
                if (this.categories && this.categories.length > 0) {
                    resolve(this.categories);
                    return;
                }
                getCategories().then(res => {
                    this.categories = res.data as any;
                    resolve(res.data as any);
                }).catch(reject);
            });
        },
        getChapters(book: number) {
            return new Promise<IChapter[]>((resolve, reject) => {
                if (this.chapters.length > 0
                    && this.chapters[0].book_id === book) {
                    resolve(this.chapters);
                    return;
                }
                getChapters(book).then(res => {
                    this.chapters = res.data as any;
                    resolve(res.data);
                });
            });
        },
        getChapter(id: number) {
            const hasChapter = (): IChapter| boolean => {
                if (!this.chapters || this.chapters.length < 1) {
                    return false;
                }
                for (const item of this.chapters) {
                    if (item.id === id && item.content) {
                        return item;
                    }
                }
                return false;
            };
            const setChapter = (res: IChapter) => {
                if (!res || !this.chapters || this.chapters.length < 1) {
                    return;
                }
                const chapters = this.chapters;
                for (let i = 0; i < chapters.length; i++) {
                    if (res.id === chapters[i].id) {
                        chapters[i] = res;
                    }
                }
                this.chapters = chapters;
            };
            return new Promise<IChapter>((resolve, reject) => {
                const chapter = hasChapter();
                if (chapter) {
                    resolve(chapter as any);
                    return;
                }
                getChapter(id).then(res => {
                    setChapter(res);
                    resolve(res);
                });
            });
        },
    }
    
});
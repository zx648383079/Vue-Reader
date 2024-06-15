import { Action, Module, Mutation, VuexModule } from "vuex-class-modules";
import { getBook, getCategories, getChapter, getChapters, IBook, ICategory, IChapter } from "../../api/book";
import { SET_BOOK, SET_CATEGORIES, SET_CHAPTER, SET_CHAPTERS } from "../types";


@Module({ generateMutationSetters: true })
export class BookModule extends VuexModule {
    
    bookInfo: IBook | null = null;
    chapters: IChapter[] = [];
    categories: ICategory[] = [];

    @Mutation
    [SET_BOOK](book: IBook) {
        this.bookInfo = book;
    }

    @Mutation
    [SET_CATEGORIES](categories: ICategory[]) {
        this.categories = categories;
    }

    @Mutation
    [SET_CHAPTERS](chapters: IChapter[]) {
        this.chapters = chapters;
    }

    @Mutation
    [SET_CHAPTER](chapter: IChapter) {
        if (!chapter || !this.chapters || this.chapters.length < 1) {
            return;
        }
        const chapters = this.chapters;
        for (let i = 0; i < chapters.length; i++) {
            if (chapter.id === chapters[i].id) {
                chapters[i] = chapter;
            }
        }
        this.chapters = chapters;
    }

    @Action
    getBook(id: number) {
        return new Promise<IBook>((resolve, reject) => {
            if (this.bookInfo && this.bookInfo.id === id) {
                resolve(this.bookInfo);
                return;
            }
            getBook(id).then(res => {
                this[SET_BOOK](res);
                resolve(res);
            }).catch(reject);
        });
    }

    @Action
    getCategories() {
        return new Promise<ICategory[]>((resolve, reject) => {
            if (this.categories && this.categories.length > 0) {
                resolve(this.categories);
                return;
            }
            getCategories().then(res => {
                this[SET_CATEGORIES](res.data as any[]);
                resolve(res.data as any[]);
            }).catch(reject);
        });
    }

    @Action
    getChapters(book: number) {
        return new Promise<IChapter[]>((resolve, reject) => {
            if (this.chapters.length > 0
                && this.chapters[0].book_id === book) {
                resolve(this.chapters);
                return;
            }
            getChapters(book).then(res => {
                this[SET_CHAPTERS](res.data);
                resolve(res.data);
            });
        });
    }

    @Action
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
        return new Promise<IChapter>((resolve, reject) => {
            const chapter = hasChapter();
            if (chapter) {
                resolve(chapter as IChapter);
                return;
            }
            getChapter(id).then(res => {
                this[SET_CHAPTER](res);
                resolve(res);
            });
        });
    }
}
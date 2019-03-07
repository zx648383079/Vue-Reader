import {
    IBook,
    IChapter,
    getBook,
    getChapters,
    getChapter,
    ICategory,
    getCategories,
} from '@/api/book';
import {
    SET_BOOK,
    SET_CHAPTERS,
    SET_CHAPTER,
    SET_CATEGORIES,
} from '../types';
import {
    Commit,
} from 'vuex';


export interface State {
    bookInfo: IBook | null,
    chapters: IChapter[],
    categories: ICategory[],
};

interface IActionContext {
    commit: Commit;
    state: State;
}

// initial state
// shape: [{ id, quantity }]
const initState: State = {
    bookInfo: null,
    chapters: [],
    categories: [],
};

// getters
const getters = {};

// actions
const actions = {
    getBook(context: IActionContext, id: number) {
        return new Promise((resolve, reject) => {
            if (context.state.bookInfo && context.state.bookInfo.id === id) {
                resolve(context.state.bookInfo);
                return;
            }
            getBook(id).then(res => {
                context.commit(SET_BOOK, res);
                resolve(res);
            }).catch(reject);
        });
    },
    getCategories(context: IActionContext) {
        return new Promise((resolve, reject) => {
            if (context.state.categories && context.state.categories.length > 0) {
                resolve(context.state.categories);
                return;
            }
            getCategories().then(res => {
                context.commit(SET_BOOK, res.data);
                resolve(res.data);
            }).catch(reject);
        });
    },
    getChapters(context: IActionContext, book: number) {
        return new Promise((resolve, reject) => {
            if (context.state.chapters.length > 0
                && context.state.chapters[0].book_id === book) {
                resolve(context.state.chapters);
                return;
            }
            getChapters(book).then(res => {
                context.commit(SET_CHAPTERS, res.data);
                resolve(res.data);
            });
        });
    },
    getChapter(context: IActionContext, id: number) {
        const hasChapter = function(): IChapter| boolean {
            if (!context.state.chapters || context.state.chapters.length < 1) {
                return false;
            }
            for (const item of context.state.chapters) {
                if (item.id === id && item.content) {
                    return item;
                }
            }
            return false;
        };
        return new Promise((resolve, reject) => {
            const chapter = hasChapter();
            if (chapter) {
                resolve(chapter);
                return;
            }
            getChapter(id).then(res => {
                context.commit(SET_CHAPTER, res);
                resolve(res);
            });
        });
    }
};

// mutations
const mutations = {
    [SET_BOOK](state: State, book: IBook) {
        state.bookInfo = book;
    },
    [SET_CATEGORIES](state: State, categories: ICategory[]) {
        state.categories = categories;
    },
    [SET_CHAPTERS](state: State, chapters: IChapter[]) {
        state.chapters = chapters;
    },
    [SET_CHAPTER](state: State, chapter: IChapter) {
        if (!chapter || !state.chapters || state.chapters.length < 1) {
            return;
        }
        const chapters = state.chapters;
        for (let i = 0; i < chapters.length; i++) {
            if (chapter.id === chapters[i].id) {
                chapters[i] = chapter;
            }
        }
        state.chapters = chapters;
    },
};

export default {
    state: initState,
    getters,
    actions,
    mutations,
}
import store, { authModule, bookModule } from './';
import { IBook, IChapter, ICategory, IUser } from '@/api/book';

export const dispatchBook = (id: number): Promise<IBook> => bookModule.getBook(id);

export const dispatchChapters = (book: number): Promise<IChapter[]> =>  bookModule.getChapters(book);

export const dispatchChapter = (id: number): Promise<IChapter> => bookModule.getChapter(id);

export const dispatchCategories = (): Promise<ICategory[]> => bookModule.getCategories();


export const dispatchUser = (): Promise<IUser|null> => authModule.getUser();

export const dispatchSetToken = (token: string) => authModule.setToken(token);

export const dispatchLogin =
    (param: any): Promise<IUser> => authModule.loginUser(param);

export const dispatchLogout = (): Promise<any> => authModule.logoutUser();

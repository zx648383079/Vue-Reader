import { type App, type Plugin, type InjectionKey } from 'vue';
import type { IHttpClient } from "./types";
import { HttpClient } from "./http";
import { EncryptorService } from './encryptor';
import { CookieService } from './cookie';
import { CacheService } from './cache';
import { AuthService } from './auth';
import { ThemeService } from './theme';
import { globalSingleton } from '../globe';
import { BookService } from './book';

const httpInjectionKey: InjectionKey<string> = Symbol('httpclient');
const encryptorInjectionKey: InjectionKey<string> = Symbol('encryptor');
const cookieInjectionKey: InjectionKey<string> = Symbol('cookie');
const cacheInjectionKey: InjectionKey<string> = Symbol('cache');
const authInjectionKey: InjectionKey<string> = Symbol('auth');
const themeInjectionKey: InjectionKey<string> = Symbol('theme');
const bookInjectionKey: InjectionKey<string> = Symbol('book');

export function useHttp(): IHttpClient {
    return globalSingleton.inject<IHttpClient>(httpInjectionKey, () => new HttpClient());
}

export function useEncryptor(): EncryptorService {
    return globalSingleton.inject<EncryptorService>(encryptorInjectionKey, () => new EncryptorService());
}

export function useCookie(): CookieService {
    return globalSingleton.inject<CookieService>(cookieInjectionKey, () => new CookieService());
}

export function useCache(): CacheService {
    return globalSingleton.inject<CacheService>(cacheInjectionKey, () => new CacheService());
}

export function useAuth(): AuthService {
    return globalSingleton.inject<AuthService>(authInjectionKey, () => new AuthService());
}

export function useTheme(): ThemeService {
    return globalSingleton.inject<ThemeService>(themeInjectionKey, () => new ThemeService());
}

export function useBook(): BookService {
    return globalSingleton.inject<BookService>(bookInjectionKey, () => new BookService());
}

export function createSerive(): Plugin {
    return (app: App) => {
        globalSingleton.provide<IHttpClient>(httpInjectionKey, new HttpClient(), app)
        .provide<EncryptorService>(encryptorInjectionKey, new EncryptorService(), app)
        .provide<CookieService>(cookieInjectionKey, new CookieService(), app)
        .provide<CacheService>(cacheInjectionKey, new CacheService(), app)
        .provide<AuthService>(authInjectionKey, new AuthService(), app)
        .provide<ThemeService>(themeInjectionKey, new ThemeService(), app)
        .provide<BookService>(bookInjectionKey, new BookService(), app)
        ;
    };
}
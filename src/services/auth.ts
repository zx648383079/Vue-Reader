import { Md5 } from "ts-md5";
import * as environment from '../config/config';
import { getCurrentTime, uriEncode } from "../utils";
import { useCache, useCookie, useEncryptor, useTheme } from "./register";
import { useDialog } from "../components/Dialog";
import { useAuthStore } from "../stores/auth";
import { TOKEN_KEY } from "../stores/types";
import type { ILogin, IRegister, IUser } from "../api/model";
import { login, logout, register } from "../api/user";
import { batch } from '../api/site';

interface IAppParam {
    appid: string,
    timestamp: string,
    sign: string,
}

export class AuthService {

    public get isGuest() {
        return !this.getUserToken();
    }


    public encrypt<T>(data: T, keys: string[]): T {
        const encryptor = useEncryptor();
        for (const key of keys) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                (data as any)[key] = encryptor.encrypt((data as any)[key]);
            }
        }
        return data;
    }
    
    public login(params: ILogin) {
        return login(this.encrypt(params, ['password'])).then((res: IUser) => {
            useAuthStore().setUser(res).then();
            this.setUser(res);
            return res;
        });
    }

    public register(params: IRegister) {
        return register(this.encrypt(params, ['password'])).then((res: IUser) => {
            useAuthStore().setUser(res).then();
            this.setUser(res);
            return res;
        });
    }
    
    public logout() {
        return new Promise<void>((resolve, reject) => {
            const token = this.getUserToken();
            if (!token) {
                resolve();
                return;
            }
            this.setUserToken();
            logout().then(() => {
                useAuthStore().$reset();
                resolve();
            }).catch(reject);
        });
    }

    /**
     * 系统启动时调用, 加载系统设置和用户登录信息
     */
    public systemBoot() {
        let token = this.getUserToken();
        const key = this.loadFromCookie();
        if (key) {
            token = key;
        }
        const options = token ? {
            headers: {
                Authorization: `Bearer ${token}`
            }
        } : {};
        return batch<{
            shop_information: any;
            seo_configs: any,
            auth_profile: IUser|undefined,
        }>({
            seo_configs: {},
            auth_profile: {},
            shop_information: {},
        }, options).then(res => {
            useTheme().ready(res);
            if (res.auth_profile && !(res.auth_profile instanceof Array)) {
                const user = res.auth_profile;
                user.token = token;
                this.setUser(user, true);
                return user;
            }
            this.setUserToken();
            return undefined;
        });
    }

    private now() {
        // return getCurrentTime();
        return useEncryptor().getCurrentTime();
    }

    /**
     * 保存user 到本地
     * @param user 
     * @param withToken 是否更新token
     */
    public setUser(user: IUser, withToken = true) {
        if (withToken) {
            this.setUserToken(user.token);
        }
    }

    public setUserToken(token?: string|null) {
        if (token) {
            useCache().set(TOKEN_KEY, token);
            return;
        }
        useCache().remove(TOKEN_KEY);
    }

    public getUserToken(): string|null {
        return useCache().get(TOKEN_KEY);
    }


    public loadFromCookie(): string|undefined {
        const key = environment.appId + 'token';
        const cookie = useCookie();
        const str = cookie.get(key);
        if (!str) {
            return;
        }
        const data = JSON.parse(str);
        cookie.delete(key);
        if (data.code !== 200) {
            useDialog().error(data.error);
            return;
        }
        return data.token;
    }

    public getAppParams(): IAppParam {
        const timestamp = this.now();
        const sign = Md5.hashStr(environment.appId + timestamp + environment.secret) + '';
        return {
            appid: environment.appId,
            timestamp,
            sign,
        };
    }

    public authUri(type: string, redirect_uri: string): string {
        return this.apiUri('auth/oauth', {
            type,
            redirect_uri});
    }

    public assetUri(value: string): string|null {
        if (!value) {
            return null;
        }
        if (value.indexOf('//') >= 0) {
            return value;
        }
        if (value.startsWith('/')) {
            return environment.assetUri + value;
        }
        return environment.assetUri + '/' + value;
    }
    
    public apiUri(path: string, queries: Object = {}): string {
        const timestamp = getCurrentTime();
        const sign = Md5.hashStr(environment.appId + timestamp + environment.secret);
        return uriEncode(environment.apiEndpoint + (path.startsWith('/') ? path.substring(1) : path), {
            ...queries,
            appid: environment.appId,
            timestamp,
            sign,
        }, true);
    }
}
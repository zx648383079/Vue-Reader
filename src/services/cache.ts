export class CacheService {
    public set(key: string, value: any) {
        let val = value;
        if (typeof value !== 'string') {
            val = JSON.stringify(value);
        }
        window.localStorage.setItem(key, val);
    }
    
    public get(key: string): string|null;
    public get<T>(key: string, decode: true): T;
    public get<T>(key: string, decode = false): T {
        const val = window.localStorage.getItem(key);
        return !val || !decode ? val : JSON.parse(val);
    }
    
    public remove(key: string) {
        window.localStorage.removeItem(key);
    }

    public clear() {
        window.localStorage.clear();
        window.sessionStorage.clear();
    }
    
    public setSession(key: string, value: any) {
        let val = value;
        if (typeof value !== 'string') {
            val = JSON.stringify(value);
        }
        window.sessionStorage.setItem(key, val);
    }
    
    public getSession<T>(key: string, decode = false): T {
        const val = window.sessionStorage.getItem(key);
        return !val || !decode ? val : JSON.parse(val);
    }
    
    public removeSession(key: string) {
        window.sessionStorage.removeItem(key);
    }
}
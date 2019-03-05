export const apiEndpoint = 'http://zodream.localhost/open/'
export const assetUri = 'http://zodream.localhost'
export const appId = '11543906547'
export const secret = '012e936d3d3653b40c6fc5a32e4ea685'

export function setLocalStorage(key: string, value: any) {
    let val = value;
    if (typeof value !== 'string') {
        val = JSON.stringify(value);
    }
    window.localStorage.setItem(key, val);
}

export function getLocalStorage<T>(key: string, decode = false): T {
    const val = window.localStorage.getItem(key);
    return !val || !decode ? val : JSON.parse(val);
}

export function removeLocalStorage(key: string) {
    window.localStorage.removeItem(key);
}

export function setSessionStorage(key: string, value: any) {
    let val = value;
    if (typeof value !== 'string') {
        val = JSON.stringify(value);
    }
    window.sessionStorage.setItem(key, val);
}

export function getSessionStorage<T>(key: string, decode = false): T {
    const val = window.sessionStorage.getItem(key);
    return !val || !decode ? val : JSON.parse(val);
}

export function removeSessionStorage(key: string) {
    window.sessionStorage.removeItem(key);
}

export function search(key: string) {
    const reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)');
    const url = window.location.hash === '' ?
        window.location.search :
        window.location.hash.substring(window.location.hash.indexOf('?'));
    const r = url.substr(1).match(reg);
    return r === null ? null : unescape(r[2]);
}

export function getCurrentTime() {
    const now = new Date()
    const format = (i: number) => i < 10 ? '0' + i : i
    return now.getFullYear() +
        '-' + format(now.getMonth() + 1) +
        '-' + format(now.getDate()) +
        ' ' + format(now.getHours()) +
        ':' + format(now.getMinutes()) +
        ':' + format(now.getSeconds())
}

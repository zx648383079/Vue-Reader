
/**
 * 格式化数字
 * @param val 
 * @returns 
 */
export function parseNumber(val: any): number {
    if (!val || isNaN(val)) {
        return 0;
    }
    if (typeof val === 'number') {
        return val;
    }
    if (typeof val === 'boolean') {
        return val ? 1 : 0;
    }
    if (typeof val !== 'string') {
        val = val.toString();
    }
    if (val.indexOf(',') > 0) {
        val = val.replace(/,/g, '');
    }
    if (val.indexOf('.') > 0) {
        val = parseFloat(val);
    } else {
        val = parseInt(val, 10);
    }
    return isNaN(val) ? 0 : val;
}

/**
 * 拼接网址
 * @param path 
 * @param obj 
 * @param unEncodeURI 不要编码
 * @returns 
 */
export function uriEncode(path: string, obj: Object = {}, unEncodeURI?: boolean): string {
    const result: string[] = [];
    const pushQuery = (key: string, value: any) => {
        if (typeof value !== 'object') {
            result.push(key + '=' + (unEncodeURI ? value : encodeURIComponent(value)));
            return;
        }
        if (value instanceof Array) {
            value.forEach(v => {
                pushQuery(key + '[]', v);
            });
            return;
        }
        eachObject(value, (v, k) => {
            pushQuery(key + '[' + k +']', v);
        });
    }
    for (const name in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, name)) {
            pushQuery(name, (obj as any)[name]);
        }
    }
    if (result.length < 1) {
        return path;
    }
    return path + (path.indexOf('?') > 0 ? '&' : '?') + result.join('&');
}


/**
 * 遍历对象属性或数组
 */
export function eachObject<K = string|number, V = any>(obj: any, cb: (val: V, key: K) => boolean| void): any {
    if (typeof obj !== 'object') {
        return cb(obj, undefined as any);
    }
    if (obj instanceof Array) {
        for (let i = 0; i < obj.length; i++) {
            if (cb(obj[i], i as any) === false) {
                return false;
            }
        }
        return;
    }
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (cb(obj[key], key as any) === false) {
                return false;
            }
        }
    }
}


export function search(key: string) {
    const reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)');
    const url = window.location.hash === '' ?
        window.location.search :
        window.location.hash.substring(window.location.hash.indexOf('?'));
    const r = url.substring(1, 1).match(reg);
    return r === null ? null : decodeURIComponent(r[2]);
}

export function getCurrentTime() {
    return formatTime(new Date());
}

export function twoPad(i: number): string {
    return i < 10 ? '0' + i : i + '';
}

export function parseDate(date: any): Date {
    if (!date) {
        return new Date();
    }
    if (typeof date === 'object') {
        return date;
    }
    if (typeof date === 'string' && date.indexOf('-') > 0) {
        date.replace('-', '/');
    }
    if (typeof date === 'number' && ('' + date).length  === 10) {
        date *= 1000;
    }
    date = new Date(date);
    if (isNaN(date.getTime())) {
        return new Date();
    }
    return date;
}

export function formatTime(time: Date) {
    return time.getFullYear() +
        '-' + twoPad(time.getMonth() + 1) +
        '-' + twoPad(time.getDate()) +
        ' ' + twoPad(time.getHours()) +
        ':' + twoPad(time.getMinutes()) +
        ':' + twoPad(time.getSeconds())
}

/**
 * 等待异步加载完成
 * @param cb 
 * @param maxTimeout 
 * @returns 
 */
export function withBoot(cb: () => boolean, maxTimeout = 500) {
    const timeout = 50;
    return new Promise((resolve, reject) => {
        let retry = 0;
        const func = () => {
            if (cb()) {
                resolve();
                return;
            }
            if (retry >= maxTimeout) {
                reject('timeout');
                return;
            }
            setTimeout(func, timeout);
            retry += timeout;
        };
        func();
    });
}

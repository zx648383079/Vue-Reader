import { eachObject, parseNumber, uriEncode } from "../utils";

type HistoryCheckFn = (val: any, name: string) => boolean;

const HistoryTitle = 'Query results';

export class SearchService {

    private queriesCheckFn: HistoryCheckFn = this.queriesDefaultCheck({keywords: '', page: 1, per_page: 20});

    /**
    * 从当前页面链接获取查询参数
    * @param routeQueries 全部参数
    * @param def 默认的参数，根据这个筛选并格式化参数
    * @returns 合并之后的参数
    */
    public getQueries<T>(routeQueries: any, def: T): T {
        const queries: any = {};
        eachObject<string, any>(def, (val, key) => {
            if (!routeQueries || !Object.prototype.hasOwnProperty.call(routeQueries, key)) {
                queries[key] = val;
                return;
            }
            if (typeof val === 'number') {
                queries[key] = parseNumber(routeQueries[key]);
                return;
            }
            if (typeof val === 'boolean') {
                queries[key] = routeQueries[key] === true || routeQueries[key] === '1' || routeQueries[key] === 'true';
                return;
            }
            queries[key] = typeof routeQueries[key] === 'undefined' || routeQueries[key] === null ? '' : routeQueries[key];
        });
        return queries;
    };




    /**
    * 记录查询历史
    * @param queries 
    */
    public applyHistory(queries: any): void;
    /**
     * 记录查询历史
     * @param queries 
     * @param exclude 排除一些key
     */
    public applyHistory(queries: any, exclude: string[]): void;

    /**
    * 记录查询历史
    * @param queries 
    * @param check 移除一些默认的参数
    */
    public applyHistory(queries: any, check: HistoryCheckFn): void;

    /**
    * 记录查询历史
    * @param queries 
    * @param scrollTop 是否回到顶部
    */
    public applyHistory(queries: any, scrollTop: boolean): void;

    /**
    * 记录查询历史
    * @param queries 
    * @param title 记录的标题
    * @param check 移除一些默认的参数
    * @param scrollTop 是否回到顶部
    * @param exclude 排除一些key
    */
    public applyHistory(queries: any, title: string|string[]|boolean|HistoryCheckFn = HistoryTitle, check: HistoryCheckFn = this.queriesCheckFn, scrollTop = true, exclude?: string[]): void {
        if (typeof title === 'function') {
            [check, title] = [title, HistoryTitle]
        } else if (typeof title === 'boolean') {
            [scrollTop, title] = [title, HistoryTitle];
        } else if (typeof title === 'object' && title instanceof Array) {
            [exclude, title] = [title, HistoryTitle]
        }
        const params: any = {};
        eachObject(queries, (val, key) => {
            if (exclude && exclude.indexOf(key as string) >= 0) {
                return;
            }
            if (check && check(val, key as string) === false) {
                return;
            }
            params[key] = val;
        });
        const url = window.location.href;
        const path = url.split('?', 2)[0];
        const newUrl = uriEncode(path, params);
        this.pushHistoryState(title, newUrl);
        if (scrollTop) {
            document.documentElement.scrollTop = 0;
        }
    };

    /**
    * 设置当前网址
    * @param title 
    * @param url 
    * @returns 
    */
    public pushHistoryState(title: string, url: string) {
        if (url === window.location.href) {
            return;
        }
        history.pushState(null, title, url);
    }

    private queriesDefaultCheck(params: any): HistoryCheckFn {
        return (val, name) => {
            if (val === 0 || val === '' || val === null || val === false) {
                return false;
            }
            return !params || !Object.prototype.hasOwnProperty.call(params, name) || params[name] !== val;
        };
    }
}
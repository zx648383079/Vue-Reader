import axios from 'axios';
import router from '@/router'
import { Toast } from 'mint-ui'
import { Md5 } from 'ts-md5';
import * as util from './'
import { TOKEN_KEY } from '@/store/types'

axios.defaults.timeout = 60000
axios.defaults.baseURL = util.apiEndpoint

// http request 拦截器
axios.interceptors.request.use(
    (config) => {
        // const token = getCookie('名称');注意使用的时候需要引入cookie方法，推荐js-cookie
        config.data = JSON.stringify(config.data)
        config.headers = {
            'Content-Type': 'application/vnd.api+json',
            'Accept': 'application/json',
        }
        const params = util.getAppParams();
        if (!config.params) {
            config.params = {}
        }
        config.params.appid = params.appid;
        config.params.timestamp = params.timestamp;
        config.params.sign = params.sign;
        const token = util.getSessionStorage(TOKEN_KEY)
        if (token) {
            config.headers.Authorization = 'Bearer ' + token
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// http response 拦截器
axios.interceptors.response.use(
    (response) => {
        if (response.data.errCode === 2) {
            router.push({
                path: '/login',
                query: {
                    redirect: router.currentRoute.fullPath,
                }, // 从哪个页面跳转
            })
            Toast({
                message: response.data.Message,
                position: 'bottom',
            })
        }
        return response
    },
    (error) => {
        Toast({
            message: error,
            position: 'bottom',
        })
        return Promise.reject(error)
    },
)

/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */
export function fetch<T>(url: string, params = {}): Promise<T> {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            params,
        }).then((response) => {
            resolve(response.data)
        }).catch((err) => {
            reject(err)
        })
    })
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function post<T>(url: string, data = {}): Promise<T> {
    return new Promise((resolve, reject) => {
        axios.post(url, data)
            .then((response) => {
                resolve(response.data)
            }, (err) => {
                reject(err)
            })
    })
}

/**
 * 封装patch请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function patch(url: string, data = {}) {
    return new Promise((resolve, reject) => {
        axios.patch(url, data)
            .then((response) => {
                resolve(response.data)
            }, (err) => {
                reject(err)
            })
    })
}

/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function put(url: string, data = {}) {
    return new Promise((resolve, reject) => {
        axios.put(url, data)
            .then((response) => {
                resolve(response.data)
            }, (err) => {
                reject(err)
            })
    })
}

export default {
    install(Vue: any) {
        Vue.prototype.$post = post
        Vue.prototype.$fetch = fetch
        Vue.prototype.$patch = patch
        Vue.prototype.$put = put
    },
}

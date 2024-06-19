import axios from 'axios';
import router from '@/router'
import { apiEndpoint } from '../config/config';
import { useDialog } from '../components/Dialog/plugin';
import { useAuth } from '../services';

axios.defaults.timeout = 60000
axios.defaults.baseURL = apiEndpoint

// http request 拦截器
axios.interceptors.request.use(
    (config) => {
        if (config.data && !(config.data instanceof FormData)) {
            config.data = JSON.stringify(config.data)
            config.headers.setContentType('application/vnd.api+json').setAccept('application/json');
        }
        const auth = useAuth();
        const params = auth.getAppParams();
        if (!config.params) {
            config.params = {}
        }
        config.params.appid = params.appid;
        config.params.timestamp = params.timestamp;
        config.params.sign = params.sign;
        const token = auth.getUserToken();
        if (token) {
            config.headers.Authorization = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
)

// http response 拦截器
axios.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        useDialog().error(error && error.response ? error.response.data.message : error);
        if (error && error.response && error.response.status === 401) {
            useAuth().logout();
            router.push({
                path: '/login',
                query: {
                    redirect: router.currentRoute.value.fullPath,
                }, // 从哪个页面跳转
            })
            return Promise.reject(error);
        }
        return Promise.reject(error);
    },
)

/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */
export function fetch<T>(url: string, params: Record<string|number, any> = {}): Promise<T> {
    return axios.get<T>(url, {
        params,
    }).then(res => res.data);
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function post<T>(url: string, data: any = {}): Promise<T> {
    return axios.post<T>(url, data).then(res => res.data);
}

/**
 * 封装patch请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function patch<T>(url: string, data: Record<string|number, any> = {}): Promise<T> {
    return axios.patch<T>(url, data).then(res => res.data);
}

export function deleteRequest<T>(url: string, params: Record<string|number, any> = {}): Promise<T> {
    return axios.delete<T>(url, {params}).then(res => res.data);
}

/**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */
export function put<T>(url: string, data = {}): Promise<T> {
    return axios.put<T>(url, data).then(res => res.data);
}

export function uploadFile<T>(url: string, file: File, name = 'file'): Promise<T> {
    const data = new FormData();
    data.append(name, file);
    return axios.post<T>(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
        },
    }).then(res => res.data);
}







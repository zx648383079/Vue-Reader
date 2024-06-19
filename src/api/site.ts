import axios, {type AxiosRequestConfig } from 'axios';

export function batch<T extends Record<string, any>>(data: Record<keyof T, any>, options?: AxiosRequestConfig<any>) {
    return axios.post('open/batch', data, options)
    .then(res => {
        return res.data;
    });
}
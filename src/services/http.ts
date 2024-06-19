import * as http from '../utils/http';
import type { IHttpClient } from './types';

export class HttpClient implements IHttpClient {
    public get = http.fetch;
    public post = http.post;
    public put = http.put;
    public delete = http.deleteRequest;
    public patch = http.patch;
    public upload = http.uploadFile;
}
import {fetch, post, deleteRequest, put, uploadFile} from '../utils/http';
import type {IUser, ILogin, IPage, IRegister} from './model';

export const getProfile = () => fetch<IUser>('auth/user');

export const login = (param: ILogin) => post<IUser>('auth/login', param);

export const logout = () => post('auth/logout');

export const register = (param: IRegister) => post<IUser>('auth/register', param);


export const updateProfile = (param: any) => put<IUser>('auth/user/update', param);


export const uploadAvatar = (img: File) => uploadFile<IUser>('auth/user/avatar', img);


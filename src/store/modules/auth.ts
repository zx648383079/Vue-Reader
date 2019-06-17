import {
    SET_USER, TOKEN_KEY, SET_TOKEN,
} from '../types';
import {
    Commit,
} from 'vuex';
import { getSessionStorage, setSessionStorage, removeSessionStorage } from '@/utils';
import { getProfile, login, logout, IUser } from '@/api/book';


export interface State {
    token: string | null,
    user: IUser | null,
};

interface IActionContext {
    commit: Commit;
    state: State;
}

// initial state
// shape: [{ id, quantity }]
const initState: State = {
    user: null,
    token: null,
};

// getters
const getters = {
    /**
     * 此方法不验证token的有效性
     * @param state
     */
    isGuest(state: State) {
        if (state.user) {
            return false;
        }
        const token = getSessionStorage<string>(TOKEN_KEY);
        return !token;
    },
};

// actions
const actions = {
    getToken(context: IActionContext) {
        if (context.state.token) {
            return context.state.token;
        }
        const token = getSessionStorage<string>(TOKEN_KEY);
        if (!token) {
            return token;
        }
        context.commit(SET_TOKEN, token);
        return token;
    },
    setToken(context: IActionContext, token: string) {
        context.commit(SET_TOKEN, token);
        return token;
    },
    getUser(context: IActionContext) {
        return new Promise((resolve, reject) => {
            if (context.state.user) {
                resolve(context.state.user);
                return;
            }
            const token = getSessionStorage<string>(TOKEN_KEY);
            if (!token) {
                resolve();
                return;
            }
            getProfile().then((res: IUser) => {
                context.commit(SET_USER, res);
                resolve(res);
            }).catch(reject);
        });
    },
    loginUser(context: IActionContext, params: any) {
        return login(params).then((res: IUser) => {
            context.commit(SET_TOKEN, res.token);
            context.commit(SET_USER, res);
        });
    },
    logoutUser(context: IActionContext) {
        return new Promise((resolve, reject) => {
            const token = getSessionStorage<string>(TOKEN_KEY);
            if (!token) {
                resolve();
                return;
            }
            logout().then(() => {
                context.commit(SET_USER, null);
                context.commit(SET_TOKEN, null);
                resolve();
            }).catch(reject);
        });
    },
};

// mutations
const mutations = {
    [SET_USER](state: State, user: IUser) {
        state.user = user;
    },
    [SET_TOKEN](state: State, token: string) {
        state.token = token;
        if (token) {
            setSessionStorage(TOKEN_KEY, token);
            return;
        }
        removeSessionStorage(TOKEN_KEY);
    },
};

export default {
    state: initState,
    getters,
    actions,
    mutations,
};

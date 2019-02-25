import {
  LOGIN,
  LOGOUT
} from '../types'

const TOKEN_KEY = 'token'

const state = {
  token: '',
  user: null
}

const mutations = {
  [LOGIN] (state, token) {
    sessionStorage.setItem(TOKEN_KEY, token)
    state.token = token
  },
  [LOGOUT] (state) {
    sessionStorage.removeItem(TOKEN_KEY)
    state.token = ''
  }
}

const actions = {
  login ({ commit }, token) {
    commit(LOGIN, token)
  },
  logout ({ commit }) {
    commit(LOGOUT)
  }
}

const getters = {
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}

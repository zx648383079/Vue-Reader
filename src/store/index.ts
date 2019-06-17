import Vue from 'vue'
import Vuex, { Commit, Dispatch } from 'vuex'
import actions from './actions'
import getters from './getters'
import book from './modules/book'
import auth from './modules/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  actions,
  getters,
  modules: {
    book,
    auth,
  },
})

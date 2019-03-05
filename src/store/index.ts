import Vue from 'vue'
import Vuex, { Commit, Dispatch } from 'vuex'
import actions from './actions'
import getters from './getters'
import book, { State as BookState } from './modules/book'

Vue.use(Vuex)

export default new Vuex.Store({
  actions,
  getters,
  modules: {
    book,
  },
})

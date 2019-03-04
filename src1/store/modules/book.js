import {
  SET_RANK,
  SET_BACK_POSITION,
  SET_CURRENT_SOURCE,
  SET_SEC_PATH,
  SET_THIRD_PATH,
  SET_HEAD_TITLE,
  SET_READ_BOOK
} from '../types'

const state = {
  weekRankId: '',
  monthRankId: '',
  totalRankId: '',
  headTitle: '', // 头部文字
  previousPosition: '书架',
  source: '', // 小说源
  backPath: {},
  bookInfo: {}
}

const mutations = {
  [SET_RANK] (state, rankDetail) {
    state.weekRankId = rankDetail._id
    state.monthRankId = rankDetail.monthRank
    state.totalRankId = rankDetail.totalRank
    state.headTitle = rankDetail.shortTitle
  },
  [SET_BACK_POSITION] (state, position) {
    state.previousPosition = position
  },
  [SET_CURRENT_SOURCE] (state, source) {
    state.source = source
  },
  [SET_SEC_PATH] (state, prePath) {
    state.backPath.secPath = prePath
  },
  [SET_THIRD_PATH] (state, prePath) {
    state.backPath.thirdPath = prePath
  },
  [SET_HEAD_TITLE] (state, text) {
    state.headTitle = text
  },
  [SET_READ_BOOK] (state, book) {
    state.bookInfo = book
  }
}

const getters = {}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}

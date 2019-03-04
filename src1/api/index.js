import {
  fetch
} from '../utils/http'

export default {

  /**
     * 获取所有的排行榜类型
     * @returns {null}
     */
  getRankType () {
    return fetch('book')
  },

  /**
     * 根据id获取排行榜
     * @returns {String} id为周榜id，月榜id，总榜id
     */
  getRankList (id) {
    return fetch('book?top=' + id)
  },

  /**
     * 获取所有分类
     * @returns {null}
     */
  getCategory () {
    return fetch('book/category').then(res => res.data)
  },

  /**
     * 获取细分的类别
     */
  getCategoryDetail () {
    return this.getCategory()
  },

  /**
     * 根据分类获取小说列表
     * @param {String} gender 可选：male/female/press
     * @param {String} type 可选：hot(热门)/new(新书）/reputation(好评)/over(完结)/monthly(包月)
     * @param {String} major
     * @param {String} minor
     * @param {Number} start
     * @param {Number} limit
     */
  // todo 入参需要用es6优化
  getNovelListByCat (category, type, start = 0, limit = 20) {
    return fetch('book?category=' + category + '&type=' + type + '&page=' + start + '&per_page=' + limit)
  },

  /**
     * 根据id获取小说
     * @param {String} bookId 小说id
     */
  getBook (bookId) {
    return fetch('book?id=' + bookId)
  },

  /**
     * 获取小说源(正版源)
     * @param {String} bookId 小说id
     */
  getGenuineSource (bookId) {
    return fetch('/btoc?view=summary&book=' + bookId)
  },

  /**
     * 获取小说源(正版源与盗版源)
     * @param {String} bookId 小说id
     */
  getMixSource (bookId) {
    return fetch('/atoc?view=summary&book=' + bookId)
  },

  /**
     * 获取小说章节（混合源，大概可认为是正版网站的公众章节+最快更新的盗版网站章节的混合）
     * @param {String} bookId 小说id
     */
  getMixChapters (bookId) {
    return fetch('/mix-atoc/' + bookId + '?view=chapters')
  },

  /**
     * 获取小说章节
     * @param {String} sourceId 小说源id
     */
  getChapters (bookId) {
    return fetch('book/chapter?book=' + bookId)
  },

  /**
     * 获取小说章节内容
     * @param {String} id 章节url
     */
  getBookChapterContent (id) {
    return fetch('book/chapter?id=' + id)
  },

  /**
     * 获取搜索热词
     * @returns {null}
     */
  getHotWords () {
    return fetch('book/home/hot')
  },

  /**
     * 搜索自动补充
     * @param {String} searchWord 搜索内容
     */
  autoComplete (searchWord) {
    return fetch('book/home/suggest?keywords=' + searchWord).then(res => res.data)
  },

  /**
     * 模糊搜索
     *  @param {String} searchWord 搜索内容
     */
  fuzzySearch (searchWord) {
    return fetch('book?keywords=' + searchWord)
  },

  /**
     * 获取小说最新章节（书架）
     * @param {Array} bookList 获取更新的小说id
     */
  getUpdate (bookList) {
    return fetch('/book?book=' + bookList.toString())
  }

}
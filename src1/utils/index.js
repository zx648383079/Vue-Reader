import _ from 'lodash'

const localStroage = window.localStorage

export default {
  apiEndpoint: 'http://zodream.localhost/open/',
  assetUri: 'http://zodream.localhost',
  appid: '11543906547',
  secret: '012e936d3d3653b40c6fc5a32e4ea685',

  /**
     * 获取localstroage的数据
     * @param {String} key 获取localstroage的item
     */
  getLocalStroageData (item) {
    return _.isEmpty(JSON.parse(localStroage.getItem(item))) ? null : JSON.parse(localStroage.getItem(item))
  },

  /**
    * 设置localstroage的值
    * @param {String} item
    * @param {Object} obj
    */
  setLocalStroageData (item, obj) {
    localStroage.setItem(item, JSON.stringify(obj))
  },

  getCurrentTime () {
    const now = new Date()
    const format = i => i < 10 ? '0' + i : i
    return now.getFullYear() +
            '-' + format(now.getMonth() + 1) +
            '-' + format(now.getDate()) +
            ' ' + format(now.getHours()) +
            ':' + format(now.getMinutes()) +
            ':' + format(now.getSeconds())
  }
}

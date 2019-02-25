<template>
  <div>
    <mt-header fixed :title="title">
      <router-link to="/" slot="left">
        <mt-button icon="back">返回</mt-button>
      </router-link>
    </mt-header>
    <div class="select">
      <ul class="select-bar">
        <v-touch tag="li" v-for="(item, index) in types" :class="{'active': type === item.type}" :key="index" @tap="setType(item.type, index)">{{item.name}}</v-touch>
      </ul>
      <ul class="select-bar" v-if="categories && categories.length > 0">
        <li data-type="hot">全部</li>
        <v-touch tag="li" :class="{'active': cat.id === id}" v-for="cat in categories" :key="cat.id" @tap="setCategory(cat)">{{cat.name}}</v-touch>
      </ul>
    </div>
    <mt-loadmore class="loadmore" :top-method="loadTop" :bottom-method="loadBottom" :auto-fill="false" ref="loadmore">
      <ul class="book-list">
        <Booklist v-for="book in books" :book="book" :key="book._id"></Booklist>
      </ul>
    </mt-loadmore>
  </div>
</template>
<script>
import api from '@/api'
import Booklist from '@/components/common/Booklist'
import { SET_BACK_POSITION } from '@/store/types'
import { Indicator } from 'mint-ui'

export default {
  name: 'BookcatDetail',
  components: {
    Booklist
  },
  data () {
    return {
      books: null,
      type: 'hot',
      title: '',
      id: 0,
      categories: [],
      currentPage: 1,
      allLoaded: false,
      types: [{
        type: 'hot',
        name: '热门'
      }, {
        type: 'new',
        name: '新书'
      }, {
        type: 'reputation',
        name: '好评'
      }, {
        type: 'over',
        name: '完结'
      }, {
        type: 'monthly',
        name: '包月'
      }]
    }
  },

  methods: {
    /**
         * 根据筛选分类获取结果
         */
    // todo 入参需要优化
    getNovelListByCat (id, type) {
      Indicator.open('加载中')
      api.getNovelListByCat(id, type).then(response => {
        Indicator.close()
        this.books = response.data
      }).catch(err => {
        console.log(err)
      })
    },

    /**
         * 选择大类分类
         */
    setType (type, index) {
      this.type = type
      this.getNovelListByCat(this.id, this.type)
    },

    /**
     * 选择子类分类
     */
    setCateogry (cat) {
      this.id = cat.id
      this.title = cat.name
      this.getNovelListByCat(this.id, this.type)
    },

    /**
     * 下拉刷新
     */
    loadTop () {
      // 加载更多数据
      this.getNovelListByCat(this.id, this.type)
      this.$refs.loadmore.onTopLoaded()
    },

    /**
     * 加载更多
     */
    loadBottom () {
      // 加载更多数据
      let that = this
      Indicator.open('加载中')
      api.getNovelListByCat(this.id, this.type, this.currentPage).then(response => {
        that.books = [...that.books, ...response.data]
        that.currentPage++
        Indicator.close()
      }).catch(err => {
        console.log(err)
      })
      this.$refs.loadmore.onBottomLoaded()
    }
  },

  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.title = vm.$route.query.title
      vm.id = vm.$route.query.id
      /**
             * 获取大分类中的小类别
             */
      api.getCategoryDetail().then(response => {
        vm.categories = response
      }).catch(err => {
        console.log(err)
      })
      vm.getNovelListByCat(vm.$route.query.id, vm.type)
      console.log(vm.$store)
      vm.$store.commit(SET_BACK_POSITION, '分类')
    })
  }
}
</script>
<style scoped>
.select {
  position: fixed;
  top: 2rem;
  left: 0;
  background: #fff;
  z-index: 10;
}

.select-bar {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: nowrap;
  height: 2rem;
  width: 100vw;
  overflow-x: auto;
  overflow-y: hidden;
  border-bottom: 1px solid #f2f2f2;
}

.select-bar li {
  flex-shrink: 0;
  line-height: 2rem;
  padding-left: 0.6rem;
  padding-right: 0.6rem;
  font-size: 0.7rem;
}

.active {
  color: red;
}

.book-list {
  width: 100vw;
  background: #f2f2f2;
}

.loadmore {
  margin-top: 6rem;
}

.active {
  color: #26a2ff;
}
</style>

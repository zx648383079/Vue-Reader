<template>
  <div class="book-list-wrap">
    <!--<mt-loadmore :bottom-method="loadBottom" ref="loadmore">-->
    <v-touch tag="ul" @swipeleft="swipeleft" @swiperight="swiperight">
      <Booklist v-for="book in books" :book="book" :key="book.id"></Booklist>
    </v-touch>
    <!--</mt-loadmore>-->
  </div>
</template>

<script>
import Booklist from '@/components/common/Booklist'
import api from '@/api'
import { Indicator } from 'mint-ui'

export default {
  name: 'RanklistDetail',
  components: {
    Booklist
  },
  data () {
    return {
      books: [],
      ranktype: '',
      rankTypeStack: ['/ranklist/weekRank', '/ranklist/monthRank', '/ranklist/totalRank'],
      currentRank: 0,
      currentLoadPage: 1
    }
  },
  methods: {
    fetchData () {
      Indicator.open()
      switch (this.$route.path) {
        case '/ranklist/weekRank':
          this.rankType = this.$store.state.weekRankId
          this.currentLoadPage = 0
          break
        case '/ranklist/monthRank':
          this.rankType = this.$store.state.monthRankId
          this.currentLoadPage = 0
          break
        case '/ranklist/totalRank':
          this.rankType = this.$store.state.totalRankId
          this.currentLoadPage = 0
          break
        default:
          this.$router.push('/rank')
          break
      }
      api.getRankList(this.rankType).then(response => {
        this.books = response.data
        Indicator.close()
      }).catch(error => {
        Indicator.close()
        console.log(error)
      })
    },
    swipeleft () {
      if (this.currentRank >= 2) {
        return
      }
      this.currentRank++
      this.$router.push(this.rankTypeStack[this.currentRank])
    },
    swiperight () {
      if (this.currentRank <= 0) {
        return
      }
      this.currentRank--
      this.$router.push(this.rankTypeStack[this.currentRank])
    },
    loadBottom () {
      // this.books = this.books.slice(0, this.currentLoadPage * 20 + 20)
      // this.currentLoadPage++
    }
  },
  watch: {
    '$route': 'fetchData'
  },
  created () {
    this.fetchData()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
ul {
  display: flex;
  flex-direction: column;
}

.book-list-wrap {
  width: 100vw;
  background: #f2f2f2;
  margin-top: 4.5rem;
}
</style>

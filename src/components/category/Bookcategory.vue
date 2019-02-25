<template>
  <div>
    <section>
      <p class="category-type">全部</p>
      <ul>
        <li v-for="(cat, index) in categories" :key="index" @click="tapCategory(cat)">
          <p class="category">{{cat.name}}</p>
          <span class="book-count">{{cat.bookCount}}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
<script>
import api from '@/api'

export default {
  name: 'Booklcat',
  data () {
    return {
      categories: null
    }
  },
  created () {
    api.getCategory().then(data => {
      this.categories = data
      this.loading = false
    }).catch(err => {
      console.log(err)
    })
  },
  methods: {
    tapCategory (cat) {
      this.$router.push({path: '/bookcat/detail', query: {id: cat.id, title: cat.name}})
    }
  }
}
</script>
<style scoped>
ul {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-left: 1rem;
  margin-right: 1rem;
}

li {
  width: 33.3%;
  text-align: center
}

.category {
  font-weight: bold;
  font-size: 0.8rem;
  margin-bottom: 0.1rem;
  margin-top: 0.8rem;
  line-height: 1.3rem;
}

.category-type {
  line-height: 2rem;
  margin-top: 0;
  margin-bottom: 0;
  margin-left: 1rem;
  margin-right: 1rem;
  border-bottom: 1px solid #f3eded;
}

.book-count {
  color: #959595;
}
</style>

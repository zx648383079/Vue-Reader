<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
html {
    font-size: 20px;
}
body,
ul,
li {
    padding: 0;
    margin: 0;
}
a {
    text-decoration: none;
    color: #000;
}
li {
    list-style: none;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
</style>

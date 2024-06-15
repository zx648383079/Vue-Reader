<template>
    <footer class="tab-bar">
        <a v-for="(item, index) in menus" :key="index" :class="[item.url === $route.name ? 'active' : '']" @click="tapMenu(item)">
            <i :class="item.icon" aria-hidden="true"></i>
            {{ item.name }}
        </a>
    </footer>
</template>
<script lang="ts">
import { Vue } from 'vue-property-decorator';

interface IMenu {
    name: string,
    icon: string,
    url: string
}

export default class TabBar extends Vue {
    public menus: IMenu[]  = [
        {
            name: '书架',
            icon: 'fa fa-book',
            url: 'home',
        },
        {
            name: '分类',
            icon: 'fa fa-th-large',
            url: 'category',
        },
        {
            name: '搜索',
            icon: 'fa fa-search',
            url: 'search',
        },
        {
            name: '我的',
            icon: 'fa fa-user',
            url: 'member',
        },
    ];

    public tapMenu(item: IMenu) {
        this.$router.push({ name: item.url});
    }
}
</script>

<style lang="scss" scoped>
.tab-bar {
    border: 0.0625rem solid #e1e1e1;
    display: flex;
    justify-content: space-around;
    flex-flow: row nowrap;
    position: fixed;
    z-index: 5;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 3rem;
    background: #fff;
    border-top: 1px solid #ccc;
    a {
        width: 25%;
        text-align: center;
        display: block;
        float: left;
        padding-top: 0.25rem;
        box-sizing: border-box;
        position: relative;
        font-size: .9rem;
        text-decoration: none;
        position: relative;
        text-align: center;
        .fa {
            font-size: 1.5rem;
            display: block;
        }
        &.active {
            color: #4693d0;
            .fa {
                color: #b4282d;
            }
        }
    }
}
</style>

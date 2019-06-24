<template>
    <div>
        <BackHeader :title="$route.meta.title">
            <a v-if="user" class="right" @click="tapLogout">
                <i class="fa fa-sign-out-alt"></i>
            </a>
        </BackHeader>
        <div class="has-header has-footer">
            <div class="user-header">
                <div class="avatar">
                    <img :src="user ? user.avatar : '/assets/images/avatar/1.png' | assets">
                </div>
                <div class="name">
                    欢迎您，
                    <a v-if="user">{{ user.name }}</a>
                    <a v-else @click="tapLogin">请登陆</a>
                    ~
                </div>
            </div>
            <div class="card-box">
                <div class="title">关于我们</div>
                <div class="content">本站所有内容均来源于其他站点，内容中所有观点不代表本站观点。</div>
            </div>
        </div>
        <TabBar/>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BackHeader from '@/components/BackHeader.vue';
import TabBar from '@/components/TabBar.vue';
import { IUser } from '../api/book';
import { dispatchUser, dispatchLogout } from '../store/dispatches';

@Component({
    components: {
        BackHeader,
        TabBar,
    },
})
export default class Member extends Vue {
    public user: IUser | null = null;

    public created() {
        dispatchUser().then(res => {
            this.user = res;
        });
    }

    public tapLogin() {
        this.$router.push('/login');
    }

    public tapLogout() {
        dispatchLogout().then(() => {
            this.user = null;
        });
    }
}
</script>
<style lang="scss" scoped>
.user-header {
    background-color: #f04e49;
    color: #fff;
    position: relative;
    padding-top: 0.5625rem;
    padding-bottom: 4rem;
    .avatar {
        width: 5.625rem;
        height: 5.625rem;
        margin: 0 auto;
        text-align: center;
        line-height: 0;
        position: absolute;
        left: 1.25rem;
        img {
            width: 100%;
            height: 100%;
            border-radius: 100%;
        }
        &::after {
            content: "";
            width: 6.25rem;
            height: 6.25rem;
            border: 0.125rem solid #99e3ff;
            border-radius: 100%;
            position: absolute;
            left: -0.3125rem;
            top: -0.3125rem;
            z-index: 0;
        }
    }
    .name {
        padding: 2.4rem 0;
        margin-left: 7.5rem;
        color: #fff;
    }
}
.card-box {
    background-color: #fff;
    margin: 0 10px;
    min-height: 100px;
    margin-top: -40px;
    position: relative;
    padding: 10px;
    .title {
        font-weight: 700;
        line-height: 40px;
    }
}
.right {
    top: 50%;
    margin-top: -1rem;
    font-size: 1.5625rem;
    position: absolute;
    right: 0.625rem;
    font-size: 1rem;
    line-height: 30px;
}
</style>

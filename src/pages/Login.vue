<template>
    <div>
        <BackHeader :title="$route.meta.title as any"></BackHeader>
        <div class="has-header login-box">
            <div class="logo">
                <img :src="assetsFilter('/assets/images/wap_logo.png')" alt="">
            </div>
            <div class="email-password">
                <div class="input-box">
                    <input type="email" name="email" required autocomplete="off" v-model="input.email" placeholder="请输入账号">
                </div>
                <div class="input-box">
                    <input type="password" name="password" required autocomplete="off" @keyup="tapKey" v-model="input.password" placeholder="请输入密码">
                </div>
                <button @click="tapLogin">登录</button>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { isEmpty, isEmail } from '@/utils/validate';
import BackHeader from '@/components/BackHeader.vue';
import { reactive } from 'vue';
import { useAuth } from '@/services';
import { useRoute, useRouter } from 'vue-router';
import { useDialog } from '@/components/Dialog';
import { assetsFilter } from '@/pipes';

const toast = useDialog();
const router = useRouter();
const route = useRoute();
const auth = useAuth();
const input = reactive({
    email: '',
    password: ''
});

function tapKey(e: KeyboardEvent) {
    if (e.code !== 'Enter') {
        return;
    }
    tapLogin();
}
function tapLogin() {
    const email = input.email;
    const password = input.password;
    if (isEmpty(email) || !isEmail(email)) {
        toast.warning('请输入账号');
        return;
    }
    if (!password || password.length < 4) {
        toast.warning('请输入密码');
        return;
    }
    auth.login({email, password}).then(
        _ => {
        tapLoginBack();
    });
}

function tapLoginBack() {
    if (route.query.redirect_uri) {
        router.replace(route.query.redirect_uri + '');
        return;
    }
    router.replace('/');
}
</script>
<style lang="scss" scoped>
.login-box {
    text-align: center;
    padding: 10px;
}
.logo {
    padding: 30px 0;
}
.email-password {
    .input-box {
        border-bottom: 1px solid #ccc;
        input {
            height: 40px;
            border: 0;
            background: transparent;
            width: 100%;
            outline: none;
        }
    }
    button {
        width: 100%;
        display: block;
        margin: 10px 0;
        line-height: 40px;
        height: 40px;
        color: #fff;
        border: 1px solid #b4282d;
        background-color: #b4282d;
    }
}
</style>


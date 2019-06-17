<template>
    <div>
        <BackHeader :title="$route.meta.title"></BackHeader>
        <div class="has-header login-box">
            <div class="logo">
                <img :src="'/assets/images/wap_logo.png' | assets" alt="">
            </div>
            <div class="email-password">
                <div class="input-box">
                    <input type="email" name="email" required autocomplete="off" v-model="email" placeholder="请输入账号">
                </div>
                <div class="input-box">
                    <input type="password" name="password" required autocomplete="off" @keyup="tapKey" v-model="password" placeholder="请输入密码">
                </div>
                <button @click="tapLogin">登录</button>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { Toast } from 'mint-ui';
import { dispatchLogin } from '@/store/dispatches';
import { IUser } from '@/api/book';
import { isEmpty, isEmail } from '@/utils/validate';
import BackHeader from '@/components/BackHeader.vue';

@Component({
    components: {
        BackHeader,
    },
})
export default class Login extends Vue {
    public email: string = '';

    public password: string = '';

    public tapKey(e: KeyboardEvent) {
        if (e.code !== 'Enter') {
            return;
        }
        this.tapLogin();
    }

    public tapChange(mode: number) {
        this.$emit('click', mode);
    }

    public tapLogin() {
        const email = this.email;
        const password = this.password;
        if (isEmpty(email) || !isEmail(email)) {
            Toast('请输入账号');
            return;
        }
        if (!password || password.length < 4) {
            Toast('请输入密码');
            return;
        }
        dispatchLogin({email, password}).then((res: IUser) => {
            this.tapLoginBack();
        });
    }

    public tapLoginBack() {
        if (this.$route.query.redirect_uri) {
            this.$router.replace(this.$route.query.redirect_uri + '');
            return;
        }
        this.$router.replace('/');
    }
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


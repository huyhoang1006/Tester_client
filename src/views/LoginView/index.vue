<template>
    <div id="login">
        <div class="login">
            <el-card>
                <h2 class="logo">
                    <img src="@/assets/images/logo.png" style="max-height: 60px" />
                </h2>
                <h2>Login</h2>
                <el-form :model="model" :rules="loginRules" ref="form" @submit.native.prevent="login">
                    <el-form-item prop="username">
                        <el-input v-model="model.username" placeholder="Username" prefix-icon="fas fa-user"></el-input>
                    </el-form-item>
                    <el-form-item prop="password">
                        <el-input prefix-icon="fas fa-lock" placeholder="Password" type="password" v-model="model.password" show-password></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-checkbox v-model="remember" class="float-left">Remember</el-checkbox>
                    </el-form-item>
                    <el-form-item>
                        <el-button :loading="loadingLogin" class="login-button" type="primary" native-type="submit" block>Login</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </div>
        <!-- <div class="footer">
            <div>
                <div class="links">
                    <span>
                        <a href="#">
                            <img src="@/assets/images/website.png" style="max-height: 32px" />
                        </a>
                    </span>
                    <span>
                        <a href="#">
                            <img src="@/assets/images/facebook.png" style="max-height: 32px" />
                        </a>
                    </span>
                    <span>
                        <a href="#">
                            <img src="@/assets/images/zalo.png" style="max-height: 32px" />
                        </a>
                    </span>
                </div>
                <div class="version">Copyright 2022 © AT Energy</div>
            </div>
        </div> -->
    </div>
</template>

<script>
import * as userApi from '@/api/user'

export default {
    name: 'LoginView',
    data() {
        return {
            formLabelWidth: '140px',
            model: {
                username: '',
                password: ''
            },
            remember: true,
            loadingLogin: false,
            loginRules: {
                username: [
                    {
                        required: true,
                        message: 'Username is required',
                        trigger: 'blur'
                    }
                    // {
                    //     min: 5,
                    //     message: 'Username length should be at least 5 characters',
                    //     trigger: 'blur'
                    // }
                ],
                password: [
                    {
                        required: true,
                        message: 'Password is required',
                        trigger: 'blur'
                    }
                    // {
                    //     min: 8,
                    //     message: 'Password length should be at least 8 characters',
                    //     trigger: 'blur'
                    // }
                ]
            },
            dialogSignup: false,
            loadingSignup: false,
            formSignup: {
                username: '',
                password: '',
                firstName: '',
                lastName: '',
                gender: '',
                email: '',
                phone: '',
                birthDate: ''
            },
            redirect: undefined,
            otherQuery: {}
        }
    },
    watch: {
        $route: {
            handler: function (route) {
                const query = route.query
                if (query) {
                    this.redirect = query.redirect
                    this.otherQuery = this.getOtherQuery(query)
                }
            },
            immediate: true
        }
    },
    methods: {
        async login() {
            let valid = await this.$refs.form.validate()
            if (!valid) {
                return
            }
            this.loadingLogin = true
            await this.$common.simulateLoading()
            userApi
                .login(this.model)
                .then((response) => {
                    response.name = this.model.username
                    this.$message.success('Login successfully')
                    this.$helper.afterLogin(this.remember, response)
                    this.$router.push({path: this.redirect || '/', query: this.otherQuery})
                })
                .catch((error) => {
                    console.log(error)
                    this.$message.error(error.message)
                })
                .finally(async () => {
                    this.loadingLogin = false
                })
        },
        // async signup() {
        //     let valid = await this.$refs.signupForm.validate()
        //     if (!valid) {
        //         return
        //     }
        //     this.loadingSignup = true
        //     await this.$common.simulateLoading()
        //     userApi
        //         .signup(this.formSignup)
        //         .then(() => {
        //             this.$message.success('Sign up successful')
        //             this.dialogSignup = false
        //             this.formSignup = {
        //                 username: '',
        //                 password: '',
        //                 firstName: '',
        //                 lastName: '',
        //                 gender: '',
        //                 email: '',
        //                 phone: '',
        //                 birthDate: ''
        //             }
        //         })
        //         .catch((error) => {
        //             console.log(error)
        //             this.$message.error(error.message)
        //         })
        //         .finally(async () => {
        //             await this.$common.simulateLoading()
        //             this.loadingSignup = false
        //         })
        // },
        getOtherQuery(query) {
            return Object.keys(query).reduce((acc, cur) => {
                if (cur !== 'redirect') {
                    acc[cur] = query[cur]
                }
                return acc
            }, {})
        }
    }
}
</script>

<style scoped>

@charset "UTF-8";
.login {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-button {
    width: 100%;
}
.forgot-password {
    margin-top: 10px;
}
</style>

<style lang="scss" scoped>
.login .el-input__prefix {
    background: rgb(238, 237, 234);
    left: 0;
    height: calc(100% - 2px);
    left: 1px;
    top: 1px;
    border-radius: 3px;
    .el-input__icon {
        width: 30px;
    }
}
.login .el-input input {
    padding-left: 35px;
}
.login .el-card {
    padding: 50px;
}
h2 {
    letter-spacing: 1px;
    padding-bottom: 20px;
}

.login .el-card {
    display: flex;
    justify-content: center;
}
</style>

<style lang="scss" scoped>
#login {
    text-align: center;
    color: #2c3e50;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    background: #ebedef;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    margin: 0;
    display: flex;
    flex-direction: column;
}
.footer {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .links {
        display: flex;
        span {
            padding: 0 10px;
            font-size: 18px;
            border-right: 1px solid #9fb3c8;
            &:last-child {
                border-right: none;
            }
        }
    }
    .version {
        padding: 0 10px;
        color: #9fb3c8;
        font-size: 12px;
        margin-top: 5px;
    }

}
.header {
    width: 100%;
    height: 100px;

}
</style>

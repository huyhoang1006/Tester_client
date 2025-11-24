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
    </div>
</template>

<script>
/* eslint-disable */
import * as userApi from '@/api/user'

export default {
    name: 'LoginView',
    data() {
        return {
            formLabelWidth: '140px',
            model: {
                // Tài khoản test mặc định
                username: 'EVN_HCM',
                password: 'evn_admin'
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
                ],
                password: [
                    {
                        required: true,
                        message: 'Password is required',
                        trigger: 'blur'
                    }
                ]
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
            
            // Gọi API login (Lưu ý: api/user.js phải được cấu hình dùng qs và Basic Auth)
            userApi
                .login(this.model)
                .then((response) => {
                    // Xử lý response từ OAuth2
                    // console.log("Login Success:", response) 

                    // Gán username vào response để tiện hiển thị (vì OAuth response không trả về username)
                    response.name = this.model.username 

                    this.$message.success('Login successfully')
                    
                    // Lưu thông tin token vào localStorage
                    localStorage.setItem('authInfo', JSON.stringify(response))

                    // Gọi helper xử lý state (store/vuex)
                    // Đảm bảo this.$helper.afterLogin của bạn xử lý được object chứa access_token
                    if (this.$helper && this.$helper.afterLogin) {
                        this.$helper.afterLogin(this.remember, response)
                    }
                    
                    this.$router.push({path: this.redirect || '/', query: this.otherQuery})
                })
                .catch((error) => {
                    console.log("Login Error:", error)
                    
                    // Xử lý hiển thị lỗi chi tiết từ OAuth server
                    let msg = 'Login failed'
                    if (error.response && error.response.data) {
                        // Ưu tiên hiển thị 'error_description' nếu có
                        msg = error.response.data.error_description || error.response.data.message || msg
                    }
                    this.$message.error(msg)
                })
                .finally(async () => {
                    this.loadingLogin = false
                })
        },
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
/* Style cơ bản */
.login {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-button {
    width: 100%;
}
.float-left {
    float: left;
}
</style>

<style lang="scss" scoped>
/* Style nâng cao với SCSS */
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
}

.login {
    /* Override Element UI inputs */
    .el-input__prefix {
        background: rgb(238, 237, 234);
        height: calc(100% - 2px);
        left: 1px;
        top: 1px;
        border-radius: 3px;
        .el-input__icon {
            width: 30px;
        }
    }
    
    .el-input input {
        padding-left: 35px;
    }

    .el-card {
        padding: 50px;
        display: flex;
        justify-content: center;
        flex-direction: column;
    }
}

h2 {
    letter-spacing: 1px;
    padding-bottom: 20px;
}
</style>
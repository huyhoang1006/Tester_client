<template>
    <div id="manage-user">
        <el-row id="top-bar">
            <el-col :span="24">
                <router-link :to="{name: 'home'}">
                    <el-button style="box-sizing: border-box; border-right: 1px solid #aeb6bf">
                        <i class="fa-solid fa-circle-arrow-left display-block fa-2x"></i>
                        <div class="mgt-10">Home</div>
                    </el-button>
                </router-link>
                <el-button style="float: right; text-align: right; width: fit-content; cursor: default">
                    <img src="@/assets/images/logo.png" style="max-height: 40px" />
                </el-button>
            </el-col>
        </el-row>
        
        <el-row :gutter="20" id="main-content">
            <h1>USER INFORMATION</h1>

            <el-card v-if="userInfo" class="box-card">
                <table id="user">
                    <tr>
                        <th style="width: 200px">Field</th>
                        <th>Value</th>
                    </tr>
                    <tr>
                        <td><strong>ID</strong></td>
                        <td>{{ userInfo.user_id }}</td>
                    </tr>
                    <tr>
                        <td><strong>Username</strong></td>
                        <td>{{ userInfo.name }}</td>
                    </tr>
                    <tr>
                        <td><strong>Email</strong></td>
                        <td>{{ userInfo.email }}</td>
                    </tr>
                    <tr>
                        <td><strong>Role</strong></td>
                        <td>
                            {{ userInfo.role }}
                        </td>
                    </tr>
                     <tr>
                        <td><strong>Authorities</strong></td>
                        <td>
                            <div v-if="authorities && authorities.length">
                                <el-tag v-for="(auth, index) in authorities" :key="index" type="warning" size="small" style="margin: 2px">
                                    {{ auth }}
                                </el-tag>
                            </div>
                            <span v-else>No specific authorities found</span>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Status</strong></td>
                        <td>
                            <el-tag :type="userInfo.is_active ? 'success' : 'danger'">
                                {{ userInfo.is_active ? 'Active' : 'Inactive' }}
                            </el-tag>
                           
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Created At</strong></td>
                        <td>{{ formatDate(userInfo.createdAt) }}</td>
                    </tr>
                </table>
            </el-card>
            <div v-else>
                <el-alert title="No user information found. Please login again." type="warning" show-icon></el-alert>
            </div>
        </el-row>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name: 'ManageUserView',
    data() {
        return {
            userInfo: null,
            authorities: []
        }
    },
    created() {
        this.getUserData()
    },
    methods: {
        getUserData() {
            // 1. Lấy thông tin User Object từ LocalStorage (Đã lưu ở bước Login)
            const userStr = localStorage.getItem('user')
            if (userStr) {
                try {
                    this.userInfo = JSON.parse(userStr)
                } catch (e) {
                    console.error("Error parsing user data", e)
                }
            }

            // 2. Lấy Permissions (Authorities) từ Token (Vì localStorage user không chứa authorities)
            const token = localStorage.getItem('token')
            if (token) {
                const decoded = this.parseJwt(token)
                
                // Lấy mảng quyền hạn
                if (decoded && decoded.authorities) {
                    this.authorities = decoded.authorities
                }
                
                // Fallback: Nếu localStorage bị lỗi, thử lấy user info từ token (dù ít thông tin hơn)
                if (!this.userInfo && decoded && decoded.actionUser) {
                     this.userInfo = decoded.actionUser
                }
            }
        },
        // Hàm giải mã JWT thủ công (Thay thế jwt-decode)
        parseJwt(token) {
            try {
                var base64Url = token.split('.')[1];
                var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                return JSON.parse(jsonPayload);
            } catch (e) {
                return null;
            }
        },
        // Hàm format ngày tháng dùng JS thuần (Thay thế moment.js)
        formatDate(timestamp) {
            if (!timestamp) return ''
            return new Date(timestamp).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        }
    }
}
</script>

<style lang="scss" scoped>
#manage-user {
    width: 100%;
    height: 100%;
    padding: 20px;
    box-sizing: border-box;
}

#main-content {
    margin-top: 20px;
}

#user {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

#user td, #user th {
  border: 1px solid #ddd;
  padding: 12px 15px;
}

#user tr:nth-child(even){background-color: #f9f9f9;}

#user tr:hover {background-color: #f1f1f1;}

#user th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #04AA6D;
  color: white;
  font-weight: bold;
}

h1 {
    color: #2c3e50;
    margin-bottom: 20px;
    font-size: 24px;
    border-bottom: 2px solid #04AA6D;
    display: inline-block;
    padding-bottom: 5px;
}
</style>
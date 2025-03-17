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

            <table id="user">
            <tr>
                <th>Field</th>
                <th>Value</th>
            </tr>
            <tr>
                <td>User name</td>
                <td>{{userObject.sub}}</td>
            </tr>
            <tr>
                <td>Role</td>
                <td>{{userObject.role}}</td>
            </tr>
            <tr>
                <td>User Id</td>
                <td>{{userObject.user_id}}</td>
            </tr>
            <tr>
                <td>Permissions</td>
                <td>{{userObject.permissions}}</td>
            </tr>
            <tr>
                <td>Groups</td>
                <td>{{userObject.groups}}</td>
            </tr>
            </table>
        </el-row>
    </div>
</template>

<script>
export default {
    /* eslint-disable */
    name: 'ManageUserView',
    data() {
        return {
            token:'',
            userObject: []
        }
    },
    created() {
        this.getUser()
    },
    methods: {
        getUser() {
            this.token = localStorage.getItem('token');
            var base64Url = this.token.split('.')[1];
            var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            try{
                this.userObject = JSON.parse(jsonPayload);
            }catch(e){
            }
        }
    }
}
</script>

<style lang="scss" scoped>
#manage-user {
    width: 100%;
    height: 100%;
}

#user {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

#user td, #user th {
  border: 1px solid #ddd;
  padding: 8px;
}

#user tr:nth-child(even){background-color: #f2f2f2;}

#user tr:hover {background-color: #ddd;}

#user th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #04AA6D;
  color: white;
}
</style>

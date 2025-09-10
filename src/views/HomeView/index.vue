<template>
    <div id="home">
        <div id="header">
            <img src="@/assets/images/logo.png" alt="" style="display: block; max-height: 60px; left: 30px; margin-top: 24px" />
        </div>
        <el-row :gutter="40">
            <el-col :span="8">
                <div class="menu-function">
                    <el-button class="mgl-0 item-menu-btn" @click="$router.push({name: 'manage'})">
                        <i class="custom-icon el-icon-s-order"></i>
                        <span class="content-item-menu">Database manage</span>
                    </el-button>
                    <el-button class="mgl-0 item-menu-btn" @click="$router.push({name: 'dashboard'})">
                        <i class="custom-icon el-icon-s-help"></i>
                        <span class="content-item-menu">Dashboard</span>
                    </el-button>
                    <el-button class="mgl-0 item-menu-btn">
                        <i class="custom-icon el-icon-s-tools"></i>
                        <span class="content-item-menu">Settings</span>
                    </el-button>
                </div>
            </el-col>
            <el-col :span="16">
                <div class="menu-function">
                    <el-button class="item-menu-btn">
                        <i class="custom-icon el-icon-refresh-right"></i>
                        <span class="content-item-menu">Recent</span>
                    </el-button>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: 'HomeView'
}
</script>

<style lang="scss" scoped>
#home {
    width: 100%;
    height: 100%;
    background-color: #ebedef;
    padding: 20px 30px;
    box-sizing: border-box;
}
#header {
    display: block;
}
.menu-function {
    background-color: #fff;
    margin-top: 30px;
    padding: 5px;
    height: 200px;
}

.item-menu-btn {
    display: block;
    width: 100%;
    text-align: left;
    background-color: inherit;
    padding: 10px 5px;
    border: none;
}

.content-item-menu {
    text-align: left;
    height: 50px;
    padding-bottom: 5px;
}
</style>
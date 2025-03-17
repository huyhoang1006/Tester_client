<template>
    <div id="synchronize">
        <el-row id="top-bar">
            <el-col :span="24">
                <el-button @click="$router.go(-1)" style="box-sizing: border-box; border-right: 1px solid #aeb6bf">
                    <i class="fa-solid fa-circle-arrow-left display-block fa-2x"></i>
                    <div class="mgt-10">Manage</div>
                </el-button>
                <el-button style="float: right; text-align: right; width: fit-content; cursor: default">
                    <img src="@/assets/images/logo.png" style="max-height: 40px" />
                </el-button>
            </el-col>
        </el-row>
        <el-row :gutter="5" id="main-content">
            <el-col :span="8" class="h-100">
                <location-component></location-component>
            </el-col>
            <el-col :span="8" class="h-100">
                <asset-component></asset-component>
            </el-col>
            <el-col :span="8" class="h-100">
                <job-component></job-component>
            </el-col>
        </el-row>
    </div>
</template>

<script>
// @ is an alias to /src
/* eslint-disable */
import LocationComponent from './components/Location'
import AssetComponent from './components/Asset'
import JobComponent from './components/Job'

export default {
    name: 'ManageView',
    components: {
        LocationComponent,
        AssetComponent,
        JobComponent
    },
    data() {
        return {

        }
    },
    beforeMount() {},
    destroyed() {},
    methods: {}
}
</script>

<style lang="scss" scoped>
#synchronize {
    width: 100%;
    height: 100%;
}
</style>
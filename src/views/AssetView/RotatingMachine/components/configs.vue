<template>
    <div id="configs" class="mgy-5">
        <el-row style="margin-top: 20px; margin-bottom: 10px;">
            <el-col :span="24">
                <div style="font-size: 12px;" class="header-toggle pointer" @click="openConfigs = !openConfigs">
                    <i v-if="openConfigs" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Configurations
                </div>
                
            </el-col>
        </el-row>
        <el-form v-if="openConfigs" 
            style="margin-top: 30px;" 
                :inline-message="true" 
                :label-width="labelWidth" 
                size="mini"
                label-position="left">
            <span class="bolder">Star point</span>
            <el-radio-group v-model="configsData.star_point" style="margin-left: 50px;">
                <el-radio value="close" style="margin-right: 100px;" label="Close"></el-radio>
                <el-radio value="open" label="Open"></el-radio>
            </el-radio-group>
        </el-form>
        
    </div>
</template>
<script>
export default {
    name : "configs",
    props : {
        configs : {
            type : Object,
            require : true,
            default : () => ({
                star_point : ''
            })
        }
    },
    data() {
        return {
            openConfigs : "true",
            labelWidth : `200px`,
        }
    },
    
    computed: {
        configsData() {
            console.log(this.configs)
            return this.configs
        }
    }
}
</script>
<style scoped>
.bolder {
    font-size: 12px;
}
</style>
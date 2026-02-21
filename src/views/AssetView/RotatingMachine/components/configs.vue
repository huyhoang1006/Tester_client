<template>
    <div id="configs" class="mgy-5">
        <el-row>
            <el-col :span="24">
                <div style="font-size: 12px;" class="header-toggle pointer" @click="openConfigs = !openConfigs">
                    <i v-if="openConfigs" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Configurations
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :xs="24" :sm="18" :md="12">
                <el-form class="mgy-5" v-if="openConfigs" :inline-message="true" :label-width="labelWidth" size="mini"
                    label-position="left">
                    <el-form-item label="Star point" class="inline-radios">
                        <el-radio-group v-model="configsData.star_point">
                            <el-radio value="close" label="Close"></el-radio>
                            <el-radio value="open" label="Open"></el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "configs",
    props: {
        configs: {
            type: Object,
            require: true,
            default: () => ({
                star_point: ''
            })
        }
    },
    data() {
        return {
            openConfigs: "true",
            labelWidth: `120px`,
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

<style lang="scss" scoped>
.bolder {
    font-size: 12px;
}

::v-deep(.inline-radios .el-radio-group) {
    display: flex;
    width: 100%;
    align-items: center;
    min-height: 28px;
}

::v-deep(.inline-radios .el-form-item__label) {
    font-weight: bold;
}

::v-deep(.inline-radios .el-radio__label) {
    font-size: 12px;
}

::v-deep(.inline-radios .el-radio__content) {
    display: flex;
    align-items: center;
    line-height: normal;
}

::v-deep(.inline-radios .el-radio) {
    flex: 1;
    margin-right: 0;
    display: inline-flex;
    align-items: center;
}
</style>
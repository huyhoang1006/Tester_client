<template>
    <div id="configs" class="mgy-5">
        <div class="header-toggle pointer" @click="openConfigs = !openConfigs">
            <i v-if="openConfigs" class="fa-solid fa-caret-up"></i>
            <i v-else class="fa-solid fa-caret-down"></i>
            Configurations
        </div>
        <div v-if="openConfigs" class="content-toggle">
            <div class="config-grid">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Star point" class="inline-radios">
                        <el-radio-group v-model="configsData.star_point">
                            <el-radio value="close" label="Close"></el-radio>
                            <el-radio value="open" label="Open"></el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-form>
            </div>
        </div>
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
            return this.configs
        }
    }
}
</script>

<style lang="scss" scoped>
#configs {
    min-width: 0;
}

.config-grid {
    width: min(100%, 420px);
    min-width: 0;
}

::v-deep(.inline-radios .el-radio-group) {
    display: flex;
    gap: 28px;
    align-items: center;
    min-height: 28px;
    width: 100%;
}

::v-deep(.inline-radios .el-form-item__label) {
    font-weight: 400;
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
    margin-right: 0;
    display: inline-flex;
    align-items: center;
}

@media (max-width: 767px) {
    .config-grid {
        width: 100%;
    }

    ::v-deep(.el-form-item) {
        display: block;
    }

    ::v-deep(.el-form-item__label) {
        width: 100%;
        text-align: left;
        margin-bottom: 4px;
    }

    ::v-deep(.el-form-item__content) {
        margin-left: 0 !important;
    }
}
</style>

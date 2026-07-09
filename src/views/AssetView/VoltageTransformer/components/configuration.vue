<template>
    <div id="config" class="mgt-10">
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer" style="font-size: 12px;" @click="openConfiguration = !openConfiguration">
                    <i v-if="openConfiguration" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Configuration
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openConfiguration">
            <el-row :gutter="20" class="content">
                <el-col :xs="24" :md="16" :lg="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Number of phases" class="inline-radios">
                            <el-radio-group v-model="configData.number_of_phase" @change="onChangeNumberOfPhases">
                                <el-radio :label="1">1</el-radio>
                                <el-radio :label="3">3</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item v-if="configData.number_of_phase == 1" label="Phase">
                            <el-select class="phase-select" v-model="configData.phase" placeholder="Select phase">
                                <el-option label="A" value="A"></el-option>
                                <el-option label="B" value="B"></el-option>
                                <el-option label="C" value="C"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row> 
        </div>
    </div>
</template>

<script>
export default {
    name: "voltageTransConfiguration",
    props: {
        config: {
            type: Object,
            require: true,
        }
    },
    data() {
        return {
            openConfiguration: true,
            labelWidth: `120px`,
            openShow: false,
        }
    },
    computed: {
        configData() {
            return this.config
        }
    },
    methods: {
        onChangeNumberOfPhases() {
            if (this.configData.number_of_phase !== 1) {
                this.configData.phase = ''
            }
        },
    }
}
</script>

<style lang="scss" scoped>
::v-deep(.rating_content) {
    margin-left: 5px;
    margin-top: 5px;
}

::v-deep(.ith_content) {
    margin-left: 5px;
}

::v-deep(.rating-wrapper) {
    background-color: #f5f5f5;
    border: 1px solid #000;
    padding: 10px;
}

::v-deep(.form-inline) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
}

::v-deep(.form-control) {
    flex: 1;
}

::v-deep(.custom-form-item .el-form-item__label) {
    text-align: center;
}

::v-deep(.el-form-item__label) {
    white-space: normal;
    word-break: break-word;
    line-height: 1.2;
}

::v-deep(.nom-max-sel .el-form-item__label) {
    display: none;
}

::v-deep(.nom-max-sel .el-form-item__content) {
    margin-left: 8px !important;
}

::v-deep(.phase-select.el-select) {
    width: 120px !important;
    max-width: 100%;
}

@media (max-width: 991px) {
    ::v-deep(.custom-form-item .el-form-item__label) {
        text-align: left;
    }
}

@media (max-width: 767px) {
    ::v-deep(.nom-max-sel .el-form-item__content) {
        margin-left: 120px !important;
    }

    ::v-deep(.phase-select.el-select) {
        width: 100% !important;
    }
}
</style>

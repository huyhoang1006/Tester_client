<template>
    <div id="config" class="mgt-10">
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer" @click="openConfiguration = !openConfiguration">
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
                        <el-form-item label="Number of phase" class="inline-radios">
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
    name: 'reactorConfiguration',
    data() {
        return {
            labelWidth: '120px',
            openConfiguration: true,
        }
    },
    props: {
        config: {
            type: Object,
            default: () => ({})
        },
    },
    methods: {
        onChangeNumberOfPhases() {
            if (this.configData.number_of_phase !== 1) {
                this.configData.phase = ''
            }
        },
    },
    computed: {
        configData() {
            return this.config
        }
    },
}
</script>
<style scoped>
::v-deep .el-input__inner,
::v-deep .el-select .el-input__inner {
    font-size: 12px !important;
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

::v-deep(.el-radio__label) {
    font-size: 12px !important;
}

::v-deep(.phase-select.el-select) {
    width: 120px !important;
    max-width: 100%;
}

@media (max-width: 767px) {
    ::v-deep(.phase-select.el-select) {
        width: 100% !important;
    }
}
</style>

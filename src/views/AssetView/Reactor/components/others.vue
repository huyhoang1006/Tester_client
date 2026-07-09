<template>
    <div id="others">
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer" @click="openOthers = !openOthers">
                    <i v-if="openOthers" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Others
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openOthers">
            <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                <el-form-item label="Insulation type">
                    <el-input v-model="otherData.insulation_type">
                    </el-input>
                </el-form-item>
                <el-form-item label="Weight">
                    <el-input type="number" number="positive" v-model="otherData.weight.value">
                        <template slot="append">kg</template>
                    </el-input>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
export default {
    name: 'OthersReactor',
    data() {
        return {
            labelWidth: '120px',
            openOthers: true,
        }
    },
    props: {
        data: {
            type: Object,
            default: () => ({})
        },
    },
    methods: {
    },
    computed: {
        otherData() {
            return this.data
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
</style>

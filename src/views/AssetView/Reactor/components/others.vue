<template>
    <div style="font-size: 12px;" class="col-content">
        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
            <span class="bolder">Others</span>
            <el-divider></el-divider>
            <el-form-item label="Insulation type">
                <el-input v-model="otherData.insulation_type.value">
                    <template slot="append">kV</template>
                </el-input>
            </el-form-item>
            <el-form-item label="Weight">
                <el-input v-model="otherData.weight.value">                                                                                            
                    <template slot="append">kg</template>
                </el-input>
            </el-form-item>   
        </el-form>
    </div>
</template>
<script>
export default {
    name: 'OthersReactor',
    data() {
        return {
            labelWidth: '200px',
        }
    },
    props: {
        other: {
            type: Object,
            default: () => ({})
        },
    },
    methods: {
    },
    computed: {
        otherData() {
            return this.other
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
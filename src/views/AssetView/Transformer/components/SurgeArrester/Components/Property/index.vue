<template>
    <div>
        <div style="font-weight: bold">General</div>

        <el-form size="mini" style="margin-top: 5px; margin-bottom: 10px;">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="6">
                    <el-form-item label="Serial number">
                        <el-input v-model="propertiesData.serial_no" placeholder="Serial number"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <el-form-item label="Manufacturer">
                        <el-input v-model="propertiesData.manufacturer" placeholder="Manufacturer"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <el-form-item label="Manufacturer year">
                        <el-input v-model="propertiesData.manufacturer_year" placeholder="Manufacturer year"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                    <el-form-item label="Asset system code">
                        <el-input v-model="propertiesData.asset_system_code" placeholder="Asset system code"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script>
export default {
    name: 'property',
    props: {
        properties: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        propertiesData() {
            return this.properties;
        }
    },
    data() {
        return {
            labelPosition: 'top',
        }
    },
}
</script>

<style scoped>
::v-deep(.el-form-item__label) {
    line-height: normal;
    /* hoặc 20px hay bất kỳ giá trị nào bạn muốn */
}
</style>
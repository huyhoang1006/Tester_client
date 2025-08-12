<template>
    <div>
        <div style="font-weight: bold; margin-bottom: 20px;">General</div>
        <div>
            <el-form style="display: flex; flex-direction: row">
                <el-form-item label="Serial number" :label-position="labelPosition">
                    <el-input v-model="propertiesData.serial_no" size="mini" placeholder="Serial number"></el-input>
                </el-form-item>
                <el-form-item label="Manufacturer" :label-position="labelPosition" style="margin-left: 20px;">
                    <el-input v-model="propertiesData.manufacturer" size="mini" placeholder="Manufacturer"></el-input>
                </el-form-item>
                <el-form-item label="Manufacturer year" :label-position="labelPosition" style="margin-left: 20px;">
                    <el-input v-model="propertiesData.manufacturer_year" size="mini" placeholder="Manufacturer year"></el-input>
                </el-form-item>
                <el-form-item label="Asset system code" :label-position="labelPosition" style="margin-left: 20px;">
                    <el-input v-model="propertiesData.asset_system_code" size="mini" placeholder="Asset system code"></el-input>
                </el-form-item>
            </el-form>
        </div>

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
  line-height: normal; /* hoặc 20px hay bất kỳ giá trị nào bạn muốn */
  margin-bottom: 4px;   /* có thể chỉnh thêm nếu cần */
}
</style>
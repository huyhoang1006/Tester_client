<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="12">
                <div class="col-content">
                    <el-form :model="properties" :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <span class="bolder">Properties</span>
                        <el-divider class="thick-divider"></el-divider>
                        <el-form-item label="Bay">
                        </el-form-item>
                        <el-form-item label="Name" class="custom-label">
                            <el-input v-model="properties.name"></el-input>
                        </el-form-item>
                        <el-form-item label="Breaker configuration" class="custom-label">
                            <el-select style="width: 100%" v-model="properties.breaker_configuration" allow-create placeholder="Value">
                                <el-option v-for="(value, index) in breakerConfigList" :key="index" :label="value" :value="value"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Bus Bar configuration" class="custom-label">
                            <el-select style="width: 100%" v-model="properties.bus_bar_configuration" allow-create placeholder="Value">
                                <el-option v-for="(value, index) in busBarConfigList" :key="index" :label="value" :value="value"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="col-content">
                    <el-form :label-width="labelWidth" size="mini" label-position="left">
                        <span class="bolder">Comment </span>
                        <el-divider></el-divider>
                        <el-input type="textarea" rows="5" v-model="properties.comment"></el-input>
                    </el-form>
                </div>
            </el-col>        
        </el-row>
    </div>
</template>

<script>
import mixin from './mixin/index'
export default {
    name: 'Bay',
    mixins: [mixin],
    props: {
        parent: {
            type: Object,
            default: () => ({})
        },
        locationId: {
            type: String,
            default: ''
        }
    },
}
</script>

<style scoped>
::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

.bolder {
    font-weight: bold;
    font-size: 12px;
}
</style>
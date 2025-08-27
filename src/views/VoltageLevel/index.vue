<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="12">
                <div class="col-content">
                    <el-form :model="properties" :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <span class="bolder">Properties</span>
                        <el-divider class="thick-divider"></el-divider>
                        <el-form-item label="Voltage Level">
                        </el-form-item>
                        <el-form-item label="Name" class="custom-label">
                            <el-input v-model="properties.name"></el-input>
                        </el-form-item>
                        <el-form-item label="High voltage limit" class="custom-label">
                            <el-row style="width: 100%">
                                <el-col style="width: calc(50% - 10px); margin-right: 10px;">
                                    <el-select v-model.number="properties.high_voltage_limit_value" allow-create filterable placeholder="Value">
                                        <el-option v-for="(value, index) in voltageList" :key="index" :label="value" :value="value"></el-option>
                                    </el-select>
                                </el-col>
                                <el-col style="width: calc(25% - 5px); margin-right: 5px;">
                                    <el-select v-model="properties.high_voltage_limit_multiplier" placeholder="Unit">
                                        <el-option v-for="(unit, index) in voltageMultiplierArr" :key="index" :label="unit" :value="unit"></el-option>
                                    </el-select>
                                </el-col>
                                <el-col style="width: calc(25% - 5px); margin-left: 5px;">
                                    <el-select v-model="properties.high_voltage_limit_unit" placeholder="Symbol">
                                        <el-option v-for="(unit, index) in voltageUnitArr" :key="index" :label="unit" :value="unit"></el-option>
                                    </el-select>
                                </el-col>
                            </el-row>
                        </el-form-item>
                        <el-form-item label="Low voltage limit" class="custom-label">
                            <el-row style="width: 100%">
                                <el-col style="width: calc(50% - 10px); margin-right: 10px;">
                                    <el-select v-model.number="properties.low_voltage_limit_value" allow-create filterable placeholder="Value">
                                        <el-option v-for="(value, index) in voltageList" :key="index" :label="value" :value="value"></el-option>
                                    </el-select>
                                </el-col>
                                <el-col style="width: calc(25% - 5px); margin-right: 5px;">
                                    <el-select v-model="properties.low_voltage_limit_multiplier" placeholder="Unit">
                                        <el-option v-for="(unit, index) in voltageMultiplierArr" :key="index" :label="unit" :value="unit"></el-option>
                                    </el-select>
                                </el-col>
                                <el-col style="width: calc(25% - 5px); margin-left: 5px;">
                                    <el-select v-model="properties.low_voltage_limit_unit" placeholder="Symbol">
                                        <el-option v-for="(unit, index) in voltageUnitArr" :key="index" :label="unit" :value="unit"></el-option>
                                    </el-select>
                                </el-col>
                            </el-row>
                        </el-form-item>
                        <el-form-item label="Base voltage" class="custom-label">
                            <el-row style="width: 100%">
                                <el-col style="width: calc(50% - 10px); margin-right: 10px;">
                                    <el-select @change="handleBaseVoltageChange" v-model.number="properties.base_voltage_value" allow-create filterable placeholder="Value">
                                        <el-option v-for="(value, index) in voltageList" :key="index" :label="value" :value="value"></el-option>
                                    </el-select>
                                </el-col>
                                <el-col style="width: calc(25% - 5px); margin-right: 5px;">
                                    <el-select v-model="properties.base_voltage_multiplier" placeholder="Unit">
                                        <el-option v-for="(unit, index) in voltageMultiplierArr" :key="index" :label="unit" :value="unit"></el-option>
                                    </el-select>
                                </el-col>
                                <el-col style="width: calc(25% - 5px); margin-left: 5px;">
                                    <el-select v-model="properties.base_voltage_unit" placeholder="Unit">
                                        <el-option v-for="(unit, index) in voltageUnitArr" :key="index" :label="unit" :value="unit"></el-option>
                                    </el-select>
                                </el-col>
                            </el-row>
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
    name: 'VoltageLevel',
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
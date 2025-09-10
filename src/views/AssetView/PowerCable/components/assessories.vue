<template>
    <div id="properties">
        <el-row :gutter="20" class="content">
            <el-col :span="12" class="col-content">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Terminal</span>
                    <el-divider></el-divider>
                    <el-form-item label="Rated voltage">
                        <el-input v-model="terminalsData.rated_voltage">
                            <template slot="append">kV</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="BIL">
                        <el-input v-model="terminalsData.bil">
                            <template slot="append">kV</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="BSL">
                        <el-input v-model="terminalsData.bsl">
                            <template slot="append">Hz</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Type">
                        <el-select
                        style="width: 100%"
                        v-model="terminalsData.type"
                        placeholder="Select">
                            <el-option label="High dielectric constant tape" value="High dielectric constant tape"> </el-option>
                            <el-option label="Geometric taped stress cone" value="Geometric taped stress cone"> </el-option>
                            <el-option label="Cold-shrink" value="Cold-shrink"> </el-option>
                            <el-option label="Porcelain" value="Porcelain"> </el-option>
                            <el-option label="Heat-shrink: Stress-relief filler" value="Heat-shrink: Stress-relief filler"> </el-option>
                            <el-option label="Heat-shrink: Stress-relief tube" value="Heat-shrink: Stress-relief tube"> </el-option>
                            <el-option label="Heat-shrink: Integrated stress relief" value="Heat-shrink: Integrated stress relief"> </el-option>
                            <el-option label="Force fit slip-on molded" value="Force fit slip-on molded"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Class">
                        <el-select
                        style="width: 100%"
                        v-model="terminalsData.class"
                        placeholder="Select">
                            <el-option label="Class 1A" value="Class 1A"> </el-option>
                            <el-option label="Class 1B" value="Class 1B"> </el-option>
                            <el-option label="Class 1C" value="Class 1C"> </el-option>
                            <el-option label="Class 2" value="Class 2"> </el-option>
                            <el-option label="Class 3" value="Class 3"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Connector type">
                        <el-select
                        style="width: 100%"
                        v-model="terminalsData.connector_type"
                        placeholder="Select">
                            <el-option label="Compression" value="Compression"> </el-option>
                            <el-option label="Soldered and welded" value="Soldered and welded"> </el-option>
                            <el-option label="Bolted and Set Screw" value="Bolted and Set Screw"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Service condition">
                        <el-select
                        style="width: 100%"
                        v-model="terminalsData.service_condition"
                        placeholder="Select">
                            <el-option label="Indoor" value="Indoor"> </el-option>
                            <el-option label="Outdoor" value="Outdoor"> </el-option>
                            <el-option label="Highly contaminated area" value="Highly contaminated area"> </el-option>
                            <el-option label="Radiation exposure" value="Radiation exposure"> </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="12" class="col-content">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Joint</span>
                    <el-divider></el-divider>
                    <el-form-item label="Rated voltage">
                        <el-input v-model="jointsData.rated_voltage">
                            <template slot="append">kV</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Rated current">
                        <el-input v-model="jointsData.rated_current">
                            <template slot="append">A</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Category">
                        <el-input v-model="jointsData.category">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Construction">
                        <el-input v-model="jointsData.construction">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Service condition">
                        <el-input v-model="jointsData.service_condition">
                            <template slot="append">km</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-row style="margin-top: 50px;" :gutter="20" class="content">
            <el-col :span="12" class="col-content">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Sheath voltage limiter</span>
                    <el-divider></el-divider>
                    <el-form-item label="Rated voltage Ur">
                        <el-input v-model="sheathLimitsData.rated_voltage">
                            <template slot="append">kV</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Maximum continuous operating voltage Uc">
                        <el-input v-model="sheathLimitsData.max_continuous">
                            <template slot="append">kV</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Nominal discharge current">
                        <el-input v-model="sheathLimitsData.nominal_discharge">
                            <template slot="append">Hz</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="High current impulse withstand">
                        <el-input v-model="sheathLimitsData.hight_current">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Long duration current impulse withstand">
                        <el-input v-model="sheathLimitsData.long_duration">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Short circuit withstand">
                        <el-input v-model="sheathLimitsData.short_circuit">
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>
<script>
export default {
    name : "assessories",
    props : {
        terminal : {
            type : Object,
            require : true,
        },
        joint : {
            type : Object,
            require : true,
        },
        sheathLimit : {
            type : Object,
            require : true,
        }
    },
    data() {
        return {
            openRatings : "true",
            labelWidth : `300px`,
        }
    },
    watch : {
    },
    methods : {
    },
    computed: {
        terminalsData() {
            return this.terminal
        },
        jointsData() {
            return this.joint
        },
        sheathLimitsData() {
            return this.sheathLimit
        }
    }
}
</script>
<style scoped>
.bolder {
    font-size: 12px;
}
</style>
<template>
    <div id="properties">
        <el-row :gutter="20" class="content">
            <el-col :xs="24" :md="12" class="col-content">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Terminal</span>
                    <el-divider></el-divider>
                    <el-form-item label="Rated voltage">
                        <el-input v-model="terminalsData.rated_u.value">
                            <template slot="append">kV</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="BIL">
                        <el-input v-model="terminalsData.bil.value">
                            <template slot="append">kV</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="BSL">
                        <el-input v-model="terminalsData.bsl.value">
                            <template slot="append">kV</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Type">
                        <el-select style="width: 100%" v-model="terminalsData.type.value" placeholder="Select">
                            <el-option label="High dielectric constant tape" value="High dielectric constant tape">
                            </el-option>
                            <el-option label="Geometric taped stress cone" value="Geometric taped stress cone">
                            </el-option>
                            <el-option label="Cold-shrink" value="Cold-shrink"> </el-option>
                            <el-option label="Porcelain" value="Porcelain"> </el-option>
                            <el-option label="Heat-shrink: Stress-relief filler"
                                value="Heat-shrink: Stress-relief filler"> </el-option>
                            <el-option label="Heat-shrink: Stress-relief tube" value="Heat-shrink: Stress-relief tube">
                            </el-option>
                            <el-option label="Heat-shrink: Integrated stress relief"
                                value="Heat-shrink: Integrated stress relief">
                            </el-option>
                            <el-option label="Force fit slip-on molded" value="Force fit slip-on molded"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Class">
                        <el-select style="width: 100%" v-model="terminalsData.class.value" placeholder="Select">
                            <el-option label="Class 1A" value="Class 1A"> </el-option>
                            <el-option label="Class 1B" value="Class 1B"> </el-option>
                            <el-option label="Class 1C" value="Class 1C"> </el-option>
                            <el-option label="Class 2" value="Class 2"> </el-option>
                            <el-option label="Class 3" value="Class 3"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Connector type">
                        <el-select style="width: 100%" v-model="terminalsData.connector_type.value"
                            placeholder="Select">
                            <el-option label="Compression" value="Compression"> </el-option>
                            <el-option label="Soldered and welded" value="Soldered and welded"> </el-option>
                            <el-option label="Bolted and Set Screw" value="Bolted and Set Screw"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Service condition">
                        <el-select style="width: 100%" v-model="terminalsData.service_condition.value"
                            placeholder="Select">
                            <el-option label="Indoor" value="Indoor"> </el-option>
                            <el-option label="Outdoor" value="Outdoor"> </el-option>
                            <el-option label="Highly contaminated area" value="Highly contaminated area"> </el-option>
                            <el-option label="Radiation exposure" value="Radiation exposure"> </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :xs="24" :md="12" class="col-content">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Joint</span>
                    <el-divider></el-divider>
                    <el-form-item label="Rated voltage">
                        <el-input v-model="jointsData.rated_u.value">
                            <template slot="append">kV</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Rated current">
                        <el-input v-model="jointsData.rated_current.value">
                            <template slot="append">A</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Category">
                        <el-input v-model="jointsData.category.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Construction">
                        <el-input v-model="jointsData.construction.value">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Service condition">
                        <el-input v-model="jointsData.service_condition.value">

                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
        <el-row :gutter="20" class="content">
            <el-col :xs="24" :md="12" class="col-content">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Sheath voltage limiter</span>
                    <el-divider></el-divider>
                    <el-form-item label="Rated voltage Ur">
                        <el-input v-model="sheathLimitsData.rated_voltage_ur.value">
                            <template slot="append">kV</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Maximum continuous operating voltage Uc">
                        <el-input v-model="sheathLimitsData.max_continuous_operating_voltage.value">
                            <template slot="append">kV</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Nominal discharge current">
                        <el-input v-model="sheathLimitsData.nominal_discharge_current.value">
                            <template slot="append">A</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="High current impulse withstand">
                        <el-input v-model="sheathLimitsData.high_current_impulse_withstand.value">
                            <template slot="append">kA</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Long duration current impulse withstand">
                        <el-input v-model="sheathLimitsData.long_duration_current_impulse_withstand.value">
                            <template slot="append">kA</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Short circuit withstand">
                        <el-input v-model="sheathLimitsData.short_circuit_withstand.value">
                            <template slot="append">kA</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>
<script>
export default {
    name: "assessories",
    props: {
        terminal: {
            type: Object,
            require: true,
        },
        joint: {
            type: Object,
            require: true,
        },
        sheathLimit: {
            type: Object,
            require: true,
        }
    },
    data() {
        return {
            openRatings: "true",
            labelWidth: `130px`,
        }
    },
    watch: {
    },
    methods: {
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

::v-deep(.content:last-of-type > .col-content:first-child) {
    margin-top: 20px;
}

@media (max-width: 991px) {
    ::v-deep(.col-content) {
        margin-bottom: 10px;
    }

    ::v-deep(.content:last-of-type > .col-content:first-child) {
        margin-top: 10px;
    }
}
</style>
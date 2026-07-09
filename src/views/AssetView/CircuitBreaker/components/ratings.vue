<template>
    <div id="ratings" class="mgy-5">
        <el-row>
            <el-col :span="24">
                <div style="font-size: 12px;" class="header-toggle pointer" @click="openRatings = !openRatings">
                    <i v-if="openRatings" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Ratings
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openRatings">
            <el-row :gutter="20" class="content">
                <el-col :xs="24" :sm="18" :md="14" :lg="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Rated frequency" class="inline-two-input">
                            <div class="rf-wrap">
                                <el-select v-model="ratingsData.rated_frequency.value">
                                    <el-option label="Custom" value="Custom"></el-option>
                                    <el-option label="60Hz" value="60"></el-option>
                                    <el-option label="50Hz" value="50"></el-option>
                                    <el-option label="16.7Hz" value="16.7"></el-option>
                                </el-select>
                                <el-input v-if="ratingsData.rated_frequency.value === 'Custom'" type="text"
                                    number="positive" v-model="ratingsData.rated_frequency_custom.value">
                                    <template slot="append">Hz</template>
                                </el-input>
                            </div>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row :gutter="20" class="content">
                <el-col :xs="24" :sm="18" :md="14" :lg="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Rated voltage L-L">
                            <el-input type="text" number="positive" v-model="ratingsData.rated_voltage_ll.value">
                                <template slot="append">kV</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated current">
                            <el-input type="text" number="positive" v-model="ratingsData.rated_current.value">
                                <template slot="append">A</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated short-circuit breaking current">
                            <el-input type="text" number="positive" v-model="ratingsData.rated_short_circuit_breaking_current.value">
                                <template slot="append">kA</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Short-circuit nominal duration">
                            <el-input type="text" number="positive" v-model="ratingsData.short_circuit_nominal_duration.value">
                                <template slot="append">s</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated insulation level (BIL)">
                            <el-input type="text" number="positive" v-model="ratingsData.rated_insulation_level.value">
                                <template slot="append">kV</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated interrupting time">
                            <el-input type="text" number="positive" v-model="ratingsData.rated_interrupting_time.value">
                                <template slot="append">ms</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Interrupting duty cycle">
                            <el-input type="textarea" maxlength="100" v-model="ratingsData.interrupting_duty_cycle"></el-input>
                        </el-form-item>
                        <el-form-item label="Rated power at closing">
                            <el-input type="text" number="positive" v-model="ratingsData.rated_power_at_closing.value">
                                <template slot="append">W</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated power at opening">
                            <el-input type="text" number="positive" v-model="ratingsData.rated_power_at_opening.value">
                                <template slot="append">W</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated power at motor charge">
                            <el-input type="text" number="positive" v-model="ratingsData.rated_power_at_motor_charge.value">
                                <template slot="append">W</template>
                            </el-input>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
export default {
    name : "circuitBreakRating",
    props : {
        ratings : {
            type : Object,
            require : true,
        }
    },
    data() {
        return {
            openRatings : "true",
            labelWidth : `200px`
        }
    },
    computed: {
        ratingsData() {
            return this.ratings
        }
    }
}
</script>

<style lang="scss" scoped>
#ratings {
    min-width: 0;
}

::v-deep(.inline-two-input .rf-wrap) {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

::v-deep(.inline-two-input .rf-wrap > .el-select),
::v-deep(.inline-two-input .rf-wrap > .el-input) {
    flex: 0 0 100%;
    width: 100%;
    max-width: 100%;
    min-width: 0;
}

::v-deep(.inline-two-input .el-input-group__append) {
    min-width: 38px;
    padding: 0 8px;
    text-align: center;
}

::v-deep(.el-form-item__content) {
    min-width: 0;
}

::v-deep(.el-input),
::v-deep(.el-select),
::v-deep(.el-textarea) {
    width: 100%;
}

@media (max-width: 767px) {
    ::v-deep(.inline-two-input .rf-wrap > .el-select),
    ::v-deep(.inline-two-input .rf-wrap > .el-input) {
        flex-basis: 100%;
        width: 100%;
    }
}
</style>

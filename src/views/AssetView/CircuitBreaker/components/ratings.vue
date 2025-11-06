<template>
    <div id="ratings" class="mgy-5">
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer" @click="openRatings = !openRatings">
                    <i v-if="openRatings" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Ratings
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openRatings">
            <el-row :gutter="20" class="content">
                <el-col :span="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item v-if="ratingsData.rated_frequency.value !== 'Custom'" label="Rated frequency">
                            <el-row class="pdl-0">
                                <el-select style="width: 100%;" v-model="ratingsData.rated_frequency.value">
                                    <el-option label="Custom" value="Custom"></el-option>
                                    <el-option label="60Hz" value="60"></el-option>
                                    <el-option label="50Hz" value="50"></el-option>
                                    <el-option label="16.7Hz" value="16.7"></el-option>
                                </el-select>
                            </el-row>
                        </el-form-item>
                        <el-form-item v-else label="Rated frequency">
                            <div style="display: flex;">
                                <div style="width: 48%;">
                                    <el-select v-model="ratingsData.rated_frequency.value">
                                        <el-option label="Custom" value="Custom"></el-option>
                                        <el-option label="60Hz" value="60"></el-option>
                                        <el-option label="50Hz" value="50"></el-option>
                                        <el-option label="16.7Hz" value="16.7"></el-option>
                                    </el-select>
                                </div>
                                <div style="width: 4%;"></div>
                                <div style="width: 48%;" v-if="ratingsData.rated_frequency.value === 'Custom'">
                                    <el-input v-model="ratingsData.rated_frequency_custom.value">
                                        <template slot="append">Hz</template>
                                    </el-input>
                                </div>
                            </div>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row :gutter="20" class="content">
                <el-col :span="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Rated voltage L-L">
                            <el-input v-model="ratingsData.rated_voltage_ll.value">
                                <template slot="append">kV</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated current">
                            <el-input v-model="ratingsData.rated_current.value">
                                <template slot="append">A</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated short-circuit breaking current">
                            <el-input v-model="ratingsData.rated_short_circuit_breaking_current.value">
                                <template slot="append">kA</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Short-circuit nominal duration">
                            <el-input v-model="ratingsData.short_circuit_nominal_duration.value">
                                <template slot="append">s</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated insulation level (BIL)">
                            <el-input v-model="ratingsData.rated_insulation_level.value">
                                <template slot="append">kV</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated interrupting time">
                            <el-input v-model="ratingsData.rated_interrupting_time.value">
                                <template slot="append">ms</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="interrupting duty cycle">
                            <el-input v-model="ratingsData.interrupting_duty_cycle"></el-input>
                        </el-form-item>
                        <el-form-item label="Rated power at closing">
                            <el-input v-model="ratingsData.rated_power_at_closing.value">
                                <template slot="append">W</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated power at opening">
                            <el-input v-model="ratingsData.rated_power_at_opening.value">
                                <template slot="append">W</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated power at motor charge">
                            <el-input v-model="ratingsData.rated_power_at_motor_charge.value">
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
            labelWidth : `250px`
        }
    },
    computed: {
        ratingsData() {
            return this.ratings
        }
    }
}
</script>

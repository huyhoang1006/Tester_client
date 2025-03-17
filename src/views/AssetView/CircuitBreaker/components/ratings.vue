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
                <el-col :span="8" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Rated frequency">
                            <el-col :span="12" class="pdl-0">
                                <el-select v-model="ratingsData.rated_frequency">
                                    <el-option label="Custom" value="Custom"></el-option>
                                    <el-option label="60Hz" value="60"></el-option>
                                    <el-option label="50Hz" value="50"></el-option>
                                    <el-option label="16.7Hz" value="16.7"></el-option>
                                </el-select>
                            </el-col>
                            <el-col :span="12" class="pdr-0" v-if="ratingsData.rated_frequency === 'Custom'">
                                <el-input v-model="ratingsData.rated_frequency_custom">
                                    <template slot="append">Hz</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row :gutter="20" class="content">
                <el-col :span="8" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Rated voltage L-L">
                            <el-input v-model="ratingsData.rated_voltage_ll">
                                <template slot="append">kV</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated current">
                            <el-input v-model="ratingsData.rated_current">
                                <template slot="append">A</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated short-circuit breaking current">
                            <el-input v-model="ratingsData.rated_shortcircuit">
                                <template slot="append">kA</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Short-circuit nominal duration">
                            <el-input v-model="ratingsData.shortcircuit_nominal">
                                <template slot="append">s</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated insulation level (BIL)">
                            <el-input v-model="ratingsData.rated_insulation">
                                <template slot="append">kV</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated interrupting time">
                            <el-input v-model="ratingsData.rated_interrupt">
                                <template slot="append">ms</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="interrupting duty cycle">
                            <el-input v-model="ratingsData.interrupt_duty"></el-input>
                        </el-form-item>
                        <el-form-item label="Rated power at closing">
                            <el-input v-model="ratingsData.rated_power_closing">
                                <template slot="append">W</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated power at opening">
                            <el-input v-model="ratingsData.rated_power_open">
                                <template slot="append">W</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated power at motor charge">
                            <el-input v-model="ratingsData.rated_power_charge">
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
    name : "cirBreakRating",
    props : {
        ratings : {
            type : Object,
            require : true,
        }
    },
    data() {
        return {
            openRatings : "true",
            labelWidth : `300px`
        }
    },
    computed: {
        ratingsData() {
            return this.ratings
        }
    }
}
</script>

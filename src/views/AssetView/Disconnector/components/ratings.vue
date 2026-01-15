<template>
    <div id="ratings" class="mgt-10">
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
                <el-col :xs="24" :md="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Rated voltage">
                            <el-col :span="24" class="pdr-0">
                                <el-input v-model="ratingsData.rated_voltage.value">
                                    <template slot="append">kV</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="Rated frequency">
                            <el-col :span="24" class="pdr-0">
                                <el-input v-model="ratingsData.rated_frequency.value">
                                    <template slot="append">Hz</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="Rated current">
                            <el-col :span="24" class="pdr-0">
                                <el-input v-model="ratingsData.rated_current.value">
                                    <template slot="append">A</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="Short time withstand current">
                            <el-col :span="24" class="pdr-0">
                                <el-input v-model="ratingsData.short_time_withstand_current.value">
                                    <template slot="append">kA</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="Rated duration of short circuit">
                            <el-col :span="24" class="pdr-0">
                                <el-input v-model="ratingsData.rated_duration_of_short_circuit.value">
                                    <template slot="append">s</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row :gutter="20" class="content">
                <el-col :xs="24" :md="12" class="col-content mgt-10">
                    <div class="bolder">Power frequency withstand voltage</div>
                    <el-divider></el-divider>
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="- to earth and between poles ">
                            <el-col :span="24" class="pdr-0">
                                <el-input v-model="ratingsData.power_freq_withstand_voltage_earth_poles.value">
                                    <template slot="append">Kv</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="- across the isolating distance">
                            <el-col :span="24" class="pdr-0">
                                <el-input v-model="ratingsData.power_freq_withstand_voltage_isolating_distance.value">
                                    <template slot="append">Hz</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </div>
</template>
<script>
export default {
    name: "ratings",
    props: {
        ratings: {
            type: Object,
            require: true,
        }
    },
    data() {
        return {
            openRatings: "true",
            labelWidth: `175px`,
        }
    },
    watch: {
    },
    computed: {
        ratingsData() {
            return this.ratings
        }
    }
}
</script>
<style scoped>
.bolder {
    font-size: 12px;
}
</style>
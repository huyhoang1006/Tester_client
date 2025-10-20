<template>
    <div id="configs">
        <div style="min-height: 120px;">
             <el-row :gutter="20" class="content" style="margin-top: 20px;">
            <el-col :span="12" class="col-content">
            <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                <span class="bolder">Phase</span>
                <el-divider></el-divider>
                <el-radio-group v-model="selectedPhase" style="margin-top: 20px;" @change="handlePhaseChange">
                    <el-radio style="margin-right: 100px;" label="1">1</el-radio>
                    <el-radio label="3">3</el-radio>
                </el-radio-group>
            </el-form>

            <el-form v-if="selectedPhase === '1'" style="margin-top: 20px;" :inline-message="true" :label-width="labelWidth" size="mini">
                <label style="font-size: 12px;">Phase name</label>
                <el-input v-model="configsData.phase_name" size="mini" class="small-input"></el-input>
            </el-form>
            </el-col>
            </el-row>
        </div>
        <el-row :gutter="20" class="content" :style="{ marginTop: selectedPhase === '3' ? '0px' : '20px' }">
            <el-col :span="12" class="col-content">
                    <el-form style="margin-top:0" :inline-message="true" :label-width="labelWidth" size="mini"
                        label-position="left">
                        <span class="bolder">Ratings</span>
                        <el-divider></el-divider>
                        <el-form-item label="Rated voltage">
                            <el-input v-model="ratingsData.rated_voltage.value">
                                <template slot="append">kV</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated frequency">
                            <el-input v-model="ratingsData.rated_frequency.value">
                                <template slot="append">Hz</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated current">
                            <el-input v-model="ratingsData.rated_current.value">
                                <template slot="append">A</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Rated power">
                            <el-input v-model="ratingsData.rated_power.value">
                                <template slot="append">kVAr</template>
                            </el-input>
                        </el-form-item>
                        <!-- Phase 1: Single Capacitance and Dissipation factor -->
                        <template v-if="selectedPhase === '1'">
                            <el-form-item label="Capacitance">
                                <el-input v-model="ratingsData.capacitace.value">
                                    <template slot="append">nF</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Dissipation factor">
                                <el-input v-model="ratingsData.dissipation_factor.value">
                                    <template slot="append">%</template>
                                </el-input>
                            </el-form-item>
                        </template>
                        
                        <!-- Phase 3: Capacitance and Dissipation factor for each phase -->
                        <template v-if="selectedPhase === '3'">
                            <el-form-item label="Capacitance">
                                <el-form  :label-width="labelWidth" size="mini" label-position="left" style="border:1px solid black ; padding: 5px 5px 4px 5px;">
                                <el-form-item label="Phase A">
                                    <el-input v-model="ratingsData.capacitace_phase_A.value">
                                        <template slot="append">nF</template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="Phase B">
                                    <el-input v-model="ratingsData.capacitace_phase_B.value">
                                        <template slot="append">nF</template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="Phase C">
                                    <el-input v-model="ratingsData.capacitace_phase_C.value">
                                        <template slot="append">nF</template>
                                    </el-input>
                                </el-form-item>
                            </el-form>
                            </el-form-item>
                            <el-form-item label="Dissipation factor">
                                <el-form  :label-width="labelWidth" size="mini" style="border:1px solid black ; padding: 5px 5px 4px 5px;">
                                <el-form-item label="Phase A" style="width: auto;" >
                                    <el-input v-model="ratingsData.dissipation_factor_A.value">
                                        <template slot="append">%</template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="Phase B">
                                    <el-input v-model="ratingsData.dissipation_factor_B.value">
                                        <template slot="append">%</template>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="Phase C">
                                    <el-input v-model="ratingsData.dissipation_factor_C.value">
                                        <template slot="append">%</template>
                                    </el-input>
                                </el-form-item>
                            </el-form>
                            </el-form-item>
                        </template>
                    </el-form>
            </el-col>
             <el-col :span="12" class="col-content">
                <el-form style="margin-left: 50px;" :inline-message="true" :label-width="labelWidth" size="mini"
                    label-position="left">
                    <span class="bolder">Others</span>
                    <el-divider></el-divider>
                    <el-form-item label="Insulation type">
                        <el-input v-model="othersData.insulation_type">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Weight">
                        <el-input v-model="othersData.weight.value">
                            <template slot="append">kg</template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>

    
</template>

<script>
export default {
    name: "configs",
    props: {
        layer: {
            type: Object,
            require: true,
        },
        datas: {
            type: Object,
            require: true,
        }
    },
    data() {
        return {
            openRatings: "true",
            labelWidth: `150px`,
            autoLayerTicked: false,
        }
    },
    mounted() {
        // Initialize phase selection
        if (this.$parent.capacitor && this.$parent.capacitor.configsData) {
            this.$parent.capacitor.configsData.phase = this.$parent.capacitor.configsData.phase || '1';
        }
    },
    methods: {
        handlePhaseChange(value) {
            this.selectedPhase = value;
            if (value === '3') {
                this.$parent.capacitor.configsData.phase_name = '';
            }
        }
    },
    computed: {
        selectedPhase: {
            get() {
                return this.$parent.capacitor.configsData.phase || '1';
            },
            set(value) {
                this.$parent.capacitor.configsData.phase = value;
            }
        },
        configsData() {
            return this.$parent.capacitor?.configsData || {};
        },
        ratingsData() {
            return this.$parent.capacitor?.ratings || {};
        },
        othersData() {
            return this.$parent.capacitor?.othersData || {};
        }
    }
}
</script>
<style scoped>
.height_form {
    min-height: 200px;
}

.small-input {
    width: 160px; 
    margin-left: 10px;
}

.wide-input {
    width: 220px !important; 
}

div.el-input-group__append {
    text-align: center;
    width: 30px;
}


.bolder {
    font-size: 12px;
}
</style>
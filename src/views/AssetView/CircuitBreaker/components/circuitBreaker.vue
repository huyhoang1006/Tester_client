<template>
    <div id="ratings" class="mgy-5">
        <div class="content-toggle">
            <el-row :gutter="20" class="content">
                <el-col :span="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <span style="font-size: 12px;" class="bolder">Circuit breaker</span>
                        <el-divider></el-divider>
                        <el-form-item label="Number of phases">
                            <el-radio-group style="display: flex; width: 100%;" v-model="circuitBreakerData.numberOfPhases">
                                <el-radio style="flex: 1;" :label="1">1</el-radio>
                                <el-radio style="flex: 1;" :label="2">2</el-radio>
                                <el-radio style="flex: 1;" :label="3">3</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="Number of interrupters per phase">
                            <el-select style="width: 100%;" v-model="circuitBreakerData.interruptersPerPhase">
                                <el-option v-for="item in 16" :key="item" :label="item" :value="item"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Pole operation">
                            <el-radio-group v-model="circuitBreakerData.poleOperation">
                                <el-radio label="Independent">Independent</el-radio>
                                <el-radio label="Ganged">Ganged</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item v-if="propertiesData.type !== 'Vacuum'" label="Pre-insertion resistors (PIR)">
                            <el-checkbox v-model="circuitBreakerData.hasPIR"></el-checkbox>
                        </el-form-item>
                        <el-form-item v-if="propertiesData.type !== 'Vacuum'" label="PIR value">
                            <el-input :disabled="!circuitBreakerData.hasPIR" v-model="circuitBreakerData.pirValue.value">
                                <template slot="append">&#8486;</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item v-if="propertiesData.type !== 'Vacuum'" label="Grading capacitors">
                            <el-checkbox v-model="circuitBreakerData.hasGradingCapacitors"></el-checkbox>
                        </el-form-item>
                        <el-form-item v-if="propertiesData.type !== 'Vacuum'" label="Capacitor value">
                            <el-input :disabled="!circuitBreakerData.hasGradingCapacitors" v-model="circuitBreakerData.capacitorValue.value">
                                <template slot="append">pF</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Interrupting medium">
                            <el-select style="width: 100%;" v-if="['MiniOil','DeadTankOCB'].includes(propertiesData.type)" v-model="circuitBreakerData.interruptingMedium">
                                <el-option label="Oil" value="Oil"></el-option>
                            </el-select>
                            <el-select style="width: 100%;" v-else-if="propertiesData.type === 'AirBlast'" v-model="circuitBreakerData.interruptingMedium">
                                <el-option label="Air" value="Air"></el-option>
                            </el-select>
                            <el-select style="width: 100%;" v-else-if="propertiesData.type === 'Vacuum'" v-model="circuitBreakerData.interruptingMedium">
                                <el-option label="Vacuum" value="Vacuum"></el-option>
                            </el-select>
                            <el-select style="width: 100%;" v-else-if="propertiesData.type === 'GenCirGCB'" v-model="circuitBreakerData.interruptingMedium">
                                <el-option label="SF6" value="SF6"> </el-option>
                                <el-option label="SF6/N2" value="SF6/N2"> </el-option>
                                <el-option label="SF6/CF4" value="SF6/CF4"> </el-option>
                                <el-option label="Oil" value="Oil"> </el-option>
                                <el-option label="Air" value="Air"> </el-option>
                            </el-select>
                            <el-select style="width: 100%;" v-else-if="propertiesData.type === 'GasInsuGIS'" v-model="circuitBreakerData.interruptingMedium">
                                <el-option label="SF6" value="SF6"> </el-option>
                                <el-option label="SF6/N2" value="SF6/N2"> </el-option>
                                <el-option label="SF6/CF4" value="SF6/CF4"> </el-option>
                                <el-option label="Oil" value="Oil"> </el-option>
                            </el-select>
                            <el-select style="width: 100%;" v-else-if="propertiesData.type === 'Miscell'" v-model="circuitBreakerData.interruptingMedium">
                                <el-option label="SF6" value="SF6"> </el-option>
                                <el-option label="SF6/N2" value="SF6/N2"> </el-option>
                                <el-option label="SF6/CF4" value="SF6/CF4"> </el-option>
                                <el-option label="Oil" value="Oil"> </el-option>
                                <el-option label="Air" value="Air"> </el-option>
                                <el-option label="Vacuum" value="Vacuum"></el-option>
                            </el-select>
                            <el-select style="width: 100%;" v-else v-model="circuitBreakerData.interruptingMedium">
                                <el-option label="SF6" value="SF6"> </el-option>
                                <el-option label="SF6/N2" value="SF6/N2"> </el-option>
                                <el-option label="SF6/CF4" value="SF6/CF4"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Tank type">
                            <el-select style="width: 100%;" v-if="['GenCirGCB','GasInsuGIS'].includes(propertiesData.type)" v-model="circuitBreakerData.tankType">
                                <el-option label="---" value="noValue"></el-option>
                            </el-select>
                            <el-select style="width: 100%;" v-else-if="['Miscell'].includes(propertiesData.type)" v-model="circuitBreakerData.tankType">
                                <el-option label="Live tank" value="liveTank"></el-option>
                                <el-option label="Dead tank" value="deadTank"></el-option>
                                <el-option label="---" value="noValue"></el-option>
                            </el-select>
                            <el-select style="width: 100%;" v-else-if="['DeadTankOCB','DeadTankSF6'].includes(propertiesData.type)" v-model="circuitBreakerData.tankType">
                                <el-option label="Dead tank" value="deadTank"></el-option>
                            </el-select>
                            <el-select style="width: 100%;" v-else v-model="circuitBreakerData.tankType">
                                <el-option label="Live tank" value="liveTank"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
export default {
    name : "circuitBreakerData",
    props : {
        circuitBreaker : {
            type : Object,
            require : true,
        },
        properties : {
            type : Object,
            require : true
        }
    },
    data() {
        return {
            labelWidth : `250px`,
        }
    },
    computed: {
        circuitBreakerData() {
            return this.circuitBreaker
        },
        propertiesData() {
            return this.properties
        }
    },
    methods: {
    },
}
</script>
<style scoped>
::v-deep(.el-radio__label) {
    font-size: 12px !important;
}
</style>
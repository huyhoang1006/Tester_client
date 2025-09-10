<template>
    <div id="ratings" class="mgy-5">
        <div class="content-toggle">
            <el-row :gutter="20" class="content">
                <el-col :span="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <span style="font-size: 12px;" class="bolder">Circuit breaker</span>
                        <el-divider></el-divider>
                        <el-form-item label="Number of phases">
                            <el-radio-group @change="show()" v-model="circuitBreakeringData.numberOfPhase">
                                <el-radio :label="1">1</el-radio>
                                <el-radio :label="2">2</el-radio>
                                <el-radio :label="3">3</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="Number of interrupters per phase">
                            <el-select v-model="circuitBreakeringData.numberOfInterruptPhase">
                                <el-option v-for="item in 16" :key="item" :label="item" :value="item"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Pole operation">
                            <el-radio-group v-model="circuitBreakeringData.poleOperation">
                                <el-radio label="Independent">Independent</el-radio>
                                <el-radio label="Ganged">Ganged</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item v-if="propertiesData.asset_type !== 'Vacuum'" label="Pre-insertion resistors (PIR)">
                            <el-checkbox v-model="circuitBreakeringData.PreInsert"></el-checkbox>
                        </el-form-item>
                        <el-form-item v-if="propertiesData.asset_type !== 'Vacuum'" label="PIR value">
                            <el-input :disabled="!circuitBreakeringData.PreInsert" v-model="circuitBreakeringData.PIR">
                                <template slot="append">&#8486;</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item v-if="propertiesData.asset_type !== 'Vacuum'" label="Grading capacitors">
                            <el-checkbox v-model="circuitBreakeringData.gradingCap"></el-checkbox>
                        </el-form-item>
                        <el-form-item v-if="propertiesData.asset_type !== 'Vacuum'" label="Capacitor value">
                            <el-input :disabled="!circuitBreakeringData.gradingCap" v-model="circuitBreakeringData.capacitorValue">
                                <template slot="append">pF</template>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Interrupting medium">
                            <el-select v-if="['MiniOil','DeadTankOCB'].includes(propertiesData.asset_type)" v-model="circuitBreakeringData.interruptMedium">
                                <el-option label="Oil" value="Oil"></el-option>
                            </el-select>
                            <el-select v-else-if="propertiesData.asset_type === 'AirBlast'" v-model="circuitBreakeringData.interruptMedium">
                                <el-option label="Air" value="Air"></el-option>
                            </el-select>
                            <el-select v-else-if="propertiesData.asset_type === 'Vacuum'" v-model="circuitBreakeringData.interruptMedium">
                                <el-option label="Vacuum" value="Vacuum"></el-option>
                            </el-select>
                            <el-select v-else-if="propertiesData.asset_type === 'GenCirGCB'" v-model="circuitBreakeringData.interruptMedium">
                                <el-option label="SF6" value="SF6"> </el-option>
                                <el-option label="SF6/N2" value="SF6/N2"> </el-option>
                                <el-option label="SF6/CF4" value="SF6/CF4"> </el-option>
                                <el-option label="Oil" value="Oil"> </el-option>
                                <el-option label="Air" value="Air"> </el-option>
                            </el-select>
                            <el-select v-else-if="propertiesData.asset_type === 'GasInsuGIS'" v-model="circuitBreakeringData.interruptMedium">
                                <el-option label="SF6" value="SF6"> </el-option>
                                <el-option label="SF6/N2" value="SF6/N2"> </el-option>
                                <el-option label="SF6/CF4" value="SF6/CF4"> </el-option>
                                <el-option label="Oil" value="Oil"> </el-option>
                            </el-select>
                            <el-select v-else-if="propertiesData.asset_type === 'Miscell'" v-model="circuitBreakeringData.interruptMedium">
                                <el-option label="SF6" value="SF6"> </el-option>
                                <el-option label="SF6/N2" value="SF6/N2"> </el-option>
                                <el-option label="SF6/CF4" value="SF6/CF4"> </el-option>
                                <el-option label="Oil" value="Oil"> </el-option>
                                <el-option label="Air" value="Air"> </el-option>
                                <el-option label="Vacuum" value="Vacuum"></el-option>
                            </el-select>
                            <el-select v-else v-model="circuitBreakeringData.interruptMedium">
                                <el-option label="SF6" value="SF6"> </el-option>
                                <el-option label="SF6/N2" value="SF6/N2"> </el-option>
                                <el-option label="SF6/CF4" value="SF6/CF4"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Tank type">
                            <el-select v-if="['GenCirGCB','GasInsuGIS'].includes(propertiesData.asset_type)" v-model="circuitBreakeringData.tankType">
                                <el-option label="---" value="noValue"></el-option>
                            </el-select>
                            <el-select v-else-if="['Miscell'].includes(propertiesData.asset_type)" v-model="circuitBreakeringData.tankType">
                                <el-option label="Live tank" value="liveTank"></el-option>
                                <el-option label="Dead tank" value="deadTank"></el-option>
                                <el-option label="---" value="noValue"></el-option>
                            </el-select>
                            <el-select v-else-if="['DeadTankOCB','DeadTankSF6'].includes(propertiesData.asset_type)" v-model="circuitBreakeringData.tankType">
                                <el-option label="Dead tank" value="deadTank"></el-option>
                            </el-select>
                            <el-select v-else v-model="circuitBreakeringData.tankType">
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
    name : "circuitBreakering",
    props : {
        circuitBreakering : {
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
            labelWidth : `300px`,
        }
    },
    computed: {
        circuitBreakeringData() {
            return this.circuitBreakering
        },
        propertiesData() {
            return this.properties
        }
    },
    methods: {
        show() {
            console.log(this.circuitBreakeringData.PreInsert)
        }
    },
    watch : {
        'propertiesData.asset_type' : {
            immediate : true,
            deep : true,
            handler : function() {
                console.log(this.propertiesData.asset_type)
            }
        }
    }
}
</script>
<style scoped>
::v-deep(.el-radio__label) {
    font-size: 12px !important;
}
</style>
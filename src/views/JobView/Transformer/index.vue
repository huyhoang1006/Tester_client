<template>
    <div id="job">
        <el-row id="top-bar">
            <el-col :span="24">
                <el-button @click="backToManage" style="box-sizing: border-box; border-right: 1px solid #aeb6bf">
                    <i class="fa-solid fa-circle-arrow-left display-block fa-2x"></i>
                    <div class="mgt-10">Manage</div>
                </el-button>
                <el-button @click="saveJob">
                    <i class="fa-solid fa-floppy-disk display-block fa-2x"></i>
                    <div class="mgt-10">Save job</div>
                </el-button>
                <el-button @click="$router.go(-1)" style="box-sizing: border-box">
                    <i class="fa-solid fa-ban display-block fa-2x"></i>
                    <div class="mgt-10">Cancel</div>
                </el-button>
                <el-button style="float: right; text-align: right; width: fit-content; cursor: default">
                    <img src="@/assets/images/logo.png" style="max-height: 40px" />
                </el-button>
            </el-col>
        </el-row>
        <el-row :gutter="20" id="main-content" style="padding: 0">
            <el-tabs tab-position="left" type="border-card" class="w-100 h-100">
                <!-- Overview -->
                <el-tab-pane style="width: 100%;">
                    <span slot="label"><i class="fa-solid fa-book"></i> Overview</span>
                    <overview :data="properties" :location="location" :asset="asset"></overview>
                </el-tab-pane>

                <!-- Select test -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Select test</span>
                    <select-test style="width: 100%;"
                        :mode="mode" 
                        :data="testList" 
                        :tap-changers="tapChangers" 
                        :asset="asset" 
                        :obj-active-name="objActiveName"
                        :attachmentArr.sync="attachmentArr"
                        :testconditionArr.sync="testconditionArr"
                        :bushings = "bushing"
                        ></select-test>
                </el-tab-pane>

                <!-- Tests -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-calculator"></i> Tests</span>
                    <div id="tests" style="width: 100%;">
                        <el-tabs v-model="objActiveName.activeName" type="card" class="w-100 h-100">
                            <el-tab-pane v-for="(item, index) in testList" :key="index" :label="item.name" :name="item.tabId">
                                <test-information
                                title="Test"
                                :testCondition.sync="testconditionArr[index]"
                                :attachment.sync="attachmentArr[index]"
                                >
                                </test-information>
                                <component v-if="testconditionArr[index] != undefined"
                                    :is="item.testTypeCode" 
                                    :data="item.data" 
                                    :asset="asset" 
                                    :tap-changers="tapChangers"
                                    :testCondition = "testconditionArr[index]"
                                    >
                                </component>
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                </el-tab-pane>

                <!-- Health Index -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-heart-pulse"></i> Health Index</span>
                    <health-index style="width: 100%;" v-if="properties.asset !== '' && listHeal.length !== 0" :properties="properties" :data="listHeal"></health-index>
                </el-tab-pane>

                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-table-columns"></i> Test summary</span>
                    <test-summary style="width: 100%;" v-if="testList.length !==0" :data="testList" :asset="asset"></test-summary>
                </el-tab-pane>
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-file-export"></i> Report</span>
                    <exportData v-if="testList.length !==0" :data="testList"></exportData>
                </el-tab-pane>
            </el-tabs>
        </el-row>
    </div>
</template>

<script>
/* eslint-disable */
import SelectTest from './components/SelectTest'
import DcWindingPrim from './components/DcWindingPrim'
import DcWindingSec from './components/DcWindingSec'
import DcWindingTert from './components/DcWindingTert'
import DimensionWeight from './components/DimensionWeight'
import EnergyEfficiency from './components/EnergyEfficiency'
import ExcitingCurrent from './components/ExcitingCurrent'
import GeneralInspection from './components/GeneralInspection'
import InducedAcVoltageTests from './components/InducedAcVoltageTests'
import InsulationResistance from './components/InsulationResistance'
import MeasurementOfNoLoad from './components/MeasurementOfNoLoad'
import MeasurementOfOil from './components/MeasurementOfOil'
import MeasurementOfShortCircuit from './components/MeasurementOfShortCircuit'
import RatioPrimSec from './components/RatioPrimSec'
import SeparateSourceAc from './components/SeparateSourceAc'
import TestingInstruments from './components/TestingInstruments'
import Overview from './components/Overview'
import WindingDfCap from './components/WindingDfCap'
import BushingPrimC1 from './components/BushingPrimC1'
import BushingPrimC2 from './components/BushingPrimC2'
import BushingSecC1 from './components/BushingSecC1'
import BushingSecC2 from './components/BushingSecC2'
import BushingTertC1 from './components/BushingTertC1'
import BushingTertC2 from './components/BushingTertC2'
import InsulationResistanceYokeCore from './components/InsulationResistanceYokeCore'
import ShortCircuitImpedancePrim from './components/ShortCircuitImpedancePrim'
import ShortCircuitImpedanceSec from './components/ShortCircuitImpedanceSec'
import ShortCircuitImpedanceTert from './components/ShortCircuitImpedanceTert'
import GasChromatography from './components/GasChromatography'

// import ShortPrimSec from './components/ShortPrimSec'
// import ShortSecTert from './components/ShortSecTert'
// import ShortPrimTert from './components/ShortPrimTert'
import Dga from './components/Dga'
// import DielectricResponseAnalysis from './components/DielectricResponseAnalysis'


import TestSummary from './components/TestSummary'
import HealthIndex from './components/HealthIndex'
import mixin from './mixin'
import Mixtestcondition from './mixin/Mixtestcondition'
import testInformation from '@/views/Common/testInformation.vue'
import exportData from './components/ExportData'

export default {
    name: 'JobView',
    components: {
        SelectTest,
        Overview,
        DcWindingPrim,
        DcWindingSec,
        DcWindingTert,
        DimensionWeight,
        EnergyEfficiency,
        ExcitingCurrent,
        GeneralInspection,
        InducedAcVoltageTests,
        InsulationResistance,
        MeasurementOfNoLoad,
        MeasurementOfOil,
        MeasurementOfShortCircuit,
        RatioPrimSec,
        SeparateSourceAc,
        TestingInstruments,
        WindingDfCap,
        BushingPrimC1,
        BushingPrimC2,
        BushingSecC1,
        BushingSecC2,
        BushingTertC1,
        BushingTertC2,
        // ShortPrimSec,
        // ShortSecTert,
        // ShortPrimTert,
        Dga,
        GasChromatography,
        InsulationResistanceYokeCore,
        ShortCircuitImpedancePrim,
        ShortCircuitImpedanceSec,
        ShortCircuitImpedanceTert,
        // DielectricResponseAnalysis
        TestSummary,
        HealthIndex,
        testInformation,
        exportData
    },
    mixins: [mixin, Mixtestcondition],
    data() {
        return {
            mode: this.$constant.ADD,
            job_id: null,
            saved: false,
            objActiveName: {
                activeName: null
            }
        }
    },
    mounted() {},
    methods: {
    },
}
</script>

<style lang="scss" scoped>
#job {
    width: 100%;
    height: 100%;
}

#tests,
#job__health-index {
    width: calc(100vw - 145px);
    height: calc(100vh - 150px);
    overflow-y: auto;
    overflow-x: hidden;
}

.el-tabs--border-card {
    border: none;
}
</style>

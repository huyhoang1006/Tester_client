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
                        :asset="asset" 
                        :obj-active-name="objActiveName"
                        :attachmentArr.sync="attachmentArr"
                        :testconditionArr.sync="testconditionArr"
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
                                <component
                                    :is="item.testTypeCode" 
                                    :data="item.data" 
                                    :asset="asset" 
                                    >
                                </component>
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </el-row>
    </div>
</template>

<script>
/* eslint-disable */
import SelectTest from './componentCircuits/SelectTest'
import Overview from './componentCircuits/Overview'

//circuit breaker
import motorCurrent from './componentCircuits/MotorCurrent.vue'
import oTiming from './componentCircuits/OTiming.vue'
import cTiming from './componentCircuits/CTiming.vue'
import ocTiming from './componentCircuits/OCTiming.vue'
import coTiming from './componentCircuits/COTiming.vue'
import ocoTiming from './componentCircuits/O-COTiming.vue'
import cocoTiming from './componentCircuits/CO-COTiming.vue'
import ococoTiming from './componentCircuits/O-CO-COTiming.vue'
import contactResistance from './componentCircuits/ContactResistance.vue'
import minimumPickup from './componentCircuits/MinimumPickup.vue'
import dcWindingTripCoil from './componentCircuits/DCWindingTrip.vue'
import dcWindingCloseCoil from './componentCircuits/DCWindingClose.vue'
import dcWindingMotor from './componentCircuits/DCWindingMotor.vue'
import insulationResistanceCircuit from './componentCircuits/InsulationResistanceCircuit.vue'
import insulationResistanceTripCoil from './componentCircuits/InsulationResistanceTripCoil.vue'
import insulationResistanceCloseCoil from './componentCircuits/InsulationResistanceCloseCoil.vue'
import insulationResistanceMotor from './componentCircuits/InsulationResistanceMotor.vue'
import sf6MoiturePurity from './componentCircuits/SF6MoiturePurity.vue'
import sf6GasAnalysis from './componentCircuits/SF6GasAnalysis.vue'
import pressureGauge from './componentCircuits/PressureGauge.vue'
import mixin from './mixin'
import Mixtestcondition from './mixin/Mixtestcondition'
import testInformation from '@/views/Common/testInformation.vue'
import OverCurrentRelease from './componentCircuits/OverCurrentRelease.vue'
import underVoltageRelease from './componentCircuits/UnderVolRelease.vue'
import inspection from './componentCircuits/Inspection.vue'

export default {
    name: 'JobViewCircuitBreaker',
    components: {
        SelectTest,
        Overview,
        motorCurrent,
        cTiming,
        oTiming,
        ocTiming,
        coTiming,
        ocoTiming,
        cocoTiming,
        ococoTiming,
        contactResistance,
        minimumPickup,
        dcWindingTripCoil,
        dcWindingCloseCoil,
        dcWindingMotor,
        insulationResistanceCircuit,
        insulationResistanceTripCoil,
        insulationResistanceCloseCoil,
        insulationResistanceMotor,
        sf6MoiturePurity,
        sf6GasAnalysis,
        pressureGauge,
        testInformation,
        OverCurrentRelease,
        underVoltageRelease,
        inspection
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

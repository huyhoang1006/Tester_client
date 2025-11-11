<template>
    <div id="job">
        <el-row :gutter="20" style="padding: 0">
            <el-tabs type="card" >
                <!-- Overview -->
                <el-tab-pane style="width: 100%;">
                    <span slot="label"><i class="fa-solid fa-book"></i> Overview</span>
                    <overview :data="circuitBreakerJobDto.properties" @update-attachment="updateAttachmentOverView" :attachment.sync="circuitBreakerJobDto.attachmentData" :locationData="locationData" :assetData="assetData" :productAssetModelData="productAssetModelData" :parentOrganization="parentOrganization"></overview>
                </el-tab-pane>

                <!-- Select test -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Select test</span>
                    <select-test style="width: 100%;"
                        :data="circuitBreakerJobDto.testList" 
                        :assetData="assetData" 
                        :testTypeListData="testTypeListData"
                        :obj-active-name="objActiveName"
                        :attachmentArr.sync="attachmentArr"
                        :testconditionArr.sync="testconditionArr"
                        ></select-test>
                </el-tab-pane>

                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Testing equipment</span>
                    <div>
                        <testingequipment :data="circuitBreakerJobDto.testingEquipmentData" :testTypeListData="testTypeListData"></testingequipment>
                    </div>
                </el-tab-pane>

                <!-- Tests -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-calculator"></i> Tests</span>
                    <div id="tests" style="width: 100%;">
                        <el-tabs v-model="objActiveName.activeName" type="card" class="w-100 h-100">
                            <el-tab-pane v-for="(item, index) in circuitBreakerJobDto.testList" :key="index" :label="item.name" :name="item.tabId">
                                <test-information
                                title="Test"
                                :testCondition.sync="testconditionArr[index]"
                                :attachment.sync="attachmentArr[index]"
                                >
                                </test-information>
                                <component
                                    :is="item.testTypeCode" 
                                    :data="item.data" 
                                    :asset="assetData" 
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
import testingequipment from './componentCircuits/TestingEquipment/index.vue'

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
        inspection,
        testingequipment
    },
    props: {
        locationData: {
            type: Object,
            default: () => ({})
        },
        assetData: {
            type: Object,
            default: () => ({})
        },
        productAssetModelData: {
            type: Object,
            default: () => ({})
        },
        parentOrganization: {
            type: Object,
            default: () => ({})
        },
        testTypeListData: {
            type: Array,
            default: () => []
        }
    },
    mixins: [mixin, Mixtestcondition],
    data() {
        return {
            objActiveName: {
                activeName: null
            }
        }
    },
    mounted() {},
    methods: {
        updateAttachmentOverView(attachment) {
            this.attachmentData = attachment
        },
        loadMapForView() {
        },
    },
}
</script>

<style lang="scss" scoped>
#job {
    width: 100%;
}

::v-deep(.el-tabs__item) {
  font-size: 12px !important;
  font-weight: bold !important;
}

::v-deep(.el-tabs__item.is-active) {
  color: #fff !important;
  background-color: var(--el-color-primary, #012596) !important;
  border-radius: 4px 4px 0 0;
  font-size: 12px !important;
}

#tests,
#job__health-index {
    width: calc(100vw - 145px);
    overflow-y: auto;
    overflow-x: hidden;
}

.el-tabs--border-card {
    border: none;
}
</style>
<template>
    <div id="job">
        <el-row :gutter="20" style="padding: 0">
            <el-tabs type="card">
                <!-- Overview -->
                <el-tab-pane style="width: 100%;">
                    <span slot="label"><i class="fa-solid fa-book"></i> Overview</span>
                    <overview :data="circuitBreakerJobDto.properties" @update-attachment="updateAttachmentOverView" :attachment.sync="circuitBreakerJobDto.attachmentData" :locationData="locationData" :assetData="assetData" :productAssetModelData="productAssetModelData" :parentOrganization="parentOrganization"></overview>
                </el-tab-pane>

                <!-- Select test -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Test settings</span>
                    <select-test style="width: 100%;"
                        :data="circuitBreakerJobDto.testList"
                        :testTypeListData="testTypeListData"
                        :assetData="assetData"
                        :obj-active-name="objActiveName"
                        ></select-test>
                </el-tab-pane>

                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Testing equipment</span>
                    <div>
                        <testing-equipment :data="circuitBreakerJobDto.testingEquipmentData" :testTypeListData="testTypeListData"></testing-equipment>
                    </div>
                </el-tab-pane>

                <!-- Tests -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-calculator"></i> Test data</span>
                    <div id="tests" style="width: 100%;">
                        <el-tabs v-model="objActiveName.activeName" type="card" class="w-100 h-100">
                            <el-tab-pane v-for="(item, index) in circuitBreakerJobDto.testList" :key="index" :label="item.name" :name="item.name + index">
                                <test-information
                                    :title="item.name"
                                    :data="item.testCondition"
                                    :assetData="assetData"
                                    :attachment="item.testCondition.attachmentData">
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
import mixin from './mixin'
import overview from './components/Overview/index.vue'
import SelectTest from './components/SelectTest'
import testInformation from '@/views/Common/testInformation.vue'
import testingEquipment from './components/TestingEquipment/index.vue'

//circuit breaker
import motorCurrent from './components/MotorCurrent.vue'
import oTiming from './components/OTiming.vue'
import cTiming from './components/CTiming.vue'
import ocTiming from './components/OCTiming.vue'
import coTiming from './components/COTiming.vue'
import ocoTiming from './components/O-COTiming.vue'
import cocoTiming from './components/CO-COTiming.vue'
import ococoTiming from './components/O-CO-COTiming.vue'
import ContactResistance from './components/ContactResistance.vue'
import minimumPickup from './components/MinimumPickup.vue'
import dcWindingTripCoil from './components/DCWindingTrip.vue'
import dcWindingCloseCoil from './components/DCWindingClose.vue'
import dcWindingMotor from './components/DCWindingMotor.vue'
import insulationResistanceCircuit from './components/InsulationResistanceCircuit.vue'
import insulationResistanceTripCoil from './components/InsulationResistanceTripCoil.vue'
import insulationResistanceCloseCoil from './components/InsulationResistanceCloseCoil.vue'
import insulationResistanceMotor from './components/InsulationResistanceMotor.vue'
import sf6MoiturePurity from './components/SF6MoiturePurity.vue'
import sf6GasAnalysis from './components/SF6GasAnalysis.vue'
import pressureGauge from './components/PressureGauge.vue'
import OverCurrentRelease from './components/OverCurrentRelease.vue'
import underVoltageRelease from './components/UnderVolRelease.vue'
import inspection from './components/Inspection.vue'

export default {
    name: 'JobViewCircuitBreaker',
    components: {
        SelectTest,
        overview,
        motorCurrent,
        cTiming,
        oTiming,
        ocTiming,
        coTiming,
        ocoTiming,
        cocoTiming,
        ococoTiming,
        ContactResistance,
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
        testingEquipment
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
    mixins: [mixin],
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
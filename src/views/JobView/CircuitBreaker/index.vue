<template>
    <div id="job">
        <el-row :gutter="20" style="padding: 0">
            <el-tabs type="card">
                <!-- Overview -->
                <el-tab-pane style="width: 100%;">
                    <span slot="label"><i class="fa-solid fa-book"></i> Overview</span>
                    <overview :data="circuitBreakerJobDto.properties" @update-attachment="updateAttachmentOverView"
                        :attachment.sync="circuitBreakerJobDto.attachmentData" :locationData="locationData"
                        :assetData="assetData" :productAssetModelData="productAssetModelData"
                        :parentOrganization="parentOrganization"></overview>
                </el-tab-pane>

                <!-- Select test -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Test settings</span>
                    <select-test style="width: 100%;" :data="circuitBreakerJobDto.testList"
                        :testTypeListData="testTypeListData" :assetData="assetData"
                        :obj-active-name="objActiveName"></select-test>
                </el-tab-pane>

                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Testing equipment</span>
                    <div>
                        <testing-equipment :data="circuitBreakerJobDto.testingEquipmentData"
                            :testTypeListData="testTypeListData"></testing-equipment>
                    </div>
                </el-tab-pane>

                <!-- Tests -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-calculator"></i> Test data</span>
                    <div id="tests" style="width: 100%;">
                        <el-tabs v-model="objActiveName.activeName" type="card" class="w-100 h-100">
                            <el-tab-pane v-for="(item, index) in circuitBreakerJobDto.testList" :key="index"
                                :label="item.name" :name="item.name + index">
                                <test-information :title="item.name" :data="item.testCondition" :assetData="assetData"
                                    :attachment="item.testCondition.attachmentData">
                                </test-information>
                                <component :is="item.testTypeCode" :data="item.data" :asset="assetData">
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
import MotorCurrent from './components/MotorCurrent.vue'
import OTiming from './components/OTiming.vue'
import CTiming from './components/CTiming.vue'
import OCTiming from './components/OCTiming.vue'
import COTiming from './components/COTiming.vue'
import OCOTiming from './components/OCOTiming.vue'
import COCOTiming from './components/COCOTiming.vue'
import OCOCOTiming from './components/OCOCOTiming.vue'
import ContactResistance from './components/ContactResistance.vue'
import MinimumPickup from './components/MinimumPickup.vue'
import DCWindingTripCoil from './components/DCWindingTripCoil.vue'
import DCWindingCloseCoil from './components/DCWindingCloseCoil.vue'
import DCWindingMotor from './components/DCWindingMotor.vue'
import InsulationResistanceCircuit from './components/InsulationResistanceCircuit.vue'
import InsulationResistanceTripCoil from './components/InsulationResistanceTripCoil.vue'
import InsulationResistanceCloseCoil from './components/InsulationResistanceCloseCoil.vue'
import InsulationResistanceMotor from './components/InsulationResistanceMotor.vue'
import SF6MoiturePurity from './components/SF6MoiturePurity.vue'
import SF6GasAnalysis from './components/SF6GasAnalysis.vue'
import PressureGauge from './components/PressureGauge.vue'
import OverCurrentRelease from './components/OverCurrentRelease.vue'
import UnderVoltageRelease from './components/UnderVoltageRelease.vue'
import GeneralInspection from './components/GeneralInspection.vue'

export default {
    name: 'JobViewCircuitBreaker',
    components: {
        SelectTest,
        overview,
        MotorCurrent,
        CTiming,
        OTiming,
        OCTiming,
        COTiming,
        OCOTiming,
        COCOTiming,
        OCOCOTiming,
        ContactResistance,
        MinimumPickup,
        DCWindingTripCoil,
        DCWindingCloseCoil,
        DCWindingMotor,
        InsulationResistanceCircuit,
        InsulationResistanceTripCoil,
        InsulationResistanceCloseCoil,
        InsulationResistanceMotor,
        SF6MoiturePurity,
        SF6GasAnalysis,
        PressureGauge,
        testInformation,
        OverCurrentRelease,
        UnderVoltageRelease,
        GeneralInspection,
        testingEquipment
    },
    props: {

        parentOrganization: {
            type: Object,
            default: () => ({})
        },
    },

    mixins: [mixin],
    data() {
        return {
            objActiveName: {
                activeName: null
            },
            testTypeListData: [],
            assetData: {},
            locationData: {},
            productAssetModelData: {},
        }
    },
    mounted() { },
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
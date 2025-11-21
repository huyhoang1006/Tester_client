<template>
    <div id="job">
        <el-row :gutter="20" style="padding: 0">
            <el-tabs type="card">
                <!-- Overview -->
                <el-tab-pane style="width: 100%;">
                    <span slot="label"><i class="fa-solid fa-book"></i> Overview</span>
                    <overview :data="transformerJobDto.properties" @update-attachment="updateAttachmentOverView" :attachment.sync="transformerJobDto.attachmentData" :locationData="locationData" :assetData="assetData" :productAssetModelData="productAssetModelData" :parentOrganization="parentOrganization"></overview>
                </el-tab-pane>

                <!-- Select test -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Select test</span>
                    <select-test style="width: 100%;"
                        :data="transformerJobDto.testList" 
                        :assetData="assetData" 
                        :obj-active-name="objActiveName"
                        :testTypeListData="testTypeListData"
                        :tap-changers="tapChangers"
                        ></select-test>
                </el-tab-pane>

                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Testing equipment</span>
                    <div>
                        <testing-equipment :data="transformerJobDto.testingEquipmentData" :testTypeListData="testTypeListData"></testing-equipment>
                    </div>
                </el-tab-pane>

                <!-- Tests -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-calculator"></i> Tests</span>
                    <div id="tests" style="width: 100%;">
                        <el-tabs v-model="objActiveName.activeName" type="card" class="w-100 h-100">
                            <el-tab-pane v-for="(item, index) in transformerJobDto.testList" :key="index" :label="item.name" :name="item.tabId">
                                <test-information
                                :title="item.name"
                                :data="item.testCondition || testconditionArr[index]"
                                :assetData="assetData"
                                :attachment.sync="attachmentArr[index]"
                                >
                                </test-information>
                                <component 
                                    v-if="item.testCondition || testconditionArr[index]"
                                    :is="item.testTypeCode" 
                                    :data="item.data" 
                                    :asset="asset" 
                                    :tap-changers="tapChangers"
                                    :testCondition="item.testCondition || testconditionArr[index]"
                                    >
                                </component>
                            </el-tab-pane>
                        </el-tabs>
                    </div>
                </el-tab-pane>

                <!-- Health Index -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-heart-pulse"></i> Health Index</span>
                    <health-index style="width: 100%;" v-if="transformerJobDto.properties.asset_id !== '' && listHeal.length !== 0" :properties="transformerJobDto.properties" :data="listHeal"></health-index>
                </el-tab-pane>

                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-table-columns"></i> Test summary</span>
                    <test-summary style="width: 100%;" v-if="transformerJobDto.testList.length !==0" :data="transformerJobDto.testList" :asset="asset"></test-summary>
                </el-tab-pane>
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-file-export"></i> Report</span>
                    <exportData v-if="transformerJobDto.testList.length !==0" :data="transformerJobDto.testList"></exportData>
                </el-tab-pane>
            </el-tabs>
        </el-row>
    </div>
</template>

<script>
/* eslint-disable */
import SelectTest from './components/SelectTest/index.vue'
import DcWindingPrim from './components/DcWindingPrim/index.vue'
import DcWindingSec from './components/DcWindingSec/index.vue'
import DcWindingTert from './components/DcWindingTert/index.vue'
import DimensionWeight from './components/DimensionWeight'
import EnergyEfficiency from './components/EnergyEfficiency/index.vue'
import ExcitingCurrent from './components/ExcitingCurrent'
import GeneralInspection from './components/GeneralInspection/index.vue'
import InducedAcVoltageTests from './components/InducedAcVoltageTests/index.vue'
import InsulationResistance from './components/InsulationResistance/index.vue'
import MeasurementOfNoLoad from './components/MeasurementOfNoLoad/index.vue'
import MeasurementOfOil from './components/MeasurementOfOil/index.vue'
import MeasurementOfShortCircuit from './components/MeasurementOfShortCircuit/index.vue'
import RatioPrimSec from './components/RatioPrimSec/index.vue'
import SeparateSourceAc from './components/SeparateSourceAc/index.vue'
import TestingInstruments from './components/TestingInstruments'
import Overview from './components/Overview/index.vue'
import WindingDfCap from './components/WindingDfCap/index.vue'
import BushingPrimC1 from './components/BushingPrimC1/index.vue'
import BushingPrimC2 from './components/BushingPrimC2/index.vue'
import BushingSecC1 from './components/BushingSecC1/index.vue'
import BushingSecC2 from './components/BushingSecC2/index.vue'
import BushingTertC1 from './components/BushingTertC1/index.vue'
import BushingTertC2 from './components/BushingTertC2/index.vue'
import InsulationResistanceYokeCore from './components/InsulationResistanceYokeCore'
import ShortCircuitImpedancePrim from './components/ShortCircuitImpedancePrim/index.vue'
import ShortCircuitImpedanceSec from './components/ShortCircuitImpedanceSec/index.vue'
import ShortCircuitImpedanceTert from './components/ShortCircuitImpedanceTert'
import GasChromatography from './components/GasChromatography/index.vue'

// import ShortPrimSec from './components/ShortPrimSec'
// import ShortSecTert from './components/ShortSecTert'
// import ShortPrimTert from './components/ShortPrimTert'
import Dga from './components/Dga'
// import DielectricResponseAnalysis from './components/DielectricResponseAnalysis'


import TestSummary from './components/TestSummary/index.vue'
import HealthIndex from './components/HealthIndex/index.vue'
import mixin from './mixin'
import Mixtestcondition from './mixin/Mixtestcondition'
import testInformation from '@/views/Common/testInformation.vue'
import exportData from './components/ExportData'
import TestingEquipment from './components/TestingEquipment'

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
        exportData,
        TestingEquipment

    },
    mixins: [mixin, Mixtestcondition],
    data() {
        return {
            objActiveName: {
                activeName: null
            }
        }
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
    mounted() {},
    methods: {
        updateAttachmentOverView(attachment) {
            this.attachmentData = attachment
        }
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

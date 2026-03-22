<template>
    <div id="job">
        <el-row :gutter="20" style="padding: 0">
            <el-tabs type="card">
                <!-- Overview -->
                <el-tab-pane style="width: 100%;">
                    <span slot="label"><i class="fa-solid fa-book"></i> Overview</span>
                    <overview :data="transformerJobDto.properties" @update-attachment="updateAttachmentOverView"
                        :attachment.sync="transformerJobDto.attachmentData" :locationData="locationData"
                        :assetData="assetData" :productAssetModelData="productAssetModelData"
                        :parentOrganization="parentOrganization"></overview>
                </el-tab-pane>

                <!-- Select test -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Test settings</span>
                    <select-test style="width: 100%;" :data="transformerJobDto.testList"
                        :testTypeListData="testTypeListData" :assetData="assetData"
                        :obj-active-name="objActiveName"></select-test>
                </el-tab-pane>

                <!-- Testing equipment -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Testing equipment</span>
                    <div>
                        <testing-equipment :data="transformerJobDto.testingEquipmentData"
                            :testTypeListData="testTypeListData"></testing-equipment>
                    </div>
                </el-tab-pane>

                <!-- Tests -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-calculator"></i> Test data</span>
                    <div id="tests" style="width: 100%;">
                        <el-tabs v-model="objActiveName.activeName" type="card" class="w-100 h-100">
                            <el-tab-pane v-for="(item, index) in transformerJobDto.testList" :key="index"
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
import TestInformation from '@/views/Common/TestInformation.vue'
import TestingEquipment from './components/TestingEquipment/index.vue'

import DCWindingPrim from './components/DCWindingPrim/index.vue'
import DCWindingSec from './components/DCWindingSec/index.vue'
import DCWindingTert from './components/DCWindingTert/index.vue'
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
import Dga from './components/Dga'


import TestSummary from './components/TestSummary/index.vue'
import HealthIndex from './components/HealthIndex/index.vue'
import exportData from './components/ExportData'

export default {
    name: 'JobViewTransformer',
    components: {
        SelectTest,
        overview,
        DCWindingPrim,
        DCWindingSec,
        DCWindingTert,
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
        Dga,
        GasChromatography,
        InsulationResistanceYokeCore,
        ShortCircuitImpedancePrim,
        ShortCircuitImpedanceSec,
        ShortCircuitImpedanceTert,
        TestSummary,
        HealthIndex,
        TestInformation,
        exportData,
        TestingEquipment

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
            assetData : {},
            locationData : {},
            productAssetModelData: {},

        }
    },
    mounted() { },
    methods: {
        updateAttachmentOverView(attachment) {
            this.attachmentData = attachment
        },
        loadMapForView() {
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

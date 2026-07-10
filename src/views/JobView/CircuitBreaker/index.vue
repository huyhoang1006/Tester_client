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
                                    :testCondition="item.testCondition"
                                    :testAssessment="item.testAssessment"
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
import testInformation from '@/views/Common/TestInformation.vue'
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

<style lang="scss">
.cb-assessment-dialog {
    .el-dialog {
        width: min(900px, 92vw) !important;
        max-width: calc(100vw - 32px);
        border-radius: 6px;
        overflow: hidden;
    }

    .el-dialog__header {
        padding: 12px 16px;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;
    }

    .el-dialog__title {
        color: #606266;
        font-size: 14px;
        font-weight: 600;
    }

    .el-dialog__body {
        max-height: min(68vh, 660px);
        padding: 14px 16px;
        overflow: auto;
    }

    .el-dialog__footer {
        padding: 10px 16px 14px;
        border-top: 1px solid #e4e7ed;
        background: #fff;
    }

    .dialog-footer-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    .dialog-footer {
        position: static !important;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        width: auto !important;
        margin-top: 0 !important;
    }

    .cb-assessment-card {
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        overflow: hidden;
        background: #fff;
    }

    .cb-assessment-card + .cb-assessment-card {
        margin-top: 16px;
    }

    .cb-assessment-card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 48px;
        padding: 14px 16px;
        background: #f5f7fa;
        border-bottom: 1px solid #e4e7ed;
        color: #606266;
        font-size: 14px;
        font-weight: 600;
    }

    .cb-assessment-card-body {
        width: 100%;
        overflow-x: auto;
        padding: 34px 18px;
    }

    .el-radio-group {
        display: inline-flex;
        flex-wrap: wrap;
        gap: 14px;
        margin-bottom: 12px !important;
        padding: 10px 12px;
        background: #f5f7fa;
        border: 1px solid #e4e7ed;
        border-radius: 6px;
    }

    .el-radio {
        margin-right: 0;
        color: #303133;
    }

    .el-radio__label {
        font-size: 12px;
    }

    .table-strip-input-data:not(.test-table) {
        width: max-content !important;
        min-width: 560px;
        margin: 0 0 18px !important;
        border: 1px solid #e4e7ed !important;
        border-collapse: collapse;
        background: #fff;
        color: #303133;
        font-size: 12px !important;
    }

    .table-strip-input-data:not(.test-table) th,
    .table-strip-input-data:not(.test-table) td {
        height: 44px;
        padding: 5px 10px;
        border: 1px solid #e4e7ed !important;
        background: #fff !important;
        vertical-align: middle;
        white-space: nowrap;
    }

    .table-strip-input-data:not(.test-table) th {
        background: #f5f7fa !important;
        color: #606266;
        font-weight: 600;
        text-align: center;
    }

    .table-strip-input-data:not(.test-table) th:first-child,
    .table-strip-input-data:not(.test-table) td:first-child {
        min-width: 170px;
        max-width: 300px;
        color: #303133;
        text-align: left;
        white-space: normal;
    }

    .table-strip-input-data:not(.test-table) .el-input,
    .table-strip-input-data:not(.test-table) .el-select {
        width: 220px;
        min-width: 160px;
    }

    .table-strip-input-data:not(.test-table) .el-input__inner {
        height: 34px;
        line-height: 34px;
        font-size: 12px;
    }

    .table-strip-input-data:not(.test-table) .el-input-group__append {
        min-width: 38px;
        padding: 0 10px;
        color: #606266;
        text-align: center;
    }

    .el-form {
        width: min(100%, 620px);
    }

    .el-form-item {
        margin-bottom: 10px;
    }

    .el-form-item__label {
        color: #303133;
        font-size: 12px;
    }

    .el-form .el-input,
    .el-form .el-select {
        width: 280px;
    }

    .el-alert {
        margin: 0;
    }
}

.motor-current-assessment-dialog {
    .el-dialog {
        width: min(1080px, 92vw) !important;
    }
}

@media (max-width: 640px) {
    .cb-assessment-dialog {
        .el-dialog {
            width: calc(100vw - 24px) !important;
            max-width: calc(100vw - 24px);
        }

        .el-dialog__body {
            padding: 12px;
        }

        .table-strip-input-data:not(.test-table) {
            min-width: 520px;
        }
    }
}
</style>

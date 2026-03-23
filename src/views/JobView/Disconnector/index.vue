<template>
    <div id="job">
        <el-row :gutter="20" style="padding: 0">
            <el-tabs type="card">
                <!-- Overview -->
                <el-tab-pane style="width: 100%;">
                    <span slot="label"><i class="fa-solid fa-book"></i> Overview</span>
                    <overview :data="disconnectorJobDto.properties" @update-attachment="updateAttachmentOverView"
                        :attachment.sync="disconnectorJobDto.attachmentData" :locationData="locationData"
                        :assetData="assetData" :productAssetModelData="productAssetModelData"
                        :parentOrganization="parentOrganization"></overview>
                </el-tab-pane>

                <!-- Select test -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Test settings</span>
                    <select-test style="width: 100%;" :data="disconnectorJobDto.testList"
                        :testTypeListData="testTypeListData" :assetData="assetData"
                        :obj-active-name="objActiveName"></select-test>
                </el-tab-pane>

                <!-- Testing equipment -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Testing equipment</span>
                    <div>
                        <testing-equipment :data="disconnectorJobDto.testingEquipmentData"
                            :testTypeListData="testTypeListData"></testing-equipment>
                    </div>
                </el-tab-pane>

                <!-- Tests -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-calculator"></i> Test data</span>
                    <div id="tests" style="width: 100%;">
                        <el-tabs v-model="objActiveName.activeName" type="card" class="w-100 h-100">
                            <el-tab-pane v-for="(item, index) in disconnectorJobDto.testList" :key="index"
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

import InsulationResistance from './components/InsulationResistance.vue'
import GeneralInspection from './components/GeneralInspection.vue'
import ContactResistance from './components/ContactResistance.vue'
import DcWindingMotor from './components/DcWindingMotor.vue'
import InsulationResMotor from './components/InsulationResMotor.vue'
import OperatingTest from './components/OperatingTest.vue'
import ControlCheck from './components/ControlCheck.vue'


export default {
    name: 'JobViewDisconnector',
    components: {
        overview,
        SelectTest,
        TestInformation,
        TestingEquipment,
        InsulationResistance,
        GeneralInspection,
        ContactResistance,
        DcWindingMotor,
        InsulationResMotor,
        OperatingTest,
        ControlCheck
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
    watch: {
        assetData: {
            handler(newVal) {
            },
            deep: true
        },
        locationData: {
            handler(newVal) {
            },
            deep: true
        },
        productAssetModelData: {
            handler(newVal) {
            },
            deep: true
        }
    },
    mounted() {
    },
    methods: {
        updateAttachmentOverView(attachment) {
            this.disconnectorJobDto.attachmentData = attachment
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

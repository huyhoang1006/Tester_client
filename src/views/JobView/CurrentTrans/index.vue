<template>
    <div id="job">
        <el-row :gutter="20" style="padding: 0">
            <el-tabs type="card" >
                <!-- Overview -->
                <el-tab-pane style="width: 100%;">
                    <span slot="label"><i class="fa-solid fa-book"></i> Overview</span>
                    <overview :data="currentTransformerJobDto.properties" @update-attachment="updateAttachmentOverView" :attachment.sync="currentTransformerJobDto.attachmentData" :locationData="locationData" :assetData="assetData" :productAssetModelData="productAssetModelData" :parentOrganization="parentOrganization"></overview>
                </el-tab-pane>

                <!-- Select test -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Select test</span>
                    <select-test style="width: 100%;"
                        :data="currentTransformerJobDto.testList" 
                        :assetData="assetData"
                        :obj-active-name="objActiveName"
                        :testTypeListData="testTypeListData"
                        ></select-test>
                </el-tab-pane>

                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Testing equipment</span>
                    <div>
                        <testing-equipment :data="currentTransformerJobDto.testingEquipmentData" :testTypeListData="testTypeListData"></testing-equipment>
                    </div>
                </el-tab-pane>

                <!-- Tests -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-calculator"></i> Tests</span>
                    <div id="tests" style="width: 100%;">
                        <el-tabs v-model="objActiveName.activeName" type="card" class="w-100 h-100">
                            <el-tab-pane v-for="(item, index) in currentTransformerJobDto.testList" :key="index" :label="item.name" :name="item.tabId || item.name + index">
                                <test-information
                                :title="item.name"
                                :data="item.testCondition"
                                :assetData="assetData"
                                :attachment="item.testCondition && item.testCondition.attachmentData ? item.testCondition.attachmentData : attachmentArr[index]"
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
import mixin from './mixin'
import Mixtestcondition from './mixin/Mixtestcondition'
import overview from './components/Overview'
import SelectTest from './components/SelectTest'
import testInformation from '@/views/Common/testInformation.vue'
import InsulationResistance from './components/InsulationResistance.vue'
import CTRatio from './components/CTRatio.vue'
import CTExcitation from './components/CTExcitation.vue'
import CTWindingRes from './components/CTWindingRes.vue'
import CTDfcap from './components/CTDfcap.vue'
import GeneralInspection from './components/GeneralInspection.vue'
import testingEquipment from './components/TestingEquipment/index.vue'



export default {
    name: 'JobViewCurrentTrans',
    components: {
        overview,
        SelectTest,
        testInformation,
        InsulationResistance,
        CTDfcap,
        CTRatio,
        CTExcitation,
        CTWindingRes,
        GeneralInspection,
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
            this.currentTransformerJobDto.attachmentData = attachment
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

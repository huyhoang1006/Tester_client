<template>
    <div id="job">
        <el-row :gutter="20" style="padding: 0">
            <el-tabs type="card">
                <!-- Overview -->
                <el-tab-pane style="width: 100%;">
                    <span slot="label"><i class="fa-solid fa-book"></i> Overview</span>
                    <overview :data="bushingJobDto.properties" @update-attachment="updateAttachmentOverView" :attachment.sync="bushingJobDto.attachmentData" :locationData="locationData" :assetData="assetData" :productAssetModelData="productAssetModelData" :parentOrganization="parentOrganization"></overview>
                </el-tab-pane>

                <!-- Select test -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Test settings</span>
                    <select-test style="width: 100%;"
                        :data="bushingJobDto.testList"
                        :testTypeListData="testTypeListData"
                        :assetData="assetData"
                        :obj-active-name="objActiveName"
                        ></select-test>
                </el-tab-pane>

                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Testing equipment</span>
                    <div>
                        <testing-equipment :data="bushingJobDto.testingEquipmentData" :test-list="bushingJobDto.testList"></testing-equipment>
                    </div>
                </el-tab-pane>

                <!-- Tests -->
                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-calculator"></i> Test data</span>
                    <div id="tests" style="width: 100%;">
                        <el-tabs v-model="objActiveName.activeName" type="card" class="w-100 h-100">
                            <el-tab-pane v-for="(item, index) in bushingJobDto.testList" :key="index" :label="item.name" :name="item.name + index">
                                <test-information
                                    :title="item.name"
                                    :data="item.testCondition"
                                    :assetData="assetData"
                                    :attachment="item.testCondition.attachmentData"
                                    :show-compare.sync="compareOpen[item.testTypeCode + index]"
                                    :compare-test-code="compareEnabled(item.testTypeCode) ? item.testTypeCode : ''"
                                    :compare-current-table="item.data.table"
                                    :compare-columns="compareColumnsOf(item.testTypeCode)"
                                    compare-asset-kind="Bushing"
                                    :compare-asset-mrid="bushingJobDto.properties.asset_id"
                                    :compare-exclude-work-mrid="bushingJobDto.properties.mrid">
                                </test-information>
                                <component
                                    :is="item.testTypeCode" 
                                    :data="item.data" 
                                    :asset="assetData"
                                    :testCondition="item.testCondition"
                                    :testAssessment="item.testAssessment"
                                    :compare-open="!!compareOpen[item.testTypeCode + index]"
                                    @toggle-compare="toggleCompare(item.testTypeCode + index)">
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
import compareTestMap from '@/config/test-definitions/Bushing'
import testingEquipment from './components/TestingEquipment/index.vue'

export default {
    name: 'JobViewBushing',
    components: {
        overview,
        SelectTest,
        testInformation,
        testingEquipment,
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
            // Trạng thái mở/đóng bảng so sánh, tách theo từng tab test.
            // Phải để ở đây vì nút nằm trong component test còn bảng nằm trong
            // test-information — hai component anh em, không tự nói chuyện được.
            compareOpen: {},
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
        // ── So sánh với lần test trước ──────────────────────────────────
        // Bật cho mọi bài test có định nghĩa cột trong test-definitions.
        compareEnabled(testTypeCode) {
            return !!compareTestMap[testTypeCode]
        },
        compareColumnsOf(testTypeCode) {
            const definition = compareTestMap[testTypeCode]
            return (definition && definition.columns) || []
        },
        toggleCompare(key) {
            this.$set(this.compareOpen, key, !this.compareOpen[key])
        },
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

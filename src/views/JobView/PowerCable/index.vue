<template>
    <div id="job">
        <el-row :gutter="20"  style="padding: 0">
            <el-tabs  type="card">
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

                <el-tab-pane>
                    <span slot="label"><i class="fa-solid fa-list-check"></i> Testing equipment</span>
                    <div>
                        <testingEquipment></testingEquipment>
                    </div>
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
import mixin from './mixin'
import Mixtestcondition from './mixin/Mixtestcondition'
import overview from './components/Overview'
import SelectTest from './components/SelectTest'
import testInformation from '@/views/Common/testInformation.vue'
import testingEquipment from './components/TestingEquipment/index.vue'
import InsulationResistance from './components/InsulationResistance.vue'
import DcVoltageOverSheath from './components/DcVoltageOverSheath.vue'
import AcVoltageInsulation from './components/AcVoltageInsulation.vue'
import DcVoltageInsulation from './components/DcVoltageInsulation.vue'
import VlfTest from './components/VlfTest.vue'
import TandeltaVlfSource from './components/TandeltaVlfSource.vue'
import TandeltaPowerAcSource from './components/TandeltaPowerAcSource.vue'
import ParticalDischarge from './components/ParticalDischarge.vue'
import GeneralInspection from './components/GeneralInspection.vue'

export default {
    name: 'JobViewPowerCable',
    components: {
        overview,
        SelectTest,
        testInformation,
        testingEquipment,
        InsulationResistance,
        DcVoltageOverSheath,
        AcVoltageInsulation,
        DcVoltageInsulation,
        VlfTest,
        TandeltaVlfSource,
        TandeltaPowerAcSource,
        ParticalDischarge,
        GeneralInspection
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
    height: 100%;
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
    height: calc(100vh - 150px);
    overflow-y: auto;
    overflow-x: hidden;
}

.el-tabs--border-card {
    border: none;
}
</style>

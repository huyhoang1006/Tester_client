<template>
    <div id="job">
        <el-row id="top-bar">
            <el-col :span="24">
                <el-button @click="backToManage" style="box-sizing: border-box; border-right: 1px solid #aeb6bf">
                    <i class="fa-solid fa-circle-arrow-left display-block fa-2x"></i>
                    <div class="mgt-10">Manage</div>
                </el-button>
                <el-button @click="saveJob">
                    <i class="fa-solid fa-floppy-disk display-block fa-2x"></i>
                    <div class="mgt-10">Save job</div>
                </el-button>
                <el-button @click="$router.go(-1)" style="box-sizing: border-box">
                    <i class="fa-solid fa-ban display-block fa-2x"></i>
                    <div class="mgt-10">Cancel</div>
                </el-button>
                <el-button style="float: right; text-align: right; width: fit-content; cursor: default">
                    <img src="@/assets/images/logo.png" style="max-height: 40px" />
                </el-button>
            </el-col>
        </el-row>
        <el-row :gutter="20" id="main-content" style="padding: 0">
            <el-tabs tab-position="left" type="border-card" class="w-100 h-100">
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
import DcWindingMotor from './components/DcWindingMotor.vue'
import InsulationResistance from './components/InsulationResistance.vue'
import GeneralInspection from './components/GeneralInspection.vue'
import ContactResistance from './components/ContactResistance.vue'
import InsulationResMotor from './components/InsulationResMotor.vue'
import OperatingTest from './components/OperatingTest.vue'
import ControlCheck from './components/ControlCheck.vue'


export default {
    name: 'JobViewDisconnector',
    components: {
        overview,
        SelectTest,
        testInformation,
        DcWindingMotor,
        InsulationResistance,
        GeneralInspection,
        ContactResistance,
        InsulationResMotor,
        OperatingTest,
        ControlCheck
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
    },
}
</script>

<style lang="scss" scoped>
#job {
    width: 100%;
    height: 100%;
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

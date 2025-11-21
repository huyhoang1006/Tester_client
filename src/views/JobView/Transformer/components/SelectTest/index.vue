<template>
    <div id="select-test">
        <el-row :gutter="20">
            <el-col :span="11">
                <table class="mgt-5 w-100 table-strip-input-data">
                    <thead>
                        <tr>
                            <th style="width: 20px;">No</th>
                            <th>Test type</th>
                            <th style="width: 25px;"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in testTypeList" :key="index">
                            <td style="font-weight: bold;">{{ index + 1 }}</td>
                            <td class="ellipsis-cell" style="font-weight: bold;">
                                {{ item.name }}
                            </td>
                            <td style="">
                                <el-button size="mini" type="primary" style="width: 25px; display: flex; align-items: center; justify-content: center;" @click="addTest(item)">
                                    <i class="fas fa-plus"></i>
                                </el-button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </el-col>
            <el-col style="border-left: groove" :span="13">
                <table class="mgt-5 w-100 table-strip-input-data">
                    <thead>
                        <tr>
                            <th style="width: 20px;">No</th>
                            <th style="width: 150px;">Test type</th>
                            <th>Test name</th>
                            <th style="width: 25px;"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in testListData" :key="index">
                            <td style="font-weight: bold;">{{ index + 1 }}</td>
                            <td class="ellipsis-cell">
                                {{ item.testTypeName }}
                            </td>
                            <td>
                                <el-input size="mini" type="text" v-model="item.name"></el-input>
                            </td>
                            <td>
                                <el-button size="mini" type="danger" style="width: 25px; display: flex; align-items: center; justify-content: center;" @click="deleteTest(index)">
                                    <i class="fas fa-trash"></i>
                                </el-button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </el-col>
        </el-row>
    </div>
</template>

<script>
/* eslint-disable */
import mixin from './mixin'
import Mixtestcondition from '../../mixin/Mixtestcondition'
import loader from "@/utils/preload"
import { mapState } from 'vuex'
import { UnitMultiplier } from '@/views/Enum/UnitMultiplier'
import { UnitSymbol } from '@/views/Enum/UnitSymbol'
import Attachment from '@/views/Entity/Attachment'

export default {
    mixins: [mixin, Mixtestcondition],
    props: {
        // mode: {
        //     type: String,
        //     require: true,
        //     default() {
        //         return 'add'
        //     }
        // },
        // attachmentArr: {
        //     type: Array,
        //     required: true,
        //     default() {
        //         return []
        //     } 
        // },
        // testconditionArr: {
        //     type: Array,
        //     required: true,
        //     default() {
        //         return []
        //     } 
        // },
        data: {
            type: Array,
            required: true,
            default() {
                return []
            }
        },
        // bushings : {
        //     type: Object,
        //     require: true,
        // },
        tapChangers: {
            type: Object,
            required: false,
            default() {
                return {
                    id: null,
                    mode: null,
                    serial_no: null,
                    manufacturer: null,
                    manufacturer_type: null,
                    winding: null,
                    tap_scheme: null,
                    no_of_taps: null,
                    voltage_table: []
                }
            }
        },
        assetData: {
            type: Object,
            default() {
                return {}
            }
        },
        objActiveName: {
            type: Object,
            required: false,
            default() {
                return {
                    activeName: null
                }
            }
        },
        testTypeListData: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            testTypeListDefault: [],
            unitMultiplier: UnitMultiplier,
            unitSymbol: UnitSymbol,
        }
    },
    mounted() {},
    computed: {

        ...mapState(['selectedLocation', 'selectedAsset']),
        testListData: function () {
            return this.data
        },
        objActiveNameData: function () {
            return this.objActiveName
        },
        // attachmentArray : function() {
        //     return this.attachmentArr
        // },
        // testconditionArray : function() {
        //     return this.testconditionArr
        // },
        testTypeList: function () {
            return this.testTypeListData.length > 0 ? this.testTypeListData : this.testTypeListDefault
        }
    },
    methods: {
        async countTest(testTypeId) {
            let count = 0
            this.testListData.forEach((element) => {
                if (element.testTypeId === testTypeId) count++
            })
            return count
        },
        async addTest(testType) {
            const count = await this.countTest(testType.mrid)
            const initData = await this.initTest(testType.code, this.assetData)
            const name = count == 0 ? testType.name : `${testType.name} (${count})`
            const testCondition = {
                mrid : '',
                condition: {
                    top_oil_temperature: {
                        mrid: '',
                        value: "",
                        unit: this.unitSymbol.degC
                    },
                    bottom_oil_temperature: {
                        mrid: '',
                        value: "",
                        unit: this.unitSymbol.degC
                    },
                    winding_temperature: {
                        mrid: '',
                        value: "",
                        unit: this.unitSymbol.degC
                    },
                    reference_temperature: {
                        mrid: '',
                        value: "",
                        unit: this.unitSymbol.degC
                    },
                    ambient_temperature: {
                        mrid: '',
                        value: "",
                        unit: this.unitSymbol.degC
                    },
                    humidity: {
                        mrid: '',
                        value: "",
                        unit: this.unitSymbol.percent
                    },
                    weather: ""
                },
                comment: "",
                attachment : new Attachment(),
                attachmentData : []
            }
            const tabId = this.$uuid.newUuid()
            this.testListData.push({
                mrid: this.$uuid.EMPTY,
                testTypeId: testType.mrid,
                testTypeCode: testType.code,
                testTypeName: testType.name,
                name,
                tabId: tabId,
                data: initData,
                testCondition : testCondition,
                worst_score: null,
                worst_score_df: null,
                worst_score_c: null,
                average_score: null,
                average_score_df: null,
                average_score_c: null,
                weighting_factor: null,
                total_average_score: null,
                total_worst_score: null,
                created_on: new Date().getTime()
            })
            // Push testCondition và attachment vào arrays để component có thể render
            // Access through $parent to ensure we're using the same arrays as parent component
            if (this.$parent && this.$parent.testconditionArr) {
                this.$parent.testconditionArr.push(testCondition)
            } else if (this.testconditionArr) {
                this.testconditionArr.push(testCondition)
            }
            if (this.$parent && this.$parent.attachmentArr) {
                this.$parent.attachmentArr.push([])
            } else if (this.attachmentArr) {
                this.attachmentArr.push([])
            }
            console.log(this.testListData)
        },
        deleteTest(index) {
            /* eslint-disable */
            this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    this.testListData.splice(index, 1)
                    // Remove corresponding testCondition and attachment
                    if (this.$parent && this.$parent.testconditionArr) {
                        this.$parent.testconditionArr.splice(index, 1)
                    } else if (this.testconditionArr) {
                        this.testconditionArr.splice(index, 1)
                    }
                    if (this.$parent && this.$parent.attachmentArr) {
                        this.$parent.attachmentArr.splice(index, 1)
                    } else if (this.attachmentArr) {
                        this.attachmentArr.splice(index, 1)
                    }
                })
                .catch(() => {})
        }
    }
}
</script>

<style lang="scss" scoped>
#select-test {
    overflow-y: auto;
    overflow-x: hidden;
}
td, th {
    font-size: 12px;
}

.ellipsis-cell {
  font-weight: bold;
  max-width: 150px; /* hoặc theo <th> */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>

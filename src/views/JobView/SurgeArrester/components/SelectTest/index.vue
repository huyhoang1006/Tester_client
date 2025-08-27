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
import Attachment from '@/views/Entity/Attachment'
import { UnitMultiplier } from '@/views/Enum/UnitMultiplier'
import { UnitSymbol } from '@/views/Enum/UnitSymbol'
import mixin from './mixin'
import { mapState } from 'vuex'

export default {
    mixins: [mixin],
    props: {
        data: {
            type: Array,
            default() {
                return []
            }
        },
        assetData: {
            type: Object,
            default() {
                return {}
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
            const tabId = this.$uuid.newUuid()
            const name = count == 0 ? testType.name : `${testType.name} (${count})`
            this.testListData.push({
                mrid: this.$uuid.EMPTY,
                testTypeId: testType.mrid,
                testTypeCode: testType.code,
                testTypeName: testType.name,
                name,
                data: initData,
                testCondition : {
                    observationId : '',
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
                },
                tabId,
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
                })
                .catch(() => {})
        }
    }
}
</script>

<style lang="scss" scoped>
#select-test {
    width: calc(100vw - 145px);
    height: calc(100vh - 150px);
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

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
                        <!-- changed: iterate available test types, not selected tests -->
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
                                {{ item.name }}
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
import Attachment from '@/views/Flatten/Attachment'
import { UnitMultiplier } from '@/views/Enum/UnitMultiplier'
import { UnitSymbol } from '@/views/Enum/UnitSymbol'
import mixin from './mixin'
import { mapState } from 'vuex'

export default {
    mixins: [mixin],
    props: {
        mode: {
            type: String,
            require: true,
            default() {
                return 'add'
            }
        },
        attachmentArr: {
            type: Array,
            required: true,
            default() {
                return []
            } 
        },
        testconditionArr: {
            type: Array,
            required: true,
            default() {
                return []
            } 
        },
        data: {
            type: Array,
            required: true,
            default() {
                return []
            }
        },
        tapChangers: {
            type: Object,
            require: true,
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
        asset: {
            type: Object,
            require: true,
            default() {
                return {
                    id: '',
                    asset: '',
                    asset_type: '',
                    serial_number: '',
                    manufacturer: ''
                }
            }
        },
        objActiveName: {
            type: Object,
            require: true,
            default() {
                return {
                    activeName: null
                }
            }
        },
        testTypeListData: {
            type: Array,
            required: false,
            default() { return [] }
        },
    },
    data() {
        return {
            testTypeList: [], // <-- ensure available types stored here
            unitMultiplier: UnitMultiplier,
            unitSymbol: UnitSymbol,
        }
    },
    mounted() {
        // initialize available test types from prop (or fetch)
        if (this.testTypeListData && this.testTypeListData.length > 0) {
            this.testTypeList = this.testTypeListData
        } else {
            // optional: fetch from preload if prop not provided
            this.getTestTypes().then(() => {}).catch(()=>{})
        }
    },
    watch: {
        // keep local list in sync if parent updates prop
        testTypeListData(newVal) {
            this.testTypeList = newVal || []
        }
    },
    computed: {
        ...mapState(['selectedLocation', 'selectedAsset']),
        testListData: function () {
            return this.data
        },
        objActiveNameData: function () {
            return this.objActiveName
        },
        attachmentArray : function() {
            return this.attachmentArr
        },
        testconditionArray : function() {
            return this.testconditionArr
        }
    },
   methods: {
        async getTestTypes() {
            const rs = await window.electronAPI.getTestPowerCableTypes()
            if (rs.success) {
                const data = rs.data
                this.testTypeList = data
            } else {
                this.$message.error(rs.message)
            }
        },
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
            const name = count == 0 ? testType.name : `${testType.name} (${count + 1})`
            this.testListData.push({
                mrid: this.$uuid.EMPTY,
                testTypeId: testType.mrid,
                testTypeCode: testType.code,
                testTypeName: testType.name,
                name,
                data: initData,
                testCondition: {
                    mrid: '',
                    condition: {
                        top_oil_temperature: {
                            mrid: '',
                            value: '',
                            unit: ''
                        },
                        bottom_oil_temperature: {
                            mrid: '',
                            value: '',
                            unit: ''
                        },
                        winding_temperature: {
                            mrid: '',
                            value: '',
                            unit: ''
                        },
                        reference_temperature: {
                            mrid: '',
                            value: '',
                            unit: ''
                        },
                        ambient_temperature: {
                            mrid: '',
                            value: '',
                            unit: ''
                        },
                        humidity: {
                            mrid: '',
                            value: '',
                            unit: ''
                        }
                    },
                    equipment: [{
                        model: "",
                        serial_no: "",
                        calibration_date: ""
                    }],
                    comment: "",
                    attachment: {
                        id: '',
                        name: '',
                        path: '',
                        type: 'test',
                        id_foreign: ''
                    },
                    attachmentData: []
                }
            })
            this.attachmentArray.push([])
            this.testconditionArray.push({
                condition: { 
                    top_oil_temperature: "",
                    bottom_oil_temperature: "",
                    winding_temperature: "",
                    reference_temperature: "",
                    ambient_temperature: "",
                    humidity: "",
                    weather: ""
                },
                equipment: [{
                    model: "",
                    serial_no: "",
                    calibration_date: ""
                }],
                comment: "",
            })
            if (this.testListData.length == 1) {
                this.objActiveNameData.activeName = name + '0'
            }
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

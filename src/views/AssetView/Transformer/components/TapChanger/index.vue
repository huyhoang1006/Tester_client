<template>
    <div id="tap-changers" class="mgy-5">
        <el-row :gutter="20" class="content" style="margin-top: 30px;">
            <!-- oltc -->
            <el-col :span="12" class="col-content">
                <el-row style="margin-bottom: 20px;">
                    <el-radio v-model="tapChangersData.mode" label="oltc" @change="onChangeTapChanger">OLTC</el-radio>
                </el-row>
                <el-row v-if="tapChangersData.mode === 'oltc'">
                    <el-col :span="24">
                        <el-row :gutter="20" class="content">
                            <el-col :span="24" class="col-content">
                                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                                    <el-form-item label="Serial no.">
                                        <el-input v-model="tapChangersData.serial_no"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Manufacturer">
                                        <el-input v-model="tapChangersData.manufacturer"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Manufacturer type">
                                        <el-input v-model="tapChangersData.manufacturer_type"></el-input>
                                    </el-form-item>
                                </el-form>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20" class="content mgt-10">
                            <el-col :span="24" class="col-content">
                                <span class="bolder">Tap changers configuration</span>
                                <el-divider></el-divider>
                                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                                    <el-form-item label="Winding">
                                        <el-select :disabled="!tapChangersData.mode" v-model="tapChangersData.winding" @change="onChangeWinding" class="w-100">
                                            <el-option label="Prim" value="Prim"> </el-option>
                                            <el-option label="Sec" value="Sec"> </el-option>
                                            <el-option label="Tert" value="Tert" v-if="properties.asset_type === $constant.THREE_WINDING"> </el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="Tap scheme">
                                        <el-select
                                            :disabled="!tapChangersData.winding"
                                            v-model="tapChangersData.tap_scheme"
                                            @change="onChangeTapScheme"
                                            class="w-100">
                                            <el-option label="1...33" value="1...33"> </el-option>
                                            <el-option label="33...1" value="33...1"> </el-option>
                                            <el-option label="Free" value="Free"> </el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="No. of taps">
                                        <el-input
                                            type="number"
                                            v-model.number="tapChangersData.no_of_taps"
                                            :disabled="!tapChangersData.tap_scheme"
                                            @keyup.enter.native="onEnterNoTapReset()">
                                        </el-input>
                                    </el-form-item>
                                </el-form>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20" class="content mgt-10">
                            <el-col :span="24" class="col-content">
                                <span class="bolder">Voltage table</span>
                                <el-divider></el-divider>
                                <el-row :gutter="20">
                                    <el-col :span="6">
                                        <el-button
                                            :disabled="!tapChangersData.tap_scheme"
                                            size="mini"
                                            type="primary"
                                            class="btn-action"
                                            @click="openDialog = true">
                                            <i class="fas fa-calculator"></i>
                                            Calculate
                                        </el-button>
                                    </el-col>
                                    <el-col :span="6">
                                        <div><br/></div>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-button
                                            size="mini"
                                            type="primary"
                                            class="btn-action"
                                            :disabled="!tapChangersData.tap_scheme"
                                            @click="removeAllVoltageTable">
                                            <i class="fas fa-xmark"></i>
                                            Remove all
                                        </el-button>
                                    </el-col>
                                </el-row>

                                <table class="w-100 mgt-5 table-strip-input-data">
                                    <thead>
                                        <tr>
                                            <th>Tap</th>
                                            <th>Voltage</th>
                                            <th class="action-col"></th>
                                            <th class="action-col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, index) in tapChangersData.voltage_table" :key="index">
                                            <td>
                                                <el-input size="mini" type="text" v-model="item.tap"></el-input>
                                            </td>
                                            <td>
                                                <el-input size="mini" type="number" v-model="item.voltage">
                                                    <template slot="append">V</template>
                                                </el-input>
                                            </td>
                                            <td>
                                                <el-button size="mini" type="primary" class="w-100" @click="addVoltage(index)">
                                                    <i class="fa-solid fa-plus"></i>
                                                </el-button>
                                            </td>
                                            <td>
                                                <el-button size="mini" type="danger" class="w-100" @click="deleteVoltageTable(index)">
                                                    <i class="fas fa-trash"></i
                                                ></el-button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </el-col>

            <!-- detc -->
            <el-col :span="12" class="col-content">
                <el-row style="margin-bottom: 20px;">
                    <el-radio v-model="tapChangersData.mode" label="detc" @change="onChangeTapChanger">DETC</el-radio>
                </el-row>
                <el-row v-if="tapChangersData.mode === 'detc'">
                    <el-col :span="24">
                        <el-row :gutter="20" class="content">
                            <el-col :span="24" class="col-content">
                                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                                    <el-form-item label="Serial no.">
                                        <el-input v-model="tapChangersData.serial_no"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Manufacturer">
                                        <el-input v-model="tapChangersData.manufacturer"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Manufacturer type">
                                        <el-input v-model="tapChangersData.manufacturer_type"></el-input>
                                    </el-form-item>
                                </el-form>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20" class="content mgt-10">
                            <el-col :span="24" class="col-content">
                                <span class="bolder">Tap changers configuration</span>
                                <el-divider></el-divider>
                                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                                    <el-form-item label="Winding">
                                        <el-select :disabled="!tapChangersData.mode" v-model="tapChangersData.winding" @change="onChangeWinding" class="w-100">
                                            <el-option label="Prim" value="Prim"> </el-option>
                                            <el-option label="Sec" value="Sec"> </el-option>
                                            <el-option label="Tert" value="Tert" v-if="properties.asset_type === $constant.THREE_WINDING"> </el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="Tap scheme">
                                        <el-select
                                            :disabled="!tapChangersData.winding"
                                            v-model="tapChangersData.tap_scheme"
                                            @change="onChangeTapScheme"
                                            class="w-100">
                                            <el-option label="1...N" value="1...N"> </el-option>
                                            <el-option label="N...1" value="N...1"> </el-option>
                                            <el-option label="Free" value="Free"> </el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="No. of taps">
                                        <el-input
                                            type="number"
                                            v-model.number="tapChangersData.no_of_taps"
                                            :disabled="!tapChangersData.tap_scheme"
                                            @keyup.enter.native="onEnterNoTapReset()">
                                        </el-input>
                                    </el-form-item>
                                </el-form>
                            </el-col>
                        </el-row>
                        <el-row :gutter="20" class="content mgt-10">
                            <el-col :span="24" class="col-content">
                                <span class="bolder">Voltage table</span>
                                <el-divider></el-divider>
                                <el-row :gutter="20">
                                    <el-col :span="6">
                                        <el-button
                                            :disabled="!tapChangersData.tap_scheme"
                                            size="mini"
                                            type="primary"
                                            class="btn-action"
                                            @click="openDialog = true">
                                            <i class="fas fa-calculator"></i>
                                            Calculate
                                        </el-button>
                                    </el-col>
                                    <el-col :span="6">
                                       <div>
                                            <br/>
                                       </div>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-button
                                            size="mini"
                                            type="primary"
                                            class="btn-action"
                                            :disabled="!tapChangersData.tap_scheme"
                                            @click="removeAllVoltageTable">
                                            <i class="fas fa-xmark"></i>
                                            Remove all
                                        </el-button>
                                    </el-col>
                                </el-row>

                                <table class="w-100 mgt-5 table-strip-input-data">
                                    <thead>
                                        <tr>
                                            <th>Tap</th>
                                            <th>Voltage</th>
                                            <th class="action-col"></th>
                                            <th class="action-col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, index) in tapChangersData.voltage_table" :key="index">
                                            <td>
                                                <el-input size="mini" type="text" v-model="item.tap"></el-input>
                                            </td>
                                            <td>
                                                <el-input size="mini" type="text" v-model="item.voltage">
                                                    <template slot="append">V</template>
                                                </el-input>
                                            </td>
                                            <td>
                                                <el-button size="mini" type="primary" class="w-100" @click="addVoltage(index)">
                                                    <i class="fa-solid fa-plus"></i>
                                                </el-button>
                                            </td>
                                            <td>
                                                <el-button size="mini" type="danger" class="w-100" @click="deleteVoltageTable(index)">
                                                    <i class="fas fa-trash"></i
                                                ></el-button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>

        <calculate-tapchanger
            v-if="tapChangersData.voltage_table.length !== 0"
            :openDialog="openDialog"
            :tapVoltable="tapChangersData.voltage_table"
            :tapScheme="tapChangersData.tap_scheme"
            :numberOfTaps="tapChangersData.no_of_taps.toString()"
            @cancel-dialog="onCancelDialog"
            @calculate-dialog="onCalculateDialog"
            @calculate-result="calculateResult">
        </calculate-tapchanger>
    </div>
</template>

<script>
import CalculateTapchanger from './CalculateTapchanger/index.vue'

export default {
    name: 'TapChanger',
    components: {
        CalculateTapchanger
    },
    props: {
        data: {
            type: Object,
            required: true,
            default() {
                return {
                    id: '',
                    mode: '',
                    serial_no: '',
                    manufacturer: '',
                    manufacturer_type: '',
                    winding: '',
                    tap_scheme: '',
                    no_of_taps: '0',
                    voltage_table: []
                }
            }
        },
        properties: {
            type: Object,
            required: true,
            default() {
                return {
                    id: '',
                    asset: 'Transformer',
                    asset_type: 'Two-winding',
                    serial_no: '',
                    manufacturer: '',
                    manufacturer_type: '',
                    manufacturing_year: '',
                    asset_system_code: '',
                    apparatus_id: '',
                    feeder: '',
                    date_of_warehouse_receipt: '',
                    date_of_delivery: '',
                    date_of_production_order: '',
                    comment: ''
                }
            }
        }
    },
    data() {
        return {
            labelWidth: `${200}px`,
            openDialog: false
        }
    },
    computed: {
        tapChangersData: function () {
            return this.data
        }
    },
    /* eslint-disable */
    watch : {
        'tapChangersData.no_of_taps' : {
            handler: function (newVal) {
                if(newVal > 121) {
                    this.$message.error("Invalid")
                } else {
                    this.onEnterNoTap()
                }
            }
        }
    },
    async beforeMount() {},
    mounted() {},
    methods: {
        onChangeWinding() {
            this.tapChangersData.tap_scheme = ''
            this.tapChangersData.no_of_taps = '0'
        },
        onChangeTapScheme() {
            this.tapChangersData.no_of_taps = '0'
        },
        onEnterNoTap() {
            if(this.tapChangersData.voltage_table.length == 0)
                if (this.tapChangersData.tap_scheme === '1...33' || this.tapChangersData.tap_scheme === '1...N' || this.tapChangersData.tap_scheme === 'Free') {
                    for (let i = 1; i <= this.tapChangersData.no_of_taps; i++) {
                        const id = this.$uuid.newUuid()
                        this.tapChangersData.voltage_table.push({
                            id,
                            tap: i,
                            voltage: 0
                        })
                    }
                } else {
                    for (let i = this.tapChangersData.no_of_taps; i >= 1; i--) {
                        const id = this.$uuid.newUuid()
                        this.tapChangersData.voltage_table.push({
                            id,
                            tap: i,
                            voltage: 0
                        })
                    }
                }
            else {
                if(this.tapChangersData.voltage_table.length > this.tapChangersData.no_of_taps) {
                    this.tapChangersData.voltage_table.splice(this.tapChangersData.no_of_taps, this.tapChangersData.voltage_table.length - this.tapChangersData.no_of_taps)
                } else {
                    if(this.tapChangersData.tap_scheme === '1...33' || this.tapChangersData.tap_scheme === '1...N' || this.tapChangersData.tap_scheme === 'Free') {
                        for(let i= this.tapChangersData.voltage_table.length + 1; i <= this.tapChangersData.no_of_taps; i ++) {
                            const id = this.$uuid.newUuid()
                            this.tapChangersData.voltage_table.push({
                                id,
                                tap: i,
                                voltage: 0
                            })
                        }
                    } else {
                        for(let i= this.tapChangersData.voltage_table.length; i < this.tapChangersData.no_of_taps; i ++) {
                            const id = this.$uuid.newUuid()
                            this.tapChangersData.voltage_table.push({
                                id,
                                tap: this.tapChangersData.no_of_taps - i,
                                voltage: 0
                            })
                        }
                        for(let i= 0; i < this.tapChangersData.no_of_taps; i ++) {
                            this.tapChangersData.voltage_table[i].tap = this.tapChangersData.no_of_taps - i
                        }
                    }
                }
            }
        },
        onEnterNoTapReset() {
            this.tapChangersData.voltage_table = []
            if (this.tapChangersData.tap_scheme === '1...33' || this.tapChangersData.tap_scheme === '1...N' || this.tapChangersData.tap_scheme === 'Free') {
                for (let i = 1; i <= this.tapChangersData.no_of_taps; i++) {
                    const id = this.$uuid.newUuid()
                    this.tapChangersData.voltage_table.push({
                        id,
                        tap: i,
                        voltage: 0
                    })
                }
            } else {
                for (let i = this.tapChangersData.no_of_taps; i >= 1; i--) {
                    const id = this.$uuid.newUuid()
                    this.tapChangersData.voltage_table.push({
                        id,
                        tap: i,
                        voltage: 0
                    })
                }
            }
        },
        onChangeTapChanger() {
            this.tapChangersData.serial_no = ''
            this.tapChangersData.manufacturer = ''
            this.tapChangersData.manufacturer_type = ''
            this.tapChangersData.winding = ''
            this.tapChangersData.tap_scheme = ''
            this.tapChangersData.no_of_taps = '0'
            this.tapChangersData.voltage_table = []
        },
        async addVoltageTable() {
            const id = this.$uuid.newUuid()

            await this.tapChangersData.voltage_table.push({
                id,
                tap: '',
                voltage: ''
            })
            this.tapChangersData.no_of_taps++
        },
        removeAllVoltageTable() {
            this.tapChangersData.voltage_table = []
            this.tapChangersData.no_of_taps = 0
        },
        deleteVoltageTable(index) {
            this.tapChangersData.voltage_table.splice(index, 1)
            this.tapChangersData.no_of_taps--
        },
        addVoltage(index) {
            const id = this.$uuid.newUuid()
            const row = {
                id,
                tap: '',
                voltage: ''
            }
            this.tapChangersData.voltage_table.splice(index+1, 0, row)
            this.tapChangersData.no_of_taps++
        },
        onCancelDialog() {
            this.openDialog = false
        },
        onCalculateDialog() {
            this.openDialog = false
        },
        calculateResult(data) {
            for (let i = 0; i < this.tapChangersData.no_of_taps; i++) {
                this.tapChangersData.voltage_table[i].voltage = data[i]
            }
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep(.el-radio__label) {
    font-size: 12px !important;
}
</style>
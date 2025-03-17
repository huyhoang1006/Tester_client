<template>
    <div id="impedances" class="mgy-5">
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer" @click="openImpedances = !openImpedances">
                    <i v-if="openImpedances" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Impedances
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openImpedances">
            <!-- ref temp -->
            <el-row :gutter="20" class="content">
                <el-col :span="8" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Ref. temp">
                            <el-input v-model="impedancesData.ref_temp">
                                <template slot="append">°C</template>
                            </el-input>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>

            <!-- prim-sec -->
            <el-row :gutter="20" class="content mgt-10">
                <el-col :span="16" class="col-content">
                    <span class="bolder">Short-circuit impedance Prim-Sec</span>
                    <el-divider></el-divider>
                    <el-row :gutter="20">
                        <el-col :span="24">
                            <el-button size="mini" type="primary" plain class="btn-action" @click="addPrimSec"> <i class="fas fa-plus"></i> Add </el-button>
                            <el-button size="mini" type="primary" plain class="btn-action" @click="removeAllPrimSec">
                                <i class="fas fa-xmark"></i>
                                Remove all
                            </el-button>
                        </el-col>
                    </el-row>
                    <table class="mgt-5 table-strip-input-data" style="width: 1500px">
                        <thead>
                            <tr>
                                <th>Short-circuit impedance uk</th>
                                <th>Base power</th>
                                <th>Base voltage</th>
                                <th>Load losses pk</th>
                                <th>OLTC position</th>
                                <th>DETC position</th>
                                <th class="action-col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in impedancesData.prim_sec" :key="index">
                                <td>
                                    <el-input size="mini" v-model="item.short_circuit_impedances_uk">
                                        <template slot="append">%</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.base_power.value">
                                        <el-select size="mini" class="select-in-input" v-model="item.base_power.unit" slot="append">
                                            <el-option label="MVA" value="MVA"></el-option>
                                            <el-option label="kVA" value="kVA"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.base_voltage.value">
                                        <el-select size="mini" class="select-in-input" v-model="item.base_voltage.unit" slot="append">
                                            <el-option label="kV" value="kV"></el-option>
                                            <el-option label="V" value="V"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.load_losses_pk">
                                        <template slot="append">W</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-select size="mini" v-model="item.oltc_position" v-if="tapChangers.mode === 'oltc'">
                                        <el-option
                                            v-for="(_item, _index) in tapChangers.voltage_table"
                                            :key="_index"
                                            :label="_item.tap"
                                            :value="_item.tap"></el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-select size="mini" v-model="item.detc_position" v-if="tapChangers.mode === 'detc'">
                                        <el-option
                                            v-for="(_item, _index) in tapChangers.voltage_table"
                                            :key="_index"
                                            :label="_item.tap"
                                            :value="_item.tap"></el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-button size="mini" type="danger" class="w-100" @click="deletePrimSec(index)">
                                        <i class="fas fa-trash"></i>
                                    </el-button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
            </el-row>

            <!-- prim-tert -->
            <el-row :gutter="20" class="content mgt-10" v-if="properties.asset_type === $constant.THREE_WINDING || properties.asset_type === $constant.WITH_TERT">
                <el-col :span="16" class="col-content">
                    <span class="bolder">Short-circuit impedance Prim-Tert</span>
                    <el-divider></el-divider>
                    <el-row :gutter="20">
                        <el-col :span="24">
                            <el-button size="mini" type="primary" plain class="btn-action" @click="addPrimTert"> <i class="fas fa-plus"></i> Add </el-button>
                            <el-button size="mini" type="primary" plain class="btn-action" @click="removeAllPrimTert">
                                <i class="fas fa-xmark"></i>
                                Remove all
                            </el-button>
                        </el-col>
                    </el-row>
                    <table class="mgt-5 table-strip-input-data" style="width: 1500px">
                        <thead>
                            <tr>
                                <th>Short-circuit impedance uk (%)</th>
                                <th>Base power (%)</th>
                                <th>Base voltage (%)</th>
                                <th>Load losses pk (%)</th>
                                <th>OLTC position (%)</th>
                                <th>DETC position (%)</th>
                                <th class="action-col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in impedancesData.prim_tert" :key="index">
                                <td>
                                    <el-input size="mini" v-model="item.short_circuit_impedances_uk">
                                        <template slot="append">%</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.base_power.value">
                                        <el-select size="mini" class="select-in-input" v-model="item.base_power.unit" slot="append">
                                            <el-option label="MVA" value="MVA"></el-option>
                                            <el-option label="kVA" value="kVA"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.base_voltage.value">
                                        <el-select size="mini" class="select-in-input" v-model="item.base_voltage.unit" slot="append">
                                            <el-option label="kV" value="kV"></el-option>
                                            <el-option label="V" value="V"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.load_losses_pk">
                                        <template slot="append">W</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-select size="mini" v-model="item.oltc_position" v-if="tapChangers.mode === 'oltc'">
                                        <el-option
                                            v-for="(_item, _index) in tapChangers.voltage_table"
                                            :key="_index"
                                            :label="_item.tap"
                                            :value="_item.tap"></el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-select size="mini" v-model="item.detc_position" v-if="tapChangers.mode === 'detc'">
                                        <el-option
                                            v-for="(_item, _index) in tapChangers.voltage_table"
                                            :key="_index"
                                            :label="_item.tap"
                                            :value="_item.tap"></el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-button size="mini" type="danger" class="w-100" @click="impedancesData.prim_tert.splice(index, 1)">
                                        <i class="fas fa-trash"></i>
                                    </el-button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
            </el-row>

            <!-- sec-tert -->
            <el-row :gutter="20" class="content mgt-10" v-if="properties.asset_type === $constant.THREE_WINDING || properties.asset_type === $constant.WITH_TERT">
                <el-col :span="16" class="col-content">
                    <span class="bolder">Short-circuit impedance Sec-Tert</span>
                    <el-divider></el-divider>
                    <el-row :gutter="20">
                        <el-col :span="24">
                            <el-button size="mini" type="primary" plain class="btn-action" @click="addSecTert"> <i class="fas fa-plus"></i> Add </el-button>
                            <el-button size="mini" type="primary" plain class="btn-action" @click="removeAllSecTert">
                                <i class="fas fa-xmark"></i>
                                Remove all
                            </el-button>
                        </el-col>
                    </el-row>
                    <table class="mgt-5 table-strip-input-data" style="width: 1500px">
                        <thead>
                            <tr>
                                <th>Short-circuit impedance uk (%)</th>
                                <th>Base power (%)</th>
                                <th>Base voltage (%)</th>
                                <th>Load losses pk (%)</th>
                                <th>OLTC position (%)</th>
                                <th>DETC position (%)</th>
                                <th class="action-col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in impedancesData.sec_tert" :key="index">
                                <td>
                                    <el-input size="mini" v-model="item.short_circuit_impedances_uk">
                                        <template slot="append">%</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.base_power.value">
                                        <el-select size="mini" class="select-in-input" v-model="item.base_power.unit" slot="append">
                                            <el-option label="MVA" value="MVA"></el-option>
                                            <el-option label="kVA" value="kVA"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.base_voltage.value">
                                        <el-select size="mini" class="select-in-input" v-model="item.base_voltage.unit" slot="append">
                                            <el-option label="kV" value="kV"></el-option>
                                            <el-option label="V" value="V"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.load_losses_pk">
                                        <template slot="append">W</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-select size="mini" v-model="item.oltc_position" v-if="tapChangers.mode === 'oltc'">
                                        <el-option
                                            v-for="(_item, _index) in tapChangers.voltage_table"
                                            :key="_index"
                                            :label="_item.tap"
                                            :value="_item.tap"></el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-select size="mini" v-model="item.detc_position" v-if="tapChangers.mode === 'detc'">
                                        <el-option
                                            v-for="(_item, _index) in tapChangers.voltage_table"
                                            :key="_index"
                                            :label="_item.tap"
                                            :value="_item.tap"></el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-button size="mini" type="danger" class="w-100" @click="impedancesData.sec_tert.splice(index, 1)">
                                        <i class="fas fa-trash"></i>
                                    </el-button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
            </el-row>

            <!-- zero sequence impedances -->
            <el-row :gutter="20" class="content mgt-10">
                <el-col :span="8" class="col-content">
                    <span class="bolder">Zero sequence impedance</span>
                    <el-divider></el-divider>
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Base power">
                            <el-input v-model="impedancesData.zero_sequence_impedance.base_power.value">
                                <el-select size="mini" class="select-in-input" v-model="impedancesData.zero_sequence_impedance.base_power.unit" slot="append">
                                    <el-option label="MVA" value="MVA"></el-option>
                                    <el-option label="kVA" value="kVA"></el-option>
                                </el-select>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Base voltage">
                            <el-input v-model="impedancesData.zero_sequence_impedance.base_voltage.value">
                                <el-select size="mini" class="select-in-input" v-model="impedancesData.zero_sequence_impedance.base_voltage.unit" slot="append">
                                    <el-option label="kV" value="kV"></el-option>
                                    <el-option label="V" value="V"></el-option>
                                </el-select>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Zero sequence Z0(%)">
                            <el-input v-model="impedancesData.zero_sequence_impedance.zero_percent" v-if="properties.asset_type === $constant.TWO_WINDING || properties.asset_type === $constant.THREE_WINDING">
                                <template slot="append">%</template>
                            </el-input>

                            <table class="table-strip-input-data" style="width: 300px" v-if="properties.asset_type === $constant.WITH_TERT || properties.asset_type === $constant.WITHOUT_TERT">
                                <tbody>
                                    <tr>
                                        <td>Prim</td>
                                        <td>
                                            <el-input>
                                                <template slot="append">%</template>
                                            </el-input>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Sec</td>
                                        <td>
                                            <el-input>
                                                <template slot="append">%</template>
                                            </el-input>
                                        </td>
                                    </tr>
                                </tbody> 
                            </table>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Impedance',
    props: {
        data: {
            type: Object,
            required: true,
            default() {
                return {
                    ref_temp: 75,
                    prim_sec: [],
                    prim_tert: [],
                    sec_tert: [],
                    zero_sequence_impedance: {
                        base_power: {
                            value: '',
                            unit: 'MVA'
                        },
                        base_voltage: {
                            value: '',
                            unit: 'kV'
                        },
                        zero_percent: ''
                    }
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
        },
        tapChangers: {
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
        }
    },
    data() {
        return {
            openImpedances: true,
            labelWidth: `${200}px`
        }
    },
    computed: {
        impedancesData: function () {
            return this.data
        }
    },

    mounted() {},
    methods: {
        addPrimSec() {
            this.impedancesData.prim_sec.push({
                short_circuit_impedances_uk: '',
                base_power: {
                    value: '',
                    unit: 'MVA'
                },
                base_voltage: {
                    value: '',
                    unit: 'kV'
                },
                load_losses_pk: '',
                oltc_position: '',
                detc_position: ''
            })
        },
        addPrimTert() {
            this.impedancesData.prim_tert.push({
                short_circuit_impedances_uk: '',
                base_power: {
                    value: '',
                    unit: 'MVA'
                },
                base_voltage: {
                    value: '',
                    unit: 'kV'
                },
                load_losses_pk: '',
                oltc_position: '',
                detc_position: ''
            })
        },
        addSecTert() {
            this.impedancesData.sec_tert.push({
                short_circuit_impedances_uk: '',
                base_power: {
                    value: '',
                    unit: 'MVA'
                },
                base_voltage: {
                    value: '',
                    unit: 'kV'
                },
                load_losses_pk: '',
                oltc_position: '',
                detc_position: ''
            })
        },
        removeAllPrimSec() {
            this.impedancesData.prim_sec = []
        },
        removeAllPrimTert() {
            this.impedancesData.prim_tert = []
        },
        removeAllSecTert() {
            this.impedancesData.sec_tert = []
        },
        deletePrimSec(index) {
            this.impedancesData.prim_sec.splice(index, 1)
        },
        deletePrimTert(index) {
            this.impedancesData.prim_tert.splice(index, 1)
        },
        deleteSecTert(index) {
            this.impedancesData.sec_tert.splice(index, 1)
        }
    }
}
</script>

<style lang="scss" scoped></style>

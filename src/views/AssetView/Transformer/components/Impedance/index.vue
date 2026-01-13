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
                <el-col :xs="24" :sm="16" :md="11" :lg="10" class="col-content ref-temp-col">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left"
                        class="ref-temp-form">
                        <el-form-item label="Ref. temp">
                            <el-input v-model="impedancesData.ref_temp.value">
                                <template slot="append">{{ unitSymbol.degC }}</template>
                            </el-input>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>

            <!-- prim-sec -->
            <el-row :gutter="20" class="content mgt-10">
                <el-col :span="24" class="col-content">
                    <span class="bolder">Short-circuit impedance Prim-Sec</span>
                    <el-divider></el-divider>
                </el-col>
                <el-col :span="24" class="col-content">
                    <el-row :gutter="8">
                        <el-col :xs="24" :md="12">
                            <el-row :gutter="8">
                                <el-col :span="12">
                                    <el-button size="mini" type="primary" class="btn-fluid" @click="addPrimSec">
                                        <i class="fas fa-plus"></i>
                                        Add
                                    </el-button>
                                </el-col>
                                <el-col :span="12">
                                    <el-button size="mini" type="primary" class="btn-fluid" @click="removeAllPrimSec">
                                        <i class="fas fa-xmark"></i>
                                        Remove all
                                    </el-button>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                    <div class="table-scroll mgt-5">
                        <table class="table-strip-input-data fixed-table">
                            <colgroup>
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 40px" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Impedance (uk)</th>
                                    <th>Base power</th>
                                    <th>Base voltage</th>
                                    <th>Load losses (pk)</th>
                                    <th>OLTC position</th>
                                    <th>DETC position</th>
                                    <th class="action-col">
                                        <el-button size="mini" type="danger" class="w-100" @click="removeAllPrimSec">
                                            <i class="fas fa-trash"></i>
                                        </el-button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in impedancesData.prim_sec" :key="index">
                                    <td>
                                        <el-input size="mini" v-model="item.short_circuit_impedances_uk.value">
                                            <template slot="append">{{ unitSymbol.percent }}</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.base_power.data.value">
                                            <el-select size="mini" class="select-in-input"
                                                v-model="item.base_power.data.unit" slot="append">
                                                <el-option :label="unitMultiplier.m + unitSymbol.VA"
                                                    :value="unitMultiplier.m + '|' + unitSymbol.VA"></el-option>
                                                <el-option :label="unitMultiplier.k + unitSymbol.VA"
                                                    :value="unitMultiplier.k + '|' + unitSymbol.VA"></el-option>
                                            </el-select>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.base_voltage.data.value">
                                            <el-select size="mini" class="select-in-input"
                                                v-model="item.base_voltage.data.unit" slot="append">
                                                <el-option :label="unitMultiplier.k + unitSymbol.V"
                                                    :value="unitMultiplier.k + '|' + unitSymbol.V"></el-option>
                                                <el-option :label="unitSymbol.V" :value="unitSymbol.V"></el-option>
                                            </el-select>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.load_losses_pk.value">
                                            <template slot="append">{{ unitSymbol.W }}</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select size="mini" v-model="item.oltc_position"
                                            v-if="tapChangers.mode === 'oltc'">
                                            <el-option v-for="(_item, _index) in tapChangers.voltage_table"
                                                :key="_index" :label="_item.tap" :value="_item.mrid">
                                            </el-option>
                                        </el-select>
                                        <el-select size="mini" v-model="item.oltc_position" v-else>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-select size="mini" v-model="item.detc_position"
                                            v-if="tapChangers.mode === 'detc'">
                                            <el-option v-for="(_item, _index) in tapChangers.voltage_table"
                                                :key="_index" :label="_item.tap" :value="_item.mrid"></el-option>
                                        </el-select>
                                        <el-select size="mini" v-model="item.detc_position" v-else>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-button size="mini" type="danger" class="w-100"
                                            @click="deletePrimSec(index)">
                                            <i class="fas fa-trash"></i>
                                        </el-button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </el-col>
            </el-row>

            <!-- prim-tert -->
            <el-row :gutter="20" class="content mgt-10"
                v-if="properties.type === $constant.THREE_WINDING || properties.type === $constant.WITH_TERT">
                <el-col :span="24" class="col-content">
                    <span class="bolder">Short-circuit impedance Prim-Tert</span>
                    <el-divider></el-divider>
                </el-col>
                <el-col :span="24" class="col-content">
                    <el-row :gutter="8">
                        <el-col :xs="24" :md="12">
                            <el-row :gutter="8">
                                <el-col :span="12">
                                    <el-button size="mini" type="primary" class="btn-fluid" @click="addPrimTert"> <i
                                            class="fas fa-plus"></i>
                                        Add
                                    </el-button>
                                </el-col>
                                <el-col :span="12">
                                    <el-button size="mini" type="primary" class="btn-fluid" @click="removeAllPrimTert">
                                        <i class="fas fa-xmark"></i>
                                        Remove all
                                    </el-button>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                    <div class="table-scroll mgt-5">
                        <table class="table-strip-input-data fixed-table">
                            <colgroup>
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 40px" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Impedance (uk)</th>
                                    <th>Base power</th>
                                    <th>Base voltage</th>
                                    <th>Load losses (pk)</th>
                                    <th>OLTC position</th>
                                    <th>DETC position</th>
                                    <th class="action-col">
                                        <el-button size="mini" type="danger" class="w-100" @click="removeAllPrimTert">
                                            <i class="fas fa-trash"></i>
                                        </el-button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in impedancesData.prim_tert" :key="index">
                                    <td>
                                        <el-input size="mini" v-model="item.short_circuit_impedances_uk.value">
                                            <template slot="append">{{ unitSymbol.percent }}</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.base_power.data.value">
                                            <el-select size="mini" class="select-in-input"
                                                v-model="item.base_power.data.unit" slot="append">
                                                <el-option :label="unitMultiplier.m + unitSymbol.VA"
                                                    :value="unitMultiplier.m + '|' + unitSymbol.VA"></el-option>
                                                <el-option :label="unitMultiplier.k + unitSymbol.VA"
                                                    :value="unitMultiplier.k + '|' + unitSymbol.VA"></el-option>
                                            </el-select>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.base_voltage.data.value">
                                            <el-select size="mini" class="select-in-input"
                                                v-model="item.base_voltage.data.unit" slot="append">
                                                <el-option :label="unitMultiplier.k + unitSymbol.V"
                                                    :value="unitMultiplier.k + '|' + unitSymbol.V"></el-option>
                                                <el-option :label="unitSymbol.V" :value="unitSymbol.V"></el-option>
                                            </el-select>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.load_losses_pk.value">
                                            <template slot="append">{{ unitSymbol.W }}</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select size="mini" v-model="item.oltc_position"
                                            v-if="tapChangers.mode === 'oltc'">
                                            <el-option v-for="(_item, _index) in tapChangers.voltage_table"
                                                :key="_index" :label="_item.tap" :value="_item.mrid"></el-option>
                                        </el-select>
                                        <el-select size="mini" v-model="item.oltc_position" v-else>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-select size="mini" v-model="item.detc_position"
                                            v-if="tapChangers.mode === 'detc'">
                                            <el-option v-for="(_item, _index) in tapChangers.voltage_table"
                                                :key="_index" :label="_item.tap" :value="_item.mrid"></el-option>
                                        </el-select>
                                        <el-select size="mini" v-model="item.detc_position" v-else>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-button size="mini" type="danger" class="w-100"
                                            @click="impedancesData.prim_tert.splice(index, 1)">
                                            <i class="fas fa-trash"></i>
                                        </el-button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </el-col>
            </el-row>

            <!-- sec-tert -->
            <el-row :gutter="20" class="content mgt-10"
                v-if="properties.type === $constant.THREE_WINDING || properties.type === $constant.WITH_TERT">
                <el-col :span="24" class="col-content">
                    <span class="bolder">Short-circuit impedance Sec-Tert</span>
                    <el-divider></el-divider>
                </el-col>
                <el-col :span="24" class="col-content">
                    <el-row :gutter="8">
                        <el-col :xs="24" :md="12">
                            <el-row :gutter="8">
                                <el-col :span="12">
                                    <el-button size="mini" type="primary" class="btn-fluid" @click="addSecTert"> <i
                                            class="fas fa-plus"></i>
                                        Add
                                    </el-button>
                                </el-col>
                                <el-col :span="12">
                                    <el-button size="mini" type="primary" class="btn-fluid" @click="removeAllSecTert">
                                        <i class="fas fa-xmark"></i>
                                        Remove all
                                    </el-button>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                    <div class="table-scroll mgt-5">
                        <table class="table-strip-input-data fixed-table">
                            <colgroup>
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 40px" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th>Impedance (uk)</th>
                                    <th>Base power</th>
                                    <th>Base voltage</th>
                                    <th>Load losses (pk)</th>
                                    <th>OLTC position</th>
                                    <th>DETC position</th>
                                    <th class="action-col">
                                        <el-button size="mini" type="danger" class="w-100" @click="removeAllSecTert">
                                            <i class="fas fa-trash"></i>
                                        </el-button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in impedancesData.sec_tert" :key="index">
                                    <td>
                                        <el-input size="mini" v-model="item.short_circuit_impedances_uk.value">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.base_power.data.value">
                                            <el-select size="mini" class="select-in-input"
                                                v-model="item.base_power.data.unit" slot="append">
                                                <el-option :label="unitMultiplier.m + unitSymbol.VA"
                                                    :value="unitMultiplier.m + '|' + unitSymbol.VA"></el-option>
                                                <el-option :label="unitMultiplier.k + unitSymbol.VA"
                                                    :value="unitMultiplier.k + '|' + unitSymbol.VA"></el-option>
                                            </el-select>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.base_voltage.data.value">
                                            <el-select size="mini" class="select-in-input"
                                                v-model="item.base_voltage.data.unit" slot="append">
                                                <el-option :label="unitMultiplier.k + unitSymbol.V"
                                                    :value="unitMultiplier.k + '|' + unitSymbol.V"></el-option>
                                                <el-option :label="unitSymbol.V" :value="unitSymbol.V"></el-option>
                                            </el-select>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.load_losses_pk.value">
                                            <template slot="append">{{ unitSymbol.W }}</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select size="mini" v-model="item.oltc_position"
                                            v-if="tapChangers.mode === 'oltc'">
                                            <el-option v-for="(_item, _index) in tapChangers.voltage_table"
                                                :key="_index" :label="_item.tap" :value="_item.mrid"></el-option>
                                        </el-select>
                                        <el-select size="mini" v-model="item.oltc_position" v-else>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-select size="mini" v-model="item.detc_position"
                                            v-if="tapChangers.mode === 'detc'">
                                            <el-option v-for="(_item, _index) in tapChangers.voltage_table"
                                                :key="_index" :label="_item.tap" :value="_item.mrid"></el-option>
                                        </el-select>
                                        <el-select size="mini" v-model="item.detc_position" v-else>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-button size="mini" type="danger" class="w-100"
                                            @click="impedancesData.sec_tert.splice(index, 1)">
                                            <i class="fas fa-trash"></i>
                                        </el-button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </el-col>
            </el-row>

            <!-- zero sequence impedances -->
            <el-row :gutter="20" class="content mgt-10">
                <el-col :span="24" class="col-content">
                    <span class="bolder">Zero sequence impedance</span>
                    <el-divider></el-divider>
                </el-col>
                <el-col :xs="24" :sm="16" :md="12">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Base power">
                            <el-input v-model="impedancesData.zero_sequence_impedance.base_power.data.value"
                                class="ref-temp-input">
                                <el-select size="mini" class="select-in-input"
                                    v-model="impedancesData.zero_sequence_impedance.base_power.data.unit" slot="append">
                                    <el-option :label="unitMultiplier.m + unitSymbol.VA"
                                        :value="unitMultiplier.m + '|' + unitSymbol.VA"></el-option>
                                    <el-option :label="unitMultiplier.k + unitSymbol.VA"
                                        :value="unitMultiplier.k + '|' + unitSymbol.VA"></el-option>
                                </el-select>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Base voltage">
                            <el-input v-model="impedancesData.zero_sequence_impedance.base_voltage.data.value"
                                class="ref-temp-input">
                                <el-select size="mini" class="select-in-input"
                                    v-model="impedancesData.zero_sequence_impedance.base_voltage.data.unit"
                                    slot="append">
                                    <el-option :label="unitMultiplier.k + unitSymbol.V"
                                        :value="unitMultiplier.k + '|' + unitSymbol.V"></el-option>
                                    <el-option :label="unitSymbol.V" :value="unitSymbol.V"></el-option>
                                </el-select>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="Zero sequence Z0(%)">
                            <el-input v-model="impedancesData.zero_sequence_impedance.zero_percent.zero.data.value"
                                v-if="properties.type === $constant.TWO_WINDING || properties.type === $constant.THREE_WINDING"
                                class="ref-temp-input">
                                <template slot="append">{{ unitSymbol.percent }}</template>
                            </el-input>

                            <table class="table-strip-input-data" style="width: 300px"
                                v-if="properties.type === $constant.WITH_TERT || properties.type === $constant.WITHOUT_TERT">
                                <tbody>
                                    <tr>
                                        <td style="font-size: 12px;">Prim</td>
                                        <td>
                                            <el-input
                                                v-model="impedancesData.zero_sequence_impedance.zero_percent.prim.data.value">
                                                <template slot="append">{{ unitSymbol.percent }}</template>
                                            </el-input>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 12px;">Sec</td>
                                        <td>
                                            <el-input
                                                v-model="impedancesData.zero_sequence_impedance.zero_percent.sec.data.value">
                                                <template slot="append">{{ unitSymbol.percent }}</template>
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
/* eslint-disable */
import { UnitMultiplier } from '@/views/Enum/UnitMultiplier'
import { UnitSymbol } from '@/views/Enum/UnitSymbol'
import uuid from "@/utils/uuid"
export default {
    name: 'Impedance',
    props: {
        data: {
            type: Object,
            required: true,
            default() {
                return {
                    ref_temp: {
                        value: '',
                        unit: this.unitSymbol.degC
                    },
                    prim_sec: [],
                    prim_tert: [],
                    sec_tert: [],
                    zero_sequence_impedance: {
                        base_power: {
                            mrid: '',
                            data: {
                                mrid: '',
                                value: '',
                                unit: "k|VA"
                            }
                        },
                        base_voltage: {
                            mrid: '',
                            data: {
                                mrid: '',
                                value: '',
                                unit: 'k|V'
                            },
                        },
                        zero_percent: {
                            prim: {
                                mrid: '',
                                data: {
                                    mrid: '',
                                    value: '',
                                    unit: this.unitSymbol.percent
                                }
                            },
                            sec: {
                                mrid: '',
                                data: {
                                    mrid: '',
                                    value: '',
                                    unit: this.unitSymbol.percent
                                }
                            },
                            zero: {
                                mrid: '',
                                data: {
                                    mrid: '',
                                    value: '',
                                    unit: this.unitSymbol.percent
                                }
                            }
                        }
                    }
                }
            }
        },
        properties: {
            type: Object,
            required: true,
            default() {
                return {
                    mrid: '',
                    kind: 'Transformer',
                    type: '',
                    serial_no: '',
                    manufacturer: '',
                    manufacturer_type: '',
                    manufacturing_year: '',
                    country_of_origin: '',
                    apparatus_id: '',
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
            labelWidth: `${150}px`,
            unitMultiplier: UnitMultiplier,
            unitSymbol: UnitSymbol,
        }
    },
    computed: {
        impedancesData: function () {
            return this.data
        }
    },

    mounted() { },
    methods: {
        addPrimSec() {
            const mrid = uuid.newUuid();
            this.impedancesData.prim_sec.push({
                mrid: mrid,
                short_circuit_impedances_uk: {
                    mrid: '',
                    value: '',
                    unit: this.unitSymbol.percent
                },
                base_power: {
                    mrid: '',
                    data: {
                        mrid: '',
                        value: '',
                        unit: this.unitMultiplier.k + '|' + this.unitSymbol.VA
                    },
                },
                base_voltage: {
                    mrid: '',
                    data: {
                        mrid: '',
                        value: '',
                        unit: this.unitMultiplier.k + '|' + this.unitSymbol.V
                    }
                },
                load_losses_pk: {
                    mrid: '',
                    value: '',
                    unit: this.unitSymbol.W
                },
                oltc_position: '',
                detc_position: ''
            })
            this.$emit("add", mrid)
        },
        addPrimTert() {
            const mrid = uuid.newUuid();
            this.impedancesData.prim_tert.push({
                mrid: mrid,
                short_circuit_impedances_uk: {
                    mrid: '',
                    value: '',
                    unit: this.unitSymbol.percent
                },
                base_power: {
                    mrid: '',
                    data: {
                        mrid: '',
                        value: '',
                        unit: this.unitMultiplier.k + '|' + this.unitSymbol.VA
                    }
                },
                base_voltage: {
                    mrid: '',
                    data: {
                        mrid: '',
                        value: '',
                        unit: this.unitMultiplier.k + '|' + this.unitSymbol.V
                    }
                },
                load_losses_pk: {
                    mrid: '',
                    value: '',
                    unit: this.unitSymbol.W
                },
                oltc_position: '',
                detc_position: ''
            })
            this.$emit("add", mrid)
        },
        addSecTert() {
            const mrid = uuid.newUuid();
            this.impedancesData.sec_tert.push({
                mrid: mrid,
                short_circuit_impedances_uk: {
                    mrid: '',
                    value: '',
                    unit: this.unitSymbol.percent
                },
                base_power: {
                    mrid: '',
                    data: {
                        mrid: '',
                        value: '',
                        unit: this.unitMultiplier.k + '|' + this.unitSymbol.VA
                    }
                },
                base_voltage: {
                    mrid: '',
                    data: {
                        mrid: '',
                        value: '',
                        unit: this.unitMultiplier.k + '|' + this.unitSymbol.V
                    }
                },
                load_losses_pk: {
                    mrid: '',
                    value: '',
                    unit: this.unitSymbol.W
                },
                oltc_position: '',
                detc_position: ''
            })
            this.$emit("add", mrid)
        },
        removeAllPrimSec() {
            this.$emit("removeArr", JSON.parse(JSON.stringify(this.impedancesData.prim_sec.map(item => item.mrid))))
            this.impedancesData.prim_sec = []
        },
        removeAllPrimTert() {
            this.$emit("removeArr", JSON.parse(JSON.stringify(this.impedancesData.prim_tert.map(item => item.mrid))))
            this.impedancesData.prim_tert = []
        },
        removeAllSecTert() {
            this.$emit("removeArr", JSON.parse(JSON.stringify(this.impedancesData.sec_tert.map(item => item.mrid))))
            this.impedancesData.sec_tert = []
        },
        deletePrimSec(index) {
            this.$emit("remove", JSON.parse(JSON.stringify(this.impedancesData.prim_sec[index].mrid)))
            this.impedancesData.prim_sec.splice(index, 1)
        },
        deletePrimTert(index) {
            this.$emit("remove", JSON.parse(JSON.stringify(this.impedancesData.prim_tert[index].mrid)))
            this.impedancesData.prim_tert.splice(index, 1)
        },
        deleteSecTert(index) {
            this.$emit("removeArr", JSON.parse(JSON.stringify(this.impedancesData.sec_tert[index].mrid)))
            this.impedancesData.sec_tert.splice(index, 1)
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep(.ref-temp-form .el-form-item) {
    margin-bottom: 0;
}

::v-deep(.btn-fluid) {
    width: 100%;
    min-width: 0 !important;
    padding-left: 8px;
    padding-right: 8px;
    box-sizing: border-box;
}

::v-deep(.table-scroll) {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
}

::v-deep(.fixed-table) {
    width: max-content;
    table-layout: fixed;
}

::v-deep(.fixed-table th),
::v-deep(.fixed-table td) {
    white-space: nowrap;
}

::v-deep(.table-strip-input-data) {
    font-size: 12px !important;
}
</style>
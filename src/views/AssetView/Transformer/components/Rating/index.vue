<template>
    <div id="ratings" class="mgy-5">
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer" @click="openRatings = !openRatings">
                    <i v-if="openRatings" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Ratings
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openRatings">
            <!-- rated frequency -->
            <el-row :gutter="20" class="content">
                <el-col :span="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Rated frequency">
                            <el-col :span="12" class="pdl-0">
                                <el-select v-model="ratingsData.rated_frequency.value">
                                    <el-option label="Custom" value="Custom"></el-option>
                                    <el-option :label="'60' + unitSymbol.Hz" value="60"></el-option>
                                    <el-option :label="'50' + unitSymbol.Hz" value="50"></el-option>
                                    <el-option :label="'16.7' + unitSymbol.Hz" value="16.7"></el-option>
                                </el-select>
                            </el-col>
                            <el-col :span="12" class="pdr-0" v-if="ratingsData.rated_frequency.value === 'Custom'">
                                <el-input v-model="ratingsData.rated_frequency.custom_value" size="mini">
                                    <template slot="append">{{ unitSymbol.Hz }}</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>

            <!-- voltage ratings -->
            <el-row :gutter="20" class="content mgt-10">
                <el-col :span="20" class="col-content">
                    <span class="bolder">Voltage ratings</span>
                    <el-divider></el-divider>
                    <el-row :gutter="20" class="mgt-10">
                        <el-col :span="24">
                            <el-button size="mini" type="primary" class="btn-action" @click="addVoltageRating">
                                <i class="fas fa-plus"></i>
                                Add
                            </el-button>
                            <el-button size="mini" type="primary" class="btn-action" @click="removeAllVoltageRating">
                                <i class="fas fa-xmark"></i>
                                Remove all
                            </el-button>
                        </el-col>
                    </el-row>
                    <table class="mgt-5 table-strip-input-data" style="width: 100%; table-layout: fixed;">
                        <thead>
                            <tr>
                                <th class="winding-col">Winding</th>
                                <th>Voltage L-L</th>
                                <th>Voltage L-N*</th>
                                <th>Insul. level L-L(BIL)</th>
                                <th>Insulation Class</th>
                                <th class="action-col" style="color: red;">
                                    <el-button size="mini" type="danger" class="w-100" @click="removeAllVoltageRating">
                                        <i class="fas fa-trash"></i>
                                    </el-button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in ratingsData.voltage_ratings" :key="index">
                                <td>
                                    <el-select size="mini" v-model="item.winding">
                                        <el-option label="Prim" value="Prim"></el-option>
                                        <el-option label="Sec" value="Sec"></el-option>
                                        <el-option v-if="properties.type === $constant.THREE_WINDING" label="Tert" value="Tert"></el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.voltage_ll.value">
                                        <el-select size="mini" class="select-in-input" v-model="item.voltage_ll.unit" slot="append">
                                            <el-option :label="unitMultiplier.k + unitSymbol.V" :value="unitMultiplier.k + '|' + unitSymbol.V"></el-option>
                                            <el-option :label="unitSymbol.V" :value="unitSymbol.V"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.voltage_ln.value">
                                        <el-select size="mini" class="select-in-input" v-model="item.voltage_ln.unit" slot="append">
                                            <el-option :label="unitMultiplier.k + unitSymbol.V" :value="unitMultiplier.k + '|' + unitSymbol.V"></el-option>
                                            <el-option :label="unitSymbol.V" :value="unitSymbol.V"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.insul_level_ll.value">
                                        <el-select size="mini" class="select-in-input" v-model="item.insul_level_ll.unit" slot="append">
                                            <el-option :label="unitMultiplier.k + unitSymbol.V" :value="unitMultiplier.k + '|' + unitSymbol.V"></el-option>
                                            <el-option :label="unitSymbol.V" :value="unitSymbol.V"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.insulation_class"></el-input>
                                </td>
                                <td>
                                    <el-button size="mini" type="danger" class="w-100" @click="deleteVoltageRating(index)">
                                        <i class="fas fa-trash"></i>
                                    </el-button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
            </el-row>

            <!-- Voltage regulation -->
            <el-row :gutter="20" class="content mgt-10">
                <el-col :span="12" class="col-content">
                    <span class="bolder">Voltage regulation</span>
                    <el-divider></el-divider>
                    <table class="mgt-5 table-strip-input-data" style="width: 100%; table-layout: fixed;">
                        <thead>
                            <tr>
                                <th class="winding-col">Winding</th>
                                <th>Voltage regulation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in ratingsData.voltage_ratings" :key="index">
                                <td>
                                    <el-select size="mini" v-model="item.winding">
                                        <el-option label="Prim" value="Prim"></el-option>
                                        <el-option label="Sec" value="Sec"></el-option>
                                        <el-option v-if="properties.type === $constant.THREE_WINDING" label="Tert" value="Tert"></el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.voltage_regulation">
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
            </el-row>

            <!-- power ratings -->
            <el-row :gutter="20" class="content mgt-10">
                <el-col :span="16" class="col-content">
                    <span class="bolder">Power ratings</span>
                    <el-divider></el-divider>
                    <el-row :gutter="20" class="mgt-10">
                        <el-col :span="24">
                            <el-button size="mini" type="primary" class="btn-action" @click="addPowerRating"> <i class="fas fa-plus"></i> Add </el-button>
                            <el-button size="mini" type="primary" class="btn-action" @click="removeAllPowerRating">
                                <i class="fas fa-xmark"></i>
                                Remove all
                            </el-button>
                        </el-col>
                    </el-row>
                    <table class="mgt-5 table-strip-input-data" style="width: 100%; table-layout: fixed;">
                        <thead>
                            <tr>
                                <th>Rated power</th>
                                <th>Cooling class</th>
                                <th>Temp. rise wind.</th>
                                <th class="action-col">
                                    <el-button size="mini" type="danger" class="w-100" @click="removeAllPowerRating">
                                        <i class="fas fa-trash"></i>
                                    </el-button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in ratingsData.power_ratings" :key="index">
                                <td>
                                    <el-input size="mini" v-model="item.rated_power.value">
                                        <el-select size="mini" class="select-in-input" v-model="item.rated_power.unit" slot="append">
                                            <el-option :label="unitMultiplier.m + unitSymbol.VA" :value="unitMultiplier.m + '|' + unitSymbol.VA"></el-option>
                                            <el-option :label="unitMultiplier.k + unitSymbol.VA" :value="unitMultiplier.k + '|' + unitSymbol.VA"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                                <td>
                                    <el-select size="mini" v-model="item.cooling_class">
                                        <el-option label="ONAN" value="ONAN"></el-option>
                                        <el-option label="ONAF" value="ONAF"></el-option>
                                        <el-option label="OFAF" value="OFAF"></el-option>
                                        <el-option label="OFWF" value="OFWF"></el-option>
                                        <el-option label="ODAF" value="ODAF"></el-option>
                                        <el-option label="ODWF" value="ODWF"></el-option>
                                        <el-option label="OA" value="OA"></el-option>
                                        <el-option label="FA" value="FA"></el-option>
                                        <el-option label="FOA" value="FOA"></el-option>
                                        <el-option label="FOW" value="FOW"></el-option>
                                        <el-option label="OW" value="OW"></el-option>
                                        <el-option label="ON" value="ON"></el-option>
                                        <el-option label="OF" value="OF"></el-option>
                                        <el-option label="AN" value="AN"></el-option>
                                        <el-option label="AF" value="AF"></el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.temp_rise_wind.value"> </el-input>
                                </td>
                                <td>
                                    <el-button size="mini" type="danger" class="w-100" @click="deletePowerRating(index)">
                                        <i class="fas fa-trash"></i>
                                    </el-button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
            </el-row>

            <!-- current ratings -->
            <el-row :gutter="20" class="content mgt-10">
                <el-col :span="16" class="col-content">
                    <span class="bolder">Current ratings at rated power</span>
                    <el-divider></el-divider>
                    <table class="mgt-5 table-strip-input-data" style="width: 100%; table-layout: fixed;">
                        <thead>
                            <tr>
                                <th style="width: 140px">Prim</th>
                                <th style="width: 140px">Sec</th>
                                <th style="width: 140px" v-if="properties.type === $constant.THREE_WINDING">Tert</th>
                                <th>Rated power</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in ratingsData.current_ratings" :key="index">
                                <td>
                                    <el-input size="mini" v-model="item.prim.data.value">
                                        <el-select size="mini" class="select-in-input" v-model="item.prim.data.unit" slot="append">
                                            <el-option :label="unitSymbol.A" :value="unitSymbol.A"></el-option>
                                            <el-option :label="unitMultiplier.k + unitSymbol.A" :value="unitMultiplier.k + '|' + unitSymbol.A"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.sec.data.value">
                                        <el-select size="mini" class="select-in-input" v-model="item.sec.data.unit" slot="append">
                                            <el-option :label="unitSymbol.A" :value="unitSymbol.A"></el-option>
                                            <el-option :label="unitMultiplier.k + unitSymbol.A" :value="unitMultiplier.k + '|' + unitSymbol.A"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                                <td v-if="properties.type === $constant.THREE_WINDING">
                                    <el-input size="mini" v-model="item.tert.data.value">
                                        <el-select size="mini" class="select-in-input" v-model="item.tert.data.unit" slot="append">
                                            <el-option :label="unitSymbol.A" :value="unitSymbol.A"></el-option>
                                            <el-option :label="unitMultiplier.k + unitSymbol.A" :value="unitMultiplier.k + '|' + unitSymbol.A"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" :value="ratingsData.power_ratings[index].rated_power.value" :disabled="true">
                                        <el-select
                                            size="mini"
                                            class="select-in-input"
                                            v-model="ratingsData.power_ratings[index].rated_power.unit"
                                            :disabled="true"
                                            slot="append">
                                            <el-option :label="unitMultiplier.m + unitSymbol.VA" :value="unitMultiplier.m + '|' + unitSymbol.VA"></el-option>
                                            <el-option :label="unitMultiplier.k + unitSymbol.VA" :value="unitMultiplier.k + '|' + unitSymbol.VA"></el-option>
                                        </el-select>
                                    </el-input>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </el-col>
            </el-row>

            <!-- short-circuit -->
            <el-row :gutter="20" class="content mgt-10">
                <el-col :span="12" class="col-content">
                    <span class="bolder">Short-circuit rating</span>
                    <el-divider></el-divider>
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Max short-circuit current">
                            <el-col :span="12" class="pdl-0">
                                <el-form-item>
                                    <el-input v-model="ratingsData.short_circuit.ka.value" style="width: 100%">
                                        <el-select size="mini" class="select-in-input" v-model="ratingsData.short_circuit.ka.unit" slot="append">
                                            <el-option :label="unitMultiplier.k + unitSymbol.A" :value="unitMultiplier.k + '|' + unitSymbol.A"></el-option>
                                            <el-option :label="unitSymbol.A" :value="unitSymbol.A"></el-option>
                                        </el-select>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12" class="pdr-0">
                                <el-form-item>
                                    <el-input v-model="ratingsData.short_circuit.s.value" style="width: 100%">
                                        <template slot="append">{{ ratingsData.short_circuit.s.unit }}</template>
                                    </el-input>
                                </el-form-item>
                            </el-col>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import { UnitSymbol } from '@/views/Enum/UnitSymbol'
import { UnitMultiplier } from '@/views/Enum/UnitMultiplier'
export default {
    name: 'Rating',
    props: {
        data: {
            type: Object,
            required: true,
            default() {
                return {
                    rated_frequency: {
                        value: '',
                        unit: 'Hz'
                    },
                    rated_frequency_custom: '',
                    voltage_ratings: [],
                    power_ratings: [],
                    current_ratings: [],
                    short_circuit: {
                        ka: {
                            value: '',
                            unit: 'k|A'
                        },
                        s: {
                            value: '',
                            unit: 's'
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
                    type: 'Two-winding',
                    serial_no: '',
                    manufacturer: '',
                    manufacturer_type: '',
                    manufacturing_year: '',
                    country_of_origin: '',
                    apparatus_id: '',
                    comment: ''
                }
            }
        }
    },
    data() {
        return {
            unitSymbol: UnitSymbol,
            unitMultiplier: UnitMultiplier,
            openRatings: true,
            labelWidth: `${150}px`
        }
    },
    computed: {
        ratingsData: function () {
            return this.data
        },
        assetType : function() {
            return this.properties.type
        }
    },
    watch: {
        assetType() {
            if(this.assetType === "Auto w/ tert") {
                if(this.ratingsData.voltage_ratings.length <= 3 && this.ratingsData.voltage_ratings.length > 0) {
                    this.ratingsData.voltage_ratings.forEach((element, index) => {
                        element.winding = arr[index]
                    });
                }
                else {
                    while(this.ratingsData.voltage_ratings.length > 3) {
                        this.ratingsData.voltage_ratings.pop()
                    }
                    this.ratingsData.voltage_ratings.forEach((element, index) => {
                        element.winding = arr[index]
                    });
                }
            }
            else if(this.assetType === "Auto w/o tert") {
                if(this.ratingsData.voltage_ratings.length <= 2 && this.ratingsData.voltage_ratings.length > 0) {
                    this.ratingsData.voltage_ratings.forEach((element, index) => {
                        element.winding = arr[index]
                    });
                }
                else {
                    while(this.ratingsData.voltage_ratings.length > 2) {
                        this.ratingsData.voltage_ratings.pop()
                    }
                    this.ratingsData.voltage_ratings.forEach((element, index) => {
                        element.winding = arr[index]
                    });
                }
            }
        },


    },

    mounted() {},
    methods: {
        addVoltageRating() {
            this.ratingsData.voltage_ratings.push({
                mrid: '',
                winding: this.$constant.PRIM,
                voltage_ll: {
                    mrid : '',
                    value: '',
                    unit: 'k|V'
                },
                voltage_ln: {
                    mrid : '',
                    value: '',
                    unit: 'k|V'
                },
                insul_level_ll: {
                    mrid : '',
                    value: '',
                    unit: 'k|V'
                },
                voltage_regulation: '',
                insulation_class: ''
            })
        },
        deleteVoltageRating(index) {
            this.ratingsData.voltage_ratings.splice(index, 1)
        },
        removeAllVoltageRating() {
            this.ratingsData.voltage_ratings = []
        },
        addPowerRating() {
            this.ratingsData.power_ratings.push({
                mrid: '',
                rated_power: {
                    mrid: '',
                    value: '',
                    unit: 'm|VA'
                },
                cooling_class: '',
                temp_rise_wind: {
                    mrid: '',
                    value: '',
                    unit: '°C'
                }
            })
            this.ratingsData.current_ratings.push({
                mrid: '',
                prim: {
                    mrid : '',
                    data: {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                },
                sec: {
                    mrid: '',
                    data: {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                },
                tert: {
                    mrid: '',
                    data: {
                        mrid: '',
                        value: '',
                        unit: 'A'
                    },
                }
            })
        },
        deletePowerRating(index) {
            this.ratingsData.power_ratings.splice(index, 1)
            this.ratingsData.current_ratings.splice(index, 1)
        },
        removeAllPowerRating() {
            this.ratingsData.power_ratings = []
            this.ratingsData.current_ratings = []
        }
    }

}

const arr = ['Prim', 'Sec', 'Tert']
</script>

<style lang="scss" scoped>
.bolder {
    font-size: 12px !important;
}

.table-strip-input-data {
    font-size: 12px !important;
}
</style>

<template>
    <div id="others" class="mgy-5">
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer" @click="openOthers = !openOthers">
                    <i v-if="openOthers" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Others
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openOthers">
            <el-row :gutter="20" class="content">
                <el-col :xs="24" :md="16" :lg="12" class="col-content">
                    <el-form :model="othersData" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Category">
                            <el-select allow-create filterable :reserve-keyword="false" v-model="othersData.category"
                                placeholder="Select category" class="w-100">
                                <el-option label="Distribution" value="Distribution"></el-option>
                                <el-option label="Generation" value="Generation"></el-option>
                                <el-option label="HVDC transformer" value="HVDC transformer"></el-option>
                                <el-option label="Power" value="Power"></el-option>
                                <el-option label="Transmission" value="Transmission"></el-option>
                                <el-option label="Win gen. trans." value="Win gen. trans."></el-option>
                                <el-option label="Other" value="Other"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Status">
                            <el-select allow-create filterable :reserve-keyword="false" v-model="othersData.status"
                                placeholder="Select status" class="w-100">
                                <el-option label="In operation" value="In operation"></el-option>
                                <el-option label="Spare" value="Spare"></el-option>
                                <el-option label="Repair" value="Repair"></el-option>
                                <el-option label="Out of operation" value="Out of operation"></el-option>
                                <el-option label="Scrap" value="Scrap"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item allow-create filterable :reserve-keyword="false" label="Tank type">
                            <el-select v-model="othersData.tank_type" placeholder="Select tank type" class="w-100">
                                <el-option label="Free breathing" value="Free breathing"></el-option>
                                <el-option label="Nitrogen blanketed" value="Nitrogen blanketed"></el-option>
                                <el-option label="Sealed" value="Sealed"></el-option>
                                <el-option label="Sealed conservator" value="Sealed conservator"></el-option>
                                <el-option label="Other" value="Other"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item allow-create filterable :reserve-keyword="false" label="Insulation medium">
                            <el-select allow-create filterable :reserve-keyword="false"
                                v-model="othersData.insulation_medium" placeholder="Select insulation type"
                                class="w-100">
                                <el-option label="Askarel" value="Askarel"></el-option>
                                <el-option label="Dry type" value="Dry type"></el-option>
                                <el-option label="Gas" value="Gas"></el-option>
                                <el-option label="Natural ester" value="Natural ester"></el-option>
                                <el-option label="Mineral oil" value="Mineral oil"></el-option>
                                <el-option label="Silicone" value="Silicone"></el-option>
                                <el-option label="LFH" value="LFH"></el-option>
                                <el-option label="Other" value="Other"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Insulation" class="insulation-item">
                            <el-radio-group v-model="othersData.insulation.key" class="insulation-group">
                                <div class="insulation-row">
                                    <el-radio label="Weight">Weight</el-radio>
                                    <el-input v-model="othersData.insulation.weight.value" size="mini"
                                        class="insulation-input" :disabled="othersData.insulation.key !== 'Weight'">
                                        <template slot="append">{{ othersData.insulation.weight.unit }}</template>
                                    </el-input>
                                </div>
                                <div class="insulation-row">
                                    <el-radio label="Volume">Volume</el-radio>
                                    <el-input v-model="othersData.insulation.volume.value" size="mini"
                                        class="insulation-input" :disabled="othersData.insulation.key !== 'Volume'">
                                        <template slot="append">{{ othersData.insulation.volume.unit }}</template>
                                    </el-input>
                                </div>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="Total weight">
                            <el-input v-model="othersData.total_weight.value">
                                <template slot="append">{{ othersData.total_weight.unit }}</template>
                            </el-input>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col>
                    <div class="table-scroll mgt-5">
                        <table class="table-strip-input-data fixed-table">
                            <colgroup>
                                <col style="width: 120px" />
                                <col style="width: 165px" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th class="winding-col">Winding</th>
                                    <th>Conductor material</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Prim</td>
                                    <td>
                                        <el-select v-model="othersData.winding.prim" size="mini">
                                            <el-option label="Aluminum" value="Aluminum"></el-option>
                                            <el-option label="Copper" value="Copper"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Sec</td>
                                    <td>
                                        <el-select v-model="othersData.winding.sec" size="mini">
                                            <el-option label="Aluminum" value="Aluminum"></el-option>
                                            <el-option label="Copper" value="Copper"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                                <tr
                                    v-if="properties.type === $constant.THREE_WINDING || properties.type === $constant.WITH_TERT">
                                    <td>Tert</td>
                                    <td>
                                        <el-select v-model="othersData.winding.tert" size="mini">
                                            <el-option label="Aluminum" value="Aluminum"></el-option>
                                            <el-option label="Copper" value="Copper"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import { UnitSymbol } from '@/views/Enum/UnitSymbol'
export default {
    name: 'Other',
    props: {
        data: {
            type: Object,
            required: true,
            default() {
                return {
                    mrid: '',
                    category: '',
                    status: '',
                    tank_type: '',
                    insulation_medium: '',
                    insulation: {
                        key: 'Weight',
                        weight: {
                            mrid: '',
                            value: '',
                            unit: UnitSymbol.kg
                        },
                        volume: {
                            mrid: '',
                            value: '',
                            unit: UnitSymbol.l
                        }
                    },
                    total_weight: {
                        mrid: '',
                        value: '',
                        unit: UnitSymbol.kg
                    },
                    winding: {
                        prim: 'Copper',
                        sec: 'Copper',
                        tert: 'Copper'
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
        }
    },
    data() {
        return {
            openOthers: true,
            labelWidth: `${150}px`
        }
    },
    computed: {
        othersData: function () {
            return this.data
        }
    },
    mounted() { },
    methods: {}
}
</script>

<style lang="scss" scoped>
::v-deep(.insulation-item .el-form-item__content) {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

::v-deep(.insulation-row) {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

::v-deep(.insulation-row:last-child) {
    margin-bottom: 0;
}

::v-deep(.insulation-row .el-radio) {
    width: 40px;
    flex-shrink: 0;
}

::v-deep(.insulation-row .el-radio__label) {
    font-size: 12px;
}

::v-deep(.insulation-input) {
    flex: 1;
    min-width: 0;
}

::v-deep(.table-scroll) {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
}

::v-deep(.table-scroll::-webkit-scrollbar) {
    height: 5px;
}

::v-deep(.table-scroll::-webkit-scrollbar-track) {
    background: transparent;
}

::v-deep(.table-scroll::-webkit-scrollbar-thumb) {
    background-color: rgba(120, 120, 120, 0.6);
    border-radius: 6px;
}

::v-deep(.table-scroll::-webkit-scrollbar-thumb:hover) {
    background-color: rgba(120, 120, 120, 0.85);
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
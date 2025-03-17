<template>
    <div id="others" class="mgy-5">
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer" @click="openOthers = !openOthers">
                    <i v-if="openOthers" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Others
                </div></el-col
            >
        </el-row>

        <div class="content-toggle" v-if="openOthers">
            <el-row :gutter="20" class="content">
                <el-col :span="8" class="col-content">
                    <el-form :model="othersData" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Category">
                            <el-select
                                allow-create
                                filterable
                                :reserve-keyword="false"
                                v-model="othersData.category"
                                placeholder="Select category"
                                class="w-100">
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
                            <el-select allow-create filterable :reserve-keyword="false" v-model="othersData.status" placeholder="Select status" class="w-100">
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
                            <el-select
                                allow-create
                                filterable
                                :reserve-keyword="false"
                                v-model="othersData.insulation_medium"
                                placeholder="Select insulation type"
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
                        <el-form-item label="Oil Type">
                            <el-input v-model="othersData.oil_type"></el-input>
                        </el-form-item>
                        <el-form-item label="Insulation">
                            <el-radio-group v-model="othersData.insulation.key" class="w-100">
                                <el-row :gutter="0" class="mgb-5">
                                    <el-col :span="8">
                                        <el-radio label="Weight" value="Weight" style="line-height: 28px"> Weight </el-radio>
                                    </el-col>
                                    <el-col :span="16">
                                        <el-input v-model="othersData.insulation.weight">
                                            <template slot="append">kg</template>
                                        </el-input>
                                    </el-col>
                                </el-row>
                                <el-row :gutter="0">
                                    <el-col :span="8">
                                        <el-radio label="Volume" value="Volume" style="line-height: 28px"> Volume </el-radio>
                                    </el-col>
                                    <el-col :span="16">
                                        <el-input v-model="othersData.insulation.volume">
                                            <template slot="append">l</template>
                                        </el-input>
                                    </el-col>
                                </el-row>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="Total weight">
                            <el-input v-model="othersData.total_weight">
                                <template slot="append">kg</template>
                            </el-input>
                        </el-form-item>
                        <table class="table-strip-input-data" style="width: 300px">
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
                                <tr v-if="properties.asset_type === $constant.THREE_WINDING || properties.asset_type === $constant.WITH_TERT">
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
                    </el-form>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Other',
    props: {
        data: {
            type: Object,
            required: true,
            default() {
                return {
                    category: '',
                    status: '',
                    tank_type: '',
                    insulation_medium: '',
                    oil_type: '',
                    insulation: {
                        key: 'Weight',
                        weight: '',
                        volume: ''
                    },
                    total_weight: '',
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
            openOthers: true,
            labelWidth: `${200}px`
        }
    },
    computed: {
        othersData: function () {
            return this.data
        }
    },
    mounted() {},
    methods: {}
}
</script>

<style lang="scss" scoped></style>

<template>
    <div class="mgt-20" label="Bushings">
        <el-row :gutter="20" class="content">
            <el-col :span="24" class="col-content">
                <span class="bolder">Primary bushings</span>
                <el-divider></el-divider>
                <div id="primary-bushings" class="table-scroll mgt-5">
                    <table class="table-strip-input-data fixed-table">
                        <colgroup>
                            <col style="width: 48px" />
                            <col style="width: 200px" />
                            <col style="width: 150px" />
                            <col style="width: 160px" />
                            <col style="width: 160px" />
                            <col style="width: 120px" />
                            <col style="width: 160px" />
                            <col style="width: 160px" />
                            <col style="width: 160px" />
                            <col style="width: 150px" />
                            <col style="width: 120px" />
                            <col style="width: 120px" />
                            <col style="width: 120px" />
                            <col style="width: 120px" />
                            <col style="width: 220px" />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>Pos.</th>
                                <th class="asset-type-col">Asset type</th>
                                <th>Serial no.</th>
                                <th>Manufacturer</th>
                                <th>Manufacturer type</th>
                                <th>Manufacturer year</th>
                                <th>Insul. level LL (BIL)</th>
                                <th>Voltage L-ground</th>
                                <th>Max. system voltage</th>
                                <th>Rate current</th>
                                <th>DF (C1)</th>
                                <th>Cap. (C1)</th>
                                <th>DF (C2)</th>
                                <th>Cap. (C2)</th>
                                <th class="insulation-type-col">Insulation type</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in bushingData.prim" :key="index">
                                <td>{{ item.pos }}</td>
                                <td>
                                    <el-select class="w-100" placeholder="<Select asset type>" size="mini"
                                        v-model="item.asset_type">
                                        <el-option label="With potential tap" value="With potential tap">
                                        </el-option>
                                        <el-option label="With test tap" value="With test tap"> </el-option>
                                        <el-option label="Without tap" value="Without tap"> </el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.serial_no"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.manufacturer"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.manufacturer_type"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.manufacturer_year"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.insulation_level.value">
                                        <template slot="append">{{ item.insulation_level.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.voltage_l_ground.value">
                                        <template slot="append">{{ item.voltage_l_ground.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.max_system_voltage.value">
                                        <template slot="append">{{ item.max_system_voltage.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.rate_current.value">
                                        <template slot="append">{{ item.rate_current.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.df_c1.value">
                                        <template slot="append">{{ item.df_c1.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.cap_c1.value">
                                        <template slot="append">{{ item.cap_c1.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.df_c2.value">
                                        <template slot="append">{{ item.df_c2.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.cap_c2.value">
                                        <template slot="append">{{ item.cap_c2.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-select class="w-100" placeholder="<Select asset type>" size="mini"
                                        v-model="item.insulation_type">
                                        <el-option v-for="option in insulationKindList" :key="option.value"
                                            :label="option.label" :value="option.value">
                                        </el-option>
                                    </el-select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </el-col>
        </el-row>
        <el-row :gutter="20" class="content mgt-20" v-if="bushingData.sec.length > 0">
            <el-col :span="24" class="col-content">
                <span class="bolder">Secondary bushings</span>
                <el-divider></el-divider>
                <div id="secondary-bushings" class="table-scroll mgt-5">
                    <table class="table-strip-input-data fixed-table">
                        <colgroup>
                            <col style="width: 48px" />
                            <col style="width: 200px" />
                            <col style="width: 150px" />
                            <col style="width: 160px" />
                            <col style="width: 160px" />
                            <col style="width: 120px" />
                            <col style="width: 160px" />
                            <col style="width: 160px" />
                            <col style="width: 160px" />
                            <col style="width: 150px" />
                            <col style="width: 120px" />
                            <col style="width: 120px" />
                            <col style="width: 120px" />
                            <col style="width: 120px" />
                            <col style="width: 220px" />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>Pos.</th>
                                <th class="asset-type-col">Asset type</th>
                                <th>Serial no.</th>
                                <th>Manufacturer</th>
                                <th>Manufacturer type</th>
                                <th>Manufacturer year</th>
                                <th>Insul. level LL (BIL)</th>
                                <th>Voltage L-ground</th>
                                <th>Max. system voltage</th>
                                <th>Rate current</th>
                                <th>DF (C1)</th>
                                <th>Cap. (C1)</th>
                                <th>DF (C2)</th>
                                <th>Cap. (C2)</th>
                                <th class="insulation-type-col">Insulation type</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in bushingData.sec" :key="index">
                                <td>{{ item.pos }}</td>
                                <td>
                                    <el-select class="w-100" placeholder="<Select asset type>" size="mini"
                                        v-model="item.asset_type">
                                        <el-option label="With potential tap" value="With potential tap">
                                        </el-option>
                                        <el-option label="With test tap" value="With test tap"> </el-option>
                                        <el-option label="Without tap" value="Without tap"> </el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.serial_no"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.manufacturer"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.manufacturer_type"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.manufacturer_year"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.insulation_level.value">
                                        <template slot="append">{{ item.insulation_level.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.voltage_l_ground.value">
                                        <template slot="append">{{ item.voltage_l_ground.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.max_system_voltage.value">
                                        <template slot="append">{{ item.max_system_voltage.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.rate_current.value">
                                        <template slot="append">{{ item.rate_current.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.df_c1.value">
                                        <template slot="append">{{ item.df_c1.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.cap_c1.value">
                                        <template slot="append">{{ item.cap_c1.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.df_c2.value">
                                        <template slot="append">{{ item.df_c2.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.cap_c2.value">
                                        <template slot="append">{{ item.cap_c2.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-select class="w-100" placeholder="<Select asset type>" size="mini"
                                        v-model="item.insulation_type">
                                        <el-option v-for="option in insulationKindList" :key="option.value"
                                            :label="option.label" :value="option.value"> </el-option>
                                    </el-select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </el-col>
        </el-row>
        <el-row :gutter="20" class="content mgt-20" v-if="bushingData.tert.length > 0">
            <el-col :span="24" class="col-content">
                <span class="bolder">Tertiary bushings</span>
                <el-divider></el-divider>
                <div id="secondary-bushings" class="table-scroll mgt-5">
                    <table class="table-strip-input-data fixed-table">
                        <colgroup>
                            <col style="width: 48px" />
                            <col style="width: 200px" />
                            <col style="width: 150px" />
                            <col style="width: 160px" />
                            <col style="width: 160px" />
                            <col style="width: 120px" />
                            <col style="width: 160px" />
                            <col style="width: 160px" />
                            <col style="width: 160px" />
                            <col style="width: 150px" />
                            <col style="width: 120px" />
                            <col style="width: 120px" />
                            <col style="width: 120px" />
                            <col style="width: 120px" />
                            <col style="width: 220px" />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>Pos.</th>
                                <th class="asset-type-col">Asset type</th>
                                <th>Serial no.</th>
                                <th>Manufacturer</th>
                                <th>Manufacturer type</th>
                                <th>Manufacturer year</th>
                                <th>Insul. level LL (BIL)</th>
                                <th>Voltage L-ground</th>
                                <th>Max. system voltage</th>
                                <th>Rate current</th>
                                <th>DF (C1)</th>
                                <th>Cap. (C1)</th>
                                <th>DF (C2)</th>
                                <th>Cap. (C2)</th>
                                <th class="insulation-type-col">Insulation type</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in bushingData.tert" :key="index">
                                <td>{{ item.pos }}</td>
                                <td>
                                    <el-select class="w-100" placeholder="<Select asset type>" size="mini"
                                        v-model="item.asset_type">
                                        <el-option label="With potential tap" value="With potential tap">
                                        </el-option>
                                        <el-option label="With test tap" value="With test tap"> </el-option>
                                        <el-option label="Without tap" value="Without tap"> </el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.serial_no"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.manufacturer"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.manufacturer_type"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.manufacturer_year"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.insulation_level.value">
                                        <template slot="append">{{ item.insulation_level.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.voltage_l_ground.value">
                                        <template slot="append">{{ item.voltage_l_ground.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.max_system_voltage.value">
                                        <template slot="append">{{ item.max_system_voltage.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.rate_current.value">
                                        <template slot="append">{{ item.rate_current.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.df_c1.value">
                                        <template slot="append">{{ item.df_c1.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.cap_c1.value">
                                        <template slot="append">{{ item.cap_c1.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.df_c2.value">
                                        <template slot="append">{{ item.df_c2.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="number" v-model="item.cap_c2.value">
                                        <template slot="append">{{ item.cap_c2.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-select class="w-100" placeholder="<Select asset type>" size="mini"
                                        v-model="item.insulation_type">
                                        <el-option v-for="option in insulationKindList" :key="option.value"
                                            :label="option.label" :value="option.value"> </el-option>
                                    </el-select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
/* eslint-disable */
import BushingDto from '@/views/Dto/Bushing';
import { BushingInsulationKind } from '@/views/Enum/BushingInsulationKind';
export default {
    name: 'Bushing',
    data() {
        return {
            insulationKindList: [
                {
                    label: 'Oil-impregnated paper',
                    value: BushingInsulationKind.oilImpregnatedPaper
                },
                {
                    label: 'Resin-bonded paper',
                    value: BushingInsulationKind.resinBondedPaper
                },
                {
                    label: 'Resin-impregnated paper',
                    value: BushingInsulationKind.resinImpregnatedPaper
                },
                {
                    label: 'Porcelain dry type',
                    value: BushingInsulationKind.porcelainDryType
                },
                {
                    label: 'Compound',
                    value: BushingInsulationKind.compound
                },
                {
                    label: 'Solid Porcelain',
                    value: BushingInsulationKind.solidPorcelain
                },
                {
                    label: 'Composite dry type',
                    value: BushingInsulationKind.compositeDryType
                }
            ],
            bushing_data_default: new BushingDto(),
        }
    },
    props: {
        asset_type: String,
        asset_phase: String,
        asset_winding_config: Object,
        asset_bushings_config: Object,
        bushing_data: Object
    },
    computed: {
        bushingData() {
            return this.bushing_data ? this.bushing_data : this.bushing_data_default;
        }
    },
    methods: {
    },
}
</script>

<style lang="scss" scoped>
.bolder {
    font-size: 12px !important;
}

::v-deep(.el-input),
::v-deep(.el-select) {
    min-width: 0;
}

::v-deep(.el-input__inner),
::v-deep(.el-select .el-input__inner) {
    min-width: 0;
}

::v-deep(.el-input-group__append) {
    padding: 0 6px;
    white-space: nowrap;
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
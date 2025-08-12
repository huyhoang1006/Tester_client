<template>
    <div style="flex: 1; overflow: auto; margin-top: 20px;">
        <div style="width: 2400px; margin-bottom: 20px;" label="Bushings">
            <div id="primary-bushings">
                <el-row :gutter="20" class="content">
                    <el-col :span="24" class="col-content">
                        <span style="font-size: 12px;" class="bolder">Primary bushings</span>
                        <el-divider></el-divider>
                        <table style="font-size: 12px; white-space: nowrap;" class="mgt-5 table-strip-input-data">
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
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="item.asset_type">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
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
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="item.insulation_type">
                                            <el-option v-for="option in insulationKindList" :key="option.value" :label="option.label" :value="option.value"> </el-option>
                                        </el-select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </el-col>
                </el-row>
            </div>

            <div style="margin-top: 20px;" v-if="bushingData.sec.length > 0" id="secondary-bushings">
                <el-row :gutter="20" class="content">
                    <el-col :span="24" class="col-content">
                        <span style="font-size: 12px;" class="bolder">Secondary bushings</span>
                        <el-divider></el-divider>
                        <table style="font-size: 12px; white-space: nowrap;" class="mgt-5 table-strip-input-data">
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
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="item.asset_type">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
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
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="item.insulation_type">
                                            <el-option v-for="option in insulationKindList" :key="option.value" :label="option.label" :value="option.value"> </el-option>
                                        </el-select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </el-col>
                </el-row>
            </div>

            <div style="margin-top: 20px;" v-if="bushingData.tert.length > 0" id="secondary-bushings">
                <el-row :gutter="20" class="content">
                    <el-col :span="24" class="col-content">
                        <span style="font-size: 12px;" class="bolder">Tertiary bushings</span>
                        <el-divider></el-divider>
                        <table style="font-size: 12px; white-space: nowrap;" class="mgt-5 table-strip-input-data">
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
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="item.asset_type">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
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
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="item.insulation_type">
                                            <el-option v-for="option in insulationKindList" :key="option.value" :label="option.label" :value="option.value"> </el-option>
                                        </el-select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </el-col>
                </el-row>
            </div>
        </div>
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
        bushing_data : Object
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

<style lang="scss" scoped></style>
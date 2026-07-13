<template>
    <div class="transformer-bushing-tab" label="Bushings">
        <el-row :gutter="20" class="content transformer-table-card">
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
                            <col style="width: 74px" />
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
                                <th>Rated Current</th>
                                <th>DF (C1)</th>
                                <th>Cap. (C1)</th>
                                <th>DF (C2)</th>
                                <th>Cap. (C2)</th>
                                <th class="insulation-type-col">Insulation type</th>
                                <th>Actions</th>
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
                                    <el-select class="w-100" clearable filterable placeholder="Select" size="mini"
                                        v-model="item.manufacturer">
                                        <el-option v-for="manufacturer in manufacturerList" :key="manufacturer"
                                            :label="manufacturer" :value="manufacturer">
                                        </el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.manufacturer_type"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="year"
                                        v-model="item.manufacturer_year"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="item.insulation_level.value">
                                        <template slot="append">{{ item.insulation_level.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="item.voltage_l_ground.value">
                                        <template slot="append">{{ item.voltage_l_ground.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="item.max_system_voltage.value">
                                        <template slot="append">{{ item.max_system_voltage.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="item.rate_current.value">
                                        <template slot="append">{{ item.rate_current.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive" v-model="item.df_c1.value">
                                        <template slot="append">{{ item.df_c1.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive" v-model="item.cap_c1.value">
                                        <template slot="append">{{ item.cap_c1.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive" v-model="item.df_c2.value">
                                        <template slot="append">{{ item.df_c2.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive" v-model="item.cap_c2.value">
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
                                <td>
                                    <div class="row-actions">
                                        <el-tooltip content="Copy row" placement="top">
                                            <el-button icon="el-icon-document-copy" size="mini" type="text"
                                                @click="copyBushingRow(item)"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="Paste row" placement="top">
                                            <el-button icon="el-icon-document" size="mini" type="text"
                                                :disabled="!copiedBushingRow"
                                                @click="pasteBushingRow(item)"></el-button>
                                        </el-tooltip>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </el-col>
        </el-row>
        <el-row :gutter="20" class="content transformer-table-card" v-if="bushingData.sec.length > 0">
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
                            <col style="width: 74px" />
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
                                <th>Rated Current</th>
                                <th>DF (C1)</th>
                                <th>Cap. (C1)</th>
                                <th>DF (C2)</th>
                                <th>Cap. (C2)</th>
                                <th class="insulation-type-col">Insulation type</th>
                                <th>Actions</th>
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
                                    <el-select class="w-100" clearable filterable placeholder="Select" size="mini"
                                        v-model="item.manufacturer">
                                        <el-option v-for="manufacturer in manufacturerList" :key="manufacturer"
                                            :label="manufacturer" :value="manufacturer">
                                        </el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.manufacturer_type"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="year"
                                        v-model="item.manufacturer_year"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="item.insulation_level.value">
                                        <template slot="append">{{ item.insulation_level.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="item.voltage_l_ground.value">
                                        <template slot="append">{{ item.voltage_l_ground.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="item.max_system_voltage.value">
                                        <template slot="append">{{ item.max_system_voltage.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="item.rate_current.value">
                                        <template slot="append">{{ item.rate_current.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive" v-model="item.df_c1.value">
                                        <template slot="append">{{ item.df_c1.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive" v-model="item.cap_c1.value">
                                        <template slot="append">{{ item.cap_c1.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive" v-model="item.df_c2.value">
                                        <template slot="append">{{ item.df_c2.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive" v-model="item.cap_c2.value">
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
                                <td>
                                    <div class="row-actions">
                                        <el-tooltip content="Copy row" placement="top">
                                            <el-button icon="el-icon-document-copy" size="mini" type="text"
                                                @click="copyBushingRow(item)"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="Paste row" placement="top">
                                            <el-button icon="el-icon-document" size="mini" type="text"
                                                :disabled="!copiedBushingRow"
                                                @click="pasteBushingRow(item)"></el-button>
                                        </el-tooltip>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </el-col>
        </el-row>
        <el-row :gutter="20" class="content transformer-table-card" v-if="bushingData.tert.length > 0">
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
                            <col style="width: 74px" />
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
                                <th>Rated Current</th>
                                <th>DF (C1)</th>
                                <th>Cap. (C1)</th>
                                <th>DF (C2)</th>
                                <th>Cap. (C2)</th>
                                <th class="insulation-type-col">Insulation type</th>
                                <th>Actions</th>
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
                                    <el-select class="w-100" clearable filterable placeholder="Select" size="mini"
                                        v-model="item.manufacturer">
                                        <el-option v-for="manufacturer in manufacturerList" :key="manufacturer"
                                            :label="manufacturer" :value="manufacturer">
                                        </el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-input size="mini" v-model="item.manufacturer_type"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="year"
                                        v-model="item.manufacturer_year"></el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="item.insulation_level.value">
                                        <template slot="append">{{ item.insulation_level.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="item.voltage_l_ground.value">
                                        <template slot="append">{{ item.voltage_l_ground.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="item.max_system_voltage.value">
                                        <template slot="append">{{ item.max_system_voltage.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="item.rate_current.value">
                                        <template slot="append">{{ item.rate_current.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive" v-model="item.df_c1.value">
                                        <template slot="append">{{ item.df_c1.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive" v-model="item.cap_c1.value">
                                        <template slot="append">{{ item.cap_c1.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive" v-model="item.df_c2.value">
                                        <template slot="append">{{ item.df_c2.label }}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input size="mini" type="text" number="positive" v-model="item.cap_c2.value">
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
                                <td>
                                    <div class="row-actions">
                                        <el-tooltip content="Copy row" placement="top">
                                            <el-button icon="el-icon-document-copy" size="mini" type="text"
                                                @click="copyBushingRow(item)"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="Paste row" placement="top">
                                            <el-button icon="el-icon-document" size="mini" type="text"
                                                :disabled="!copiedBushingRow"
                                                @click="pasteBushingRow(item)"></el-button>
                                        </el-tooltip>
                                    </div>
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
import MANUFACTURER_MAP from '@/views/ConstantAsset/manufacturer.js';
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
            copiedBushingRow: null,
            manufacturerList: MANUFACTURER_MAP['TransformerDataDto'] || [],
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
        cloneBushingRow(row) {
            return JSON.parse(JSON.stringify(row || {}));
        },
        copyBushingRow(row) {
            this.copiedBushingRow = this.cloneBushingRow(row);
            this.$message.success('Copied bushing row');
        },
        pasteBushingRow(row) {
            if (!this.copiedBushingRow) {
                this.$message.warning('Copy a bushing row first');
                return;
            }

            const preservedValues = {
                mrid: row.mrid,
                assetInfoId: row.assetInfoId,
                productAssetModelId: row.productAssetModelId,
                lifecycleDateId: row.lifecycleDateId,
                pos: row.pos,
                insulation_level: row.insulation_level && row.insulation_level.mrid,
                voltage_l_ground: row.voltage_l_ground && row.voltage_l_ground.mrid,
                max_system_voltage: row.max_system_voltage && row.max_system_voltage.mrid,
                rate_current: row.rate_current && row.rate_current.mrid,
                df_c1: row.df_c1 && row.df_c1.mrid,
                cap_c1: row.cap_c1 && row.cap_c1.mrid,
                df_c2: row.df_c2 && row.df_c2.mrid,
                cap_c2: row.cap_c2 && row.cap_c2.mrid
            };
            const nextRow = this.cloneBushingRow(this.copiedBushingRow);

            Object.keys(nextRow).forEach((key) => {
                if (key !== 'pos') {
                    this.$set(row, key, nextRow[key]);
                }
            });

            this.$set(row, 'mrid', preservedValues.mrid);
            this.$set(row, 'assetInfoId', preservedValues.assetInfoId);
            this.$set(row, 'productAssetModelId', preservedValues.productAssetModelId);
            this.$set(row, 'lifecycleDateId', preservedValues.lifecycleDateId);
            this.$set(row, 'pos', preservedValues.pos);

            [
                'insulation_level',
                'voltage_l_ground',
                'max_system_voltage',
                'rate_current',
                'df_c1',
                'cap_c1',
                'df_c2',
                'cap_c2'
            ].forEach((key) => {
                if (row[key]) {
                    this.$set(row[key], 'mrid', preservedValues[key]);
                }
            });

            this.$message.success('Pasted bushing row');
        }
    },
}
</script>

<style lang="scss" scoped>
.transformer-bushing-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 6px;
}

.transformer-table-card {
    margin: 0 !important;
    padding: 14px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.bolder {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    color: #606266;
    font-size: 12px !important;
    font-weight: 600;
}

.row-actions {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
}

.row-actions ::v-deep(.el-button) {
    padding: 2px 0;
    color: #0b2f9f;
}

.row-actions ::v-deep(.el-button.is-disabled) {
    color: #c0c4cc;
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

@media (max-width: 768px) {
    .transformer-table-card {
        padding: 12px;
    }
}
</style>

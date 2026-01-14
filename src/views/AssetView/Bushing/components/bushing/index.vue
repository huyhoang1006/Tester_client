<template>
    <el-row :gutter="20" class="mgt-20 property">
        <el-col :xs="24" :md="12" class="col-content">
            <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                <span class="bolder">Ratings</span>
                <el-divider></el-divider>
                <el-form-item label="Rated frequency">
                    <el-input style="width: 100%" v-model="bushingData.rated_frequency.value">
                        <template #append>{{ unitSymbol.Hz }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="Insul. level LL (BIL)">
                    <el-input style="width: 100%" v-model="bushingData.insulation_level.value">
                        <template #append>{{ bushingData.insulation_level.label }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="Voltage L-ground">
                    <el-input v-model="bushingData.voltage_l_ground.value">
                        <template #append>{{ bushingData.voltage_l_ground.label }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="Max. system voltage">
                    <el-input style="width: 100%;" filterable v-model="bushingData.max_system_voltage.value">
                        <template #append>{{ bushingData.max_system_voltage.label }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="Rated current">
                    <el-input v-model="bushingData.rated_current.value">
                        <template #append>{{ bushingData.rated_current.label }}</template>
                    </el-input>
                </el-form-item>
            </el-form>
        </el-col>
        <el-col :xs="24" :md="12" class="col-content">
            <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                <span class="bolder">Nominal values</span>
                <el-divider></el-divider>
                <el-form-item label="DF (C1)">
                    <el-input style="width: 100%" v-model="bushingData.df_c1.value">
                        <template #append>{{ bushingData.df_c1.label }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="Cap. (C1)">
                    <el-input style="width: 100%" v-model="bushingData.cap_c1.value">
                        <template #append>{{ bushingData.cap_c1.label }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="DF (C2)">
                    <el-input v-model="bushingData.df_c2.value">
                        <template #append>{{ bushingData.df_c2.label }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="Cap. (C2)">
                    <el-input style="width: 100%;" v-model="bushingData.cap_c2.value">
                        <template #append>{{ bushingData.cap_c2.label }}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="Insul. type">
                    <el-select v-model="bushingData.insulation_type" style="width: 100%;">
                        <el-option v-for="(item, index) in insulationKindList" :key="index" :label="item.label"
                            :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<script>
import { UnitMultiplier } from '@/views/Enum/UnitMultiplier';
import { UnitSymbol } from '@/views/Enum/UnitSymbol';
import { BushingInsulationKind } from '@/views/Enum/BushingInsulationKind';

export default {
    name: 'Property',
    components: {
    },
    props: {
        data: {
            type: Object,
            required: true,
            default() {
                return {}
            }
        },
        attachment: {
            type: Array,
            default() {
                return []
            }
        }
    },
    computed: {
        bushingData() {
            return this.data
        }
    },
    data() {
        return {
            labelWidth: `${150}px`,
            attachmentData: [],
            unitMultiplier: UnitMultiplier,
            unitSymbol: UnitSymbol,
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
        }
    },
    watch: {
        attachment: {
            handler(newVal) {
                this.attachmentData = newVal
            },
            immediate: true
        }
    },
    methods: {
    }
}
</script>

<style lang="scss" scoped>
::v-deep(.bolder) {
    font-size: 12px;
}

::v-deep .el-input__inner,
::v-deep .el-select .el-input__inner {
    font-size: 12px !important;
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

@media (max-width: 991px) {
    ::v-deep(.col-content) {
        margin-bottom: 10px;
    }
}
</style>
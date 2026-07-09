<template>
    <div class="bu-config-wrap">
        <el-row :gutter="20" class="bu-row property">
            <el-col :xs="24" :md="12" class="col-content">
                <section class="bu-card">
                    <div class="bu-header">
                        <i class="fa-solid fa-sliders"></i>
                        <span>Configuration</span>
                    </div>
                    <div class="bu-body">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Number of Phase" class="inline-phases">
                                <el-radio-group v-model="configurationData.number_of_phase" @change="onChangeNumberOfPhase">
                                    <el-radio label="1">1</el-radio>
                                    <el-radio label="3">3</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item v-if="configurationData.number_of_phase === '1'" label="Phase">
                                <el-select class="phase-select" v-model="configurationData.phase" placeholder="Select phase">
                                    <el-option label="A" value="A"></el-option>
                                    <el-option label="B" value="B"></el-option>
                                    <el-option label="C" value="C"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </div>
                </section>
                <section class="bu-card">
                    <div class="bu-header">
                        <i class="fa-solid fa-gauge-high"></i>
                        <span>Ratings</span>
                    </div>
                    <div class="bu-body">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Rated frequency">
                                <el-input type="text" number="positive" v-model="bushingData.rated_frequency.value">
                                    <template #append>{{ unitSymbol.Hz }}</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Insul. level LL (BIL)">
                                <el-input type="text" number="positive" v-model="bushingData.insulation_level.value">
                                    <template #append>{{ bushingData.insulation_level.label }}</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Voltage L-ground">
                                <el-input type="text" number="positive" v-model="bushingData.voltage_l_ground.value">
                                    <template #append>{{ bushingData.voltage_l_ground.label }}</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Max. system voltage">
                                <el-input type="text" number="positive" filterable v-model="bushingData.max_system_voltage.value">
                                    <template #append>{{ bushingData.max_system_voltage.label }}</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Rated current">
                                <el-input type="text" number="positive" v-model="bushingData.rated_current.value">
                                    <template #append>{{ bushingData.rated_current.label }}</template>
                                </el-input>
                            </el-form-item>
                        </el-form>
                    </div>
                </section>
            </el-col>
            <el-col :xs="24" :md="12" class="col-content">
                <section class="bu-card">
                    <div class="bu-header">
                        <i class="fa-solid fa-table-list"></i>
                        <span>Nominal values</span>
                    </div>
                    <div class="bu-body">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="DF (C1)">
                                <el-input type="text" number="positive" v-model="bushingData.df_c1.value">
                                    <template #append>{{ bushingData.df_c1.label }}</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Cap. (C1)">
                                <el-input type="text" number="positive" v-model="bushingData.cap_c1.value">
                                    <template #append>{{ bushingData.cap_c1.label }}</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="DF (C2)">
                                <el-input type="text" number="positive" v-model="bushingData.df_c2.value">
                                    <template #append>{{ bushingData.df_c2.label }}</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Cap. (C2)">
                                <el-input type="text" number="positive" v-model="bushingData.cap_c2.value">
                                    <template #append>{{ bushingData.cap_c2.label }}</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="Insul. type">
                                <el-select v-model="bushingData.insulation_type">
                                    <el-option v-for="(item, index) in insulationKindList" :key="index" :label="item.label"
                                        :value="item.value"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </div>
                </section>
            </el-col>
        </el-row>
    </div>
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
        config: {
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
        },
        configurationData() {
            return this.config
        },
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
        onChangeNumberOfPhase(val) {
            if (val === '3') {
                this.configurationData.phase = ''
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.bu-config-wrap {
    width: 100%;
}
.bu-row {
    margin-top: 14px;
}
.bu-card {
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    background: #fff;
    display: flex;
    flex-direction: column;
    min-width: 0;
}
.bu-card + .bu-card {
    margin-top: 14px;
}
.bu-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 6px 6px 0 0;
    color: #606266;
    font-size: 12px;
    font-weight: 600;
}
.bu-header i {
    color: #909399;
}
.bu-body {
    padding: 12px;
}

::v-deep .el-input__inner,
::v-deep .el-select .el-input__inner {
    font-size: 12px !important;
}

::v-deep .el-select,
::v-deep .el-input {
    width: 100%;
}

::v-deep(.phase-select.el-select) {
    width: 120px;
    max-width: 100%;
}

::v-deep(.el-form-item) {
    margin-bottom: 10px;
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

::v-deep(.el-radio__label) {
    font-size: 12px !important;
}

@media (max-width: 991px) {
    ::v-deep(.col-content) {
        margin-bottom: 10px;
    }
}

@media (max-width: 767px) {
    .bu-row {
        margin-top: 10px;
    }

    .bu-header {
        padding: 8px 10px;
    }

    .bu-body {
        padding: 10px;
    }

    ::v-deep(.el-form-item) {
        flex-direction: column;
    }

    ::v-deep(.el-form-item__label) {
        float: none;
        width: 100% !important;
        text-align: left;
    }

    ::v-deep(.el-form-item__content) {
        margin-left: 0 !important;
    }

    ::v-deep(.el-radio-group) {
        width: 100%;
    }

    ::v-deep(.phase-select.el-select) {
        width: 100%;
    }
}
</style>

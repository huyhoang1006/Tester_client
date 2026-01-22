<template>
    <div id="ratings" class="mgt-10">
        <div class="content-toggle" v-if="openRatings">
            <el-row :gutter="20" class="content">
                <el-col :span="24">
                    <span style="font-size: 12px;" class="bolder">Ratings</span>
                    <el-divider></el-divider>
                </el-col>
                <el-col :xs="24" :md="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Units in stack">
                            <el-select @change="changeUnit(ratingsData.unitStack)" style="width: 100%;"
                                v-model="ratingsData.unitStack">
                                <el-option v-for="(item, index) in 8" :value="item" :label="item"
                                    :key="index"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row style="width: 100%" class="content">
                <el-col :span="24">
                    <div class="table-scroll">
                        <table class="table-strip-input-data fixed-table">
                            <colgroup>
                                <col style="width: 50px" />
                                <col style="width: 150px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                                <col style="width: 165px" />
                            </colgroup>
                            <thead>
                                <th>Position</th>
                                <th>Serial no.</th>
                                <th>Rated voltage U<sub>r</sub></th>
                                <th>Maximun system voltage<sub>s</sub></th>
                                <th>Continous operating voltage U<sub>c</sub></th>
                                <th>Short time withstand current</th>
                                <th>Rated duration of short circuit</th>
                                <th>Power frequency withstand voltage (to earth and between poles)</th>
                                <th>Power frequency withstand voltage (across the isolating distance)</th>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in ratingsData.tableRating" :key="index">
                                    <td>{{ index + 1 }}</td>
                                    <td>
                                        <el-input size="mini" v-model="item.serial">
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.ratedVoltage.value">
                                            <template #append>
                                                <span>{{ unitMultiplier.k + unitSymbol.V }}</span>
                                            </template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.maximumVoltage.value">
                                            <template #append>
                                                <span>{{ unitMultiplier.k + unitSymbol.V }}</span>
                                            </template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.continousVoltage.value">
                                            <template #append>
                                                <span>{{ unitMultiplier.k + unitSymbol.V }}</span>
                                            </template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.shortCurrent.value">
                                            <template #append>
                                                <span>{{ unitMultiplier.k + unitSymbol.A }}</span>
                                            </template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.ratedCircuit.value">
                                            <template #append>
                                                <span>{{ unitSymbol.s }}</span>
                                            </template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.polesVoltage.value">
                                            <template #append>
                                                <span>{{ unitMultiplier.k + unitSymbol.V }}</span>
                                            </template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.isoVoltage.value">
                                            <template #append>
                                                <span>{{ unitMultiplier.k + unitSymbol.V }}</span>
                                            </template>
                                        </el-input>
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
import { UnitMultiplier } from '@/views/Enum/UnitMultiplier';
import { UnitSymbol } from '@/views/Enum/UnitSymbol';
export default {
    name: "ratings",
    props: {
        data: {
            type: Object,
            require: true,
            default: () => ({
                tableRating: [],
                unitStack: 1
            })
        }
    },
    data() {
        return {
            openRatings: "true",
            labelWidth: `150px`,
            unitMultiplier: UnitMultiplier,
            unitSymbol: UnitSymbol,
        }
    },
    watch: {
    },
    computed: {
        ratingsData() {
            return this.data;
        }
    },
    methods: {
        changeUnit(data) {
            let lengthData = this.ratingsData.tableRating.length
            if (lengthData < data) {
                for (let i = 0; i < data - lengthData; i++) {
                    this.ratingsData.tableRating.push({
                        mrid: '',
                        position: i + 1 + lengthData,
                        serial: '',
                        ratedVoltage: {
                            mrid: '',
                            value: '',
                            unit: this.unitMultiplier.k + '|' + this.unitSymbol.V
                        },
                        maximumVoltage: {
                            mrid: '',
                            value: '',
                            unit: this.unitMultiplier.k + '|' + this.unitSymbol.V
                        },
                        continousVoltage: {
                            mrid: '',
                            value: '',
                            unit: this.unitMultiplier.k + '|' + this.unitSymbol.V
                        },
                        shortCurrent: {
                            mrid: '',
                            value: '',
                            unit: this.unitMultiplier.k + '|' + this.unitSymbol.A
                        },
                        ratedCircuit: {
                            mrid: '',
                            value: '',
                            unit: this.unitSymbol.s
                        },
                        polesVoltage: {
                            mrid: '',
                            value: '',
                            unit: this.unitMultiplier.k + '|' + this.unitSymbol.V
                        },
                        isoVoltage: {
                            mrid: '',
                            value: '',
                            unit: this.unitMultiplier.k + '|' + this.unitSymbol.V
                        }
                    })
                }
            } else if (lengthData > data) {
                this.ratingsData.tableRating.splice(data, parseInt(lengthData - data))
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.bolder {
    font-size: 12px;
}

.fixed-table {
    white-space: normal;
    word-break: break-word;
    overflow-wrap: break-word;
    width: max-content;
    table-layout: fixed;
    border-collapse: collapse;
    border: 1px solid #fff;
    font-size: 12px;
}

.fixed-table th,
.fixed-table td {
    border: 1px solid #fff;
}

.table-scroll {
    width: 100%;
    overflow: auto;
}

.table-scroll::-webkit-scrollbar {
    height: 5px;
}

.table-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.table-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(120, 120, 120, 0.6);
    border-radius: 6px;
}

.table-scroll::-webkit-scrollbar-thumb:hover {
    background-color: rgba(120, 120, 120, 0.85);
}

::v-deep(.el-form-item__label) {
    font-size: 12px;
}
</style>
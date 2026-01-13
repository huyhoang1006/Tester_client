<template>
    <div>
        <div style="font-weight: bold">Ratings</div>
        <div>
            <el-form label-position="left" :label-width="labelWidth" style="margin-top: 5px">
                <el-form-item label="Units in stack" label-position="left">
                    <el-select @change="onUnitChange" v-model="ratingsData.unit" size="mini" placeholder="Select unit">
                        <el-option v-for="item in unitArr" :key="item" :label="item" :value="item"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
        </div>
        <div class="table-scroll">
            <table class="table-strip-input-data fixed-table" style="background-color: white">
                <colgroup>
                    <col style="width: 60px" />
                    <col style="width: 140px" />
                    <col style="width: 160px" />
                    <col style="width: 160px" />
                    <col style="width: 160px" />
                </colgroup>
                <thead>
                    <tr>
                        <th style="white-space: nowrap;">Position</th>
                        <th>Serial no.</th>
                        <th>Voltage L-L</th>
                        <th>Voltage L-N</th>
                        <th>MCOV rating</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in ratingsData.table" :key="index">
                        <td>{{ item.position }}</td>
                        <td>
                            <el-input size="mini" v-model="item.serial">
                            </el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.voltageLl">
                                <template #append>
                                    <span>{{ unitMultiplier.k + unitSymbol.V }}</span>
                                </template>
                            </el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.voltageLn">
                                <template #append>
                                    <span>{{ unitMultiplier.k + unitSymbol.V }}</span>
                                </template>
                            </el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.mcovRating">
                                <template #append>
                                    <span>{{ unitMultiplier.k + unitSymbol.V }}</span>
                                </template>
                            </el-input>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import { UnitMultiplier } from '@/views/Enum/UnitMultiplier';
import { UnitSymbol } from '@/views/Enum/UnitSymbol';
export default {
    name: 'rating',
    props: {
        ratings: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        ratingsData() {
            return this.ratings;
        }
    },
    data() {
        return {
            unitArr: [1, 2, 3, 4, 5, 6, 7, 8],
            labelWidth: '120px',
            unitMultiplier: UnitMultiplier,
            unitSymbol: UnitSymbol
        }
    },
    methods: {
        onUnitChange(value) {
            if (this.ratingsData.table.length === 0) {
                for (let i = 0; i < value; i++) {
                    this.ratingsData.table.push({
                        position: i + 1,
                        serial: '',
                        voltageLl: {
                            mrid: '',
                            value: '',
                            unit: UnitMultiplier.k + '|' + UnitSymbol.V,
                        },
                        voltageLn: {
                            mrid: '',
                            value: '',
                            unit: UnitMultiplier.k + '|' + UnitSymbol.V,
                        },
                        mcovRating: ''
                    });
                }
            } else {
                if (this.ratingsData.table.length < value) {
                    for (let i = this.ratingsData.table.length; i < value; i++) {
                        this.ratingsData.table.push({
                            position: i + 1,
                            serial: '',
                            voltageLl: {
                                mrid: '',
                                value: '',
                                unit: UnitMultiplier.k + '|' + UnitSymbol.V,
                            },
                            voltageLn: {
                                mrid: '',
                                value: '',
                                unit: UnitMultiplier.k + '|' + UnitSymbol.V,
                            },
                            mcovRating: {
                                mrid: '',
                                value: '',
                                unit: UnitMultiplier.k + '|' + UnitSymbol.V,
                            }
                        });
                    }
                } else if (this.ratingsData.table.length > value) {
                    this.ratingsData.table.splice(value, this.ratingsData.table.length - value);
                }
            }
        }
    },
}
</script>

<style scoped>
::v-deep(th),
::v-deep(td),
::v-deep(table) {
    border-collapse: collapse;
    border: 1px solid !important;
    border-color: #808080 !important;
    text-align: center;
}

::v-deep(.thvol) {
    text-align: center;
    padding-top: 10px;
    padding-bottom: 10px;
}

::v-deep(.el-input) {
    width: 100%;
}

::v:deep(.td) {
    vertical-align: middle;
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
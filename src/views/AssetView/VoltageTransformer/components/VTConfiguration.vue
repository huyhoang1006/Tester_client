<template>
    <div>
        <el-row class="mgt-10">
            <el-col :span="24">
                <div style="font-size: 12px;" class="header-toggle pointer" @click="openConfig = !openConfig">
                    <i v-if="openConfig" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    VT Configuration
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openConfig">
            <el-row :gutter="20" class="content">
                <el-col :xs="24" :md="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Windings">
                            <el-select @change="changeWindingData(configsData.windings)" style="width: 100%;"
                                v-model="configsData.windings">
                                <el-option v-for="item in 6" :key="item" :label="item" :value="item"> </el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row style="width: 100%;" class="content">
                <el-col :span="24">
                    <div class="table-scroll">
                        <table class="table-strip-input-data fixed-table">
                            <colgroup>
                                <col style="width: 80px" />
                                <col style="width: 260px" />
                                <col style="width: 140px" />
                                <col style="width: 100px" />
                            </colgroup>
                            <thead>
                                <th>Name</th>
                                <th>Usr</th>
                                <th>Rated burden</th>
                                <th>cos φ</th>
                            </thead>
                            <tbody v-for="(item, index) in this.configsData.dataVT" :key="index">
                                <tr>
                                    <td>
                                        {{ `${index + 1}a${index + 1}n` }}
                                    </td>
                                    <td>
                                        <el-row :gutter="8">
                                            <el-col :span="12">
                                                <el-select size="mini" v-model="item.usr_formula.value">
                                                    <el-option label="1 / 1" value="1"></el-option>
                                                    <el-option label="1 / √3" value="3sqrt"></el-option>
                                                    <el-option label="1 / 3" value="3"></el-option>
                                                </el-select>
                                            </el-col>
                                            <el-col :span="12">
                                                <el-input size="mini" v-model="item.usr_rated_voltage.value">
                                                    <template slot="append">V</template>
                                                </el-input>
                                            </el-col>
                                        </el-row>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.rated_burden.value">
                                            <template slot="append">VA</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.rated_power_factor.value">
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
export default {
    name: "currentVTConfig",
    props: {
        configs: {
            type: Object,
            require: true,
        },
    },
    data() {
        return {
            openConfig: "true",
            labelWidth: `120px`,
        }
    },
    watch: {
    },
    computed: {
        configsData() {
            return this.configs
        }
    },
    methods: {
        changeWindingData(data) {
            let lengthData = this.configsData.dataVT.length;
            // đảm bảo data là số
            const target = parseInt(data, 10) || 0;

            if (lengthData < target) {
                for (let i = 0; i < target - lengthData; i++) {
                    this.configsData.dataVT.push({
                        mrid: '',
                        usr_formula: {
                            mrid: '',
                            value: '',
                            unit: '',
                            multiplier: ''
                        },           // default
                        usr_rated_voltage: {
                            mrid: '',
                            value: '',
                            unit: '',
                            multiplier: ''
                        },      // default empty
                        rated_burden: {
                            mrid: '',
                            value: '',
                            unit: '',
                            multiplier: ''
                        },           // default empty
                        rated_power_factor: {
                            mrid: '',
                            value: '',
                            unit: '',
                            multiplier: ''
                        }      // default empty
                    });
                }
            } else if (lengthData > target) {
                // xoá từ vị trí 'target' số phần tử thừa
                this.configsData.dataVT.splice(target, lengthData - target);
            }
        }
    }
}
</script>

<style scoped>
.fixed-table {
    width: max-content;
    table-layout: auto;
    border-collapse: collapse;
    border: 1px solid #fff;
    font-size: 12px;
}

.fixed-table th,
.fixed-table td {
    border: 1px solid #fff;
    text-align: center;
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
<template>
    <div class="mgy-5">
        <el-row>
            <el-col :span="24">
                <div style="font-size: 12px;" class="header-toggle pointer" @click="openConfig = !openConfig">
                    <i v-if="openConfig" class="fa-solid fa-caret-up"></i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    VT Configuration
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openConfig">
            <br />
            <el-row style="width: 100%;" class="content">
                <el-col :span="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Windings">
                            <el-col :span="24" class="pdr-0">
                                <el-select @change="changeWindingData(configsData.windings)" style="width: 25%;"
                                    v-model="configsData.windings">
                                    <el-option v-for="item in 6" :key="item" :label="item" :value="item"> </el-option>
                                </el-select>
                            </el-col>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <br />
            <el-row style="width: 80%;">
                <table style=" width: 100%; background-color: white;">
                    <thead>
                        <th style="min-width: 50px;" class="thvol">Name</th>
                        <th class="thvol" colspan="2">Usr</th>
                        <th class="thvol">Rated burden</th>
                        <th class="thvol">cos φ</th>
                    </thead>
                    <tbody v-for="(item, index) in this.configsData.dataVT" :key="index">
                        <tr>
                            <td>
                                {{ `${index + 1}a${index + 1}n` }}
                            </td>
                            <td>
                                <el-select size="mini" v-model="item.usr_formula.value">
                                    <el-option label="1 / 1" value="1"></el-option>
                                    <el-option label="1 / √3" value="3sqrt"></el-option>
                                    <el-option label="1 / 3" value="3"></el-option>
                                </el-select>
                            </td>
                            <td>
                                <el-input size="mini" v-model="item.usr_rated_voltage.value">
                                    <template slot="append">V</template>
                                </el-input>
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
            labelWidth: `200px`,
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
th,
td,
table {
    border: 1px solid black;
    border-collapse: collapse;
    font-size: 12px;
    white-space: nowrap;
}

.thvol {
    text-align: center;
    padding-top: 10px;
    padding-bottom: 10px;
}
</style>
<template>
    <div>
        <table class="table-strip-input-data" style="width: 100%; table-layout: fixed;">
            <thead>
                <tr>
                    <th style="width: 20px;">ID</th>
                    <th>Model</th>
                    <th>Serial number</th>
                    <th>Calibration date</th>
                    <th>Test used</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testingEquipmentListData" :key="index">
                        <td style="font-weight: bold;">
                            {{ index + 1 }}
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.model"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.serial_number"></el-input>
                        </td>
                        <td>
                            <el-date-picker
                                v-model="item.calibration_date"
                                style="width: 100%;"
                                format="MM/dd/yyyy"
                                value-format="MM/dd/yyyy"
                                type="date"
                                size="mini"
                                placeholder="Pick a day">
                            </el-date-picker>
                        </td>
                        <td>
                            <el-select multiple collapse-tags size="mini" v-model="item.test_type_power_cable_id" placeholder="Select test type">
                                <el-option
                                    v-for="test in testTypeListData"
                                    :key="test.mrid"
                                    :label="test.name"
                                    :value="test.mrid">
                                </el-option>
                            </el-select>
                        </td>
                        <td>
                            <el-button size="mini" type="primary" class="w-100" @click="addTest(index)">
                                <i class="fa-solid fa-plus"></i>
                            </el-button>
                        </td>
                        <td>
                            <el-button size="mini" type="danger" class="w-100" @click="deleteTest(index)">
                                <i class="fas fa-trash"></i>
                            </el-button>
                        </td>
                    </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
/* eslint-disable */
export default {
    name: "testingEquipment",
    props: {
        data: {
            type: Array,
            required: true,
            default: () => []
        },
        testTypeListData: {
            type: Array,
            required: true,
            default: () => []
        }
    },
    data() {
        return {
            testingEquipmentList: []
        }
    },
    methods: {
        removeAll() {
            this.testingEquipmentListData = [];
        },
        add() {
            const data = {
                mrid : '',
                model: '',
                serial_number: '',
                calibration_date: '',
                work_id: '',
                test_type_power_cable_id: []
            }
            this.testingEquipmentListData.push(data);
        },
        addTest(index) {
            const data = {
                mrid: '',
                model: '',
                serial_number: '',
                calibration_date: '',
                work_id : '',
                test_type_power_cable_id: []
            }
            this.testingEquipmentListData.splice(index + 1, 0, data);
        },
        deleteTest(index) {
            this.testingEquipmentListData.splice(index, 1);
        }
    },
    computed: {
        testingEquipmentListData() {
            return this.data || this.testingEquipmentList
        }
    },
}
</script>
<style scoped>
td, th {
    font-size: 12px;
}

::v-deep(.el-select .el-select__tags) {
  flex-wrap: nowrap;
}

::v-deep(.el-select .el-tag) {
  max-width: calc(100% - 25px); /* để tag gọn lại */
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
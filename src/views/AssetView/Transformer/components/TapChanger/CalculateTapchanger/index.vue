<template>
    <el-dialog title="Calculate Tap changer" :modal="true" :visible="openDialog" @close="handleCancel" append-to-body>
        <div>Base on ...</div><br>

        <el-tabs v-if="tapVoltable.length > 1" type="card" v-model="activeName">
            <el-tab-pane label="First and second" name="fas">
                <table class="w-100 mgt-5 table-strip-input-data">
                    <thead>
                        <tr>
                            <th>Tap</th>
                            <th>Voltage</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {{ tapVoltable[0].tap }}
                            </td>
                            <td>
                                <el-input size="mini" type="text" v-model="voltage_1">
                                    <template slot="append">V</template>
                                </el-input>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {{ tapVoltable[1].tap }}
                            </td>
                            <td>
                                <el-input size="mini" type="text" v-model="voltage_2">
                                    <template slot="append">V</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </el-tab-pane>

            <el-tab-pane label="First/Middle/Last" name="fml" v-if="(numberOfTaps % 2) != 0">
                <table class="w-100 mgt-5 table-strip-input-data">
                    <thead>
                        <tr>
                            <th>Tap</th>
                            <th>Voltage</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {{ tapVoltable[0].tap }}
                            </td>
                            <td>
                                <el-input size="mini" type="text" v-model="voltage_first">
                                    <template slot="append">V</template>
                                </el-input>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {{ tapVoltable[Math.round((tapVoltable.length - 1) / 2)].tap }}
                            </td>
                            <td>
                                <el-input size="mini" type="text" v-model="voltage_middle">
                                    <template slot="append">V</template>
                                </el-input>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {{ tapVoltable[tapVoltable.length - 1].tap }}
                            </td>
                            <td>
                                <el-input size="mini" type="text" v-model="voltage_last">
                                    <template slot="append">V</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </el-tab-pane>
        </el-tabs>

        <span slot="footer" class="dialog-footer custom-footer">
            <el-button class="footer-btn" type="danger" @click="handleCancel" size="small">Cancel</el-button>
            <el-button class="footer-btn" type="primary" @click="handleCalculate" size="small">Calculate</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    name: 'CalculateTapchanger',
    data() {
        return {
            activeName: 'fas',
            voltage_1: 0,
            voltage_2: 0,
            voltage_first: 0,
            voltage_middle: 0,
            voltage_last: 0,
            result: []
        }
    },
    props: {
        openDialog: Boolean,
        tapVoltable: Array,
        numberOfTaps: String,
        tapScheme: String
    },
    computed: {

    },
    methods: {
        async handleCancel() {
            this.$emit('cancel-dialog')
        },

        async handleCalculate() {
            if (this.activeName == 'fas') {
                this.result.push(parseInt(this.voltage_1))
                this.result.push(parseInt(this.voltage_2))
                for (let i = 2; i < this.numberOfTaps; i++) {
                    this.result.push(i * this.voltage_2 - (i - 1) * this.voltage_1)
                }
            } else {
                let a = parseInt((Math.abs(this.voltage_middle - this.voltage_first)) / (parseInt((this.numberOfTaps - 1) / 2)))
                this.result.push(parseInt(this.voltage_first))

                for (let i = 1; i < this.numberOfTaps; i++) {
                    if (this.tapScheme == '1...33' || this.tapScheme == "1...N") {
                        this.result.push(this.voltage_first - i * a)
                    } else {
                        this.result.push(this.voltage_first + i * a)
                    }
                }
            }

            let hasNegative = this.result.some(v => v < 1);
            if (hasNegative == true) {
                this.$message.error('Oops, Voltage dropprd below 1V during automatic calculation');
            } else {
                this.$emit('calculate-result', this.result)
                this.$emit('calculate-dialog', false)
            }
            this.result = []
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep(.custom-footer) {
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

::v-deep(.custom-footer .footer-btn) {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

::v-deep(.el-dialog) {
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 35%;
}

::v-deep(.el.dialog__body) {
    overflow-y: auto;
    flex: 1;
}

@media (max-width: 991px) {
    ::v-deep(.el-dialog) {
        width: 50%;
    }
}

@media (max-width: 767px) {
    ::v-deep(.custom-footer) {
        flex-direction: column;
        align-items: stretch;
    }

    ::v-deep(.custom-footer .footer-btn) {
        width: 100%;
        margin: 0;
    }
}
</style>
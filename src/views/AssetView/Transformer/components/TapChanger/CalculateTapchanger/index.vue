<template>
    <el-dialog title="Calculate Tap Voltages" :modal="true" :visible="openDialog" @close="handleCancel" append-to-body>
        <div>Based on ...</div><br>

        <el-tabs v-if="tapVoltable.length" type="card" v-model="activeName">
            <el-tab-pane label="Principal tap & Tap step (%)" name="principal">
                <div class="principal-summary">
                    <div class="principal-summary-item">
                        <span>Number of taps:</span>
                        <strong>{{ normalizedNumberOfTaps }}</strong>
                    </div>
                    <div class="principal-summary-item">
                        <span>Principal tap position:</span>
                        <strong>{{ principalTapPosition }}</strong>
                    </div>
                </div>

                <el-row :gutter="20" class="principal-fields">
                    <el-col :xs="24" :sm="12">
                        <label class="field-label">Principal tap voltage</label>
                        <el-input size="mini" type="text" number="positive" v-model.number="principalTapVoltage">
                            <template slot="append">V</template>
                        </el-input>
                    </el-col>
                    <el-col :xs="24" :sm="12">
                        <label class="field-label">Tap step</label>
                        <el-input size="mini" type="text" inputmode="decimal" v-model.trim="tapStepPercent">
                            <template slot="prepend">&plusmn;</template>
                            <template slot="append">%</template>
                        </el-input>
                    </el-col>
                </el-row>
            </el-tab-pane>

            <el-tab-pane v-if="tapVoltable.length > 1" label="First & Second" name="fas">
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
                                <el-input size="mini" type="text" number="positive" v-model="voltage_1">
                                    <template slot="append">V</template>
                                </el-input>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {{ tapVoltable[1].tap }}
                            </td>
                            <td>
                                <el-input size="mini" type="text" number="positive" v-model="voltage_2">
                                    <template slot="append">V</template>
                                </el-input>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </el-tab-pane>

            <el-tab-pane label="First/Middle/Last" name="fml"
                v-if="tapVoltable.length > 1 && (numberOfTaps % 2) != 0">
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
                                <el-input size="mini" type="text" number="positive" v-model="voltage_first">
                                    <template slot="append">V</template>
                                </el-input>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {{ tapVoltable[Math.round((tapVoltable.length - 1) / 2)].tap }}
                            </td>
                            <td>
                                <el-input size="mini" type="text" number="positive" v-model="voltage_middle">
                                    <template slot="append">V</template>
                                </el-input>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                {{ tapVoltable[tapVoltable.length - 1].tap }}
                            </td>
                            <td>
                                <el-input size="mini" type="text" number="positive" v-model="voltage_last">
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
            activeName: 'principal',
            principalTapVoltage: 0,
            tapStepPercent: 0,
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
        normalizedNumberOfTaps() {
            const numberOfTaps = Number(this.numberOfTaps)
            return Number.isFinite(numberOfTaps) && numberOfTaps > 0 ? numberOfTaps : this.tapVoltable.length
        },
        principalTapPosition() {
            return Math.ceil(this.normalizedNumberOfTaps / 2)
        }
    },
    methods: {
        parseDecimal(value) {
            const normalizedValue = String(value ?? '').trim().replace(',', '.')
            if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalizedValue)) return NaN
            return Number(normalizedValue)
        },
        async handleCancel() {
            this.$emit('cancel-dialog')
        },

        async handleCalculate() {
            if (this.activeName == 'principal') {
                const principalVoltage = Number(this.principalTapVoltage)
                const tapStep = Math.abs(this.parseDecimal(this.tapStepPercent))

                if (!Number.isFinite(principalVoltage) || principalVoltage <= 0) {
                    this.$message.error('Principal tap voltage must be greater than 0')
                    return
                }
                if (!Number.isFinite(tapStep)) {
                    this.$message.error('Tap step must be a valid percentage')
                    return
                }

                this.result = this.tapVoltable.map((item, index) => {
                    const parsedTapPosition = Number(item.tap)
                    const tapPosition = Number.isFinite(parsedTapPosition) ? parsedTapPosition : index + 1
                    return Math.round(principalVoltage * (1 + (tapPosition - this.principalTapPosition) * tapStep / 100))
                })
            } else if (this.activeName == 'fas') {
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
    width: 58%;
    max-width: 900px;
}

::v-deep(.el.dialog__body) {
    overflow-y: auto;
    flex: 1;
}

.principal-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 4px 0 22px;
}

.principal-summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 210px;
    padding: 10px 12px;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    background: #f5f7fa;
    color: #303133;
    font-size: 12px;
}

.principal-fields {
    margin-bottom: 8px;
}

.field-label {
    display: block;
    margin-bottom: 8px;
    color: #303133;
    font-size: 12px;
    font-weight: 600;
}

@media (max-width: 991px) {
    ::v-deep(.el-dialog) {
        width: 80%;
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

    ::v-deep(.el-dialog) {
        width: 94%;
    }

    .principal-fields .el-col + .el-col {
        margin-top: 16px;
    }
}
</style>

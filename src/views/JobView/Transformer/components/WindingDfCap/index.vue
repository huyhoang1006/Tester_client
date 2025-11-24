<template>
    <div id="dc-winding-resistance-prim">
        <!-- Cấu hình -->
        <div style="position: sticky; left: 0; display: inline-block;">
        <el-row class="mgb-10">
            <el-col>
                <el-button class="btn-action" size="mini" type="success" @click="openAssessmentDialog = true">
                    <i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings
                </el-button>
                <el-button class="btn-action" size="mini" type="success" @click="openConditionIndicatorDialog = true">
                    <i class="fa-solid fa-hammer"></i> Condition indicatior settings
                </el-button>
            </el-col>
        </el-row>

        <el-row class="mgb-10">
            <el-col>
                <el-button size="mini" type="primary" class="btn-action" @click="calculator"> <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i class="fas fa-xmark"></i> Clear all </el-button>
            </el-col>
        </el-row>
        </div>

        <table class="table-strip-input-data" style="width: 180% ; font-size: 12px;">
            <thead>
                <tr>
                    <th class="no-col">No</th>
                    <th>Measurement</th>
                    <th>Test mode</th>
                    <th>V test (kV)</th>
                    <th>DF ref (%)</th>
                    <th>C ref (pF)</th>
                    <th>DF meas (%)</th>
                    <th>C meas (pF)</th>
                    <th>ΔC cal (%)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">DF Condition indicator</th>
                    <th class="condition-indicator-col">C Condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </tr>
            </thead>
            <tbody>
                <template v-for="(item, index) in testData.table">
                    <tr :key="index">
                        <td>{{ index + 1 }}</td>
                        <td style="display: flex;">
                            <el-input size="mini" type="text" v-model="item.measurement"></el-input>
                            <div :class="{colorTableRed : index%3==0, colorTableYellow : index%3==1, colorTableBlue : index%3==2}"></div>
                        </td>
                        <td>
                            <el-select size="mini" v-model="item.test_mode">
                                <el-option label="GST" value="GST"></el-option>
                                <el-option label="GSTg-A" value="GSTg-A"></el-option>
                                <el-option label="GSTg-B" value="GSTg-B"></el-option>
                                <el-option label="GSTg-A+B" value="GSTg-A+B"></el-option>
                                <el-option label="UST-A" value="UST-A"></el-option>
                                <el-option label="UST-B" value="UST-B"></el-option>
                                <el-option label="UST-A+B" value="UST-A+B"></el-option>
                            </el-select>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.test_voltage"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.df_ref"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.c_ref"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.df_meas"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.c_meas"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" type="text" v-model="item.tri_c_meas"></el-input>
                        </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="item.assessment">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                                <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                            </el-select>
                            <span v-if="item.assessment === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                            <span v-else-if="item.assessment === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                        </td>
                        <td>
                            <el-input :class="nameColor(item.condition_indicator_df)" id="condition" type="text" size="mini" v-model="item.condition_indicator_df">
                            </el-input>
                        </td>
                        <td>
                            <el-input :class="nameColor(item.condition_indicator_c)" id="condition" type="text" size="mini" v-model="item.condition_indicator_c">
                            </el-input>
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
                </template>
            </tbody>
        </table>

        <!-- Assessment settings -->
        <el-dialog append-to-body title="Assessment settings" :visible.sync="openAssessmentDialog" width="860px">
            <el-form size="small" label-position="left" label-width="140px">
                <el-form-item label="Option">
                    <el-select class="w-100" placeholder="please select" v-model="assessmentSetting.option">
                        <el-option label="IEEE C57.152 (2013) - New insulating liquid" value="IEEEnewLiquid"></el-option>
                        <el-option label="IEEE C57.152 (2013) - Service-aged insulating liquid" value="IEEEserviceLiquid"></el-option>
                        <el-option label="CIGRE 445" value="CIGRE"></el-option>
                        <el-option label="Customized limit" value="Custom"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>

            <table v-if="assessmentSetting.option === 'IEEEnewLiquid'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="9">Limit</th>
                        <th rowspan="2">Assessment</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th colspan="2">Mineral oil</th>
                        <th colspan="2">LFH</th>
                        <th colspan="2">Silicone</th>
                        <th colspan="2">Natural ester</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>25°C</th>
                        <th>100°C</th>
                        <th>25°C</th>
                        <th>100°C</th>
                        <th>25°C</th>
                        <th>100°C</th>
                        <th>25°C</th>
                        <th>100°C</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>DF meas (%)</th>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.mineral.celc25.df_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.mineral.celc100.df_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.lfh.celc25.df_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.lfh.celc100.df_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.silicone.celc25.df_meas }}</td>
                        <td> {{ assessmentSetting.data.IEEEnewLiquid.silicone.celc100.df_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.naturalEaster.celc25.df_meas }}</td>
                        <td> {{ assessmentSetting.data.IEEEnewLiquid.naturalEaster.celc100.df_meas }}</td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>Δ C cal (%)</th>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.mineral.celc25.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.mineral.celc100.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.lfh.celc25.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.lfh.celc100.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.silicone.celc25.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.silicone.celc100.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.naturalEaster.celc25.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEnewLiquid.naturalEaster.celc100.tri_c_meas }}</td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>DF meas (%)</th>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.mineral.celc25.df_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.mineral.celc100.df_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.lfh.celc25.df_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.lfh.celc100.df_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.silicone.celc25.df_meas }}</td>
                        <td> {{ assessmentSetting.data.IEEEnewLiquid.silicone.celc100.df_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.naturalEaster.celc25.df_meas }}</td>
                        <td> {{ assessmentSetting.data.IEEEnewLiquid.naturalEaster.celc100.df_meas }}</td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                    <tr>
                        <th>Δ C cal (%)</th>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.mineral.celc25.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.mineral.celc100.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.lfh.celc25.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.lfh.celc100.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.silicone.celc25.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.silicone.celc100.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.naturalEaster.celc25.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEnewLiquid.naturalEaster.celc100.tri_c_meas }}</td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>

            <table v-if="assessmentSetting.option === 'IEEEserviceLiquid'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="9">Limit</th>
                        <th rowspan="2">Assessment</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th colspan="2">Mineral oil</th>
                        <th colspan="2">LFH</th>
                        <th colspan="2">Silicone</th>
                        <th colspan="2">Natural ester</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>25°C</th>
                        <th>100°C</th>
                        <th>25°C</th>
                        <th>100°C</th>
                        <th>25°C</th>
                        <th>100°C</th>
                        <th>25°C</th>
                        <th>100°C</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>DF meas (%)</th>
                        <td> ≤ {{ assessmentSetting.data.IEEEserviceLiquid.mineral.celc25.df_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEserviceLiquid.mineral.celc100.df_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEserviceLiquid.lfh.celc25.df_meas }}</td>
                        <td> {{ assessmentSetting.data.IEEEserviceLiquid.lfh.celc100.df_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEserviceLiquid.silicone.celc25.df_meas }}</td>
                        <td> {{ assessmentSetting.data.IEEEserviceLiquid.silicone.celc100.df_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEserviceLiquid.naturalEaster.celc25.df_meas }}</td>
                        <td> {{ assessmentSetting.data.IEEEserviceLiquid.naturalEaster.celc100.df_meas }}</td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>Δ C cal (%)</th>
                        <td> ≤ {{ assessmentSetting.data.IEEEserviceLiquid.mineral.celc25.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEserviceLiquid.mineral.celc100.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEserviceLiquid.lfh.celc25.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEserviceLiquid.lfh.celc100.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEserviceLiquid.silicone.celc25.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEserviceLiquid.silicone.celc100.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEserviceLiquid.naturalEaster.celc25.tri_c_meas }}</td>
                        <td> ≤ {{ assessmentSetting.data.IEEEserviceLiquid.naturalEaster.celc100.tri_c_meas }}</td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>DF meas (%)</th>
                        <td> > {{ assessmentSetting.data.IEEEserviceLiquid.mineral.celc25.df_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEserviceLiquid.mineral.celc100.df_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEserviceLiquid.lfh.celc25.df_meas }}</td>
                        <td> {{ assessmentSetting.data.IEEEserviceLiquid.lfh.celc100.df_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEserviceLiquid.silicone.celc25.df_meas }}</td>
                        <td> {{ assessmentSetting.data.IEEEserviceLiquid.silicone.celc100.df_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEserviceLiquid.naturalEaster.celc25.df_meas }}</td>
                        <td> {{ assessmentSetting.data.IEEEserviceLiquid.naturalEaster.celc100.df_meas }}</td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                    <tr>
                        <th>Δ C cal (%)</th>
                        <td> > {{ assessmentSetting.data.IEEEserviceLiquid.mineral.celc25.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEserviceLiquid.mineral.celc100.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEserviceLiquid.lfh.celc25.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEserviceLiquid.lfh.celc100.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEserviceLiquid.silicone.celc25.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEserviceLiquid.silicone.celc100.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEserviceLiquid.naturalEaster.celc25.tri_c_meas }}</td>
                        <td> > {{ assessmentSetting.data.IEEEserviceLiquid.naturalEaster.celc100.tri_c_meas }}</td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>

            <table v-else-if="assessmentSetting.option === 'CIGRE'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="2">Limit</th>
                        <th>Assessment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>DF meas (%)</th>
                        <td>
                            ≤ {{ assessmentSetting.data.cirge.df_meas }}
                        </td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>DF meas (%)</th>
                        <td>
                            > {{ assessmentSetting.data.cirge.df_meas }}
                        </td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>

            <table v-else-if="assessmentSetting.option === 'Custom'" class="table-strip-input-data">
                <thead>
                    <tr>
                        <th colspan="2">Limit</th>
                        <th>Assessment</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>DF meas (%)</th>
                        <td>
                            ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.df_meas"></el-input>
                        </td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>ΔC cal (%)</th>
                        <td>
                            ≤ <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.tri_c_meas"></el-input>
                        </td>
                        <th><i class="fas fa-check-square pass"></i> Pass</th>
                    </tr>
                    <tr>
                        <th>DF meas (%)</th>
                        <td>
                            > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.df_meas"></el-input>
                        </td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                    <tr>
                        <th>ΔC cal (%)</th>
                        <td>
                            > <el-input style="width: 100px;" size="mini" v-model="assessmentSetting.data.custom.tri_c_meas"></el-input>
                        </td>
                        <th><i class="fa-solid fa-xmark fail"></i> Fail</th>
                    </tr>
                </tbody>
            </table>
        </el-dialog>

        <!-- Condition indicator settings -->
        <el-dialog title="Condition indicator settings" :visible.sync="openConditionIndicatorDialog" width="650px">
            <table class="table-strip-input-data mgb-10">
                <thead>
                    <tr>
                        <th>Result</th>
                        <th class="condition-indicator-col">Condition Indicator DF</th>
                        <th class="score-col">Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>DF meas ≤ <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.good.df_meas[0]"></el-input></td>
                        <td class="good">Good</td>
                        <td><el-input size="mini" v-model="conditionIndicatorDf.good.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.fair.df_meas[0]"></el-input> &lt; DF meas ≤
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.fair.df_meas[1]"></el-input>
                        </td>
                        <td class="fair">Fair</td>
                        <td><el-input size="mini" v-model="conditionIndicatorDf.fair.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.poor.df_meas[0]"></el-input> &lt; DF meas ≤
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.poor.df_meas[1]"></el-input>
                        </td>
                        <td class="poor">Poor</td>
                        <td><el-input size="mini" v-model="conditionIndicatorDf.poor.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>DF meas > <el-input size="mini" class="w-100px" v-model="conditionIndicatorDf.bad.df_meas[1]"></el-input></td>
                        <td class="bad">Bad</td>
                        <td><el-input size="mini" v-model="conditionIndicatorDf.bad.score"></el-input></td>
                    </tr>
                </tbody>
            </table>

            <table class="table-strip-input-data">
                <thead>
                    <tr>
                        <th>Result</th>
                        <th class="condition-indicator-col">Condition Indicator C</th>
                        <th class="score-col">Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>ΔC cal ≤ <el-input size="mini" class="w-100px" v-model="conditionIndicatorC.good.tri_c_meas[0]"></el-input></td>
                        <td class="good">Good</td>
                        <td><el-input size="mini" v-model="conditionIndicatorC.good.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorC.fair.tri_c_meas[0]"></el-input> &lt; ΔC cal ≤
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorC.fair.tri_c_meas[1]"></el-input>
                        </td>
                        <td class="fair">Fair</td>
                        <td><el-input size="mini" v-model="conditionIndicatorC.fair.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorC.poor.tri_c_meas[0]"></el-input> &lt; ΔC cal ≤
                            <el-input size="mini" class="w-100px" v-model="conditionIndicatorC.poor.tri_c_meas[1]"></el-input>
                        </td>
                        <td class="poor">Poor</td>
                        <td><el-input size="mini" v-model="conditionIndicatorC.poor.score"></el-input></td>
                    </tr>
                    <tr>
                        <td>ΔC cal > <el-input size="mini" class="w-100px" v-model="conditionIndicatorC.bad.tri_c_meas[1]"></el-input></td>
                        <td class="bad">Bad</td>
                        <td><el-input size="mini" v-model="conditionIndicatorC.bad.score"></el-input></td>
                    </tr>
                </tbody>
            </table>
        </el-dialog>
    </div>
</template>

<script>

export default {
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false
        }
    },
    props: {
        data: {
            type: Object,
            require: true
        }
    },
    computed: {
        testData() {
            return this.data
        },
        assessmentSetting() {
            return this.data.assessment_setting
        },
        conditionIndicatorDf() {
            return this.data.condition_indicator_df
        },
        conditionIndicatorC() {
            return this.data.condition_indicator_c
        }
    },
    methods: {
        add() {
            this.testData.table.push({
                measurement: '',
                test_mode: '',
                test_voltage: '',
                df_ref: '',
                c_ref: '',
                df_meas: '',
                c_meas: '',
                tri_c_meas: '',
                assessment: '',
                condition_indicator_df: '',
                condition_indicator_c: ''
            })
        },
        removeAll() {
            this.testData.table = []
        },
        deleteTest(index) {
            this.testData.table.splice(index, 1)
        },
        addTest(index) {
            const data = {
                measurement: '',
                test_mode: '',
                test_voltage: '',
                df_ref: '',
                c_ref: '',
                df_meas: '',
                c_meas: '',
                df_change: '',
                tri_c_meas: '',
                assessment: '',
                condition_indicator_df: '',
                condition_indicator_c: ''
            }
            this.testData.table.splice(index+1, 0, data)
        },
        async calculator() {
            await this.CcalCalulated()
            await this.dfmeasAssessment()
            await this.deltaCAssessment()
            this.$message.success('Calculating successful')
        },
        async CcalCalulated() {
            this.testData.table.forEach((element) => {
                if(!isNaN(parseFloat(element.c_meas))) {
                    if(!isNaN(parseFloat(element.c_ref) && parseFloat(element.c_ref) != 0)) {
                        element.tri_c_meas = 100 * (element.c_meas - element.c_ref)/element.c_ref
                        element.tri_c_meas = element.tri_c_meas.toFixed(4)
                    }
                }
            })
        },
        async dfmeasAssessment() {
            if(this.assessmentSetting.option === "IEEEnewLiquid") {
                if(this.testData.option === "Natural ester") {
                    this.testData.table.forEach((element) => {
                        if(!isNaN(parseFloat(element.df_meas))) {
                            if(element.df_meas <= this.assessmentSetting.data.IEEEnewLiquid.naturalEaster.celc25.df_meas) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    })
                } else if(this.testData.option === "Silicone") {
                    this.testData.table.forEach((element) => {
                        if(!isNaN(parseFloat(element.df_meas))) {
                            if(element.df_meas <= this.assessmentSetting.data.IEEEnewLiquid.silicone.celc25.df_meas) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    })
                } else if(this.testData.option === "lfh") {
                    this.testData.table.forEach((element) => {
                        if(!isNaN(parseFloat(element.df_meas))) {
                            if(element.df_meas <= this.assessmentSetting.data.IEEEnewLiquid.lfh.celc25.df_meas) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    })
                } else {
                    this.testData.table.forEach((element) => {
                        if(!isNaN(parseFloat(element.df_meas))) {
                            if(element.df_meas <= this.assessmentSetting.data.IEEEnewLiquid.mineral.celc25.df_meas) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    })
                }
            } else if(this.assessmentSetting.option === "IEEEserviceLiquid") {
                if(this.testData.option === "Natural ester") {
                    this.testData.table.forEach((element) => {
                        if(!isNaN(parseFloat(element.df_meas))) {
                            if(Math.abs(element.df_meas) <= this.assessmentSetting.data.IEEEserviceLiquid.naturalEaster.celc25.df_meas) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    })
                } else if(this.testData.option === "Silicone") {
                    this.testData.table.forEach((element) => {
                        if(!isNaN(parseFloat(element.df_meas))) {
                            if(Math.abs(element.df_meas) <= this.assessmentSetting.data.IEEEserviceLiquid.silicone.celc25.df_meas) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    })
                } else if(this.testData.option === "lfh") {
                    this.testData.table.forEach((element) => {
                        if(!isNaN(parseFloat(element.df_meas))) {
                            if(Math.abs(element.df_meas) <= this.assessmentSetting.data.IEEEserviceLiquid.lfh.celc25.df_meas) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    })
                } else {
                    this.testData.table.forEach((element) => {
                        if(!isNaN(parseFloat(element.df_meas))) {
                            if(Math.abs(element.df_meas) <= this.assessmentSetting.data.IEEEserviceLiquid.mineral.celc25.df_meas) {
                                element.assessment = "Pass"
                            } else {
                                element.assessment = "Fail"
                            }
                        }
                    })
                }
            } else if(this.assessmentSetting.option === "CIGRE") {
                this.testData.table.forEach((element) => {
                    if(!isNaN(parseFloat(element.df_meas))) {
                        if(Math.abs(element.df_meas) <= this.assessmentSetting.data.cirge.df_meas) {
                            element.assessment = "Pass"
                        } else {
                            element.assessment = "Fail"
                        }
                    }
                })
            } else if (this.assessmentSetting.option === "Custom") {
                this.testData.table.forEach((element) => {
                    if(!isNaN(parseFloat(element.df_meas))) {
                        if(Math.abs(element.df_meas) <= this.assessmentSetting.data.custom.df_meas) {
                            element.assessment = "Pass"
                        } else {
                            element.assessment = "Fail"
                        }
                    }
                })
            }
        },
        async deltaCAssessment() {
            if(this.assessmentSetting.option !== "CIGRE") {
                if(this.assessmentSetting.option === "IEEEnewLiquid") {
                    if(this.testData.option === "Natural ester") {
                        this.testData.table.forEach((element) => {
                            if(element.assessment === "Pass") {
                                if(!isNaN(parseFloat(element.tri_c_meas))) {
                                    if(Math.abs(element.df_meas) <= this.assessmentSetting.data.IEEEnewLiquid.naturalEaster.celc25.tri_c_meas) {
                                        element.assessment = "Pass"
                                    } else {
                                        element.assessment = "Fail"
                                    }
                                }
                            }
                        })
                    } else if(this.testData.option === "Silicone") {
                        this.testData.table.forEach((element) => {
                            if(element.assessment === "Pass") {
                                if(!isNaN(parseFloat(element.tri_c_meas))) {
                                    if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.IEEEnewLiquid.silicone.celc25.tri_c_meas) {
                                        element.assessment = "Pass"
                                    } else {
                                        element.assessment = "Fail"
                                    }
                                }
                            }
                        })
                    } else if(this.testData.option === "lfh") {
                        this.testData.table.forEach((element) => {
                            if(element.assessment === "Pass") {
                                if(!isNaN(parseFloat(element.tri_c_meas))) {
                                    if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.IEEEnewLiquid.lfh.celc25.tri_c_meas) {
                                        element.assessment = "Pass"
                                    } else {
                                        element.assessment = "Fail"
                                    }
                                }
                            }
                        })
                    } else {
                        this.testData.table.forEach((element) => {
                            if(element.assessment === "Pass") {
                                if(!isNaN(parseFloat(element.tri_c_meas))) {
                                    if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.IEEEnewLiquid.mineral.celc25.tri_c_meas) {
                                        element.assessment = "Pass"
                                    } else {
                                        element.assessment = "Fail"
                                    }
                                }
                            }
                        })
                    }
                } else if(this.assessmentSetting.option === "IEEEserviceLiquid") {
                    if(this.testData.option === "Natural ester") {
                        this.testData.table.forEach((element) => {
                            if(element.assessment === "Pass") {
                                if(!isNaN(parseFloat(element.tri_c_meas))) {
                                    if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.IEEEserviceLiquid.naturalEaster.celc25.tri_c_meas) {
                                        element.assessment = "Pass"
                                    } else {
                                        element.assessment = "Fail"
                                    }
                                }
                            }
                        })
                    } else if(this.testData.option === "Silicone") {
                        this.testData.table.forEach((element) => {
                            if(element.assessment === "Pass") {
                                if(!isNaN(parseFloat(element.tri_c_meas))) {
                                    if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.IEEEserviceLiquid.silicone.celc25.tri_c_meas) {
                                        element.assessment = "Pass"
                                    } else {
                                        element.assessment = "Fail"
                                    }
                                }
                            }
                        })
                    } else if(this.testData.option === "lfh") {
                        this.testData.table.forEach((element) => {
                            if(element.assessment === "Pass") {
                                if(!isNaN(parseFloat(element.tri_c_meas))) {
                                    if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.IEEEserviceLiquid.lfh.celc25.tri_c_meas) {
                                        element.assessment = "Pass"
                                    } else {
                                        element.assessment = "Fail"
                                    }
                                }
                            }
                        })
                    } else {
                        this.testData.table.forEach((element) => {
                            if(element.assessment === "Pass") {
                                if(!isNaN(parseFloat(element.tri_c_meas))) {
                                    if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.IEEEserviceLiquid.mineral.celc25.tri_c_meas) {
                                        element.assessment = "Pass"
                                    } else {
                                        element.assessment = "Fail"
                                    }
                                }
                            }
                        })
                    }
                } else if (this.assessmentSetting.option === "Custom") {
                    this.testData.table.forEach((element) => {
                        if(element.assessment === "Pass") {
                            if(!isNaN(parseFloat(element.tri_c_meas))) {
                                if(Math.abs(element.tri_c_meas) <= this.assessmentSetting.data.custom.tri_c_meas) {
                                    element.assessment = "Pass"
                                } else {
                                    element.assessment = "Fail"
                                }
                            }
                        }
                    })
                }
            }
        },
        clear() {
            this.testData.table.forEach((element) => {
                element.test_mode = ''
                element.test_voltage = ''
                element.df_ref = ''
                element.c_ref = ''
                element.df_meas = ''
                element.c_meas = ''
                element.tri_c_meas = ''
                element.assessment = ''
                element.condition_indicator_df = ''
                element.condition_indicator_c = ''
            })
        },
        nameColor(data) {
            if(data === this.$constant.GOOD) {
                return 'Good'
            }
            else if(data === this.$constant.FAIR) {
                return 'Fair'
            }
            else if(data === this.$constant.POOR) {
                return 'Poor'
            }
            else if(data === this.$constant.BAD) {
                return 'Bad'
            }
            else {
                return;
            }
        }
    }
}
</script>

<style lang="scss" scoped></style>

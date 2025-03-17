<template>
    <div id="online-monitoring-data">
        <div style="position: fixed; width: 100%; top: 38px; z-index: 1">
            <el-row id="top-bar">
                <el-col :span="24">
                    <el-button @click="backToManage" style="box-sizing: border-box; border-right: 1px solid #aeb6bf">
                        <i class="fa-solid fa-circle-arrow-left display-block fa-2x"></i>
                        <div class="mgt-10">Manage</div>
                    </el-button>
                    <el-button @click="saveOnlineMonitoringData">
                        <i class="fa-solid fa-floppy-disk display-block fa-2x"></i>
                        <div class="mgt-10"> Save all</div>
                    </el-button>
                    <el-button @click="$router.go(-1)" style="box-sizing: border-box">
                        <i class="fa-solid fa-ban display-block fa-2x"></i>
                        <div class="mgt-10">Cancel</div>
                    </el-button>
                    <el-button style="float: right; text-align: right; width: fit-content; cursor: default">
                        <img src="@/assets/images/logo.png" style="max-height: 40px" />
                    </el-button>
                    <el-button @click="getOnlineData()" style="box-sizing: border-box">
                        <i class="fa fa-refresh display-block fa-2x" aria-hidden="true"></i>
                        <div class="mgt-10">Refresh</div>
                    </el-button>
                </el-col>
            </el-row>
        </div>
        <div style="margin-top: 100px;">
            <el-row style="height: 100%;">
                <el-col style="width: 200px; height: 100%;">
                    <div class="rectangle">
                        <div style="text-align: center; margin-bottom: 30px ">
                                <br/>
                                <b>{{ date }}</b>
                                <br/>
                                <b>{{ time }}</b>
                                <br/>
                        </div>
                        <el-divider />
                        <div style="margin-bottom: 30px; text-align: center; margin-top: 30px;">
                            ONLINE DATA
                        </div>
                        <el-button @click="AgeingShow()" style="width: 100%;">
                            Ageing
                        </el-button>
                        <el-button @click="MoitureShow()" style="width: 100%; margin-left: 0px;">
                            Moiture of insulation
                        </el-button>
                        <el-button @click="BushingShow()" style="width: 100%; margin-left: 0px;">
                            Bushing
                        </el-button>
                        <el-button @click="PartialShow()" style="width: 100%; margin-left: 0px;">
                            Partial discharge
                        </el-button>
                        <el-button @click="DgaShow()" style="width: 100%; margin-left: 0px;">
                            DGA
                        </el-button>
                        <el-button @click="Option()" style="width: 100%; margin-left: 0px;">
                            Option
                        </el-button>
                    </div>
                </el-col>
                <el-col style="width: 30px;">
                    <br/>
                </el-col>
                <el-col style="width: calc(100% - 230px); margin-top: 30px;">
                    <div>    
                        <div v-if="ageingShow">
                            <div style="margin-left: 10px;" class="bolder">DATA</div>
                            <el-divider></el-divider>
                            <div id="ageing-of-insulation-system" class="mgy-5">
                                <table class="table-strip-input-data" style="width: 420px">
                                    <thead></thead>
                                    <tbody>
                                        <tr>
                                            <td>Ageing rate</td>
                                            <td>
                                                <el-input size="mini" type="number" v-model="online_monitoring.aois.ar"></el-input>
                                            </td>
                                        </tr>
                                        <tr style="white-space: nowrap;">
                                            <td style="white-space: nowrap;">Lifetime consumption (absolute)</td>
                                            <td>
                                                <el-input size="mini" type="number" v-model="online_monitoring.aois.lc"></el-input>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>         
                            </div>
                        </div>
                        <div v-if="moitureShow">
                            <div style="margin-left: 10px;" class="bolder">DATA</div>
                            <el-divider></el-divider>
                            <div id="moisture-of-insulation-paper" class="mgy-5">
                
                                <table class="table-strip-input-data" style="width: 420px">
                                    <thead></thead>
                                    <tbody>
                                        <tr>
                                            <th>Input Data</th>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td>Water content in tank</td>
                                            <td>
                                                <el-input size="mini" type="number" v-model="online_monitoring.moip.input_data.wcit">
                                                    <template slot="append">ppm</template>
                                                </el-input>
                                                
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Top oil temperature</td>
                                            <td>
                                                <el-input size="mini" type="number" v-model="online_monitoring.moip.input_data.tot">
                                                    <template slot="append">°C</template>
                                                </el-input>
                                            </td>
                                        </tr>

                                    </tbody>
                                </table>

                                <table class="table-strip-input-data" style="width: 420px">
                                    <thead></thead>
                                    <tbody>
                                        <tr>
                                            <th>Calculation</th>
                                            <td></td>
                                        </tr>
                                        <tr>
                                            <td style="white-space: nowrap;">Moisture of Insulation Paper</td>
                                            <td>
                                                <el-input size="mini" type="number" v-model="online_monitoring.moip.cal.moip">
                                                    <template slot="append">%</template>
                                                </el-input>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Condition Indicator</td>
                                            <td>
                                                <el-input :class="nameColor(online_monitoring.moip.cal.ci)" size="mini" v-model="online_monitoring.moip.cal.ci">
                                                    <i @click="openConditionSetting = true" class="fa-solid fa-sliders"></i>
                                                    <template slot="append"><i @click="openConditionSetting = true" class="fa-solid fa-sliders"></i></template>
                                                </el-input>
                                            </td>
                                        </tr> 
                                    </tbody>
                                </table>
                                <br>
                            </div>
                        </div>
                        <div v-if="bushingShow">
                            <div style="margin-left: 10px;" class="bolder">DATA</div>
                            <el-divider></el-divider>
                            <div id="bushings" class="mgy-5">
                                <el-row>
                                    <table class="table-strip-input-data" style="width: 500px">
                                        <thead></thead>
                                        <tbody>
                                            <tr>
                                                <th>Bushing Capacitance</th>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td>Calculated capacitance HV Ph.1</td>
                                                <td>
                                                    <el-input size="mini" type="number" v-model="online_monitoring.bushings.bf.c_c_hv_ph1">
                                                        <template slot="append">pF</template>
                                                    </el-input>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Calculated capacitance HV Ph.2</td>
                                                <td>
                                                    <el-input size="mini" type="number" v-model="online_monitoring.bushings.bf.c_c_hv_ph2" >
                                                        <template slot="append">pF</template>
                                                    </el-input>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>Calculated capacitance HV Ph.3</td>
                                                <td>
                                                    <el-input size="mini" type="number" v-model="online_monitoring.bushings.bf.c_c_hv_ph3">
                                                        <template slot="append">pF</template>
                                                    </el-input>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </el-row>
                                <el-row>
                                    <el-col style="width: 50%;">
                                        <p><b> &nbsp; &nbsp;Change of capacitance - Δ C</b></p>
                                        <table class="table-strip-input-data" style="width: 550px">
                                            <thead>
                                                <th>Phase</th>
                                                <th>Δ C</th>
                                                <th>Condition Indicator <span style="float: right;"><i @click="openCondition = true" class="fa-solid fa-sliders"></i></span></th>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>HV Ph.1</td>
                                                    <td>
                                                        <el-input size="mini" type="number" v-model="online_monitoring.bushings.deltaC.hv_ph1.result">
                                                            <template slot="append">%</template>
                                                        </el-input>
                                                    </td>
                                                    <td>
                                                        <el-input :class="nameColor(online_monitoring.bushings.deltaC.hv_ph1.ci)" size="mini" v-model="online_monitoring.bushings.deltaC.hv_ph1.ci">
                                                        </el-input>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>HV Ph.2</td>
                                                    <td>
                                                        <el-input size="mini" type="number" v-model="online_monitoring.bushings.deltaC.hv_ph2.result">
                                                            <template slot="append">%</template>
                                                        </el-input>
                                                    </td>
                                                    <td>
                                                        <el-input :class="nameColor(online_monitoring.bushings.deltaC.hv_ph2.ci)" size="mini" v-model="online_monitoring.bushings.deltaC.hv_ph2.ci">
                                                        </el-input>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>HV Ph.3</td>
                                                    <td>
                                                        <el-input size="mini" type="number" v-model="online_monitoring.bushings.deltaC.hv_ph3.result">
                                                            <template slot="append">%</template>
                                                        </el-input>
                                                    </td>
                                                    <td>
                                                        <el-input :class="nameColor(online_monitoring.bushings.deltaC.hv_ph3.ci)" size="mini" v-model="online_monitoring.bushings.deltaC.hv_ph3.ci">
                                                        </el-input>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </el-col>
                                    <el-col style="width: 50%;">
                                        <p><b> &nbsp; &nbsp;Change of tan dela - Δ Tanδ</b></p>
                                        <table class="table-strip-input-data" style="width: 550px">
                                            <thead>
                                                <th>Phase</th>
                                                <th>Δ Tanδ</th>
                                                <th>Condition Indicator <span style="float: right;"><i @click="openCondition = true" class="fa-solid fa-sliders"></i></span></th>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>HV Ph.1</td>
                                                    <td>
                                                        <el-input size="mini" type="number" v-model="online_monitoring.bushings.deltaDF.hv_ph1.result">
                                                            <template slot="append">%</template>
                                                        </el-input>
                                                    </td>
                                                    <td>
                                                        <el-input :class="nameColor(online_monitoring.bushings.deltaDF.hv_ph1.ci)" size="mini" v-model="online_monitoring.bushings.deltaDF.hv_ph1.ci">
                                                        </el-input>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>HV Ph.2</td>
                                                    <td>
                                                        <el-input size="mini" type="number" v-model="online_monitoring.bushings.deltaDF.hv_ph2.result">
                                                            <template slot="append">%</template>
                                                        </el-input>
                                                    </td>
                                                    <td>
                                                        <el-input :class="nameColor(online_monitoring.bushings.deltaDF.hv_ph2.ci)" size="mini" v-model="online_monitoring.bushings.deltaDF.hv_ph2.ci">
                                                        </el-input>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>HV Ph.3</td>
                                                    <td>
                                                        <el-input size="mini" type="number" v-model="online_monitoring.bushings.deltaDF.hv_ph3.result">
                                                            <template slot="append">%</template>
                                                        </el-input>
                                                    </td>
                                                    <td>
                                                        <el-input :class="nameColor(online_monitoring.bushings.deltaDF.hv_ph3.ci)" size="mini" v-model="online_monitoring.bushings.deltaDF.hv_ph3.ci">
                                                        </el-input>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </el-col>
                                </el-row>
                                <el-row style="margin-top: 50px;">
                                    <div style="margin-left: 30px;" class="bolder"> DIAGRAM </div>
                                    <el-divider />
                                </el-row>
                                <el-row style="margin-top: 25px; width: 50%;">
                                    <el-col style="width: 45%;">
                                        <el-form label-width="50px">
                                            <el-form-item label="From">
                                                <el-date-picker
                                                v-model="form.from"
                                                type="date"
                                                placeholder="Pick a date"
                                                style="width: 100%"
                                                />
                                            </el-form-item>
                                        </el-form>
                                    </el-col>
                                    <el-col style="width: 45%;">
                                        <el-form label-width="50px">
                                            <el-form-item label="To">
                                                <el-date-picker
                                                v-model="form.to"
                                                type="date"
                                                placeholder="Pick a date"
                                                style="width: 100%"
                                                />
                                            </el-form-item>
                                        </el-form>
                                    </el-col>
                                    <el-col style="width: 10%;">
                                        <el-button @click="getData()" style="margin-left: 10px;">
                                            Get data
                                        </el-button>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col style="width: 50%;">
                                        <div >
                                            <Plotly style="font-family: Arial;" id="dataC" :data="dataC" :layout="layoutC" :display-mode-bar="false" :scrollZoom = true ></Plotly>
                                        </div>
                                    </el-col>
                                    <el-col style="width: 50%;">
                                        <Plotly :data="dataDelta" :layout="layoutDelta" :display-mode-bar="false" :scrollZoom = true></Plotly>
                                    </el-col>
                                </el-row>
                            </div>
                        </div>
                        <div v-if="partialShow">
                            <div style="margin-left: 10px;" class="bolder">DATA</div>
                            <el-divider></el-divider>
                            <div id="partial-discharge" class="mgy-5">
                                <table class="table-strip-input-data" style="width: 500px">
                                    <thead></thead>
                                    <tbody>
                                        <tr>
                                            <td>Charge of channel 1 of ICM</td>
                                            <td>
                                                <el-input size="mini" type="number" v-model="online_monitoring.pd.coc_1">
                                                    <template slot="append">pC</template>
                                                </el-input>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Charge of channel 2 of ICM</td>
                                            <td>
                                                <el-input size="mini" type="number" v-model="online_monitoring.pd.coc_2">
                                                    <template slot="append">pC</template>
                                                </el-input>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Charge of channel 3 of ICM</td>
                                            <td>
                                                <el-input size="mini" type="number" v-model="online_monitoring.pd.coc_3">
                                                    <template slot="append">pC</template>
                                                </el-input>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div v-if="dgaShow">
                            <div style="margin-left: 10px;" class="bolder">DATA</div>
                            <el-divider></el-divider>
                            <div style="width: 30%;" id="ageing-of-insulation-system" class="mgy-5">
                                <div style="margin-top: 30px;" class="bolder">Dissolved Gas Analysis</div>
                                <el-divider></el-divider>
                                <table id="dga" class="table-strip-input-data" style="width: 100%">
                                    <thead>
                                        <th>Gas</th>
                                        <th>Result</th>
                                        <th>Condition indicator <i @click="openConditionSetting = true" class="fa-solid fa-sliders"></i></th>
                                    </thead>
                                    <tbody v-for="(item, index) in air" :key="index">
                                        <tr>
                                            <td class="bolder" v-if="item=='CO2'">CO<sub>2</sub></td>
                                            <td class="bolder" v-else-if="item=='H2'">H<sub>2</sub></td>
                                            <td class="bolder" v-else-if="item=='CH4'">CH<sub>2</sub></td>
                                            <td class="bolder" v-else-if="item=='C2H2'">C<sub>2</sub>H<sub>2</sub></td>
                                            <td class="bolder" v-else-if="item=='C2H4'">C<sub>2</sub>H<sub>4</sub></td>
                                            <td class="bolder" v-else-if="item=='C2H6'">C<sub>2</sub>H<sub>6</sub></td>
                                            <td class="bolder" v-else-if="item=='C3H6'">C<sub>3</sub>H<sub>6</sub></td>
                                            <td class="bolder" v-else-if="item=='O2'">O<sub>2</sub></td>
                                            <td class="bolder" v-else-if="item=='N2'">N<sub>2</sub></td>
                                            <td class="bolder" v-else>{{ item}}</td>

                                            <td>
                                                <el-input size="mini" type="number" v-model="online_monitoring.dga[item.toLowerCase()].result">
                                                    <template slot="append">ppm</template>
                                                </el-input>
                                            </td>
                                            <td>
                                                <el-input size="mini" type="number" v-model="online_monitoring.dga[item.toLowerCase()].condition"></el-input>
                                            </td>
                                        </tr>
                                        
                                    </tbody>
                                </table>         
                            </div>
                        </div>
                    </div>
                </el-col>
            </el-row>
        
            <el-dialog class="dialog_assess" title="Assessment settings" :visible.sync="openConditionSetting">
                <table class="table-strip-input-data" style="width: 550px">
                    <thead>
                        <th>Result</th>
                        <th>Condition Indicator</th>
                    </thead>
                    <tbody>
                        <tr>
                            <td>% moisture in paper ≤ {{online_monitoring.moip.cis.moip.good}}.0</td>
                            <td bgcolor="#00CC00">Good</td>
                        </tr>
                        <tr>
                            <td>{{online_monitoring.moip.cis.moip.good}}.0 &lt; % moisture in paper ≤ {{online_monitoring.moip.cis.moip.fair}} </td>
                            <td bgcolor="#FFFF00">Fair</td>
                        </tr>
                        <tr>
                            <td>{{online_monitoring.moip.cis.moip.fair}} &lt; % moisture in paper ≤ {{online_monitoring.moip.cis.moip.bad}}</td>
                            <td bgcolor="#FFC000">Poor</td>
                        </tr>
                        <tr >
                            <td>% moisture in paper > {{online_monitoring.moip.cis.moip.bad}}</td>
                            <td bgcolor="#FF0000">Bad</td>
                        </tr>
                    </tbody>
                </table>
            </el-dialog>

            <el-dialog class="dialog_assess" title="Assessment settings" :visible.sync="openCondition">
                <el-row>
                    <el-col :span="12">
                        <table class="table-strip-input-data" style="width: 550px">
                            <thead>
                                <th>Result</th>
                                <th>Condition Indicator</th>
                                <th>Score</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>DF change ≤ {{online_monitoring.bushings.cis.df_change.good.result}} time previous, new values</td>
                                    <td bgcolor="#00CC00">Good</td>
                                    <td>{{online_monitoring.bushings.cis.df_change.good.score}}</td>
                                </tr>
                                <tr>
                                    <td>{{online_monitoring.bushings.cis.df_change.fair.result_small}} &lt; DF change  ≤ {{online_monitoring.bushings.cis.df_change.fair.result_big}} time previous, new values</td>
                                    <td bgcolor="#FFFF00">Fair</td>
                                    <td>{{online_monitoring.bushings.cis.df_change.fair.score}}</td>
                                </tr>
                                <tr>
                                    <td>{{online_monitoring.bushings.cis.df_change.fair.result_big}} &lt; DF change ≤ {{online_monitoring.bushings.cis.df_change.poor.result}} time previous, new values</td>
                                    <td bgcolor="#FFC000">Poor</td>
                                    <td>{{online_monitoring.bushings.cis.df_change.poor.score}}</td>
                                </tr>
                                <tr >
                                    <td>DF change > {{online_monitoring.bushings.cis.df_change.bad.result}} time previous, new values</td>
                                    <td bgcolor="#FF0000">Bad</td>
                                    <td>{{online_monitoring.bushings.cis.df_change.bad.score}}</td>
                                </tr>
                            </tbody>
                        </table>
                    </el-col>
                </el-row>
                <br>
                <el-row>
                    <el-col :span="12">
                        <table class="table-strip-input-data" style="width: 450px">
                            <thead>
                                <th>Result</th>
                                <th>Condition Indicator</th>
                                <th>Score</th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Δ C meas ≤ {{online_monitoring.bushings.cis.c_meas.good.result}}</td>
                                    <td bgcolor="#00CC00">Good</td>
                                    <td>{{online_monitoring.bushings.cis.c_meas.good.score}}</td>
                                </tr>
                                <tr>
                                    <td>{{online_monitoring.bushings.cis.c_meas.fair.result_small}} &lt; Δ C meas ≤ {{online_monitoring.bushings.cis.c_meas.fair.result_big}}</td>
                                    <td bgcolor="#FFFF00">Fair</td>
                                    <td>{{online_monitoring.bushings.cis.c_meas.fair.score}}</td>
                                </tr>
                                <tr>
                                    <td>{{online_monitoring.bushings.cis.c_meas.poor.result_small}} &lt; Δ C meas ≤ {{online_monitoring.bushings.cis.c_meas.poor.result_big}}</td>
                                    <td bgcolor="#FFC000">Poor</td>
                                    <td>{{online_monitoring.bushings.cis.c_meas.poor.score}}</td>
                                </tr>
                                <tr >
                                    <td>Δ C meas > {{online_monitoring.bushings.cis.c_meas.bad.result}}</td>
                                    <td bgcolor="#FF0000">Bad</td>
                                    <td>{{online_monitoring.bushings.cis.c_meas.bad.score}}</td>
                                </tr>
                            </tbody>
                        </table>
                    </el-col>
                </el-row>
            </el-dialog>

            <el-dialog class="dialog_assess" :visible.sync="option">
                <el-row style="width: 80%;">
                        <el-form :inline-message="true" label-width="200px" size="mini" label-position="left">
                            <span class="bolder">Option settings</span>
                            <el-divider></el-divider>
                            <el-form-item label="Sampling rate">
                                <el-input type="number" v-model="sampleRate">
                                    <template slot="append">s</template>
                                </el-input>
                            </el-form-item>
                        </el-form>
                </el-row>
                <span slot="footer" class="dialog-footer">
                <el-button size="small" @click="option = false">Cancel</el-button>
                <el-button size="small" type="primary" @click="changeRate()">Save</el-button>
            </span>
            </el-dialog>

        </div>
        
    </div>
</template>
<script>
import { mapState } from 'vuex'
import {v4 as uuidv4} from 'uuid'
import { Plotly } from 'vue-plotly'
import * as monitorApi from '@/api/monitoring'
export default {
    components: {
    Plotly
  },
    data () {
        return {
            air : ['CO2', 'CO', 'H2', 'CH4','C2H2','C2H4', 'C2H6', 'C3H6', 'O2', 'N2'],
            option : false,
            sampleRate : '1',
            dataDelta:
            [
                {
                    x: [],
                    y: [],
                    type:"scatter",
                    mode: 'lines+markers',
                    name: "HV Ph.1",
                    line: {
                        color: '#AF0000',
                        width: 3
                    }
                },
                {
                    x: [],
                    y: [],
                    type:"scatter",
                    mode: 'lines+markers',
                    name: "HV Ph.2",
                    line: {
                        color: '#FFAC1C',
                        width: 3
                    }
                },
                {
                    x: [],
                    y: [],
                    type:"scatter",
                    mode: 'lines+markers',
                    name: "HV Ph.3",
                    line: {
                        color: '#00008B',
                        width: 3
                    }
                },
            ],
            layoutDelta:{
                title: "Change of tan delta - Δ Tanδ",
                yaxis : {
                    title: "Δ Tanδ (%)"
                }
            },
            dataC:
            [
                {
                    x: [],
                    y: [],
                    type:"scatter",
                    mode: 'lines+markers',
                    name: "HV Ph.1",
                    line: {
                        color: '#AF0000',
                        width: 3
                    }
                },
                {
                    x: [],
                    y: [],
                    type:"scatter",
                    mode: 'lines+markers',
                    name: "HV Ph.2",
                    line: {
                        color: '#FFAC1C',
                        width: 3
                    }
                },
                {
                    x: [],
                    y: [],
                    type:"scatter",
                    mode: 'lines+markers',
                    name: "HV Ph.3",
                    line: {
                        color: '#00008B',
                        width: 3
                    }
                },
            ],
            layoutC:{
                title: "Change of capacitance - Δ C",
                yaxis : {
                    title: "ΔC (%)"
                }
            },
            form : {},
            openConditionSetting : false,
            openCondition : false,
            ageingShow : true,
            moitureShow : false,
            bushingShow : false,
            partialShow : false,
            dgaShow : false,
            time: '',
            date: '',
            mode : 0,
            online_monitoring: {
                id : uuidv4(),
                assetId: null,
                aois: {
                    ar : '',
                    lc : '',
                },
                moip : {
                    input_data : {
                        wcit: '',
                        tot: '',
                        
                    },
                    cal: {
                        moip: '',
                        ci : ''
                    },
                    cis: {
                        moip: {
                            good : '1',
                            fair: '2',
                            bad: '3'
                        }
                    }
                },
                bushings: {
                    bf : {
                        c_c_hv_ph1:'',
                        c_c_hv_ph2:'',
                        c_c_hv_ph3:'',
                    },
                    
                    deltaC: {
                        hv_ph1: {
                            result: '',
                            ci : '',
                        },
                        hv_ph2: {
                            result: '',
                            ci : '',
                        },
                        hv_ph3:{
                            result: '',
                            ci : '',
                        },
                    },

                    deltaDF :{
                        hv_ph1: {
                            result: '',
                            ci : '',
                        },
                        hv_ph2: {
                            result: '',
                            ci : '',
                        },
                        hv_ph3:{
                            result: '',
                            ci : '',
                        },
                    },
                    cis: {
                        df_change : {
                            good : {
                                result: '1.3',
                                score: '3'
                            },
                            fair: {
                                result_small: '1.3',
                                score: '2',
                                result_big : '2'
                            },
                            poor : {
                                result: '3',
                                score: '1'
                            },
                            bad : {
                                result: '3',
                                score: '0'
                            }
                        },
                        c_meas: {
                            good : {
                                result: '5',
                                score: '3'
                            },
                            fair: {
                                result_small: '5',
                                score: '2',
                                result_big : '7'
                            },
                            poor : {
                                result_small: '7',
                                score: '1',
                                result_big: '10'
                            },
                            bad : {
                                result: '10',
                                score: '0'
                            }
                        }
                    }
                },
                pd : {
                    coc_1 : '',
                    coc_2 : '',
                    coc_3 : '',
                },
                dga : {
                    co2 : {}, co : {}, h2 : {}, ch4 : {}, c2h2 : {},
                    c2h4 : {}, c2h6 : {}, c3h6 : {}, o2 : {}, n2 : {}, 
                },
                bushing_df_worst: '0',
                bushing_df_average: '0',
                bushing_c_worst: '0',
                bushing_c_average: '0',
                condition_mois: '0',
                health_index: '0',
                weight_bushing_df: '0',
                weight_bushing_c: '0',
                weight_mois: '0'
            }
        }
    },

    async beforeMount() {
        const assetId = this.selectedAsset[0].id 
        const rs = await window.electronAPI.getOnlineMonitoringData(assetId)
        if (rs.data.length != 0){
            if (rs.success) {
                const dataOnlineMonitoring = rs.data[0]
                this.online_monitoring = {
                    id: dataOnlineMonitoring.id,
                    asset_id: dataOnlineMonitoring.asset_id,
                    aois: JSON.parse(dataOnlineMonitoring.ageing_insulation),
                    moip: JSON.parse(dataOnlineMonitoring.moisture_insulation),
                    bushings: JSON.parse(dataOnlineMonitoring.bushings_online),
                    pd:JSON.parse(dataOnlineMonitoring.patital_discharge),
                    dga: JSON.parse(dataOnlineMonitoring.dga),
                    bushing_df_worst: dataOnlineMonitoring.bushing_df_worst,
                    bushing_df_average: dataOnlineMonitoring.bushing_df_average,
                    bushing_c_worst: dataOnlineMonitoring.bushing_c_worst,
                    bushing_c_average: dataOnlineMonitoring.bushing_c_average,
                    condition_mois: dataOnlineMonitoring.condition_mois,
                    health_index: dataOnlineMonitoring.health_index,
                    weight_bushing_df: dataOnlineMonitoring.weight_bushing_df,
                    weight_bushing_c: dataOnlineMonitoring.weight_bushing_c,
                    weight_mois: dataOnlineMonitoring.weight_mois,
                    created_on : dataOnlineMonitoring.created_on,
                    create_by : dataOnlineMonitoring.create_by,
                    updated_on : dataOnlineMonitoring.updated_on,
                    updated_by : dataOnlineMonitoring.updated_by
                }
            }
        } else {
            monitorApi.getAllMornitoringByAssetId(assetId).then(async (response) => {
                let dataOnlineMonitoring = response[0]
                console.log(dataOnlineMonitoring)
                this.online_monitoring = {
                    id: dataOnlineMonitoring.id,
                    asset_id: dataOnlineMonitoring.asset_id,
                    aois: JSON.parse(dataOnlineMonitoring.ageing_insulation),
                    moip: JSON.parse(dataOnlineMonitoring.moisture_insulation),
                    bushings: JSON.parse(dataOnlineMonitoring.bushings_online),
                    pd:JSON.parse(dataOnlineMonitoring.patital_discharge),
                    dga: JSON.parse(dataOnlineMonitoring.dga),
                    bushing_df_worst: dataOnlineMonitoring.bushing_df_worst,
                    bushing_df_average: dataOnlineMonitoring.bushing_df_average,
                    bushing_c_worst: dataOnlineMonitoring.bushing_c_worst,
                    bushing_c_average: dataOnlineMonitoring.bushing_c_average,
                    condition_mois: dataOnlineMonitoring.condition_mois,
                    health_index: dataOnlineMonitoring.health_index,
                    weight_bushing_df: dataOnlineMonitoring.weight_bushing_df,
                    weight_bushing_c: dataOnlineMonitoring.weight_bushing_c,
                    weight_mois: dataOnlineMonitoring.weight_mois,
                    created_on : dataOnlineMonitoring.created_on,
                    create_by : dataOnlineMonitoring.create_by,
                    updated_on : dataOnlineMonitoring.updated_on,
                    updated_by : dataOnlineMonitoring.updated_by
                }
            })
        }
    },
    computed: mapState(['selectedAsset']),
    methods: {
        backToManage() {
            const sel = this
            this.$confirm('Do you want to exit?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    sel.$router.push({name: 'manage'})
                })
                .catch(() => {
                    return
                })
        },

        async getOnlineMonitoringData(assetId) {
            const rs = await window.electronAPI.getOnlineMonitoringData(assetId)
            if (typeof rs.data === "undefined"){
                this.mode = 1
            }
        },

        
        async saveOnlineMonitoringData() {
            const assetId = this.selectedAsset[0].id
            await this.getOnlineMonitoringData(assetId)

            if(this.mode === 0) {
                await this.updateOnlineMonitoring()
            }else {
                await this.insertOnlineMonitoring()
            }
        },

        async insertOnlineMonitoring () {
            const assetId = this.selectedAsset[0].id
            let online_monitoring = this.online_monitoring
            
            const rs = await window.electronAPI.insertOnlineMonitoringData(assetId, online_monitoring)
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Insert completed'
                })
                this.$router.push({name: 'manage'})
            } else {
                this.$message.error(rs.message)
            }
        },

        async getData() {
            let dataC = 
            [
                {
                    x: [],
                    y: [],
                    type:"scatter",
                    mode: 'lines+markers',
                    name: "HV Ph.1",
                    line: {
                        color: '#AF0000',
                        width: 3
                    }
                },
                {
                    x: [],
                    y: [],
                    type:"scatter",
                    mode: 'lines+markers',
                    name: "HV Ph.2",
                    line: {
                        color: '#FFAC1C',
                        width: 3
                    }
                },
                {
                    x: [],
                    y: [],
                    type:"scatter",
                    mode: 'lines+markers',
                    name: "HV Ph.3",
                    line: {
                        color: '#00008B',
                        width: 3
                    }
                },
            ]
            let dataDelta = 
            [
                {
                    x: [],
                    y: [],
                    type:"scatter",
                    mode: 'lines+markers',
                    name: "HV Ph.1",
                    line: {
                        color: '#AF0000',
                        width: 3
                    }
                },
                {
                    x: [],
                    y: [],
                    type:"scatter",
                    mode: 'lines+markers',
                    name: "HV Ph.2",
                    line: {
                        color: '#FFAC1C',
                        width: 3
                    }
                },
                {
                    x: [],
                    y: [],
                    type:"scatter",
                    mode: 'lines+markers',
                    name: "HV Ph.3",
                    line: {
                        color: '#00008B',
                        width: 3
                    }
                },
            ]
            monitorApi.getAllMornitoringByAssetId(this.selectedAsset[0].id).then(async (response) => {
                for(let index in response) {
                    let bushing = JSON.parse(response[index].bushings_online)
                    dataC[0].y.push(bushing.deltaC.hv_ph1.result)
                    dataC[1].y.push(bushing.deltaC.hv_ph2.result)
                    dataC[2].y.push(bushing.deltaC.hv_ph3.result)
                    dataC[0].x.push(response[index].created_on)
                    dataC[1].x.push(response[index].created_on)
                    dataC[2].x.push(response[index].created_on)
                }
                for(let index in response) {
                    let bushing = JSON.parse(response[index].bushings_online)
                    dataDelta[0].y.push(bushing.deltaDF.hv_ph1.result)
                    dataDelta[1].y.push(bushing.deltaDF.hv_ph2.result)
                    dataDelta[2].y.push(bushing.deltaDF.hv_ph3.result)
                    dataDelta[0].x.push(response[index].created_on)
                    dataDelta[1].x.push(response[index].created_on)
                    dataDelta[2].x.push(response[index].created_on)
                }
                this.dataDelta = dataDelta
                this.dataC = dataC
            })
            
        },

        async updateOnlineMonitoring () {
            this.online_monitoring.assetId = this.selectedAsset[0].id
            let online_monitoring = this.online_monitoring
            const rs = await window.electronAPI.updateOnlineMonitoringData(online_monitoring)
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Update completed'
                })
                this.$router.push({name: 'manage'})
            } else {
                this.$message.error(rs.message)
            }
        },
        zeroPadding(num, digit) {
            var zero = '';
            for(var i = 0; i < digit; i++) {
                zero += '0';
            }
            return (zero + num).slice(-digit);
        },
        /* eslint-disable */
        updateTime() {
            var week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            var cd = new Date();
            this.time = this.zeroPadding(cd.getHours(), 2) + ':' + this.zeroPadding(cd.getMinutes(), 2) + ':' + this.zeroPadding(cd.getSeconds(), 2)
            this.date = this.zeroPadding(cd.getFullYear(), 4) + '-' + this.zeroPadding(cd.getMonth()+1, 2) + '-' + this.zeroPadding(cd.getDate(), 2) + ' ' + week[cd.getDay()]
        },

        AgeingShow() {
            this.ageingShow = true,
            this.bushingShow = false,
            this.moitureShow = false,
            this.partialShow = false,
            this.dgaShow = false
        },
        MoitureShow() {
            this.ageingShow = false,
            this.bushingShow = false,
            this.moitureShow = true,
            this.partialShow = false,
            this.dgaShow = false
        },
        BushingShow() {
            this.ageingShow = false
            this.bushingShow = true
            this.moitureShow = false
            this.partialShow = false
            this.dgaShow = false
        },
        PartialShow() {
            this.ageingShow = false,
            this.bushingShow = false,
            this.moitureShow = false,
            this.partialShow = true,
            this.dgaShow = false
        },
        DgaShow() {
            this.ageingShow = false,
            this.bushingShow = false,
            this.moitureShow = false,
            this.partialShow = false,
            this.dgaShow = true
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
        },
        getOnlineData() {
            monitorApi.getLastMornitoringByAssetId(this.selectedAsset[0].id).then(async (response) => {
                let dataOnlineMonitoring = response[0]
                this.online_monitoring = {
                    id: dataOnlineMonitoring.id,
                    asset_id: dataOnlineMonitoring.asset_id,
                    aois: JSON.parse(dataOnlineMonitoring.ageing_insulation),
                    moip: JSON.parse(dataOnlineMonitoring.moisture_insulation),
                    bushings: JSON.parse(dataOnlineMonitoring.bushings_online),
                    pd:JSON.parse(dataOnlineMonitoring.patital_discharge),
                    dga: JSON.parse(dataOnlineMonitoring.dga),
                    bushing_df_worst: dataOnlineMonitoring.bushing_df_worst,
                    bushing_df_average: dataOnlineMonitoring.bushing_df_average,
                    bushing_c_worst: dataOnlineMonitoring.bushing_c_worst,
                    bushing_c_average: dataOnlineMonitoring.bushing_c_average,
                    condition_mois: dataOnlineMonitoring.condition_mois,
                    health_index: dataOnlineMonitoring.health_index,
                    weight_bushing_df: dataOnlineMonitoring.weight_bushing_df,
                    weight_bushing_c: dataOnlineMonitoring.weight_bushing_c,
                    weight_mois: dataOnlineMonitoring.weight_mois,
                    created_on : dataOnlineMonitoring.created_on,
                    create_by : dataOnlineMonitoring.create_by,
                    updated_on : dataOnlineMonitoring.updated_on,
                    updated_by : dataOnlineMonitoring.updated_by
                }
            })
        },
        Option() {
            this.option = true
        },
        changeRate() {
            if(!isNaN(parseFloat(this.sampleRate))) {
                setInterval(() => {
                    this.getData()
                    this.getOnlineData()
                }, this.sampleRate * 1000);
                this.getData(),
                this.getOnlineData()
            }
            this.option = false
        }
    },
    mounted () {
        setInterval(() => {
            this.updateTime()
        }, 1000);
        this.updateTime();
    }
}
</script>
<style scoped>
#online-monitoring-data {
    width: calc(100vw);
    height: calc(100vh);
    overflow-y: auto;
    overflow-x: auto;
}
p {
    margin-left: 10px;
}
.rectangle {
    height: calc(100% - 75px);
    width: fit-content;
    background-color: #EDEBEF;
    position: relative;
}
#dga {
    white-space: nowrap;
}

.Good input {
    background: #00CC00;
}

.Fair input {
    background: #ffff00;
}

.Poor input {
    background: #ff9900;
}

.Bad input {
    background: #ff3300;
}
</style>
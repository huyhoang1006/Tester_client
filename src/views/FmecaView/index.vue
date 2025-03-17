<template>
    <div id="fmeca">
        <el-row id="top-bar">
            <el-col :span="24">
                <el-button @click="backToManage" style="box-sizing: border-box; border-right: 1px solid #aeb6bf">
                    <i class="fa-solid fa-circle-arrow-left display-block fa-2x"></i>
                    <div class="mgt-10">Manage</div>
                </el-button>
                <el-button @click="saveFmeca">
                    <i class="fa-solid fa-floppy-disk display-block fa-2x"></i>
                    <div class="mgt-10">Save FMECA</div>
                </el-button>
                <el-button @click="$router.go(-1)" style="box-sizing: border-box">
                    <i class="fa-solid fa-ban display-block fa-2x"></i>
                    <div class="mgt-10">Cancel</div>
                </el-button>
                <el-button style="float: right; text-align: right; width: fit-content; cursor: default">
                    <img src="@/assets/images/logo.png" style="max-height: 40px" />
                </el-button>
            </el-col>
        </el-row>
        <div><br /><br /></div>
        <el-row class="mgb-10" style="margin-left: 10px">
            <el-col>
                <el-button size="mini" type="primary" @click="dialogVisible = true"> <i class="fas fa-setting"></i>TEMPLATE</el-button>
                <el-button size="mini" type="primary" @click="addRow"> <i class="fas fa-setting"></i>ADD FMECA </el-button>
            </el-col>
        </el-row>

        <table class="table-strip-input-data" style="width: 100% overflow: auto;; margin-left: 5px;">
            <thead>
                <tr>
                    <th style="width: 6.5%;" class="no-col">No</th>
                        <th style="width: 26%;">Failure mode</th>
                        <th style="width: 6.5%">S</th>
                        <th style="width: 6.5%;">O</th>
                        <th style="width: 13%;">Condition indicator</th>
                        <th style="width: 22%;">Test</th>
                        <th style="width: 6.5%;">D</th>
                        <th style="width: 5.8%;">RPN</th>
                        <th style="width: 3.6%;"></th>
                        <th style="width: 3.6%;"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in this.fmeca.table_fmeca" :key="index">
                    <td><el-input size="mini" v-model="item.no"></el-input></td>
                    <td><el-input size="mini" v-model="item.failure_mode"></el-input></td>
                    <td><el-input size="mini" type="number" v-model="item.sof"></el-input></td>
                    <td><el-input size="mini" type="number" v-model="item.pof"></el-input></td>
                    <td><el-input size="mini" type="textarea" rows="1" v-model="item.conditional_indicator"></el-input></td>
                    <td>
                        <el-select allow-create filterable style="width: 100%;" size="mini" v-model="item.test" class="m-2" placeholder="Select">
                            <el-option
                                v-for="value in listTest_"  
                                :key="value.value"
                                :label="value.label"
                                :value="value.value">
                            </el-option>
                        </el-select>
                    </td>
                    <td><el-input size="mini" type="number" v-model="item.sot"></el-input></td>
                    <td><el-input size="mini" type="number" v-model="item.rpn" disabled></el-input></td>
                    <td>
                        <el-button size="mini" type="danger" class="w-100" @click="deleteListTem(fmeca.table_fmeca, index)">
                            <i class="fas fa-trash"></i>
                        </el-button>
                    </td>
                    <td>
                        <el-button size="mini" type="primary" class="w-100" @click="addRowTable(fmeca.table_fmeca, index)">
                            <i class="fa-solid fa-plus"></i>
                        </el-button>
                    </td>
                </tr>
            </tbody>
        </table>
        <br>
        <br>
        <br>
        <table v-if="this.fmeca.table_fmeca.length !== 0" class="table-strip-input-data center" style="width: 100%; overflow: auto;">
                <thead>
                    <tr>
                        <th class="no-col">No</th>
                        <th>Transformer Condition Criteria</th>
                        <th>Total RPN</th>
                        <th>RPN Proportion</th>
                        <th>Weighting factor</th>
                    </tr>
                </thead>
                <tbody>
                    <tr :style="{display : fmeca.table_calculate.display.dga}">
                        <td>1</td>
                        <td>DGA main tank</td>
                        <td>{{ parseFloat(fmeca.table_calculate.dmt.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.dmt.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.dmt.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.oil_main_tank }">
                        <td>2</td>
                        <td>Oil test main tank</td>
                        <td>{{ parseFloat(fmeca.table_calculate.otmt.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.otmt.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.otmt.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.thermal }">
                        <td>3</td>
                        <td>Thermal scan</td>
                        <td>{{ parseFloat(fmeca.table_calculate.ts.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.ts.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.ts.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.insulresistance }">
                        <td>4</td>
                        <td>Insulation resistance</td>
                        <td>{{ parseFloat(fmeca.table_calculate.ir.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.ir.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.ir.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.ratio_test  }">
                        <td>5</td>
                        <td>Ratio test</td>
                        <td>{{ parseFloat(fmeca.table_calculate.rt.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.rt.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.rt.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.dc_winding_res  }">
                        <td>6</td>
                        <td>DC winding resistance</td>
                        <td>{{ parseFloat(fmeca.table_calculate.dcwr.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.dcwr.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.dcwr.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.winding_pf_df }">
                        <td>7</td>
                        <td>Winding PF/DF</td>
                        <td>{{ parseFloat(fmeca.table_calculate.w_pf_df.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.w_pf_df.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.w_pf_df.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.bushing_pf_df  }">
                        <td>8</td>
                        <td>Bushing PF/DF</td>
                        <td>{{ parseFloat(fmeca.table_calculate.b_pf_df.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.b_pf_df.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.b_pf_df.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.winding_capa   }">
                        <td>9</td>
                        <td>Winding capacitance</td>
                        <td>{{ parseFloat(fmeca.table_calculate.wc.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.wc.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.wc.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.bushing_c1_capa }">
                        <td>10</td>
                        <td>Bushing C1 capacitance</td>
                        <td>{{ parseFloat(fmeca.table_calculate.b_C1_c.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.b_C1_c.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.b_C1_c.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.Short_circuit_Leakage }">
                        <td>11</td>
                        <td>Short circuit impedance/ Leakage reactance</td>
                        <td>{{ parseFloat(fmeca.table_calculate.scilr.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.scilr.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.scilr.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.FRSL}">
                        <td>12</td>
                        <td>FRSL</td>
                        <td>{{ parseFloat(fmeca.table_calculate.frsl.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.frsl.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.frsl.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.SFRA}">
                        <td>13</td>
                        <td>SFRA</td>
                        <td>{{ parseFloat(fmeca.table_calculate.sfra.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.sfra.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.sfra.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.moisture_content}">
                        <td>14</td>
                        <td>Moisture content (DRA)</td>
                        <td>{{ parseFloat(fmeca.table_calculate.mc.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.mc.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.mc.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.excitation_current }">
                        <td>15</td>
                        <td>Excitation current</td>
                        <td>{{ parseFloat(fmeca.table_calculate.ec.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.ec.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.ec.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.OLTC_scan  }">
                        <td>16</td>
                        <td>OLTC scan</td>
                        <td>{{ parseFloat(fmeca.table_calculate.OLTC_s.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.OLTC_s.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.OLTC_s.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.DGA_LTC   }">
                        <td>17</td>
                        <td>DGA LTC</td>
                        <td>{{ parseFloat(fmeca.table_calculate.DGA_LTC.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.DGA_LTC.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.DGA_LTC.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.Oil_test_LTC }">
                        <td>18</td>
                        <td>Oil test LTC</td>
                        <td>{{ parseFloat(fmeca.table_calculate.o_t_LTC.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.o_t_LTC.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.o_t_LTC.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr :style="{display : fmeca.table_calculate.display.DGA_Bushing }">
                        <td>19</td>
                        <td>DGA Bushing</td>
                        <td>{{ parseFloat(fmeca.table_calculate.DGA_b.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.DGA_b.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.table_calculate.DGA_b.weighting_factor).toFixed(4) }}</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td>Total</td>
                        <td>{{ parseFloat(fmeca.total.total_rpn).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.total.rpn_proportion).toFixed(4) }}</td>
                        <td>{{ parseFloat(fmeca.total.weighting_factor).toFixed(4) }}</td>
                    </tr>
                </tbody>
            </table>
        <el-dialog class="tem"
            :visible.sync="display_template"
            width="100%">
            
            <el-button size="mini" type="primary" style="margin-left: 10px;" plain @click="addRowTem"> <i class="fas fa-setting"></i>ADD ROW </el-button>
            <br>
            <br>
            <table class="table-strip-input-data" style="width: 1550px; margin-left: 10px;">
                <thead>
                    <tr>
                        <th style="width: 6.5%;" class="no-col">No</th>
                        <th style="width: 26%;">Failure mode</th>
                        <th style="width: 6.5%">S</th>
                        <th style="width: 6.5%;">O</th>
                        <th style="width: 13%;">Condition indicator</th>
                        <th style="width: 22%;">Test</th>
                        <th style="width: 6.5%;">D</th>
                        <th style="width: 5.8%;">RPN</th>
                        <th style="width: 3.6%;"></th>
                        <th style="width: 3.6%;"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in this.template" :key="index">
                        <td><el-input size="mini" v-model="item.no"></el-input></td>
                        <td><el-input size="mini" v-model="item.failure_mode"></el-input></td>
                        <td><el-input size="mini" type="number" v-model="item.sof"></el-input></td>
                        <td><el-input size="mini" type="number" v-model="item.pof"></el-input></td>
                        <td><el-input size="mini" type="textarea" rows="1" v-model="item.conditional_indicator"></el-input></td>
                        <td>
                            <el-select allow-create filterable style="width: 100%;" size="mini" v-model="item.test" class="m-2" placeholder="Select">
                                <el-option
                                    v-for="value in listTest_"  
                                    :key="value.value"
                                    :label="value.label"
                                    :value="value.value">
                                </el-option>
                            </el-select>
                        </td>
                        <td><el-input  size="mini" type="number" v-model="item.sot"></el-input></td>
                        <td><el-input size="mini" type="number" v-model="item.rpn" disabled></el-input></td>
                        <td>
                            <el-button size="mini" type="danger" class="w-100" @click="deleteListTem(template, index)">
                                <i class="fas fa-trash"></i>
                            </el-button>
                        </td>
                        <td>
                            <el-button size="mini" type="primary" class="w-100" @click="addRowTable(template, index)">
                                <i class="fa-solid fa-plus"></i>
                            </el-button>
                        </td>
                    </tr>
                </tbody>
                
            </table>
            <br>
            <br>
            <table v-if="this.template.length !== 0" class="table-strip-input-data" style="width: 100%">
                <thead>
                    <tr>
                        <th class="no-col">No</th>
                        <th>Transformer Condition Criteria</th>
                        <th>Total RPN</th>
                        <th>RPN Proportion</th>
                        <th>Weighting factor</th>
                    </tr>
                </thead>
                <tbody>
                    <tr :style="{display : table_calculate.display.dga}">
                        <td>1</td>
                        <td>DGA main tank</td>
                        <td>{{ table_calculate.dmt.total_rpn }}</td>
                        <td>{{ table_calculate.dmt.rpn_proportion }}</td>
                        <td>{{ table_calculate.dmt.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.oil_main_tank }">
                        <td>2</td>
                        <td>Oil test main tank</td>
                        <td>{{ table_calculate.otmt.total_rpn }}</td>
                        <td>{{ table_calculate.otmt.rpn_proportion }}</td>
                        <td>{{ table_calculate.otmt.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.thermal }">
                        <td>3</td>
                        <td>Thermal scan</td>
                        <td>{{ table_calculate.ts.total_rpn }}</td>
                        <td>{{ table_calculate.ts.rpn_proportion }}</td>
                        <td>{{ table_calculate.ts.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.insulresistance }">
                        <td>4</td>
                        <td>Insulation resistance</td>
                        <td>{{ table_calculate.ir.total_rpn }}</td>
                        <td>{{ table_calculate.ir.rpn_proportion }}</td>
                        <td>{{ table_calculate.ir.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.ratio_test  }">
                        <td>5</td>
                        <td>Ratio test</td>
                        <td>{{ table_calculate.rt.total_rpn }}</td>
                        <td>{{ table_calculate.rt.rpn_proportion }}</td>
                        <td>{{ table_calculate.rt.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.dc_winding_res  }">
                        <td>6</td>
                        <td>DC winding resistance</td>
                        <td>{{ table_calculate.dcwr.total_rpn }}</td>
                        <td>{{ table_calculate.dcwr.rpn_proportion }}</td>
                        <td>{{ table_calculate.dcwr.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.winding_pf_df }">
                        <td>7</td>
                        <td>Winding PF/DF</td>
                        <td>{{ table_calculate.w_pf_df.total_rpn }}</td>
                        <td>{{ table_calculate.w_pf_df.rpn_proportion }}</td>
                        <td>{{ table_calculate.w_pf_df.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.bushing_pf_df  }">
                        <td>8</td>
                        <td>Bushing PF/DF</td>
                        <td>{{ table_calculate.b_pf_df.total_rpn }}</td>
                        <td>{{ table_calculate.b_pf_df.rpn_proportion }}</td>
                        <td>{{ table_calculate.b_pf_df.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.winding_capa   }">
                        <td>9</td>
                        <td>Winding capacitance</td>
                        <td>{{ table_calculate.wc.total_rpn }}</td>
                        <td>{{ table_calculate.wc.rpn_proportion }}</td>
                        <td>{{ table_calculate.wc.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.bushing_c1_capa }">
                        <td>10</td>
                        <td>Bushing C1 capacitance</td>
                        <td>{{ table_calculate.b_C1_c.total_rpn }}</td>
                        <td>{{ table_calculate.b_C1_c.rpn_proportion }}</td>
                        <td>{{ table_calculate.b_C1_c.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.Short_circuit_Leakage }">
                        <td>11</td>
                        <td>Short circuit impedance/ Leakage reactance</td>
                        <td>{{ table_calculate.scilr.total_rpn }}</td>
                        <td>{{ table_calculate.scilr.rpn_proportion }}</td>
                        <td>{{ table_calculate.scilr.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.FRSL}">
                        <td>12</td>
                        <td>FRSL</td>
                        <td>{{ table_calculate.frsl.total_rpn }}</td>
                        <td>{{ table_calculate.frsl.rpn_proportion }}</td>
                        <td>{{ table_calculate.frsl.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.SFRA}">
                        <td>13</td>
                        <td>SFRA</td>
                        <td>{{ table_calculate.sfra.total_rpn }}</td>
                        <td>{{ table_calculate.sfra.rpn_proportion }}</td>
                        <td>{{ table_calculate.sfra.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.moisture_content}">
                        <td>14</td>
                        <td>Moisture content (DRA)</td>
                        <td>{{ table_calculate.mc.total_rpn }}</td>
                        <td>{{ table_calculate.mc.rpn_proportion }}</td>
                        <td>{{ table_calculate.mc.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.excitation_current }">
                        <td>15</td>
                        <td>Excitation current</td>
                        <td>{{ table_calculate.ec.total_rpn }}</td>
                        <td>{{ table_calculate.ec.rpn_proportion }}</td>
                        <td>{{ table_calculate.ec.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.OLTC_scan  }">
                        <td>16</td>
                        <td>OLTC scan</td>
                        <td>{{ table_calculate.OLTC_s.total_rpn }}</td>
                        <td>{{ table_calculate.OLTC_s.rpn_proportion }}</td>
                        <td>{{ table_calculate.OLTC_s.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.DGA_LTC   }">
                        <td>17</td>
                        <td>DGA LTC</td>
                        <td>{{ table_calculate.DGA_LTC.total_rpn }}</td>
                        <td>{{ table_calculate.DGA_LTC.rpn_proportion }}</td>
                        <td>{{ table_calculate.DGA_LTC.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.Oil_test_LTC }">
                        <td>18</td>
                        <td>Oil test LTC</td>
                        <td>{{ table_calculate.o_t_LTC.total_rpn }}</td>
                        <td>{{ table_calculate.o_t_LTC.rpn_proportion }}</td>
                        <td>{{ table_calculate.o_t_LTC.weighting_factor }}</td>
                    </tr>
                    <tr :style="{display : table_calculate.display.DGA_Bushing }">
                        <td>19</td>
                        <td>DGA Bushing</td>
                        <td>{{ table_calculate.DGA_b.total_rpn }}</td>
                        <td>{{ table_calculate.DGA_b.rpn_proportion }}</td>
                        <td>{{ table_calculate.DGA_b.weighting_factor }}</td>
                    </tr>
                    <tr>
                        <td></td>
                        <td>Total</td>
                        <td>{{ total.total_rpn }}</td>
                        <td>{{ total.rpn_proportion }}</td>
                        <td>{{ total.weighting_factor }}</td>
                    </tr>
                </tbody>
            </table>

            <template #footer>
            <span style=" margin-top: 20px; width:100%; position: absolute; right: 10px; bottom: 10px;" class="dialog-footer">
                <el-button @click="cancelAddtem">Cancel</el-button>
                <el-button type="primary" @click="saveTemplate">
                Confirm
                </el-button>
            </span>
            </template>
        </el-dialog>

        <el-dialog
            :visible.sync="innerVisible"
            width="30%"
            title="SAVE TEMPLATE"
            >
            <el-form style="text-align: center;" label-width="120px">
                <el-form-item label="Name*">
                    <el-input size="mini" type="Text" v-model="name" />
                </el-form-item>
            </el-form>
            <br>
            <template>
                <span class="dialog-footer">
                    <el-button @click="cancelTemp">Cancel</el-button>
                    <el-button type="primary" @click="saveTemp">
                    Confirm
                    </el-button>
                </span>
            </template>
        </el-dialog>

        <el-dialog 
            :visible.sync="dialogVisible"
            @close="cancelTemplate"
            width="100%"
            class="tem">
            <el-row class="mgb-10" style="margin-left: 10px">
                <el-select @change="getItem()" v-model="nameChosen" class="m-2" placeholder="Select">
                    <el-option
                        v-for="item in nameList"  
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
                <el-button style="margin-left: 10px;" type="primary" @click="addTemplate">ADD</el-button>
            </el-row>
            <div>
                <br />
            </div>
            <table class="table-strip-input-data" style="width: 1550px; margin-left: 10px;">
                <thead>
                    <tr>
                        <th style="width: 6.5%;" class="no-col">No</th>
                        <th style="width: 26%;">Failure mode</th>
                        <th style="width: 6.5%">S</th>
                        <th style="width: 6.5%;">O</th>
                        <th style="width: 13%;">Condition indicator</th>
                        <th style="width: 22%;">Test</th>
                        <th style="width: 6.5%;">D</th>
                        <th style="width: 5.8%;">RPN</th>
                        <th style="width: 3.6%;"></th>
                        <th style="width: 3.6%;"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in this.template_display.data_template" :key="index">
                        <td><el-input size="mini" v-model="item.no"></el-input></td>
                        <td><el-input size="mini" v-model="item.failure_mode"></el-input></td>
                        <td><el-input size="mini" type="number" v-model="item.sof"></el-input></td>
                        <td><el-input size="mini" type="number" v-model="item.pof"></el-input></td>
                        <td><el-input size="mini" type="textarea" rows="1" v-model="item.conditional_indicator"></el-input></td>
                        <td>
                            <el-select allow-create filterable style="width: 100%;" size="mini" v-model="item.test" class="m-2" placeholder="Select">
                                <el-option
                                    v-for="value in listTest_"  
                                    :key="value.value"
                                    :label="value.label"
                                    :value="value.value">
                                </el-option>
                            </el-select>
                        </td>
                        <td><el-input size="mini" type="number" v-model="item.sot"></el-input></td>
                        <td><el-input size="mini" type="number" v-model="item.rpn" disabled></el-input></td>
                        <td>
                            <el-button size="mini" type="danger" class="w-100" @click="deleteListTem(template_display.data_template, index)">
                                <i class="fas fa-trash"></i>
                            </el-button>
                        </td>
                        <td>
                            <el-button size="mini" type="primary" class="w-100" @click="addRowTable(template_display.data_template, index)">
                                <i class="fa-solid fa-plus"></i>
                            </el-button>
                        </td>
                    </tr>
                </tbody>
            </table>
        <br />
        <br />
        <br />
        <br />
        <br />
        <table class="table-strip-input-data" style="min-width: 100%">
            <thead>
                <tr>
                    <th>Transformer Condition Criteria</th>
                    <th>Total RPN</th>
                    <th>RPN Proportion</th>
                    <th>Weighting factor</th>
                </tr>
            </thead>
            <tbody>
                <tr :style="{display : template_display.table_calculate.display.dga}">
                    <td>DGA main tank</td>
                    <td>{{ template_display.table_calculate.dmt.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.dmt.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.dmt.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.oil_main_tank }">
                    <td>Oil test main tank</td>
                    <td>{{ template_display.table_calculate.otmt.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.otmt.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.otmt.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.thermal }">
                    <td>Thermal scan</td>
                    <td>{{ template_display.table_calculate.ts.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.ts.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.ts.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.insulresistance }">
                    <td>Insulation resistance</td>
                    <td>{{ template_display.table_calculate.ir.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.ir.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.ir.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.ratio_test  }">
                    <td>Ratio test</td>
                    <td>{{ template_display.table_calculate.rt.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.rt.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.rt.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.dc_winding_res  }">
                    <td>DC winding resistance</td>
                    <td>{{ template_display.table_calculate.dcwr.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.dcwr.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.dcwr.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.winding_pf_df }">
                    <td>Winding PF/DF</td>
                    <td>{{ template_display.table_calculate.w_pf_df.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.w_pf_df.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.w_pf_df.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.bushing_pf_df  }">
                    <td>Bushing PF/DF</td>
                    <td>{{ template_display.table_calculate.b_pf_df.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.b_pf_df.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.b_pf_df.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.winding_capa   }">
                    <td>Winding capacitance</td>
                    <td>{{ template_display.table_calculate.wc.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.wc.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.wc.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.bushing_c1_capa }">
                    <td>Bushing C1 capacitance</td>
                    <td>{{ template_display.table_calculate.b_C1_c.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.b_C1_c.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.b_C1_c.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.Short_circuit_Leakage }">
                    <td>Short circuit impedance/ Leakage reactance</td>
                    <td>{{ template_display.table_calculate.scilr.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.scilr.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.scilr.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.FRSL}">
                    <td>FRSL</td>
                    <td>{{ template_display.table_calculate.frsl.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.frsl.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.frsl.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.SFRA}">
                    <td>SFRA</td>
                    <td>{{ template_display.table_calculate.sfra.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.sfra.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.sfra.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.moisture_content}">
                    <td>Moisture content (DRA)</td>
                    <td>{{ template_display.table_calculate.mc.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.mc.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.mc.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.excitation_current }">
                    <td>Excitation current</td>
                    <td>{{ template_display.table_calculate.ec.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.ec.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.ec.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.OLTC_scan  }">
                    <td>OLTC scan</td>
                    <td>{{ template_display.table_calculate.OLTC_s.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.OLTC_s.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.OLTC_s.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.DGA_LTC   }">
                    <td>DGA LTC</td>
                    <td>{{ template_display.table_calculate.DGA_LTC.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.DGA_LTC.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.DGA_LTC.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.Oil_test_LTC }">
                    <td>Oil test LTC</td>
                    <td>{{ template_display.table_calculate.o_t_LTC.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.o_t_LTC.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.o_t_LTC.weighting_factor }}</td>
                </tr>
                <tr :style="{display : template_display.table_calculate.display.DGA_Bushing }">
                    <td>DGA Bushing</td>
                    <td>{{ template_display.table_calculate.DGA_b.total_rpn }}</td>
                    <td>{{ template_display.table_calculate.DGA_b.rpn_proportion }}</td>
                    <td>{{ template_display.table_calculate.DGA_b.weighting_factor }}</td>
                </tr>
                <tr>
                    <td>Total</td>
                    <td>{{ parseFloat(template_display.total.total_rpn).toFixed(4) }}</td>
                    <td>{{ parseFloat(template_display.total.rpn_proportion).toFixed(4) }}</td>
                    <td>{{ parseFloat(template_display.total.weighting_factor).toFixed(4) }}</td>
                </tr>
            </tbody>
        </table>
        <br>
        <br> 
        <el-row class="mgb-10" style="margin-left: 10px">
                <el-button @click="cancelTemplate">Cancel</el-button>
                <el-button type="primary" @click="applyTemplate">Apply</el-button>
                <el-button style="position: absolute; right: 0; background-color: red;" type="primary" @click="deleteTemplate">Delete</el-button>
        </el-row>
        </el-dialog>
    </div>

</template>

<script>
import {v4 as uuidv4} from 'uuid'
import * as fmecaApi from '@/api/fmeca'
import listTest from './constant/Test'
import mapTest from './constant/MapTest'

export default {
    data() {
        return {
            mode: '',
            dialogVisible: false,
            display_template : false,
            innerVisible : false,
            nameChosen : "",
            nameList : [],
            fmeca: {
                name : "",
                id: uuidv4(),
                // 1.1 core insulation
                table_fmeca: [],

                table_calculate: {
                    dmt: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    otmt: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    ts: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    ir: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    rt: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    dcwr: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    w_pf_df: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    b_pf_df: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    wc: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    b_C1_c: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    scilr: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    frsl: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    sfra: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    mc: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    ec: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    OLTC_s: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    DGA_LTC: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    o_t_LTC: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    DGA_b: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    display : {
                        dga : '',
                        oil_main_tank : '',
                        thermal : "",
                        insulresistance : '',
                        ratio_test : "",
                        dc_winding_res : "",
                        winding_pf_df : "",
                        bushing_pf_df : "",
                        winding_capa : "",
                        bushing_c1_capa : "",
                        Short_circuit_Leakage : "",
                        FRSL : "",
                        SFRA : "",
                        moisture_content : "",
                        excitation_current : "",
                        OLTC_scan : "",
                        DGA_LTC : "",
                        Oil_test_LTC : "",
                        DGA_Bushing : ""
                    },
                },
                total: {
                    total_rpn: 0,
                    rpn_proportion: 0,
                    weighting_factor: 0
                },
            },
            template : [],
            name : "",
            id : "",
            total: {
                    total_rpn: 0,
                    rpn_proportion: 0,
                    weighting_factor: 0
                },
            table_calculate: {
                    dmt: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    otmt: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    ts: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    ir: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    rt: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    dcwr: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    w_pf_df: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    b_pf_df: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    wc: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    b_C1_c: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    scilr: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    frsl: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    sfra: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    mc: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    ec: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    OLTC_s: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    DGA_LTC: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    o_t_LTC: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    DGA_b: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    data_calc : [],
                    display : {
                        dga : "",
                        oil_main_tank : '',
                        thermal : "",
                        insulresistance : '',
                        ratio_test : "",
                        dc_winding_res : "",
                        winding_pf_df : "",
                        bushing_pf_df : "",
                        winding_capa : "",
                        bushing_c1_capa : "",
                        Short_circuit_Leakage : "",
                        FRSL : "",
                        SFRA : "",
                        moisture_content : "",
                        excitation_current : "",
                        OLTC_scan : "",
                        DGA_LTC : "",
                        Oil_test_LTC : "",
                        DGA_Bushing : ""
                    },
                },
            template_display : {
                id : "",
                name : "",
                total: {
                    total_rpn: 0,
                    rpn_proportion: 0,
                    weighting_factor: 0
                },
                data_template : [],
                data_template_temp : [],
                table_calculate: {
                    dmt: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    otmt: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    ts: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    ir: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    rt: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    dcwr: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    w_pf_df: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    b_pf_df: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    wc: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    b_C1_c: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    scilr: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    frsl: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    sfra: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    mc: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    ec: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    OLTC_s: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    DGA_LTC: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },

                    o_t_LTC: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    DGA_b: {
                        total_rpn: '',
                        rpn_proportion: '',
                        weighting_factor: ''
                    },
                    data_calc : [],
                    display : {
                        dga : '',
                        oil_main_tank : '',
                        thermal : "",
                        insulresistance : '',
                        ratio_test : "",
                        dc_winding_res : "",
                        winding_pf_df : "",
                        bushing_pf_df : "",
                        winding_capa : "",
                        bushing_c1_capa : "",
                        Short_circuit_Leakage : "",
                        FRSL : "",
                        SFRA : "",
                        moisture_content : "",
                        excitation_current : "",
                        OLTC_scan : "",
                        DGA_LTC : "",
                        Oil_test_LTC : "",
                        DGA_Bushing : ""
                    },
                },
            }   
        }
    },

   mounted() {
   },

    async beforeMount() {
        // this.getFmeca()
        const rt = await window.electronAPI.checkFmecaExist()
        if (rt.data.fmeca === undefined) {
            this.mode = 'insert'
            void 0
        } else {
            const getListName = rt.data.fmeca.map(obj => obj.name)
            for(let i=0; i < getListName.length; i++) {
                let data = {
                    label : getListName[i],
                    value : getListName[i]
                }
                this.nameList.push(data)
            }        

            await this.getFmeca()
            
        }
    },
    computed: {
        listTest_() {
            return listTest
        },

        dataTemplate() {
            return this.template_display.data_template
        },

        dataFmecaTable() {
            return this.fmeca.table_fmeca
        }

    },
    watch: {
        template : {
            deep : true,
            immediate : true,
            async handler() {
                await this.calculate(this.template, this.table_calculate, this.total)
            }
        },
        dataTemplate : {
            deep : true,
            immediate : true,
            async handler() {
                await this.calculate(this.template_display.data_template, this.template_display.table_calculate, this.template_display.total)
            }
        },

        dataFmecaTable : {
            deep : true,
            immediate : true,
            async handler() {
                await this.calculate(this.fmeca.table_fmeca, this.fmeca.table_calculate, this.fmeca.total)
            }
        }

    },

    methods: {
        async calculate(data_template, data_table_calc, total) {
            var list = mapTest.map(obj => obj.label)
            data_template.forEach(element => {
                element.rpn = (parseFloat(element.sof) * parseFloat(element.pof) * parseFloat(element.sot)).toFixed(4)
            });
            let list_test = await this.getAllTest(data_template)

            for(let key in data_table_calc.display) {
                data_table_calc.display[key] = "none"
            }
            
            list.forEach(element => {
                data_table_calc[element].total_rpn = ""
                data_table_calc[element].rpn_proportion = ""
                data_table_calc[element].weighting_factor = ""
            })

            list_test.forEach(ele => {
                for(let key in data_table_calc.display) {
                    if(key.toString() === ele.toString()) {
                        data_table_calc.display[key] = ""
                    }
                }
            });

            list_test.forEach(async element => {
                var value = 0
                var listOfTest = mapTest.map(obj => obj.value)
                if(listOfTest.includes(element)) {
                    data_template.forEach(ele => {
                        if(ele.test === element) {
                            if(ele.rpn !== "" && !isNaN(ele.rpn)) {
                                value = parseFloat(value) + parseFloat(ele.rpn)
                            }
                        }
                    })
                    if(!isNaN(value)) {
                        await this.setValueCalc(data_table_calc, value, element)
                    }
                } else {
                    data_template.forEach(ele => {
                        if(ele.test === element) {
                            value = parseFloat(value) + parseFloat(ele.rpn)
                        }
                    })
                    if(!isNaN(value)) {
                        await this.setValueCalc(data_table_calc, value, element)
                    }

                }
            });

            await this.recalc_tablecalc(data_table_calc, total, list)

        },
        async recalc_tablecalc(data, total, list) {
            var result = 0
            list.forEach(element => {
                if(data[element].total_rpn !== "" && !isNaN(data[element].total_rpn)) {
                    result = parseFloat(result) + parseFloat(data[element].total_rpn)
                }
            })
            total.total_rpn = result

            list.forEach(element => {
                if(data[element].total_rpn !== "" && !isNaN(data[element].total_rpn) && parseFloat(total.total_rpn) !== parseFloat(0)) {
                    data[element].rpn_proportion = parseFloat(parseFloat(data[element].total_rpn)/total.total_rpn)
                    if(data[element].rpn_proportion !== "" && !isNaN(data[element].rpn_proportion)) {
                        data[element].weighting_factor = data[element].rpn_proportion * 3.33
                    }
                }
            })

            var rpn_proportion = 0
            list.forEach(element => {
                if(data[element].rpn_proportion !== "" && !isNaN(data[element].rpn_proportion)) {
                    rpn_proportion = parseFloat(rpn_proportion) + parseFloat(data[element].rpn_proportion)
                }
            });

            total.rpn_proportion = rpn_proportion
            total.weighting_factor = total.rpn_proportion * 3.33
        },
        async getAllTest(data) {
            return data.map(obj => obj.test)
        },
        async setValueCalc(data, value, element) {
            var temp = ""
            mapTest.forEach(ele => {
                if(ele.value === element) {
                    temp = ele.label
                }
            })

            if(temp !== "") {
                data[temp].total_rpn = value
            }
            
        },

        async getFmeca() {
            fmecaApi
                .get()
                .then((data) => {
                    this.fmeca = {
                        id: data.id,
                        table_fmeca: JSON.parse(data.table_fmeca),
                        table_calculate: JSON.parse(data.table_calculate),
                        total: JSON.parse(data.total)
                    }
                })
                .catch((error) => {
                    console.log(error.message)
                    this.$message.error(error.message)
                })
        },

        async saveFmeca() {
            const id = this.fmeca.id
            const data = {
                id: this.fmeca.id,
                table_fmeca: JSON.stringify(this.fmeca.table_fmeca),
                table_calculate: JSON.stringify(this.fmeca.table_calculate),
                total: JSON.stringify(this.fmeca.total)
            }
            fmecaApi
                .update(id, data)
                .then(() => {
                    this.$message.success('Successful')
                })
                .catch((error) => {
                    console.log(error.message)
                    this.$message.error(error.message)
                })
        },

        async updateFmecaTest() {
            let fmeca = this.fmeca
            if (this.mode === 'update') {
                const rs = await window.electronAPI.updateFmeca(fmeca)
                if (rs.success) {
                    this.$message({
                        type: 'success',
                        message: 'Update completed'
                    })
                    // this.$router.push({name: 'manage'})
                } else {
                    this.$message.error(rs.message)
                }
            }
            if (this.mode === 'insert') {
                const rs = await window.electronAPI.insertFmeca(fmeca)
                if (rs.success) {
                    this.$message({
                        type: 'success',
                        message: 'Insert completed'
                    })
                    // this.$router.push({name: 'manage'})
                } else {
                    this.$message.error(rs.message)
                }
            }
        },

        async saveFmecaTest() {
            let fmeca = {
                id : uuidv4(),
                name : this.name,
                table_fmeca: this.template,
                table_calculate : this.table_calculate,
                total : this.total
            }

            const rs = await window.electronAPI.insertFmeca(fmeca)
            if (rs.success) {
                    this.$message({
                        type: 'success',
                        message: 'Insert completed'
                    })
                    // this.$router.push({name: 'manage'})
                } else {
                    this.$message.error(rs.message)
                }
        },


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
        addRow() {
            const dataCustom = {
                no: '',
                failure_mode: '',
                sof: '',
                pof: '',
                conditional_indicator: '',
                test: '',
                sot: '',
                rpn: ''
            }

            this.fmeca.table_fmeca.push(dataCustom)
        },
        deleteList(index) {
            this.fmeca.table_fmeca.customize.listData.splice(index, 1)
        },
        sumRpnTest(name_test) {
            const data = this.fmeca.table_fmeca.customize.listData.filter(
                (item) => this.replaceData(item.test.toUpperCase()) === this.replaceData(name_test.toUpperCase())
            )
            if (data.length !== 0) {
                let sum = 0
                for (const index in data) {
                    sum = sum + parseInt(data[index].rpn)
                }
                return sum
            } else {
                return 0
            }
        },
        replaceData(data) {
            let arr = data.split(' ')
            return arr.join('')
        },
        delete_weight(name) {
            if(name === 'dga') {
                this.fmeca.table_calculate.display.dga = 'none'
                this.fmeca.table_calculate.dmt.total_rpn = '0'
                this.recalculate_data()
            } else if(name === 'oil_main_tank') {
                this.fmeca.table_calculate.display.oil_main_tank = 'none'
                this.fmeca.table_calculate.otmt.total_rpn = '0'
                this.recalculate_data()
            } else if(name === 'thermal') {
                this.fmeca.table_calculate.display.thermal = 'none'
                this.fmeca.table_calculate.ts.total_rpn = '0'
                this.recalculate_data()
            } else if(name === 'insulresistance') {
                this.fmeca.table_calculate.display.insulresistance = 'none'
                this.fmeca.table_calculate.ir.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'ratio_test') {
                this.fmeca.table_calculate.display.ratio_test = 'none'
                this.fmeca.table_calculate.rt.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'dc_winding_res') {
                this.fmeca.table_calculate.display.dc_winding_res = 'none'
                this.fmeca.table_calculate.dcwr.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'winding_pf_df') {
                this.fmeca.table_calculate.display.winding_pf_df = 'none'
                this.fmeca.table_calculate.w_pf_df.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'bushing_pf_df') {
                this.fmeca.table_calculate.display.bushing_pf_df = 'none'
                this.fmeca.table_calculate.b_pf_df.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'winding_capa') {
                this.fmeca.table_calculate.display.winding_capa = 'none'
                this.fmeca.table_calculate.wc.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'bushing_c1_capa') {
                this.fmeca.table_calculate.display.bushing_c1_capa = 'none'
                this.fmeca.table_calculate.b_C1_c.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'Short_circuit_Leakage') {
                this.fmeca.table_calculate.display.Short_circuit_Leakage = 'none'
                this.fmeca.table_calculate.scilr.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'FRSL') {
                this.fmeca.table_calculate.display.FRSL = 'none'
                this.fmeca.table_calculate.frsl.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'SFRA') {
                this.fmeca.table_calculate.display.SFRA = 'none'
                this.fmeca.table_calculate.sfra.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'moisture_content') {
                this.fmeca.table_calculate.display.moisture_content = 'none'
                this.fmeca.table_calculate.mc.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'excitation_current') {
                this.fmeca.table_calculate.display.excitation_current = 'none'
                this.fmeca.table_calculate.ec.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'OLTC_scan') {
                this.fmeca.table_calculate.display.OLTC_scan = 'none'
                this.fmeca.table_calculate.OLTC_s.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'DGA_LTC') {
                this.fmeca.table_calculate.display.DGA_LTC = 'none'
                this.fmeca.table_calculate.DGA_LTC.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'Oil_test_LTC') {
                this.fmeca.table_calculate.display.Oil_test_LTC = 'none'
                this.fmeca.table_calculate.o_t_LTC.total_rpn = '0'
                this.recalculate_data()

            } else if(name === 'DGA_Bushing') {
                this.fmeca.table_calculate.display.DGA_Bushing = 'none'
                this.fmeca.table_calculate.DGA_b.total_rpn = '0'
                this.recalculate_data()

            }
        },
        recalculate_data() {
            this.fmeca.total.total_rpn = 0
            this.fmeca.total.rpn_proportion = 0            
            for (let prop1 in this.fmeca.table_calculate) {
                if(prop1 !== 'display') {
                    this.fmeca.total.total_rpn = this.fmeca.total.total_rpn + parseFloat(this.fmeca.table_calculate[prop1]['total_rpn'])
                }
            }
            this.fmeca.total.total_rpn = parseFloat(this.fmeca.total.total_rpn).toFixed(4)

            for (let prop2 in this.fmeca.table_calculate) {
                if(prop2 !== 'display') {
                this.fmeca.table_calculate[prop2]['rpn_proportion'] = parseFloat(
                    this.fmeca.table_calculate[prop2]['total_rpn'] / this.fmeca.total.total_rpn
                )
                this.fmeca.table_calculate[prop2]['weighting_factor'] = parseFloat(this.fmeca.table_calculate[prop2]['rpn_proportion'] * 3.33)

                this.fmeca.total.rpn_proportion = parseFloat(this.fmeca.total.rpn_proportion) + parseFloat(this.fmeca.table_calculate[prop2]['rpn_proportion'])

                this.fmeca.table_calculate[prop2]['rpn_proportion'] = this.fmeca.table_calculate[prop2]['rpn_proportion'].toFixed(4)
                this.fmeca.table_calculate[prop2]['weighting_factor'] = this.fmeca.table_calculate[prop2]['weighting_factor'].toFixed(4)
                this.fmeca.total.rpn_proportion = parseFloat(1).toFixed(4)
                }
            }

            this.fmeca.total.weighting_factor = (this.fmeca.total.rpn_proportion * 3.33).toFixed(4)
        },
        addTemplate() {
            this.display_template = true
            this.dialogVisible = false
        },
        addRowTem() {
            const dataCustom = {
                no: '',
                failure_mode: '',
                sof: '',
                pof: '',
                conditional_indicator: '',
                test: '',
                sot: '',
                rpn: Object.NonNullable
            }
            this.template.push(dataCustom)
        },
        deleteListTem( data ,index) {
            data.splice(index, 1)
        },
        cancelAddtem() {
            this.dialogVisible = true
            this.display_template = false
        },
        saveTemplate() {
            this.innerVisible = true
        },
        async saveTemp() {
            if(this.name !== null & this.name !== "") {
                const sign = await this.checkNameExist();
                if(sign === false) {
                    this.$message({
                        type: 'error',
                        message: 'Name does exist'
                    })
                } else {
                    await this.saveFmecaTest()
                    this.reloadName()
                    this.innerVisible = false
                    this.display_template = false
                    this.name = ""
                }
            } else {
                this.$message({
                        type: 'error',
                        message: 'Name not null or empty'
                    })
            } 
        },
        cancelTemp() {
            this.innerVisible = false
        },
        async getItem() {
                const rt = await window.electronAPI.getFmecaByName(this.nameChosen)
                this.template_display.data_template = JSON.parse(rt.fmeca.table_fmeca)
                this.template_display.total = JSON.parse(rt.fmeca.total)
                this.template_display.data_template_temp = JSON.parse(rt.fmeca.table_fmeca)
                this.template_display.table_calculate = JSON.parse(rt.fmeca.table_calculate)
        },
        async reloadName() {
            this.nameList = []
            const rt = await window.electronAPI.checkFmecaExist()
            const getListName = rt.data.fmeca.map(obj => obj.name)
            for(let i=0; i < getListName.length; i++) {
                let data = {
                    label : getListName[i],
                    value : getListName[i]
                }
                this.nameList.push(data)
            }
        },
        async checkNameExist() {
            var check = true
            const rt = await window.electronAPI.getFmecaName()
            Array.from(rt.fmeca).forEach((element) => {
                if(element.name.toString() === this.name.toString()) {
                    check = false
                    return false
                } 
            })
            return check
        },
        cancelTemplate() {
            this.template_display.data_template = this.template_display.data_template_temp
            this.dialogVisible = false
        },
        async applyTemplate() {
            const fmeca = {
                table_fmeca : this.template_display.data_template,
                table_calculate : this.template_display.table_calculate,
                total : this.template_display.total,
            }
            const rs = await window.electronAPI.updateFmecaByName(fmeca,this.nameChosen)
            if(rs.success === true) {
                this.$message({
                        type: 'success',
                        message: 'Update completed'
                    })
                this.template_display.data_template_temp = this.template_display.data_template
                this.dialogVisible = false 
            }
            else {
                this.$message({
                        type: 'error',
                        message: 'Update uncompleted'
                    })
            }
            this.fmeca.table_fmeca = fmeca.table_fmeca
            this.fmeca.table_calculate = fmeca.table_calculate
            this.fmeca.total = fmeca.total
        },

        async deleteTemplate() {
            const rs = await window.electronAPI.deleteFmecaByName(this.nameChosen)
            if(rs.success === true) {
                this.$message({
                        type: 'success',
                        message: 'Delete completed'
                    })
                await this.reloadName();
                this.nameChosen = ""
                this.template_display.data_template = []
                this.template_display.data_template_temp = []
            }
            else {
                this.$message({
                        type: 'error',
                        message: 'Delete uncompleted'
                    })
            }
        },
        addRowTable(data, index) {
            const row = {
                no: '',
                failure_mode: '',
                sof: '',
                pof: '',
                conditional_indicator: '',
                test: '',
                sot: '',
                rpn: ''
            }
            data.splice(index, 0, row)
        },
    },
}


</script>

<style>
.tem .el-dialog {
    height: auto;
    min-height: 100vh;
}
.center {
    margin-left: auto;
    margin-right: auto;
}

</style>

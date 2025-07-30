<template>
    <div style="width: 100%; overflow: auto; margin-top: 20px;">
        <div style="width: 2400px; margin-bottom: 20px;" label="Bushings">
            <div id="primary-bushings">
                <el-row :gutter="20" class="content">
                    <el-col :span="24" class="col-content">
                        <span style="font-size: 12px;" class="bolder">Primary bushings</span>
                        <el-divider></el-divider>
                        <table style="font-size: 12px; white-space: nowrap;" class="mgt-5 table-strip-input-data">
                            <thead>
                                <tr>
                                    <th>Pos.</th>
                                    <th class="asset-type-col">Asset type</th>
                                    <th>Serial no.</th>
                                    <th>Manufacturer</th>
                                    <th>Manufacturer type</th>
                                    <th>Manufacturer year</th>
                                    <th>Insul. level LL (BIL)</th>
                                    <th>Voltage L-ground</th>
                                    <th>Max. system voltage</th>
                                    <th>Rate current</th>
                                    <th>DF (C1)</th>
                                    <th>Cap. (C1)</th>
                                    <th>DF (C2)</th>
                                    <th>Cap. (C2)</th>
                                    <th class="insulation-type-col">Insulation type</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{{ prim_first }}</td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="bushings.asset_type.prim.fi">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
                                            <el-option label="With test tap" value="With test tap"> </el-option>
                                            <el-option label="Without tap" value="Without tap"> </el-option>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.serial_no.prim.fi"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer.prim.fi"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_type.prim.fi"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_year.prim.fi"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.insull_level.prim.fi">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.voltage_gr.prim.fi">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.max_sys_voltage.prim.fi">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.rate_current.prim.fi">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c1.prim.fi">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c1.prim.fi">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c2.prim.fi">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c2.prim.fi">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select insulation type>" size="mini" v-model="bushings.insulation_type.prim.fi">
                                            <el-option label="Oil-impregnated paper" value="Oil-impregnated paper"> </el-option>
                                            <el-option label="Resin-bonded paper" value="Resin-bonded paper"> </el-option>
                                            <el-option label="Resin-impregnated paper" value="Resin-impregnated paper"> </el-option>
                                            <el-option label="Porcelain dry type" value="Porcelain dry type"> </el-option>
                                            <el-option label="Composite dry type" value="Composite dry type"> </el-option>
                                            <el-option label="Other" value="Other"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>{{ prim_second }}</td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="bushings.asset_type.prim.se">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
                                            <el-option label="With test tap" value="With test tap"> </el-option>
                                            <el-option label="Without tap" value="Without tap"> </el-option>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.serial_no.prim.se"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer.prim.se"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_type.prim.se"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_year.prim.se"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.insull_level.prim.se">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.voltage_gr.prim.se">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.max_sys_voltage.prim.se">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.rate_current.prim.se">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c1.prim.se">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c1.prim.se">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c2.prim.se">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c2.prim.se">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select insulation type>" size="mini" v-model="bushings.insulation_type.prim.se">
                                            <el-option label="Oil-impregnated paper" value="Oil-impregnated paper"> </el-option>
                                            <el-option label="Resin-bonded paper" value="Resin-bonded paper"> </el-option>
                                            <el-option label="Resin-impregnated paper" value="Resin-impregnated paper"> </el-option>
                                            <el-option label="Porcelain dry type" value="Porcelain dry type"> </el-option>
                                            <el-option label="Composite dry type" value="Composite dry type"> </el-option>
                                            <el-option label="Other" value="Other"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                                <tr v-if="this.asset_phase === '3'">
                                    <td>{{ prim_third }}</td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="bushings.asset_type.prim.th">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
                                            <el-option label="With test tap" value="With test tap"> </el-option>
                                            <el-option label="Without tap" value="Without tap"> </el-option>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.serial_no.prim.th"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer.prim.th"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_type.prim.th"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_year.prim.th"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.insull_level.prim.th">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.voltage_gr.prim.th">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.max_sys_voltage.prim.th">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.rate_current.prim.th">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c1.prim.th">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c1.prim.th">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c2.prim.th">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c2.prim.th">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select insulation type>" size="mini" v-model="bushings.insulation_type.prim.th">
                                            <el-option label="Oil-impregnated paper" value="Oil-impregnated paper"> </el-option>
                                            <el-option label="Resin-bonded paper" value="Resin-bonded paper"> </el-option>
                                            <el-option label="Resin-impregnated paper" value="Resin-impregnated paper"> </el-option>
                                            <el-option label="Porcelain dry type" value="Porcelain dry type"> </el-option>
                                            <el-option label="Composite dry type" value="Composite dry type"> </el-option>
                                            <el-option label="Other" value="Other"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                                <tr
                                    v-if="
                                        this.asset_winding_config.prim === 'YN' ||
                                        (this.asset_type === 'Auto w/ tert' && this.asset_phase === '3') ||
                                        (this.asset_type === 'Auto w/o tert' && this.asset_phase === '3')
                                    ">
                                    <td>{{ prim_fourth }}</td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="bushings.asset_type.prim.fo">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
                                            <el-option label="With test tap" value="With test tap"> </el-option>
                                            <el-option label="Without tap" value="Without tap"> </el-option>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.serial_no.prim.fo"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer.prim.fo"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_type.prim.fo"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_year.prim.fo"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.insull_level.prim.fo">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.voltage_gr.prim.fo">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.max_sys_voltage.prim.fo">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.rate_current.prim.fo">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c1.prim.fo">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c1.prim.fo">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c2.prim.fo">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c2.prim.fo">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select insulation type>" size="mini" v-model="bushings.insulation_type.prim.fo">
                                            <el-option label="Oil-impregnated paper" value="Oil-impregnated paper"> </el-option>
                                            <el-option label="Resin-bonded paper" value="Resin-bonded paper"> </el-option>
                                            <el-option label="Resin-impregnated paper" value="Resin-impregnated paper"> </el-option>
                                            <el-option label="Porcelain dry type" value="Porcelain dry type"> </el-option>
                                            <el-option label="Composite dry type" value="Composite dry type"> </el-option>
                                            <el-option label="Other" value="Other"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </el-col>
                </el-row>
            </div>

            <div id="secondary-bushings" class="mgt-20">
                <el-row :gutter="20" class="content">
                    <el-col :span="24" class="col-content">
                        <span style="font-size: 12px;" class="bolder">Secondary bushings</span>
                        <el-divider></el-divider>
                        <table style="font-size: 12px; white-space: nowrap;" class="mgt-5 table-strip-input-data">
                            <thead>
                                <tr>
                                    <th>Pos.</th>
                                    <th class="asset-type-col">Asset type</th>
                                    <th>Serial no.</th>
                                    <th>Manufacturer</th>
                                    <th>Manufacturer type</th>
                                    <th>Manufacturer year</th>
                                    <th>Insul. level LL (BIL)</th>
                                    <th>Voltage L-ground</th>
                                    <th>Max. system voltage</th>
                                    <th>Rate current</th>
                                    <th>DF (C1)</th>
                                    <th>Cap. (C1)</th>
                                    <th>DF (C2)</th>
                                    <th>Cap. (C2)</th>
                                    <th class="insulation-type-col">Insulation type</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="text-transform: lowercase">{{ prim_first }}1</td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="bushings.asset_type.sec.fi">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
                                            <el-option label="With test tap" value="With test tap"> </el-option>
                                            <el-option label="Without tap" value="Without tap"> </el-option>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.serial_no.sec.fi"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer.sec.fi"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_type.sec.fi"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_year.sec.fi"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.insull_level.sec.fi">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.voltage_gr.sec.fi">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.max_sys_voltage.sec.fi">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.rate_current.sec.fi">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c1.sec.fi">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c1.sec.fi">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c2.sec.fi">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c2.sec.fi">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select insulation type>" size="mini" v-model="bushings.insulation_type.sec.f1">
                                            <el-option label="Oil-impregnated paper" value="Oil-impregnated paper"> </el-option>
                                            <el-option label="Resin-bonded paper" value="Resin-bonded paper"> </el-option>
                                            <el-option label="Resin-impregnated paper" value="Resin-impregnated paper"> </el-option>
                                            <el-option label="Porcelain dry type" value="Porcelain dry type"> </el-option>
                                            <el-option label="Composite dry type" value="Composite dry type"> </el-option>
                                            <el-option label="Other" value="Other"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                                <tr
                                    v-if="
                                        (this.asset_type !== 'Auto w/ tert' && this.asset_type === 'Auto w/o tert' && this.asset_phase !== '1') ||
                                        this.asset_type === 'Two-winding' ||
                                        this.asset_type === 'Three-winding'
                                    ">
                                    <td style="text-transform: lowercase">{{ prim_second }}1</td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="bushings.asset_type.sec.se">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
                                            <el-option label="With test tap" value="With test tap"> </el-option>
                                            <el-option label="Without tap" value="Without tap"> </el-option>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.serial_no.sec.se"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer.sec.se"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_type.sec.se"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_year.sec.se"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.insull_level.sec.se">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.voltage_gr.sec.se">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.max_sys_voltage.sec.se">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.rate_current.sec.se">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c1.sec.se">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c1.sec.se" value="">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c2.sec.se">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c2.sec.se">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select insulation type>" size="mini" v-model="bushings.insulation_type.sec.se">
                                            <el-option label="Oil-impregnated paper" value="Oil-impregnated paper"> </el-option>
                                            <el-option label="Resin-bonded paper" value="Resin-bonded paper"> </el-option>
                                            <el-option label="Resin-impregnated paper" value="Resin-impregnated paper"> </el-option>
                                            <el-option label="Porcelain dry type" value="Porcelain dry type"> </el-option>
                                            <el-option label="Composite dry type" value="Composite dry type"> </el-option>
                                            <el-option label="Other" value="Other"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                                <tr v-if="this.asset_phase === '3'">
                                    <td style="text-transform: lowercase">{{ prim_third }}1</td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="bushings.asset_type.sec.th">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
                                            <el-option label="With test tap" value="With test tap"> </el-option>
                                            <el-option label="Without tap" value="Without tap"> </el-option>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.serial_no.sec.th"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer.sec.th"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_type.sec.th"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_year.sec.th"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.insull_level.sec.th">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.voltage_gr.sec.th">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.max_sys_voltage.sec.th">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.rate_current.sec.th">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c1.sec.th">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c1.sec.th">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c2.sec.th">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c2.sec.th">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select insulation type>" size="mini" v-model="bushings.insulation_type.sec.th">
                                            <el-option label="Oil-impregnated paper" value="Oil-impregnated paper"> </el-option>
                                            <el-option label="Resin-bonded paper" value="Resin-bonded paper"> </el-option>
                                            <el-option label="Resin-impregnated paper" value="Resin-impregnated paper"> </el-option>
                                            <el-option label="Porcelain dry type" value="Porcelain dry type"> </el-option>
                                            <el-option label="Composite dry type" value="Composite dry type"> </el-option>
                                            <el-option label="Other" value="Other"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                                <tr v-if="this.asset_winding_config.sec.I === 'YN' || this.asset_winding_config.sec.I === 'ZN'">
                                    <td style="text-transform: lowercase">{{ prim_fourth }}1</td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="bushings.asset_type.sec.fo">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
                                            <el-option label="With test tap" value="With test tap"> </el-option>
                                            <el-option label="Without tap" value="Without tap"> </el-option>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.serial_no.sec.fo"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer.sec.fo"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_type.sec.fo"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_year.sec.fo"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.insull_level.sec.fo">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.voltage_gr.sec.fo">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.max_sys_voltage.sec.fo">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.rate_current.sec.fo">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c1.sec.fo">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c1.sec.fo">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c2.sec.fo">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c2.sec.fo">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select insulation type>" size="mini" v-model="bushings.insulation_type.sec.fo">
                                            <el-option label="Oil-impregnated paper" value="Oil-impregnated paper"> </el-option>
                                            <el-option label="Resin-bonded paper" value="Resin-bonded paper"> </el-option>
                                            <el-option label="Resin-impregnated paper" value="Resin-impregnated paper"> </el-option>
                                            <el-option label="Porcelain dry type" value="Porcelain dry type"> </el-option>
                                            <el-option label="Composite dry type" value="Composite dry type"> </el-option>
                                            <el-option label="Other" value="Other"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </el-col>
                </el-row>
            </div>

            <div
                id="tertiary-bushings"
                v-if="
                    (this.asset_type === 'Three-winding' &&
                        this.asset_winding_config.tert.accessibility !== '_1buried' &&
                        this.asset_winding_config.tert.accessibility !== '_1buriedgrounding') ||
                    this.asset_type === 'Auto w/ tert'
                "
                class="mgt-20">
                <el-row :gutter="20" class="content">
                    <el-col :span="24" class="col-content">
                        <span style="font-size: 12px;" class="bolder">Tertiary bushings</span>
                        <el-divider></el-divider>
                        <table style="font-size: 12px; white-space: nowrap;" class="mgt-5 table-strip-input-data">
                            <thead>
                                <tr>
                                    <th>Pos.</th>
                                    <th class="asset-type-col">Asset type</th>
                                    <th>Serial no.</th>
                                    <th>Manufacturer</th>
                                    <th>Manufacturer type</th>
                                    <th>Manufacturer year</th>
                                    <th>Insul. level LL (BIL)</th>
                                    <th>Voltage L-ground</th>
                                    <th>Max. system voltage</th>
                                    <th>Rate current</th>
                                    <th>DF (C1)</th>
                                    <th>Cap. (C1)</th>
                                    <th>DF (C2)</th>
                                    <th>Cap. (C2)</th>
                                    <th class="insulation-type-col">Insulation type</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-if="
                                        (this.asset_winding_config.tert.accessibility !== '_1accessible' &&
                                            this.asset_winding_config.tert.accessibility !== '_2accessible') ||
                                        this.asset_phase === '3'
                                    ">
                                    <td style="text-transform: lowercase">{{ prim_first }}2</td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="bushings.asset_type.tert.fi">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
                                            <el-option label="With test tap" value="With test tap"> </el-option>
                                            <el-option label="Without tap" value="Without tap"> </el-option>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.serial_no.tert.fi"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer.tert.fi"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_type.tert.fi"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_year.tert.fi"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.insull_level.tert.fi">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.voltage_gr.tert.fi">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.max_sys_voltage.tert.fi">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.rate_current.tert.fi">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c1.tert.fi">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c1.tert.fi">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c2.tert.fi">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c2.tert.fi">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select insulation type>" size="mini" v-model="bushings.insulation_type.tert.f1">
                                            <el-option label="Oil-impregnated paper" value="Oil-impregnated paper"> </el-option>
                                            <el-option label="Resin-bonded paper" value="Resin-bonded paper"> </el-option>
                                            <el-option label="Resin-impregnated paper" value="Resin-impregnated paper"> </el-option>
                                            <el-option label="Porcelain dry type" value="Porcelain dry type"> </el-option>
                                            <el-option label="Composite dry type" value="Composite dry type"> </el-option>
                                            <el-option label="Other" value="Other"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                                <tr
                                    v-if="
                                        this.asset_winding_config.tert.accessibility !== '_1accessible' &&
                                        this.asset_winding_config.tert.accessibility !== '_2accessible'
                                    ">
                                    <td style="text-transform: lowercase">{{ prim_second }}2</td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="bushings.asset_type.tert.se">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
                                            <el-option label="With test tap" value="With test tap"> </el-option>
                                            <el-option label="Without tap" value="Without tap"> </el-option>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.serial_no.tert.se"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer.tert.se"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_type.tert.se"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_year.tert.se"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.insull_level.tert.se">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.voltage_gr.tert.se">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.max_sys_voltage.tert.se">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.rate_current.tert.se">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c1.tert.se">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c1.tert.se">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c2.tert.se">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c2.tert.se">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select insulation type>" size="mini" v-model="bushings.insulation_type.tert.se">
                                            <el-option label="Oil-impregnated paper" value="Oil-impregnated paper"> </el-option>
                                            <el-option label="Resin-bonded paper" value="Resin-bonded paper"> </el-option>
                                            <el-option label="Resin-impregnated paper" value="Resin-impregnated paper"> </el-option>
                                            <el-option label="Porcelain dry type" value="Porcelain dry type"> </el-option>
                                            <el-option label="Composite dry type" value="Composite dry type"> </el-option>
                                            <el-option label="Other" value="Other"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                                <tr v-if="this.asset_phase === '3' && this.asset_winding_config.tert.accessibility !== '_1accessible'">
                                    <td style="text-transform: lowercase">{{ prim_third }}2</td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="bushings.asset_type.tert.th">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
                                            <el-option label="With test tap" value="With test tap"> </el-option>
                                            <el-option label="Without tap" value="Without tap"> </el-option>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.serial_no.tert.th"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer.tert.th"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_type.tert.th"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_year.tert.th"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.insull_level.tert.th">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.voltage_gr.tert.th">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.max_sys_voltage.tert.th">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.rate_current.tert.th">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c1.tert.th">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c1.tert.th">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c2.tert.th">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c2.tert.th">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select insulation type>" size="mini" v-model="bushings.insulation_type.tert.th">
                                            <el-option label="Oil-impregnated paper" value="Oil-impregnated paper"> </el-option>
                                            <el-option label="Resin-bonded paper" value="Resin-bonded paper"> </el-option>
                                            <el-option label="Resin-impregnated paper" value="Resin-impregnated paper"> </el-option>
                                            <el-option label="Porcelain dry type" value="Porcelain dry type"> </el-option>
                                            <el-option label="Composite dry type" value="Composite dry type"> </el-option>
                                            <el-option label="Other" value="Other"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                                <tr
                                    v-if="
                                        (this.asset_winding_config.tert.I === 'YN' ||
                                            this.asset_winding_config.tert.I === 'ZN' ||
                                            this.asset_winding_config.tert.accessibility !== '_3accessible') &&
                                        this.asset_winding_config.prim !== 'YyNa' &&
                                        this.asset_winding_config.tert.I !== 'I'
                                    ">
                                    <td style="text-transform: lowercase">{{ prim_fourth }}2</td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select asset type>" size="mini" v-model="bushings.asset_type.tert.fo">
                                            <el-option label="With potential tap" value="With potential tap"> </el-option>
                                            <el-option label="With test tap" value="With test tap"> </el-option>
                                            <el-option label="Without tap" value="Without tap"> </el-option>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.serial_no.tert.fo"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer.tert.fo"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_type.tert.fo"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="bushings.manufacturer_year.tert.fo"></el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.insull_level.tert.fo">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.voltage_gr.tert.fo">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.max_sys_voltage.tert.fo">
                                            <template slot="append">kV</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.rate_current.tert.fo">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c1.tert.fo">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c1.tert.fo">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.df_c2.tert.fo">
                                            <template slot="append">%</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" type="number" v-model="bushings.cap_c2.tert.fo">
                                            <template slot="append">pF</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-select class="w-100" placeholder="<Select insulation type>" size="mini" v-model="bushings.insulation_type.tert.fo">
                                            <el-option label="Oil-impregnated paper" value="Oil-impregnated paper"> </el-option>
                                            <el-option label="Resin-bonded paper" value="Resin-bonded paper"> </el-option>
                                            <el-option label="Resin-impregnated paper" value="Resin-impregnated paper"> </el-option>
                                            <el-option label="Porcelain dry type" value="Porcelain dry type"> </el-option>
                                            <el-option label="Composite dry type" value="Composite dry type"> </el-option>
                                            <el-option label="Other" value="Other"></el-option>
                                        </el-select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import { WindingConnection } from '@/views/Enum/WindingConnection'
import { PhaseCode } from '@/views/Enum/PhaseCode'
export default {
    name: 'Bushing',
    data() {
        return {
            bushings: {
                id: null,
                asset_type: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    NameOfPos : {
                        prim : {},
                        sec : {},
                        tert : {}
                    },
                    DataShow : {
                        prim : {},
                        sec : {},
                        tert : {}
                    }
                },
                serial_no: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                manufacturer: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                manufacturer_type: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                manufacturer_year: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                insull_level: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                voltage_gr: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                max_sys_voltage: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                rate_current: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                df_c1: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                cap_c1: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                df_c2: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                cap_c2: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                },
                insulation_type: {
                    prim: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    sec: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    },
                    tert: {
                        fi: '',
                        se: '',
                        th: '',
                        fo: ''
                    }
                }
            }
        }
    },
    props: {
        asset_type: String,
        asset_phase: String,
        asset_winding_config: Object,
        asset_bushings_config: Object
    },
    computed: {
        prim_first: function () {
            if (this.asset_winding_config.prim === WindingConnection.I + PhaseCode.B || this.asset_winding_config.prim === WindingConnection.I + PhaseCode.BC) {
                return  PhaseCode.B
            } else if (this.asset_winding_config.prim === WindingConnection.I + PhaseCode.C || this.asset_winding_config.prim === WindingConnection.I + PhaseCode.CA) {
                return PhaseCode.C
            } else if (this.asset_winding_config.prim === 'Ispare' || this.asset_winding_config.prim === '') {
                return '1'
            } else {
                return 'A'
            }
        },

        prim_second: function () {
            if (
                this.asset_winding_config.prim === 'La' ||
                this.asset_winding_config.prim === 'Lb' ||
                this.asset_winding_config.prim === 'Lc'
            ) {
                return 'N'
            } else if (this.asset_winding_config.prim === 'Lab') {
                return 'B'
            } else if (this.asset_winding_config.prim === 'Lbc') {
                return 'C'
            } else if (this.asset_winding_config.prim === 'Lca') {
                return 'A'
            } else if (this.asset_winding_config.prim === '' || this.asset_winding_config.prim === 'Ispare') {
                return '2'
            } else if ((this.asset_type === 'Auto w/ tert' || this.asset_type === 'Auto w/o tert') && this.asset_phase === '1') {
                return 'N'
            } else {
                return 'B'
            }
        },

        prim_third: function () {
            if (this.asset_phase === '3') {
                if (this.asset_winding_config.prim === '') {
                    return '3'
                } else {
                    return 'C'
                }
            } else {
                return ''
            }
        },

        prim_fourth: function () {
            return 'N'
        }
    },
    methods: {
        init() {
            this.bushings = this.asset_bushings_config
        },

        containsOnlyBushing(array1, value) {
            return array1.every((elem) => elem === value)
        },

        checkDupSerialBushing(arraySerial) {
            let dataResult = arraySerial.filter((data) => data !== '')
            if (dataResult.length === 0) {
                return false
            } else {
                return new Set(dataResult).size !== dataResult.length
            }
        }
    },
    watch: {
        bushings: {
            deep: true,
            immediate: true,
            handler() {
                let array = [
                    this.bushings.serial_no.prim.fi,
                    this.bushings.serial_no.prim.se,
                    this.bushings.serial_no.prim.th,
                    this.bushings.serial_no.prim.fo,
                    this.bushings.serial_no.sec.fi,
                    this.bushings.serial_no.sec.se,
                    this.bushings.serial_no.sec.th,
                    this.bushings.serial_no.sec.fo,
                    this.bushings.serial_no.tert.fi,
                    this.bushings.serial_no.tert.se,
                    this.bushings.serial_no.tert.th,
                    this.bushings.serial_no.tert.fo
                ]
                if (!this.containsOnlyBushing(array, '') && this.checkDupSerialBushing(array)) {
                    this.$message({
                        type: 'error',
                        message: 'Serial no in bushing must be unique'
                    })
                } else {
                    this.$emit('input-bushing', this.bushings)
                }
            }
        },
        asset_bushings_config: {
            deep: true,
            immediate: true,
            handler() {
                this.bushings = this.asset_bushings_config
            }
        },
        prim_first : {
            deep: true,
            immediate: true,
            handler : function() {
                this.bushings.asset_type.NameOfPos.prim.fi = this.prim_first
                this.bushings.asset_type.NameOfPos.sec.fi = this.prim_first.toLowerCase() + "1"
                this.bushings.asset_type.NameOfPos.tert.fi = this.prim_first.toLowerCase() + "2"
            }
        },
        prim_second : {
            deep: true,
            immediate: true,
            handler : function() {
                this.bushings.asset_type.NameOfPos.prim.se = this.prim_second
                this.bushings.asset_type.NameOfPos.sec.se = this.prim_second.toLowerCase() + "1"
                this.bushings.asset_type.NameOfPos.tert.se = this.prim_second.toLowerCase() + "2"
            }
        },
        prim_third : {
            deep: true,
            immediate: true,
            handler : function() {
                this.bushings.asset_type.NameOfPos.prim.th = this.prim_third
                this.bushings.asset_type.NameOfPos.sec.th = this.prim_third.toLowerCase() + "1"
                this.bushings.asset_type.NameOfPos.tert.th = this.prim_third.toLowerCase() + "2"
            }
        },
        prim_fourth : {
            deep: true,
            immediate: true,
            handler : function() {
                this.bushings.asset_type.NameOfPos.prim.fo = this.prim_fourth
                this.bushings.asset_type.NameOfPos.sec.fo = this.prim_fourth.toLowerCase() + "1"
                this.bushings.asset_type.NameOfPos.tert.fo = this.prim_fourth.toLowerCase() + "2"
            }
        },
        asset_phase : {
            deep: true,
            immediate: true,
            handler : function() {
                if(this.asset_phase == 3) {
                    this.bushings.asset_type.DataShow.prim.th = true
                }
                if (this.asset_winding_config.prim === 'YN' ||
                                    (this.asset_type === 'Auto w/ tert' && this.asset_phase === '3') ||
                                    (this.asset_type === 'Auto w/o tert' && this.asset_phase === '3')) {
                    this.bushings.asset_type.DataShow.prim.fo = true
                }
                if((this.asset_type !== 'Auto w/ tert' && this.asset_type === 'Auto w/o tert' && this.asset_phase !== '1') ||
                                    this.asset_type === 'Two-winding' ||
                                    this.asset_type === 'Three-winding') {
                    this.bushings.asset_type.DataShow.sec.se = true
                }
                if(this.asset_phase === '3') {
                    this.bushings.asset_type.DataShow.sec.th = true
                }
                if(this.asset_winding_config.sec.I === 'YN' || this.asset_winding_config.sec.I === 'ZN') {
                    this.bushings.asset_type.DataShow.sec.fo  = true
                }
                if((this.asset_winding_config.tert.accessibility !== '_1accessible' &&
                                        this.asset_winding_config.tert.accessibility !== '_2accessible') ||
                                    this.asset_phase === '3') {
                    this.bushings.asset_type.DataShow.tert.fi  = true
                }
                if(this.asset_winding_config.tert.accessibility !== '_1accessible' &&
                                    this.asset_winding_config.tert.accessibility !== '_2accessible') {
                    this.bushings.asset_type.DataShow.tert.se  = true
                }
                if(this.asset_phase === '3' && this.asset_winding_config.tert.accessibility !== '_1accessible') {
                    this.bushings.asset_type.DataShow.tert.th  = true
                }
                if((this.asset_winding_config.tert.I === 'YN' ||
                                        this.asset_winding_config.tert.I === 'ZN' ||
                                        this.asset_winding_config.tert.accessibility !== '_3accessible') &&
                                    this.asset_winding_config.prim !== 'YyNa' &&
                                    this.asset_winding_config.tert.I !== 'I')
                {
                    this.bushings.asset_type.DataShow.tert.fo  = true
                }                
            }
        }

        
    }
}
</script>

<style lang="scss" scoped></style>
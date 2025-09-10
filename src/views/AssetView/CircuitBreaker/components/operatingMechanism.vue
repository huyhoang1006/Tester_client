<template>
    <div id="ratings" class="mgy-5">
        <div class="content-toggle">
            <el-row :gutter="20" class="content">
                <el-col :span="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <span style="font-size: 12px;" class="bolder">Properties</span>
                        <el-divider></el-divider>
                        <el-form-item label="Asset type">
                            <el-select v-model="operatingData.asset_type">
                                <el-option label="<Select asset type>" value="<Select asset type>"> </el-option>
                                <el-option label="Spring" value="Spring"> </el-option>
                                <el-option label="Hydraulic" value="hydraulic"> </el-option>
                                <el-option label="Pneumatic" value="Pneumatic"> </el-option>
                                <el-option label="Motor" value="Motor"> </el-option>
                                <el-option label="Magnetic" value="magnetic"> </el-option>
                                <el-option label="Not supported" value="notSupport"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Serial no.">
                            <el-input v-model="operatingData.serial"></el-input>
                        </el-form-item>
                        <el-form-item label="Manufacturer">
                            <el-input v-model="operatingData.manufacturer"></el-input>
                        </el-form-item>
                        <el-form-item label="Manufacturing year">
                            <el-input v-model="operatingData.manufacturer_year"></el-input>
                        </el-form-item>
                        <el-form-item label="Manufacturer type">
                            <el-input v-model="operatingData.manufacturer_type"></el-input>
                        </el-form-item>
                        <el-form-item label="Asset system code">
                            <el-input v-model="operatingData.asset_system_code"></el-input>
                        </el-form-item>
                        <el-form-item label="Number of trip coils">
                            <el-select @change="changeTripCoil(operatingData.numberTripCoil)" v-model="operatingData.numberTripCoil">
                                <el-option v-for="item in 3" :key="item" :label="item" :value="item"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Number of close coils">
                            <el-select @change="changeCloseCoil(operatingData.numberCloseCoil)" v-model="operatingData.numberCloseCoil">
                                <el-option v-for="item in 3" :key="item + 3" :label="item" :value="item"> </el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :span="12">
                    <el-form :label-width="labelWidth" size="mini" label-position="left">
                        <span style="font-size: 12px;" class="bolder">Comment</span>
                        <el-divider></el-divider>
                        <el-input type="textarea" :rows="5" v-model="operatingData.comment"></el-input>
                    </el-form>
                </el-col>
            </el-row>
            <transition>
            <el-row v-if="operating.asset_type !== '<Select asset type>'" :gutter="20" class="content">
                <el-col :span="18">
                        <table class="table-strip-input-data" style="width: 100%; margin-top: 5%; border: 1px solid;">
                            <thead>
                                <tr>
                                    <th>Component</th>
                                    <th>Rated voltage</th>
                                    <th>Rated current</th>
                                    <th>DC</th>
                                    <th>AC</th>
                                    <th>Frequency</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, index) in operatingData.table[0]" :key="index">
                                    <td>{{ item.tripCoil }}</td>
                                    <td>
                                        <el-input size="mini" v-model="item.ratedVoltage">
                                            <template slot="append">V</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.ratedCurrent">
                                            <template slot="append">V</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="item.acdc">
                                            <el-radio label="DC">&nbsp;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="item.acdc">
                                            <el-radio label="AC">&#160;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.frequency">
                                            <template slot="append">Hz</template>
                                        </el-input>
                                    </td>
                                </tr>
                                <tr v-for="(item, index) in operatingData.table[1]" :key=" index + 'A'">
                                    <td>{{ item.closeCoil }}</td>
                                    <td>
                                        <el-input size="mini" v-model="item.ratedVoltage">
                                            <template slot="append">V</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.ratedCurrent">
                                            <template slot="append">V</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="item.acdc">
                                            <el-radio label="DC">&nbsp;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="item.acdc">
                                            <el-radio label="AC">&#160;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.frequency">
                                            <template slot="append">Hz</template>
                                        </el-input>
                                    </td>
                                </tr>
                                <tr>
                                    <td>{{ operatingData.table[2].component }}</td>
                                    <td>
                                        <el-input size="mini" v-model="operatingData.table[2].ratedVoltage">
                                            <template slot="append">V</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="operatingData.table[2].ratedCurrent">
                                            <template slot="append">V</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="operatingData.table[2].acdc">
                                            <el-radio label="DC">&nbsp;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="operatingData.table[2].acdc">
                                            <el-radio label="AC">&#160;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="operatingData.table[2].frequency">
                                            <template slot="append">Hz</template>
                                        </el-input>
                                    </td>
                                </tr>
                                <transition>
                                <tr v-if="operatingData.asset_type !== 'magnetic'">
                                    <td>{{ operatingData.table[3].component }}</td>
                                    <td>
                                        <el-input size="mini" v-model="operatingData.table[3].ratedVoltage">
                                            <template slot="append">V</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="operatingData.table[3].ratedCurrent">
                                            <template slot="append">V</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="operatingData.table[3].acdc">
                                            <el-radio label="DC">&nbsp;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="operatingData.table[3].acdc">
                                            <el-radio label="AC">&#160;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="operatingData.table[3].frequency">
                                            <template slot="append">Hz</template>
                                        </el-input>
                                    </td>
                                </tr>
                                </transition>
                            </tbody>
                        </table>
                </el-col>
            </el-row>
            </transition>
            <el-row v-if="!['<Select asset type>', 'Spring','Motor','magnetic'].includes(operatingData.asset_type)" style="margin-top: 1%;" class="content">
                <el-col :span="18">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Rated operating pressure">
                            <el-col :span="10">
                                <el-input v-model="operatingData.pa">
                                    <template slot="append">Pa</template>
                                </el-input>
                            </el-col>
                            <el-col :span="2">
                                <div>@</div>
                            </el-col>
                            <el-col :span="10">
                                <el-input v-model="operatingData.Celsius">
                                    <template slot="append">°C</template>
                                </el-input>
                            </el-col>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <el-row style="margin-top: 1%;" class="content">
                <span style="font-size: 12px;" class="bolder">Conversion tables</span>
                <el-divider></el-divider>
            </el-row>
        </div>
    </div>
</template>

<script>
export default {
    name : "operatingMechanism",
    props : {
        operating : {
            type : Object,
            require : true,
        },
    },
    data() {
        return {
            labelWidth : `300px`,
        }
    },
    computed: {
        operatingData() {
            return this.operating
        },
    },
    methods: {
        changeTripCoil(data) {
            if(this.operatingData.table[0].length == 0) {
                for(let i=0; i< data; i++) {
                    this.operatingData.table[0].push({
                        tripCoil : "Trip coil " + `${i + 1}`,
                        ratedVoltage : "",
                        ratedCurrent : "",
                        acdc : "",
                        frequency : ""
                    })
                }
            } else {
                if(this.operatingData.table[0].length < data) {
                    for(let i=this.operatingData.table[0].length; i< data; i++) {
                        this.operatingData.table[0].push({
                            tripCoil : "Trip coil " + `${i + 1}`,
                            ratedVoltage : "",
                            ratedCurrent : "",
                            acdc : "",
                            frequency : ""
                        })
                    }
                } else if(this.operatingData.table[0].length > data) {
                    for(let i=this.operatingData.table[0].length; i> data; i--) {
                        this.operatingData.table[0].pop()
                    }
                }
            }
        },
        changeCloseCoil(data) {
            if(this.operatingData.table[1].length == 0) {
                for(let i=0; i< data; i++) {
                    this.operatingData.table[1].push({
                        closeCoil : "Close coil " + `${i + 1}`,
                        ratedVoltage : "",
                        ratedCurrent : "",
                        acdc : "",
                        frequency : ""
                    })
                }
            } else {
                if(this.operatingData.table[1].length < data) {
                    for(let i=this.operatingData.table[1].length; i< data; i++) {
                        this.operatingData.table[1].push({
                            closeCoil : "Close coil " + `${i + 1}`,
                            ratedVoltage : "",
                            ratedCurrent : "",
                            acdc : "",
                            frequency : ""
                        })
                    }
                } else if(this.operatingData.table[1].length > data) {
                    for(let i=this.operatingData.table[1].length; i> data; i--) {
                        this.operatingData.table[1].pop()
                    }
                }
            }
        },
    },
    beforeMount() {
    }
}
</script>
<style scoped>
.el-select {
    width: 100% !important;
}
table, th, td {
    border: 1px solid !important;
    white-space: nowrap;
    border-color: #808080 !important;
    font-size: 12px !important;
}
table {
    border-collapse: collapse;
}
</style>
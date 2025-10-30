<template>
    <div id="ratings" class="mgy-5">
        <div class="content-toggle">
            <el-row :gutter="20" class="content">
                <el-col :span="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <span style="font-size: 12px;" class="bolder">Properties</span>
                        <el-divider></el-divider>
                        <el-form-item label="type">
                            <el-select v-model="operatingData.type">
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
                            <el-input v-model="operatingData.serial_no"></el-input>
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
                        <el-form-item label="Number of trip coils">
                            <el-select @change="changeTripCoil(operatingData.number_of_trip_coil)" v-model="operatingData.number_of_trip_coil">
                                <el-option v-for="item in 3" :key="item" :label="item" :value="item"> </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="Number of close coils">
                            <el-select @change="changeCloseCoil(operatingData.number_of_close_coil)" v-model="operatingData.number_of_close_coil">
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
                                <tr v-for="(item, index) in operatingData.trip_coil_component" :key="index">
                                    <td>{{ item.component }}</td>
                                    <td>
                                        <el-input size="mini" v-model="item.rated_voltage.value">
                                            <template slot="append">V</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.rated_current.value">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="item.power">
                                            <el-radio label="DC">&nbsp;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="item.power">
                                            <el-radio label="AC">&#160;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.frequency.value">
                                            <template slot="append">Hz</template>
                                        </el-input>
                                    </td>
                                </tr>
                                <tr v-for="(item, index) in operatingData.close_coil_component" :key=" index + 'A'">
                                    <td>{{ item.component }}</td>
                                    <td>
                                        <el-input size="mini" v-model="item.rated_voltage.value">
                                            <template slot="append">V</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.rated_current.value">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="item.power">
                                            <el-radio label="DC">&nbsp;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="item.power">
                                            <el-radio label="AC">&#160;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="item.frequency.value">
                                            <template slot="append">Hz</template>
                                        </el-input>
                                    </td>
                                </tr>
                                <tr>
                                    <td>{{ operatingData.auxiliary_circuits.component }}</td>
                                    <td>
                                        <el-input size="mini" v-model="operatingData.auxiliary_circuits.rated_voltage.value">
                                            <template slot="append">V</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="operatingData.auxiliary_circuits.rated_current.value">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="operatingData.auxiliary_circuits.power">
                                            <el-radio label="DC">&nbsp;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="operatingData.auxiliary_circuits.power">
                                            <el-radio label="AC">&#160;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="operatingData.auxiliary_circuits.frequency.value">
                                            <template slot="append">Hz</template>
                                        </el-input>
                                    </td>
                                </tr>
                                <transition>
                                <tr v-if="operatingData.type !== 'magnetic'">
                                    <td>{{ operatingData.motor.component }}</td>
                                    <td>
                                        <el-input size="mini" v-model="operatingData.motor.rated_voltage.value">
                                            <template slot="append">V</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="operatingData.motor.rated_current.value">
                                            <template slot="append">A</template>
                                        </el-input>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="operatingData.motor.power">
                                            <el-radio label="DC">&nbsp;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-radio-group v-model="operatingData.motor.power">
                                            <el-radio label="AC">&#160;</el-radio>
                                        </el-radio-group>
                                    </td>
                                    <td>
                                        <el-input size="mini" v-model="operatingData.motor.frequency.value">
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
            <el-row v-if="!['<Select asset type>', 'Spring','Motor','magnetic'].includes(operatingData.type)" style="margin-top: 1%;" class="content">
                <el-col :span="18">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Rated operating pressure">
                            <el-col :span="10">
                                <el-input v-model="operatingData.rated_operating_pressure.value">
                                    <template slot="append">Pa</template>
                                </el-input>
                            </el-col>
                            <el-col :span="2">
                                <div>@</div>
                            </el-col>
                            <el-col :span="10">
                                <el-input v-model="operatingData.rated_operating_pressure_temperature.value">
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
            if(this.operatingData.trip_coil_component.length == 0) {
                for(let i=0; i< data; i++) {
                    this.operatingData.trip_coil_component.push({
                        component : "Trip coil " + `${i + 1}`,
                        rated_current: {
                            mrid: '',
                            value: '',
                            unit: 'A'
                        },
                        rated_voltage: {
                            mrid: '',
                            value: '',
                            unit: 'V'
                        },
                        power : "",
                        frequency: {
                            mrid: '',
                            value: '',
                            unit: 'Hz'
                        },
                    })
                }
            } else {
                if(this.operatingData.trip_coil_component.length < data) {
                    for(let i=this.operatingData.trip_coil_component.length; i< data; i++) {
                        this.operatingData.trip_coil_component.push({
                            component : "Trip coil " + `${i + 1}`,
                            rated_voltage : {
                                mrid: '',
                                value: '',
                                unit: 'V'
                            },
                            rated_current : {
                                mrid: '',
                                value: '',
                                unit: 'A'
                            },
                            power : "",
                            frequency : {
                                mrid: '',
                                value: '',
                                unit: 'Hz'
                            }
                        })
                    }
                } else if(this.operatingData.trip_coil_component.length > data) {
                    for(let i=this.operatingData.trip_coil_component.length; i> data; i--) {
                        this.operatingData.trip_coil_component.pop()
                    }
                }
            }
        },
        changeCloseCoil(data) {
            if(this.operatingData.close_coil_component.length == 0) {
                for(let i=0; i< data; i++) {
                    this.operatingData.close_coil_component.push({
                        component : "Close coil " + `${i + 1}`,
                        rated_voltage : {
                            mrid: '',
                            value: '',
                            unit: 'V'
                        },
                        rated_current : {
                            mrid: '',
                            value: '',
                            unit: 'A'
                        },
                        power : "",
                        frequency : {
                            mrid: '',
                            value: '',
                            unit: 'Hz'
                        }
                    })
                }
            } else {
                if(this.operatingData.close_coil_component.length < data) {
                    for(let i=this.operatingData.close_coil_component.length; i< data; i++) {
                        this.operatingData.close_coil_component.push({
                            component : "Close coil " + `${i + 1}`,
                            rated_voltage : {
                                mrid: '',
                                value: '',
                                unit: 'V'
                            },
                            rated_current : {
                                mrid: '',
                                value: '',
                                unit: 'A'
                            },
                            power : "",
                            frequency : {
                                mrid: '',
                                value: '',
                                unit: 'Hz'
                            }
                        })
                    }
                } else if(this.operatingData.close_coil_component.length > data) {
                    for(let i=this.operatingData.close_coil_component.length; i> data; i--) {
                        this.operatingData.close_coil_component.pop()
                    }
                }
            }
        },
    },
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
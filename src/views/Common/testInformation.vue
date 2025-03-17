<template>
    <div style="width: 100%;">    
        <div style="width: 100%;">
            <el-row>
                <el-col :span="6">
                    <div class="margin-side">
                        <div class="bolder">Testing conditions</div>
                        <el-divider></el-divider>
                        <table style="width: 100%;">
                            <tr v-if="$store.state.selectedAsset[0].asset !=='Circuit breaker'">
                                <td class="condition-head">Top oil temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.top_oil_temperature">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="$store.state.selectedAsset[0].asset !=='Circuit breaker'">
                                <td class="condition-head">Bottom oil temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.bottom_oil_temperature">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr>
                                <td class="condition-head">Winding temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.winding_temperature">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr>
                                <td class="condition-head">Reference temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.reference_temperature">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr>
                                <td class="condition-head">Ambient temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.ambient_temperature">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr>
                                <td class="condition-head">Humidity</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.humidity">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr>
                                <td class="condition-head">Weather</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.weather">
                                    </el-input>
                                </td>
                            </tr>
                        </table>
                    </div>
                </el-col>
                <el-col :span="2">
                    <br/>
                </el-col>
                <el-col :span="6">
                    <div  class="margin-side">
                        <div>
                            <span class="bolder">Testing equipment
                                <span class="last-right-parent">
                                    <i @click="addTestingEq()" class="fa-solid fa-plus mgr-10 pointer"></i>
                                </span>
                            </span>
                            <el-divider></el-divider>
                            <div v-for="(item, index) in equipments" :key="index" style="width: 100%;">
                                <div v-if="index != 0">
                                    <i @click="deleteTestingEq(index)" class="fa-solid fa-trash mgr-10 pointer"></i>
                                </div>
                                <el-divider v-if="index != 0" style="width: 100%;"></el-divider>
                                <table>
                                    <tr>
                                        <td class="condition-head">Model</td>
                                        <td>
                                            <el-input size="mini" v-model="item.model">
                                            </el-input>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="condition-head">Serial no.</td>
                                        <td>
                                            <el-input size="mini" v-model="item.serial_no">
                                            </el-input>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="condition-head">Calibration date</td>
                                        <td>
                                            <el-date-picker
                                                v-model="item.calibration_date"
                                                size="mini"
                                                style="width: 100%"
                                                format="MM/dd/yyyy"
                                                value-format="MM/dd/yyyy"
                                                type="date"
                                                placeholder="Pick a day">
                                            </el-date-picker>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                    </div>
                </el-col>
                <el-col :span="2">
                    <br/>
                </el-col>
                <el-col :span="6">
                    <div  class="margin-side">
                        <span class="bolder">Comment </span>
                        <el-divider></el-divider>
                        <el-input type="textarea" rows="5" v-model="testConditions.comment"></el-input>
                        <Attachment :attachment_.sync="attachment_" :title="title" height="120px" @data-attachment = "getDataAttachment"></Attachment>
                    </div>
                    
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import Attachment from '../Common/Attachment.vue';
export default {
    components: {
        Attachment
    },
    name : "testInfomation",
    props: {
        title : String,
        testCondition : {
            type : Object,
            require : true,
            default() {
                return {
                    condition : { 
                        top_oil_temperature : "",
                        bottom_oil_temperature : "",
                        winding_temperature : "",
                        reference_temperature : "",
                        ambient_temperature : "",
                        humidity : "",
                        weather : ""
                    },
                    equipment : [{
                        model : "",
                        serial_no : "",
                        calibration_date : ""
                
                    }],
                    comment : "",
                }
            }
        },
        attachment : []
    },
    data() {
        return {
            attachment_ : [],
            comment_ : ""
        }
    },
    beforeMount() {
        console.log(this.testConditions)
    },    
    methods : {
        getDataAttachment(arr) {
            this.attachment_ = arr
        },
        addTestingEq() {
            this.equipments.push({
                model : "",
                serial_no : "",
                calibration_date : ""
            })
        },
        deleteTestingEq(index) {
            this.equipments.splice(index, 1)
        }
    },
    computed: {
        conditions : function() {
            return this.testCondition.condition
        },
        equipments : function() {
            return this.testCondition.equipment
        },
        testConditions : function() {
            return this.testCondition
        },
    },
    watch : {
        attachment : {
            immediate : true,
            deep : true,
            handler : function() {
                this.attachment_ = this.attachment
            }                
        }
    }
}
</script>
<style scoped>
.condition-head {
    min-width: fit-content;
    width: 60%;
}
.margin-side {
    margin-top: 8%;
}
.margin-bot {
    margin-bottom: 3%;
}

.last-right-parent {
    position: relative;
    float: right;
}
</style>

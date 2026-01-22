<template>
    <div style="width: 100%;">    
        <div style="width: 100%;">
            <el-row :gutter="20">
                <el-col :span="12">
                    <div>
                        <div style="font-size: 12px;" class="bolder">Testing conditions</div>
                        <el-divider></el-divider>
                        <table style="width: 100%;">
                            <tr v-if="assetData.kind !=='Circuit breaker'">
                                <td class="condition-head">Top oil temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.top_oil_temp.value">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="assetData.kind !=='Circuit breaker'">
                                <td class="condition-head">Bottom oil temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.bottom_oil_temp.value">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr>
                                <td class="condition-head">Winding temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.winding_temp.value">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr>
                                <td class="condition-head">Reference temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.reference_temp.value">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr>
                                <td class="condition-head">Ambient temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.ambient_temp.value">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr>
                                <td class="condition-head">Humidity</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.humidity.value">
                                            <template slot="append">%</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr>
                                <td class="condition-head">Weather</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.weather.value">
                                    </el-input>
                                </td>
                            </tr>
                        </table>
                    </div>
                </el-col>
                <el-col :span="12">
                    <div>
                        <div style="font-size: 12px;" class="bolder">Comment </div>
                        <el-divider></el-divider>
                        <el-input type="textarea" rows="5" v-model="testConditions.comment"></el-input>
                        <Attachment :attachment_="attachment_" :title="title" height="120px" @data-attachment = "getDataAttachment"></Attachment>
                    </div>
                    
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import Attachment from '../Common/Attachment.vue';
import { UnitSymbol } from '@/views/Enum/UnitSymbol'
export default {
    components: {
        Attachment
    },
    name : "testInfomation",
    props: {
        title : String,
        data : {
            type : Object,
            require : true,
            default:() => ({})
        },
        attachment : [],
        assetData: {
            type: Object,
            default: () => ({})
        },
    },
    data() {
        return {
            attachment_ : [],
            unitSymbol : UnitSymbol,
        }
    }, 
    methods : {
        getDataAttachment(arr) {
            this.attachment_ = arr
        },
    },
    computed: {
        conditions : function() {
            return this.data.condition
        },
        testConditions : function() {
            return this.data
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

td, th {
    font-size: 12px;
}
</style>

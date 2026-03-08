<template>
    <div style="width: 100%;">    
        <div style="width: 100%;">
            <el-row :gutter="20">
                <el-col :span="12">
                    <div>
                        <div style="font-size: 12px;" class="bolder">Testing conditions</div>
                        <el-divider></el-divider>
                        <table style="width: 100%;">
                            <tr v-if="assetData.properties.kind !== 'Circuit breaker' && assetData.properties.kind !== 'Current transformer' && conditions.top_oil_temp">
                                <td class="condition-head">Top oil temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.top_oil_temp.value">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="assetData.properties.kind !== 'Circuit breaker' && assetData.properties.kind !== 'Current transformer' && conditions.bottom_oil_temp">
                                <td class="condition-head">Bottom oil temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.bottom_oil_temp.value">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.winding_temp">
                                <td class="condition-head">Winding temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.winding_temp.value" @input="validatePositiveNumber($event, 'winding_temp')">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.reference_temp">
                                <td class="condition-head">Reference temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.reference_temp.value" @input="validatePositiveNumber($event, 'reference_temp')">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.ambient_temp">
                                <td class="condition-head">Ambient temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.ambient_temp.value" @input="validateNumber($event, 'ambient_temp')">
                                            <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.humidity">
                                <td class="condition-head">Humidity</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.humidity.value" @input="validatePositiveNumber($event, 'humidity')">
                                            <template slot="append">%</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.weather">
                                <td class="condition-head">Weather</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.weather.value" @input="validateText($event, 'weather')">
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
        validatePositiveNumber(value, field) {
            // Chỉ cho phép số dương (bao gồm số thập phân)
            const regex = /^[0-9]*\.?[0-9]*$/
            if (!regex.test(value)) {
                // Loại bỏ ký tự không hợp lệ
                this.conditions[field].value = value.replace(/[^0-9.]/g, '')
            }
            // Đảm bảo chỉ có một dấu chấm
            const parts = this.conditions[field].value.split('.')
            if (parts.length > 2) {
                this.conditions[field].value = parts[0] + '.' + parts.slice(1).join('')
            }
        },
        validateNumber(value, field) {
            // Cho phép số âm và số dương (bao gồm số thập phân)
            const regex = /^-?[0-9]*\.?[0-9]*$/
            if (!regex.test(value)) {
                // Loại bỏ ký tự không hợp lệ, giữ lại dấu trừ ở đầu
                this.conditions[field].value = value.replace(/[^0-9.-]/g, '')
                // Đảm bảo dấu trừ chỉ ở đầu
                const firstChar = this.conditions[field].value.charAt(0)
                const rest = this.conditions[field].value.slice(1).replace(/-/g, '')
                this.conditions[field].value = firstChar + rest
            }
            // Đảm bảo chỉ có một dấu chấm
            const parts = this.conditions[field].value.split('.')
            if (parts.length > 2) {
                this.conditions[field].value = parts[0] + '.' + parts.slice(1).join('')
            }
        },
        validateText(value, field) {
            // Chỉ cho phép chữ cái, khoảng trắng và một số ký tự đặc biệt thông dụng
            const regex = /^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF]*$/
            if (!regex.test(value)) {
                // Loại bỏ số và ký tự đặc biệt không phải chữ
                this.conditions[field].value = value.replace(/[^a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF]/g, '')
            }
        },
    },
    computed: {
        conditions : function() {
            return this.data.condition || {}
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

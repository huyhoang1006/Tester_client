<template>
    <div class="ti-wrap">
        <div class="ti-row">
            <div class="col-content">
                <section class="ti-card">
                    <div class="ti-header">
                        <i class="fa-solid fa-temperature-half"></i>
                        <span>Testing conditions</span>
                    </div>
                    <div class="ti-body">
                        <table class="ti-conditions">
                            <tr v-if="conditions.top_oil_temp">
                                <td class="condition-head">Top oil temperature</td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="conditions.top_oil_temp.value">
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.bottom_oil_temp">
                                <td class="condition-head">Bottom oil temperature</td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="conditions.bottom_oil_temp.value">
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.winding_temp">
                                <td class="condition-head">Winding temperature</td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="conditions.winding_temp.value">
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.reference_temp">
                                <td class="condition-head">Reference temperature</td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="conditions.reference_temp.value">
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.ambient_temp">
                                <td class="condition-head">Ambient temperature</td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="conditions.ambient_temp.value">
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.humidity">
                                <td class="condition-head">Humidity</td>
                                <td>
                                    <el-input size="mini" type="text" number="positive"
                                        v-model="conditions.humidity.value">
                                        <template slot="append">%</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.weather">
                                <td class="condition-head">Weather</td>
                                <td>
                                    <el-input size="mini" type="text" text v-model="conditions.weather.value">
                                    </el-input>
                                </td>
                            </tr>
                        </table>
                    </div>
                </section>
            </div>
            <div class="col-content ti-col-stack">
                <section class="ti-card ti-comment-card">
                    <div class="ti-header">
                        <i class="fa-solid fa-align-left"></i>
                        <span>Comment</span>
                    </div>
                    <div class="ti-body">
                        <el-input class="ti-comment-input" type="textarea" v-model="testConditions.comment"></el-input>
                    </div>
                </section>
                <Attachment class="ti-attach-card" :attachment_="attachment_" :title="title" height="160px"
                    @data-attachment="getDataAttachment">
                </Attachment>
            </div>
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
    name: "testInfomation",
    props: {
        title: String,
        data: {
            type: Object,
            require: true,
            default: () => ({})
        },
        attachment: [],
        assetData: {
            type: Object,
            default: () => ({})
        },
    },
    data() {
        return {
            attachment_: [],
            unitSymbol: UnitSymbol,
        }
    },
    methods: {
        getDataAttachment(arr) {
            this.attachment_ = arr
        }
    },
    computed: {
        conditions: function () {
            return this.data.condition || {}
        },
        testConditions: function () {
            return this.data
        },

    },
    watch: {
        attachment: {
            immediate: true,
            deep: true,
            handler: function () {
                this.attachment_ = this.attachment
            }
        }
    }
}
</script>
<style scoped>
.ti-wrap {
    width: 100%;
    margin-bottom: 12px;
}

.ti-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 16px;
}

.col-content {
    min-width: 0;
}

.ti-col-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.ti-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.ti-col-stack .ti-comment-card {
    flex: 1;
}

.ti-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 6px 6px 0 0;
    color: #606266;
    font-size: 12px;
    font-weight: 600;
}

.ti-header i {
    color: #909399;
}

.ti-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px;
}

/* Bảng điều kiện: 2 cột label/input, không viền */
.ti-conditions {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 6px;
}

.ti-conditions td {
    font-size: 12px;
    color: #303133;
    padding: 0;
    border: none;
    background: transparent;
}

.condition-head {
    width: 45%;
    min-width: 150px;
    padding-right: 12px !important;
    color: #303133;
}

::v-deep(.ti-conditions .el-input) {
    width: 100%;
}

::v-deep(.ti-conditions .el-input__inner) {
    font-size: 12px !important;
}

/* Comment giãn hết chiều cao card */
.ti-comment-input,
.ti-comment-input ::v-deep(.el-textarea__inner) {
    height: 100%;
}

.ti-comment-input {
    display: flex;
    flex: 1;
}

.ti-comment-input ::v-deep(.el-textarea__inner) {
    min-height: 110px !important;
    resize: vertical;
    font-size: 12px;
}

::v-deep(.ti-attach-card) {
    min-height: 230px;
}

@media (max-width: 767px) {
    .ti-row {
        gap: 10px;
    }

    .ti-header {
        padding: 8px 10px;
    }

    .ti-body {
        padding: 10px;
    }

    .ti-conditions tr {
        display: block;
        margin-bottom: 8px;
    }

    .ti-conditions td {
        display: block;
        width: 100%;
    }

    .condition-head {
        width: 100%;
        padding: 0 0 4px !important;
    }
}
</style>

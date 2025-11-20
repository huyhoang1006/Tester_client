<template>
    <div style="width: 100%;">
        <!-- Properties -->
        <el-row style="width: 100%;" :gutter="20">
            <el-col style="width: 50%;">
                <el-form :inline-message="true" size="mini" :label-width="labelWidth" label-position="left">
                    <span style="font-size: 12px;" class="bolder">Properties</span>
                    <el-divider></el-divider>
                    <el-form-item label="Name">
                        <el-input v-model="propertiesData.name"></el-input>
                    </el-form-item>
                    <el-form-item label="Type">
                        <el-input v-model="propertiesData.type"></el-input>
                    </el-form-item>
                    <el-form-item label="Creation date">
                        <el-date-picker
                            v-model="propertiesData.creation_date"
                            style="width: 100%;"
                            format="MM/dd/yyyy"
                            value-format="MM/dd/yyyy"
                            type="date"
                            placeholder="Pick a day">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="Execution date">
                        <el-date-picker
                            v-model="propertiesData.execution_date"
                            style="width: 100%;"
                            format="MM/dd/yyyy"
                            value-format="MM/dd/yyyy"
                            type="date"
                            placeholder="Pick a day">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="Tested by">
                        <el-input v-model="propertiesData.tested_by"></el-input>
                    </el-form-item>
                    <el-form-item label="Approved by">
                        <el-input v-model="propertiesData.approved_by"></el-input>
                    </el-form-item>
                    <el-form-item label="Approval date">
                        <el-date-picker
                            v-model="propertiesData.approval_date"
                            style="width: 100%;"
                            format="MM/dd/yyyy"
                            value-format="MM/dd/yyyy"
                            type="date"
                            placeholder="Pick a day">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="Test method">
                        <el-select v-model="propertiesData.test_method" style="width: 100%;" filterable>
                            <el-option v-for="item in testMethod" :key="item" :label="item" :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Reference standard">
                        <el-input v-model="propertiesData.standard"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col style="width: 50%;">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <span style="font-size: 12px;" class="bolder">Summary</span>
                    <el-divider></el-divider>
                    <el-input v-model="propertiesData.summary" type="textarea" :rows="5"></el-input>
                </el-form>
                <Attachment :attachment_="this.attachmentData" title="Overview" height="120px" @data-attachment="getDataAttachment"></Attachment>
            </el-col>
        </el-row>

        <!-- location -->
        <div id="location" class="mgy-5">
            <el-row>
                <el-col :span="24">
                    <div style="font-size: 12px;" class="header-toggle">Location</div>
                </el-col>
            </el-row>

            <div class="content-toggle">
                <el-row style="width: inherit;">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item class="asset-item" label="Name">
                            <span class="asset-name">{{ this.locationData.name }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="Address">
                            <span class="asset-name">{{ locationData.address_general }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="City">
                            <span class="asset-name">{{ locationData.city }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="State/Province">
                            <span class="asset-name">{{ locationData.state_or_province }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="Country">
                            <span class="asset-name">{{ locationData.country }}</span>
                        </el-form-item>
                    </el-form>
                </el-row>
            </div>
        </div>

        <!-- asset -->
        <div id="asset" class="mgy-5">
            <el-row>
                <el-col :span="24">
                    <div style="font-size: 12px;" class="header-toggle">Asset</div>
                </el-col>
            </el-row>

            <div class="content-toggle">
                <el-row style="width: inherit;">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item class="asset-item" label="Asset">
                            <span class="asset-name">{{ assetData.properties?.kind || assetData.kind || '' }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="Asset type">
                            <span class="asset-name">{{ assetData.properties?.type || assetData.type || '' }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="Serial number">
                            <span class="asset-name">{{ assetData.properties?.serial_no || assetData.serial_number || assetData.serial_no || '' }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="Manufacturer">
                            <span class="asset-name">{{ productAssetModelData.manufacturer }}</span>
                        </el-form-item>
                    </el-form>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import Attachment from '@/views/Common/Attachment.vue'
import { TestMethod } from '@/views/Enum/TestMethod'
export default {
    components: {
        Attachment
    },
    data() {
        return {
            labelWidth: `${150}px`,
            properties: {
                mrid: '',
                name: '',
                type: '',
                creation_date: '',
                execution_date: '',
                tested_by: '',
                approved_by: '',
                approval_date: '',
                test_method: '',
                ref_standard: ''
            },
            attachmentData : [],
            testMethod : Object.values(TestMethod),
        }
    },
    props: {
        data: {
            type: Object,
            require: true,
            default() {
                return {
                    mrid: '',
                    name: '',
                    type: '',
                    creation_date: '',
                    execution_date: '',
                    tested_by: '',
                    approved_by: '',
                    approval_date: '',
                    test_method: '',
                    ref_standard: ''
                }
            }
        },
        locationData: {
            type: Object,
            require: true,
            default() {
                return {
                    mrid: '',
                    name: '',
                    address: '',
                    city: '',
                    state_province: '',
                    country: ''
                }
            }
        },
        assetData: {
            type: Object,
            require: true,
            default() {
                return {
                    mrid: '',
                    type: '',
                    kind: '',
                    serial_number: '',
                    manufacturer: ''
                }
            }
        },
        productAssetModelData: {
            type: Object,
            require: true,
            default() {
                return {}
            }
        },
        attachment : {
            type: Array,
            default() {
                return []
            }
        }
        
    },
    watch: {
        attachment: {
            handler(newVal) {
                this.attachmentData = newVal
            },
            immediate: true
        }
    },
    computed: {
        propertiesData() {
            return this.data || this.properties;
        }
        
    },
    methods: {
        getDataAttachment(rowData) {
            this.attachmentData = rowData
            this.$emit('update-attachment', this.attachmentData)
        },
    }
}
</script>

<style scoped>

::v-deep .el-form-item__label {
    font-size: 12px;
}

.asset-item >>> .el-form-item__label {
    font-size: 12px;
    border-right: 1px solid #dcdfe6;
    border-bottom: 1px solid #dcdfe6;
    border-top: 1px solid #dcdfe6;
    border-left: 1px solid #dcdfe6;
    padding-left: 5px;
    box-sizing: border-box;
    height: 30px;
}

.asset-item >>> .el-form-item__content {
    font-size: 12px;
    font-weight: bold;
    border-right: 1px solid #dcdfe6;
    border-bottom: 1px solid #dcdfe6;
    border-top: 1px solid #dcdfe6;
    padding-left: 5px;
    box-sizing: border-box;
    height: 30px;
}

.asset-name {
  font-weight: bold;
  font-size: 12px;
}

</style>

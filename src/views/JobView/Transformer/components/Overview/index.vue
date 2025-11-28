<template>
    <div id="overview" style="width: 100%;">
        <!-- Properties -->
        <el-row :gutter="20" style="width: 100%;">
            <el-col style="width: 50%;">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
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
                            style="width: 100%"
                            format="MM/dd/yyyy"
                            value-format="MM/dd/yyyy"
                            type="date"
                            placeholder="Pick a day">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="Execution date">
                        <el-date-picker
                            v-model="propertiesData.execution_date"
                            style="width: 100%"
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
                            style="width: 100%"
                            format="MM/dd/yyyy"
                            value-format="MM/dd/yyyy"
                            type="date"
                            placeholder="Pick a day">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="Ambient condition">
                        <el-input v-model="propertiesData.ambient_condition"></el-input>
                    </el-form-item>
                    <el-form-item label="Testing method">
                        <el-input v-model="propertiesData.testing_method"></el-input>
                    </el-form-item>
                    <el-form-item label="Standard">
                        <el-input v-model="propertiesData.standard"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col style="width: 50%;">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <span style="font-size: 12px;" class="bolder">Summary</span>
                    <el-divider></el-divider>
                    <el-input v-model="propertiesData.summary" type="textarea" :rows="5"></el-input>
                    <Attachment :attachment_="this.attachmentData" title="Overview" height="120px" @data-attachment="getDataAttachment"></Attachment>
                </el-form>
            </el-col>
        </el-row>

        <!-- location -->
        <div id="location" class="mgy-5">
            <el-row>
                <el-col :span="24">
                    <div class="header-toggle">Location</div>
                </el-col>
            </el-row>

             <div class="content-toggle">
                <el-row style="width: inherit;">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item class="asset-item" label="Name">
                            <span class="asset-name">{{ location.name }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="Address">
                            <span class="asset-name">{{ location.address_general }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="City">
                            <span class="asset-name">{{ location.city }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="State/Province">
                            <span class="asset-name">{{ location.state_or_province }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="Country">
                            <span class="asset-name">{{ location.country }}</span>
                        </el-form-item>
                    </el-form>
                </el-row>
            </div>
        </div>

        <!-- asset -->
        <div id="asset" class="mgy-5">
            <el-row>
                <el-col :span="24">
                    <div class="header-toggle">Asset</div>
                </el-col>
            </el-row>

            <div class="content-toggle">
                <el-row style="width: inherit;">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item class="asset-item" label="Asset">
                            <span class="asset-name">{{ assetData.properties.kind }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="Asset type">
                            <span class="asset-name">{{ assetData.properties.type }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="Serial number">
                            <span class="asset-name">{{ assetData.properties.serial_no }}</span>
                        </el-form-item>
                        <el-form-item class="asset-item" label="Manufacturer">
                            <span class="asset-name">{{ assetData.properties.manufacturer }}</span>
                        </el-form-item>
                    </el-form>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script>
import Attachment from '@/views/Common/Attachment.vue'
export default {
    components: {
        Attachment
    },
    data() {
        return {
            labelWidth: `${200}px`,
            attachmentData: []
        }
    },
    props: {
        data: {
            type: Object,
            require: true,
            default() {
                return {
                    id: '',
                    name: '',
                    work_order: '',
                    creation_date: '',
                    execution_date: '',
                    tested_by: '',
                    approved_by: '',
                    approval_date: '',
                    summary: '',
                    ambient_condition: '',
                    testing_method: '',
                    standard: ''
                }
            }
        },
        location: {
            type: Object,
            require: true,
            default() {
                return {
                    id: '',
                    name: '',
                    address: '',
                    city: '',
                    state_province: '',
                    postal_code: '',
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
        attachment: {
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
            return this.data
        }
    },
    methods: {
        getDataAttachment(rowData) {
            this.attachmentData = rowData
            this.$emit('update-attachment', this.attachmentData)
        }
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

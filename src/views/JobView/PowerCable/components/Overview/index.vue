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
                    <el-form-item label="Work order">
                        <el-input v-model="propertiesData.work_order"></el-input>
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
                </el-form>
                <Attachment :attachment_="attachmentData" title="Overview" height="120px" @data-attachment="getDataAttachment"></Attachment>
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
                    <el-col>
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item class="asset-item" label="Name">
                                <span class="asset-name">{{ locationData.name }}</span>
                            </el-form-item>
                            <el-form-item class="asset-item" label="Address">
                                <span class="asset-name">{{ locationData.address }}</span>
                            </el-form-item>
                            <el-form-item class="asset-item" label="City">
                                <span class="asset-name">{{ locationData.city }}</span>
                            </el-form-item>
                            <el-form-item class="asset-item" label="State/Province">
                                <span class="asset-name">{{ locationData.state_province }}</span>
                            </el-form-item>
                            <el-form-item class="asset-item" label="Postal code">
                                <span class="asset-name">{{ locationData.postal_code }}</span>
                            </el-form-item>
                            <el-form-item class="asset-item" label="Country">
                                <span class="asset-name">{{ locationData.country }}</span>
                            </el-form-item>
                        </el-form>
                    </el-col>
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
                    <el-col>
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item class="asset-item" label="Asset">
                                <span class="asset-name">{{ assetData.kind }}</span>
                            </el-form-item>
                            <el-form-item class="asset-item" label="Asset type">
                                <span class="asset-name">{{ assetData.asset_type }}</span>
                            </el-form-item>
                            <el-form-item class="asset-item" label="Serial number">
                                <span class="asset-name">{{ assetData.serial_number }}</span>
                            </el-form-item>
                            <el-form-item class="asset-item" label="Manufacturer">
                                <span class="asset-name">{{ productAssetModelData.manufacturer }}</span>
                            </el-form-item>
                        </el-form>
                    </el-col>
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
            labelWidth: `${200}px`
        }
    },
    props: {
        data: {
            type: Object,
            required: true,
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
        attachmentData: {
            type: Array,
            required: true,
            default: () => []
        },
        locationData: {
            type: Object,
            required: true,
            default: () => ({
                id: '',
                name: '',
                address: '',
                city: '',
                state_province: '',
                postal_code: '',
                country: ''
            })
        },
        assetData: {
            type: Object,
            required: true,
            default: () => ({
                id: '',
                asset: '',
                asset_type: '',
                serial_number: '',
                manufacturer: ''
            })
        },
        productAssetModelData: {
            type: Object,
            required: true,
            default: () => ({})
        },
        parentOrganization: {
            type: Object,
            required: true,
            default: () => ({})
        }
    },
    
    computed: {
        propertiesData() {
            return this.data || this.properties;
        }
    },
    methods: {
        getDataAttachment(attachment) {
            this.$emit('update-attachment', attachment);
        }
    }
}
</script>

<style scoped>
#overview {
    width: calc(100vw - 145px);
    height: calc(100vh - 150px);
    overflow-y: auto;
    overflow-x: hidden;
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

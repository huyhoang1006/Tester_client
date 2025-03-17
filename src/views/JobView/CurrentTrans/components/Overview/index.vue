<template>
    <div id="overview">
        <!-- Properties -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Properties</span>
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
            <el-col :span="8">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Summary</span>
                    <el-divider></el-divider>
                    <el-input v-model="propertiesData.summary" type="textarea" :rows="11"></el-input>
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
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Name">
                                {{ location.name }}
                            </el-form-item>
                            <el-form-item label="Address">
                                {{ location.address }}
                            </el-form-item>
                            <el-form-item label="City">
                                {{ location.city }}
                            </el-form-item>
                            <el-form-item label="State/Province">
                                {{ location.state_province }}
                            </el-form-item>
                            <el-form-item label="Postal code">
                                {{ location.postal_code }}
                            </el-form-item>
                            <el-form-item label="Country">
                                {{ location.country }}
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
                <el-row :gutter="20">
                    <el-col :span="8">
                        <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                            <el-form-item label="Asset">
                                {{ asset.asset }}
                            </el-form-item>
                            <el-form-item label="Asset type">
                                {{ asset.asset_type }}
                            </el-form-item>
                            <el-form-item label="Serial number">
                                {{ asset.serial_no }}
                            </el-form-item>
                            <el-form-item label="Manufacturer">
                                {{ asset.manufacturer }}
                            </el-form-item>
                        </el-form>
                    </el-col>
                </el-row>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            labelWidth: `${200}px`
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
        asset: {
            type: Object,
            require: true,
            default() {
                return {
                    id: '',
                    asset: '',
                    asset_type: '',
                    serial_number: '',
                    manufacturer: ''
                }
            }
        }
    },
    computed: {
        propertiesData() {
            return this.data
        }
    }
}
</script>

<style>
#overview {
    width: calc(100vw - 145px);
    height: calc(100vh - 150px);
    overflow-y: auto;
    overflow-x: hidden;
}
</style>

<template>
    <div id="location">
        <el-row id="top-bar">
            <el-col :span="24">
                <el-button @click="backToManage" style="box-sizing: border-box; border-right: 1px solid #aeb6bf">
                    <i class="fa-solid fa-circle-arrow-left display-block fa-2x"></i>
                    <div class="mgt-10">Manage</div>
                </el-button>
                <el-button :disabled="disable">
                    <i class="fa-solid fa-floppy-disk display-block fa-2x"></i>
                    <div class="mgt-10">Save Location</div>
                </el-button>
                <el-button style="float: right; text-align: right; width: fit-content; cursor: default">
                    <img src="@/assets/images/logo.png" style="max-height: 40px" />
                </el-button>
            </el-col>
        </el-row>
        <el-row style="height: fit-content;" :gutter="20" id="main-content">
            <div style="font-weight: bold; margin-left: 10px; margin-top: 10px; margin-bottom: 10px;">LOCATION (Level 4)</div>
            <hr color="black" style="margin-bottom: 20px;" />
            <el-col :span="8" class="col-content">
                <el-form ref="ruleForm" :rules="rules" :model="properties" :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Properties</span>
                    <el-divider></el-divider>
                    <el-form-item label="Type" prop="type">
                        <el-select style="width: 100%;" filterable allow-create v-model="properties.type">
                            <el-option v-for="item in typeList" :key="item" :label="item" :value="item"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Name" prop="name">
                        <el-input v-model="properties.name"></el-input>
                    </el-form-item>
                    <el-form-item label="Address">
                        <el-input v-model="properties.address"></el-input>
                    </el-form-item>
                    <el-form-item label="City">
                        <el-input v-model="properties.city"></el-input>
                    </el-form-item>
                    <el-form-item label="State/Province">
                        <el-input v-model="properties.state_province"></el-input>
                    </el-form-item>
                    <el-form-item label="Country">
                        <el-select style="width: 100%;" filterable v-model="properties.country">
                            <el-option v-for="item in countryData" :key="item" :label="item" :value="item"> </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="Geo coordinates">
                        <el-input v-model="properties.geo_coordinates"></el-input>
                    </el-form-item>
                    <el-form-item label="Location system code">
                        <el-input v-model="properties.location_system_code"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8" class="col-content">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Contact person</span>
                    <el-divider></el-divider>
                    <el-form-item label="Name">
                        <el-input v-model="contact_person.name"></el-input>
                    </el-form-item>
                    <el-form-item label="Phone no.1">
                        <el-input type="number" v-model="contact_person.phone_no1"></el-input>
                    </el-form-item>
                    <el-form-item label="Phone no.2">
                        <el-input type="number" v-model="contact_person.phone_no2"></el-input>
                    </el-form-item>
                    <el-form-item label="Fax no">
                        <el-input type="number" v-model="contact_person.fax_no"></el-input>
                    </el-form-item>
                    <el-form-item label="Email">
                        <el-input v-model="contact_person.email"></el-input>
                    </el-form-item>
                    <el-form-item label="Department">
                        <el-input v-model="contact_person.department"></el-input>
                    </el-form-item>
                    <el-form-item label="Position">
                        <el-input v-model="contact_person.posoition"></el-input>
                    </el-form-item>
                </el-form>
            </el-col>
            <el-col :span="8" class="col-content">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Comment </span>
                    <el-divider style="margin: 5px 0"></el-divider>
                    <el-input type="textarea" rows="5" v-model="properties.comment"></el-input>
                    <!-- <el-form-item label="Company">
                        <el-input v-model="company.company"></el-input>
                    </el-form-item>
                    <el-form-item label="Department">
                        <el-input v-model="company.department"></el-input>
                    </el-form-item>
                    <el-form-item label="Address">
                        <el-input v-model="company.address"></el-input>
                    </el-form-item>
                    <el-form-item label="City">
                        <el-input v-model="company.city"></el-input>
                    </el-form-item>
                    <el-form-item label="State/Province">
                        <el-input v-model="company.state_province"></el-input>
                    </el-form-item>
                    <el-form-item label="Postal code">
                        <el-input type="number" v-model="company.postal_code"></el-input>
                    </el-form-item>
                    <el-form-item label="Country">
                        <el-input v-model="company.country"></el-input>
                    </el-form-item>
                    <el-form-item label="Phone no">
                        <el-input type="number" v-model="company.phone_no"></el-input>
                    </el-form-item>
                    <el-form-item label="Fax no">
                        <el-input type="number" v-model="company.fax_no"></el-input>
                    </el-form-item>
                    <el-form-item label="Email">
                        <el-input type="email" v-model="company.email"></el-input>
                    </el-form-item> -->
                </el-form>
            </el-col>
        </el-row>
        <el-row style="height: fit-content;" :gutter="20" id="main-content">
            <div style="font-weight: bold; margin-left: 10px; margin-top: 20px; margin-bottom: 10px;">VOLTAGE LEVEL (Level 5)</div>
            <hr color="black" style="margin-bottom: 20px;" />
            <el-col :span="8" class="col-content">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <el-form-item label="Voltage">
                        <el-select filterable allow-create v-model="voltage">
                            <el-option v-for="item in voltageList" :key="item" :label="item" :value="item"> </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </el-col> 
        </el-row>
        <div style="float: right; margin: 50px;">
            <el-button @click="$router.push({name : 'manage'})" type="danger">Cancel</el-button>
            <el-button @click="nextLocation()" type="primary">Next</el-button>
        </div>
    </div>
</template>
<script>
import {country} from '../ConstantAsset/index'
export default {
    name : "locationInsertView",
    data() {
        return {
            rules: {
                name: [{required: true, message: 'Please input location name', trigger: 'blur'}],
                type: [{required: true, message: 'Please input location type', trigger: 'blur'}]
            },
            countryData : [],
            message : "",
            saved: false,
            labelWidth: `${200}px`,
            disable : true,
            properties: {
                id: '',
                ownerId : '',
                name: '',
                region: '',
                division: '',
                area: '',
                plant: '',
                address: '',
                city: '',
                state_province: '',
                postal_code: '',
                country: 'Vietnam',
                geo_coordinates: '',
                location_system_code: '',
                mode : 'location',
                refId : '',
                comment: ''
            },
            typeList : ["HV substation", "UHV substation", "Charging station", "Rooftop Solar", "Solar PP", "Wind PP", "Hydro PP", "Wind and solar PP", "Distribution substation",
                "Power Plant", "Cement Plant", "Steel Plant", "Contract number"],
            contact_person: {
                name: '',
                phone_no1: '',
                phone_no2: '',
                fax_no: '',
                email: ''
            },
            company : {
            },
            voltage : '',
            copyOwner : [{}],
            voltageList : ['500 kV', '220 kV', '110 kV', '35 kV', '26 kV', '22 kV', '21 kV', '15.75 kV', '13.8 kV', '10 kV', '6.6 kV', '0.4 kV']
        }
    },
    beforeMount() {
        if(this.$route.query.dataLocation != undefined) {
            var dataLocation = JSON.parse(JSON.stringify(this.$route.query.dataLocation))
            this.voltage = dataLocation.voltage
            this.properties = dataLocation.properties
            this.contact_person = dataLocation.contact_person
            this.company = dataLocation.company
        }
        if(this.$route.query.copyOwner != undefined) {
            this.copyOwner = JSON.parse(JSON.stringify(this.$route.query.copyOwner))
        }
    },
    methods : {
        backToManage() {
            this.$confirm('Do you want to exit?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    this.$router.push({name: 'manage'})
                })
                .catch(() => {
                    return
                })
        },
        nextLocation() {
            var dataLocation = {
                properties : this.properties,
                contact_person : this.contact_person,
                company : this.company,
                voltage : this.voltage
            }
            this.$router.push({name: 'owner', query : {dataLocation : dataLocation, copyOwner : this.copyOwner }})
        }, 
    },
    mounted() {
        this.countryData = country.default
    },
}
</script>
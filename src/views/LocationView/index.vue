<template>
    <div id="location">
        <el-row style="height: fit-content;" :gutter="20" id="main-content">
            <el-col :span="8" class="col-content">
                <el-form v-if="(mode == 'edit' && (properties.mode == 'location' || properties.mode == 'feeder') || mode == 'add' || mode=='feederAdd')" ref="ruleForm" :rules="rules" 
                :model="properties" :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Location</span>
                    <el-divider></el-divider>
                    <el-form-item label="Name" prop="name">
                        <el-input v-model="properties.name"></el-input>
                    </el-form-item>
                    <el-form-item label="Type" prop="type">
                        <el-select style="width: 100%;" filterable allow-create v-model="properties.type">
                            <el-option v-for="item in typeList" :key="item" :label="item" :value="item"> </el-option>
                        </el-select>
                    </el-form-item>
                    <!-- <el-form-item label="Region">
                        <el-input v-model="properties.region"></el-input>
                    </el-form-item>
                    <el-form-item label="Division">
                        <el-input v-model="properties.division"></el-input>
                    </el-form-item>
                    <el-form-item label="Area">
                        <el-input v-model="properties.area"></el-input>
                    </el-form-item>
                    <el-form-item label="Plant">
                        <el-input v-model="properties.plant"></el-input>
                    </el-form-item> -->
                    <el-form-item label="Address">
                        <el-input v-model="properties.address"></el-input>
                    </el-form-item>
                    <el-form-item label="City">
                        <el-input v-model="properties.city"></el-input>
                    </el-form-item>
                    <el-form-item label="State/Province">
                        <el-input v-model="properties.state_province"></el-input>
                    </el-form-item>
                    <!-- <el-form-item label="Postal code">
                        <el-input type="number" v-model="properties.postal_code"></el-input>
                    </el-form-item> -->
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
                <el-form v-if="(mode =='edit' && properties.mode == 'voltage') || mode == 'voltageAdd'" ref="ruleForm" :rules="rules" :model="properties" :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                    <span class="bolder">Location</span>
                    <el-divider></el-divider>
                    <el-form-item label="Name" prop="name">
                        <el-select style="width: 100%;" filterable allow-create v-model="properties.name">
                            <el-option v-for="item in voltageList" :key="item" :label="item" :value="item"> </el-option>
                        </el-select>
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
                        <el-input v-model="contact_person.position"></el-input>
                    </el-form-item>
                    <!-- <span class="bolder">Comment </span>
                    <el-divider></el-divider>
                    <el-input type="textarea" rows="5" v-model="properties.comment"></el-input>
                    <Attachment :attachment_="this.Attachment" title="location" height="120px" @data-attachment = "getDataAttachment"></Attachment> -->

                </el-form>
            </el-col>
            <el-col :span="8" class="col-content">
                <el-form :label-width="labelWidth" size="mini" label-position="left">
                    <!-- <span class="bolder">Company</span>
                    <el-divider style="margin: 5px 0"></el-divider>
                    <el-form-item label="Company">
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
                    <span class="bolder">Comment </span>
                    <el-divider></el-divider>
                    <el-input type="textarea" rows="5" v-model="properties.comment"></el-input>
                    <Attachment v-if="!['add', 'voltageAdd', 'feederAdd', 'dup'].includes(mode)" :attachment_="this.Attachment" title="location" height="120px" @data-attachment = "getDataAttachment"></Attachment>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import mixin from './mixin'
import Attachment from '../Common/Attachment.vue';
import {country} from '../ConstantAsset/index' 
export default {
  components: { Attachment },
    name: 'LocationView',
    mixins: [mixin],
    data() {
        return {
            message : "",
            mode: this.$constant.ADD,
            location_id: null,
            saved: false,
            labelWidth: `${200}px`,
            rules: {
                name: [{required: true, message: 'Please input location name', trigger: 'blur'}],
                type: [{required: true, message: 'Please input location type', trigger: 'blur'}]
            },
            typeList : ["HV substation", "UHV substation", "Charging station", "Rooftop Solar", "Solar PP", "Wind PP", "Hydro PP", "Wind and solar PP", "Distribution substation",
                "Power Plant", "Cement Plant", "Steel Plant", "Contract number"],
            countryData : [],
            voltageList : ['500 kV', '220 kV', '110 kV', '35 kV', '26 kV', '22 kV', '21 kV', '15.75 kV', '13.8 kV', '10 kV', '6.6 kV', '0.4 kV']
        }
    },
    beforeMount() {
    },
    mounted() {
        this.countryData = country.default
    },
    methods: {
        getDataAttachment(rowData) {
            this.Attachment = rowData
        },
    },
}
</script>

<style lang="scss" scoped>
#location {
    width: 100%;
    height: 100%;
}

.col-content {
    height: 100%;
}

.last-right-parent {
    position: relative;
    float: right;
}
</style>

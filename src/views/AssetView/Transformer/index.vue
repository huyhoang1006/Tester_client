<template>
    <div>
        <div style="width: calc(100% - 20px)">
            <el-button @click="switchData('Transformer')" size="mini" style="width: calc(50% / 3);" type="primary">Transformer</el-button>
            <el-button @click="switchData('Bushings')" size="mini" style="width: calc(50% / 3 - 10px);" type="primary">Bushings</el-button>
            <el-button @click="switchData('Tap changer')" size="mini" style="width: calc(50% / 3 - 10px);" type="primary">Tap changer</el-button>
        </div>
        <div>
            <div v-if="this.switch == 'Transformer'">
                <!-- Properties -->
                <property :signMode="signMode" @setUpdate="setUpdate" :updateNew='updateNew' :update="update" @editManu="editManu" :title="title" @createAdd="updateShowAdd" :manufact="manufacturerCustom" @reloadManu="reloadManu()" :data="properties" :disabled="disabled"></property>

                <!-- Winding configuration -->
                <!-- <winding-configuration :data="winding_configuration" :properties="properties"></winding-configuration> -->

                <!-- Ratings -->
                <!-- <rating :data="ratings" :properties="properties"></rating> -->

                <!-- Impedances -->
                <!-- <impedance :data="impedances" :properties="properties" :tap-changers="tapChangers"></impedance> -->

                <!-- Others -->
                <!-- <other :data="others" :properties="properties"></other> -->
            </div>
            <div v-else-if="this.switch == 'Bushings'">
                
            </div>
            <div v-else>
                
            </div>

            <!-- Bushings -->
                <!-- <bushing
                    :asset_type="properties.asset_type"
                    :asset_phase="winding_configuration.phases"
                    :asset_winding_config="winding_configuration.vector_group"
                    :asset_bushings_config="bushings_config"
                    @input-bushing="onInputBushing">
                </bushing> -->
            <!-- Tab changers -->
                <!-- <tap-changer :properties="properties" :data="tapChangers"></tap-changer> -->
        </div>
        <manufacturerAdd :dataProperties="dataProperties" :showAdd.sync="showAdd" @backSign="backSign()" @backSignUpdate="backSignUpdate" :title="title" :modeManu="modeManu"></manufacturerAdd>

    </div>
</template>

<script>
/* eslint-disable */
import WindingConfiguration from './components/WindingConfiguration'
import Bushing from './components/Bushing'
import TapChanger from './components/TapChanger'
import Property from './components/Property'
import Rating from './components/Rating'
import Impedance from './components/Impedance'
import Other from './components/Other'
import mixin from './mixin'
import manufacturerAdd from '@/views/Common/ManufacturerAdd.vue'

export default {
    name: 'AssetView',
    props : {
        ownerData : {
            type : Object,
            required : true
        },
        sideData : {
            type : String,
            required : true
        }
    },
    components: {
        WindingConfiguration,
        Bushing,
        TapChanger,
        Property,
        Rating,
        Impedance,
        Other,
        manufacturerAdd
    },
    mixins: [mixin],
    data() {
        return {
            signMode : this.sideData,
            mode: this.$constant.ADD,
            asset_id: null,
            saved: false,
            input1 : '',
            showAdd : false,
            title : 'transformer',
            manufacturerCustom : [],
            modeManu : 'insert',
            dataProperties : {},
            updateNew : '',
            update : false,
            switch : 'Transformer'
        }
    },

    async beforeMount() {
        // let rs = await window.electronAPI.getManufacturerByType(this.title)
        // if(rs.success) {
        //     this.manufacturerCustom = rs.data.map(e => e.name)
        // }
    },

    methods: {
        onInputBushing(bushings_config_arr) {
            this.bushings_config = bushings_config_arr
        },
        updateShowAdd(sign) {
            this.showAdd = sign
        },
        async editManu(item) {
            let rs = await window.electronAPI.getManufacturerByName(item)
            if(rs.success) {
                this.dataProperties = rs.data[0]
                this.showAdd = true
                this.modeManu = 'edit'
            }
        },
        async backSign(sign) {
            this.showAdd = sign
            let rs = await await window.electronAPI.getManufacturerByType(this.title)
            if(rs.success) {
                this.manufacturerCustom = rs.data.map(e => e.name)
            }
            this.modeManu = 'insert'
        },
        async backSignUpdate(dataUpdate) {
            this.showAdd = false
            let rs = await await window.electronAPI.getManufacturerByType(this.title)
            if(rs.success) {
                this.manufacturerCustom = rs.data.map(e => e.name)
            }
            this.modeManu = 'insert'
            this.update = true
            this.updateNew = dataUpdate
        },
        async setUpdate(check) {
            this.update = check
        },
        async reloadManu() {
            let rs = await await window.electronAPI.getManufacturerByType(this.title)
            if(rs.success) {
                this.manufacturerCustom = rs.data.map(e => e.name)
            }
        },
        async switchData(data) {
            this.switch = data
        }
    }
}
</script>

<style lang="scss" scoped>
#asset {
    width: 100%;
    height: 100%;
}

table,
td,
th {
    border: 1px solid;
}

table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
}

th,
td {
    padding: 0px 10px;
    height: 30px;
}
</style>

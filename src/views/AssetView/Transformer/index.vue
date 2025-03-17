<template>
    <div id="asset">
        <div style="position: fixed; width: 100%; top: 38px; z-index: 1">
            <el-row id="top-bar">
                <el-col :span="24">
                    <el-button @click="backToManage" style="box-sizing: border-box; border-right: 1px solid #aeb6bf">
                        <i class="fa-solid fa-circle-arrow-left display-block fa-2x"></i>
                        <div class="mgt-10">Manage</div>
                    </el-button>
                    <el-button @click="saveAsset">
                        <i class="fa-solid fa-floppy-disk display-block fa-2x"></i>
                        <div class="mgt-10">Save Asset</div>
                    </el-button>
                    <el-button @click="onCancel" style="box-sizing: border-box">
                        <i class="fa-solid fa-ban display-block fa-2x"></i>
                        <div class="mgt-10">Cancel</div>
                    </el-button>
                    <el-button style="float: right; text-align: right; width: fit-content; cursor: default">
                        <img src="@/assets/images/logo.png" style="max-height: 40px" />
                    </el-button>
                </el-col>
            </el-row>
        </div>
        <div style="margin-top: 100px;">
            <el-row :gutter="20" id="main-content" style="padding: 0; z-index: 0;">
                <el-tabs type="card" class="w-100 h-100">
                    <!-- Transformer -->
                    <el-tab-pane :label="properties.asset">
                        <!-- Properties -->
                        <property @setUpdate="setUpdate" :updateNew='updateNew' :update="update" @editManu="editManu" :title="title" @createAdd="updateShowAdd" :manufact="manufacturerCustom" @reloadManu="reloadManu()" :data="properties" :disabled="disabled"></property>

                        <!-- Winding configuration -->
                        <winding-configuration :data="winding_configuration" :properties="properties"></winding-configuration>

                        <!-- Ratings -->
                        <rating :data="ratings" :properties="properties"></rating>

                        <!-- Impedances -->
                        <impedance :data="impedances" :properties="properties" :tap-changers="tapChangers"></impedance>

                        <!-- Others -->
                        <other :data="others" :properties="properties"></other>

                    </el-tab-pane>

                    <!-- Bushings -->
                    <el-tab-pane label="Bushings">
                        <bushing
                            :asset_type="properties.asset_type"
                            :asset_phase="winding_configuration.phases"
                            :asset_winding_config="winding_configuration.vector_group"
                            :asset_bushings_config="bushings_config"
                            @input-bushing="onInputBushing">
                        </bushing>
                    </el-tab-pane>

                    <!-- Tab changers -->
                    <el-tab-pane label="Tap changers">
                        <tap-changer :properties="properties" :data="tapChangers"></tap-changer>
                    </el-tab-pane>
                </el-tabs>
            </el-row>
        </div>
        <manufacturerAdd :dataProperties="dataProperties" :showAdd.sync="showAdd" @backSign="backSign()" @backSignUpdate="backSignUpdate" :title="title" :modeManu="modeManu"></manufacturerAdd>

    </div>
</template>

<script>
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
            update : false
        }
    },

    async beforeMount() {
        let rs = await window.electronAPI.getManufacturerByType(this.title)
        if(rs.success) {
            this.manufacturerCustom = rs.data.map(e => e.name)
        }
    },

    mounted() {},
    methods: {
        onInputBushing(bushings_config_arr) {
            this.bushings_config = bushings_config_arr
        },
        onCancel() {
            this.$router.go(-1)
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

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
                    <el-tab-pane label="Circuit breaker">
                        <cirBreakProperty @setUpdate="setUpdate" :updateNew='updateNew' :update="update" @editManu="editManu" :title="title" :properties.sync="properties" @createAdd="updateShowAdd" :manufact="manufacturerCustom" @reloadManu="reloadManu()"></cirBreakProperty>
                        <circuitBreakering :properties="properties" :circuitBreakering.sync="circuitBreaker"></circuitBreakering>
                        <cirBreakRating :ratings.sync="ratings"></cirBreakRating>
                        <contactSystem :contactSys.sync="contactSys"></contactSystem>
                        <others :others="others"></others>
                    </el-tab-pane>
                    <el-tab-pane label="Operating mechanism">
                        <operatingMechanism v-if="operating.table" :operating.sync="operating"></operatingMechanism>
                    </el-tab-pane>
                    <el-tab-pane label="Assessment limits">
                        <AssessmentLimit :assessLimits.sync="assessmentLimits"></AssessmentLimit>
                    </el-tab-pane>
                </el-tabs>
            </el-row>
        </div>
        <manufacturerAdd :dataProperties="dataProperties" :showAdd.sync="showAdd" @backSign="backSign()" @backSignUpdate="backSignUpdate" :title="title" :modeManu="modeManu"></manufacturerAdd>
    </div>
</template>

<script>
import mixin from '../CircuitBreaker/mixin'
import cirBreakProperty from '../CircuitBreaker/components/properties.vue'
import cirBreakRating from '../CircuitBreaker/components/ratings.vue'
import circuitBreakering from '../CircuitBreaker/components/circuitBreaker.vue'
import contactSystem from '../CircuitBreaker/components/contactSystem.vue'
import others from '../CircuitBreaker/components/others.vue'
import operatingMechanism from '../CircuitBreaker/components/operatingMechanism.vue'
import AssessmentLimit from '../CircuitBreaker/components/assessmentLimits.vue'
import manufacturerAdd from '@/views/Common/ManufacturerAdd.vue'

export default {
    name: 'circuitBreaker',
    components: {
        cirBreakProperty,
        cirBreakRating,
        circuitBreakering,
        contactSystem,
        others,
        operatingMechanism,
        AssessmentLimit,
        manufacturerAdd
    },
    data() {
        return {
            mode: this.$constant.ADD,
            asset_id: null,
            saved: false,
            showAdd : false,
            title : 'circuit',
            manufacturerCustom : [],
            modeManu : 'insert',
            dataProperties : {},
            updateNew : '',
            update : false
        }
    },
    mixins : [mixin],
    mounted() {},
    async beforeMount() {
        let rs = await window.electronAPI.getManufacturerByType(this.title)
        if(rs.success) {
            this.manufacturerCustom = rs.data.map(e => e.name)
        }
    },
    methods: {
        onCancel() {
            this.$router.go(-1)
        },
        backToManage() {
            const sel = this
            this.$confirm('Do you want to exit?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(async () => {
                    sel.$router.push({name: 'manage'})
                })
                .catch(() => {
                    return
                })
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

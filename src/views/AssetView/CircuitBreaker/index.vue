<template>
    <div id="asset">
        <div style="min-height: 500px; display: flex; flex-direction: column;">
            <div style="width: calc(100% - 20px)">
                <el-button @click="switchData('circuitBreaker')" size="mini" style="width: calc(50% / 4);" type="primary">Circuit Breaker</el-button>
                <el-button @click="switchData('operatingMechanism')" size="mini" style="width: calc(50% / 4 - 10px);" type="primary">Operating</el-button>
                <el-button @click="switchData('assessmentLimit')" size="mini" style="width: calc(50% / 4 - 10px);" type="primary">Assessment</el-button>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; margin-top: 20px">
                <div v-if="this.switch == 'circuitBreaker'">
                    <cirBreakProperty @setUpdate="setUpdate" :updateNew='updateNew' :update="update" @editManu="editManu" :title="title" :properties.sync="properties" @createAdd="updateShowAdd" :manufact="manufacturerCustom" @reloadManu="reloadManu()"></cirBreakProperty>
                    <circuitBreakering :properties="properties" :circuitBreakering.sync="circuitBreaker"></circuitBreakering>
                    <cirBreakRating :ratings.sync="ratings"></cirBreakRating>
                    <contactSystem :contactSys.sync="contactSys"></contactSystem>
                    <others :others="others"></others>
                </div>
                <div v-else-if="this.switch == 'operatingMechanism'">
                    <operatingMechanism v-if="operating.table" :operating.sync="operating"></operatingMechanism>
                </div>
                <div v-else-if="this.switch == 'assessmentLimit'">
                    <AssessmentLimit :assessLimits.sync="assessmentLimits"></AssessmentLimit>
                </div>
            </div>
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
            update : false,
            switch : 'circuitBreaker'
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
        },
        updateAttachment(attachment) {
            this.attachmentData = attachment
        },
        async resetForm() {},
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

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

::v-deep .el-input__inner,
::v-deep .el-select .el-input__inner {
  font-size: 12px !important;
}
</style>

<template>
    <div id="asset">
        <div style="min-height: 500px; display: flex; flex-direction: column;">
            <div style="width: calc(100% - 20px)">
                <el-button @click="switchData('powerCable')" size="mini" style="width: calc(50% / 4);" type="primary">Power Cable</el-button>
                <el-button @click="switchData('assessories')" size="mini" style="width: calc(50% / 4 - 10px);" type="primary">Assessories</el-button>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; margin-top: 20px">
                <div v-if="this.switch == 'powerCable'">
                    <powerCableProperty @setUpdate="setUpdate" :updateNew='updateNew' :update="update" @editManu="editManu" :title="title" @createAdd="updateShowAdd" :manufact="manufacturerCustom" @reloadManu="reloadManu()" :properties.sync="powerCable.properties"></powerCableProperty>
                    <configs :layer.sync="powerCable.layerConstruction" :ratings.sync="powerCable.ratings" 
                    :configs.sync="powerCable.config" :other="powerCable.others" :datas="powerCable.data"></configs>
                </div>
                <div v-else-if="this.switch == 'assessories'">
                    <assessories :joint="assessories.joint" :terminal="assessories.terminal" 
                    :sheathLimit="assessories.sheath_limits"></assessories>
                </div>
            </div>
        </div>
        <manufacturerAdd :dataProperties="dataProperties" :showAdd.sync="showAdd" @backSign="backSign()" @backSignUpdate="backSignUpdate" :title="title" :modeManu="modeManu"></manufacturerAdd>
    </div>
</template>

<script>
import powerCableProperty from './components/properties.vue'
import configs from './components/configs.vue'
import mixin from './mixin'
import assessories from './components/assessories.vue'
import manufacturerAdd from '@/views/Common/ManufacturerAdd.vue'

export default {
    name: 'powerCable',
    components: {
        powerCableProperty,
        configs,
        assessories,
        manufacturerAdd
    },
    data() {
        return {
            mode: this.$constant.ADD,
            asset_id: null,
            saved: false,
            showAdd : false,
            title : 'powercable',
            manufacturerCustom : [],
            modeManu : 'insert',
            dataProperties : {},
            updateNew : '',
            update : false,
            switch : 'powerCable'
        }
    },
    mounted() {},
    async beforeMount() {
        let rs = await window.electronAPI.getManufacturerByType(this.title)
        if(rs.success) {
            this.manufacturerCustom = rs.data.map(e => e.name)
        }
    },
    mixins : [mixin],
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
    font-size: 12px;
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

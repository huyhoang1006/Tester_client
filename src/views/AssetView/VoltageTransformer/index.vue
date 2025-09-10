<template>
    <div id="asset">
        <div style="min-height: 500px; display: flex; flex-direction: column;">
            <div style="flex: 1; display: flex; flex-direction: column;">
                <voltageTransProperty @setUpdate="setUpdate" :updateNew='updateNew' :update="update" @editManu="editManu" :title="title" :properties.sync="properties" @createAdd="updateShowAdd" :manufact="manufacturerCustom" @reloadManu="reloadManu()"></voltageTransProperty>
                <ratings :ratings.sync="ratings" :properties="properties"></ratings>
                <currentVTConfig :configs.sync="config"></currentVTConfig>
            </div>
        </div>
        <manufacturerAdd :dataProperties="dataProperties" :showAdd.sync="showAdd" @backSign="backSign()" @backSignUpdate="backSignUpdate" :title="title" :modeManu="modeManu"></manufacturerAdd>
    </div>
</template>

<script>
import mixin from '../VoltageTransformer/mixin'
import voltageTransProperty from '../VoltageTransformer/components/properties.vue'
import ratings from '../VoltageTransformer/components/ratings.vue'
import currentVTConfig from '../VoltageTransformer/components/VTConfiguration.vue'
import manufacturerAdd from '@/views/Common/ManufacturerAdd.vue'

export default {
    name: 'voltageTransformer',
    components: {
        voltageTransProperty,
        ratings,
        currentVTConfig,
        manufacturerAdd
    },
    data() {
        return {
            mode: this.$constant.ADD,
            asset_id: null,
            saved: false,
            showAdd : false,
            title : 'voltage',
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
    font-size: 12px;
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

::v-deep .el-input__inner,
::v-deep .el-select .el-input__inner {
  font-size: 12px !important;
}
</style>

<template>
    <div id="asset">
        <div style="min-height: 500px; display: flex; flex-direction: column;">
            <div style="flex: 1; display: flex; flex-direction: column;">
                <disconnectTransProperty @setUpdate="setUpdate" :updateNew='updateNew' :update="update" @editManu="editManu" :title="title" :properties.sync="properties" @createAdd="updateShowAdd" :manufact="manufacturerCustom" @reloadManu="reloadManu()"></disconnectTransProperty>
                <ratings :ratings.sync="ratings"></ratings>
            </div>
        </div>
        <manufacturerAdd :dataProperties="dataProperties" :showAdd.sync="showAdd" @backSign="backSign()" @backSignUpdate="backSignUpdate" :title="title" :modeManu="modeManu"></manufacturerAdd>
    </div>
</template>

<script>
import mixin from '../Disconnector/mixin'
import disconnectTransProperty from '../Disconnector/components/properties.vue'
import ratings from '../Disconnector/components/ratings.vue'
import manufacturerAdd from '@/views/Common/ManufacturerAdd.vue'

export default {
    name: 'disconnector',
    components: {
        disconnectTransProperty,
        ratings,
        manufacturerAdd
    },
    data() {
        return {
            mode: this.$constant.ADD,
            asset_id: null,
            saved: false,
            showAdd : false,
            title : 'disconnector',
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
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

::v-deep .el-input__inner,
::v-deep .el-select .el-input__inner {
  font-size: 12px !important;
}
</style>

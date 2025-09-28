<template>
    <div id="asset">
        <div style="min-height: 500px; display: flex; flex-direction: column;">
            <div style="flex: 1; display: flex; flex-direction: column;">
                <currentTransProperty @setUpdate="setUpdate" :updateNew='updateNew' :update="update"
                    @editManu="editManu" :title="title" :properties.sync="currentTransformer.properties"
                    @createAdd="updateShowAdd" :manufact="manufacturerCustom" @reloadManu="reloadManu()">
                </currentTransProperty>
                <currentTransRating :ratings.sync="currentTransformer.ratings"></currentTransRating>
                <currentCTConfig v-if="currentTransformer.ctConfiguration" :configs.sync="currentTransformer.ctConfiguration"
                    :ratings="currentTransformer.ratings"></currentCTConfig>
            </div>
        </div>
        <manufacturerAdd :dataProperties="dataProperties" :showAdd.sync="showAdd" @backSign="backSign()"
            @backSignUpdate="backSignUpdate" :title="title" :modeManu="modeManu"></manufacturerAdd>
    </div>
</template>

<script>
import mixin from '../CurrentTransformer/mixin'
import currentTransProperty from '../CurrentTransformer/components/properties.vue'
import currentTransRating from '../CurrentTransformer/components/ratings.vue'
import currentCTConfig from '../CurrentTransformer/components/CTConfiguration.vue'
import manufacturerAdd from '@/views/Common/ManufacturerAdd.vue'

export default {
    name: 'currentTransformer',
    components: {
        currentTransProperty,
        currentTransRating,
        currentCTConfig,
        manufacturerAdd
    },
    props: {
        parent: {
            type: Object,
            default: () => ({}),
            required: true
        },
        organisationId: {
            type: String,
            default: ''
        },

        locationId: {
            type: String,
            default: ''
        },
    },
    data() {
        return {
            mode: this.$constant.ADD,
            asset_id: null,
            saved: false,
            showAdd: false,
            title: 'current',
            manufacturerCustom: [],
            modeManu: 'insert',
            dataProperties: {},
            updateNew: '',
            update: false,
            parentData: JSON.parse(JSON.stringify(this.parent)),
        }
    },
    mixins: [mixin],
    mounted() { },
    async beforeMount() {
        let rs = await window.electronAPI.getManufacturerByType(this.title)
        if (rs.success) {
            this.manufacturerCustom = rs.data.map(e => e.name)
        }
    },
    methods: {
        updateShowAdd(sign) {
            this.showAdd = sign
        },
        async editManu(item) {
            let rs = await window.electronAPI.getManufacturerByName(item)
            if (rs.success) {
                this.dataProperties = rs.data[0]
                this.showAdd = true
                this.modeManu = 'edit'
            }
        },
        async backSign(sign) {
            this.showAdd = sign
            let rs = await await window.electronAPI.getManufacturerByType(this.title)
            if (rs.success) {
                this.manufacturerCustom = rs.data.map(e => e.name)
            }
            this.modeManu = 'insert'
        },
        async backSignUpdate(dataUpdate) {
            this.showAdd = false
            let rs = await await window.electronAPI.getManufacturerByType(this.title)
            if (rs.success) {
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
            if (rs.success) {
                this.manufacturerCustom = rs.data.map(e => e.name)
            }
        },
        updateAttachment(attachment) {
            this.attachmentData = attachment
        },
        async resetForm() { },
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

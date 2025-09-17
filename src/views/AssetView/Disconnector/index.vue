<template>
    <div id="asset">
        <div style="min-height: 500px; display: flex; flex-direction: column;">
            <div style="flex: 1; display: flex; flex-direction: column;">
                <disconnectTransProperty :properties.sync="disconnector.properties"></disconnectTransProperty>
                <ratings :ratings.sync="disconnector.ratings"></ratings>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from '../Disconnector/mixin'
import disconnectTransProperty from '../Disconnector/components/properties.vue'
import ratings from '../Disconnector/components/ratings.vue'

export default {
    name: 'disconnector',
    components: {
        disconnectTransProperty,
        ratings,
    },
    data() {
        return {
            title : 'disconnector',
            parentData : JSON.parse(JSON.stringify(this.parent)),
        }
    },
    mixins : [mixin],
    props: {
        parent : {
            type: Object,
            default: () => ({})
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
    methods: {
        updateAttachment(attachment) {
            this.attachmentData = attachment
        },
        loadMapForView() {
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

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

::v-deep .el-input__inner,
::v-deep .el-select .el-input__inner {
  font-size: 12px !important;
}
</style>

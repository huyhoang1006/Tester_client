<template>
    <div id="asset">
        <div style="display: flex; flex-direction: column;">
            <div style="flex: 1; display: flex; flex-direction: column;">
                <properties :data="rotatingMachine.properties" @update-attachment="updateAttachment"
                    :attachment.sync="this.attachmentData"></properties>
                <configs :configs="rotatingMachine.configsData"></configs>
                <ratings :ratings="rotatingMachine.ratingsData"></ratings>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import properties from '../RotatingMachine/components/properties.vue'
import configs from '../RotatingMachine/components/configs.vue'
import ratings from '../RotatingMachine/components/ratings.vue'
import mixin from './mixin'

export default {
    name: 'RotatingMachine',
    components: {
        properties,
        configs,
        ratings

    },
    data() {
        return {
            title: 'RotatingMachine',
        }
    },
    computed: {
        parentData() {
            return this.parent
        }
    },
    mixins: [mixin],

    props: {
        parent: {
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

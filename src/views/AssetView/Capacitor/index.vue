<template>
    <div id="asset">
        <div style="min-height: 500px; display: flex; flex-direction: column;">
            <div style="flex: 1; display: flex; flex-direction: column;">
                <capacitorProperty 
                    :manufact="manufacturerList"
                    :title="title"
                    :updateNew="updateNew"
                    :update="update">
                </capacitorProperty>  
                <configs 
                    :layer="layerData"
                    :datas="datas">
                </configs>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from './mixin'
import capacitorProperty from './components/properties.vue'
import configs from './components/configs.vue'


export default {
    name: 'capacitor',
    components: {
        capacitorProperty,
        configs
    },
    data() {
        return {
            title : 'capacitor',
            parentData : JSON.parse(JSON.stringify(this.parent)),
            manufacturerList : ['ABB', 'ALSTOM', 'General Electric', 'Mitsubishi Electric', 'Schneider Electric', 'Siemens', 'Toshiba', 'Westinghouse'],
            layerData: {},
            datas: {},
            updateNew: true,
            update: true
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

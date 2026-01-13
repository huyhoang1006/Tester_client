<template>
    <div id="asset">
        <div style="min-height: 500px; display: flex; flex-direction: column;">
            <el-row justify="center" class="top-switch">
                <el-col :span="24">
                    <el-row :gutter="8">
                        <el-col :xs="12" :sm="12" :md="6">
                            <el-button @click="switchData('powerCable')" size="mini" class="switch-btn" type="primary"
                                style="width: 100%">Power Cable</el-button>
                        </el-col>
                        <el-col :xs="12" :sm="12" :md="6">
                            <el-button @click="switchData('assessories')" size="mini" class="switch-btn" type="primary"
                                style="width: 100%">Assessories</el-button>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
            <div style="flex: 1; display: flex; flex-direction: column; margin-top: 20px">
                <div v-if="this.switch == 'powerCable'">
                    <powerCableProperty :properties.sync="powerCable.properties"></powerCableProperty>
                    <configs :layer.sync="powerCable.layersData" :ratings.sync="powerCable.ratingsData"
                        :configs.sync="powerCable.configsData" :other="powerCable.othersData"
                        :datas="powerCable.datasData">
                    </configs>
                </div>
                <div v-else-if="this.switch == 'assessories'">
                    <assessories :joint="powerCable.datasData.jointsData" :terminal="powerCable.datasData.terminalsData"
                        :sheathLimit="powerCable.datasData.sheathLimitsData"></assessories>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import powerCableProperty from './components/properties.vue'
import configs from './components/configs.vue'
import mixin from './mixin'
import assessories from './components/assessories.vue'

export default {
    name: 'powerCable',
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
    components: {
        powerCableProperty,
        configs,
        assessories,
    },
    data() {
        return {
            switch: 'powerCable',

        }
    },
    computed: {
        parentData() {
            return this.parent
        }
    },
    mixins: [mixin],
    methods: {
        async switchData(data) {
            this.switch = data
        },
        updateAttachment(attachment) {
            this.attachmentData = attachment
        },
        loadMapForView() { },
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

::v-deep(.top-switch) {
    ::v-deep(.el-button) {
        white-space: nowrap;
        line-height: 1.4;
        padding: 4px;
        text-align: center;
        text-overflow: ellipsis;
        font-size: 12px;
    }
}

::v-deep(.top-switch .switch-btn) {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

::v-deep .el-input__inner,
::v-deep .el-select .el-input__inner {
    font-size: 12px !important;
}
</style>
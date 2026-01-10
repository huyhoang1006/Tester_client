<template>
    <div id="asset">
        <div style="min-height: 500px; display: flex; flex-direction: column;">
            <div class="switch-buttons">
                <el-button @click="switchData('powerCable')" size="mini" class="switch-btn" type="primary">Power
                    Cable</el-button>
                <el-button @click="switchData('assessories')" size="mini" class="switch-btn"
                    type="primary">Assessories</el-button>
            </div>
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

.switch-buttons {
    display: flex;
    gap: 10px;
    width: 100%;
}

.switch-btn {
    flex: 0 0 25%;
}

@media (max-width: 768px) {
    .switch-btn {
        flex: 0 0 50%;
    }
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

::v-deep .el-input__inner,
::v-deep .el-select .el-input__inner {
    font-size: 12px !important;
}
</style>
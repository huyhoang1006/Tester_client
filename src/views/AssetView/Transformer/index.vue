<template>
    <div style="min-height: 500px; display: flex; flex-direction: column;">
        <el-row justify="center" class="top-switch">
            <el-col :xs="24" :md="18" :lg="12">
                <el-row :gutter="8">
                    <el-col :xs="12" :sm="6" :md="6">
                        <el-button class="trs-btn" size="mini" type="primary" style="width: 100%" @click="switchData('Transformer')">Transformer</el-button>
                    </el-col>
                    <el-col :xs="12" :sm="6" :md="6">
                        <el-button class="trs-btn" size="mini" type="primary" style="width: 100%" @click="switchData('Bushings')">Bushings</el-button>
                    </el-col>
                    <el-col :xs="12" :sm="6" :md="6">
                        <el-button class="trs-btn" size="mini" type="primary" style="width: 100%" @click="switchData('Tap changer')">Tap changer</el-button>
                    </el-col>
                    <el-col :xs="12" :sm="6" :md="6">
                        <el-button class="trs-btn" size="mini" type="primary" style="width: 100%" @click="switchData('Surge Arrester')">Surge Arrester</el-button>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>

        <div style="flex: 1; display: flex; flex-direction: column;">
            <div v-if="this.switch == 'Transformer'">
                <!-- Properties -->
                <property @update-attachment="updateAttachment" :attachment.sync="this.attachmentData" @change-type="onChangeAssetType" :data="this.transformerDto.properties" style="font-size: 12px !important;"></property>

                <!-- Winding configuration -->
                <winding-configuration :properties="this.transformerDto.properties" :data="this.transformerDto.winding_configuration" style="font-size: 12px !important;"></winding-configuration>

                <!-- Ratings -->
                <rating :properties="this.transformerDto.properties" :data="this.transformerDto.ratings" style="font-size: 12px !important;"></rating>

                <!-- Impedances -->
                <impedance @add="addShortCircuitTest" @remove="removeShortCircuitTest" @removeArr="removeShortCircuitTestArr" :tapChangers="this.transformerDto.tap_changers" :data="this.transformerDto.impedances" :properties="this.transformerDto.properties" style="font-size: 12px !important;"></impedance>

                <!-- Others -->
                <other :data="this.transformerDto.others" :properties="this.transformerDto.properties" style="font-size: 12px;"></other>
            </div>
            
            <div v-else-if="this.switch == 'Tap changer'">
                <!-- Tap changer -->
                <tap-changer :properties="this.transformerDto.properties" :data="this.transformerDto.tap_changers" style="font-size: 12px !important;"></tap-changer>
            </div>

            <!-- Bushings -->
            <div style="flex: 1; display: flex; flex-direction: column;" v-else-if="this.switch == 'Bushings'">
                <bushing
                    :asset_type="this.transformerDto.properties.type"
                    :asset_phase="this.transformerDto.winding_configuration.phases"
                    :asset_winding_config="this.transformerDto.winding_configuration.vector_group"
                    :bushing_data="this.transformerDto.bushing_data"
                    @input-bushing="onInputBushing">
                </bushing>
            </div>

            <!-- Surge Arrester -->
            <div v-else-if="this.switch == 'Surge Arrester'">
                <surge-arrester :data="this.transformerDto.surge_arrester" :properties="this.transformerDto.properties" style="font-size: 12px !important;"></surge-arrester>
            </div>

        </div>
    </div>
</template>

<script>
/* eslint-disable */
import WindingConfiguration from './components/WindingConfiguration/index.vue'
import Bushing from './components/Bushing/index.vue'
import TapChanger from './components/TapChanger/index.vue'
import SurgeArrester from './components/SurgeArrester/index.vue'
import Property from './components/Property/index.vue'
import Rating from './components/Rating/index.vue'
import Impedance from './components/Impedance/index.vue'
import Other from './components/Other/index.vue'
import mixin from './mixin'
import manufacturerAdd from '@/views/Common/ManufacturerAdd.vue'

export default {
    name: 'AssetView',
    props : {
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
        WindingConfiguration,
        Bushing,
        TapChanger,
        Property,
        Rating,
        Impedance,
        Other,
        manufacturerAdd,
        SurgeArrester
    },
    mixins: [mixin],
    data() {
        return {
            title : 'transformer',
            switch : 'Transformer',
        }
    },
    computed: {
        parentData() {
            return this.parent
        }
    },
    methods: {
        onInputBushing(bushings_config_arr) {
            this.bushings_config = bushings_config_arr
        },
        async switchData(data) {
            this.switch = data
        },
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

::v-deep(.el-input__inner),
::v-deep(.el-select .el-input__inner) {
  font-size: 12px !important;
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

::v-deep(.top-switch .trs-btn) {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 768px) {
    .top-switch {
        ::v-deep(.el-col) {
            margin-bottom: 8px;
        }
    }
}
</style>
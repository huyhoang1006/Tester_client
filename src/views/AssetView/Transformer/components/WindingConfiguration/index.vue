<template>
    <div id="config-selection" class="mgy-5">
        <el-row>
            <el-col :span="24">
                <div class="header-toggle pointer" @click="openWindingConfiguration = !openWindingConfiguration">
                    <i v-if="openWindingConfiguration" class="fa-solid fa-caret-up"> </i>
                    <i v-else class="fa-solid fa-caret-down"></i>
                    Winding configuration
                </div>
            </el-col>
        </el-row>
        <div class="content-toggle" v-if="openWindingConfiguration">
            <el-row :gutter="20" class="content">
                <el-col :xs="24" :sm="24" :md="12" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Phases" class="inline-phases">
                            <el-radio-group @change="onChangePhase" v-model="windingConfigurationData.phases">
                                <el-radio type="number" label="1">1</el-radio>
                                <el-radio type="number" label="3">3</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="Vector group">
                            <div v-if="vectorGroup !== null && vectorGroup !== '' && vectorGroup !== undefined"
                                style="font-weight: bold; font-size: 12px; text-transform: uppercase">{{ vectorGroup }}
                            </div>
                            <el-input size="mini" v-model="windingConfigurationData.vector_group_custom"
                                placeholder="Enter custom vector group"></el-input>
                            <el-button type="primary"
                                style="width: 100%; margin-top: 10px; display: flex; flex: 1; align-items: center; justify-content: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                                @click="onOpenVectorGroup"> Select winding configuration </el-button>
                            <div style="color: black; font-size: 12px;">Unsupported vector group</div>
                            <el-input size="mini" v-model="windingConfigurationData.unsupported_vector_group"
                                placeholder="Enter unsupported vector group"></el-input>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>
        <vector-group ref="vectorGroup" :openDialog="openDialog" :asset_type="properties.type"
            :asset_phase="windingConfigurationData.phases" :asset_winding_config="windingConfigurationData.vector_group"
            @close-dialog="onCloseDialog" @cancel-dialog="onCancelDialog">
        </vector-group>
    </div>
</template>

<script>
/* eslint-disable */
import VectorGroup from '../VectorGroup/index.vue'
import { WindingConnection } from '@/views/Enum/WindingConnection'
import { PhaseCode } from '@/views/Enum/PhaseCode'
import { Accessible } from '@/views/Enum/Accessible'

const MapData = [
    {
        label: 'I (Phase A)',
        value: WindingConnection.I + PhaseCode.A
    },
    {
        label: 'I (Phase B)',
        value: WindingConnection.I + PhaseCode.B
    },
    {
        label: 'I (Phase C)',
        value: WindingConnection.I + PhaseCode.C
    },
    {
        label: 'I (Phase A-B)',
        value: WindingConnection.I + PhaseCode.AB
    },
    {
        label: 'I (Phase B-C)',
        value: WindingConnection.I + PhaseCode.BC
    },
    {
        label: 'I (Phase A-C)',
        value: WindingConnection.I + PhaseCode.AC
    },
    {
        label: 'I (Spare I)',
        value: WindingConnection.I + 'Spare I'
    },
    {
        value: WindingConnection.I,
        label: WindingConnection.I
    },
    {
        value: WindingConnection.D,
        label: WindingConnection.D
    },
    {
        value: WindingConnection.Y,
        label: WindingConnection.Y
    },
    {
        value: WindingConnection.Yn,
        label: WindingConnection.Yn
    },
    {
        value: WindingConnection.Z,
        label: WindingConnection.Z
    },
    {
        value: WindingConnection.Zn,
        label: WindingConnection.Zn
    },
    {
        value: Accessible['4Accessible'],
        label: Accessible['4Accessible']
    },
    {
        value: Accessible['3Accessible'],
        label: Accessible['3Accessible']
    },
    {
        value: Accessible['2Accessible'],
        label: Accessible['2Accessible']
    },
    {
        value: Accessible['1Accessible'],
        label: Accessible['1Accessible']
    },
    {
        value: Accessible['Buried'],
        label: Accessible['Buried']
    },
    {
        value: Accessible['BuriedWGrounding'],
        label: Accessible['BuriedWGrounding']
    }
]

export default {
    name: 'WindingConfiguration',
    components: {
        VectorGroup
    },
    props: {
        data: {
            type: Object,
            required: true,
            default() {
                return {
                    vector_group_data: '',
                    phases: '',
                    vector_group: {
                        prim: '',
                        sec: {
                            i: '',
                            value: ''
                        },
                        tert: {
                            i: '',
                            value: '',
                            accessible: ''
                        }
                    },
                    vector_group_custom: '',
                    unsupported_vector_group: ''
                }
            }
        },
        properties: {
            type: Object,
            required: true,
            default() {
                return {
                    mrid: '',
                    kind: 'Transformer',
                    type: 'Two-winding',
                    serial_no: '',
                    manufacturer: '',
                    manufacturer_type: '',
                    manufacturing_year: '',
                    country_of_origin: '',
                    apparatus_id: '',
                    comment: ''
                }
            }
        }
    },
    data() {
        return {
            openWindingConfiguration: true,
            openDialog: false,
            labelWidth: `${150}px`
        }
    },
    computed: {
        windingConfigurationData: function () {
            return this.data
        },
        vectorGroup: function () {
            function mapEvery(data, mapData) {
                let temp = data
                for (let element of mapData) {
                    if (element.value === data) {
                        temp = element.label
                        break
                    }
                }
                return temp
            }
            this.windingConfigurationData.vector_group_data = mapEvery(this.windingConfigurationData.vector_group.prim, MapData) +
                mapEvery(this.windingConfigurationData.vector_group.sec.i, MapData) +
                mapEvery(this.windingConfigurationData.vector_group.sec.value, MapData) +
                mapEvery(this.windingConfigurationData.vector_group.tert.i, MapData) +
                mapEvery(this.windingConfigurationData.vector_group.tert.value, MapData) +
                mapEvery(this.windingConfigurationData.vector_group.tert.accessible, MapData)
            return this.windingConfigurationData.vector_group_data
        }
    },
    methods: {
        onChangePhase() {
            this.windingConfigurationData.vector_group = {
                prim: '',
                sec: {
                    i: '',
                    value: ''
                },
                tert: {
                    i: '',
                    value: '',
                    accessible: ''
                }
            }
        },
        onOpenVectorGroup() {
            if ((this.properties.type === "" || this.properties.type === undefined) || (this.windingConfigurationData.phases === "" || this.windingConfigurationData.phases === undefined)) {
                this.$message.error('Please select transformer type and phases')
                return
            }
            this.openDialog = true
            this.$nextTick(() => {
                if (this.$refs.vectorGroup) {
                    this.$refs.vectorGroup.loadData()
                }
            })
        },
        onCloseDialog(winding_config_arr) {
            this.windingConfigurationData.vector_group = winding_config_arr
            this.openDialog = false
        },
        onCancelDialog() {
            this.openDialog = false
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep(.el-radio__label) {
    font-size: 12px;
}

@media (max-width: 767px) {
    ::v-deep(.el-form-item) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    ::v-deep(.el-form-item__label) {
        width: auto !important;
        margin-left: 0 !important;
        padding: 0 0 4px 0;
        text-align: left;
        line-height: 1.2;
    }

    ::v-deep(.el-form-item__content) {
        width: 100%;
        margin-left: 0 !important;
    }

    ::v-deep(.inline-phases) {
        flex-direction: row;
        align-items: center;
    }

    ::v-deep(.inline-phases .el-form-item__label) {
        width: 80px !important;
        padding-bottom: 0;
    }

    ::v-deep(.inline-phases .el-form-item__content) {
        width: auto;
    }

    ::v-deep(.inline-phases .el-radio-group) {
        display: flex;
        gap: 12px;
    }
}
</style>
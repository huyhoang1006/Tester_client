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
                <el-col :span="8" class="col-content">
                    <el-form :inline-message="true" :label-width="labelWidth" size="mini" label-position="left">
                        <el-form-item label="Phases">
                            <el-radio-group @change="onChangePhase" v-model="windingConfigurationData.phases">
                                <el-radio type="number" label="1"></el-radio>
                                <el-radio type="number" label="3"></el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="Vector group">
                            <div style="font-weight: bold; text-transform: uppercase">{{ vectorGroup }} &nbsp;</div>
                            <el-input size="mini" v-model="windingConfigurationData.vector_group_custom"></el-input>
                            <el-button style="width: 100%" @click="openDialog = true"> Select winding configuration </el-button>
                            <div>Unsupported vector group</div>
                            <el-input size="mini" v-model="windingConfigurationData.unsupported_vector_group"></el-input>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
        </div>

        <vector-group
            :openDialog="openDialog"
            :asset_type="properties.asset_type"
            :asset_phase="windingConfigurationData.phases"
            :asset_winding_config="windingConfigurationData.vector_group"
            @close-dialog="onCloseDialog"
            @cancel-dialog="onCancelDialog">
        </vector-group>
    </div>
</template>

<script>
import VectorGroup from '../VectorGroup'

const MapData = [
    {
        label: 'L (Phase A)',
        value: 'La'
    },
    {
        label: 'L (Phase B)',
        value: 'Lb'
    },
    {
        label: 'L (Phase C)',
        value: 'Lc'
    },
    {
        label: 'L (Phase A-B)',
        value: 'Lab'
    },
    {
        label: 'L (Phase B-C)',
        value: 'Lbc'
    },
    {
        label: 'L (Phase C-A)',
        value: 'Lca'
    },
    {
        label: 'I (Spare I)',
        value: 'Ispare'
    },
    {
        value: 'I',
        label: 'I'
    },
    {
        value: 'D',
        label: 'D'
    },
    {
        value: 'Y',
        label: 'Y'
    },
    {
        value: 'YN',
        label: 'YN'
    },
    {
        value: 'Z',
        label: 'Z'
    },
    {
        value: 'ZN',
        label: 'ZN'
    },
    {
        value: '4accessible',
        label: '4 accessible'
    },
    {
        value: '3accessible',
        label: '3 accessible'
    },
    {
        value: '2accessible',
        label: '2 accessible'
    },
    {
        value: '1accessible',
        label: '1 accessible'
    },
    {
        value: '1buried',
        label: 'Buried'
    },
    {
        value: '1buriedgrounding',
        label: 'Buried /w grounding'
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
                    phases: '1',
                    vector_group: {
                        prim: '',
                        sec: {
                            I: '',
                            Value: ''
                        },
                        tert: {
                            I: '',
                            Value: '',
                            accessibility: ''
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
                    id: '',
                    asset: 'Transformer',
                    asset_type: 'Two-winding',
                    serial_no: '',
                    manufacturer: '',
                    manufacturer_type: '',
                    manufacturing_year: '',
                    asset_system_code: '',
                    apparatus_id: '',
                    feeder: '',
                    date_of_warehouse_receipt: '',
                    date_of_delivery: '',
                    date_of_production_order: '',
                    comment: ''
                }
            }
        }
    },
    data() {
        return {
            openWindingConfiguration: true,
            openDialog: false,
            labelWidth: `${200}px`
        }
    },
    computed: {
        windingConfigurationData: function () {
            return this.data
        },
        vectorGroup: function () {
            function mapEvery(data, mapData) {
                let temp = data
                mapData.every(element => {
                    if(element.value == data) {
                        temp = element.label
                        return false
                    }
                })
                return temp
            }

            return (
                '' +
                mapEvery(this.windingConfigurationData.vector_group.prim, MapData) +
                mapEvery(this.windingConfigurationData.vector_group.sec.I, MapData) +
                mapEvery(this.windingConfigurationData.vector_group.sec.Value, MapData) +
                mapEvery(this.windingConfigurationData.vector_group.tert.I, MapData) +
                mapEvery(this.windingConfigurationData.vector_group.tert.Value, MapData) +
                mapEvery(this.windingConfigurationData.vector_group.tert.accessibility, MapData)
            )
        }
    },

    mounted() {},
    methods: {
        onChangePhase() {
            this.windingConfigurationData.vector_group = {
                prim: '',
                sec: {
                    I: '',
                    Value: ''
                },
                tert: {
                    I: '',
                    Value: '',
                    accessibility: ''
                }
            }
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

<style lang="scss" scoped></style>

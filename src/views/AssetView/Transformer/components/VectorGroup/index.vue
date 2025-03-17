<template>
    <el-dialog title="Edit Vector Group" :visible="openDialog" width="800px" @close="handleCancel" style="z-index: 2;">
        <span>
            Vector group: <b style="text-transform: uppercase">{{ vectorGroup }}</b>
        </span>

        <el-row :gutter="20">
            <el-col :span="8">
                <!-- prim -->
                <div>
                    <br />
                    <div>Primary (Prim)</div>
                    <br />
                    <el-select size="small" @change="winding_config.sec.I = ''" v-model="winding_config.prim" class="m-2" placeholder="Select">
                        <el-option v-for="item in handlePrimArray()" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </div>
            </el-col>
            <el-col :span="8">
                <!-- secondary I -->
                <div v-if="this.winding_config.prim !== '' && this.asset_type !== $constant.WITHOUT_TERT && this.asset_type !== $constant.WITH_TERT">
                    <br />
                    <div>Secondary I (Sec I)</div>
                    <br />
                    <el-select size="small" @change="winding_config.sec.Value = ''" v-model="winding_config.sec.I" class="m-2" placeholder="Select">
                        <el-option v-for="item in handleSecIArray()" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </div>

                <!-- secondary value -->
                <div v-if="this.winding_config.sec.I !== ''">
                    <br />
                    <div>Secondary value (Sec value)</div>
                    <br />
                    <el-select size="small" v-model="winding_config.sec.Value" class="m-2" placeholder="Select">
                        <el-option v-for="item in handleSecValueArray()" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </div>
            </el-col>
            <el-col :span="8">
                <!-- tert I -->
                <div v-if=" (this.asset_type === 'Three-winding' && this.winding_config.prim !== '') || (this.asset_type === 'Auto w/ tert' && this.winding_config.prim !== '') ">
                    <br />
                    <div>Tertiary I (Tert I)</div>
                    <br />
                    <el-select size="small" @change="winding_config.tert.Value = ''" v-model="winding_config.tert.I" class="m-2" placeholder="Select">
                        <el-option v-for="item in handleTertIArray()" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </div>

                <!-- tert value -->
                <div v-if="(this.asset_type === 'Three-winding' || this.asset_type === 'Auto w/ tert') && this.winding_config.tert.I !== ''">
                    <br />
                    <div>Tertiary value (Tert Value)</div>
                    <br />
                    <el-select size="small" @change="winding_config.tert.Accessible = ''" v-model="winding_config.tert.Value" class="m-2" placeholder="Select">
                        <el-option v-for="item in handleTertValueArray()" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </div>

                <!-- tert assessibility -->
                <div v-if="this.winding_config.tert.I === 'D' && this.winding_config.tert.Value !== ''">
                    <br />
                    <div>Tertiary Assessibility (Tert Assessibility)</div>
                    <br />
                    <el-select size="small" v-model="winding_config.tert.accessibility" class="m-2" placeholder="Select">
                        <el-option v-for="item in handleTertAssessibleArray()" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </div>
            </el-col>
        </el-row>

        <span slot="footer" class="dialog-footer">
            <el-button @click="handleCancel">Cancel</el-button>
            <el-button type="primary" @click="handleClose">Confirm</el-button>
        </span>
    </el-dialog>
</template>

<script>
/* eslint-disable */

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
        value: '_4accessible',
        label: '4 accessible'
    },
    {
        value: '_3accessible',
        label: '3 accessible'
    },
    {
        value: '_2accessible',
        label: '2 accessible'
    },
    {
        value: '_1accessible',
        label: '1 accessible'
    },
    {
        value: '_1buried',
        label: 'Buried'
    },
    {
        value: '_1buriedgrounding',
        label: 'Buried /w grounding'
    }
]


const two_winding_1phase_prim = [
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
    }
]

const two_winding_1phase_secondary_i = [
    {
        value: 'I',
        label: 'I'
    }
]

const two_winding_1phase_secondary_value = [
    {
        value: '0',
        label: '0'
    },
    {
        value: '6',
        label: '6'
    }
]

const two_winding_3phase_prim = [
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
    }
]

const two_winding_3phase_secondary_i = [
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
    }
]

const two_winding_3phase_secondary_value_even = [
    {
        value: '0',
        label: '0'
    },
    {
        value: '2',
        label: '2'
    },
    {
        value: '4',
        label: '4'
    },
    {
        value: '6',
        label: '6'
    },
    {
        value: '8',
        label: '8'
    },
    {
        value: '10',
        label: '10'
    }
]

const two_winding_3phase_secondary_value_odd = [
    {
        value: '1',
        label: '1'
    },
    {
        value: '3',
        label: '3'
    },
    {
        value: '5',
        label: '5'
    },
    {
        value: '7',
        label: '7'
    },
    {
        value: '9',
        label: '9'
    },
    {
        value: '11',
        label: '11'
    }
]

const accessibility = [
    {
        value: '_4accessible',
        label: '4 accessible'
    },
    {
        value: '_3accessible',
        label: '3 accessible'
    },
    {
        value: '_2accessible',
        label: '2 accessible'
    },
    {
        value: '_1accessible',
        label: '1 accessible'
    },
    {
        value: '_1buried',
        label: 'Buried'
    },
    {
        value: '_1buriedgrounding',
        label: 'Buried /w grounding'
    }
]

export default {
    name: 'VectorGroup',
    data() {
        return {
            winding_config: JSON.parse(JSON.stringify(this.asset_winding_config))
        }
    },
    props: {
        openDialog: Boolean,
        asset_type: String,
        asset_phase: String,
        asset_winding_config: Object
    },
    computed: {
        vectorGroup: function () {
            function mapEvery(data, mapData) {
                let temp = data
                for(let index in mapData) {
                    if(mapData[index].value == data) {
                        temp = mapData[index].label
                    }
                }
                return temp
            }

            return (
                '' +
                mapEvery(this.winding_config.prim, MapData) +
                mapEvery(this.winding_config.sec.I, MapData) +
                mapEvery(this.winding_config.sec.Value, MapData) +
                mapEvery(this.winding_config.tert.I, MapData) +
                mapEvery(this.winding_config.tert.Value, MapData) +
                mapEvery(this.winding_config.tert.accessibility, MapData)
            )
        }
    },
    methods: {
        async handleClose() {
            this.$emit('close-dialog', this.winding_config)
        },

        handleCancel() {
            this.$emit('cancel-dialog', false)
        },

        handlePrimArray() {
            if ((this.asset_type === 'Two-winding' || this.asset_type === 'Three-winding') && this.asset_phase === '1') {
                return two_winding_1phase_prim
            } else if (this.asset_type === 'Auto w/o tert' && this.asset_phase === '1') {
                return two_winding_1phase_prim
            } else if ((this.asset_type === 'Auto w/o tert' || this.asset_type === 'Auto w/ tert')  && this.asset_phase === '3') {
                return [{
                    value :'YyNa',
                    label : 'YyNa'
                }]
            }
            else if (this.asset_type === 'Auto w/ tert' && this.asset_phase === '1') {
                return two_winding_1phase_prim
            }
            else {
                return two_winding_3phase_prim
            }
        },

        handleSecIArray() {
            if ((this.asset_type === 'Two-winding' && this.asset_phase === '1')) {
                return two_winding_1phase_secondary_i
            } else if (this.asset_type === 'Two-winding' && this.asset_phase === '3') {
                if (this.winding_config.prim === 'YN') {
                    return two_winding_3phase_secondary_i.filter((item) => item.value === 'D' || item.value === 'Y' || item.value === 'YN')
                } else {
                    return two_winding_3phase_secondary_i
                }
            } else if (this.asset_type === 'Three-winding' && this.asset_phase === '1') {
                return two_winding_1phase_secondary_i
            } else {
                if (this.winding_config.prim === 'YN') {
                    return two_winding_3phase_secondary_i.filter((item) => item.value === 'D' || item.value === 'Y' || item.value === 'YN')
                } else {
                    return two_winding_3phase_secondary_i
                }
            }
        },

        handleSecValueArray() {
            if ((this.asset_type === 'Two-winding' || this.asset_type === 'Three-winding') && this.asset_phase === '1') {
                return two_winding_1phase_secondary_value
            } else if ((this.asset_type === 'Two-winding' || this.asset_type === 'Three-winding') && this.asset_phase === '3') {
                if (
                    this.winding_config.prim === 'D' &&
                    (this.winding_config.sec.I === 'D' || this.winding_config.sec.I === 'Z' || this.winding_config.sec.I === 'ZN')
                ) {
                    return two_winding_3phase_secondary_value_even
                } else if (this.winding_config.prim === 'D') {
                    return two_winding_3phase_secondary_value_odd
                } else if (this.winding_config.prim === 'Y' && this.winding_config.sec.I === 'D') {
                    return two_winding_3phase_secondary_value_odd
                } else if (this.winding_config.prim === 'Y' && (this.winding_config.sec.I === 'Y' || this.winding_config.sec.I === 'YN')) {
                    return two_winding_1phase_secondary_value
                } else if (this.winding_config.prim === 'Y' && (this.winding_config.sec.I === 'Z' || this.winding_config.sec.I === 'ZN')) {
                    return two_winding_3phase_secondary_value_odd.filter((item) => item.value !== '3' && item.value !== '9')
                } else if (this.winding_config.prim === 'YN' && this.winding_config.sec.I === 'D') {
                    return two_winding_3phase_secondary_value_odd
                } else {
                    return two_winding_1phase_secondary_value
                }
            }
        },

        handleTertIArray() {
            if ((this.asset_type === 'Two-winding' && this.asset_phase === '1') || (this.asset_type === 'Auto w/ tert' && this.asset_phase === '1')) {
                return two_winding_1phase_secondary_i
            } else if (this.asset_type === 'Two-winding' && this.asset_phase === '3') {
                if (this.winding_config.prim === 'YN') {
                    return two_winding_3phase_secondary_i.filter((item) => item.value === 'D' || item.value === 'Y' || item.value === 'YN')
                } else {
                    return two_winding_3phase_secondary_i
                }
            } else if (this.asset_type === 'Three-winding' && this.asset_phase === '1') {
                return two_winding_1phase_secondary_i
            } else if (this.asset_type === 'Auto w/ tert' && this.asset_phase === '3') {
                if(this.winding_config.prim === 'YyNa') {
                    return two_winding_3phase_secondary_i.filter((item) => !item.value.includes('Z'))
                }
            }
            else {
                if (this.winding_config.prim === 'YN') {
                    return two_winding_3phase_secondary_i.filter((item) => item.value === 'D' || item.value === 'Y' || item.value === 'YN')
                } else {
                    return two_winding_3phase_secondary_i
                }
            }
        },

        handleTertValueArray() {
            if ((this.asset_type === 'Two-winding' || this.asset_type === 'Three-winding' || this.asset_type === 'Auto w/ tert') && this.asset_phase === '1') {
                return two_winding_1phase_secondary_value
            } else if ((this.asset_type === 'Two-winding' || this.asset_type === 'Three-winding' || this.asset_type === 'Auto w/ tert') && this.asset_phase === '3') {
                if (
                    this.winding_config.prim === 'D' &&
                    (this.winding_config.tert.I === 'D' || this.winding_config.tert.I === 'Z' || this.winding_config.tert.I === 'ZN')
                ) {
                    return two_winding_3phase_secondary_value_even
                } else if (this.winding_config.prim === 'D') {
                    return two_winding_3phase_secondary_value_odd
                } else if (this.winding_config.prim === 'Y' && this.winding_config.tert.I === 'D') {
                    return two_winding_3phase_secondary_value_odd
                } else if (this.winding_config.prim === 'Y' && (this.winding_config.tert.I === 'Y' || this.winding_config.tert.I === 'YN')) {
                    return two_winding_1phase_secondary_value
                } else if (this.winding_config.prim === 'Y' && (this.winding_config.tert.I === 'Z' || this.winding_config.tert.I === 'ZN')) {
                    return two_winding_3phase_secondary_value_odd.filter((item) => item.value !== '3' && item.value !== '9')
                } else if (this.winding_config.prim === 'YN' && this.winding_config.tert.I === 'D') {
                    return two_winding_3phase_secondary_value_odd
                } else if (this.winding_config.prim === 'YyNa' && this.winding_config.tert.I === 'D') {
                    return two_winding_3phase_secondary_value_odd
                }
                else {
                    return two_winding_1phase_secondary_value
                }
            }
        },
        handleTertAssessibleArray() {
            if (this.winding_config.tert.I === 'D' && this.winding_config.tert.Value !== '') {
                return accessibility
            }
        }
    },
    watch: {
        asset_winding_config(val) {
            this.winding_config = JSON.parse(JSON.stringify(val))
        }
    }
}
</script>

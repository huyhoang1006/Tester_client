<template>
    <el-dialog title="Edit Vector Group" :visible="openDialog" width="800px" @close="handleCancel" :modal="false" style="z-index: 2;">
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
                    <el-select size="small" @change="changePrim" v-model="winding_config.prim" class="m-2" placeholder="Select">
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
                    <el-select size="small" @change="changeSecI" v-model="winding_config.sec.i" class="m-2" placeholder="Select">
                        <el-option v-for="item in handleSecIArray()" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </div>

                <!-- secondary value -->
                <div v-if="this.winding_config.sec.i !== ''">
                    <br />
                    <div>Secondary value (Sec value)</div>
                    <br />
                    <el-select size="small" v-model="winding_config.sec.value" class="m-2" placeholder="Select">
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
                    <el-select size="small" @change="changeTertI" v-model="winding_config.tert.i" class="m-2" placeholder="Select">
                        <el-option v-for="item in handleTertIArray()" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </div>

                <!-- tert value -->
                <div v-if="(this.asset_type === 'Three-winding' || this.asset_type === 'Auto w/ tert') && this.winding_config.tert.i !== ''">
                    <br />
                    <div>Tertiary value (Tert Value)</div>
                    <br />
                    <el-select size="small" @change="winding_config.tert.accessible = ''" v-model="winding_config.tert.value" class="m-2" placeholder="Select">
                        <el-option v-for="item in handleTertValueArray()" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </div>

                <!-- tert assessibility -->
                <div v-if="this.winding_config.tert.i === 'D' && this.winding_config.tert.value !== ''">
                    <br />
                    <div>Tertiary Accessibility</div>
                    <br />
                    <el-select size="small" v-model="winding_config.tert.accessible" class="m-2" placeholder="Select">
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

const two_winding_1phase_prim = [
    {
        label: 'I (Phase A)',
        value: WindingConnection.I + PhaseCode.A
    },
    {
        label: 'I (Phase B)',
        value: WindingConnection.I + PhaseCode.B,
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
    }
]

const two_winding_1phase_secondary_i = [
    {
        value: WindingConnection.I,
        label: WindingConnection.I
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
    }
]

const two_winding_3phase_secondary_i = [
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
                        break
                    }
                }
                return temp
            }

            return (
                '' +
                mapEvery(this.winding_config.prim, MapData) +
                mapEvery(this.winding_config.sec.i, MapData) +
                mapEvery(this.winding_config.sec.value, MapData) +
                mapEvery(this.winding_config.tert.i, MapData) +
                mapEvery(this.winding_config.tert.value, MapData) +
                mapEvery(this.winding_config.tert.accessible, MapData)
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

        loadData() {
            this.winding_config = JSON.parse(JSON.stringify(this.asset_winding_config))
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
                if (this.winding_config.prim === WindingConnection.Yn) {
                    return two_winding_3phase_secondary_i.filter((item) => item.value === WindingConnection.D || item.value === WindingConnection.Y || item.value === WindingConnection.Yn)
                } else {
                    return two_winding_3phase_secondary_i
                }
            } else if (this.asset_type === 'Three-winding' && this.asset_phase === '1') {
                return two_winding_1phase_secondary_i
            } else {
                if (this.winding_config.prim === WindingConnection.Yn) {
                    return two_winding_3phase_secondary_i.filter((item) => item.value === WindingConnection.D || item.value === WindingConnection.Y || item.value === WindingConnection.Yn)
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
                    this.winding_config.prim === WindingConnection.D &&
                    (this.winding_config.sec.i === WindingConnection.D || this.winding_config.sec.i === WindingConnection.Z || this.winding_config.sec.i === WindingConnection.Zn)
                ) {
                    return two_winding_3phase_secondary_value_even
                } else if (this.winding_config.prim === WindingConnection.D) {
                    return two_winding_3phase_secondary_value_odd
                } else if (this.winding_config.prim === WindingConnection.Y && this.winding_config.sec.i === WindingConnection.D) {
                    return two_winding_3phase_secondary_value_odd
                } else if (this.winding_config.prim === WindingConnection.Y && (this.winding_config.sec.i === WindingConnection.Y || this.winding_config.sec.i === WindingConnection.Yn)) {
                    return two_winding_1phase_secondary_value
                } else if (this.winding_config.prim === WindingConnection.Y && (this.winding_config.sec.i === WindingConnection.Z || this.winding_config.sec.i === WindingConnection.Zn)) {
                    return two_winding_3phase_secondary_value_odd.filter((item) => item.value !== '3' && item.value !== '9')
                } else if (this.winding_config.prim === WindingConnection.Yn && this.winding_config.sec.i === WindingConnection.D) {
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
                if (this.winding_config.prim === WindingConnection.Yn) {
                    return two_winding_3phase_secondary_i.filter((item) => item.value === WindingConnection.D || item.value === WindingConnection.Y || item.value === WindingConnection.Yn)
                } else {
                    return two_winding_3phase_secondary_i
                }
            } else if (this.asset_type === 'Three-winding' && this.asset_phase === '1') {
                return two_winding_1phase_secondary_i
            } else if (this.asset_type === 'Auto w/ tert' && this.asset_phase === '3') {
                if(this.winding_config.prim === 'YyNa') {
                    return two_winding_3phase_secondary_i.filter((item) => !item.value.includes(WindingConnection.Z))
                }
            }
            else {
                if (this.winding_config.prim === WindingConnection.Yn) {
                    return two_winding_3phase_secondary_i.filter((item) => item.value === WindingConnection.D || item.value === WindingConnection.Y || item.value === WindingConnection.Yn)
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
                    this.winding_config.prim === WindingConnection.D &&
                    (this.winding_config.tert.i === WindingConnection.D || this.winding_config.tert.i === WindingConnection.Z || this.winding_config.tert.i === WindingConnection.Zn)
                ) {
                    return two_winding_3phase_secondary_value_even
                } else if (this.winding_config.prim === WindingConnection.D) {
                    return two_winding_3phase_secondary_value_odd
                } else if (this.winding_config.prim === WindingConnection.Y && this.winding_config.tert.i === WindingConnection.D) {
                    return two_winding_3phase_secondary_value_odd
                } else if (this.winding_config.prim === WindingConnection.Y && (this.winding_config.tert.i === WindingConnection.Y || this.winding_config.tert.i === WindingConnection.Yn)) {
                    return two_winding_1phase_secondary_value
                } else if (this.winding_config.prim === WindingConnection.Y && (this.winding_config.tert.i === WindingConnection.Z || this.winding_config.tert.i === WindingConnection.Zn)) {
                    return two_winding_3phase_secondary_value_odd.filter((item) => item.value !== '3' && item.value !== '9')
                } else if (this.winding_config.prim === WindingConnection.Yn && this.winding_config.tert.I === WindingConnection.D) {
                    return two_winding_3phase_secondary_value_odd
                } else if (this.winding_config.prim === 'YyNa' && this.winding_config.tert.I === WindingConnection.D) {
                    return two_winding_3phase_secondary_value_odd
                }
                else {
                    return two_winding_1phase_secondary_value
                }
            }
        },
        handleTertAssessibleArray() {
            if (this.winding_config.tert.i === WindingConnection.D && this.winding_config.tert.value !== '') {
                return accessibility
            }
        },
        changePrim() {
            this.winding_config.sec.i = ''
            this.winding_config.sec.value = ''
            this.winding_config.tert.i = ''
            this.winding_config.tert.value = ''
            this.winding_config.tert.accessible = ''
        },
        changeSecI() {
            this.winding_config.sec.value = ''
            this.winding_config.tert.i = ''
            this.winding_config.tert.value = ''
            this.winding_config.tert.accessible = ''
        },
        changeTertI() {
            this.winding_config.tert.value = ''
            this.winding_config.tert.accessible = ''
        },
    },
    watch: {
        asset_winding_config(val) {
            this.winding_config = JSON.parse(JSON.stringify(val))
        }
    }
}
</script>

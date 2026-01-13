<template>
    <el-dialog title="Edit Vector Group" :visible="openDialog" :modal="true" :append-to-body="true"
        @close="handleCancel">
        <div class="vector-group">
            Vector group: <b style="text-transform: uppercase">{{ vectorGroup }}</b>
        </div>
        <el-form :model="winding_config" label-position="top" class="vector-form">
            <el-row :gutter="12" align="top">
                <el-col :xs="24" :lg="8">
                    <!-- prim -->
                    <el-form-item label="Primary (Prim)">
                        <el-select size="small" @change="changePrim" v-model="winding_config.prim" placeholder="Select"
                            style="width: 100%">
                            <el-option v-for="item in handlePrimArray()" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <!-- secondary -->
                <el-col :xs="24" :lg="8"
                    v-if="this.winding_config.prim !== '' && this.asset_type !== $constant.WITHOUT_TERT && this.asset_type !== $constant.WITH_TERT"
                    class="vertical-col">
                    <!-- secondary I -->
                    <el-form-item label="Secondary I (Sec I)">
                        <el-select size="small" @change="changeSecI" v-model="winding_config.sec.i" placeholder="Select"
                            style="width: 100%">
                            <el-option v-for="item in handleSecIArray()" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <!-- secondary value -->
                    <el-form-item v-if="this.winding_config.sec.i !== ''" label="Secondary value (Sec value)">
                        <el-select size="small" v-model="winding_config.sec.value" placeholder="Select"
                            style="width: 100%">
                            <el-option v-for="item in handleSecValueArray()" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <!-- tertiary -->
                <el-col :xs="24" :lg="8"
                    v-if="(this.asset_type === 'Three-winding' && this.winding_config.prim !== '') || (this.asset_type === 'Auto w/ tert' && this.winding_config.prim !== '')">
                    <!-- tert I -->
                    <el-form-item label="Tertiary I (Tert I)">
                        <el-select size="small" @change="changeTertI" v-model="winding_config.tert.i"
                            placeholder="Select" style="width: 100%">
                            <el-option v-for="item in handleTertIArray()" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <!-- tert value -->
                    <el-form-item
                        v-if="(this.asset_type === 'Three-winding' || this.asset_type === 'Auto w/ tert') && this.winding_config.tert.i !== ''"
                        label="Tertiary value (Tert Value)">
                        <el-select size="small" @change="winding_config.tert.accessible = ''"
                            v-model="winding_config.tert.value" placeholder="Select" style="width: 100%">
                            <el-option v-for="item in handleTertValueArray()" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <!-- tert assessibility -->
                    <el-form-item v-if="this.winding_config.tert.i === 'D' && this.winding_config.tert.value !== ''"
                        label="Tertiary Accessibility">
                        <el-select size="small" v-model="winding_config.tert.accessible" placeholder="Select"
                            style="width: 100%">
                            <el-option v-for="item in handleTertAssessibleArray()" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <span slot="footer" class="dialog-footer custom-footer">
            <el-button class="footer-btn" type="danger" size="small" @click="handleCancel">Cancel</el-button>
            <el-button class="footer-btn" type="primary" size="small" @click="handleClose">Confirm</el-button>
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
                for (let index in mapData) {
                    if (mapData[index].value == data) {
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
            } else if ((this.asset_type === 'Auto w/o tert' || this.asset_type === 'Auto w/ tert') && this.asset_phase === '3') {
                return [{
                    value: 'YyNa',
                    label: 'YyNa'
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
                if (this.winding_config.prim === 'YyNa') {
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

<style lang="scss" scoped>
::v-deep(.el-dialog) {
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 50%;
}

::v-deep(.el-dialog__body) {
    padding: 10px 20px;
    overflow-y: auto;
    flex: 1;
}

::v-deep(.vector-group) {
    margin-bottom: 20px;
}

::v-deep(.vector-form .el-form-item) {
    margin-bottom: 10px;
}

::v-deep(.vector-form .el-form-item__label) {
    white-space: normal;
    word-break: keep-all;
    overflow-wrap: break-word;
    line-height: 1.2;
    padding-bottom: 4px;
}

::v-deep(.vertical-col) {
    display: flex;
    flex-direction: column;
}

::v-deep(.custom-footer) {
    display: flex;
    justify-content: space-between;
    gap: 12px;
}

::v-deep(.custom-footer .footer-btn) {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 1199px) {
    ::v-deep(.el-dialog) {
        width: 35%;
    }
}

@media (max-width: 767px) {
    ::v-deep(.custom-footer) {
        flex-direction: column;
        align-items: stretch;
    }

    ::v-deep(.custom-footer .footer-btn) {
        width: 100%;
        margin: 0;
    }
}
</style>
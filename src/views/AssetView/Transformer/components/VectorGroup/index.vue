<template>
    <el-dialog title="Edit Vector Group" :visible="openDialog" :modal="true" :append-to-body="true"
        :close-on-click-modal="false" custom-class="vector-group-dialog" @close="handleCancel">
        <div class="vector-group-summary">
            Vector group: <b>{{ vectorGroup }}</b>
        </div>

        <div class="vector-columns" :class="`columns-${visibleColumnCount}`">
            <section class="vector-column">
                <h3>Primary (Prim)</h3>
                <div class="picker-panel">
                    <div class="picker-title">Winding configuration</div>
                    <div class="visual-options">
                        <button v-for="item in handlePrimArray()" :key="item.value" type="button"
                            class="vector-option" :class="{ selected: winding_config.prim === item.value }"
                            :title="item.label" @click="selectPrim(item.value)">
                            <span class="option-code">{{ item.label }}</span>
                            <img :src="vectorImage(item.value)" :alt="`${item.label} winding configuration`">
                        </button>
                    </div>
                </div>
            </section>

            <section v-if="showSecondary" class="vector-column">
                <h3>Secondary (Sec)</h3>
                <div class="winding-pickers">
                    <div class="picker-panel">
                        <div class="picker-title">Winding configuration</div>
                        <div class="visual-options">
                            <button v-for="item in handleSecIArray()" :key="item.value" type="button"
                                class="vector-option" :class="{ selected: winding_config.sec.i === item.value }"
                                :title="item.label" @click="selectSecI(item.value)">
                                <span class="option-code">{{ item.label }}</span>
                                <img :src="vectorImage(item.value)" :alt="`${item.label} winding configuration`">
                            </button>
                        </div>
                    </div>

                    <div v-if="winding_config.sec.i" class="picker-panel">
                        <div class="picker-title">Phase shift</div>
                        <div class="visual-options">
                            <button v-for="item in handleSecValueArray()" :key="item.value" type="button"
                                class="vector-option" :class="{ selected: winding_config.sec.value === item.value }"
                                :title="`${winding_config.sec.i}${item.label}`" @click="selectSecValue(item.value)">
                                <span class="option-code">{{ vectorOptionCode(winding_config.sec.i, item.label) }}</span>
                                <img :src="vectorImage(winding_config.sec.i, item.value)"
                                    :alt="`${winding_config.sec.i}${item.label} phase shift`">
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section v-if="showTertiary" class="vector-column">
                <h3>Tertiary (Tert)</h3>
                <div class="winding-pickers">
                    <div class="picker-panel">
                        <div class="picker-title">Winding configuration</div>
                        <div class="visual-options">
                            <button v-for="item in handleTertIArray()" :key="item.value" type="button"
                                class="vector-option" :class="{ selected: winding_config.tert.i === item.value }"
                                :title="item.label" @click="selectTertI(item.value)">
                                <span class="option-code">{{ item.label }}</span>
                                <img :src="vectorImage(item.value)" :alt="`${item.label} winding configuration`">
                            </button>
                        </div>
                    </div>

                    <div v-if="winding_config.tert.i" class="picker-panel">
                        <div class="picker-title">Phase shift</div>
                        <div class="visual-options">
                            <button v-for="item in handleTertValueArray()" :key="item.value" type="button"
                                class="vector-option" :class="{ selected: winding_config.tert.value === item.value }"
                                :title="`${winding_config.tert.i}${item.label}`" @click="selectTertValue(item.value)">
                                <span class="option-code">{{ vectorOptionCode(winding_config.tert.i, item.label) }}</span>
                                <img :src="vectorImage(winding_config.tert.i, item.value)"
                                    :alt="`${winding_config.tert.i}${item.label} phase shift`">
                            </button>
                        </div>
                    </div>
                </div>

                <el-form v-if="winding_config.tert.i === 'D' && winding_config.tert.value !== ''"
                    label-position="top" class="accessibility-form">
                    <el-form-item label="Tertiary Accessibility">
                        <el-select size="small" v-model="winding_config.tert.accessible" placeholder="Select"
                            style="width: 100%">
                            <el-option v-for="item in handleTertAssessibleArray()" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-form>
            </section>
        </div>
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

const vectorImageContext = require.context('@/assets/vector-group', false, /\.svg$/)
const vectorImages = {}
vectorImageContext.keys().forEach((key) => {
    const name = key.replace('./', '').replace('.svg', '')
    const image = vectorImageContext(key)
    vectorImages[name] = image.default || image
})

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
        showSecondary() {
            return this.winding_config.prim !== '' &&
                this.asset_type !== this.$constant.WITHOUT_TERT &&
                this.asset_type !== this.$constant.WITH_TERT
        },

        showTertiary() {
            return this.winding_config.prim !== '' &&
                (this.asset_type === this.$constant.THREE_WINDING || this.asset_type === this.$constant.WITH_TERT)
        },

        visibleColumnCount() {
            if (this.showTertiary) return 3
            if (this.showSecondary) return 2
            return 1
        },

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
        normalizeVectorConnection(connection) {
            if (!connection) return ''
            if (connection === 'YyNa') return connection
            if (connection.indexOf(WindingConnection.I) === 0) return 'I'
            if (connection === WindingConnection.Yn) return 'YN'
            if (connection === WindingConnection.Zn) return 'ZN'
            return connection
        },

        vectorImage(connection, phaseShift) {
            const normalizedConnection = this.normalizeVectorConnection(connection)
            const hasPhaseShift = phaseShift !== undefined && phaseShift !== null && phaseShift !== ''
            const imageName = `${normalizedConnection}${hasPhaseShift ? phaseShift : ''}`
            return vectorImages[imageName] || ''
        },

        vectorOptionCode(connection, phaseShift) {
            return `${this.normalizeVectorConnection(connection)}${phaseShift}`
        },

        selectPrim(value) {
            if (this.winding_config.prim === value) return
            this.winding_config.prim = value
            this.changePrim()
        },

        selectSecI(value) {
            if (this.winding_config.sec.i === value) return
            this.winding_config.sec.i = value
            this.changeSecI()
        },

        selectSecValue(value) {
            this.winding_config.sec.value = value
        },

        selectTertI(value) {
            if (this.winding_config.tert.i === value) return
            this.winding_config.tert.i = value
            this.changeTertI()
        },

        selectTertValue(value) {
            this.winding_config.tert.value = value
            this.winding_config.tert.accessible = ''
        },

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
                } else if (this.winding_config.prim === WindingConnection.Yn && this.winding_config.tert.i === WindingConnection.D) {
                    return two_winding_3phase_secondary_value_odd
                } else if (this.winding_config.prim === 'YyNa' && this.winding_config.tert.i === WindingConnection.D) {
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
::v-deep(.vector-group-dialog) {
    width: 94vw;
    max-width: 1480px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

::v-deep(.vector-group-dialog .el-dialog__body) {
    padding: 8px 20px 16px;
    overflow-y: auto;
    flex: 1;
}

.vector-group-summary {
    margin-bottom: 14px;
    color: #303846;
    font-size: 15px;
}

.vector-group-summary b {
    color: #102f9f;
    text-transform: uppercase;
}

.vector-columns {
    display: grid;
    gap: 18px;
    align-items: start;
}

.vector-columns.columns-1 {
    grid-template-columns: minmax(320px, 480px);
}

.vector-columns.columns-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.vector-columns.columns-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.vector-column {
    min-width: 0;
}

.vector-column + .vector-column {
    border-left: 1px solid #d8dee8;
    padding-left: 18px;
}

.vector-column h3 {
    margin: 0 0 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #7b8797;
    color: #303846;
    font-size: 15px;
    font-weight: 600;
}

.winding-pickers {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    align-items: start;
}

.picker-panel {
    min-width: 0;
}

.picker-title {
    min-height: 30px;
    margin-bottom: 6px;
    color: #5a6472;
    font-size: 13px;
    line-height: 1.25;
}

.visual-options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
    gap: 7px;
}

.winding-pickers .visual-options {
    grid-template-columns: repeat(auto-fill, minmax(94px, 1fr));
}

.vector-option {
    position: relative;
    width: 100%;
    height: 122px;
    padding: 21px 5px 5px;
    border: 1px solid #aeb8c6;
    border-radius: 2px;
    background: #ffffff;
    color: #303846;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 120ms ease, background-color 120ms ease;
}

.vector-option:hover {
    border-color: #0b6fcf;
}

.vector-option:focus-visible {
    outline: 2px solid #0b6fcf;
    outline-offset: 1px;
}

.vector-option.selected {
    border-color: #0b6fcf;
    background: #247fd6;
    color: #ffffff;
}

.option-code {
    position: absolute;
    top: 5px;
    left: 7px;
    right: 7px;
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
    line-height: 15px;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.vector-option img {
    display: block;
    width: 92px;
    max-width: 100%;
    height: 92px;
    margin: 0 auto;
    object-fit: contain;
}

.vector-option.selected img {
    filter: brightness(0) invert(1);
}

.accessibility-form {
    margin-top: 12px;
}

::v-deep(.accessibility-form .el-form-item) {
    margin-bottom: 0;
}

::v-deep(.accessibility-form .el-form-item__label) {
    padding-bottom: 4px;
    line-height: 1.2;
}

::v-deep(.custom-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
}

::v-deep(.custom-footer .footer-btn) {
    display: flex;
    flex: 0 0 110px;
    align-items: center;
    justify-content: center;
    width: 110px;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 1100px) {
    .vector-columns.columns-3 {
        grid-template-columns: 1fr;
    }

    .vector-column + .vector-column {
        border-left: 0;
        border-top: 1px solid #d8dee8;
        padding-top: 18px;
        padding-left: 0;
    }
}

@media (max-width: 767px) {
    ::v-deep(.vector-group-dialog) {
        width: 96vw;
    }

    .vector-columns.columns-2,
    .vector-columns.columns-3,
    .winding-pickers {
        grid-template-columns: 1fr;
    }

    .visual-options,
    .winding-pickers .visual-options {
        grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    }

}
</style>

<template>
    <div id="dc-winding-resistance-prim">

        <!-- Cấu hình -->
        <div style="position: sticky; left: 0; display: inline-block;">
        <el-row class="mgb-10">
            <el-col>
                <el-button class="btn-action" size="mini" type="success" @click="openAssessmentDialog = true">
                    <i class="fa-solid fa-screwdriver-wrench"></i> Assessment settings
                </el-button>
                <el-button class="btn-action" size="mini" type="success" @click="openConditionIndicatorDialog = true">
                    <i class="fa-solid fa-hammer"></i> Condition indicatior settings
                </el-button>
            </el-col>
        </el-row>

        <!-- Tương tác với bảng -->
        <el-row class="mgb-10">
            <el-col>
                <el-button size="mini" type="primary" class="btn-action" @click="calculator"> <i class="fas fa-circle-play"></i> Assess results </el-button>
                <el-button size="mini" type="primary" class="btn-action" @click="clear"> <i class="fas fa-xmark"></i> Clear all</el-button>
            </el-col>
        </el-row>
        </div>

        <div v-if="assetData && assetData.circuitBreaker && assetData.circuitBreaker.numberOfInterruptPhase === 1">
            <br />
            <table class="table-strip-input-data" style="width: 100%; font-size: 12px;">
                <thead class="test">
                    <th>Phase</th>
                    <th>I test (A)</th>
                    <th>Contact resistance (&#181;&#8486;)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">condition indicator</th>
                    <th @click="add()" class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th @click="removeAll()" class="action-col"><i class="fa-solid fa-trash pointer"></i></th>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in testData.table" :key="index">
                        <td>
                            <div style="display: flex; width: 100%;">
                                    <el-input size="mini" v-model="item.phase"></el-input>
                                    <div :class="{colorTableRed : item.phase=='A', colorTableYellow : item.phase=='B', colorTableBlue : item.phase=='C'}"></div>
                                </div>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.iTest"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.contactResistance"></el-input>
                        </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="item.assessment">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                                <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                            </el-select>
                            <span v-if="item.assessment === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                            <span v-else-if="item.assessment === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.condition_indicator"></el-input>
                        </td>
                        <td>
                            <el-button size="mini" type="primary" class="w-100" @click="addTest(index)">
                                <i class="fa-solid fa-plus"></i>
                            </el-button>
                        </td>
                        <td>
                            <el-button size="mini" type="danger" class="w-100" @click="deleteTest(index)">
                                <i class="fas fa-trash"></i>
                            </el-button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="assetData && assetData.circuitBreaker && assetData.circuitBreaker.numberOfInterruptPhase > 1">
            <br />
            <table class="table-strip-input-data" style="width: 100%; font-size: 12px;">
                <thead class="test">
                    <th>Phase</th>
                    <th>Interrupter no.</th>
                    <th>I test (A)</th>
                    <th>Contact resistance (&#181;&#8486;)</th>
                    <th class="assessment-col">Assessment</th>
                    <th class="condition-indicator-col">condition indicator</th>
                    <th class="action-col"><i class="fa-solid fa-plus pointer"></i></th>
                    <th class="action-col"><i class="fa-solid fa-trash pointer "></i></th>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in testData.table" :key="index">
                        <td v-if="index % assetData.circuitBreaker.numberOfInterruptPhase === 0" :rowspan="assetData.circuitBreaker.numberOfInterruptPhase">
                            <div style="display: flex; width: 100%;">
                                   <el-input size="mini" v-model="item.phase"></el-input>  
                                   <div :class="{colorTableRed : item.phase=='A', colorTableYellow : item.phase=='B', colorTableBlue : item.phase=='C'}"></div>
                                </div>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.interruptNo"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.iTest"></el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.contactResistance"></el-input>
                        </td>
                        <td>
                            <el-select class="assessment" size="mini" v-model="item.assessment">
                                <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                                <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                            </el-select>
                            <span v-if="item.assessment === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                            <span v-else-if="item.assessment === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                        </td>
                        <td>
                            <el-input size="mini" v-model="item.condition_indicator"></el-input>
                        </td>
                        <td>
                            <el-button size="mini" type="primary" class="w-100" @click="addTest(index)">
                                <i class="fa-solid fa-plus"></i>
                            </el-button>
                        </td>
                        <td>
                            <el-button size="mini" type="danger" class="w-100" @click="deleteTest(index)">
                                <i class="fas fa-trash"></i>
                            </el-button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

       
        <!-- Assessment settings -->
        <el-dialog append-to-body class="dialog_assess" title="Assessment settings" :visible.sync="openAssessmentDialog" width="75%">
            <el-radio-group v-model="testData.limits" style="margin-bottom: 20px">
                <el-radio label="Absolute" value="Absolute"></el-radio>
                <el-radio label="Relative" value="Relative"></el-radio>
            </el-radio-group>
            <transition>
            <table class="table-strip-input-data" v-if="testData.limits === 'Absolute'">
                <thead>
                    <tr>
                        <th></th>
                        <th>R min</th>
                        <th>R max</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Contact resistance</td>
                        <td>
                            <el-input size="mini" v-model="asset_.contactSys.abs.rmin">
                                <template slot="append">&#181;&#8486;</template>
                            </el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="asset_.contactSys.abs.rmax" >
                                <template slot="append">&#181;&#8486;</template>
                            </el-input>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table class="table-strip-input-data" v-if="testData.limits === 'Relative'">
                <thead>
                    <tr>
                        <th></th>
                        <th>R ref</th>
                        <th>R dev</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Contact resistance</td>
                        <td>
                            <el-input size="mini" v-model="asset_.contactSys.rel.rref">
                                <template slot="append">&#181;&#8486;</template>
                            </el-input>
                        </td>
                        <td>
                            <el-input size="mini" v-model="asset_.contactSys.rel.rdev" >
                                <template slot="append">&#181;&#8486;</template>
                            </el-input>
                        </td>
                    </tr>
                </tbody>
            </table>
            </transition>
            <br />
            <template #footer>
                <span style="margin-top: 20px; width: 100%; position: absolute; right: 10px; bottom: 10px" class="dialog-footer">
                    <el-button @click="resetAssessment">Cancel</el-button>
                    <el-button type="primary" @click="updateAssessment"> Confirm </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name :"contactResistance",
    data() {
        return {
            openAssessmentDialog: false,
            openConditionIndicatorDialog: false,
            asset_: {
                contactSys: {
                    abs: {
                        rmin: '',
                        rmax: '',
                        mrid: ''
                    },
                    rel: {
                        rref: '',
                        rdev: '',
                        mrid: ''
                    }
                },
                limits: 'Absolute'
            },
            back_asset: {},
        }
    },
    props: {
        data: {
            type: Object,
            require: true
        },
        asset: {
            type: Object,
            require: true
        }
    },
    beforeMount(){
        const asset = {
            id : this.asset.id,
            assessmentLimits : this.asset_
        }
        const dataTemp = JSON.parse(JSON.stringify(asset))
        this.back_asset = dataTemp.assessmentLimits
    },
    computed: {
        testData() {
            return this.data
        },
        assetData() {
            let circuitBreaker = {
                numberOfInterruptPhase: 1,
                numberOfPhase: 3
            }
            let operating = {
                numberCloseCoil: 1,
                numberTripCoil: 1
            }
            
            if (this.asset && this.asset.circuitBreaker) {
                if (typeof this.asset.circuitBreaker === 'string') {
                    try {
                        const parsed = JSON.parse(this.asset.circuitBreaker)
                        circuitBreaker = { ...circuitBreaker, ...parsed }
                    } catch (e) {
                        console.warn('Failed to parse circuitBreaker:', e)
                    }
                } else {
                    circuitBreaker = { ...circuitBreaker, ...this.asset.circuitBreaker }
                }
            }
            
            if (this.asset && this.asset.operating) {
                if (typeof this.asset.operating === 'string') {
                    try {
                        const parsed = JSON.parse(this.asset.operating)
                        operating = { ...operating, ...parsed }
                    } catch (e) {
                        console.warn('Failed to parse operating:', e)
                    }
                } else {
                    operating = { ...operating, ...this.asset.operating }
                }
            }
            
            return {
                circuitBreaker,
                operating
            }
        },
        assessLimitsData() {
            if (!this.asset || !this.asset.assessmentLimits) {
                return {}
            }
            
            // If it's already an object, return it directly
            if (typeof this.asset.assessmentLimits === 'object') {
                return this.asset.assessmentLimits
            }
            
            // If it's a string, try to parse it
            if (typeof this.asset.assessmentLimits === 'string') {
                try {
                    return JSON.parse(this.asset.assessmentLimits)
                } catch (error) {
                    console.warn('Error parsing assessmentLimits:', error)
                    return {}
                }
            }
            
            return {}
        }
    },
    watch: {
        assessLimitsData: {
            deep: true,
            immediate: true,
            handler: function (newVal) {
                if (newVal && Object.keys(newVal).length > 0) {
                    this.asset_ = this.normalizeAssessmentLimits(newVal)
                    // Update backup for reset
                    const dataTemp = JSON.parse(JSON.stringify(this.asset_ || {}))
                    this.back_asset = dataTemp
                    // Sync limits to testData
                    if (this.asset_.limits && this.testData) {
                        this.$set(this.testData, 'limits', this.asset_.limits)
                    }
                }
            }
        },
        'asset_.limits': {
            immediate: true,
            handler: function(newVal) {
                // Sync asset_.limits to testData.limits
                if (newVal && this.testData) {
                    this.$set(this.testData, 'limits', newVal)
                }
            }
        },
        openAssessmentDialog: {
            handler: function(newVal) {
                // When opening dialog, sync limits from asset_ to testData
                if (newVal && this.asset_ && this.asset_.limits && this.testData) {
                    this.$set(this.testData, 'limits', this.asset_.limits)
                }
            }
        }
    },
    methods: {
        normalizeAssessmentLimits(data) {
            if (!data || typeof data !== 'object') {
                data = {}
            }
            
            let normalized = {}
            try {
                normalized = JSON.parse(JSON.stringify(data))
            } catch (e) {
                normalized = {}
            }
            
            // Helper function to extract value safely
            const getValue = (obj) => {
                if (!obj) return ''
                if (typeof obj === 'string' || typeof obj === 'number') return String(obj)
                if (typeof obj === 'object' && obj.value !== undefined) return String(obj.value || '')
                return ''
            }
            
            // Always initialize contactSys structure first
            normalized.contactSys = {
                abs: {
                    rmin: '',
                    rmax: '',
                    mrid: ''
                },
                rel: {
                    rref: '',
                    rdev: '',
                    mrid: ''
                }
            }
            
            // Normalize from contact_resistance structure (from backend DTO)
            if (data.contact_resistance) {
                const contactRes = data.contact_resistance
                
                if (contactRes.abs) {
                    normalized.contactSys.abs.rmin = getValue(contactRes.abs.r_min) || getValue(contactRes.abs.rmin) || ''
                    normalized.contactSys.abs.rmax = getValue(contactRes.abs.r_max) || getValue(contactRes.abs.rmax) || ''
                    normalized.contactSys.abs.mrid = contactRes.abs.mrid || contactRes.mrid || ''
                }
                
                if (contactRes.rel) {
                    normalized.contactSys.rel.rref = getValue(contactRes.rel.r_ref) || getValue(contactRes.rel.rref) || ''
                    normalized.contactSys.rel.rdev = getValue(contactRes.rel.r_dev) || getValue(contactRes.rel.rdev) || ''
                    normalized.contactSys.rel.mrid = contactRes.rel.mrid || contactRes.mrid || ''
                }
            }
            // Normalize from contact_system structure if exists
            else if (data.contact_system) {
                const contactSys = data.contact_system
                
                if (contactSys.abs) {
                    normalized.contactSys.abs.rmin = getValue(contactSys.abs.r_min) || getValue(contactSys.abs.rmin) || ''
                    normalized.contactSys.abs.rmax = getValue(contactSys.abs.r_max) || getValue(contactSys.abs.rmax) || ''
                    normalized.contactSys.abs.mrid = contactSys.abs.mrid || ''
                }
                
                if (contactSys.rel) {
                    normalized.contactSys.rel.rref = getValue(contactSys.rel.r_ref) || getValue(contactSys.rel.rref) || ''
                    normalized.contactSys.rel.rdev = getValue(contactSys.rel.r_dev) || getValue(contactSys.rel.rdev) || ''
                    normalized.contactSys.rel.mrid = contactSys.rel.mrid || ''
                }
            }
            // Normalize from contactSys structure if exists
            else if (data.contactSys) {
                normalized.contactSys.abs.rmin = getValue(data.contactSys.abs?.rmin) || ''
                normalized.contactSys.abs.rmax = getValue(data.contactSys.abs?.rmax) || ''
                normalized.contactSys.abs.mrid = data.contactSys.abs?.mrid || ''
                normalized.contactSys.rel.rref = getValue(data.contactSys.rel?.rref) || ''
                normalized.contactSys.rel.rdev = getValue(data.contactSys.rel?.rdev) || ''
                normalized.contactSys.rel.mrid = data.contactSys.rel?.mrid || ''
            }
            
            if (!normalized.limits) {
                normalized.limits = data.limits || 'Absolute'
            }
            
            return normalized
        },
        resetAssessment() {
            this.asset_ = JSON.parse(JSON.stringify(this.back_asset))
            // Sync limits back to testData after reset
            if (this.asset_.limits && this.testData) {
                this.$set(this.testData, 'limits', this.asset_.limits)
            }
            this.openAssessmentDialog = false
        },
        async updateAssessment() {
            // Sync testData.limits to asset_.limits before saving
            if (this.testData.limits) {
                this.asset_.limits = this.testData.limits
            }
            const asset = {
                id: this.asset.id,
                assessmentLimits: this.asset_
            }
            const data = await window.electronAPI.updateCircuitAssessmentLimits(asset)
            const dataTemp = JSON.parse(JSON.stringify(asset))
            this.back_asset = dataTemp.assessmentLimits
            if (data.success) {
                this.$message.success('Update successfully')
                this.openAssessmentDialog = false
            } else {
                this.$message.error('Update cannot complete')
                this.openAssessmentDialog = false
            }
        },
        calculator() {
            this.$message.success('Calculating successfully')
            this.testData.table.forEach(item => {
                if (this.testData.limits === 'Absolute'){
                    if (parseFloat(item.contactResistance) >= parseFloat(this.asset_.contactSys.abs.rmin) && 
                    parseFloat(item.contactResistance) <= parseFloat(this.asset_.contactSys.abs.rmax)){
                        item.assessment = 'Pass'
                    }
                    else {
                        item.assessment = 'Fail'
                    }
                }
                if(this.testData.limits === 'Relative'){
                    if (parseFloat(item.contactResistance) >= parseFloat(this.asset_.contactSys.rel.rref) - parseFloat(this.asset_.contactSys.rel.rdev) &&
                    parseFloat(item.contactResistance) <= parseFloat(this.asset_.contactSys.rel.rref) + parseFloat(this.asset_.contactSys.rel.rdev)){
                        item.assessment = 'Pass'
                    }
                    else {
                        item.assessment = 'Fail'
                    }
                }
            })
        },

        clear() {
            this.testData.table.forEach((element) => {
                    Object.keys(element).forEach((key) => {
                        element[key] = ''
                })
            })
        },
        nameColor(data) {
            if (data === this.$constant.GOOD) {
                return 'Good'
            } else if (data === this.$constant.FAIR) {
                return 'Fair'
            } else if (data === this.$constant.POOR) {
                return 'Poor'
            } else if (data === this.$constant.BAD) {
                return 'Bad'
            } else {
                return
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.test {
    th:not(:nth-child(1)) {
        white-space: nowrap;
    }
    th:nth-child(1) {
        min-width: 50px;
    }
} 
th {
    text-align: center;
}
.table-strip-input-data {
    th, td {
        border-right: 1px solid #fff;
        &:last-child {
            border-right: none;
        }
    }
}
.flex-container {
    display: flex;
    flex-direction: column;

    div {
        padding: 1px;
    }
}
.Good input {
    background: #00CC00;
}

.Fair input {
    background: #ffff00;
}

.Poor input {
    background: #ff9900;
}

.Bad input {
    background: #ff3300;
}
</style>

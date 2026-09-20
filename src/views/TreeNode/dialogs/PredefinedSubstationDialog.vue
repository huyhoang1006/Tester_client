<template>
    <el-dialog
        title="Create Substation from Predefined Configuration"
        :visible="visible"
        width="94%"
        top="3vh"
        custom-class="substation-wizard-dialog"
        :close-on-click-modal="false"
        @close="closeDialog"
    >
        <div class="wizard-shell">
            <el-steps :active="activeStep" finish-status="success" simple class="wizard-steps">
                <el-step title="Structure"></el-step>
                <el-step title="Configure"></el-step>
                <el-step title="Review"></el-step>
                <el-step title="Result"></el-step>
            </el-steps>

            <section v-if="activeStep === 0" class="wizard-page structure-page">
                <div class="section-heading">
                    <div>
                        <h3>Structure</h3>
                        <p>Select the primary busbar arrangement for the new substation.</p>
                    </div>
                </div>
                <div class="scheme-grid">
                    <button
                        type="button"
                        class="scheme-option"
                        :class="{ selected: config.scheme === 'h' }"
                        @click="selectScheme('h')"
                    >
                        <span class="scheme-title">H Scheme</span>
                        <span class="scheme-note">Two 110 kV busbars with coupler 112</span>
                        <span class="sld h-sld" aria-label="H scheme preview">
                            <span class="bus bus-left"></span>
                            <span class="bus bus-right"></span>
                            <span class="coupler"></span>
                            <span class="sld-label label-left">C11</span>
                            <span class="sld-label label-right">C12</span>
                            <span class="sld-label label-coupler">112</span>
                        </span>
                    </button>
                    <button
                        type="button"
                        class="scheme-option"
                        :class="{ selected: config.scheme === 'single' }"
                        @click="selectScheme('single')"
                    >
                        <span class="scheme-title">Single Busbar</span>
                        <span class="scheme-note">One 110 kV busbar without coupler</span>
                        <span class="sld single-sld" aria-label="Single busbar preview">
                            <span class="single-bus"></span>
                            <span v-for="n in 4" :key="n" class="single-feeder" :style="{ left: `${18 + (n - 1) * 21}%` }"></span>
                            <span class="sld-label single-label">C11</span>
                        </span>
                    </button>
                </div>
            </section>

            <section v-else-if="activeStep === 1" class="wizard-page configure-page">
                <div class="configure-toolbar">
                    <div>
                        <h3>Configure {{ schemeLabel(config.scheme) }}</h3>
                        <span class="configure-note">Changes are kept while this wizard is open.</span>
                    </div>
                </div>

                <section class="form-section">
                    <h4>Substation information</h4>
                    <div class="form-grid four-columns">
                        <label class="field span-two">
                            <span>Substation name <b>*</b></span>
                            <el-input v-model.trim="config.substation.name" size="mini" placeholder="Enter substation name"></el-input>
                        </label>
                        <label class="field">
                            <span>Frequency</span>
                            <el-input v-model="config.substation.frequency" size="mini" disabled><template slot="append">Hz</template></el-input>
                        </label>
                        <label class="field">
                            <span>Naming policy</span>
                            <el-select v-model="config.substation.namingPolicy" size="mini" disabled>
                                <el-option label="TCVN 8215:2021" value="TCVN 8215:2021"></el-option>
                            </el-select>
                        </label>
                        <label class="field">
                            <span>HV system voltage</span>
                            <el-input v-model="config.substation.hvVoltage" size="mini" disabled><template slot="append">kV</template></el-input>
                        </label>
                        <label class="field">
                            <span>MV system voltage</span>
                            <el-input v-model="config.substation.mvVoltage" size="mini" disabled><template slot="append">kV</template></el-input>
                        </label>
                        <label class="field">
                            <span>110 kV line bays</span>
                            <el-input-number v-model="config.lineBayCount" :min="0" :max="30" size="mini" controls-position="right"></el-input-number>
                        </label>
                        <label class="field">
                            <span>Power transformers</span>
                            <el-input-number
                                v-model="config.transformerCount"
                                :min="config.scheme === 'h' ? 2 : 1"
                                :max="4"
                                size="mini"
                                controls-position="right"
                                @change="syncTransformers"
                            ></el-input-number>
                        </label>
                    </div>
                </section>

                <section class="form-section">
                    <h4>Power transformers</h4>
                    <el-collapse v-model="openTransformers">
                        <el-collapse-item v-for="(transformer, index) in config.transformers" :key="index" :name="index">
                            <template slot="title">
                                <strong>T{{ index + 1 }}</strong>
                                <span class="collapse-summary">{{ transformer.busbar }} · {{ transformer.ratedPower }} MVA · {{ transformer.vectorGroup }}</span>
                            </template>
                            <div class="inline-actions" v-if="index > 0">
                                <el-button size="mini" icon="fa-solid fa-copy" @click.stop="copyTransformerOne(index)">Same configuration as T1</el-button>
                            </div>
                            <div class="form-grid four-columns">
                                <label class="field"><span>Transformer type</span><el-select v-model="transformer.type" size="mini"><el-option label="Three-winding" value="Three-winding"></el-option></el-select></label>
                                <label class="field"><span>Busbar</span><el-select v-model="transformer.busbar" size="mini"><el-option label="C11" value="C11"></el-option><el-option v-if="config.scheme === 'h'" label="C12" value="C12"></el-option></el-select></label>
                                <label class="field"><span>22 kV voltage level</span><el-select v-model="transformer.mvLevel" size="mini"><el-option v-for="level in availableMvLevels" :key="level" :label="level" :value="level"></el-option></el-select></label>
                                <label class="field"><span>Status</span><el-select v-model="transformer.status" size="mini"><el-option label="In operation" value="In operation"></el-option><el-option label="Spare" value="Spare"></el-option></el-select></label>
                                <label class="field"><span>Manufacturer</span><el-input v-model="transformer.manufacturer" size="mini"></el-input></label>
                                <label class="field"><span>Manufacturing year</span><el-input v-model="transformer.manufacturingYear" size="mini"></el-input></label>
                                <label class="field"><span>Country of origin</span><el-input v-model="transformer.country" size="mini"></el-input></label>
                                <label class="field"><span>Number of phase</span><el-input value="3" size="mini" disabled></el-input></label>
                                <label class="field"><span>Rated power</span><el-input v-model="transformer.ratedPower" size="mini"><template slot="append">MVA</template></el-input></label>
                                <label class="field"><span>Vector group</span><el-input v-model="transformer.vectorGroup" size="mini"></el-input></label>
                                <label class="field"><span>Prim rated voltage</span><el-input v-model="transformer.primVoltage" size="mini"><template slot="append">kV</template></el-input></label>
                                <label class="field"><span>Sec rated voltage</span><el-input v-model="transformer.secVoltage" size="mini"><template slot="append">kV</template></el-input></label>
                                <label class="field"><span>Tert rated voltage</span><el-input v-model="transformer.tertVoltage" size="mini"><template slot="append">kV</template></el-input></label>
                                <label class="field"><span>Tap changer type</span><el-select v-model="transformer.tapChangerType" size="mini"><el-option label="OLTC" value="OLTC"></el-option><el-option label="DETC" value="DETC"></el-option></el-select></label>
                                <label class="field"><span>Number of taps</span><el-input-number v-model="transformer.numberOfTaps" :min="1" :max="99" size="mini" controls-position="right"></el-input-number></label>
                                <label class="field"><span>Principal tap voltage</span><el-input v-model="transformer.principalTapVoltage" size="mini"><template slot="append">V</template></el-input></label>
                                <label class="field"><span>Tap step</span><el-input v-model="transformer.tapStep" size="mini"><template slot="append">%</template></el-input></label>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </section>

                <section class="form-section">
                    <h4>22 kV voltage levels</h4>
                    <el-table :data="mvLevelRows" size="mini" border>
                        <el-table-column prop="name" label="Voltage level" width="140"></el-table-column>
                        <el-table-column label="Line bays"><template slot-scope="scope"><el-input-number v-model="scope.row.value.lineBays" :min="0" :max="40" size="mini" controls-position="right"></el-input-number></template></el-table-column>
                        <el-table-column label="VT (TUC) bays"><template slot-scope="scope"><el-input-number v-model="scope.row.value.vtBays" :min="0" :max="5" size="mini" controls-position="right"></el-input-number></template></el-table-column>
                        <el-table-column label="Aux (TD) bays"><template slot-scope="scope"><el-input-number v-model="scope.row.value.auxBays" :min="0" :max="5" size="mini" controls-position="right"></el-input-number></template></el-table-column>
                        <el-table-column label="Capacitor bays"><template slot-scope="scope"><el-input-number v-model="scope.row.value.capacitorBays" :min="0" :max="5" size="mini" controls-position="right"></el-input-number></template></el-table-column>
                    </el-table>
                </section>

                <section class="form-section presets-section">
                    <h4>Optional equipment presets</h4>
                    <div class="equipment-switches">
                        <el-checkbox v-model="config.equipment.cb">Create CB</el-checkbox>
                        <el-checkbox v-model="config.equipment.ct">Create CT</el-checkbox>
                        <el-checkbox v-model="config.equipment.vt">Create VT in TUC bays</el-checkbox>
                    </div>
                    <el-tabs type="border-card">
                        <el-tab-pane label="CB 110 kV"><preset-cb-form :preset="config.presets.cb110"></preset-cb-form></el-tab-pane>
                        <el-tab-pane label="CB 22 kV"><preset-cb-form :preset="config.presets.cb22"></preset-cb-form></el-tab-pane>
                        <el-tab-pane label="CT"><div class="preset-summary-grid"><preset-ct-form title="110 kV line" :preset="config.presets.ct110Line"></preset-ct-form><preset-ct-form title="110 kV transformer/coupler" :preset="config.presets.ct110Transformer"></preset-ct-form><preset-ct-form title="22 kV" :preset="config.presets.ct22"></preset-ct-form></div></el-tab-pane>
                        <el-tab-pane label="VT"><div class="preset-summary-grid two"><preset-vt-form title="110 kV" :preset="config.presets.vt110"></preset-vt-form><preset-vt-form title="22 kV" :preset="config.presets.vt22"></preset-vt-form></div></el-tab-pane>
                    </el-tabs>
                </section>
            </section>

            <section v-else-if="activeStep === 2" class="wizard-page review-page">
                <div class="review-header">
                    <div><h3>Review</h3><p>Review the configuration before creating database records.</p></div>
                </div>
                <el-alert v-if="validationErrors.length" title="Configuration has errors" type="error" :closable="false">
                    <ul><li v-for="error in validationErrors" :key="error">{{ error }}</li></ul>
                </el-alert>
                <el-alert v-if="generatedErrors.length" title="Generated structure has conflicts" type="error" :closable="false">
                    <ul><li v-for="error in generatedErrors" :key="error">{{ error }}</li></ul>
                </el-alert>
                <div class="review-metrics">
                    <div><span>Configuration</span><strong>{{ schemeLabel(config.scheme) }}</strong></div>
                    <div><span>110 kV line bays</span><strong>{{ config.lineBayCount }}</strong></div>
                    <div><span>Transformers</span><strong>{{ config.transformerCount }}</strong></div>
                    <div><span>Generated nodes</span><strong>{{ generatedNodeCount }}</strong></div>
                </div>
                <div class="review-layout">
                    <div class="review-panel">
                        <h4>Transformer placement</h4>
                        <el-table :data="transformerReview" size="mini" border>
                            <el-table-column prop="name" label="Transformer" width="110"></el-table-column>
                            <el-table-column prop="busbar" label="110 kV busbar"></el-table-column>
                            <el-table-column prop="bay" label="Bay"></el-table-column>
                            <el-table-column prop="mvLevel" label="22 kV level"></el-table-column>
                            <el-table-column prop="vectorGroup" label="Vector group"></el-table-column>
                        </el-table>
                    </div>
                    <div class="review-panel tree-preview">
                        <h4>Generated structure</h4>
                        <div class="tree-root"><i class="fa-solid fa-building"></i><strong>{{ config.substation.name }}</strong></div>
                        <div v-for="level in reviewLevels" :key="level.name" class="tree-level">
                            <div><i class="fa-solid fa-bolt"></i><strong>{{ level.name }}</strong><span>{{ level.bays.length }} bays</span></div>
                            <p>{{ level.bays.join(', ') }}</p>
                        </div>
                    </div>
                </div>
                <div class="review-detail-grid">
                    <div class="review-panel">
                        <h4>22 kV bay quantities</h4>
                        <el-table :data="mvLevelRows" size="mini" border>
                            <el-table-column prop="name" label="Level"></el-table-column>
                            <el-table-column label="Line"><template slot-scope="scope">{{ scope.row.value.lineBays }}</template></el-table-column>
                            <el-table-column label="TUC"><template slot-scope="scope">{{ scope.row.value.vtBays }}</template></el-table-column>
                            <el-table-column label="TD"><template slot-scope="scope">{{ scope.row.value.auxBays }}</template></el-table-column>
                            <el-table-column label="Capacitor"><template slot-scope="scope">{{ scope.row.value.capacitorBays }}</template></el-table-column>
                        </el-table>
                    </div>
                    <div class="review-panel">
                        <h4>CB defaults</h4>
                        <el-table :data="cbReview" size="mini" border>
                            <el-table-column prop="name" label="Preset"></el-table-column>
                            <el-table-column prop="type" label="Type"></el-table-column>
                            <el-table-column prop="ratedVoltage" label="Voltage"></el-table-column>
                            <el-table-column prop="ratedCurrent" label="Current"></el-table-column>
                            <el-table-column prop="breakingCurrent" label="Breaking"></el-table-column>
                        </el-table>
                    </div>
                    <div class="review-panel">
                        <h4>CT defaults</h4>
                        <el-table :data="ctReview" size="mini" border>
                            <el-table-column prop="name" label="Preset" min-width="150"></el-table-column>
                            <el-table-column prop="cores" label="Cores"></el-table-column>
                            <el-table-column prop="taps" label="Taps / core" min-width="120"></el-table-column>
                        </el-table>
                    </div>
                    <div class="review-panel">
                        <h4>VT defaults</h4>
                        <el-table :data="vtReview" size="mini" border>
                            <el-table-column prop="name" label="Preset"></el-table-column>
                            <el-table-column prop="type" label="Type"></el-table-column>
                            <el-table-column prop="upr" label="Upr"></el-table-column>
                            <el-table-column prop="windings" label="Windings"></el-table-column>
                        </el-table>
                    </div>
                </div>
            </section>

            <section v-else class="wizard-page result-page">
                <div class="result-mark"><i class="fa-solid fa-circle-check"></i></div>
                <h3>Substation Configuration - {{ schemeLabel(config.scheme) }}</h3>
                <p>{{ config.substation.name }} has been generated successfully.</p>
                <div class="result-actions">
                    <el-button size="mini" icon="fa-solid fa-code" @click="showJson = !showJson">Show JSON</el-button>
                    <el-button size="mini" icon="fa-solid fa-file-export" @click="exportJson">Export JSON</el-button>
                    <el-button size="mini" @click="createAnother">Create another substation</el-button>
                    <el-button size="mini" type="primary" @click="closeDialog">Done</el-button>
                </div>
                <pre v-if="showJson" class="json-preview">{{ formattedPayload }}</pre>
            </section>
        </div>

        <span v-if="activeStep < 3" slot="footer" class="wizard-footer">
            <el-button size="mini" @click="activeStep === 0 ? closeDialog() : previousStep()">{{ activeStep === 0 ? 'Cancel' : 'Back' }}</el-button>
            <el-button v-if="activeStep === 0" size="mini" type="primary" @click="activeStep = 1">Next</el-button>
            <el-button v-else-if="activeStep === 1" size="mini" type="primary" @click="openReview">Next</el-button>
            <el-button v-else size="mini" type="primary" :loading="creating" :disabled="validationErrors.length > 0 || generatedErrors.length > 0" @click="createSubstation">Finish</el-button>
        </span>
    </el-dialog>
</template>

<script>
import { buildSubstationBranch, countGeneratedNodes, validateGeneratedBranch } from '@/views/SubstationWizard/services/buildSubstationBranch'
import PresetCbForm from '@/views/SubstationWizard/components/PresetCbForm.vue'
import PresetCtForm from '@/views/SubstationWizard/components/PresetCtForm.vue'
import PresetVtForm from '@/views/SubstationWizard/components/PresetVtForm.vue'

const defaultTransformer = (index, scheme) => ({
    type: 'Three-winding',
    manufacturer: '',
    model: '',
    manufacturingYear: '',
    country: '',
    status: 'In operation',
    ratedPower: '63',
    vectorGroup: 'YnYn0D11',
    primVoltage: '115',
    secVoltage: '22',
    tertVoltage: '35',
    tapChangerType: 'OLTC',
    numberOfTaps: 19,
    principalTapVoltage: '115000',
    tapStep: '1.78',
    busbar: scheme === 'h' && index % 2 === 1 ? 'C12' : 'C11',
    mvLevel: `C4${index + 1}`
})

const defaultCoreProfile = (taps, fullIpn = '', fullIsn = '', mainTaps = []) => ({
    taps,
    commonTap: '1',
    fullIpn,
    fullIsn,
    mainTaps: JSON.parse(JSON.stringify(mainTaps))
})

const defaultCtPreset = (cores, taps, values = {}) => ({
    type: 'inductive',
    manufacturer: '',
    model: '',
    manufacturingYear: '',
    country: '',
    cores,
    primaryWindingCount: '',
    coreProfiles: Array.from({ length: cores }, () => defaultCoreProfile(
        taps,
        values.fullIpn || '',
        values.fullIsn || '',
        values.mainTaps || []
    ))
})

const defaultConfig = () => ({
    scheme: 'h',
    substation: { name: '', frequency: '50', hvVoltage: '110', mvVoltage: '22', namingPolicy: 'TCVN 8215:2021' },
    lineBayCount: 4,
    transformerCount: 2,
    transformers: [defaultTransformer(0, 'h'), defaultTransformer(1, 'h')],
    mvLevels: {
        C41: { lineBays: 4, vtBays: 1, auxBays: 1, capacitorBays: 1 },
        C42: { lineBays: 4, vtBays: 1, auxBays: 1, capacitorBays: 1 }
    },
    equipment: { cb: true, ct: true, vt: true },
    presets: {
        cb110: { type: 'Vacuum', manufacturer: '', model: '', manufacturingYear: '', country: '', interruptersPerPhase: '1', ratedVoltage: '110', ratedCurrent: '1250', breakingCurrent: '31.5', duration: '3', dutyCycle: 'O - 0.3s - CO - 3min - CO' },
        cb22: { type: 'Vacuum', manufacturer: '', model: '', manufacturingYear: '', country: '', interruptersPerPhase: '', ratedVoltage: '24', ratedCurrent: '1250', breakingCurrent: '125', duration: '3', dutyCycle: 'O - 0.3s - CO - 15s - CO' },
        ct110Line: defaultCtPreset(5, 4, { fullIpn: '1200', fullIsn: '1', mainTaps: [{ ipn: '400', isn: '1' }, { ipn: '800', isn: '1' }] }),
        ct110Transformer: defaultCtPreset(5, 3),
        ct22: defaultCtPreset(4, 3),
        vt110: { type: 'CVTCCTV', manufacturer: '', model: '', manufacturingYear: '', country: '', c1: '14300', c2: '14300', upr: '110', windings: [{ name: '1a1n', usr: '3', voltage: '110', burden: '50', powerFactor: '' }, { name: '2a2n', usr: '3sqrt', voltage: '110', burden: '50', powerFactor: '' }, { name: '3a3n', usr: '', voltage: '', burden: '', powerFactor: '' }] },
        vt22: { type: 'IVT', manufacturer: '', model: '', manufacturingYear: '', country: '', c1: '', c2: '', upr: '22', windings: [{ name: '1a1n', usr: '3sqrt', voltage: '110', burden: '50', powerFactor: '0.8' }, { name: '2a2n', usr: '3sqrt', voltage: '110', burden: '50', powerFactor: '0.8' }] }
    }
})

export default {
    name: 'PredefinedSubstationDialog',
    components: { PresetCbForm, PresetCtForm, PresetVtForm },
    props: {
        visible: { type: Boolean, default: false },
        uuidFactory: { type: Function, required: true }
    },
    data() {
        return {
            activeStep: 0,
            config: defaultConfig(),
            openTransformers: [0, 1],
            generatedBranch: null,
            creating: false,
            showJson: false
        }
    },
    computed: {
        availableMvLevels() {
            return Array.from({ length: this.config.transformerCount }, (_, index) => `C4${index + 1}`)
        },
        mvLevelRows() {
            return Object.keys(this.config.mvLevels)
                .filter((name) => this.config.transformers.some((transformer) => transformer.mvLevel === name))
                .map((name) => ({ name, value: this.config.mvLevels[name] }))
        },
        validationErrors() {
            const errors = []
            if (!this.config.substation.name.trim()) errors.push('Substation name is required.')
            const min = this.config.scheme === 'h' ? 2 : 1
            if (this.config.transformerCount < min || this.config.transformerCount > 4) errors.push(`Transformer quantity must be between ${min} and 4.`)
            if (this.config.transformers.some((item) => !item.busbar || !item.mvLevel)) errors.push('Every transformer must have a 110 kV busbar and a 22 kV voltage level.')
            return errors
        },
        transformerReview() {
            return this.config.transformers.map((item, index) => ({ name: `T${index + 1}`, busbar: item.busbar, bay: 131 + index, mvLevel: item.mvLevel, vectorGroup: item.vectorGroup }))
        },
        cbReview() {
            return [
                { name: 'CB 110 kV', ...this.config.presets.cb110, ratedVoltage: `${this.config.presets.cb110.ratedVoltage} kV`, ratedCurrent: `${this.config.presets.cb110.ratedCurrent} A`, breakingCurrent: `${this.config.presets.cb110.breakingCurrent} kA` },
                { name: 'CB 22 kV', ...this.config.presets.cb22, ratedVoltage: `${this.config.presets.cb22.ratedVoltage} kV`, ratedCurrent: `${this.config.presets.cb22.ratedCurrent} A`, breakingCurrent: `${this.config.presets.cb22.breakingCurrent} kA` }
            ]
        },
        ctReview() {
            return [
                ['110 kV line', this.config.presets.ct110Line],
                ['110 kV transformer/coupler', this.config.presets.ct110Transformer],
                ['22 kV', this.config.presets.ct22]
            ].map(([name, preset]) => ({
                name,
                cores: preset.cores,
                taps: (preset.coreProfiles || []).map((profile) => profile.taps).join(', ') || preset.taps
            }))
        },
        vtReview() {
            return [
                { name: 'VT 110 kV', ...this.config.presets.vt110, upr: `${this.config.presets.vt110.upr} kV`, windings: this.config.presets.vt110.windings.length },
                { name: 'VT 22 kV', ...this.config.presets.vt22, upr: `${this.config.presets.vt22.upr} kV`, windings: this.config.presets.vt22.windings.length }
            ]
        },
        reviewLevels() {
            if (!this.generatedBranch) return []
            return this.generatedBranch.children.map((level) => ({ name: level.data.name, bays: level.children.map((bay) => bay.data.name) }))
        },
        generatedNodeCount() {
            return this.generatedBranch ? countGeneratedNodes(this.generatedBranch) : 0
        },
        generatedErrors() {
            return this.generatedBranch ? validateGeneratedBranch(this.generatedBranch) : []
        },
        formattedPayload() {
            return JSON.stringify({ version: 2, roots: this.generatedBranch ? [this.generatedBranch] : [] }, null, 2)
        }
    },
    watch: {
        visible(value) {
            if (value) this.resetWizard()
        }
    },
    methods: {
        schemeLabel(scheme) { return scheme === 'h' ? 'H Scheme' : 'Single Busbar' },
        selectScheme(scheme) {
            if (this.config.scheme === scheme) return
            this.config.scheme = scheme
            if (scheme === 'h' && this.config.transformerCount < 2) this.config.transformerCount = 2
            this.syncTransformers(this.config.transformerCount)
        },
        syncTransformers(value) {
            const count = Number(value)
            while (this.config.transformers.length < count) this.config.transformers.push(defaultTransformer(this.config.transformers.length, this.config.scheme))
            this.config.transformers.splice(count)
            this.config.transformers.forEach((transformer, index) => {
                if (this.config.scheme === 'single') transformer.busbar = 'C11'
                if (!transformer.mvLevel) transformer.mvLevel = `C4${index + 1}`
                if (!this.config.mvLevels[transformer.mvLevel]) this.$set(this.config.mvLevels, transformer.mvLevel, { lineBays: 4, vtBays: 1, auxBays: 1, capacitorBays: 1 })
            })
            this.openTransformers = this.config.transformers.map((_, index) => index)
        },
        copyTransformerOne(index) {
            const placement = { busbar: this.config.transformers[index].busbar, mvLevel: this.config.transformers[index].mvLevel }
            this.$set(this.config.transformers, index, { ...JSON.parse(JSON.stringify(this.config.transformers[0])), ...placement })
        },
        openReview() {
            if (this.validationErrors.length) {
                this.$message.error(this.validationErrors[0])
                return
            }
            this.generatedBranch = buildSubstationBranch(this.config, this.uuidFactory)
            this.activeStep = 2
        },
        previousStep() { this.activeStep -= 1 },
        createSubstation() {
            if (this.validationErrors.length || this.generatedErrors.length || !this.generatedBranch) return
            this.creating = true
            this.$emit('create', {
                branch: this.generatedBranch,
                done: () => { this.creating = false; this.activeStep = 3 },
                fail: () => { this.creating = false }
            })
        },
        async exportJson() {
            const result = await window.electronAPI.exportJSON(
                { version: 2, roots: [this.generatedBranch] },
                { defaultFileName: `${this.config.substation.name || 'substation'}-configuration.json`, title: 'Export generated substation JSON' }
            )
            if (result && result.success) this.$message.success('JSON exported successfully')
        },
        resetWizard() {
            this.config = defaultConfig()
            this.generatedBranch = null
            this.activeStep = 0
            this.showJson = false
            this.creating = false
            this.openTransformers = [0, 1]
        },
        createAnother() { this.resetWizard() },
        closeDialog() {
            this.$emit('update:visible', false)
            this.$emit('close')
        }
    }
}
</script>

<style lang="scss">
.substation-wizard-dialog {
    max-width: 1500px;
    height: 94vh;
    margin-bottom: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.substation-wizard-dialog .el-dialog__body { flex: 1; min-height: 0; padding: 0 20px; overflow: hidden; }
.substation-wizard-dialog .el-dialog__footer { padding: 10px 20px; border-top: 1px solid #dfe4ec; }
.wizard-shell { height: 100%; display: flex; flex-direction: column; }
.wizard-steps { flex: 0 0 auto; margin-bottom: 12px; }
.wizard-page { flex: 1; min-height: 0; overflow-y: auto; padding: 4px 4px 18px; }
.section-heading, .configure-toolbar, .review-header { display: flex; justify-content: space-between; align-items: center; }
.section-heading h3, .configure-toolbar h3, .review-header h3, .result-page h3 { margin: 0 0 4px; font-size: 18px; }
.section-heading p, .review-header p, .result-page p { margin: 0; color: #7a8492; }
.section-heading.compact { margin-bottom: 10px; }
.scheme-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 18px 0 24px; }
.scheme-option { position: relative; min-height: 230px; padding: 18px; text-align: left; background: #fff; border: 1px solid #cfd7e3; border-radius: 6px; cursor: pointer; color: #273142; }
.scheme-option.selected { border: 2px solid #0b43b8; padding: 17px; box-shadow: 0 0 0 2px rgba(11, 67, 184, .08); }
.scheme-title { display: block; font-size: 17px; font-weight: 700; }
.scheme-note { display: block; margin-top: 4px; color: #77808d; }
.sld { position: relative; display: block; height: 140px; margin-top: 14px; background: #f7f9fc; border: 1px solid #e2e7ef; }
.bus { position: absolute; top: 22px; bottom: 28px; width: 4px; background: #173f77; }
.bus-left { left: 31%; }.bus-right { right: 31%; }
.coupler { position: absolute; top: 67px; left: 31%; right: 31%; height: 3px; background: #df001b; }
.coupler::before, .coupler::after { content: ''; position: absolute; top: -5px; width: 10px; height: 10px; background: #fff; border: 2px solid #173f77; border-radius: 50%; }
.coupler::before { left: -5px; }.coupler::after { right: -5px; }
.sld-label { position: absolute; font-size: 12px; font-weight: 700; }.label-left { left: 25%; bottom: 8px; }.label-right { right: 25%; bottom: 8px; }.label-coupler { top: 48px; left: calc(50% - 11px); color: #c80019; }
.single-bus { position: absolute; top: 55px; left: 10%; right: 10%; height: 4px; background: #173f77; }
.single-feeder { position: absolute; top: 55px; width: 3px; height: 58px; background: #173f77; }
.single-label { left: 47%; top: 25px; }
.form-section { border-top: 1px solid #dfe4ec; padding-top: 16px; margin-top: 16px; }
.configure-toolbar { position: sticky; top: 0; z-index: 3; padding: 8px 0 12px; background: #fff; border-bottom: 1px solid #dfe4ec; }
.configure-note { color: #7a8492; font-size: 12px; }
.form-section h4, .review-panel h4 { margin: 0 0 12px; font-size: 14px; color: #2d3748; }
.form-grid { display: grid; gap: 12px 16px; }.four-columns { grid-template-columns: repeat(4, minmax(0, 1fr)); }.span-two { grid-column: span 2; }
.field { display: flex; min-width: 0; flex-direction: column; gap: 5px; color: #555f6d; font-size: 12px; }.field > span b { color: #d9001b; }
.field .el-select, .field .el-input-number { width: 100%; }
.collapse-summary { margin-left: 14px; color: #7a8492; font-weight: 400; }
.inline-actions { display: flex; justify-content: flex-end; margin-bottom: 10px; }
.equipment-switches { display: flex; gap: 24px; margin-bottom: 14px; }
.preset-summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }.preset-summary-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.mini-preset { display: grid; gap: 10px; padding: 12px; border: 1px solid #dfe4ec; border-radius: 4px; }.mini-preset > strong { font-size: 13px; }
.preset-identity-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.core-profiles { border-top: 1px solid #dfe4ec; }
.core-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.main-taps { margin-top: 10px; }.main-taps-heading { display: flex; align-items: center; justify-content: space-between; color: #555f6d; font-size: 12px; }
.main-tap-row { display: grid; grid-template-columns: 54px 1fr auto 1fr 26px; gap: 6px; align-items: center; margin-top: 6px; color: #697381; font-size: 12px; }
.blank-value { padding: 8px 0; color: #9099a6; font-size: 12px; }
.winding-table { display: grid; gap: 6px; margin-top: 4px; }.winding-row { display: grid; grid-template-columns: 1fr 1.15fr 1fr 1fr .8fr; gap: 6px; align-items: center; }
.winding-header { color: #697381; font-size: 11px; font-weight: 600; }
.ratio-input { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 6px; }
.review-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 18px 0; }.review-metrics > div { padding: 14px; border: 1px solid #dfe4ec; border-radius: 4px; }.review-metrics span { display: block; color: #7a8492; font-size: 12px; }.review-metrics strong { display: block; margin-top: 5px; font-size: 16px; }
.review-layout { display: grid; grid-template-columns: 1.3fr 1fr; gap: 16px; }.review-panel { min-width: 0; }
.review-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
.tree-preview { border-left: 1px solid #dfe4ec; padding-left: 16px; }.tree-root, .tree-level > div { display: flex; align-items: center; gap: 8px; padding: 8px; }.tree-root { background: #edf3fd; }.tree-level { margin-left: 18px; border-left: 1px solid #aeb9c8; }.tree-level > div span { margin-left: auto; color: #7a8492; font-size: 12px; }.tree-level p { margin: 0 8px 8px 31px; color: #5d6775; font-size: 12px; line-height: 1.6; }
.wizard-footer { display: flex; justify-content: flex-end; gap: 8px; }
.result-page { text-align: center; padding-top: 54px; }.result-mark { color: #3a9134; font-size: 58px; }.result-actions { display: flex; justify-content: center; gap: 8px; margin-top: 24px; }.json-preview { max-height: 430px; margin-top: 22px; padding: 14px; overflow: auto; text-align: left; color: #dce8f5; background: #1d2735; border-radius: 4px; font-size: 11px; }
@media (max-width: 1050px) { .four-columns { grid-template-columns: repeat(2, minmax(0, 1fr)); }.review-layout, .review-detail-grid { grid-template-columns: 1fr; }.preset-identity-grid { grid-template-columns: 1fr; }.tree-preview { border-left: 0; padding-left: 0; }.review-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>

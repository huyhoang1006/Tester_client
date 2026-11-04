<template>
    <div class="word-workspace">
        <header class="word-heading">
            <div>
                <h1>Import Test Report</h1>
                <p>Import asset information and test results from a Word report</p>
            </div>
            <button class="word-quiet" type="button" @click="managerVisible = true"><i class="fa-solid fa-gear"></i> Template Manager</button>
        </header>
        <nav class="word-steps" aria-label="Import progress">
            <span
                v-for="(label, index) in ['Select & Upload', 'Review Data', 'Import Summary']"
                :key="label"
                :class="{current: step === index + 1, done: step > index + 1}"
                ><b>{{ index + 1 }}</b> {{ label }}</span
            >
        </nav>

        <main v-show="step === 1" class="word-content">
            <div class="word-setup">
                <section class="word-panel">
                    <h2>Target asset</h2>
                    <p class="word-help">Select the equipment whose report you are importing.</p>
                    <div v-if="target" class="word-selected">
                        <i class="fa-solid fa-bolt"></i
                        ><span
                            ><strong>{{ target.displayName }}</strong
                            ><small>{{ target.assetType }}</small></span
                        ><button type="button" title="Clear selection" @click="clearTarget"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="word-tree-bar">
                        <span>Asset tree</span><button type="button" title="Refresh tree" @click="$emit('refresh-tree')"><i class="fa-solid fa-rotate"></i></button>
                    </div>
                    <div class="word-tree">
                        <ul class="word-picker-list">
                            <TreeNode
                                v-for="item in visibleOrganisations"
                                :key="`${item.mrid}_${item.mode}`"
                                :node="item"
                                :selectedNodes="pickerSelectedNodes"
                                @fetch-children="$emit('fetch-children', $event)"
                                @clear-selection="pickerSelectedNodes = []"
                                @update-selection="handlePickerSelection"
                                @double-click-node="handlePickerSelection" />
                        </ul>
                    </div>
                </section>
                <section class="word-panel">
                    <h2>Template & report</h2>
                    <label class="word-label" for="word-template">Test report template</label>
                    <select id="word-template" v-model="selectedTemplateName" @change="onTemplateChange(selectedTemplateName)">
                        <option value="">Select a template</option>
                        <option v-for="template in templateList" :key="template.name" :value="template.name">{{ template.name }}</option>
                    </select>
                    <p v-if="selectedTemplateName && target && !matchingTemplates.some((template) => template.name === selectedTemplateName)"
                        class="word-template-warning">This template is for a different asset type. Select a matching template or asset.</p>
                    <div class="word-template-actions">
                        <button type="button" :disabled="!selectedTemplateName || !currentFilePath" @click="openPreview"><i class="fa-solid fa-eye"></i> Preview Template</button>
                        <button type="button" :disabled="!selectedTemplateName" @click="loadSample">
                            <i class="fa-solid fa-vial"></i> Load Sample Test Report
                        </button>
                    </div>
                    <label class="word-label word-upload-label">Filled test report (.doc or .docx)</label>
                    <div
                        class="word-drop"
                        :class="{dragging}"
                        @dragover.prevent="dragging = true"
                        @dragleave.prevent="dragging = false"
                        @drop.prevent="dropReport">
                        <i class="fa-solid fa-file-word"></i>
                        <strong>{{ importFilePath ? fileName(importFilePath) : 'Drop a Word report here' }}</strong>
                        <span>{{ importFilePath ? 'Ready to review' : 'or browse for a .doc or .docx file' }}</span>
                        <div>
                            <button type="button" @click="pickImportFile">{{ importFilePath ? 'Replace file' : 'Browse files' }}</button
                            ><button v-if="importFilePath" type="button" @click="importFilePath = ''">Remove</button>
                        </div>
                    </div>
                </section>
            </div>
        </main>

        <main v-if="step === 2" class="word-content word-review">
            <div class="word-metrics">
                <span
                    ><b>{{ assetFields.length }}</b> Asset fields</span
                ><span
                    ><b>{{ selectedAssetCount }}</b> Selected updates</span
                ><span
                    ><b>{{ testGroups.length }}</b> Test items</span
                ><span
                    ><b>{{ warnings.length }}</b> Warnings</span
                >
            </div>
            <section class="word-section">
                <h2>Asset Properties & Ratings</h2>
                <p class="word-help">Only checked fields will update the selected asset. Empty report values are ignored.</p>
                <div class="word-table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Import</th>
                                <th>Field</th>
                                <th>Current value</th>
                                <th>Value from report</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="field in assetFields" :key="field.code">
                                <td><input type="checkbox" v-model="field.selected" :disabled="!field.supported" /></td>
                                <td>{{ field.label }}</td>
                                <td>{{ field.current || '—' }}</td>
                                <td>{{ field.report }}</td>
                            </tr>
                            <tr v-if="!assetFields.length">
                                <td colspan="4" class="word-empty">No mapped asset values found in this report</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
            <section class="word-section">
                <h2>Test Job & Results</h2>
                <div class="word-job-meta">
                    <span
                        >Asset <b>{{ target && target.displayName }}</b></span
                    ><span
                        >Job <b>{{ jobName || 'Generated on import' }}</b></span
                    ><span
                        >Testing date <b>{{ testingDate || '—' }}</b></span
                    >
                </div>
                <div v-if="jobConflict" class="word-conflict">
                    <strong>A job with this name already exists on the asset.</strong
                    ><label><input v-model="jobDecision" type="radio" value="update" /> Update existing job (add results, keep current tests)</label
                    ><label><input v-model="jobDecision" type="radio" value="create" /> Create a new job</label>
                </div>
                <div v-for="group in testGroups" :key="group.key" class="word-group">
                    <div class="word-group-head">
                        <input type="checkbox" :checked="group.rows.every((row) => row.selected)" @change="toggleGroup(group, $event.target.checked)" /><button
                            type="button"
                            @click="group.open = !group.open">
                            <i :class="group.open ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-right'"></i> {{ group.label }}
                            <small>{{ group.rows.length }} measurements</small>
                        </button>
                    </div>
                    <div v-show="group.open" class="word-group-body">
                        <label v-for="row in group.rows" :key="row.code"
                            ><input v-model="row.selected" type="checkbox" :disabled="!row.report" /><span>{{ row.label }}</span
                            ><select v-if="row.isPhase" v-model="row.report" @change="row.selected = !!row.report">
                                <option value="">Select phase</option>
                                <option v-for="phase in ['A', 'B', 'C']" :key="phase" :value="phase">{{ phase }}</option></select
                            ><select v-else-if="row.isOilCompartment" v-model="row.report" @change="row.selected = !!row.report">
                                <option value="">Select compartment</option>
                                <option v-for="compartment in ['Main tank', 'OLTC', 'Conservator']" :key="compartment" :value="compartment">
                                    {{ compartment }}
                                </option></select
                            ><strong v-else>{{ row.report }}</strong></label
                        >
                    </div>
                </div>
                <p v-if="!testGroups.length" class="word-empty">No mapped test results found in this report</p>
            </section>
            <section v-if="warnings.length" class="word-warning">
                <h2>Warnings</h2>
                <p v-for="warning in warnings" :key="warning">{{ warning }}</p>
            </section>
        </main>

        <main v-if="step === 3" class="word-content word-summary">
            <i :class="failedCount ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-check'"></i>
            <h2>{{ failedCount ? 'Import completed with errors' : 'Import complete' }}</h2>
            <p>
                {{ target && target.displayName }} · {{ jobName || 'New job' }} · {{ selectedAssetCount }} asset fields selected · {{ selectedTestCount }} test fields selected ·
                {{ successCount }} saved · {{ failedCount }} failed
            </p>
            <div class="word-table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Status</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(result, index) in importResults" :key="index">
                            <td>{{ result.level || result.label }}</td>
                            <td>{{ result.success ? 'Saved' : result.skipped ? 'Skipped' : 'Failed' }}</td>
                            <td>{{ result.error || result.reason || result.name || '—' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="word-summary-lists">
                <section>
                    <h3>Selected test items</h3>
                    <p v-for="group in selectedTestGroups" :key="group.key">{{ group.label }} · {{ group.count }} fields</p>
                    <p v-if="!selectedTestGroups.length">None</p>
                </section>
                <section>
                    <h3>Not imported</h3>
                    <p v-for="field in skippedFields" :key="field">{{ field }}</p>
                    <p v-for="warning in warnings" :key="warning">{{ warning }}</p>
                    <p v-if="!skippedFields.length && !warnings.length">None</p>
                </section>
            </div>
        </main>

        <footer class="word-footer">
            <span>{{ step === 1 ? 'Nothing is saved until you confirm the import.' : step === 2 ? 'Review every selected value before saving.' : '' }}</span>
            <div>
                <button v-if="step === 2" type="button" class="word-quiet" @click="step = 1">Back</button
                ><button v-if="step === 1" type="button" class="word-primary" :disabled="!canReview || importLoading" @click="reviewReport">
                    {{ importLoading ? 'Reading report...' : 'Review Data' }}</button
                ><button v-if="step === 2" type="button" class="word-primary" :disabled="!canConfirm || importLoading" @click="confirmWordImport">
                    {{ importLoading ? 'Importing...' : 'Confirm Import' }}</button
                ><button v-if="step === 3" type="button" class="word-quiet" @click="viewAsset">View Asset</button
                ><button v-if="step === 3" type="button" class="word-primary" @click="resetReport">Import Another Report</button>
            </div>
        </footer>

        <el-dialog title="Test Report Template Manager" :visible.sync="managerVisible" width="min(1380px, 96vw)" top="3vh"
            custom-class="word-manager-dialog" append-to-body @closed="loadTemplates">
            <ImportView v-if="managerVisible" ref="managerView" import-type="word" manager-mode :initial-template-name="selectedTemplateName"
                @import-package="importPackage" @export-package="exportPackage" @set-sample="setSample" />
        </el-dialog>
        <WordTemplatePreview :visible.sync="previewVisible" :template-name="selectedTemplateName" :file-path="currentFilePath" :mappings="tableData" />
    </div>
</template>

<script>
import ImportView from './index.vue'
import TreeNode from '@/views/Common/TreeNode.vue'
import WordTemplatePreview from './components/WordTemplatePreview.vue'
import {deepImportService} from './services/deepImportService'
import {importService} from './services/importService'
import {exportService} from '../Export/services/exportService'
import {ASSET_TYPE_TO_KEY, FEATURE_TREE} from '../Common/constants'

const COMMON_ASSET_FIELDS = [
    'type',
    'kind',
    'serial_no',
    'manufacturer',
    'manufacturer_type',
    'manufacturer_year',
    'model',
    'country_of_origin',
    'apparatus_id',
    'comment'
]
const EXTRA_ASSET_FIELDS = {
    'Circuit breaker': [
        'rated_voltage_ll',
        'rated_current',
        'rated_frequency',
        'rated_short_circuit_breaking_current',
        'short_circuit_nominal_duration',
        'rated_insulation_level',
        'rated_interrupting_time',
        'rated_power_at_closing',
        'rated_power_at_opening',
        'rated_power_at_motor_charge'
    ],
    Transformer: [
        'phases',
        'vector_group_custom',
        'unsupported_vector_group',
        'rated_frequency',
        'category',
        'status',
        'tank_type',
        'insulation_medium',
        'tap_mode',
        'tap_serial_no',
        'tap_manufacturer',
        'tap_manufacturer_type',
        'tap_winding',
        'tap_scheme',
        'no_of_taps'
    ],
    'Voltage transformer': [
        'standard',
        'rated_frequency',
        'upr',
        'rated_voltage',
        'c1',
        'c2',
        'windings',
        'usr_formula',
        'usr_rated_voltage',
        'rated_burden',
        'rated_power_factor'
    ],
    'Current transformer': [
        'standard',
        'rated_frequency',
        'primary_winding_count',
        'um_rms',
        'u_withstand_rms',
        'u_lightning_peak',
        'icth',
        'idyn_peak',
        'ith_rms',
        'ith_duration',
        'system_voltage',
        'bil',
        'rating_factor',
        'ct_cores'
    ],
    'Power cable': [
        'phases',
        'cores',
        'rated_voltage',
        'max_voltage',
        'rated_frequency',
        'shortcircuit',
        'rated_duration',
        'insulation_method',
        'bonding_type',
        'install_location',
        'cable_length'
    ],
    'Surge arrester': ['unitStack'],
    Reactor: ['rated_voltage', 'rated_frequency', 'rated_current', 'rated_power', 'inductance', 'insulation_type', 'weight'],
    Capacitor: ['cap_phase', 'cap_phase_name', 'cap_rated_voltage', 'cap_rated_frequency', 'cap_rated_current', 'cap_rated_power'],
    Disconnector: [
        'dc_rated_voltage',
        'dc_rated_frequency',
        'dc_rated_current',
        'dc_short_time_withstand_current',
        'dc_rated_duration_of_short_circuit',
        'dc_pf_earth_poles',
        'dc_pf_isolating_distance'
    ],
    'Rotating machine': [
        'rated_u',
        'rated_current',
        'rated_speed',
        'rated_frequency',
        'rated_power',
        'rated_power_factor',
        'rated_thermal_class',
        'rated_ifd',
        'rated_ufd',
        'star_point'
    ],
    Bushing: [
        'rated_frequency',
        'insulation_level',
        'voltage_l_ground',
        'max_system_voltage',
        'rated_current',
        'df_c1',
        'cap_c1',
        'df_c2',
        'cap_c2',
        'insulation_type'
    ]
}

export default {
    name: 'WordReportWorkspace',
    extends: ImportView,
    components: {ImportView, TreeNode, WordTemplatePreview},
    props: {
        organisationClientList: {type: Array, default: () => []}
    },
    data() {
        return {
            step: 1,
            target: null,
            pickerSelectedNodes: [],
            managerVisible: false,
            previewVisible: false,
            dragging: false,
            assetFields: [],
            testGroups: [],
            warnings: [],
            jobConflict: false,
            jobDecision: '',
            jobName: '',
            testingDate: ''
        }
    },
    computed: {
        visibleOrganisations() {
            return this.organisationClientList
                .flatMap((item) => (item.mrid === this.$constant.ROOT ? item.children || [] : [item]))
                .sort((a, b) =>
                    (a.name || a.aliasName || '').localeCompare(b.name || b.aliasName || '', 'en', {numeric: true, sensitivity: 'base'})
                )
        },
        matchingTemplates() {
            if (!this.target) return []
            const key = ASSET_TYPE_TO_KEY[this.target.assetType]?.replace(/^Asset_/, '')
            return this.templateList.filter((template) =>
                (template.variable || []).some((row) => row.category === 'Asset' && row.featureLevels?.[0]?.key === key)
            )
        },
        canReview() {
            return !!(
                this.target &&
                this.selectedTemplateName &&
                this.currentFilePath &&
                this.importFilePath &&
                this.matchingTemplates.some((t) => t.name === this.selectedTemplateName)
            )
        },
        selectedAssetCount() {
            return this.assetFields.filter((field) => field.selected).length
        },
        selectedTestCount() {
            return this.testGroups.reduce((count, group) => count + group.rows.filter((row) => row.selected).length, 0)
        },
        selectedTestGroups() {
            return this.testGroups
                .map((group) => ({key: group.key, label: group.label, count: group.rows.filter((row) => row.selected).length}))
                .filter((group) => group.count)
        },
        skippedFields() {
            return [
                ...this.assetFields.filter((field) => !field.selected).map((field) => field.label),
                ...this.testGroups.flatMap((group) => group.rows.filter((row) => row.report && !row.selected).map((row) => `${group.label}: ${row.label}`))
            ]
        },
        canConfirm() {
            return this.selectedAssetCount + this.selectedTestCount > 0 && (!this.jobConflict || this.selectedTestCount === 0 || !!this.jobDecision)
        },
        successCount() {
            return this.importResults.filter((result) => result.success && !result.skipped).length
        },
        failedCount() {
            return this.importResults.filter((result) => !result.success && !result.skipped).length
        }
    },
    methods: {
        async loadTemplates() {
            try {
                const result = await window.electronAPI.getAllTemplatesByType('word', 'import')
                if (!result?.success) throw new Error(result?.message || 'Cannot load templates')
                this.templateList = result.data.map((item) => ({...item, variable: item.variable ? JSON.parse(item.variable) : []}))
                if (this.selectedTemplateName && !this.templateList.some((item) => item.name === this.selectedTemplateName)) {
                    this.selectedTemplateName = ''
                    this.currentFilePath = ''
                    this.tableData = []
                } else if (this.selectedTemplateName) {
                    this.onTemplateChange(this.selectedTemplateName)
                }
            } catch (error) {
                this.$message.error(error.message || 'Cannot load templates')
            }
        },
        fileName(path) {
            return String(path || '')
                .split(/[\\/]/)
                .pop()
        },
        selectContextAsset(node) {
            const assetType = node.assetType || node.asset
            if (!ASSET_TYPE_TO_KEY[assetType]) return
            this.setTarget({
                mrid: node.mrid,
                displayName: node.apparatus_id || node.serial_number || node.name || node.displayName || node.mrid,
                assetType,
                context: {asset: {mrid: node.mrid, assetType}},
                originalNode: node
            })
        },
        handlePickerSelection(node) {
            this.pickerSelectedNodes = [node]
            if (node.mode === 'asset') this.selectContextAsset(node)
        },
        selectTreeNode(node) {
            if (node.mode !== 'asset') return
            this.setTarget({...node, context: this.buildContextFromNode(node), originalNode: node})
        },
        setTarget(node) {
            if (this.target?.mrid === node.mrid) return
            this.target = node
            this.importSelectedNode = {mode: 'asset', label: node.displayName, context: node.context}
            this.step = 1
        },
        clearTarget() {
            this.target = null
            this.pickerSelectedNodes = []
            this.importSelectedNode = null
            this.selectedTemplateName = ''
            this.currentFilePath = ''
            this.tableData = []
        },
        dropReport(event) {
            this.dragging = false
            const file = event.dataTransfer?.files?.[0]
            if (!file) return
            if (!/\.docx?$/i.test(file.name) || !file.path) {
                this.$message.warning('Select a local .doc or .docx file')
                return
            }
            this.importFilePath = file.path
        },
        fieldLabel(row) {
            let node = FEATURE_TREE[row.category]
            for (const level of row.featureLevels || []) node = node?.children?.[level.key]
            return node?.label || deepImportService.getLeafValue(row.featureLevels, row.category) || row.code
        },
        reportValue(codeMap, code) {
            return (codeMap[code] || []).filter((value) => value != null && String(value).trim()).join(' · ')
        },
        async reviewReport() {
            if (!this.canReview) return
            this.importLoading = true
            try {
                const template = this.matchingTemplates.find((item) => item.name === this.selectedTemplateName)
                const result = await window.electronAPI.readWordForImport({
                    filePath: this.importFilePath,
                    templatePath: this.currentFilePath,
                    variables: template.variable || []
                })
                if (!result?.success) throw new Error(result?.message || 'Cannot read Word report')
                this.importCachedCodeValueMap = result.codeValueMap || {}
                const assetKey = ASSET_TYPE_TO_KEY[this.target.assetType]
                const mappedType = assetKey.replace(/^Asset_/, '')
                const assetRows = this.tableData.filter((row) => row.category === 'Asset' && row.featureLevels?.[0]?.key === mappedType)
                const {flatMap = {}, arrayMap = {}} = await exportService.buildDtoForCat(
                    {key: assetKey, category: 'Asset', assetType: mappedType},
                    this.target.context
                )
                this.assetFields = assetRows
                    .map((row) => {
                        const leaf = deepImportService.getLeafValue(row.featureLevels, row.category)
                        const report = this.reportValue(this.importCachedCodeValueMap, row.code)
                        const allowed = [...COMMON_ASSET_FIELDS, ...(EXTRA_ASSET_FIELDS[this.target.assetType] || [])]
                        return {
                            ...row,
                            label: this.fieldLabel(row),
                            leaf,
                            current: Array.isArray(arrayMap?.[leaf]) ? arrayMap[leaf].join(' · ') : flatMap?.[leaf],
                            report,
                            selected: false,
                            supported: !!leaf && !!report && allowed.includes(leaf)
                        }
                    })
                    .filter((row) => row.report)
                const jobRows = this.tableData.filter((row) => {
                    if (row.category !== 'Job') return false
                    const leaf = deepImportService.getLeafValue(row.featureLevels, row.category)
                    return (
                        leaf &&
                        (this.reportValue(this.importCachedCodeValueMap, row.code) ||
                            (this.target.assetType === 'Transformer' && /(?:_phase|compartment)$/i.test(leaf)))
                    )
                })
                const groups = new Map()
                jobRows.forEach((row) => {
                    const groupKey = row.featureLevels?.[2]?.key || 'Job information'
                    if (!groups.has(groupKey)) groups.set(groupKey, {key: groupKey, label: groupKey.replace(/_/g, ' '), rows: [], open: true})
                    const leaf = deepImportService.getLeafValue(row.featureLevels, row.category)
                    groups
                        .get(groupKey)
                        .rows.push({
                            ...row,
                            label: this.fieldLabel(row),
                            report: this.reportValue(this.importCachedCodeValueMap, row.code),
                            selected: false,
                            isPhase: this.target.assetType === 'Transformer' && /_phase$/i.test(leaf),
                            isOilCompartment: this.target.assetType === 'Transformer' && /compartment$/i.test(leaf)
                        })
                })
                this.testGroups = Array.from(groups.values()).filter((group) => group.rows.some((row) => row.report))
                const jobData = deepImportService.buildAllLevelData(this.importCachedCodeValueMap, jobRows)
                const job = Object.entries(jobData).find(([key]) => key.startsWith('Job_'))?.[1] || {}
                this.jobName = job.job_name || job.name || ''
                this.testingDate = job.testing_date || job.testingDate || ''
                const works = await window.electronAPI.getOldWorkByAssetId(this.target.mrid)
                this.jobConflict = !!(this.jobName && (works?.data || []).some((work) => (work.name || work.job_name) === this.jobName))
                this.jobDecision = ''
                this.warnings = this.tableData
                    .filter(
                        (row) => this.reportValue(this.importCachedCodeValueMap, row.code) && !deepImportService.getLeafValue(row.featureLevels, row.category)
                    )
                    .map((row) => `${row.code}: mapping is not supported`)
                this.warnings.push(...this.assetFields.filter((field) => !field.supported).map((field) => `${field.label}: asset update is not supported`))
                this.step = 2
            } catch (error) {
                this.$message.error(error.message || 'Cannot review report')
            } finally {
                this.importLoading = false
            }
        },
        toggleGroup(group, checked) {
            group.rows.forEach((row) => {
                row.selected = checked && !!row.report
            })
        },
        async confirmWordImport() {
            if (!this.canConfirm) return
            this.importLoading = true
            const results = []
            try {
                const selectedAssetRows = this.assetFields.filter((row) => row.selected)
                if (selectedAssetRows.length) {
                    const key = ASSET_TYPE_TO_KEY[this.target.assetType]
                    const values = importService.reverseExtract(this.importCachedCodeValueMap, selectedAssetRows, {
                        key,
                        category: 'Asset',
                        assetType: key.replace(/^Asset_/, '')
                    })
                    const saved = await importService.applyImportForCat({key}, values, this.target.context)
                    results.push({
                        level: 'Asset properties',
                        success: !!saved && saved.success !== false && !saved.skipped,
                        error: saved?.message || saved?.reason,
                        skipped: !!saved?.skipped
                    })
                }
                const selectedJobRows = this.testGroups.flatMap((group) => group.rows.filter((row) => row.selected))
                if (selectedJobRows.length) {
                    const codeMap = {...this.importCachedCodeValueMap}
                    selectedJobRows.forEach((row) => {
                        if (row.isPhase || row.isOilCompartment) codeMap[row.code] = [row.report]
                    })
                    const identityRow = this.tableData.find(
                        (row) => row.category === 'Job' && deepImportService.getLeafValue(row.featureLevels, 'Job') === 'job_name'
                    )
                    if (identityRow && !selectedJobRows.some((row) => row.code === identityRow.code)) selectedJobRows.push(identityRow)
                    if (this.jobConflict && this.jobDecision === 'create') {
                        if (identityRow) codeMap[identityRow.code] = [`${this.jobName} (${Date.now()})`]
                    }
                    const conflicts = this.jobConflict && this.jobDecision === 'update' ? [{levelId: 'job', name: this.jobName, choice: 'overwrite'}] : []
                    const saved = await deepImportService.importHierarchy(
                        codeMap,
                        selectedJobRows,
                        this.importSelectedNode,
                        false,
                        [],
                        this.$store.state.user.user_id,
                        conflicts
                    )
                    results.push(...(saved.results || []))
                }
                this.importResults = results
                this.step = 3
                if (this.successCount) this.$emit('imported')
            } catch (error) {
                results.push({level: 'Import', success: false, error: error.message})
                this.importResults = results
                this.step = 3
            } finally {
                this.importLoading = false
            }
        },
        openPreview() {
            if (this.currentFilePath) this.previewVisible = true
        },
        async downloadTemplate() {
            const result = await window.electronAPI.downloadWordTemplate(this.currentFilePath)
            if (!result?.success && !result?.canceled) this.$message.error(result?.message || 'Cannot download template')
        },
        async setSample(name = this.selectedTemplateName) {
            const result = await window.electronAPI.setWordSampleReport(name)
            if (result?.success) this.$message.success('Sample report saved for this template')
            else if (!result?.canceled) this.$message.error(result?.message || 'Cannot save sample report')
        },
        async exportPackage(name = this.selectedTemplateName) {
            const result = await window.electronAPI.exportWordTemplatePackage(name)
            if (!result?.success && !result?.canceled) this.$message.error(result?.message || 'Cannot export template package')
        },
        async importPackage() {
            const result = await window.electronAPI.importWordTemplatePackage()
            if (result?.success) {
                await this.loadTemplates()
                if (this.$refs.managerView) {
                    await this.$refs.managerView.loadTemplates()
                    this.$refs.managerView.selectManagerTemplate(result.name)
                }
                this.$message.success(`Imported template: ${result.name}`)
            } else if (!result?.canceled) this.$message.error(result?.message || 'Cannot import template package')
        },
        async loadSample() {
            const result = await window.electronAPI.getWordSampleReport(this.selectedTemplateName)
            if (!result?.success || !result.filePath) {
                this.$alert('This template has no sample test report.', 'Sample not available')
                return
            }
            this.importFilePath = result.filePath
        },
        viewAsset() {
            if (this.target?.originalNode) this.$emit('view-asset', this.target.originalNode)
        },
        resetReport() {
            this.step = 1
            this.importFilePath = ''
            this.importCachedCodeValueMap = null
            this.assetFields = []
            this.testGroups = []
            this.importResults = []
        }
    }
}
</script>

<style scoped>
.word-workspace {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    color: #1d2939;
    background: #f3f6fa;
    font-size: 14px;
}
.word-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 24px 32px 18px;
    background: #fff;
    border-bottom: 1px solid #dde4ee;
}
.word-heading h1 {
    font-size: 22px;
    margin: 0 0 4px;
    letter-spacing: 0;
}
.word-heading p,
.word-help {
    color: #697586;
    margin: 0;
    font-size: 13px;
}
.word-steps {
    display: flex;
    gap: 0;
    background: #fff;
    border-bottom: 1px solid #dde4ee;
    padding: 0 32px;
}
.word-steps span {
    padding: 16px 28px 16px 0;
    color: #758195;
    white-space: nowrap;
}
.word-steps b {
    display: inline-grid;
    place-items: center;
    background: #e9edf3;
    border-radius: 50%;
    width: 23px;
    height: 23px;
    margin-right: 7px;
}
.word-steps .current {
    color: #0b348c;
    font-weight: 700;
    border-bottom: 3px solid #103895;
}
.word-steps .current b,
.word-steps .done b {
    background: #103895;
    color: #fff;
}
.word-content {
    width: 100%;
    max-width: 1440px;
    box-sizing: border-box;
    padding: 25px 32px;
    margin: 0 auto;
    flex: 1;
}
.word-setup {
    display: grid;
    grid-template-columns: minmax(300px, 1fr) minmax(340px, 1fr);
    gap: 20px;
}
.word-panel,
.word-section {
    background: #fff;
    border: 1px solid #dce3ed;
    border-radius: 6px;
    padding: 20px;
}
.word-panel h2,
.word-section h2,
.word-warning h2 {
    font-size: 16px;
    margin: 0 0 8px;
}
.word-panel .word-help {
    margin-bottom: 18px;
}
.word-selected {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #edf4ff;
    border: 1px solid #b9cff5;
    padding: 12px;
    margin-bottom: 14px;
    border-radius: 5px;
}
.word-selected > i {
    color: #16449e;
}
.word-selected span {
    flex: 1;
}
.word-selected small {
    display: block;
    color: #66758c;
    margin-top: 2px;
}
.word-selected button,
.word-tree-bar button {
    border: 0;
    background: transparent;
    cursor: pointer;
    color: #64748b;
}
.word-tree-bar {
    display: flex;
    justify-content: space-between;
    padding: 8px 4px;
    font-weight: 600;
}
.word-tree {
    height: 410px;
    overflow: auto;
    border: 1px solid #dde4ee;
    border-radius: 4px;
    padding: 8px;
    background: #fff;
}
.word-picker-list {
    list-style: none;
    padding: 0 4px 0 8px;
    margin: 4px 0;
}
.word-label {
    display: block;
    color: #46556a;
    font-size: 13px;
    font-weight: 600;
    margin: 16px 0 7px;
}
.word-panel select {
    height: 40px;
    width: 100%;
    border: 1px solid #aebacc;
    border-radius: 4px;
    padding: 0 10px;
    background: #fff;
    color: #263349;
    font-size: 14px;
}
.word-template-warning {
    margin: 7px 0 0;
    color: #a34c09;
    font-size: 12px;
    line-height: 1.4;
}
.word-template-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}
.word-template-actions button,
.word-drop button,
.word-quiet {
    border: 1px solid #aebacc;
    border-radius: 4px;
    background: #fff;
    color: #17366e;
    padding: 9px 12px;
    cursor: pointer;
    font-weight: 600;
}
.word-template-actions button:disabled,
.word-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.word-upload-label {
    margin-top: 28px;
}
.word-drop {
    min-height: 210px;
    border: 2px dashed #b6c5d8;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 9px;
    text-align: center;
    padding: 16px;
}
.word-drop.dragging {
    background: #edf4ff;
    border-color: #1d4ba4;
}
.word-drop > i {
    font-size: 34px;
    color: #2557a5;
}
.word-drop > span {
    color: #7b8798;
}
.word-drop > div {
    display: flex;
    gap: 8px;
}
.word-footer {
    position: sticky;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    background: #fff;
    border-top: 1px solid #dce3ed;
    padding: 14px 32px;
    color: #7a8799;
    font-size: 13px;
}
.word-footer > div {
    display: flex;
    gap: 8px;
}
.word-primary {
    background: #0b318b;
    color: #fff;
    border: 1px solid #0b318b;
    border-radius: 4px;
    padding: 10px 17px;
    cursor: pointer;
    font-weight: 700;
}
.word-metrics {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 20px;
}
.word-metrics span {
    flex: 1;
    min-width: 130px;
    background: #fff;
    border: 1px solid #dce3ed;
    padding: 15px;
    border-radius: 5px;
    color: #58667a;
}
.word-metrics b {
    font-size: 22px;
    color: #17366e;
    margin-right: 6px;
}
.word-section {
    margin-bottom: 18px;
}
.word-table-scroll {
    overflow: auto;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 13px;
}
th,
td {
    text-align: left;
    padding: 11px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: top;
}
th {
    background: #f4f6f9;
    color: #48566b;
    font-size: 12px;
}
td {
    word-break: break-word;
}
.word-empty {
    color: #8290a3;
    text-align: center;
    padding: 22px;
}
.word-job-meta {
    display: flex;
    gap: 28px;
    flex-wrap: wrap;
    padding: 12px 0;
    color: #697586;
}
.word-job-meta b {
    color: #25334a;
}
.word-conflict {
    padding: 12px;
    background: #fff7e6;
    border: 1px solid #f0d49a;
    border-radius: 4px;
    margin: 10px 0;
}
.word-conflict label {
    display: inline-block;
    margin: 8px 16px 0 0;
}
.word-group {
    border-top: 1px solid #e1e7f0;
}
.word-group-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 4px;
}
.word-group-head button {
    border: 0;
    background: none;
    color: #1b3769;
    font-weight: 700;
    cursor: pointer;
}
.word-group-head small {
    font-weight: 400;
    color: #8894a6;
    margin-left: 8px;
}
.word-group-body {
    padding: 0 0 8px 28px;
}
.word-group-body label {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    border-top: 1px solid #f0f2f5;
}
.word-group-body span {
    flex: 1;
}
.word-warning {
    padding: 15px;
    border: 1px solid #f2d391;
    background: #fff9eb;
    border-radius: 4px;
}
.word-summary {
    text-align: center;
}
.word-summary > i {
    font-size: 38px;
    color: #16804a;
}
.word-summary > p {
    color: #697586;
}
.word-summary table {
    text-align: left;
}
.word-quiet:hover,
.word-template-actions button:hover,
.word-drop button:hover {
    background: #eff4fb;
}
@media (max-width: 900px) {
    .word-setup {
        grid-template-columns: 1fr;
    }
    .word-heading,
    .word-content,
    .word-footer {
        padding-left: 16px;
        padding-right: 16px;
    }
    .word-steps {
        padding: 0 16px;
        overflow: auto;
    }
    .word-steps span {
        padding-right: 16px;
    }
}
.word-summary-lists {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    text-align: left;
    margin-top: 20px;
}
.word-summary-lists section {
    border-top: 1px solid #dce3ed;
    padding-top: 12px;
}
.word-summary-lists h3 {
    font-size: 14px;
    margin: 0 0 8px;
}
.word-summary-lists p {
    color: #66758c;
    margin: 6px 0;
}
.word-group-body select {
    min-width: 135px;
    border: 1px solid #aebacc;
    border-radius: 4px;
    background: #fff;
    padding: 6px;
}
@media (max-width: 900px) {
    .word-summary-lists {
        grid-template-columns: 1fr;
    }
}
</style>

<style>
.word-manager-dialog {
    display: flex;
    flex-direction: column;
    height: 94vh;
    max-height: 94vh;
    margin-bottom: 0;
}
.word-manager-dialog .el-dialog__header {
    flex: 0 0 auto;
    padding: 18px 24px;
    border-bottom: 1px solid #dce3ec;
}
.word-manager-dialog .el-dialog__title { font-size: 18px; font-weight: 700; color: #142d54; }
.word-manager-dialog .el-dialog__body { flex: 1; min-height: 0; padding: 0; overflow: hidden; }
.word-manager-dialog .el-dialog__body > div { height: 100%; }
</style>

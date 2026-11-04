<template>
    <div class="excel-workspace">
        <header class="excel-heading">
            <div>
                <h1>Import from Excel</h1>
                <p>Import asset information and test results from an Excel report</p>
            </div>
            <button type="button" class="excel-button" @click="managerVisible = true">
                <i class="fa-solid fa-gear"></i> Template Manager
            </button>
        </header>

        <nav class="excel-steps" aria-label="Import progress">
            <span v-for="(label, index) in ['Select & Upload', 'Review Data', 'Import Summary']" :key="label"
                :class="{current: importStep === index + 1, done: importStep > index + 1}">
                <b>{{ index + 1 }}</b> {{ label }}
            </span>
        </nav>

        <main v-show="importStep === 1" class="excel-content">
            <div class="excel-setup">
                <section class="excel-panel">
                    <h2>Parent node</h2>
                    <p class="excel-help">Select where the imported hierarchy should begin, or leave it empty to import from Organisation.</p>
                    <div v-if="importSelectedNode" class="excel-selected">
                        <i class="fa-solid fa-location-dot"></i>
                        <span><strong>{{ importSelectedNode.label.split(' / ').pop() }}</strong><small>{{ importSelectedNode.label }}</small></span>
                        <button type="button" title="Clear selection" @click="setParent(null)"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="excel-tree-bar">
                        <span>Asset tree</span>
                        <button type="button" title="Refresh tree" @click="$emit('refresh-tree')"><i class="fa-solid fa-rotate"></i></button>
                    </div>
                    <div class="excel-tree">
                        <ul>
                            <TreeNode v-for="item in visibleOrganisations" :key="`${item.mrid}_${item.mode}`"
                                :node="item" :selectedNodes="pickerSelectedNodes"
                                @fetch-children="$emit('fetch-children', $event)"
                                @clear-selection="pickerSelectedNodes = []"
                                @update-selection="handlePickerSelection"
                                @double-click-node="handlePickerSelection" />
                        </ul>
                    </div>
                </section>

                <section class="excel-panel">
                    <h2>Template & report</h2>
                    <label for="excel-template" class="excel-label">Test report template</label>
                    <select id="excel-template" v-model="selectedTemplateName" @change="onTemplateChange(selectedTemplateName)">
                        <option value="">Select a template</option>
                        <option v-for="item in templateList" :key="item.name" :value="item.name">{{ item.name }}</option>
                    </select>
                    <div class="excel-actions">
                        <button type="button" class="excel-button" :disabled="!selectedTemplateName" @click="managerVisible = true">
                            <i class="fa-solid fa-eye"></i> View Template
                        </button>
                    </div>
                    <label class="excel-label excel-upload-label">Filled report (.xlsx, .xls or .csv)</label>
                    <div class="excel-drop" :class="{dragging}" @dragover.prevent="dragging = true"
                        @dragleave.prevent="dragging = false" @drop.prevent="dropReport">
                        <i class="fa-solid fa-file-excel"></i>
                        <strong>{{ importFilePath ? fileName(importFilePath) : 'Drop an Excel report here' }}</strong>
                        <span>{{ importFilePath ? 'Ready to review' : 'or browse for a .xlsx, .xls or .csv file' }}</span>
                        <div>
                            <button type="button" class="excel-button" @click="pickImportFile">
                                {{ importFilePath ? 'Replace file' : 'Browse files' }}
                            </button>
                            <button v-if="importFilePath" type="button" class="excel-button" @click="importFilePath = ''">Remove</button>
                        </div>
                    </div>
                    <div class="excel-duplicate-mode">
                        <strong>Existing nodes</strong>
                        <div>
                            <label :class="{active: !importOverwrite}"><input v-model="importOverwrite" type="radio" :value="false" /> Use existing</label>
                            <label :class="{active: importOverwrite}"><input v-model="importOverwrite" type="radio" :value="true" /> Overwrite fields</label>
                        </div>
                    </div>
                </section>
            </div>
        </main>

        <main v-if="importStep === 2" class="excel-content">
            <div class="excel-metrics">
                <span><b>{{ importPreview.filter(row => row.hasData).length }}</b> Levels with data</span>
                <span><b>{{ nameConflicts.length }}</b> Existing nodes</span>
                <span><b>{{ importDecisions.length }}</b> Decisions</span>
            </div>
            <section v-if="importDecisions.length" class="excel-panel excel-review-section">
                <h2>Decisions needed</h2>
                <div v-for="decision in importDecisions" :key="decision.key" class="excel-decision">
                    <strong>{{ decision.type === 'shortcut' ? 'Job/Test data has no parent names' : `${decision.label} has no name` }}</strong>
                    <div v-if="decision.type === 'missing_name'" class="excel-choice">
                        <label><input v-model="decision.choice" type="radio" value="generate" /> Generate {{ decision.generatedValue }}</label>
                        <label><input v-model="decision.choice" type="radio" value="skip" /> Skip this node and its children</label>
                    </div>
                    <div v-else-if="decision.type === 'shortcut'" class="excel-choice">
                        <label><input v-model="decision.choice" type="radio" value="generate" /> Generate {{ decision.generatedValues.sub_name }} and {{ decision.generatedValues.asset_serial }}</label>
                        <label><input v-model="decision.choice" type="radio" value="skip" /> Skip Job/Test</label>
                    </div>
                </div>
            </section>
            <section v-if="nameConflicts.length" class="excel-panel excel-review-section">
                <h2>Existing nodes</h2>
                <div v-for="conflict in nameConflicts" :key="conflict.key" class="excel-decision">
                    <strong>{{ conflict.label }}: {{ conflict.name }}</strong>
                    <div class="excel-choice">
                        <label><input v-model="conflict.choice" type="radio" value="use_existing" /> Use existing</label>
                        <label><input v-model="conflict.choice" type="radio" value="overwrite" /> Overwrite fields</label>
                        <label><input v-model="conflict.choice" type="radio" value="skip" /> Skip</label>
                    </div>
                </div>
            </section>
            <section class="excel-panel excel-review-section">
                <h2>Data to import</h2>
                <div class="excel-table-scroll">
                    <table>
                        <thead><tr><th>Level</th><th>Key field</th><th>Other fields</th></tr></thead>
                        <tbody>
                            <tr v-for="row in importPreview" :key="row.catKey" :class="{'excel-muted': !row.hasData}">
                                <td>{{ row.label }}</td>
                                <td>{{ row.keyValue || (row.isJobWithTests ? 'Generated on import' : '—') }}</td>
                                <td>{{ row.hasData ? row.otherFieldsSummary : 'No data in file' }}</td>
                            </tr>
                            <tr v-if="!importPreview.length"><td colspan="3" class="excel-empty">No mapped data found</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </main>

        <main v-if="importStep === 3" class="excel-content excel-summary">
            <i :class="failedCount ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-check'"></i>
            <h2>{{ failedCount ? 'Import completed with errors' : 'Import complete' }}</h2>
            <p>{{ successCount }} saved · {{ failedCount }} failed · {{ skippedCount }} skipped</p>
            <div class="excel-table-scroll">
                <table>
                    <thead><tr><th>Node</th><th>Status</th><th>Details</th></tr></thead>
                    <tbody>
                        <tr v-for="(result, index) in importResults" :key="index">
                            <td>{{ result.level }}</td>
                            <td>{{ result.skipped ? 'Skipped' : result.success ? 'Saved' : 'Failed' }}</td>
                            <td>{{ result.error || result.reason || result.name || '—' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>

        <footer class="excel-footer">
            <span>{{ importStep === 1 ? 'Nothing is saved until you confirm the import.' : importStep === 2 ? 'Review the hierarchy before saving.' : '' }}</span>
            <div>
                <button v-if="importStep === 2" type="button" class="excel-button" @click="importStep = 1">Back</button>
                <button v-if="importStep === 1" type="button" class="excel-button excel-primary"
                    :disabled="!canReview || importLoading" @click="runImportPreview">
                    {{ importLoading ? 'Reading report...' : 'Review Data' }}
                </button>
                <button v-if="importStep === 2" type="button" class="excel-button excel-primary"
                    :disabled="!canConfirm || importLoading" @click="confirmImport">
                    {{ importLoading ? 'Importing...' : 'Confirm Import' }}
                </button>
                <button v-if="importStep === 3" type="button" class="excel-button excel-primary" @click="resetReport">Import Another Report</button>
            </div>
        </footer>

        <el-dialog title="Test Report Template Manager" :visible.sync="managerVisible" width="min(1380px, 96vw)"
            top="3vh" custom-class="word-manager-dialog" append-to-body @closed="loadTemplates">
            <ImportView v-if="managerVisible" import-type="excel" manager-mode :initial-template-name="selectedTemplateName" />
        </el-dialog>
    </div>
</template>

<script>
import ImportView from './index.vue'
import TreeNode from '@/views/Common/TreeNode.vue'

const PARENT_MODES = ['organisation', 'substation', 'voltageLevel', 'bay', 'asset']

export default {
    name: 'ExcelReportWorkspace',
    extends: ImportView,
    components: {ImportView, TreeNode},
    props: {organisationClientList: {type: Array, default: () => []}},
    data() {
        return {managerVisible: false, pickerSelectedNodes: [], dragging: false}
    },
    computed: {
        visibleOrganisations() {
            return this.organisationClientList
                .flatMap(item => item.mrid === this.$constant.ROOT ? item.children || [] : [item])
                .sort((a, b) => (a.name || a.aliasName || '').localeCompare(b.name || b.aliasName || '', 'en', {numeric: true, sensitivity: 'base'}))
        },
        canReview() {
            return !!(this.selectedTemplateName && this.currentFilePath && this.importFilePath)
        },
        canConfirm() {
            return this.importPreview.some(row => row.hasData) &&
                this.importDecisions.every(decision => !!decision.choice) &&
                this.nameConflicts.every(conflict => !!conflict.choice)
        },
        successCount() {
            return this.importResults.filter(result => result.success && !result.skipped).length
        },
        failedCount() {
            return this.importResults.filter(result => !result.success && !result.skipped).length
        },
        skippedCount() {
            return this.importResults.filter(result => result.skipped).length
        }
    },
    methods: {
        async loadTemplates() {
            await ImportView.methods.loadTemplates.call(this)
            if (this.selectedTemplateName) {
                if (this.templateList.some(item => item.name === this.selectedTemplateName)) this.onTemplateChange(this.selectedTemplateName)
                else { this.selectedTemplateName = ''; this.currentFilePath = ''; this.tableData = [] }
            }
        },
        fileName(value) {
            return String(value || '').split(/[\\/]/).pop()
        },
        findNodePath(nodes, mrid, path = []) {
            for (const node of nodes) {
                const next = [...path, node]
                if (node.mrid === mrid) return next
                const found = this.findNodePath(node.children || [], mrid, next)
                if (found) return found
            }
            return null
        },
        selectContextNode(node) {
            if (!PARENT_MODES.includes(node.mode)) return
            const path = this.findNodePath(this.visibleOrganisations, node.mrid) || [...(node.parentArr || []), node]
            const context = {}
            path.forEach(item => {
                if (PARENT_MODES.includes(item.mode)) {
                    context[item.mode] = {mrid: item.mrid, name: item.name || item.aliasName || item.displayName,
                        ...(item.assetType ? {assetType: item.assetType} : {})}
                }
            })
            this.importSelectedNode = {
                mode: node.mode,
                label: path.map(item => item.name || item.aliasName || item.displayName || item.mrid).join(' / '),
                context
            }
            this.importStep = 1
            this.importCachedCodeValueMap = null
        },
        handlePickerSelection(node) {
            this.pickerSelectedNodes = [node]
            this.selectContextNode(node)
        },
        setParent(node) {
            this.importSelectedNode = null
            this.pickerSelectedNodes = []
            this.importStep = 1
            if (node) this.selectContextNode(node)
        },
        dropReport(event) {
            this.dragging = false
            const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]
            if (!file) return
            if (!/\.(xlsx|xls|csv)$/i.test(file.name) || !file.path) {
                this.$message.warning('Select a local .xlsx, .xls or .csv file')
                return
            }
            this.importFilePath = file.path
        },
        resetReport() {
            this.resetImportDialog()
            this.pickerSelectedNodes = []
        }
    }
}
</script>

<style scoped>
.excel-workspace { min-height: 100%; display: flex; flex-direction: column; color: #1d2939; background: #f3f6fa; font-size: 14px; }
.excel-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 24px 32px 18px; background: #fff; border-bottom: 1px solid #dde4ee; }
.excel-heading h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: 0; }
.excel-heading p, .excel-help { margin: 0; color: #697586; font-size: 13px; line-height: 1.5; }
.excel-steps { display: flex; background: #fff; border-bottom: 1px solid #dde4ee; padding: 0 32px; overflow-x: auto; }
.excel-steps span { flex: none; padding: 16px 28px 16px 0; color: #758195; white-space: nowrap; }
.excel-steps b { display: inline-grid; place-items: center; width: 23px; height: 23px; margin-right: 7px; border-radius: 50%; background: #e9edf3; }
.excel-steps .current { color: #0b348c; font-weight: 700; border-bottom: 3px solid #103895; }
.excel-steps .current b, .excel-steps .done b { color: #fff; background: #103895; }
.excel-content { box-sizing: border-box; width: 100%; max-width: 1440px; flex: 1; margin: 0 auto; padding: 25px 32px; }
.excel-setup { display: grid; grid-template-columns: minmax(300px, 1fr) minmax(340px, 1fr); gap: 20px; }
.excel-panel { min-width: 0; padding: 20px; border: 1px solid #dce3ed; border-radius: 6px; background: #fff; }
.excel-panel h2 { margin: 0 0 8px; font-size: 16px; }
.excel-panel .excel-help { margin-bottom: 18px; }
.excel-selected { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; padding: 12px; border: 1px solid #b9cff5; border-radius: 5px; background: #edf4ff; }
.excel-selected > i { color: #16449e; }
.excel-selected span { flex: 1; min-width: 0; }
.excel-selected small { display: block; overflow: hidden; color: #66758c; margin-top: 2px; text-overflow: ellipsis; white-space: nowrap; }
.excel-selected button, .excel-tree-bar button { border: 0; background: transparent; cursor: pointer; color: #64748b; }
.excel-tree-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-weight: 600; }
.excel-tree { height: 420px; overflow: auto; border: 1px solid #dce3ed; border-radius: 5px; padding: 8px; }
.excel-tree ul { list-style: none; padding: 0; margin: 0; }
.excel-label { display: block; margin: 20px 0 8px; color: #44546a; font-weight: 600; }
.excel-panel select { box-sizing: border-box; width: 100%; height: 48px; padding: 0 14px; border: 1px solid #a9b7ca; border-radius: 5px; background: #fff; color: #253449; font: inherit; }
.excel-actions { display: flex; gap: 10px; margin-top: 12px; }
.excel-button { min-height: 40px; padding: 0 16px; border: 1px solid #a9b7ca; border-radius: 5px; background: #fff; color: #173c81; font: inherit; font-weight: 600; cursor: pointer; }
.excel-button:disabled { opacity: .55; cursor: not-allowed; }
.excel-button:hover:not(:disabled) { background: #eef3fc; }
.excel-drop { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 260px; padding: 20px; border: 2px dashed #b5c9e7; border-radius: 6px; background: #fff; text-align: center; }
.excel-drop.dragging { background: #edf4ff; border-color: #17449e; }
.excel-drop > i { font-size: 38px; color: #23804c; }
.excel-drop strong { max-width: 100%; overflow-wrap: anywhere; }
.excel-drop span { color: #728198; }
.excel-drop > div { display: flex; gap: 10px; }
.excel-duplicate-mode { margin-top: 18px; }
.excel-duplicate-mode > strong { display: block; margin-bottom: 9px; color: #44546a; }
.excel-duplicate-mode > div { display: inline-flex; max-width: 100%; border: 1px solid #a9b7ca; border-radius: 5px; overflow: hidden; }
.excel-duplicate-mode label { padding: 10px 14px; cursor: pointer; white-space: nowrap; }
.excel-duplicate-mode label + label { border-left: 1px solid #a9b7ca; }
.excel-duplicate-mode label.active { background: #eaf1fe; color: #0b348c; font-weight: 700; }
.excel-duplicate-mode input { margin-right: 5px; }
.excel-metrics { display: flex; gap: 20px; margin-bottom: 16px; }
.excel-metrics span { color: #586b83; }
.excel-metrics b { color: #173c81; }
.excel-review-section { margin-bottom: 16px; }
.excel-decision { padding: 12px 0; border-top: 1px solid #e4eaf2; }
.excel-choice { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 9px; }
.excel-choice label { cursor: pointer; }
.excel-table-scroll { overflow: auto; border: 1px solid #dce3ed; border-radius: 5px; background: #fff; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 12px 14px; border-bottom: 1px solid #e4eaf2; }
th { background: #f4f6f9; color: #46556a; white-space: nowrap; }
.excel-muted { color: #9aa6b5; background: #fafbfc; }
.excel-empty { text-align: center; color: #8793a4; }
.excel-summary > i { color: #269963; font-size: 28px; }
.excel-summary h2 { margin-bottom: 4px; }
.excel-summary p { color: #697586; }
.excel-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; position: sticky; bottom: 0; padding: 16px 32px; border-top: 1px solid #dce3ed; background: #fff; color: #728198; }
.excel-footer > div { display: flex; gap: 10px; }
.excel-primary { border-color: #0a3192; background: #0a3192; color: #fff; }
.excel-primary:hover:not(:disabled) { background: #174aad; }
@media (max-width: 850px) { .excel-setup { grid-template-columns: 1fr; } .excel-heading, .excel-content, .excel-footer { padding-left: 18px; padding-right: 18px; } .excel-footer { align-items: flex-start; flex-direction: column; } }
</style>

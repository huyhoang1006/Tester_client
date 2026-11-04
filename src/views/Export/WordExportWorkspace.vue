<template>
    <div class="word-export-workspace">
        <header class="word-export-heading">
            <h1>Export Test Report</h1>
            <button type="button" class="word-export-button" @click="managerVisible = true"><i class="fa-solid fa-gear"></i> Template Manager</button>
        </header>
        <nav class="word-export-steps" aria-label="Export progress">
            <span v-for="(label, index) in ['Select Data', 'Review Values', 'Export Summary']" :key="label"
                :class="{current: step === index + 1, done: step > index + 1}"><b>{{ index + 1 }}</b> {{ label }}</span>
        </nav>

        <main v-show="step === 1" class="word-export-content">
            <div class="word-export-setup">
                <section class="word-export-panel">
                    <div class="word-export-section-heading"><h2>Source data</h2>
                        <button type="button" class="word-export-icon-button" title="Refresh asset tree" @click="$emit('refresh-tree')"><i class="fa-solid fa-rotate"></i></button></div>
                    <div class="word-export-tree">
                        <ul>
                            <TreeNode v-for="item in visibleOrganisations" :key="`${item.mrid}_${item.mode}`" :node="item"
                                :selectedNodes="pickerSelectedNodes" @fetch-children="$emit('fetch-children', $event)"
                                @clear-selection="pickerSelectedNodes = []" @update-selection="handlePickerSelection"
                                @double-click-node="handlePickerSelection" />
                        </ul>
                    </div>
                    <div class="word-export-tree-actions">
                        <span>{{ candidate ? candidateLabel : 'No node selected' }}</span>
                        <button type="button" class="word-export-button" :disabled="!candidate || !['asset', 'job', 'test'].includes(candidate.mode)" @click="addCandidate">
                            <i class="fa-solid fa-plus"></i> Add source</button>
                    </div>
                </section>

                <section class="word-export-panel">
                    <h2>Template &amp; sources</h2>
                    <label for="word-export-template">Test report template</label>
                    <select id="word-export-template" v-model="selectedTemplateName" @change="onWorkspaceTemplateChange">
                        <option value="">Select a template</option>
                        <option v-for="template in matchingTemplates" :key="template.name" :value="template.name">{{ template.name }}</option>
                    </select>
                    <div class="word-export-template-actions">
                        <button type="button" class="word-export-button" :disabled="!currentFilePath" @click="previewVisible = true">
                            <i class="fa-solid fa-eye"></i> Preview Template</button>
                        <span v-if="currentFilePath" :title="currentFilePath">{{ fileName(currentFilePath) }}</span>
                    </div>
                    <div class="word-export-section-heading word-export-source-heading"><h3>Selected sources ({{ selectedItems.length }})</h3>
                        <button v-if="selectedItems.length" type="button" class="word-export-icon-button" title="Clear sources" @click="clearSources"><i class="fa-solid fa-trash"></i></button></div>
                    <div class="word-export-sources">
                        <div v-for="item in selectedItems" :key="item.id" class="word-export-source">
                            <i :class="item.mode === 'test' ? 'fa-solid fa-clipboard-check' : item.mode === 'job' ? 'fa-solid fa-clipboard-list' : item.mode === 'asset' ? 'fa-solid fa-bolt' : 'fa-solid fa-building'"></i>
                            <span><strong>{{ item.name }}</strong><small>{{ item.label }}</small></span>
                            <button type="button" class="word-export-icon-button" title="Remove source" @click="removeSource(item.id)"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                        <p v-if="!selectedItems.length" class="word-export-empty">No sources selected</p>
                    </div>
                </section>
            </div>
        </main>

        <main v-if="step === 2" class="word-export-content word-export-preview-content">
            <WordFilledPreview :template-name="selectedTemplateName" :template-path="currentFilePath"
                :variables="selectedTemplate ? selectedTemplate.variable : []" :code-map="previewCodeMap" :rows="previewRows" />
        </main>

        <main v-if="step === 3" class="word-export-content word-export-summary">
            <i class="fa-solid fa-circle-check"></i>
            <h2>Export complete</h2>
            <p>{{ fileName(exportedPath) }}</p>
            <div class="word-export-summary-actions"><button type="button" class="word-export-button" @click="openExportedFile"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open DOCX</button></div>
        </main>

        <footer class="word-export-footer">
            <span v-if="step === 1">{{ selectedItems.length }} source{{ selectedItems.length === 1 ? '' : 's' }} selected</span>
            <span v-else-if="step === 2">{{ emptyCount ? `${emptyCount} field(s) have no matching value.` : 'All mapped fields have values.' }}</span>
            <span v-else></span>
            <div>
                <button v-if="step === 2" type="button" class="word-export-button" @click="step = 1">Back</button>
                <button v-if="step === 1" type="button" class="word-export-button word-export-primary" :disabled="!canReview || exportLoading" @click="reviewExport">
                    {{ exportLoading ? 'Reading data...' : 'Review Values' }}</button>
                <button v-if="step === 2" type="button" class="word-export-button word-export-primary" :disabled="!filledCount || exportLoading" @click="confirmExport">
                    {{ exportLoading ? 'Exporting...' : 'Export DOCX' }}</button>
                <button v-if="step === 3" type="button" class="word-export-button word-export-primary" @click="step = 1">Export Another Report</button>
            </div>
        </footer>

        <el-dialog title="Test Report Template Manager" :visible.sync="managerVisible" width="min(1380px, 96vw)" top="3vh"
            custom-class="word-export-manager-dialog" append-to-body @closed="loadTemplates">
            <ExportView v-if="managerVisible" export-type="word" manager-mode :initial-template-name="selectedTemplateName" />
        </el-dialog>
        <WordTemplatePreview :visible.sync="previewVisible" :template-name="selectedTemplateName" :file-path="currentFilePath" :mappings="tableData" />
    </div>
</template>

<script>
import ExportView from './index.vue'
import TreeNode from '@/views/Common/TreeNode.vue'
import WordTemplatePreview from '@/views/Import/components/WordTemplatePreview.vue'
import WordFilledPreview from './components/WordFilledPreview.vue'

const SOURCE_MODES = ['organisation', 'substation', 'voltageLevel', 'bay', 'asset', 'job', 'test']

export default {
    name: 'WordExportWorkspace',
    extends: ExportView,
    components: {ExportView, TreeNode, WordTemplatePreview, WordFilledPreview},
    props: {organisationClientList: {type: Array, default: () => []}},
    data() {
        return {
            step: 1, managerVisible: false, previewVisible: false, pickerSelectedNodes: [],
            candidate: null, candidatePath: [], previewCodeMap: {}, exportedPath: ''
        }
    },
    computed: {
        visibleOrganisations() {
            return this.organisationClientList
                .flatMap(item => item.mrid === this.$constant.ROOT ? item.children || [] : [item])
                .sort((a, b) => (a.name || a.aliasName || '').localeCompare(b.name || b.aliasName || '', 'en', {numeric: true, sensitivity: 'base'}))
        },
        candidateLabel() { return this.candidate ? this.nodeName(this.candidate) : '' },
        sourceAssetTypes() {
            return [...new Set(this.selectedItems.map(item => item.context.asset?.assetType).filter(Boolean))]
        },
        matchingTemplates() {
            if (!this.sourceAssetTypes.length) return this.templateList
            return this.templateList.filter(template => {
                const assetRows = (template.variable || []).filter(row => row.category === 'Asset')
                return !assetRows.length || assetRows.some(row => {
                    const key = row.featureLevels?.[0]?.key
                    return key && this.sourceAssetTypes.some(type => this.assetTypeToKey[type] === `Asset_${key}`)
                })
            })
        },
        canReview() {
            return !!(this.selectedTemplateName && this.currentFilePath && this.sourceAssetTypes.length && this.tableData.length &&
                this.matchingTemplates.some(template => template.name === this.selectedTemplateName))
        },
        previewRows() {
            return this.tableData.filter(row => row.code).map(row => ({
                code: row.code,
                label: this.fieldLabel(row),
                value: this.displayValue(this.previewCodeMap[row.code])
            }))
        },
        filledCount() { return this.previewRows.filter(row => row.value).length },
        emptyCount() { return this.previewRows.length - this.filledCount }
    },
    methods: {
        async loadTemplates() {
            await ExportView.methods.loadTemplates.call(this)
            if (this.selectedTemplateName && !this.templateList.some(item => item.name === this.selectedTemplateName)) {
                this.selectedTemplateName = ''
                this.currentFilePath = ''
                this.tableData = []
            } else if (this.selectedTemplateName) this.onTemplateChange(this.selectedTemplateName)
        },
        onWorkspaceTemplateChange() {
            this.onTemplateChange(this.selectedTemplateName)
            this.previewCodeMap = {}
            this.step = 1
        },
        fileName(path) { return String(path || '').split(/[\\/]/).pop() },
        nodeName(node) { return node.apparatus_id || node.serial_number || node.aliasName || node.name || node.displayName || node.mrid },
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
            if (!SOURCE_MODES.includes(node.mode)) return
            this.candidate = node
            this.candidatePath = this.findNodePath(this.visibleOrganisations, node.mrid) || [...(node.parentArr || []), node]
            this.pickerSelectedNodes = [node]
        },
        handlePickerSelection(node) {
            this.selectContextNode(node)
            if (node.mode === 'test' && !this.selectedItems.some(item => item.mode === 'test' && item.id === node.mrid)) {
                this.addCandidate()
            }
        },
        contextForPath(path) {
            const context = {}
            for (const node of path) {
                if (!SOURCE_MODES.includes(node.mode)) continue
                const assetType = node.assetType || node.asset
                context[node.mode] = {mrid: node.mrid, name: this.nodeName(node), ...(assetType ? {assetType} : {})}
                if (node.mode === 'test' && (node.workMrid || node.work_mrid || node.work)) {
                    context.job = {mrid: node.workMrid || node.work_mrid || node.work, assetType: context.asset?.assetType || node.job}
                }
            }
            if (context.job && context.asset) context.job.assetType = context.asset.assetType
            return context
        },
        addSource(node, path) {
            if (this.selectedItems.some(item => item.mode === node.mode && item.id === node.mrid)) return
            const context = this.contextForPath(path)
            this.selectedItems.push({id: node.mrid, mode: node.mode, name: this.nodeName(node),
                label: path.map(item => this.nodeName(item)).join(' / '), context})
        },
        addCandidate() {
            if (!this.candidate || !['asset', 'job', 'test'].includes(this.candidate.mode)) return
            if (this.candidate.mode === 'test' && !(this.candidate.workMrid || this.candidate.work_mrid || this.candidate.work)) {
                this.$message.warning('This test has no linked job to export')
                return
            }
            if (['job', 'test'].includes(this.candidate.mode)) {
                const assetIndex = this.candidatePath.findIndex(node => node.mode === 'asset')
                if (assetIndex !== -1) this.addSource(this.candidatePath[assetIndex], this.candidatePath.slice(0, assetIndex + 1))
            }
            this.addSource(this.candidate, this.candidatePath)
            this.previewCodeMap = {}
            this.step = 1
        },
        removeSource(id) {
            this.selectedItems = this.selectedItems.filter(item => item.id !== id)
            this.previewCodeMap = {}
            this.step = 1
        },
        clearSources() { this.selectedItems = []; this.previewCodeMap = {}; this.step = 1 },
        fieldLabel(row) {
            let node = this.FEATURE_TREE[row.category]
            const labels = [node?.label || row.category]
            for (const level of row.featureLevels || []) {
                node = node?.children?.[level.key]
                if (node) labels.push(node.label || level.key)
            }
            return labels.filter(Boolean).join(' / ')
        },
        displayValue(value) {
            const values = Array.isArray(value) ? value : [value]
            return values.filter(item => item !== undefined && item !== null && String(item).trim() !== '').map(String).join(', ')
        },
        async reviewExport() {
            if (!this.canReview) return
            this.exportLoading = true
            try {
                this.previewCodeMap = await this.buildExportCodeMap()
                this.step = 2
            } catch (error) { this.$message.error(error.message || 'Cannot read export data') }
            finally { this.exportLoading = false }
        },
        async confirmExport() {
            if (!this.filledCount || this.exportLoading) return
            this.exportLoading = true
            try {
                const template = this.templateList.find(item => item.name === this.selectedTemplateName)
                if (!template) throw new Error('Template not found')
                const result = await window.electronAPI.exportWordWithData({
                    templatePath: this.currentFilePath, variables: template.variable || [], codeMap: this.previewCodeMap
                })
                if (result?.canceled) return
                if (!result?.success) throw new Error(result?.message || 'Word export failed')
                this.exportedPath = result.filePath
                this.step = 3
            } catch (error) { this.$message.error(error.message || 'Word export failed') }
            finally { this.exportLoading = false }
        },
        async openExportedFile() {
            if (!this.exportedPath) return
            try {
                const error = await window.electronAPI.openFileTemplate(this.exportedPath)
                if (error) this.$message.error(String(error))
            } catch (error) { this.$message.error(error.message || 'Cannot open DOCX') }
        }
    }
}
</script>

<style scoped>
.word-export-workspace { display: flex; flex-direction: column; height: 100%; min-height: 0; background: #f2f5fa; color: #263247; font-size: 14px; }
.word-export-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 25px 34px; background: #fff; border-bottom: 1px solid #dce3ee; }
.word-export-heading h1 { margin: 0; font-size: 22px; }
.word-export-steps { display: flex; gap: 32px; padding: 17px 34px; background: #fff; border-bottom: 1px solid #dce3ee; }
.word-export-steps span { color: #8794a8; font-weight: 600; }
.word-export-steps span.current, .word-export-steps span.done { color: #0a348c; }
.word-export-steps b { display: inline-grid; place-items: center; width: 28px; height: 28px; margin-right: 6px; border-radius: 50%; background: #e5eaf2; }
.word-export-steps .current b { background: #0a348c; color: #fff; }
.word-export-content { flex: 1; min-height: 0; overflow: auto; padding: 30px 34px; }
.word-export-setup { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; min-height: 100%; }
.word-export-panel { min-width: 0; padding: 24px; border: 1px solid #dce3ee; border-radius: 6px; background: #fff; }
.word-export-panel h2 { margin: 0 0 22px; font-size: 17px; }
.word-export-panel h3 { margin: 0; font-size: 14px; }
.word-export-panel label { display: block; margin-bottom: 8px; color: #485971; font-weight: 600; }
.word-export-panel select { width: 100%; height: 46px; padding: 0 12px; border: 1px solid #bbc8dc; border-radius: 5px; background: #fff; color: #263247; }
.word-export-button { min-height: 38px; padding: 8px 14px; border: 1px solid #b7c5dc; border-radius: 5px; background: #fff; color: #163d83; font-weight: 600; cursor: pointer; }
.word-export-button:hover:not(:disabled) { border-color: #0a348c; background: #eef4ff; }
.word-export-button:disabled { opacity: .5; cursor: not-allowed; }
.word-export-primary { border-color: #0a348c; background: #0a348c; color: #fff; }
.word-export-primary:hover:not(:disabled) { background: #1649a6; color: #fff; }
.word-export-icon-button { border: 0; background: transparent; color: #718198; cursor: pointer; }
.word-export-section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.word-export-tree { height: min(52vh, 550px); min-height: 320px; overflow: auto; border: 1px solid #dce3ee; border-radius: 5px; padding: 12px; }
.word-export-tree ul { margin: 0; padding: 0; list-style: none; }
.word-export-tree-actions { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 12px; }
.word-export-tree-actions span, .word-export-template-actions span { overflow: hidden; color: #66758b; text-overflow: ellipsis; white-space: nowrap; }
.word-export-template-actions { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
.word-export-source-heading { margin-top: 28px; padding-bottom: 10px; border-bottom: 1px solid #e0e6ef; }
.word-export-sources { max-height: 42vh; overflow: auto; }
.word-export-source { display: flex; align-items: center; gap: 12px; padding: 12px 3px; border-bottom: 1px solid #e9edf3; }
.word-export-source > i { color: #0a348c; }
.word-export-source span { flex: 1; min-width: 0; }
.word-export-source strong, .word-export-source small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.word-export-source small { margin-top: 3px; color: #7b889b; }
.word-export-empty { margin: 22px 0; color: #8b97a8; text-align: center; }
.word-export-preview-content { display: flex; overflow: hidden; padding: 0; }
.word-export-summary { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.word-export-summary > i { color: #268c59; font-size: 42px; }
.word-export-summary h2 { margin: 16px 0 0; }
.word-export-summary p { overflow-wrap: anywhere; }
.word-export-footer { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 16px 34px; border-top: 1px solid #dce3ee; background: #fff; color: #6c798d; }
.word-export-footer > div { display: flex; gap: 10px; }
@media (max-width: 900px) { .word-export-setup { grid-template-columns: 1fr; } .word-export-content { padding: 18px; } .word-export-heading, .word-export-steps, .word-export-footer { padding-left: 18px; padding-right: 18px; } }
</style>

<style>
.word-export-manager-dialog { display: flex; flex-direction: column; height: 94vh; max-height: 94vh; margin-bottom: 0; }
.word-export-manager-dialog .el-dialog__body { flex: 1; min-height: 0; padding: 0; overflow: hidden; }
.word-export-manager-dialog .el-dialog__body > div { height: 100%; }
</style>

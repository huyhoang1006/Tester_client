<template>
<el-dialog :title="dialogTitle" :visible="visible" width="900px" top="6vh"
  append-to-body @update:visible="$emit('update:visible', $event)" @open="onOpen">

  <!-- Template manager + actions: y hệt Import/Export cũ, tái dùng component -->
  <template-manager
    :template-list="templateList"
    v-model="selectedTemplateName"
    @change="onTemplateChange"
    @add-template="openAddTemplateDialog"
    @refresh="loadTemplates"
  >
    <template #actions>
      <el-button type="primary" size="mini" :disabled="!selectedTemplateName" @click="addRow()">Add Row</el-button>
      <el-button type="success" size="mini" :disabled="!selectedTemplateName" @click="handleUploadTemplateFile">
        {{ fileType === 'word' ? 'Word File' : 'Excel File' }}
      </el-button>
      <el-button type="danger"  size="mini" :disabled="!selectedTemplateName" @click="handleDelete">Delete</el-button>
      <el-button type="warning" size="mini" :disabled="!selectedTemplateName" @click="handleSave">Save</el-button>
      <el-button type="info"    size="mini" :disabled="!selectedTemplateName" @click="handleImportJson">Import JSON</el-button>
      <el-button type="info"    size="mini" :disabled="!selectedTemplateName || !tableData.length" @click="handleExportJson">Export JSON</el-button>
      <el-button v-if="mode === 'export'" type="primary" size="mini"
        :disabled="!selectedTemplateName || !currentFilePath" :loading="working" @click="handleExportClick">
        <i class="fa-solid fa-file-export"></i> Export {{ fileType === 'word' ? 'Word' : 'Excel' }}
      </el-button>
      <el-button v-if="mode === 'import'" type="warning" size="mini"
        :disabled="!selectedTemplateName || !currentFilePath" :loading="working" @click="handleImportFile">
        <i class="fa-solid fa-file-import"></i> Import {{ fileType === 'word' ? 'Word' : 'Excel' }}
      </el-button>
    </template>
  </template-manager>

  <div v-if="currentFilePath" style="margin:4px 0 8px;font-size:12px;color:#909399;">
    <span @click="openTemplateFile" title="Click to open file"
      style="cursor:pointer;display:inline-flex;align-items:center;gap:5px;"
      onmouseover="this.style.color='#409EFF'" onmouseout="this.style.color='#909399'">
      <i :class="fileType==='word' ? 'fa-solid fa-file-word' : 'fa-solid fa-file-excel'"
        :style="{color: fileType==='word' ? '#2B579A' : '#67C23A'}"></i>
      {{ currentFilePath.split(/[\\\/]/).pop() }}
      <i class="el-icon-top-right" style="font-size:10px;"></i>
    </span>
  </div>

  <div>
    <template v-if="selectedTemplateName">
      <data-table
        :table-data="tableData"
        :category-options="categoryOptions"
        :get-options="getFeatureOptionsByLevel"
        @add-row="addRow"
        @clear-all="clearAll"
        @remove-row="removeRow"
        @category-change="onCategoryChange"
        @feature-change="onFeatureLevelChange"
      />
    </template>
    <div v-else style="padding:30px;text-align:center;color:#C0C4CC;font-size:13px;">
      Select a template or click <b>Add Template</b> to get started
    </div>
  </div>

  <!-- Add template dialog -->
  <el-dialog title="Add new template" :visible.sync="showAddDialog" width="420px" append-to-body @close="resetAddDialog">
    <el-form ref="addForm" :model="addForm" :rules="addRules" size="small" label-width="120px" label-position="left">
      <el-form-item label="Template name" prop="name"><el-input v-model="addForm.name" placeholder="e.g. Equipment list" clearable /></el-form-item>
      <el-form-item label="Template file">
        <div style="display:flex;align-items:center;gap:8px;">
          <el-input v-model="addForm.filePath" placeholder="No file selected" readonly size="small" style="flex:1;" />
          <el-button size="small" type="success" @click="uploadTemplateForNew"><i class="fa-solid fa-upload"></i> Upload</el-button>
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button size="small" @click="showAddDialog = false">Cancel</el-button>
      <el-button size="small" type="primary" :disabled="!addForm.name" :loading="addLoading" @click="confirmAddTemplate">Create</el-button>
    </div>
  </el-dialog>

  <!-- Export: chọn thiết bị làm nguồn dữ liệu -->
  <equipment-picker :visible.sync="pickerVisible" confirm-label="Export" @add="onEquipmentSelected" />

  <!-- Import: xử lý thiết bị trùng -->
  <import-conflict-dialog
    :visible.sync="conflictVisible"
    :conflicts="conflictRows"
    @confirm="onConflictConfirm"
    @cancel="onConflictCancel" />

  <el-dialog title="Manufacturer by sheet" :visible.sync="manufacturerSheetVisible" width="560px" append-to-body>
    <div class="mfr-sheet-note">
      Select the manufacturer for each sheet. These values are used when the imported file does not provide a manufacturer column.
    </div>
    <table class="mfr-sheet-table">
      <thead>
        <tr><th>Sheet</th><th>Manufacturer</th></tr>
      </thead>
      <tbody>
        <tr v-for="row in manufacturerSheetRows" :key="row.sheet">
          <td>{{ row.sheet }}</td>
          <td>
            <el-select v-model="row.manufacturer" size="small" filterable allow-create default-first-option style="width:100%;">
              <el-option v-for="m in manufacturerOptions" :key="m" :label="m" :value="m" />
            </el-select>
          </td>
        </tr>
      </tbody>
    </table>
    <div slot="footer">
      <el-button size="small" @click="cancelManufacturerSheet">Cancel</el-button>
      <el-button size="small" type="primary" @click="confirmManufacturerSheet">Continue Import</el-button>
    </div>
  </el-dialog>

</el-dialog>
</template>

<script>
/* eslint-disable */
/**
 * Dialog import/export testing equipment theo template Excel/Word.
 * UI giống Import/Export cũ nhưng TÁCH BIỆT hoàn toàn:
 *   - category chỉ có "Testing equipment" (TE_CATEGORY_OPTION)
 *   - template lưu với category 'te-import' / 'te-export' (không lẫn với template cũ)
 *   - nguồn dữ liệu export = danh sách thiết bị (equipmentPicker), không phải cây org→job
 * Tái dùng TemplateManager + DataTable (presentational, không sửa file cũ).
 */
import { FEATURE_TREE, TE_CATEGORY_OPTION } from '@/views/Common/constants'
import TemplateManager from '@/views/Import/components/TemplateManager.vue'
import DataTable from '@/views/Import/components/DataTable.vue'
import EquipmentPicker from './equipmentPicker.vue'
import ImportConflictDialog from './importConflictDialog.vue'
import templateImport from '../services/templateImport'
import templateExport from '../services/templateExport'
import MANUFACTURER_MAP from '@/views/ConstantAsset/manufacturer.js'

export default {
  name: 'TeTemplateImportExport',
  components: { TemplateManager, DataTable, EquipmentPicker, ImportConflictDialog },
  props: {
    visible:  { type: Boolean, default: false },
    mode:     { type: String, default: 'export' },   // 'import' | 'export'
    fileType: { type: String, default: 'excel' }     // 'excel' | 'word'
  },
  data() {
    return {
      templateList: [], selectedTemplateName: '', currentFilePath: '', tableData: [],
      showAddDialog: false, addLoading: false,
      addForm: { name: '', filePath: '' },
      addRules: { name: [{ required: true, message: 'Please enter template name', trigger: 'blur' }] },
      categoryOptions: TE_CATEGORY_OPTION,
      working: false,
      // export
      pickerVisible: false,
      // import
      pending: null,          // { entities, newcomers, conflicts } từ templateImport.prepare
      conflictVisible: false,
      conflictRows: [],
      conflictHandled: false,
      manufacturerSheetVisible: false,
      manufacturerSheetRows: [],
      pendingRead: null
    }
  },
  computed: {
    dialogTitle() {
      return (this.mode === 'import' ? 'Import' : 'Export') +
        ' testing equipment — ' + (this.fileType === 'word' ? 'Word' : 'Excel') + ' template'
    },
    // Template tách kho với Import/Export cũ
    storeCategory() { return 'te-' + this.mode },
    userId() {
      const user = this.$store && this.$store.getters.getUser
      return (user && user.user_id) || null
    },
    manufacturerOptions() {
      return MANUFACTURER_MAP['TestingEquipmentDto'] || []
    }
  },
  methods: {
    async onOpen() {
      this.selectedTemplateName = ''
      this.currentFilePath = ''
      this.tableData = []
      this.pending = null
      await this.loadTemplates()
    },

    // ── Templates (kho riêng: type = fileType, category = 'te-import'|'te-export') ──
    async loadTemplates() {
      try {
        const rs = await window.electronAPI.getAllTemplatesByType(this.fileType, this.storeCategory)
        if (rs && rs.success) {
          this.templateList = rs.data.map(t => ({ ...t, variable: t.variable ? JSON.parse(t.variable) : [] }))
        }
      } catch (e) { console.error(e) }
    },
    onTemplateChange(name) {
      if (!name) { this.currentFilePath = ''; this.tableData = []; return }
      const tmpl = this.templateList.find(t => t.name === name)
      if (!tmpl) return
      this.currentFilePath = tmpl.path || ''
      this.tableData = (tmpl.variable || []).map(v => ({
        code: v.code || '', category: v.category || '',
        featureLevels: (v.featureLevels || []).map(f => ({ key: f.key || '' })),
        coordinates: v.coordinates || []
      }))
    },
    openAddTemplateDialog() { this.resetAddDialog(); this.showAddDialog = true },
    resetAddDialog() { this.addForm = { name: '', filePath: '' }; this.addLoading = false },
    async uploadTemplateForNew() {
      if (!this.addForm.name) { this.$message.warning('Please enter template name first'); return }
      try {
        let rs
        if (this.fileType === 'word') rs = await window.electronAPI.uploadWordTemplate(this.addForm.name)
        else                          rs = await window.electronAPI.uploadExcelTemplate(this.addForm.name)
        if (rs && rs.success) { this.addForm.filePath = rs.filePath; this.$message.success('Uploaded') }
        else if (rs && !rs.canceled) this.$message.error('Upload failed')
      } catch (e) { this.$message.error(e.message) }
    },
    async confirmAddTemplate() {
      this.$refs.addForm.validate(async (valid) => {
        if (!valid) return
        this.addLoading = true
        try {
          const exists = await window.electronAPI.checkNameTemplateExist(this.addForm.name)
          if (exists && exists.data === true) { this.$message.error(`Template "${this.addForm.name}" already exists`); return }
          const rs = await window.electronAPI.insertTemplate({
            name: this.addForm.name, path: this.addForm.filePath || '',
            variable: JSON.stringify([]), type: this.fileType, category: this.storeCategory
          })
          if (rs && rs.success) {
            this.$message.success(`Created "${this.addForm.name}"`); this.showAddDialog = false
            await this.loadTemplates()
            this.selectedTemplateName = this.addForm.name
            this.currentFilePath = this.addForm.filePath || ''
            this.tableData = []
          } else this.$message.error('Create failed')
        } catch (e) { this.$message.error(e.message) } finally { this.addLoading = false }
      })
    },
    async handleUploadTemplateFile() {
      if (!this.selectedTemplateName) return
      try {
        let rs
        if (this.fileType === 'word') rs = await window.electronAPI.uploadWordTemplate(this.selectedTemplateName)
        else                          rs = await window.electronAPI.uploadExcelTemplate(this.selectedTemplateName)
        if (!rs || rs.canceled) return
        if (rs.success) { this.currentFilePath = rs.filePath; await this.saveWithScan() }
      } catch (e) { this.$message.error(e.message) }
    },
    async handleSave() { await this.saveWithScan() },
    async saveWithScan() {
      if (!this.selectedTemplateName || !this.currentFilePath) {
        this.$message.warning('Please upload a Template file first'); return
      }
      const variables = this.tableData.map(r => ({
        code: r.code, category: r.category,
        featureLevels: r.featureLevels, coordinates: r.coordinates || []
      }))
      try {
        const rs = await window.electronAPI.saveTemplateWithScan({
          name: this.selectedTemplateName, filePath: this.currentFilePath,
          variables, type: this.fileType, category: this.storeCategory
        })
        if (rs && rs.success) {
          this.$message.success('Saved')
          await this.loadTemplates()
          this.onTemplateChange(this.selectedTemplateName)
        } else this.$message.error('Save failed')
      } catch (e) { this.$message.error(e.message) }
    },
    async handleDelete() {
      try {
        await this.$confirm(`Delete template "${this.selectedTemplateName}"?`, 'Warning',
          { type: 'warning', confirmButtonText: 'Delete', cancelButtonText: 'Cancel' })
      } catch { return }
      try {
        const rs = await window.electronAPI.deleteTemplate(this.selectedTemplateName)
        if (rs && rs.success) {
          this.$message.success('Deleted')
          this.selectedTemplateName = ''; this.currentFilePath = ''; this.tableData = []
          await this.loadTemplates()
        }
      } catch (e) { this.$message.error(e.message) }
    },
    async handleImportJson() {
      try {
        const rs = await window.electronAPI.importJSON()
        if (!rs || !rs.success || !rs.data) return
        const variables = Array.isArray(rs.data) ? rs.data[0] : rs.data
        if (!Array.isArray(variables)) { this.$message.error('Invalid template config file'); return }
        this.tableData = variables.map(v => ({
          code: v.code || '', category: v.category || '',
          featureLevels: (v.featureLevels || []).map(f => ({ key: f.key || '' })),
          coordinates: v.coordinates || []
        }))
        this.$message.success('Imported')
      } catch (e) { this.$message.error(e.message) }
    },
    async handleExportJson() {
      try {
        const variables = this.tableData.map(v => ({
          code: v.code || '', category: v.category || '',
          featureLevels: (v.featureLevels || []).map(f => ({ key: f.key || '' })),
          coordinates: v.coordinates || []
        }))
        const defaultFileName = (this.selectedTemplateName || 'template') + '-config.json'
        const rs = await window.electronAPI.exportJSON([variables], { defaultFileName, title: 'Save template config as JSON' })
        if (rs && rs.success) this.$message.success('Exported: ' + rs.filePath)
        else if (rs && rs.message !== 'Export cancelled') this.$message.error(rs.message || 'Export failed')
      } catch (e) { this.$message.error(e.message) }
    },
    openTemplateFile() {
      if (!this.currentFilePath) return
      window.electronAPI.openFileTemplate(this.currentFilePath).then(err => {
        if (err) this.$message.error('Cannot open file: ' + err)
      })
    },

    // ── EXPORT: chọn thiết bị → build codeMap → xuất file ──────────────────
    handleExportClick() {
      if (!this.tableData.some(r => r.code && r.category)) {
        this.$message.warning('Template has no rows — add rows and Save first'); return
      }
      this.pickerVisible = true
    },
    async onEquipmentSelected(rows) {
      if (!rows || !rows.length) return
      this.working = true
      try {
        const tmpl = this.templateList.find(t => t.name === this.selectedTemplateName)
        const variables = tmpl ? (tmpl.variable || []) : []
        const codeMap = await templateExport.buildCodeMap(rows.map(r => r.mrid), this.tableData)
        if (!Object.keys(codeMap).length) {
          this.$message.warning('No matching data — check template rows and Save'); return
        }
        const payload = { templatePath: this.currentFilePath, variables, codeMap }
        const rs = this.fileType === 'word'
          ? await window.electronAPI.exportWordWithData(payload)
          : await window.electronAPI.exportTemplateWithData(payload)
        if (rs && rs.canceled) return
        if (rs && rs.success) this.$message.success('Exported ' + rows.length + ' equipment: ' + rs.filePath)
        else this.$message.error((rs && rs.message) || 'Export failed')
      } catch (e) {
        this.$message.error('Export error: ' + e.message)
        console.error('TE export error:', e)
      } finally { this.working = false }
    },

    // ── IMPORT: đọc file → check trùng → insert ────────────────────────────
    async handleImportFile() {
      this.working = true
      try {
        let picked
        if (this.fileType === 'word') picked = await window.electronAPI.pickWordFileForImport()
        else                          picked = await window.electronAPI.pickExcelFileForImport()
        if (!picked || !picked.filePath) return

        const tmpl = this.templateList.find(t => t.name === this.selectedTemplateName)
        const variables = tmpl ? (tmpl.variable || []) : []
        const args = { filePath: picked.filePath, templatePath: this.currentFilePath, variables }
        const read = this.fileType === 'word'
          ? await window.electronAPI.readWordForImport(args)
          : await window.electronAPI.readExcelForImport(args)
        if (!read || !read.success) {
          this.$message.error((read && read.message) || 'Failed to read file'); return
        }

        if (this.fileType === 'excel' && this.needsManufacturerBySheet(read)) {
          this.pendingRead = read
          this.manufacturerSheetRows = this.buildManufacturerSheetRows(read)
          this.manufacturerSheetVisible = true
          return
        }

        await this.prepareImport(read, {})
      } catch (e) {
        this.$message.error('Import error: ' + e.message)
        console.error('TE import error:', e)
      } finally { this.working = false }
    },
    async prepareImport(read, manufacturerBySheet) {
      const codeValueMap = read.codeValueMap || {}
      const hasReadValues = Object.values(codeValueMap).some(values =>
        (Array.isArray(values) ? values : [values]).some(v => v !== null && v !== undefined && String(v).trim() !== '')
      )
      const hasTemplateRows = this.tableData.some(row =>
        row.code && templateImport.getLeafValue(row.featureLevels, row.category || 'TestingEquipmentDto')
      )
      if (!hasTemplateRows) {
        this.$message.warning('Template has no valid testing equipment fields. Add rows, select features, then Save.')
        return
      }
      if (!hasReadValues) {
        this.$message.warning('No values were read from the selected file. Check template coordinates and make sure the data file uses the same layout.')
        return
      }
      this.pending = await templateImport.prepare(read.codeValueMap, this.tableData, this.userId, {
        codeSheetMap: read.codeSheetMap || {},
        manufacturerBySheet: manufacturerBySheet || {}
      })
      if (!this.pending) {
        this.$message.info('No testing equipment data found in file'); return
      }
      if (this.pending.conflicts.length) {
        this.conflictRows = this.pending.conflicts.map(c => ({
          index: c.index, name: c.name, model: c.model, serial: c.serial,
          manufacturer: c.manufacturer, type: c.type, reason: c.reason
        }))
        this.conflictHandled = false
        this.conflictVisible = true
        return
      }
      await this.runImport([])
    },
    needsManufacturerBySheet(read) {
      if (!read || !read.codeSheetMap) return false
      const hasManufacturer = this.tableData.some(row => {
        const leaf = templateImport.getLeafValue(row.featureLevels, row.category)
        if (leaf !== 'manufacturer') return false
        const values = (read.codeValueMap && read.codeValueMap[row.code]) || []
        return values.some(v => v !== null && v !== undefined && String(v).trim() !== '')
      })
      return !hasManufacturer && this.buildManufacturerSheetRows(read).length > 0
    },
    buildManufacturerSheetRows(read) {
      const sheets = new Set()
      Object.values(read.codeSheetMap || {}).forEach(list => {
        ;(Array.isArray(list) ? list : [list]).forEach(sheet => {
          if (sheet) sheets.add(sheet)
        })
      })
      return Array.from(sheets).map(sheet => ({
        sheet,
        manufacturer: this.guessManufacturerFromSheet(sheet)
      }))
    },
    guessManufacturerFromSheet(sheet) {
      const text = String(sheet || '').toUpperCase()
      return this.manufacturerOptions.find(m => text.includes(String(m).toUpperCase())) || ''
    },
    async confirmManufacturerSheet() {
      if (!this.pendingRead) return
      const missing = this.manufacturerSheetRows.filter(row => !row.manufacturer)
      if (missing.length) {
        this.$message.warning('Please select a manufacturer for every sheet')
        return
      }
      const manufacturerBySheet = {}
      this.manufacturerSheetRows.forEach(row => { manufacturerBySheet[row.sheet] = row.manufacturer })
      const read = this.pendingRead
      this.pendingRead = null
      this.manufacturerSheetVisible = false
      this.working = true
      try {
        await this.prepareImport(read, manufacturerBySheet)
      } catch (e) {
        this.$message.error('Import error: ' + (e.message || e))
      } finally {
        this.working = false
      }
    },
    cancelManufacturerSheet() {
      this.pendingRead = null
      this.manufacturerSheetVisible = false
    },
    async runImport(overwrites) {
      const pending = this.pending
      this.pending = null
      if (!pending) return
      const total = pending.newcomers.length + overwrites.length
      if (!total) { this.$message.info('Nothing to import — kept all existing equipment'); return }
      const loading = this.$loading({ lock: true, text: 'Importing testing equipment...' })
      try {
        const { ok, fail } = await templateImport.run(pending.newcomers, overwrites)
        this.$message.success(
          `Imported ${ok} equipment` +
          (overwrites.length ? ` (${overwrites.length} overwritten)` : '') +
          (fail ? `, ${fail} failed` : '')
        )
        this.$emit('imported', { ok, fail })
      } catch (e) {
        this.$message.error('Import failed: ' + (e.message || e))
      } finally { loading.close() }
    },
    onConflictConfirm(choices) {
      if (this.conflictHandled) return   // chặn 'cancel' bắn kèm khi dialog đóng
      this.conflictHandled = true
      this.conflictVisible = false
      const pending = this.pending
      if (!pending) return
      const overwriteIdx = new Set(choices.filter(c => c.choice === 'overwrite').map(c => c.index))
      this.runImport(pending.conflicts.filter(c => overwriteIdx.has(c.index)))
    },
    onConflictCancel() {
      if (this.conflictHandled) return
      this.conflictHandled = true
      this.conflictVisible = false
      this.runImport([])
    },

    // ── Table helpers (giống Import/Export cũ, FEATURE_TREE scope TE) ──────
    clearAll() { this.tableData = [] },
    addRow(index) {
      // category mặc định luôn là Testing equipment (chỉ có 1 lựa chọn)
      const r = { code: '', category: 'TestingEquipmentDto', featureLevels: [{ key: '' }], coordinates: [] }
      if (typeof index === 'number') this.tableData.splice(index + 1, 0, r); else this.tableData.push(r)
    },
    removeRow(index) { this.tableData.splice(index, 1) },
    onCategoryChange(row) { row.featureLevels = [{}] },
    getNodeByLevel(row, levelIndex) {
      let node = FEATURE_TREE[row.category]; if (!node) return null
      for (let i = 0; i < levelIndex; i++) {
        const key = row.featureLevels[i] && row.featureLevels[i].key
        node = node && node.children && node.children[key]
        if (!node) return null
      }
      return node
    },
    getFeatureOptionsByLevel(row, levelIndex) {
      const node = this.getNodeByLevel(row, levelIndex)
      if (!node || !node.children) return []
      return Object.entries(node.children).map(([key, child]) => ({
        key, label: child.label, hasChildren: !!child.children, isLeaf: !!child.value
      }))
    },
    onFeatureLevelChange({ row, levelIndex }) {
      row.featureLevels.splice(levelIndex + 1)
      const key = row.featureLevels[levelIndex] && row.featureLevels[levelIndex].key
      const parent = this.getNodeByLevel(row, levelIndex)
      const selected = parent && parent.children && parent.children[key]
      if (selected && selected.children) row.featureLevels.push({ key: '' })
    }
  }
}
</script>

<style scoped>
.mfr-sheet-note {
  margin-bottom: 12px;
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
}
.mfr-sheet-table {
  width: 100%;
  border-collapse: collapse;
}
.mfr-sheet-table th,
.mfr-sheet-table td {
  border-bottom: 1px solid #ebeef5;
  padding: 10px 8px;
  text-align: left;
}
.mfr-sheet-table th {
  color: #303133;
  font-weight: 700;
  background: #f5f7fa;
}
</style>

<template>
  <el-dialog
    title="Import testing equipment by column mapping"
    :visible="visible"
    width="1180px"
    top="5vh"
    append-to-body
    custom-class="te-column-map-dialog"
    @open="onOpen"
    @update:visible="$emit('update:visible', $event)">
    <div class="cm-shell">
      <div class="cm-side">
        <div class="cm-section-title">Import file</div>
        <el-button type="primary" size="small" @click="pickFile">
          <i class="fa-solid fa-file-import"></i> Select Excel/CSV
        </el-button>
        <el-button size="small" class="cm-reload-file" :disabled="!filePath" :loading="working" @click="reloadFile">
          <i class="fa-solid fa-rotate-right"></i> Reload
        </el-button>
        <div v-if="fileName" class="cm-file-name">
          <i class="fa-solid fa-file-excel"></i>
          <span>{{ fileName }}</span>
        </div>

        <el-checkbox v-model="useFirstRowAsHeader" class="cm-check">Use first row as header</el-checkbox>

        <div class="cm-section-title format">Format</div>
        <div class="cm-format-grid">
          <label>
            <span>Delimiter</span>
            <el-select v-model="formatOptions.delimiter" size="small">
              <el-option label="Auto" value="auto" />
              <el-option label="Comma (,)" value="comma" />
              <el-option label="Semicolon (;)" value="semicolon" />
              <el-option label="Tab" value="tab" />
              <el-option label="Pipe (|)" value="pipe" />
            </el-select>
          </label>
          <label>
            <span>Text qualifier</span>
            <el-input v-model="formatOptions.textQualifier" size="small" maxlength="1" placeholder="&quot;" />
          </label>
          <label>
            <span>Date format</span>
            <el-input v-model="formatOptions.dateFormat" size="small" placeholder="dd/MM/yyyy" />
          </label>
          <label>
            <span>Datetime format</span>
            <el-input v-model="formatOptions.datetimeFormat" size="small" placeholder="dd/MM/yyyy HH:mm:ss" />
          </label>
          <label>
            <span>Thousands separator</span>
            <el-select v-model="formatOptions.thousandsSeparator" size="small">
              <el-option label="None" value="" />
              <el-option label="Comma (,)" value="," />
              <el-option label="Dot (.)" value="." />
              <el-option label="Space" value=" " />
            </el-select>
          </label>
          <label>
            <span>Decimal separator</span>
            <el-select v-model="formatOptions.decimalSeparator" size="small">
              <el-option label="Dot (.)" value="." />
              <el-option label="Comma (,)" value="," />
            </el-select>
          </label>
        </div>

        <div class="cm-section-title batch">Batch import</div>
        <div class="cm-batch-note">File will be imported in batches.</div>
        <div class="cm-batch-grid">
          <label>
            <span>Batch limit</span>
            <el-input-number
              v-model="batchOptions.limit"
              size="small"
              :min="1"
              :max="50000"
              :step="100"
              controls-position="right" />
          </label>
          <label>
            <span>Start at row</span>
            <el-input-number
              v-model="batchOptions.startRow"
              size="small"
              :min="1"
              :step="1"
              controls-position="right" />
          </label>
        </div>

        <div class="cm-label">Sheet</div>
        <el-select v-model="selectedSheetName" size="small" :disabled="!sheetOptions.length" style="width:100%;">
          <el-option v-for="sheet in sheetOptions" :key="sheet" :label="sheet" :value="sheet" />
        </el-select>

        <div class="cm-section-title preset">Mapping preset</div>
        <el-select v-model="selectedPresetName" size="small" clearable filterable placeholder="Select preset" style="width:100%;" @change="applyPreset">
          <el-option v-for="preset in presets" :key="preset.name" :label="preset.name" :value="preset.name" />
        </el-select>
        <el-button size="small" class="cm-save-preset" :disabled="!mappedCount" @click="savePreset">
          <i class="fa-solid fa-floppy-disk"></i> Save mapping
        </el-button>

        <div class="cm-hint">
          Default rule: each source row is one equipment. Rows with the same manufacturer, serial no. and type are merged before duplicate checking.
        </div>
      </div>

      <div class="cm-main">
        <div class="cm-actions">
          <div>
            <div class="cm-title">Column mapping</div>
            <div class="cm-subtitle">{{ sourceColumns.length }} columns, {{ dataRows.length }} of {{ allDataRows.length }} data rows</div>
          </div>
          <el-button type="warning" size="small" :disabled="!canImport" :loading="working" @click="handleImport">
            <i class="fa-solid fa-file-import"></i> Import
          </el-button>
        </div>

        <div v-if="!sourceColumns.length" class="cm-empty">
          Select an Excel/CSV file to preview columns and map them to testing equipment fields.
        </div>

        <div v-else class="cm-table-wrap">
          <table class="cm-table">
            <thead>
              <tr>
                <th class="cm-col-source">File column</th>
                <th class="cm-col-field">Testing equipment field</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="col in sourceColumns" :key="col.key">
                <td>
                  <div class="cm-source-name">{{ col.label }}</div>
                  <div class="cm-sample">{{ col.sample || 'No sample value' }}</div>
                </td>
                <td>
                  <el-select
                    v-model="mapping[col.key]"
                    size="small"
                    filterable
                    clearable
                    placeholder="Type to search and select a field..."
                    style="width:100%;">
                    <el-option-group v-for="group in fieldGroups" :key="group.label" :label="group.label">
                      <el-option v-for="field in group.options" :key="field.value" :label="field.label" :value="field.value" />
                    </el-option-group>
                  </el-select>
                </td>
                <td>
                  <span v-if="duplicateMappedFields[mapping[col.key]]" class="cm-warning">Mapped more than once</span>
                  <span v-else-if="mapping[col.key]" class="cm-ok">Ready</span>
                  <span v-else class="cm-muted">Skipped</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <import-conflict-dialog
      :visible.sync="conflictVisible"
      :conflicts="conflictRows"
      @confirm="onConflictConfirm"
      @cancel="onConflictCancel" />

    <ImportProgressDialog
      :visible="progressVisible"
      :current-name="progressName"
      :current-type="progressType"
      :done="progressDone"
      :total="progressTotal"
      unit-label="equipment" />
  </el-dialog>
</template>

<script>
/* eslint-disable */
import { FEATURE_TREE } from '@/views/Common/constants'
import templateImport, { TE_CAT_KEY } from '../services/templateImport'
import { prepareColumnMappingImport } from '../services/columnMappingImport'
import ImportConflictDialog from './importConflictDialog.vue'
import ImportProgressDialog from '@/views/TreeNode/dialogs/ImportProgressDialog.vue'

const STORE_TYPE = 'column-mapping'
const STORE_CATEGORY = 'te-column-import'

const colName = (index) => {
  let n = index + 1
  let s = ''
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

const flattenFields = () => {
  const root = FEATURE_TREE[TE_CAT_KEY]
  const groups = []
  Object.keys(root.children || {}).forEach(groupKey => {
    if (groupKey === 'UsageDto') return
    const group = root.children[groupKey]
    const options = []
    Object.keys(group.children || {}).forEach(fieldKey => {
      const field = group.children[fieldKey]
      options.push({
        value: field.value,
        label: `${group.label} / ${field.label}`,
        featureLevels: [groupKey, fieldKey],
        group: group.label
      })
    })
    groups.push({ label: group.label, options })
  })
  return groups
}

export default {
  name: 'TeColumnMappingImport',
  components: { ImportConflictDialog, ImportProgressDialog },
  props: {
    visible: { type: Boolean, default: false }
  },
  data() {
    return {
      fileName: '',
      fileData: null,
      selectedSheetName: '',
      useFirstRowAsHeader: true,
      formatOptions: {
        delimiter: 'auto',
        textQualifier: '"',
        dateFormat: '',
        datetimeFormat: '',
        thousandsSeparator: ',',
        decimalSeparator: '.'
      },
      batchOptions: {
        limit: 4000,
        startRow: 1
      },
      mapping: {},
      presets: [],
      selectedPresetName: '',
      working: false,
      pending: null,
      conflictVisible: false,
      conflictRows: [],
      progressVisible: false,
      progressDone: 0,
      progressTotal: 0,
      progressName: '',
      progressType: 'testingEquipment',
      fieldGroups: flattenFields()
    }
  },
  computed: {
    flatFields() {
      return this.fieldGroups.flatMap(group => group.options)
    },
    fieldByValue() {
      return this.flatFields.reduce((acc, field) => {
        acc[field.value] = field
        return acc
      }, {})
    },
    sheetOptions() {
      return this.fileData && Array.isArray(this.fileData.sheets) ? this.fileData.sheets.map(s => s.name) : []
    },
    selectedSheet() {
      return this.fileData && Array.isArray(this.fileData.sheets)
        ? this.fileData.sheets.find(s => s.name === this.selectedSheetName)
        : null
    },
    filePath() {
      return this.fileData && this.fileData.filePath ? this.fileData.filePath : ''
    },
    rawRows() {
      return this.selectedSheet && Array.isArray(this.selectedSheet.rows) ? this.selectedSheet.rows : []
    },
    headerRow() {
      return this.useFirstRowAsHeader ? (this.rawRows[0] || []) : []
    },
    allDataRows() {
      const rows = this.useFirstRowAsHeader ? this.rawRows.slice(1) : this.rawRows
      return rows.filter(row => (row || []).some(value => String(value == null ? '' : value).trim() !== ''))
    },
    dataRows() {
      const start = Math.max(0, Number(this.batchOptions.startRow || 1) - 1)
      const limit = Math.max(1, Number(this.batchOptions.limit || this.allDataRows.length || 1))
      return this.allDataRows.slice(start, start + limit)
    },
    sourceColumns() {
      const maxCol = this.rawRows.reduce((max, row) => Math.max(max, (row || []).length), 0)
      return Array.from({ length: maxCol }, (_, index) => {
        const header = String(this.headerRow[index] || '').trim()
        const sampleRow = this.dataRows.find(row => String(row[index] == null ? '' : row[index]).trim() !== '')
        return {
          key: `col_${index}`,
          index,
          header,
          label: header || `Column ${colName(index)}`,
          sample: sampleRow ? sampleRow[index] : ''
        }
      })
    },
    mappedCount() {
      return Object.keys(this.mapping).filter(key => this.mapping[key]).length
    },
    duplicateMappedFields() {
      const counts = {}
      Object.keys(this.mapping).forEach(key => {
        const field = this.mapping[key]
        if (field) counts[field] = (counts[field] || 0) + 1
      })
      return Object.keys(counts).reduce((acc, key) => {
        if (counts[key] > 1) acc[key] = true
        return acc
      }, {})
    },
    canImport() {
      return !!this.sourceColumns.length && !!this.dataRows.length && Object.values(this.mapping).includes('serial_no')
    },
    userId() {
      const user = this.$store && this.$store.getters.getUser
      return (user && user.user_id) || null
    }
  },
  watch: {
    selectedSheetName() {
      this.applyPreset(this.selectedPresetName)
    },
    useFirstRowAsHeader() {
      this.applyPreset(this.selectedPresetName)
    }
  },
  methods: {
    async onOpen() {
      await this.loadPresets()
    },
    async loadPresets() {
      const rs = await window.electronAPI.getAllTemplatesByType(STORE_TYPE, STORE_CATEGORY)
      this.presets = rs && rs.success ? rs.data.map(row => {
        let variable = {}
        try { variable = row.variable ? JSON.parse(row.variable) : {} } catch (e) { variable = {} }
        return { ...row, variable }
      }) : []
    },
    fileReadOptions() {
      return {
        delimiter: this.formatOptions.delimiter || 'auto',
        textQualifier: this.formatOptions.textQualifier == null ? '"' : this.formatOptions.textQualifier,
        dateFormat: this.formatOptions.dateFormat || '',
        datetimeFormat: this.formatOptions.datetimeFormat || '',
        thousandsSeparator: this.formatOptions.thousandsSeparator == null ? ',' : this.formatOptions.thousandsSeparator,
        decimalSeparator: this.formatOptions.decimalSeparator || '.'
      }
    },
    setFileData(rs, keepMapping = false) {
      this.fileData = rs
      this.fileName = rs.fileName || ''
      this.selectedSheetName = (rs.sheets && rs.sheets[0] && rs.sheets[0].name) || ''
      if (!keepMapping) this.mapping = {}
      if (!keepMapping) this.applyAutoMapping()
      else this.applyPreset(this.selectedPresetName)
    },
    async pickFile() {
      const rs = await window.electronAPI.pickTestingEquipmentColumnImportFile(this.fileReadOptions())
      if (!rs || rs.canceled) return
      if (!rs.success) return this.$message.error(rs.message || 'Failed to read file')
      this.setFileData(rs)
    },
    async reloadFile() {
      if (!this.filePath) return
      const currentSheet = this.selectedSheetName
      const rs = await window.electronAPI.readTestingEquipmentColumnImportFile({
        filePath: this.filePath,
        options: this.fileReadOptions()
      })
      if (!rs || !rs.success) return this.$message.error((rs && rs.message) || 'Failed to reload file')
      this.fileData = rs
      this.fileName = rs.fileName || ''
      this.selectedSheetName = rs.sheets && rs.sheets.some(sheet => sheet.name === currentSheet)
        ? currentSheet
        : ((rs.sheets && rs.sheets[0] && rs.sheets[0].name) || '')
      this.applyPreset(this.selectedPresetName)
    },
    normalizeLabel(value) {
      return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
    },
    applyAutoMapping() {
      const aliases = {
        equipmentname: 'name',
        name: 'name',
        type: 'type',
        equipmenttype: 'type',
        serial: 'serial_no',
        serialno: 'serial_no',
        serialnumber: 'serial_no',
        manufacturer: 'manufacturer',
        model: 'model',
        status: 'status',
        repair: 'rep_reason',
        repairhistory: 'rep_reason',
        reason: 'rep_reason',
        option: 'lic_option_name',
        optionname: 'lic_option_name',
        softwarelicense: 'lic_option_name',
        calibrationdate: 'cal_calibration_date',
        duedate: 'cal_due_date'
      }
      const next = {}
      this.sourceColumns.forEach(col => {
        const key = this.normalizeLabel(col.header || col.label)
        if (aliases[key]) next[col.key] = aliases[key]
      })
      this.mapping = next
    },
    applyPreset(name) {
      if (!name) return
      const preset = this.presets.find(p => p.name === name)
      const config = preset && preset.variable ? preset.variable : null
      if (!config || !Array.isArray(config.mappings)) return
      this.useFirstRowAsHeader = config.useFirstRowAsHeader !== false
      if (config.formatOptions) this.formatOptions = { ...this.formatOptions, ...config.formatOptions }
      if (config.batchOptions) this.batchOptions = { ...this.batchOptions, ...config.batchOptions }
      const next = {}
      config.mappings.forEach(item => {
        let col = null
        if (item.header) col = this.sourceColumns.find(c => this.normalizeLabel(c.header) === this.normalizeLabel(item.header))
        if (!col && item.index != null) col = this.sourceColumns.find(c => c.index === item.index)
        if (col && this.fieldByValue[item.field]) next[col.key] = item.field
      })
      this.mapping = next
    },
    async savePreset() {
      try {
        const name = await this.$prompt('Enter mapping preset name', 'Save mapping', {
          confirmButtonText: 'Save',
          cancelButtonText: 'Cancel',
          inputValue: this.selectedPresetName || (this.fileName ? this.fileName.replace(/\.[^.]+$/, '') : '')
        })
        const presetName = name && name.value ? name.value.trim() : ''
        if (!presetName) return
        const variable = {
          useFirstRowAsHeader: this.useFirstRowAsHeader,
          formatOptions: this.fileReadOptions(),
          batchOptions: { ...this.batchOptions },
          mappings: this.sourceColumns
            .filter(col => this.mapping[col.key])
            .map(col => ({ index: col.index, header: col.header, field: this.mapping[col.key] }))
        }
        const existing = this.presets.find(p => p.name === presetName)
        const payload = { name: presetName, path: '', variable: JSON.stringify(variable), type: STORE_TYPE, category: STORE_CATEGORY }
        const rs = existing ? await window.electronAPI.updateTemplate(payload) : await window.electronAPI.insertTemplate(payload)
        if (rs && rs.success) {
          this.$message.success('Mapping preset saved')
          this.selectedPresetName = presetName
          await this.loadPresets()
        } else {
          this.$message.error('Save mapping failed')
        }
      } catch (e) {
        if (e !== 'cancel') console.error(e)
      }
    },
    selectedMappings() {
      return this.sourceColumns
        .filter(col => this.mapping[col.key] && this.fieldByValue[this.mapping[col.key]])
        .map(col => ({
          key: col.key,
          index: col.index,
          field: this.fieldByValue[this.mapping[col.key]]
        }))
    },
    equipmentProgressName(entity) {
      const asset = entity && entity.asset ? entity.asset : {}
      const pam = entity && entity.productAssetModel ? entity.productAssetModel : {}
      return asset.name || pam.model_number || asset.serial_number || 'Testing equipment'
    },
    startProgress(total) {
      this.progressVisible = true
      this.progressDone = 0
      this.progressTotal = total
      this.progressName = 'Preparing...'
      this.progressType = 'testingEquipment'
    },
    stopProgress() {
      this.progressVisible = false
    },
    async handleImport() {
      if (!this.canImport) {
        this.$message.warning('Map at least Serial no. before importing')
        return
      }
      this.working = true
      try {
        const pending = await prepareColumnMappingImport({
          rows: this.dataRows,
          mappings: this.selectedMappings(),
          sheetName: this.selectedSheetName,
          userId: this.userId,
          formatOptions: this.fileReadOptions()
        })
        if (!pending || !pending.entities.length) {
          this.$message.info('No valid testing equipment rows found')
          return
        }
        this.pending = pending
        if (pending.conflicts.length) {
          this.conflictRows = pending.conflicts.map(c => ({
            index: c.index,
            name: c.name,
            model: c.model,
            serial: c.serial,
            manufacturer: c.manufacturer,
            type: c.type,
            reason: c.reason
          }))
          this.conflictVisible = true
          return
        }
        await this.runImport(pending.newcomers, [])
      } catch (e) {
        console.error('Column mapping import failed:', e)
        this.$message.error('Import failed: ' + (e.message || e))
      } finally {
        this.working = false
      }
    },
    async onConflictConfirm(choices) {
      this.conflictVisible = false
      const pending = this.pending
      this.pending = null
      if (!pending) return
      const overwriteIdx = new Set(choices.filter(c => c.choice === 'overwrite').map(c => c.index))
      const overwrites = pending.conflicts.filter(c => overwriteIdx.has(c.index))
      await this.runImport(pending.newcomers, overwrites)
    },
    async onConflictCancel() {
      this.conflictVisible = false
      const pending = this.pending
      this.pending = null
      if (!pending) return
      await this.runImport(pending.newcomers, [])
    },
    async runImport(newcomers, overwrites) {
      const total = newcomers.length + overwrites.length
      if (!total) {
        this.$message.info('Nothing to import')
        return
      }
      this.startProgress(total)
      try {
        const rs = await templateImport.run(newcomers, overwrites, {
          onProgress: (entity) => {
            this.progressDone = Math.min(this.progressTotal, this.progressDone + 1)
            this.progressName = this.equipmentProgressName(entity)
          }
        })
        this.$message.success(`Imported ${rs.ok} equipment` + (rs.fail ? `, ${rs.fail} failed` : ''))
        this.$emit('imported')
        this.$emit('update:visible', false)
      } finally {
        this.stopProgress()
      }
    }
  }
}
</script>

<style scoped>
.cm-shell {
  display: grid;
  grid-template-columns: 270px 1fr;
  gap: 16px;
  min-height: 560px;
}
.cm-side {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px;
  background: #f8fafc;
}
.cm-main {
  min-width: 0;
}
.cm-section-title {
  font-size: 13px;
  font-weight: 800;
  color: #303842;
  margin-bottom: 10px;
}
.cm-section-title.preset { margin-top: 18px; }
.cm-section-title.format,
.cm-section-title.batch { margin-top: 14px; }
.cm-reload-file {
  margin-left: 6px;
}
.cm-file-name {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #4b5563;
  font-size: 12px;
  word-break: break-all;
}
.cm-check { margin: 14px 0; display: block; }
.cm-format-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 14px;
}
.cm-format-grid label {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
}
.cm-format-grid span {
  color: #606a76;
  font-size: 12px;
  font-weight: 700;
}
.cm-batch-note {
  color: #7b8491;
  font-size: 12px;
  margin: -4px 0 8px;
}
.cm-batch-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
}
.cm-batch-grid label {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  min-width: 0;
}
.cm-batch-grid span {
  color: #606a76;
  font-size: 12px;
  font-weight: 700;
}
.cm-batch-grid /deep/ .el-input-number,
.cm-batch-grid /deep/ .el-input {
  width: 100%;
}
.cm-label {
  color: #606a76;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}
.cm-save-preset {
  width: 100%;
  margin-top: 8px;
}
.cm-hint {
  margin-top: 16px;
  padding: 10px;
  border-radius: 6px;
  background: #eef4ff;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.45;
}
.cm-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.cm-title {
  color: #1f2933;
  font-size: 18px;
  font-weight: 700;
}
.cm-subtitle {
  color: #7b8491;
  font-size: 12px;
  margin-top: 3px;
}
.cm-empty {
  height: 360px;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 13px;
}
.cm-table-wrap {
  max-height: 590px;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.cm-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.cm-table th {
  position: sticky;
  top: 0;
  background: #f3f6fb;
  color: #303842;
  font-size: 13px;
  font-weight: 800;
  text-align: left;
  padding: 11px 12px;
  border-bottom: 1px solid #e5e7eb;
  z-index: 1;
}
.cm-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #edf1f7;
  vertical-align: middle;
}
.cm-col-source { width: 32%; }
.cm-col-field { width: 36%; }
.cm-source-name {
  color: #303842;
  font-size: 13px;
  font-weight: 700;
}
.cm-sample {
  margin-top: 3px;
  color: #7b8491;
  font-size: 12px;
  font-style: italic;
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cm-muted { color: #9ca3af; font-size: 12px; }
.cm-ok { color: #15803d; font-size: 12px; font-weight: 700; }
.cm-warning { color: #b45309; font-size: 12px; font-weight: 700; }
</style>

<template>
<div>
  <template-manager 
    :template-list="templateList" 
    v-model="selectedTemplateName" 
    @change="onTemplateChange" 
    @add-template="openAddTemplateDialog" 
    @refresh="loadTemplates"
  >
    <template #actions>
      <el-button type="primary"  size="mini" :disabled="!selectedTemplateName" @click="addRow()">Add Row</el-button>
      <el-button v-if="exportType === 'excel'" type="success"  size="mini" :disabled="!selectedTemplateName" @click="handleUploadExcel">Excel File</el-button>
      <el-button v-if="exportType === 'word'" type="success"  size="mini" :disabled="!selectedTemplateName" @click="handleUploadWord">Word File</el-button>
      <el-button type="danger"   size="mini" :disabled="!selectedTemplateName" @click="handleDelete">Delete</el-button>
      <el-button type="warning"  size="mini" :disabled="!selectedTemplateName" @click="handleSave">Save</el-button>
      <el-button type="info"     size="mini" :disabled="!selectedTemplateName" @click="handleImportJson">Import JSON</el-button>
      <el-button type="info"     size="mini" :disabled="!selectedTemplateName || !tableData.length" @click="handleExportJson">Export JSON</el-button>
      <el-button v-if="exportType === 'excel'" type="primary"  size="mini" :disabled="!selectedTemplateName || !currentFilePath" @click="handleExport(exportType)">Export Excel</el-button>
      <el-button v-if="exportType === 'word'" type="primary"  size="mini" :disabled="!selectedTemplateName || !currentFilePath" @click="handleExport(exportType)">Export Word</el-button>
    </template>
  </template-manager>

  <div v-if="currentFilePath" style="margin:4px 0 8px;font-size:12px;color:#909399;">
    <span @click="openTemplateFile" title="Click to open file"
      style="cursor:pointer;display:inline-flex;align-items:center;gap:5px;"
      onmouseover="this.style.color='#409EFF'" onmouseout="this.style.color='#909399'">
      <i :class="exportType==='word' ? 'fa-solid fa-file-word' : 'fa-solid fa-file-excel'"
        :style="{color: exportType==='word' ? '#2B579A' : '#67C23A'}"></i>
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

  <el-dialog title="Add new template" :visible.sync="showAddDialog" width="420px" append-to-body @close="resetAddDialog">
    <el-form ref="addForm" :model="addForm" :rules="addRules" size="small" label-width="120px" label-position="left">
      <el-form-item label="Template name" prop="name"><el-input v-model="addForm.name" placeholder="e.g. EVN Report" clearable /></el-form-item>
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

  <el-dialog title="Select data to export" :visible.sync="showExportDialog" width="520px" append-to-body>
    <div v-if="exportCategories.length === 0" style="color:#909399;padding:20px 0;">No categories in template rows.</div>
    <div v-else>
      <div style="margin-bottom:10px;display:flex;align-items:center;gap:8px;">
        <el-button size="small" type="primary" plain icon="el-icon-plus" @click="nodePickerVisible = true">
          Add asset / job
        </el-button>
        <span style="font-size:11px;color:#909399;">Each item can be used as data source for different codes in the template</span>
      </div>

      <div v-if="selectedItems.length > 0">
        <div
          v-for="(item, idx) in selectedItems"
          :key="item.id"
          style="display:flex;align-items:center;gap:6px;padding:5px 8px;margin-bottom:4px;background:#f5f7fa;border-radius:4px;border:1px solid #EBEEF5;"
        >
          <span style="font-size:11px;color:#fff;background:#409EFF;border-radius:3px;padding:1px 6px;min-width:54px;text-align:center;">
            Sheet {{ idx + 1 }}
          </span>
          <i :class="itemIcon(item)" style="font-size:12px;color:#606266;"></i>
          <span style="font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" :title="item.label">
            {{ item.label }}
          </span>
          <el-input
            v-model="item.sheetName"
            size="mini"
            placeholder="Sheet name"
            style="width:120px;"
            :maxlength="31"
          />
          <el-button size="mini" type="danger" plain icon="el-icon-delete" circle @click="removeSelectedItem(item.id)" />
        </div>
      </div>
      <div v-else style="font-size:11px;color:#E6A23C;padding:6px 10px;background:#fdf6ec;border-radius:4px;">
        <i class="el-icon-warning-outline"></i> No selection yet — click "Add asset / job" to begin
      </div>

      <div v-if="selectedItems.length > 0" style="margin-top:8px;font-size:11px;color:#909399;">
        {{ selectedItems.length }} source{{ selectedItems.length > 1 ? 's' : '' }} selected.
        Each template row can pull data from a different source.
      </div>
    </div>
    <div slot="footer">
      <el-button size="small" @click="showExportDialog = false">Cancel</el-button>
      <el-button size="small" type="primary" :loading="exportLoading" @click="doExport">Export</el-button>
    </div>
  </el-dialog>

  <el-dialog title="Select Node" :visible.sync="nodePickerVisible" width="540px" :append-to-body="true">
    <div style="margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:12px;color:#909399;">
        Navigate the tree: Organisation → Substation → VoltageLevel → Bay → Asset → Job
      </span>
      <el-button size="mini" icon="el-icon-refresh" @click="refreshPickerTree" style="padding:4px 8px;">Refresh</el-button>
    </div>
    <el-tree
      :key="pickerTreeKey"
      ref="pickerTree"
      :props="{ label: 'displayName', children: 'children', isLeaf: 'pickerIsLeaf' }"
      :load="loadPickerNode"
      lazy
      node-key="mrid"
      highlight-current
      style="max-height:380px;overflow-y:auto;border:1px solid #EBEEF5;border-radius:4px;padding:4px;"
      @node-click="onPickerNodeClick"
    >
      <span slot-scope="{ data }" style="display:flex;align-items:center;gap:6px;font-size:12px;">
        <i :class="pickerNodeIcon(data)" style="font-size:11px;width:14px;text-align:center;"></i>
        <span :style="{ fontWeight: data.mode === 'asset' || data.mode === 'job' ? '600' : 'normal' }">
          {{ data.displayName }}
        </span>
        <el-tag v-if="data.mode === 'asset'" size="mini" type="info" style="font-size:10px;">{{ data.assetType }}</el-tag>
      </span>
    </el-tree>
    <div v-if="pickerTempSelected" style="margin-top:8px;padding:6px 10px;background:#f0f9eb;border-radius:4px;font-size:12px;">
      <i class="el-icon-check" style="color:#67C23A;"></i>
      <strong>{{ pickerTempSelected.displayName }}</strong>
      <span style="color:#909399;margin-left:4px;">({{ pickerModeLabel(pickerTempSelected.mode) }})</span>
    </div>
    <span slot="footer" style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:11px;color:#909399;">
        {{ selectedItems.length }} item{{ selectedItems.length !== 1 ? 's' : '' }} in list
      </span>
      <span>
        <el-button size="small" @click="nodePickerVisible = false">Done</el-button>
        <el-button size="small" type="primary" icon="el-icon-plus"
          :disabled="!pickerTempSelected"
          @click="addPickerSelectionToList">
          Add to list
        </el-button>
      </span>
    </span>
  </el-dialog>

</div>
</template>

<script>
/* eslint-disable */
import { ASSET_TYPE_TO_KEY, CATEGORY_OPTION, FEATURE_TREE } from '../Common/constants'
import { exportService } from './services/exportService.js'
import TemplateManager from './components/TemplateManager.vue'
import DataTable from './components/DataTable.vue'

export default {
  name: 'ExportView',
  props: {
    exportType: {
      type: String,
      default: 'excel'
    },
  },
  watch: {
    'exportType' : {
      immediate: true,
      handler: async function (newVal) {
        this.clearAllDialog()
        await this.loadTemplates()
      }
    }
  },
  components: { TemplateManager, DataTable },
  data() {
    return {
      templateList: [], selectedTemplateName: '', currentFilePath: '', tableData: [],
      showAddDialog: false, addLoading: false,
      addForm: { name: '', filePath: '' },
      addRules: { name: [{ required: true, message: 'Please enter template name', trigger: 'blur' }] },
      showExportDialog: false, exportLoading: false,
      nodePickerVisible: false,
      pickerTempSelected: null,
      pickerTreeKey: 0,        
      selectedItems: [],          
      // Import trực tiếp, không dùng JSON.parse để tránh lỗi undefined và tối ưu RAM
      categoryOptions: CATEGORY_OPTION,
      FEATURE_TREE: FEATURE_TREE,
      assetTypeToKey: ASSET_TYPE_TO_KEY
    }
  },
  computed: {
    exportCategories() {
      const seen = new Set(), result = []
      for (const row of this.tableData) {
        if (!row.category) continue
        if (row.category === 'Asset') {
          const assetType = row.featureLevels && row.featureLevels[0] ? row.featureLevels[0].key : null
          if (!assetType) continue
          const key = 'Asset_' + assetType
          if (seen.has(key)) continue
          seen.add(key)
          const node = this.FEATURE_TREE.Asset && this.FEATURE_TREE.Asset.children ? this.FEATURE_TREE.Asset.children[assetType] : null
          result.push({ key, label: (node && node.label) || assetType, category: 'Asset', assetType })
        } else if (row.category === 'Job') {
          const jobType = row.featureLevels && row.featureLevels[0] ? row.featureLevels[0].key : null
          if (!jobType) continue
          const key = 'Job_' + jobType
          if (seen.has(key)) continue
          seen.add(key)
          const node = this.FEATURE_TREE.Job && this.FEATURE_TREE.Job.children ? this.FEATURE_TREE.Job.children[jobType] : null
          result.push({ key, label: (node && node.label) || jobType, category: 'Job', assetType: jobType })
        } else {
          if (seen.has(row.category)) continue
          seen.add(row.category)
          const opt = this.categoryOptions.find(function(c) { return c.value === row.category })
          result.push({ key: row.category, label: (opt && opt.label) || row.category, category: row.category, assetType: null })
        }
      }
      return result
    }
  },
  async mounted() { await this.loadTemplates() },
  methods: {
    async loadTemplates() {
      try {
        const rs = await window.electronAPI.getAllTemplatesByType(this.exportType, 'export')
        if (rs?.success) this.templateList = rs.data.map(t => ({ ...t, variable: t.variable ? JSON.parse(t.variable) : [] }))
      } catch(e) { console.error(e) }
    },
    onTemplateChange(name) {
      if (!name) { this.currentFilePath = ''; this.tableData = []; return }
      const tmpl = this.templateList.find(t => t.name === name)
      if (!tmpl) return
      this.currentFilePath = tmpl.path || ''
      this.tableData = (tmpl.variable || []).map(v => ({ code: v.code||'', category: v.category||'', featureLevels: (v.featureLevels||[]).map(f => ({ key: f.key||'' })), coordinates: v.coordinates||[] }))
    },
    openAddTemplateDialog() { this.resetAddDialog(); this.showAddDialog = true },
    resetAddDialog() { this.addForm = { name: '', filePath: '' }; this.addLoading = false },
    async uploadTemplateForNew() {
      if (!this.addForm.name) { this.$message.warning('Please enter template name first'); return }
      try {
        let rs = {
          success: false,
          filePath: ''
        }
        if(this.exportType === 'excel') {
          rs = await window.electronAPI.uploadExcelTemplate(this.addForm.name)
        } else if(this.exportType === 'word') {
          rs = await window.electronAPI.uploadWordTemplate(this.addForm.name)
        }
        if (rs?.success) { this.addForm.filePath = rs.filePath; this.$message.success('Uploaded') }
        else if (!rs.canceled) this.$message.error('Upload failed')
      } catch(e) { this.$message.error(e.message) }
    },
    async confirmAddTemplate() {
      this.$refs.addForm.validate(async (valid) => {
        if (!valid) return
        this.addLoading = true
        try {
          const exists = await window.electronAPI.checkNameTemplateExist(this.addForm.name)
          if (exists?.data === true) { this.$message.error(`Template "${this.addForm.name}" already exists`); return }
          const rs = await window.electronAPI.insertTemplate({ name: this.addForm.name, path: this.addForm.filePath||'', variable: JSON.stringify([]), type: this.exportType || '' , category: 'export'})
          if (rs?.success) {
            this.$message.success(`Created "${this.addForm.name}"`); this.showAddDialog = false
            await this.loadTemplates(); this.selectedTemplateName = this.addForm.name; this.currentFilePath = this.addForm.filePath||''; this.tableData = []
          } else this.$message.error('Create failed')
        } catch(e) { this.$message.error(e.message) } finally { this.addLoading = false }
      })
    },
    async handleUploadExcel() {
      if (!this.selectedTemplateName) return
      try {
        const rs = await window.electronAPI.uploadExcelTemplate(this.selectedTemplateName)
        if (!rs || rs.canceled) return
        if (rs.success) { this.currentFilePath = rs.filePath; await this.saveWithScan() }
      } catch(e) { this.$message.error(e.message) }
    },
    async handleUploadWord() {
      if (!this.selectedTemplateName) return
      try {
        const rs = await window.electronAPI.uploadWordTemplate(this.selectedTemplateName)
        if (!rs || rs.canceled) return
        if (rs.success) { this.currentFilePath = rs.filePath; await this.saveWithScan() }
      } catch(e) { this.$message.error(e.message) }
    },
    async handleSave() { await this.saveWithScan() },
    async saveWithScan() {
      if (!this.selectedTemplateName || !this.currentFilePath) { this.$message.warning('Please upload an Template file first'); return }
      const variables = this.tableData.map(r => ({ code: r.code, category: r.category, featureLevels: r.featureLevels, coordinates: r.coordinates||[] }))
      try {
        const rs = await window.electronAPI.saveTemplateWithScan({ name: this.selectedTemplateName, filePath: this.currentFilePath, variables, type: this.exportType, category: 'export'})
        if (rs?.success) { this.$message.success('Saved'); await this.loadTemplates(); this.onTemplateChange(this.selectedTemplateName) }
        else this.$message.error('Save failed')
      } catch(e) { this.$message.error(e.message) }
    },
    async handleDelete() {
      try { await this.$confirm(`Delete template "${this.selectedTemplateName}"?`, 'Warning', { type: 'warning', confirmButtonText: 'Delete', cancelButtonText: 'Cancel' }) } catch { return }
      try {
        const rs = await window.electronAPI.deleteTemplate(this.selectedTemplateName)
        if (rs?.success) { this.$message.success('Deleted'); this.selectedTemplateName=''; this.currentFilePath=''; this.tableData=[]; await this.loadTemplates() }
      } catch(e) { this.$message.error(e.message) }
    },
    async handleImportJson() {
      try {
        const rs = await window.electronAPI.importJSON()
        if (!rs?.success || !rs.data) return
        const variables = Array.isArray(rs.data) ? rs.data[0] : rs.data
        if (!Array.isArray(variables)) { this.$message.error('Invalid template config file'); return }
        this.tableData = variables.map(v => ({ code: v.code||'', category: v.category||'', featureLevels: (v.featureLevels||[]).map(f => ({ key: f.key||'' })), coordinates: v.coordinates||[] }))
        this.$message.success('Imported')
      } catch(e) { this.$message.error(e.message) }
    },

    async handleExportJson() {
      try {
        const variables = this.tableData.map(v => ({
          code: v.code||'', category: v.category||'',
          featureLevels: (v.featureLevels||[]).map(f => ({ key: f.key||'' })),
          coordinates: v.coordinates||[]
        }))
        const defaultFileName = (this.selectedTemplateName || 'template') + '-config.json'
        const rs = await window.electronAPI.exportJSON([variables], { defaultFileName, title: 'Save template config as JSON' })
        if (rs?.success) this.$message.success('Exported: ' + rs.filePath)
        else if (rs?.message !== 'Export cancelled') this.$message.error(rs?.message || 'Export failed')
      } catch(e) { this.$message.error(e.message) }
    },

    openTemplateFile() {
      if (!this.currentFilePath) return
      window.electronAPI.openFileTemplate(this.currentFilePath).then(err => {
        if (err) this.$message.error('Cannot open file: ' + err)
      })
    },
    handleExport() {
      this.selectedNode = null; this.selectedNodeLabel = ''; this.selectedNodeContext = {}; this.pickerTempSelected = null
      this.showExportDialog = true
    },
    pickerModeLabel(mode) {
      const m = { organisation:'Organisation', substation:'Substation', voltageLevel:'Voltage Level', bay:'Bay', asset:'Asset', job:'Job' }
      return m[mode] || mode
    },
    pickerNodeIcon(data) {
      const icons = { organisation:'el-icon-office-building', substation:'el-icon-location', voltageLevel:'el-icon-connection', bay:'el-icon-set-up', asset:'el-icon-box', job:'el-icon-document' }
      return icons[data.mode] || 'el-icon-folder'
    },
    buildContextFromNode(node) {
      const ctx = {}
      ;(node.parentArr || []).forEach(p => {
        if (p.mode) ctx[p.mode] = { mrid: p.mrid, name: p.name, ...(p.assetType && { assetType: p.assetType }) }
      })
      ctx[node.mode] = {
        mrid: node.mrid,
        name: node.displayName,
        ...(node.assetType && { assetType: node.assetType })
      }
      return ctx
    },
    sanitizeSheetName(name) { return (name || 'Sheet').replace(/[\[\]\*\?:\/\\]/g, '_').substring(0, 31) },
    uniqueSheetName(base) {
      const existing = this.selectedItems.map(i => i.sheetName)
      let name = this.sanitizeSheetName(base)
      let counter = 2
      while (existing.includes(name)) { name = this.sanitizeSheetName(base + '_' + counter); counter++ }
      return name
    },
    itemIcon(item) {
      const ctx = item.context
      if (ctx.job)   return 'el-icon-document'
      if (ctx.asset) return 'el-icon-box'
      if (ctx.bay)   return 'el-icon-set-up'
      return 'el-icon-office-building'
    },
    refreshPickerTree() {
      this.pickerTempSelected = null
      this.pickerTreeKey++   
    },
    addPickerSelectionToList() {
      if (!this.pickerTempSelected) return
      const node = this.pickerTempSelected
      const pathParts = [...(node.parentArr || []).map(p => p.name), node.displayName]
      const label = pathParts.join(' / ')
      const ctx = this.buildContextFromNode(node)
      const isDup = this.selectedItems.some(item =>
        item.context.asset?.mrid === ctx.asset?.mrid &&
        item.context.job?.mrid === ctx.job?.mrid &&
        item.context.asset?.mrid !== undefined
      )
      if (isDup) { this.$message.warning('This node is already in the list'); return }
      const baseName = node.displayName || pathParts[pathParts.length - 1] || 'Sheet'
      const sheetName = this.uniqueSheetName(baseName)
      this.selectedItems.push({
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        label,
        sheetName,
        context: ctx
      })
      this.pickerTempSelected = null
      this.$message.success('Added: ' + label.split(' / ').pop())
    },
    removeSelectedItem(id) {
      this.selectedItems = this.selectedItems.filter(item => item.id !== id)
    },
    async loadPickerNode(node, resolve) {
      const ROOT = '00000000-0000-0000-0000-000000000000'
      try {
        if (node.level === 0) {
          const rs = await window.electronAPI.getParentOrganizationByMrid(ROOT)
          if (rs?.success && rs.data) {
            const root = rs.data
            resolve([{ mrid: root.mrid, displayName: root.aliasName || root.name, mode: 'organisation', pickerIsLeaf: false, parentArr: [] }])
          } else resolve([])
          return
        }
        const data = node.data
        const nextParentArr = [...(data.parentArr || []), { mrid: data.mrid, name: data.displayName, mode: data.mode }]
        const rows = []
        if (data.mode === 'organisation') {
          const [childOrgs, subs] = await Promise.all([
            window.electronAPI.getParentOrganizationByParentMrid(data.mrid),
            window.electronAPI.getSubstationsInOrganisationForUser(data.mrid, this.$store?.state?.user?.user_id || null)
          ])
          ;(childOrgs?.data || []).forEach(o => rows.push({ mrid: o.mrid, displayName: o.aliasName || o.name, mode: 'organisation', pickerIsLeaf: false, parentArr: nextParentArr }))
          ;(subs?.data || []).forEach(s => rows.push({ mrid: s.mrid, displayName: s.name, mode: 'substation', pickerIsLeaf: false, parentArr: nextParentArr }))
        } else if (data.mode === 'substation') {
          const [vls, bays] = await Promise.all([
            window.electronAPI.getVoltageLevelBySubstationId(data.mrid),
            window.electronAPI.getBayByVoltageBySubstationId(null, data.mrid)
          ])
          ;(vls?.data || []).forEach(vl => rows.push({ mrid: vl.mrid, displayName: vl.name, mode: 'voltageLevel', pickerIsLeaf: false, parentArr: nextParentArr }))
          ;(bays?.data || []).forEach(b => rows.push({ mrid: b.mrid, displayName: b.name, mode: 'bay', pickerIsLeaf: false, parentArr: nextParentArr }))
          const assets = await this.pickerFetchAssets(data.mrid, nextParentArr)
          rows.push(...assets)
        } else if (data.mode === 'voltageLevel') {
          const rs = await window.electronAPI.getBayByVoltageBySubstationId(data.mrid, null)
          ;(rs?.data || []).forEach(b => rows.push({ mrid: b.mrid, displayName: b.name, mode: 'bay', pickerIsLeaf: false, parentArr: nextParentArr }))
        } else if (data.mode === 'bay') {
          const assets = await this.pickerFetchAssets(data.mrid, nextParentArr)
          rows.push(...assets)
        } else if (data.mode === 'asset') {
          const rs = await window.electronAPI.getOldWorkByAssetId(data.mrid)
          ;(rs?.data || []).forEach(j => rows.push({ mrid: j.mrid, displayName: j.name || j.job_name || j.mrid, mode: 'job', assetType: data.assetType, pickerIsLeaf: true, parentArr: nextParentArr }))
        }
        resolve(rows)
      } catch(e) { console.error('loadPickerNode error:', e); resolve([]) }
    },
    async pickerFetchAssets(psrId, parentArr) {
      const results = await Promise.all([
        window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Transformer'),
        window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Voltage transformer'),
        window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Current transformer'),
        window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Circuit breaker'),
        window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Power cable'),
        window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Disconnector'),
        window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Rotating machine'),
        window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Capacitor'),
        window.electronAPI.getAssetByPsrIdAndKind(psrId, 'Reactor'),
        window.electronAPI.getSurgeArresterByPsrId(psrId),
        window.electronAPI.getBushingByPsrId(psrId),
      ])
      const assetTypes = ['Transformer','Voltage transformer','Current transformer','Circuit breaker','Power cable','Disconnector','Rotating machine','Capacitor','Reactor','Surge arrester','Bushing']
      const rows = []
      results.forEach((rs, i) => {
        if (!rs?.success || !rs.data) return
        const atype = assetTypes[i]
        ;(Array.isArray(rs.data) ? rs.data : [rs.data]).forEach(a => {
          rows.push({ mrid: a.mrid, displayName: a.apparatus_id || a.serial_number || a.name || a.mrid, mode: 'asset', assetType: atype, pickerIsLeaf: false, parentArr })
        })
      })
      return rows
    },
    onPickerNodeClick(data) {
      this.pickerTempSelected = data
    },
    getMatchingItems(cat) {
      const jobToAsset = {
        'Job_TransformerJobDto': 'Transformer', 'Job_VoltageTransformerJobDto': 'Voltage transformer',
        'Job_CurrentTransformerJobDto': 'Current transformer', 'Job_CircuitBreakerJobDto': 'Circuit breaker',
        'Job_PowerCableJobDto': 'Power cable', 'Job_SurgeArresterJobDto': 'Surge arrester',
        'Job_ReactorJobDto': 'Reactor', 'Job_CapacitorJobDto': 'Capacitor',
        'Job_DisconnectorJobDto': 'Disconnector', 'Job_RotatingMachineJobDto': 'Rotating machine',
        'Job_BushingJobDto': 'Bushing',
      }
      return this.selectedItems.filter((item) => {
        const ctx = item.context
        const catKey = cat.key
        if (catKey === 'OrgEntityToOrgDto')  return !!ctx.organisation
        if (catKey === 'SubstationDto')       return !!ctx.substation
        if (catKey === 'VoltageLevelDto')     return !!ctx.voltageLevel
        if (catKey === 'Bay')                 return !!ctx.bay
        if (catKey.startsWith('Asset_')) {
          if (!ctx.asset) return false
          const expectedKey = this.assetTypeToKey[ctx.asset.assetType]
          return expectedKey === catKey
        }
        if (catKey.startsWith('Job_')) {
          if (!ctx.job) return false
          const normalKey = catKey.startsWith('Job_Job_') ? catKey.slice(4) : catKey
          const requiredAsset = jobToAsset[normalKey]
          if (!requiredAsset) return false
          return ctx.job.assetType === requiredAsset || (ctx.asset && ctx.asset.assetType === requiredAsset)
        }
        return false
      })
    },
    async doExport() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('Please add at least one asset or job to the selection list')
        return
      }
      this.exportLoading = true
      try {
        const tmpl = this.templateList.find(t => t.name === this.selectedTemplateName)
        const variables = tmpl ? (tmpl.variable || []) : []
        const codeMap = {}

        for (const cat of this.exportCategories) {
          const matchingItems = this.getMatchingItems(cat)
          if (cat.key.startsWith('Asset_') || cat.key.startsWith('Job_')) {
            for (const item of matchingItems) {
              const { flatMap, arrayMap } = await exportService.buildDtoForCat(cat, item.context)
              const partial = exportService.extractFromMaps(cat, flatMap, arrayMap, this.tableData)
              for (const code in partial) {
                if (!codeMap[code]) codeMap[code] = []
                const vals = partial[code]
                codeMap[code].push.apply(codeMap[code], Array.isArray(vals) ? vals : [vals])
              }
            }
          } else {
            const firstItem = matchingItems[0]
            if (!firstItem) continue
            const { flatMap, arrayMap } = await exportService.buildDtoForCat(cat, firstItem.context)
            const partial = exportService.extractFromMaps(cat, flatMap, arrayMap, this.tableData)
            for (const code in partial) {
              if (!codeMap[code]) codeMap[code] = partial[code]
            }
          }
        }

        if (this.exportType === 'excel') {
          const rs = await window.electronAPI.exportTemplateWithData({ templatePath: this.currentFilePath, variables, codeMap })
          if (rs.canceled) return
          if (rs.success) {
            this.showExportDialog = false
            this.$message.success('Exported successfully: ' + rs.filePath)
          } else {
            this.$message.error(rs.message || 'Export failed')
          }
        } else if (this.exportType === 'word') {
          // GỌI IPC CỦA WORD TẠI ĐÂY
          const rs = await window.electronAPI.exportWordWithData({ templatePath: this.currentFilePath, variables, codeMap })
          if (rs.canceled) return
          if (rs.success) {
            this.showExportDialog = false
            this.$message.success('Word Exported successfully: ' + rs.filePath)
          } else {
            this.$message.error(rs.message || 'Word Export failed')
          }
        }
      } catch(e) {
        this.$message.error('Export error: ' + e.message)
        console.error('doExport error:', e)
      } finally {
        this.exportLoading = false
      }
    },
    clearAll() { this.tableData = [] },
    addRow(index) {
      const r = { code: '', category: '', featureLevels: [], coordinates: [] }
      if (typeof index === 'number') this.tableData.splice(index + 1, 0, r); else this.tableData.push(r)
    },
    removeRow(index) { this.tableData.splice(index, 1) },
    onCategoryChange(row) { row.featureLevels = [{}] },
    getNodeByLevel(row, levelIndex) {
      let node = this.FEATURE_TREE[row.category]; if (!node) return null
      for (let i = 0; i < levelIndex; i++) { const key = row.featureLevels[i]?.key; node = node?.children?.[key]; if (!node) return null }
      return node
    },
    getFeatureOptionsByLevel(row, levelIndex) {
      const node = this.getNodeByLevel(row, levelIndex); if (!node?.children) return []
      return Object.entries(node.children).map(([key, child]) => ({ key, label: child.label, hasChildren: !!child.children, isLeaf: !!child.value }))
    },
    onFeatureLevelChange({row, levelIndex}) {
      row.featureLevels.splice(levelIndex + 1)
      const key = row.featureLevels[levelIndex]?.key; const parent = this.getNodeByLevel(row, levelIndex)
      const selected = parent?.children?.[key]
      if (selected?.children) row.featureLevels.push({ key: '' })
    },
    clearAllDialog() {
      this.resetAddDialog()
      this.clearAll()
      this.selectedTemplateName = "",
      this.currentFilePath = ""
    }
  }
}
</script>
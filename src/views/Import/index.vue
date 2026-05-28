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
      <el-button v-if="importType === 'excel'" type="success"  size="mini" :disabled="!selectedTemplateName" @click="handleUploadExcel">Excel File</el-button>
      <el-button v-if="importType === 'word'" type="success"  size="mini" :disabled="!selectedTemplateName" @click="handleUploadWord">Word File</el-button>
      <el-button type="danger"   size="mini" :disabled="!selectedTemplateName" @click="handleDelete">Delete</el-button>
      <el-button type="warning"  size="mini" :disabled="!selectedTemplateName" @click="handleSave">Save</el-button>
      <el-button type="info"     size="mini" :disabled="!selectedTemplateName" @click="handleImportJson">Import</el-button>
      <el-button v-if="importType === 'excel'" type="warning" size="mini" :disabled="!selectedTemplateName || !currentFilePath" @click="handleImportExcel">
        <i class="fa-solid fa-file-import"></i> Import Excel
      </el-button>
    </template>
  </template-manager>

  <div v-if="currentFilePath" style="margin:4px 0 8px;font-size:12px;color:#909399;">
    <span @click="openTemplateFile" title="Click to open file"
      style="cursor:pointer;display:inline-flex;align-items:center;gap:5px;"
      onmouseover="this.style.color='#409EFF'" onmouseout="this.style.color='#909399'">
      <i :class="importType==='word' ? 'fa-solid fa-file-word' : 'fa-solid fa-file-excel'"
        :style="{color: importType==='word' ? '#2B579A' : '#67C23A'}"></i>
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

  <!-- ─────── IMPORT EXCEL DIALOG ─────────────────────────────────────── -->
  <el-dialog title="Import from Excel" :visible.sync="showImportDialog"
    width="600px" append-to-body @close="resetImportDialog">

    <!-- Step 1: chọn file + node cha + chế độ -->
    <div v-if="importStep === 1">
      <div style="margin-bottom:14px;">
        <div style="font-size:12px;font-weight:600;color:#606266;margin-bottom:6px;">
          <i class="fa-solid fa-file-excel" style="color:#67C23A;"></i> Filled Excel file
        </div>
        <div style="display:flex;gap:8px;">
          <el-input :value="importFilePath ? importFilePath.split(/[\\/]/).pop() : ''"
            readonly size="small" placeholder="No file selected" style="flex:1;" />
          <el-button size="small" type="primary" icon="el-icon-folder-opened" @click="pickImportFile">Browse</el-button>
        </div>
      </div>

      <div style="margin-bottom:14px;">
        <div style="font-size:12px;font-weight:600;color:#606266;margin-bottom:6px;">
          <i class="el-icon-share"></i> Parent node
          <span style="font-weight:normal;color:#909399;margin-left:4px;">(optional — selects where to start inserting)</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <el-button size="small" plain icon="el-icon-location" @click="importNodePickerVisible = true">
            {{ importSelectedNode ? importSelectedNode.label.split(' / ').pop() : 'Insert from root (no parent)' }}
          </el-button>
          <el-button v-if="importSelectedNode" size="mini" type="danger" plain circle
            icon="el-icon-close" @click="importSelectedNode = null" />
        </div>
        <div v-if="importSelectedNode" style="margin-top:4px;font-size:11px;color:#909399;padding-left:2px;">
          Path: {{ importSelectedNode.label }}
        </div>
        <div style="margin-top:6px;padding:8px 10px;background:#f5f7fa;border-radius:4px;font-size:11px;color:#606266;line-height:1.6;">
          <i class="el-icon-info" style="color:#909399;"></i>
          <span v-if="!importSelectedNode">No node selected → import entire hierarchy from <b>Organisation</b> level</span>
          <span v-else-if="importSelectedNode.mode === 'organisation'">Organisation selected → Org data in Excel = <b>child Organisation</b>; Substation and below inserted under that child (or directly under selected if no child org data)</span>
          <span v-else-if="importSelectedNode.mode === 'substation'">Substation selected → import from <b>Voltage Level / Bay</b> downward</span>
          <span v-else-if="importSelectedNode.mode === 'voltageLevel'">Voltage Level selected → import from <b>Bay</b> downward</span>
          <span v-else-if="importSelectedNode.mode === 'bay'">Bay selected → import <b>Asset</b> only</span>
          <span v-else-if="importSelectedNode.mode === 'asset'">Asset selected → import <b>Job</b> only</span>
        </div>
      </div>

      <div style="margin-bottom:8px;">
        <div style="font-size:12px;font-weight:600;color:#606266;margin-bottom:8px;">
          <i class="el-icon-setting"></i> Duplicate handling (when same name already exists)
        </div>
        <el-radio-group v-model="importOverwrite" size="small">
          <el-radio-button :label="false">
            <i class="el-icon-folder-add"></i> Use existing as parent (no overwrite)
          </el-radio-button>
          <el-radio-button :label="true">
            <i class="el-icon-edit"></i> Overwrite fields (keep MRID)
          </el-radio-button>
        </el-radio-group>
        <div style="margin-top:6px;font-size:11px;color:#909399;">
          <span v-if="!importOverwrite">If a node with same name exists → use it as parent context, do NOT change its data</span>
          <span v-else>If a node with same name exists → overwrite its fields, keep the existing MRID</span>
        </div>
      </div>
    </div>

    <!-- Step 2: preview -->
    <div v-else-if="importStep === 2">

      <!-- Decisions needed section -->
      <div v-if="importDecisions.length" style="margin-bottom:12px;">
        <div style="font-size:12px;font-weight:600;color:#E6A23C;margin-bottom:8px;">
          <i class="el-icon-question"></i> Decisions needed before import:
        </div>
        <div v-for="d in importDecisions" :key="d.key"
          style="margin-bottom:8px;padding:10px 12px;border-radius:6px;border:1px solid #faecd8;background:#fdf6ec;">
          <!-- Missing name case -->
          <div v-if="d.type === 'missing_name'">
            <div style="font-size:12px;color:#E6A23C;margin-bottom:6px;">
              <i class="el-icon-warning-outline"></i>
              <b>{{ d.label }}</b> has no name in Excel, but child data exists below it.
            </div>
            <el-radio-group v-model="d.choice" size="small">
              <el-radio label="generate" style="margin-right:16px;">
                <span>Auto-generate name: <code style="background:#f5f5f5;padding:2px 6px;border-radius:3px;font-size:11px;">{{ d.generatedValue }}</code></span>
              </el-radio>
              <el-radio label="skip">
                Skip {{ d.label }} and all child data
              </el-radio>
            </el-radio-group>
          </div>
          <!-- Shortcut org→job case -->
          <div v-else-if="d.type === 'shortcut'">
            <div style="font-size:12px;color:#E6A23C;margin-bottom:6px;">
              <i class="el-icon-warning-outline"></i>
              <b>Job/Test data found</b> but no Substation or Asset name.
              Need intermediate levels to hold the Job.
            </div>
            <el-radio-group v-model="d.choice" size="small">
              <el-radio label="generate" style="display:block;margin-bottom:6px;">
                Auto-generate:
                <code style="background:#f5f5f5;padding:2px 6px;border-radius:3px;font-size:11px;margin:0 4px;">
                  Sub: {{ d.generatedValues.sub_name }}
                </code>
                <code style="background:#f5f5f5;padding:2px 6px;border-radius:3px;font-size:11px;">
                  Asset serial: {{ d.generatedValues.asset_serial }}
                </code>
              </el-radio>
              <el-radio label="skip">Skip Job/Test import</el-radio>
            </el-radio-group>
          </div>
        </div>
        <el-divider style="margin:10px 0;"></el-divider>
      </div>

      <div>
        <div style="margin-bottom:8px;font-size:12px;color:#606266;">
          <b>{{ importPreview.filter(r => r.hasData).length }}</b> levels will be imported
          in hierarchy order. Levels with no data in Excel will be skipped automatically.
        </div>
        <div style="max-height:360px;overflow-y:auto;border:1px solid #EBEEF5;border-radius:4px;">
          <table width="100%" cellpadding="0" style="border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="background:#F5F7FA;">
                <th style="padding:7px 10px;border-bottom:1px solid #EBEEF5;width:140px;text-align:left;">Level</th>
                <th style="padding:7px 10px;border-bottom:1px solid #EBEEF5;width:120px;text-align:left;">Key field</th>
                <th style="padding:7px 10px;border-bottom:1px solid #EBEEF5;text-align:left;">Other fields</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in importPreview" :key="row.catKey"
                :style="{background: !row.hasData ? '#fafafa' : (i%2===0?'#fff':'#F9FAFB'), borderBottom:'1px solid #F0F0F0',
                         opacity: row.hasData ? 1 : 0.5}">
                <td style="padding:7px 10px;">
                  <el-tag size="mini" :type="row.hasData ? 'success' : 'info'">{{ row.label }}</el-tag>
                </td>
                <td style="padding:7px 10px;">
                  <span v-if="row.keyValue" style="font-weight:600;color:#303133;">{{ row.keyValue }}</span>
                  <span v-else-if="row.isJobWithTests" style="color:#E6A23C;font-style:italic;">auto-generate</span>
                  <span v-else style="color:#C0C4CC;font-style:italic;">—</span>
                </td>
                <td style="padding:7px 10px;color:#606266;">
                  <span v-if="!row.hasData" style="color:#C0C4CC;font-style:italic;">no data in Excel</span>
                  <span v-else>{{ row.otherFieldsSummary }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div><!-- /preview wrapper -->
    </div><!-- /importStep === 2 -->

    <!-- Step 3: kết quả -->
    <div v-else-if="importStep === 3">
      <div v-for="r in importResults" :key="r.catKey"
        style="padding:7px 10px;margin-bottom:4px;border-radius:4px;"
        :style="{ background: r.success ? '#f0f9eb' : r.skipped ? '#f5f7fa' : '#fef0f0',
                  border: '1px solid ' + (r.success ? '#e1f3d8' : r.skipped ? '#EBEEF5' : '#fde2e2') }">
        <div style="display:flex;align-items:center;gap:8px;">
          <i style="font-size:14px;min-width:14px;"
            :class="r.success ? 'el-icon-check' : r.skipped ? 'el-icon-minus' : 'el-icon-close'"
            :style="{ color: r.success ? '#67C23A' : r.skipped ? '#909399' : '#F56C6C' }"></i>
          <div style="flex:1;">
            <span style="font-size:12px;">
              <b>{{ r.level }}</b>
              <span v-if="r.name" style="color:#409EFF;margin-left:6px;">"{{ r.name }}"</span>
              <span v-if="r.action === 'inserted'"      style="color:#67C23A;margin-left:8px;font-size:11px;">→ inserted new</span>
              <span v-if="r.action === 'overwritten'"   style="color:#E6A23C;margin-left:8px;font-size:11px;">→ overwritten</span>
              <span v-if="r.action === 'used_existing'" style="color:#909399;margin-left:8px;font-size:11px;">→ already exists, used as parent</span>
              <span v-if="r.skipped"                    style="color:#909399;margin-left:8px;font-size:11px;">→ {{ r.reason }}</span>
              <span v-if="r.error"                      style="color:#F56C6C;margin-left:8px;font-size:11px;">{{ r.error }}</span>
            </span>
            <div v-if="r.mrid" style="font-size:10px;color:#C0C4CC;margin-top:2px;">MRID: {{ r.mrid }}</div>
          </div>
        </div>
      </div>
      <div style="margin-top:10px;font-size:11px;color:#909399;text-align:right;">
        {{ importResults.filter(r => r.action === 'inserted').length }} inserted ·
        {{ importResults.filter(r => r.action === 'overwritten').length }} overwritten ·
        {{ importResults.filter(r => r.action === 'used_existing').length }} used existing ·
        {{ importResults.filter(r => r.skipped).length }} skipped ·
        {{ importResults.filter(r => !r.success && !r.skipped).length }} failed
      </div>
    </div>

    <div slot="footer" style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:11px;color:#909399;">
        <i :class="['el-icon-setting','el-icon-view','el-icon-check'][importStep-1]"></i>
        Step {{ importStep }} / 3 —
        <b>{{ ['Setup','Preview','Done'][importStep-1] }}</b>
      </span>
      <div style="white-space:nowrap;">
        <el-button size="small" @click="showImportDialog = false">
          {{ importStep === 3 ? 'Close' : 'Cancel' }}
        </el-button>
        <el-button v-if="importStep === 2" size="small" @click="importStep = 1">
          <i class="el-icon-arrow-left"></i> Back
        </el-button>
        <el-button v-if="importStep === 1" size="small" type="primary"
          :disabled="!importFilePath"
          :loading="importLoading"
          @click="runImportPreview">
          Preview <i class="el-icon-arrow-right"></i>
        </el-button>
        <el-button v-if="importStep === 2" size="small" type="warning"
          :disabled="!importPreview.some(r => r.hasData) || importDecisions.some(d => !d.choice)"
          :loading="importLoading"
          @click="confirmImport">
          <i class="fa-solid fa-file-import"></i> Confirm Import
        </el-button>
      </div>
    </div>
  </el-dialog>



  <!-- Import node picker -->
  <el-dialog title="Select Parent Node" :visible.sync="importNodePickerVisible"
    width="500px" append-to-body>
    <div style="margin-bottom:6px;font-size:11px;color:#909399;">
      Select the parent node to insert into. Leave empty to import from Organisation level.
    </div>
    <el-tree
      :key="'imp-' + pickerTreeKey"
      :props="{ label: 'displayName', children: 'children', isLeaf: 'pickerIsLeaf' }"
      :load="loadPickerNode" lazy node-key="mrid" highlight-current
      style="max-height:350px;overflow-y:auto;border:1px solid #EBEEF5;border-radius:4px;padding:4px;"
      @node-click="data => importPickerTemp = data"
    >
      <span slot-scope="{ data }" style="font-size:12px;display:flex;align-items:center;gap:6px;">
        <i :class="pickerNodeIcon(data)" style="font-size:11px;width:14px;text-align:center;"></i>
        {{ data.displayName }}
        <el-tag v-if="data.mode === 'asset'" size="mini" type="info" style="font-size:10px;">{{ data.assetType }}</el-tag>
      </span>
    </el-tree>
    <div v-if="importPickerTemp" style="margin-top:8px;padding:5px 10px;background:#f0f9eb;border-radius:4px;font-size:12px;">
      <i class="el-icon-check" style="color:#67C23A;"></i> <strong>{{ importPickerTemp.displayName }}</strong>
      <span style="color:#909399;font-size:11px;margin-left:6px;">({{ pickerModeLabel(importPickerTemp.mode) }})</span>
    </div>
    <span slot="footer">
      <el-button size="small" @click="importNodePickerVisible = false">Cancel</el-button>
      <el-button size="small" type="primary" :disabled="!importPickerTemp" @click="confirmImportNode">Select</el-button>
    </span>
  </el-dialog>

</div>
</template>

<script>
/* eslint-disable */
import { ASSET_TYPE_TO_KEY, CATEGORY_OPTION, FEATURE_TREE } from '../Common/constants'
import { exportService } from '../Export/services/exportService'
import { deepImportService } from './services/deepImportService.js'
import TemplateManager from './components/TemplateManager.vue'
import DataTable from './components/DataTable.vue'

export default {
  name: 'ExportView',
  props: {
    importType: {
      type: String,
      default: 'excel'
    },
  },
  watch: {
    'importType' : {
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
      // Import Excel
      showImportDialog: false,
      importStep: 1,
      importFilePath: '',
      importSelectedNode: null,   // { label, mode, context: { organisation:{mrid}, ... } }
      importNodePickerVisible: false,
      importPickerTemp: null,
      importPreview: [],           // [{ catKey, label, hasData, keyValue, otherFieldsSummary, isJobWithTests }]

      importResults: [],           // per-level results
      importLoading: false,
      importCachedCodeValueMap: null,
      importOverwrite: false,      // true=ghi đè fields, false=dùng existing làm parent
      importDecisions: [],         // [{ key, type, label, issue, choice, generatedValue? }]
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
        const rs = await window.electronAPI.getAllTemplatesByType(this.importType, 'import')
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
        if(this.importType === 'excel') {
          rs = await window.electronAPI.uploadExcelTemplate(this.addForm.name)
        } else if(this.importType === 'word') {
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
          const rs = await window.electronAPI.insertTemplate({ name: this.addForm.name, path: this.addForm.filePath||'', variable: JSON.stringify([]), type: this.importType || '', category: 'import' })
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
        const rs = await window.electronAPI.saveTemplateWithScan({ name: this.selectedTemplateName, filePath: this.currentFilePath, variables, type: this.importType, category: 'import' })
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
        if (!Array.isArray(variables)) return
        this.tableData = variables.map(v => ({ code: v.code||'', category: v.category||'', featureLevels: (v.featureLevels||[]).map(f => ({ key: f.key||'' })), coordinates: v.coordinates||[] }))
        this.$message.success('Imported')
      } catch(e) { this.$message.error(e.message) }
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

        if (this.importType === 'excel') {
          const rs = await window.electronAPI.exportTemplateWithData({ templatePath: this.currentFilePath, variables, codeMap })
          if (rs.canceled) return
          if (rs.success) {
            this.showExportDialog = false
            this.$message.success('Exported successfully: ' + rs.filePath)
          } else {
            this.$message.error(rs.message || 'Export failed')
          }
        } else if (this.importType === 'word') {
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
    // ──────────── IMPORT EXCEL ───────────────────────────────────────────────
    handleImportExcel() {
      this.resetImportDialog()
      this.showImportDialog = true
    },
    resetImportDialog() {
      this.importStep = 1
      this.importFilePath = ''
      this.importSelectedNode = null
      this.importNodePickerVisible = false
      this.importPickerTemp = null
      this.importPreview = []
      this.importResults = []
      this.importLoading = false
      this.importCachedCodeValueMap = null
      this.importOverwrite = false
      this.importDecisions = []
    },
    async pickImportFile() {
      const rs = await window.electronAPI.pickExcelFileForImport()
      if (rs && rs.filePath) this.importFilePath = rs.filePath
    },
    confirmImportNode() {
      if (!this.importPickerTemp) return
      const node = this.importPickerTemp
      const pathParts = [...(node.parentArr || []).map(p => p.name), node.displayName]
      this.importSelectedNode = {
        label: pathParts.join(' / '),
        mode: node.mode,
        context: this.buildContextFromNode(node)
      }
      this.importNodePickerVisible = false
      this.importPickerTemp = null
    },
    async runImportPreview() {
      if (!this.importFilePath) return
      this.importLoading = true
      try {
        const tmpl = this.templateList.find(t => t.name === this.selectedTemplateName)
        const variables = tmpl ? (tmpl.variable || []) : []
        // Read Excel → codeValueMap
        const rs = await window.electronAPI.readExcelForImport({ filePath: this.importFilePath, templatePath: this.currentFilePath, variables })
        if (!rs || !rs.success) { this.$message.error(rs && rs.message ? rs.message : 'Failed to read Excel'); return }
        this.importCachedCodeValueMap = rs.codeValueMap

        // Build allLevelData
        const allLevelData = deepImportService.buildAllLevelData(rs.codeValueMap, this.tableData)
        const selectedMode = this.importSelectedNode ? this.importSelectedNode.mode : null
        const levelsToProcess = deepImportService.getLevelsToProcess(selectedMode, allLevelData)

        // Build preview rows
        const preview = []
        for (const lv of levelsToProcess) {
          const data = allLevelData[lv.catKey] || {}
          const hasData = Object.keys(data).length > 0
          const keyValue = hasData ? data[lv.reqField] : null
          const isJobWithTests = lv.id === 'job' && !keyValue && hasData
          const otherFields = hasData
            ? Object.keys(data).filter(k => k !== lv.reqField).slice(0, 5).join(', ')
            : ''
          preview.push({ catKey: lv.catKey, label: lv.label, hasData, keyValue, isJobWithTests,
                         otherFieldsSummary: otherFields || (hasData ? '...' : '') })
        }
        this.importPreview = preview

        // Phân tích các trường hợp cần hỏi user (reuse allLevelData + levelsToProcess đã có)
        const rawDecisions = deepImportService.analyzeDecisionsNeeded(allLevelData, levelsToProcess)
        // Khởi tạo generated values cho mỗi decision
        this.importDecisions = rawDecisions.map(d => {
          if (d.type === 'missing_name') {
            return { ...d, generatedValue: deepImportService._randomId(d.levelId.toUpperCase() + '-') }
          } else if (d.type === 'shortcut') {
            return { ...d, generatedValues: {
              sub_name:     deepImportService._randomId('SUB-'),
              asset_serial: deepImportService._randomId('ASSET-')
            }}
          }
          return d
        })

        this.importStep = 2
      } catch(e) { this.$message.error('Preview error: ' + e.message) }
      finally { this.importLoading = false }
    },
    async confirmImport() {
      if (!this.importCachedCodeValueMap) return
      this.importLoading = true
      try {
        const rs = await deepImportService.importHierarchy(
          this.importCachedCodeValueMap,
          this.tableData,
          this.importSelectedNode,
          this.importOverwrite,
          this.importDecisions,
          this.$store.state.user.user_id   // pass userId — cần cho getSubstationsInOrganisationForUser
        )
        this.importResults = rs.results || []
        this.importStep = 3
        if (!rs.success) {
          this.$message.error('Import failed validation')
          return
        }
        const ok = this.importResults.filter(r => r.success && !r.skipped).length
        const fail = this.importResults.filter(r => !r.success && !r.skipped).length
        if (fail === 0) this.$message.success(ok + ' level' + (ok !== 1 ? 's' : '') + ' imported successfully')
        else this.$message.warning(ok + ' OK, ' + fail + ' failed')
      } catch(e) { this.$message.error('Import error: ' + e.message) }
      finally { this.importLoading = false }
    },
    openTemplateFile() {
      if (!this.currentFilePath) return
      const ext = this.currentFilePath.split('.').pop().toLowerCase()
      if (!['xlsx', 'xls', 'doc', 'docx'].includes(ext)) {
        this.$message.warning('Only Excel and Word files are supported')
        return
      }
      window.electronAPI.openFileTemplate(this.currentFilePath).then(err => {
        if (err) this.$message.error('Cannot open file: ' + err)
      })
    },
        // ─────────────────────────────────────────────────────────────────────────
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
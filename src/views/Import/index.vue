<template>
<div>
  <div v-if="managerMode && importType === 'word'" class="word-template-manager">
    <aside class="word-manager-sidebar">
      <div class="word-manager-sidebar-tools">
        <el-button type="primary" size="small" icon="el-icon-plus" @click="openAddTemplateDialog">New Template</el-button>
        <el-button size="small" @click="$emit('import-package')">Import ZIP</el-button>
      </div>
      <el-input v-model="managerSearch" clearable size="small" placeholder="Search templates..." prefix-icon="el-icon-search" />
      <el-select v-model="managerAssetFilter" size="small" class="word-manager-filter" aria-label="Filter asset type">
        <el-option label="All asset types" value="" />
        <el-option v-for="type in managerAssetOptions" :key="type" :label="type" :value="type" />
      </el-select>
      <div class="word-manager-template-list">
        <section v-for="group in managerGroups" :key="group.label" class="word-manager-group">
          <h3>{{ group.label }} ({{ group.templates.length }})</h3>
          <button v-for="template in group.templates" :key="template.name" type="button" class="word-manager-template"
            :class="{active: selectedTemplateName === template.name}" :title="template.name" @click="selectManagerTemplate(template.name)">
            <strong>{{ template.name }}</strong>
            <small>{{ template.variable.length }} field mappings</small>
          </button>
        </section>
        <p v-if="!managerGroups.length" class="word-manager-empty">No templates found</p>
      </div>
    </aside>
    <section class="word-manager-detail">
      <template v-if="selectedTemplateName">
        <div class="word-manager-detail-scroll">
          <div class="word-manager-title-row">
            <div><span class="word-manager-eyebrow">{{ managerAssetType(selectedTemplate) }}</span><h2>{{ selectedTemplateName }}</h2></div>
            <el-button size="small" icon="el-icon-refresh" title="Refresh templates" @click="loadTemplates">Refresh</el-button>
          </div>
          <div class="word-manager-section-title">Word Template (.docx)</div>
          <div class="word-manager-file">
            <div class="word-manager-file-icon">W</div>
            <span :title="currentFilePath">{{ managerFileName || 'No Word file selected' }}</span>
            <el-button size="small" @click="handleUploadWord">{{ currentFilePath ? 'Replace DOCX' : 'Add DOCX' }}</el-button>
            <el-button size="small" :disabled="!currentFilePath" @click="downloadCurrentTemplate">Download</el-button>
            <el-button size="small" :disabled="!currentFilePath" @click="managerPreviewVisible = true">Preview</el-button>
            <el-button size="small" :disabled="!currentFilePath" @click="openTemplateFile">Open</el-button>
          </div>
          <div class="word-manager-mapping-head">
            <div class="word-manager-section-title">Field Mappings ({{ tableData.length }})</div>
            <el-button type="primary" size="small" icon="el-icon-plus" @click="addRow()">Add Mapping</el-button>
          </div>
          <div class="word-manager-table-scroll">
            <table class="word-manager-table">
              <thead><tr><th>Code</th><th>Category</th><th>Target field</th><th>Word cell</th><th title="Include the stored unit">Unit</th><th><span class="sr-only">Remove</span></th></tr></thead>
              <tbody>
                <tr v-for="(row, index) in tableData" :key="index">
                  <td><el-input v-model="row.code" size="small" placeholder="A1" /></td>
                  <td><el-select v-model="row.category" size="small" placeholder="Category" @change="onCategoryChange(row)">
                    <el-option v-for="category in categoryOptions" :key="category.value" :label="category.label" :value="category.value" />
                  </el-select></td>
                  <td><el-cascader :value="row.featureLevels.map(level => level.key).filter(Boolean)" :options="managerFieldOptions(row.category)"
                    :props="{expandTrigger: 'hover'}" filterable clearable size="small" placeholder="Select target field"
                    @change="setManagerFieldPath(row, $event)" /></td>
                  <td class="word-manager-coordinates"><span v-for="coordinate in row.coordinates" :key="coordinate">{{ coordinate }}</span><span v-if="!row.coordinates.length">After save</span></td>
                  <td><el-checkbox v-model="row.includeUnit" /></td>
                  <td><el-button type="text" icon="el-icon-delete" title="Remove mapping" class="word-manager-delete-row" @click="removeRow(index)" /></td>
                </tr>
                <tr v-if="!tableData.length"><td colspan="6" class="word-manager-empty">No field mappings yet</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="word-manager-footer">
          <div>
            <el-button size="small" @click="handleImportJson">Import JSON</el-button>
            <el-button size="small" :disabled="!tableData.length" @click="handleExportJson">Export JSON</el-button>
            <el-button size="small" @click="$emit('set-sample', selectedTemplateName)">Add Sample Report</el-button>
            <el-button size="small" @click="$emit('export-package', selectedTemplateName)">Export ZIP</el-button>
          </div>
          <div><el-button type="danger" plain size="small" @click="handleDelete">Delete</el-button><el-button type="primary" size="small" @click="handleSave">Save</el-button></div>
        </div>
      </template>
      <div v-else class="word-manager-placeholder">Select a template or create a new one</div>
    </section>
  </div>
  <div v-else>
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
      <el-button v-if="importType === 'word'"  type="success"  size="mini" :disabled="!selectedTemplateName" @click="handleUploadWord">Word File</el-button>
      <el-button type="danger"   size="mini" :disabled="!selectedTemplateName" @click="handleDelete">Delete</el-button>
      <el-button type="warning"  size="mini" :disabled="!selectedTemplateName" @click="handleSave">Save</el-button>
      <el-button type="info"     size="mini" :disabled="!selectedTemplateName" @click="handleImportJson">Import JSON</el-button>
      <el-button type="info"     size="mini" :disabled="!selectedTemplateName || !tableData.length" @click="handleExportJson">Export JSON</el-button>
      <el-button v-if="importType === 'excel'" type="warning" size="mini" :disabled="!selectedTemplateName || !currentFilePath" @click="handleImportExcel">
        <i class="fa-solid fa-file-import"></i> Import Excel
      </el-button>
      <el-button v-if="importType === 'word' && !managerMode" type="warning" size="mini" :disabled="!selectedTemplateName || !currentFilePath" @click="handleImportWord">
        <i class="fa-solid fa-file-import"></i> Import Word
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
  </div>

  <WordTemplatePreview v-if="managerMode && importType === 'word'" :visible.sync="managerPreviewVisible"
    :template-name="selectedTemplateName" :file-path="currentFilePath" :mappings="tableData" />

  <!-- Add template dialog -->
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

  <!-- Export dialog (giữ nguyên) -->
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
        <div v-for="(item, idx) in selectedItems" :key="item.id"
          style="display:flex;align-items:center;gap:6px;padding:5px 8px;margin-bottom:4px;background:#f5f7fa;border-radius:4px;border:1px solid #EBEEF5;">
          <span style="font-size:11px;color:#fff;background:#409EFF;border-radius:3px;padding:1px 6px;min-width:54px;text-align:center;">
            Sheet {{ idx + 1 }}
          </span>
          <i :class="itemIcon(item)" style="font-size:12px;color:#606266;"></i>
          <span style="font-size:12px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" :title="item.label">{{ item.label }}</span>
          <el-input v-model="item.sheetName" size="mini" placeholder="Sheet name" style="width:120px;" :maxlength="31" />
          <el-button size="mini" type="danger" plain icon="el-icon-delete" circle @click="removeSelectedItem(item.id)" />
        </div>
      </div>
      <div v-else style="font-size:11px;color:#E6A23C;padding:6px 10px;background:#fdf6ec;border-radius:4px;">
        <i class="el-icon-warning-outline"></i> No selection yet — click "Add asset / job" to begin
      </div>
      <div v-if="selectedItems.length > 0" style="margin-top:8px;font-size:11px;color:#909399;">
        {{ selectedItems.length }} source{{ selectedItems.length > 1 ? 's' : '' }} selected.
      </div>
    </div>
    <div slot="footer">
      <el-button size="small" @click="showExportDialog = false">Cancel</el-button>
      <el-button size="small" type="primary" :loading="exportLoading" @click="doExport">Export</el-button>
    </div>
  </el-dialog>

  <!-- Node picker (export) -->
  <el-dialog title="Select Node" :visible.sync="nodePickerVisible" width="540px" :append-to-body="true">
    <div style="margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:12px;color:#909399;">Navigate the tree: Organisation → Substation → VoltageLevel → Bay → Asset → Job</span>
      <el-button size="mini" icon="el-icon-refresh" @click="refreshPickerTree" style="padding:4px 8px;">Refresh</el-button>
    </div>
    <el-tree :key="pickerTreeKey" ref="pickerTree"
      :props="{ label: 'displayName', children: 'children', isLeaf: 'pickerIsLeaf' }"
      :load="loadPickerNode" lazy node-key="mrid" highlight-current
      style="max-height:380px;overflow-y:auto;border:1px solid #EBEEF5;border-radius:4px;padding:4px;"
      @node-click="onPickerNodeClick">
      <span slot-scope="{ data }" style="display:flex;align-items:center;gap:6px;font-size:12px;">
        <i :class="pickerNodeIcon(data)" style="font-size:11px;width:14px;text-align:center;"></i>
        <span :style="{ fontWeight: data.mode === 'asset' || data.mode === 'job' ? '600' : 'normal' }">{{ data.displayName }}</span>
        <el-tag v-if="data.mode === 'asset'" size="mini" type="info" style="font-size:10px;">{{ data.assetType }}</el-tag>
      </span>
    </el-tree>
    <div v-if="pickerTempSelected" style="margin-top:8px;padding:6px 10px;background:#f0f9eb;border-radius:4px;font-size:12px;">
      <i class="el-icon-check" style="color:#67C23A;"></i>
      <strong>{{ pickerTempSelected.displayName }}</strong>
      <span style="color:#909399;margin-left:4px;">({{ pickerModeLabel(pickerTempSelected.mode) }})</span>
    </div>
    <span slot="footer" style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:11px;color:#909399;">{{ selectedItems.length }} item{{ selectedItems.length !== 1 ? 's' : '' }} in list</span>
      <span>
        <el-button size="small" @click="nodePickerVisible = false">Done</el-button>
        <el-button size="small" type="primary" icon="el-icon-plus" :disabled="!pickerTempSelected" @click="addPickerSelectionToList">Add to list</el-button>
      </span>
    </span>
  </el-dialog>

  <!-- ─────── IMPORT DIALOG (Excel + Word dùng chung) ────────────────── -->
  <el-dialog
    :title="importType === 'word' ? 'Import from Word' : 'Import from Excel'"
    :visible.sync="showImportDialog"
    width="600px" append-to-body @close="resetImportDialog">

    <!-- Step 1: chọn file + node cha + chế độ -->
    <div v-if="importStep === 1">
      <div style="margin-bottom:14px;">
        <div style="font-size:12px;font-weight:600;color:#606266;margin-bottom:6px;">
          <i
            :class="importType === 'word' ? 'fa-solid fa-file-word' : 'fa-solid fa-file-excel'"
            :style="{ color: importType === 'word' ? '#2B579A' : '#67C23A' }">
          </i>
          {{ importType === 'word' ? 'Filled Word file' : 'Filled Excel file' }}
        </div>
        <div style="display:flex;gap:8px;">
          <el-input :value="importFilePath ? importFilePath.split(/[\\\/]/).pop() : ''"
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
          <el-button size="small" plain icon="el-icon-location" @click="openImportNodePicker">
            {{ importSelectedNode ? importSelectedNode.label.split(' / ').pop() : 'Insert from root (no parent)' }}
          </el-button>
          <el-button v-if="importSelectedNode" size="mini" type="danger" plain circle icon="el-icon-close" @click="importSelectedNode = null" />
        </div>
        <div v-if="importSelectedNode" style="margin-top:4px;font-size:11px;color:#909399;padding-left:2px;">
          Path: {{ importSelectedNode.label }}
        </div>
        <div style="margin-top:6px;padding:8px 10px;background:#f5f7fa;border-radius:4px;font-size:11px;color:#606266;line-height:1.6;">
          <i class="el-icon-info" style="color:#909399;"></i>
          <span v-if="!importSelectedNode">No node selected → import entire hierarchy from <b>Organisation</b> level</span>
          <span v-else-if="importSelectedNode.mode === 'organisation'">Organisation selected → Org data in file = <b>child Organisation</b></span>
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
      <div v-if="importDecisions.length" style="margin-bottom:12px;">
        <div style="font-size:12px;font-weight:600;color:#E6A23C;margin-bottom:8px;">
          <i class="el-icon-question"></i> Decisions needed before import:
        </div>
        <div v-for="d in importDecisions" :key="d.key"
          style="margin-bottom:8px;padding:10px 12px;border-radius:6px;border:1px solid #faecd8;background:#fdf6ec;">
          <div v-if="d.type === 'missing_name'">
            <div style="font-size:12px;color:#E6A23C;margin-bottom:6px;">
              <i class="el-icon-warning-outline"></i>
              <b>{{ d.label }}</b> has no name in file, but child data exists below it.
            </div>
            <el-radio-group v-model="d.choice" size="small">
              <el-radio label="generate" style="margin-right:16px;">
                <span>Auto-generate name: <code style="background:#f5f5f5;padding:2px 6px;border-radius:3px;font-size:11px;">{{ d.generatedValue }}</code></span>
              </el-radio>
              <el-radio label="skip">Skip {{ d.label }} and all child data</el-radio>
            </el-radio-group>
          </div>
          <div v-else-if="d.type === 'shortcut'">
            <div style="font-size:12px;color:#E6A23C;margin-bottom:6px;">
              <i class="el-icon-warning-outline"></i>
              <b>Job/Test data found</b> but no Substation or Asset name. Need intermediate levels to hold the Job.
            </div>
            <el-radio-group v-model="d.choice" size="small">
              <el-radio label="generate" style="display:block;margin-bottom:6px;">
                Auto-generate:
                <code style="background:#f5f5f5;padding:2px 6px;border-radius:3px;font-size:11px;margin:0 4px;">Sub: {{ d.generatedValues.sub_name }}</code>
                <code style="background:#f5f5f5;padding:2px 6px;border-radius:3px;font-size:11px;">Asset serial: {{ d.generatedValues.asset_serial }}</code>
              </el-radio>
              <el-radio label="skip">Skip Job/Test import</el-radio>
            </el-radio-group>
          </div>
        </div>
        <el-divider style="margin:10px 0;"></el-divider>
      </div>

      <!-- Nodes with names that already exist in the tree -> choose per node -->
      <div v-if="nameConflicts.length" style="margin-bottom:12px;">
        <div style="font-size:12px;font-weight:600;color:#E6A23C;margin-bottom:8px;">
          <i class="el-icon-warning-outline"></i>
          {{ nameConflicts.length }} node(s) already exist in the tree — choose how to handle each:
        </div>
        <div v-for="c in nameConflicts" :key="c.key"
          style="margin-bottom:8px;padding:10px 12px;border-radius:6px;border:1px solid #faecd8;background:#fdf6ec;">
          <div style="font-size:12px;color:#606266;margin-bottom:6px;">
            <b>{{ c.label }}</b>: "<b>{{ c.name }}</b>" already exists
          </div>
          <el-radio-group v-model="c.choice" size="small">
            <el-radio-button label="use_existing">
              <i class="el-icon-folder-opened"></i> Use existing (keep data)
            </el-radio-button>
            <el-radio-button label="overwrite">
              <i class="el-icon-edit"></i> Overwrite (keep MRID)
            </el-radio-button>
            <el-radio-button label="skip">
              <i class="el-icon-close"></i> Skip
            </el-radio-button>
          </el-radio-group>
        </div>
        <el-divider style="margin:10px 0;"></el-divider>
      </div>

      <div>
        <div style="margin-bottom:8px;font-size:12px;color:#606266;">
          <b>{{ importPreview.filter(r => r.hasData).length }}</b> levels will be imported
          in hierarchy order. Levels with no data will be skipped automatically.
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
                :style="{background: !row.hasData ? '#fafafa' : (i%2===0?'#fff':'#F9FAFB'),
                         borderBottom:'1px solid #F0F0F0', opacity: row.hasData ? 1 : 0.5}">
                <td style="padding:7px 10px;">
                  <el-tag size="mini" :type="row.hasData ? 'success' : 'info'">{{ row.label }}</el-tag>
                </td>
                <td style="padding:7px 10px;">
                  <span v-if="row.keyValue" style="font-weight:600;color:#303133;">{{ row.keyValue }}</span>
                  <span v-else-if="row.isJobWithTests" style="color:#E6A23C;font-style:italic;">auto-generate</span>
                  <span v-else style="color:#C0C4CC;font-style:italic;">—</span>
                </td>
                <td style="padding:7px 10px;color:#606266;">
                  <span v-if="!row.hasData" style="color:#C0C4CC;font-style:italic;">no data in file</span>
                  <span v-else>{{ row.otherFieldsSummary }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

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
        Step {{ importStep }} / 3 — <b>{{ ['Setup','Preview','Done'][importStep-1] }}</b>
      </span>
      <div style="white-space:nowrap;">
        <el-button size="small" @click="showImportDialog = false">
          {{ importStep === 3 ? 'Close' : 'Cancel' }}
        </el-button>
        <el-button v-if="importStep === 2" size="small" @click="importStep = 1">
          <i class="el-icon-arrow-left"></i> Back
        </el-button>
        <el-button v-if="importStep === 1" size="small" type="primary"
          :disabled="!importFilePath" :loading="importLoading"
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
  <el-dialog title="Select Parent Node" :visible.sync="importNodePickerVisible" width="500px" append-to-body>
    <div style="margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
      <span style="font-size:11px;color:#909399;">
        Select the parent node to insert into. Leave empty to import from Organisation level.
      </span>
      <el-button size="mini" icon="el-icon-refresh" @click="refreshImportPickerTree" style="padding:4px 8px;flex:none;">
        Refresh
      </el-button>
    </div>
    <el-tree
      :key="'imp-' + pickerTreeKey"
      :props="{ label: 'displayName', children: 'children', isLeaf: 'pickerIsLeaf' }"
      :load="loadPickerNode" lazy node-key="mrid" highlight-current
      style="max-height:350px;overflow-y:auto;border:1px solid #EBEEF5;border-radius:4px;padding:4px;"
      @node-click="data => importPickerTemp = data">
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
import WordTemplatePreview from './components/WordTemplatePreview.vue'

export default {
  name: 'ImportView',
  props: {
    importType: { type: String, default: 'excel' },
    managerMode: { type: Boolean, default: false },
    initialTemplateName: { type: String, default: '' },
  },
  watch: {
    importType: {
      immediate: true,
      handler: async function (newVal) {
        this.clearAllDialog()
        await this.loadTemplates()
      }
    }
  },
  components: { TemplateManager, DataTable, WordTemplatePreview },
  data() {
    return {
      templateList: [], selectedTemplateName: '', currentFilePath: '', tableData: [],
      managerSearch: '', managerAssetFilter: '', managerPreviewVisible: false,
      showAddDialog: false, addLoading: false,
      addForm: { name: '', filePath: '' },
      addRules: { name: [{ required: true, message: 'Please enter template name', trigger: 'blur' }] },
      showExportDialog: false, exportLoading: false,
      // Import
      showImportDialog: false,
      importStep: 1,
      importFilePath: '',
      importSelectedNode: null,
      importNodePickerVisible: false,
      importPickerTemp: null,
      importPreview: [],
      importResults: [],
      importLoading: false,
      importCachedCodeValueMap: null,
      importOverwrite: false,
      nameConflicts: [],   // node trùng tên với cây hiện có → user chọn per-node
      importDecisions: [],
      nodePickerVisible: false,
      pickerTempSelected: null,
      pickerTreeKey: 0,
      pickerOwnershipPromise: null,
      pickerOwnershipUserId: null,
      selectedItems: [],
      categoryOptions: CATEGORY_OPTION,
      FEATURE_TREE: FEATURE_TREE,
      assetTypeToKey: ASSET_TYPE_TO_KEY
    }
  },
  computed: {
    selectedTemplate() {
      return this.templateList.find(template => template.name === this.selectedTemplateName) || null
    },
    managerFileName() {
      return this.currentFilePath ? this.currentFilePath.split(/[\\/]/).pop() : ''
    },
    managerAssetOptions() {
      return [...new Set(this.templateList.map(this.managerAssetType))].sort((a, b) => a.localeCompare(b))
    },
    managerGroups() {
      const search = this.managerSearch.trim().toLocaleLowerCase()
      const groups = new Map()
      for (const template of this.templateList) {
        const label = this.managerAssetType(template)
        if (this.managerAssetFilter && label !== this.managerAssetFilter) continue
        if (search && !`${template.name} ${label}`.toLocaleLowerCase().includes(search)) continue
        if (!groups.has(label)) groups.set(label, [])
        groups.get(label).push(template)
      }
      return [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([label, templates]) => ({label, templates}))
    },
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
          const node = this.FEATURE_TREE.Asset?.children?.[assetType]
          result.push({ key, label: (node && node.label) || assetType, category: 'Asset', assetType })
        } else if (row.category === 'Job') {
          const jobType = row.featureLevels && row.featureLevels[0] ? row.featureLevels[0].key : null
          if (!jobType) continue
          const key = 'Job_' + jobType
          if (seen.has(key)) continue
          seen.add(key)
          const node = this.FEATURE_TREE.Job?.children?.[jobType]
          result.push({ key, label: (node && node.label) || jobType, category: 'Job', assetType: jobType })
        } else {
          if (seen.has(row.category)) continue
          seen.add(row.category)
          const opt = this.categoryOptions.find(c => c.value === row.category)
          result.push({ key: row.category, label: (opt && opt.label) || row.category, category: row.category, assetType: null })
        }
      }
      return result
    }
  },
  async mounted() { await this.loadTemplates() },
  methods: {
    managerAssetType(template) {
      const row = (template?.variable || []).find(item => item.category === 'Asset' && item.featureLevels?.[0]?.key)
      const key = row?.featureLevels?.[0]?.key
      return (key && this.FEATURE_TREE.Asset?.children?.[key]?.label) || 'Other templates'
    },
    selectManagerTemplate(name) {
      this.selectedTemplateName = name
      this.onTemplateChange(name)
    },
    managerFieldOptions(category) {
      const children = this.FEATURE_TREE[category]?.children || {}
      const toOptions = branches => Object.entries(branches).map(([value, node]) => ({
        value,
        label: node.label || value,
        ...(node.children && Object.keys(node.children).length ? {children: toOptions(node.children)} : {})
      }))
      return toOptions(children)
    },
    setManagerFieldPath(row, path) {
      row.featureLevels = path.map(key => ({key}))
    },
    async downloadCurrentTemplate() {
      if (!this.currentFilePath) return
      const result = await window.electronAPI.downloadWordTemplate(this.currentFilePath)
      if (!result?.success && !result?.canceled) this.$message.error(result?.message || 'Cannot download template')
    },
    // ── Templates ─────────────────────────────────────────────────────────
    async loadTemplates() {
      try {
        const rs = await window.electronAPI.getAllTemplatesByType(this.importType, 'import')
        if (rs?.success) {
          this.templateList = rs.data.map(t => ({ ...t, variable: t.variable ? JSON.parse(t.variable) : [] }))
          if (this.managerMode && this.initialTemplateName && !this.selectedTemplateName && this.templateList.some(t => t.name === this.initialTemplateName)) {
            this.selectManagerTemplate(this.initialTemplateName)
          }
          if (this.importType === 'word' && !this.selectedTemplateName) {
            const defaultTemplate = this.templateList.find(t => t.name === 'SBM - BB kiểm định máy cắt trung thế (VCB)')
            if (defaultTemplate) {
              this.selectedTemplateName = defaultTemplate.name
              this.onTemplateChange(defaultTemplate.name)
            }
          }
        }
      } catch(e) { console.error(e) }
    },
    onTemplateChange(name) {
      if (!name) { this.currentFilePath = ''; this.tableData = []; return }
      const tmpl = this.templateList.find(t => t.name === name)
      if (!tmpl) return
      this.currentFilePath = tmpl.path || ''
      this.tableData = (tmpl.variable || []).map(v => ({
        code: v.code||'', category: v.category||'',
        featureLevels: (v.featureLevels||[]).map(f => ({ key: f.key||'' })),
        includeUnit: v.includeUnit === true,
        format: v.format || '',
        summaryOnly: v.summaryOnly === true,
        coordinates: v.coordinates||[]
      }))
    },
    openAddTemplateDialog() { this.resetAddDialog(); this.showAddDialog = true },
    resetAddDialog() { this.addForm = { name: '', filePath: '' }; this.addLoading = false },
    async uploadTemplateForNew() {
      if (!this.addForm.name) { this.$message.warning('Please enter template name first'); return }
      try {
        let rs
        if (this.importType === 'word') rs = await window.electronAPI.uploadWordTemplate(this.addForm.name)
        else                            rs = await window.electronAPI.uploadExcelTemplate(this.addForm.name)
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
          const rs = await window.electronAPI.insertTemplate({
            name: this.addForm.name, path: this.addForm.filePath||'',
            variable: JSON.stringify([]), type: this.importType||'', category: 'import'
          })
          if (rs?.success) {
            this.$message.success(`Created "${this.addForm.name}"`); this.showAddDialog = false
            await this.loadTemplates()
            this.selectedTemplateName = this.addForm.name
            this.currentFilePath = this.addForm.filePath||''
            this.tableData = []
          } else this.$message.error('Create failed')
        } catch(e) { this.$message.error(e.message) } finally { this.addLoading = false }
      })
    },

    // ── Upload template file ───────────────────────────────────────────────
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
      if (!this.selectedTemplateName || !this.currentFilePath) {
        this.$message.warning('Please upload a Template file first'); return
      }
      const variables = this.tableData.map(r => ({
        code: r.code, category: r.category,
        featureLevels: r.featureLevels, includeUnit: r.includeUnit === true, format: r.format || '', summaryOnly: r.summaryOnly === true,
        coordinates: r.coordinates||[]
      }))
      try {
        const rs = await window.electronAPI.saveTemplateWithScan({
          name: this.selectedTemplateName, filePath: this.currentFilePath,
          variables, type: this.importType, category: 'import'
        })
        if (rs?.success) {
          this.$message.success('Saved')
          await this.loadTemplates()
          this.onTemplateChange(this.selectedTemplateName)
        } else this.$message.error('Save failed')
      } catch(e) { this.$message.error(e.message) }
    },
    async handleDelete() {
      try { await this.$confirm(`Delete template "${this.selectedTemplateName}"?`, 'Warning', { type: 'warning', confirmButtonText: 'Delete', cancelButtonText: 'Cancel' }) } catch { return }
      try {
        const rs = await window.electronAPI.deleteTemplate(this.selectedTemplateName)
        if (rs?.success) {
          this.$message.success('Deleted')
          this.selectedTemplateName=''; this.currentFilePath=''; this.tableData=[]
          await this.loadTemplates()
        }
      } catch(e) { this.$message.error(e.message) }
    },
    async handleImportJson() {
      try {
        const rs = await window.electronAPI.importJSON()
        if (!rs?.success || !rs.data) return
        const variables = Array.isArray(rs.data) ? rs.data[0] : rs.data
        if (!Array.isArray(variables)) { this.$message.error('Invalid template config file'); return }
        this.tableData = variables.map(v => ({
          code: v.code||'', category: v.category||'',
          featureLevels: (v.featureLevels||[]).map(f => ({ key: f.key||'' })),
          includeUnit: v.includeUnit === true,
          format: v.format || '',
          summaryOnly: v.summaryOnly === true,
          coordinates: v.coordinates||[]
        }))
        this.$message.success('Imported')
      } catch(e) { this.$message.error(e.message) }
    },

    async handleExportJson() {
      try {
        const variables = this.tableData.map(v => ({
          code: v.code||'', category: v.category||'',
          featureLevels: (v.featureLevels||[]).map(f => ({ key: f.key||'' })),
          includeUnit: v.includeUnit === true,
          format: v.format || '',
          summaryOnly: v.summaryOnly === true,
          coordinates: v.coordinates||[]
        }))
        const defaultFileName = (this.selectedTemplateName || 'template') + '-config.json'
        const rs = await window.electronAPI.exportJSON([variables], { defaultFileName, title: 'Save template config as JSON' })
        if (rs?.success) this.$message.success('Exported: ' + rs.filePath)
        else if (rs?.message !== 'Export cancelled') this.$message.error(rs?.message || 'Export failed')
      } catch(e) { this.$message.error(e.message) }
    },

    // ── Import Excel / Word ────────────────────────────────────────────────
    handleImportExcel() { this.resetImportDialog(); this.showImportDialog = true },
    handleImportWord()  { this.resetImportDialog(); this.showImportDialog = true },

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
      this.nameConflicts = []
      this.importDecisions = []
    },

    // Browse file — dùng đúng API theo importType
    async pickImportFile() {
      let rs
      if (this.importType === 'word') rs = await window.electronAPI.pickWordFileForImport()
      else                            rs = await window.electronAPI.pickExcelFileForImport()
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

    openImportNodePicker() {
      this.refreshImportPickerTree()
      this.importNodePickerVisible = true
    },

    refreshImportPickerTree() {
      this.importPickerTemp = null
      this.pickerOwnershipPromise = null
      this.pickerTreeKey++
    },

    // Step 1 → Step 2: đọc file + build preview
    async runImportPreview() {
      if (!this.importFilePath) return
      this.importLoading = true
      try {
        const tmpl = this.templateList.find(t => t.name === this.selectedTemplateName)
        const variables = tmpl ? (tmpl.variable || []) : []

        // ── Đọc file theo type ──────────────────────────────────────────
        let rs
        if (this.importType === 'word') {
          rs = await window.electronAPI.readWordForImport({
            filePath:     this.importFilePath,
            templatePath: this.currentFilePath,
            variables
          })
        } else {
          rs = await window.electronAPI.readExcelForImport({
            filePath:     this.importFilePath,
            templatePath: this.currentFilePath,
            variables
          })
        }

        if (!rs || !rs.success) {
          this.$message.error(rs?.message || 'Failed to read file'); return
        }
        this.importCachedCodeValueMap = rs.codeValueMap

        // ── Build allLevelData + preview ────────────────────────────────
        const allLevelData = deepImportService.buildAllLevelData(rs.codeValueMap, this.tableData)
        const selectedMode = this.importSelectedNode ? this.importSelectedNode.mode : null
        const levelsToProcess = deepImportService.getLevelsToProcess(selectedMode, allLevelData)

        const preview = []
        for (const lv of levelsToProcess) {
          const data = allLevelData[lv.catKey] || {}
          const hasData = Object.keys(data).length > 0
          const keyValue = hasData ? data[lv.reqField] : null
          const isJobWithTests = lv.id === 'job' && !keyValue && hasData
          const otherFields = hasData
            ? Object.keys(data).filter(k => k !== lv.reqField).slice(0, 5).join(', ')
            : ''
          preview.push({
            catKey: lv.catKey, label: lv.label, hasData,
            keyValue, isJobWithTests,
            otherFieldsSummary: otherFields || (hasData ? '...' : '')
          })
        }
        this.importPreview = preview

        // ── Phân tích decisions cần hỏi user ───────────────────────────
        const rawDecisions = deepImportService.analyzeDecisionsNeeded(allLevelData, levelsToProcess)
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

        // ── Quét node TRÙNG TÊN với cây hiện có → hỏi user quyết định per-node ──
        try {
          this.nameConflicts = await deepImportService.scanNameConflicts(
            this.importCachedCodeValueMap,
            this.tableData,
            this.importSelectedNode,
            this.$store.state.user.user_id
          )
        } catch (e) {
          console.error('scanNameConflicts error:', e)
          this.nameConflicts = []
        }

        this.importStep = 2
      } catch(e) {
        this.$message.error('Preview error: ' + e.message)
        console.error('runImportPreview error:', e)
      } finally { this.importLoading = false }
    },

    // Step 2 → Step 3: chạy import thật
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
          this.$store.state.user.user_id,
          this.nameConflicts
        )
        this.importResults = rs.results || []
        this.importStep = 3
        const ok   = this.importResults.filter(r => r.success && !r.skipped).length
        const fail = this.importResults.filter(r => !r.success && !r.skipped).length
        if (fail === 0) this.$message.success(ok + ' level' + (ok !== 1 ? 's' : '') + ' imported successfully')
        else            this.$message.warning(ok + ' OK, ' + fail + ' failed')
        // Báo component cha reload CÂY TÀI SẢN (node mới import phải hiện ngay,
        // không cần user chuột phải → Refresh). Sửa TES-161/163.
        if (ok > 0) this.$emit('imported')
      } catch(e) {
        this.$message.error('Import error: ' + e.message)
        console.error('confirmImport error:', e)
      } finally { this.importLoading = false }
    },

    openTemplateFile() {
      if (!this.currentFilePath) return
      window.electronAPI.openFileTemplate(this.currentFilePath).then(err => {
        if (err) this.$message.error('Cannot open file: ' + err)
      })
    },

    // ── Export (giữ nguyên) ────────────────────────────────────────────────
    handleExport() {
      this.selectedNode = null; this.selectedNodeLabel = ''; this.selectedNodeContext = {}; this.pickerTempSelected = null
      this.showExportDialog = true
    },
    async doExport() {
      if (this.selectedItems.length === 0) { this.$message.warning('Please add at least one asset or job'); return }
      this.exportLoading = true
      try {
        const tmpl = this.templateList.find(t => t.name === this.selectedTemplateName)
        const variables = tmpl ? (tmpl.variable || []) : []
        const codeMap = {}
        for (const cat of this.exportCategories) {
          const matchingItems = this.getMatchingItems(cat)
          if (cat.key.startsWith('Asset_') || cat.key.startsWith('Job_')) {
            for (const item of matchingItems) {
              const { flatMap, arrayMap, unitMap } = await exportService.buildDtoForCat(cat, item.context)
              const partial = exportService.extractFromMaps(cat, flatMap, arrayMap, this.tableData, unitMap)
              for (const code in partial) {
                if (!codeMap[code]) codeMap[code] = []
                const vals = partial[code]
                codeMap[code].push.apply(codeMap[code], Array.isArray(vals) ? vals : [vals])
              }
            }
          } else {
            const firstItem = matchingItems[0]; if (!firstItem) continue
            const { flatMap, arrayMap, unitMap } = await exportService.buildDtoForCat(cat, firstItem.context)
            const partial = exportService.extractFromMaps(cat, flatMap, arrayMap, this.tableData, unitMap)
            for (const code in partial) { if (!codeMap[code]) codeMap[code] = partial[code] }
          }
        }
        if (this.importType === 'word') {
          const rs = await window.electronAPI.exportWordWithData({ templatePath: this.currentFilePath, variables, codeMap })
          if (rs.canceled) return
          if (rs.success) { this.showExportDialog = false; this.$message.success('Word Exported: ' + rs.filePath) }
          else this.$message.error(rs.message || 'Word Export failed')
        } else {
          const rs = await window.electronAPI.exportTemplateWithData({ templatePath: this.currentFilePath, variables, codeMap })
          if (rs.canceled) return
          if (rs.success) { this.showExportDialog = false; this.$message.success('Exported: ' + rs.filePath) }
          else this.$message.error(rs.message || 'Export failed')
        }
      } catch(e) { this.$message.error('Export error: ' + e.message) }
      finally { this.exportLoading = false }
    },

    // ── Node picker helpers ────────────────────────────────────────────────
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
      ctx[node.mode] = { mrid: node.mrid, name: node.displayName, ...(node.assetType && { assetType: node.assetType }) }
      return ctx
    },
    sanitizeSheetName(name) { return (name || 'Sheet').replace(/[\[\]\*\?\:\/\\]/g, '_').substring(0, 31) },
    uniqueSheetName(base) {
      const existing = this.selectedItems.map(i => i.sheetName)
      let name = this.sanitizeSheetName(base), counter = 2
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
      this.pickerOwnershipPromise = null
      this.pickerTreeKey++
    },
    async getPickerOwnedIds() {
      const userId = this.$store?.state?.user?.user_id
      if (!userId) throw new Error('Sign in to view your Organisation tree')
      if (!this.pickerOwnershipPromise || this.pickerOwnershipUserId !== userId) {
        this.pickerOwnershipUserId = userId
        this.pickerOwnershipPromise = window.electronAPI.getIdentifiedObjectIdsByUser(userId)
          .then(rs => {
            if (!rs?.success || !Array.isArray(rs.data)) {
              throw new Error(rs?.message || 'Cannot load your Organisation access')
            }
            return new Set(rs.data)
          })
      }
      return this.pickerOwnershipPromise
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
      const sheetName = this.uniqueSheetName(node.displayName || 'Sheet')
      this.selectedItems.push({
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        label, sheetName, context: ctx
      })
      this.pickerTempSelected = null
      this.$message.success('Added: ' + label.split(' / ').pop())
    },
    removeSelectedItem(id) { this.selectedItems = this.selectedItems.filter(item => item.id !== id) },
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
        const ownedIds = await this.getPickerOwnedIds()
        resolve(rows.filter(row => row.mode === 'job' || ownedIds.has(row.mrid)))
      } catch(e) {
        console.error('loadPickerNode error:', e)
        this.$message.error(e.message || 'Cannot load Organisation tree')
        resolve([])
      }
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
    onPickerNodeClick(data) { this.pickerTempSelected = data },
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
        const ctx = item.context; const catKey = cat.key
        if (catKey === 'OrgEntityToOrgDto')  return !!ctx.organisation
        if (catKey === 'SubstationDto')       return !!ctx.substation
        if (catKey === 'VoltageLevelDto')     return !!ctx.voltageLevel
        if (catKey === 'Bay')                 return !!ctx.bay
        if (catKey.startsWith('Asset_')) {
          if (!ctx.asset) return false
          return this.assetTypeToKey[ctx.asset.assetType] === catKey
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

    // ── Table helpers ─────────────────────────────────────────────────────
    clearAll() { this.tableData = [] },
    addRow(index) {
      const r = { code: '', category: '', featureLevels: [], includeUnit: false, coordinates: [] }
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
      this.resetAddDialog(); this.clearAll()
      this.selectedTemplateName = ''; this.currentFilePath = ''
    }
  }
}
</script>

<style scoped>
.word-template-manager {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  color: #243247;
  font-size: 13px;
}
.word-manager-sidebar {
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 12px;
  padding: 16px;
  border-right: 1px solid #dce3ec;
  background: #f7f9fc;
}
.word-manager-sidebar-tools {
  display: flex;
  gap: 8px;
}
.word-manager-sidebar-tools .el-button:first-child { flex: 1; }
.word-manager-sidebar-tools .el-button + .el-button { margin-left: 0; }
.word-manager-filter { width: 100%; }
.word-manager-template-list {
  min-height: 0;
  overflow-y: auto;
  margin: 0 -16px;
  padding: 0 8px 8px;
}
.word-manager-group { margin: 0 0 16px; }
.word-manager-group h3 {
  margin: 10px 8px 6px;
  color: #66758a;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.word-manager-template {
  display: block;
  width: 100%;
  border: 0;
  border-left: 3px solid transparent;
  border-radius: 4px;
  padding: 10px 12px;
  background: transparent;
  color: #243247;
  text-align: left;
  cursor: pointer;
}
.word-manager-template:hover { background: #edf2fa; }
.word-manager-template.active {
  border-left-color: #093397;
  background: #fff;
  box-shadow: 0 1px 5px #172c4d14;
}
.word-manager-template strong,
.word-manager-template small { display: block; }
.word-manager-template strong { line-height: 1.35; overflow-wrap: anywhere; }
.word-manager-template small { margin-top: 4px; color: #6e7b8c; }
.word-manager-detail {
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  background: #fff;
}
.word-manager-detail-scroll {
  min-height: 0;
  overflow-y: auto;
  padding: 22px 26px;
  flex: 1;
}
.word-manager-title-row,
.word-manager-mapping-head,
.word-manager-file,
.word-manager-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.word-manager-title-row { margin-bottom: 26px; align-items: flex-start; }
.word-manager-title-row h2 { margin: 4px 0 0; font-size: 20px; line-height: 1.35; overflow-wrap: anywhere; }
.word-manager-eyebrow { color: #60728c; font-size: 12px; }
.word-manager-section-title { margin-bottom: 10px; font-size: 13px; font-weight: 700; color: #465a75; }
.word-manager-file {
  justify-content: flex-start;
  flex-wrap: wrap;
  min-height: 70px;
  border: 1px solid #dce3ec;
  border-radius: 5px;
  padding: 10px 14px;
  margin-bottom: 28px;
}
.word-manager-file-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 4px;
  background: #2b579a;
  color: white;
  font-weight: 800;
  font-size: 18px;
}
.word-manager-file > span { flex: 1; min-width: 140px; font-weight: 600; overflow-wrap: anywhere; }
.word-manager-file .el-button + .el-button { margin-left: 0; }
.word-manager-mapping-head { margin-bottom: 10px; }
.word-manager-mapping-head .word-manager-section-title { margin: 0; }
.word-manager-table-scroll { max-width: 100%; overflow-x: auto; border: 1px solid #dce3ec; border-radius: 4px; }
.word-manager-table { width: 100%; min-width: 760px; border-collapse: collapse; table-layout: fixed; }
.word-manager-table th { padding: 12px 10px; background: #f5f7fa; color: #566479; text-align: left; font-weight: 700; }
.word-manager-table th:nth-child(1) { width: 78px; }
.word-manager-table th:nth-child(2) { width: 125px; }
.word-manager-table th:nth-child(4) { width: 165px; }
.word-manager-table th:nth-child(5) { width: 55px; text-align: center; }
.word-manager-table th:nth-child(6) { width: 42px; }
.word-manager-table td { border-top: 1px solid #e4e9f0; padding: 8px 10px; vertical-align: middle; }
.word-manager-table .el-select,
.word-manager-table .el-cascader { width: 100%; }
.word-manager-table td:nth-child(5) { text-align: center; }
.word-manager-coordinates span { display: inline-block; margin: 2px 3px 2px 0; color: #53657d; font-size: 11px; overflow-wrap: anywhere; }
.word-manager-delete-row { color: #d23549; }
.word-manager-empty { padding: 22px; text-align: center; color: #748299; }
.word-manager-placeholder { margin: auto; color: #748299; }
.word-manager-footer { flex-wrap: wrap; border-top: 1px solid #dce3ec; padding: 12px 18px; background: #fff; }
.word-manager-footer > div { display: flex; flex-wrap: wrap; gap: 7px; }
.word-manager-footer .el-button + .el-button { margin-left: 0; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
@media (max-width: 760px) {
  .word-template-manager { grid-template-columns: 1fr; grid-template-rows: 220px minmax(0, 1fr); }
  .word-manager-sidebar { border-right: 0; border-bottom: 1px solid #dce3ec; }
  .word-manager-detail-scroll { padding: 16px; }
}
</style>

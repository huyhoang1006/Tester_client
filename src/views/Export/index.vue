<template>
<div>
  <div class="export-view">
    <el-select v-model="selectedTemplateName" placeholder="Select template" size="mini"
      style="min-width:200px;" clearable @change="onTemplateChange">
      <el-option v-for="t in templateList" :key="t.name" :label="t.name" :value="t.name" />
    </el-select>
    <el-button type="primary" size="mini" @click="openAddTemplateDialog"><i class="fa-solid fa-plus"></i> Add Template</el-button>
    <el-button type="primary"  size="mini" :disabled="!selectedTemplateName" @click="addRow()">Add Row</el-button>
    <el-button type="success"  size="mini" :disabled="!selectedTemplateName" @click="handleUploadExcel">Excel File</el-button>
    <el-button type="danger"   size="mini" :disabled="!selectedTemplateName" @click="handleDelete">Delete</el-button>
    <el-button type="warning"  size="mini" :disabled="!selectedTemplateName" @click="handleSave">Save</el-button>
    <el-button type="info"     size="mini" :disabled="!selectedTemplateName" @click="handleImportJson">Import</el-button>
    <el-button type="primary"  size="mini" :disabled="!selectedTemplateName || !currentFilePath" @click="handleExport">Export</el-button>
    <el-button size="mini" @click="loadTemplates"><i class="fa-solid fa-rotate"></i></el-button>
  </div>
  <div v-if="currentFilePath" style="margin:4px 0 8px;font-size:12px;color:#909399;">
    <i class="fa-solid fa-file-excel" style="color:#67C23A;"></i> {{ currentFilePath.split(/[\\\/]/).pop() }}
  </div>
  <div>
    <template v-if="selectedTemplateName">
      <div style="border:1px solid #EBEEF5;border-radius:4px;overflow:hidden;margin-top:10px;">
      <table cellpadding="8" width="100%" style="border-collapse:collapse;table-layout:fixed;">
        <thead><tr>
          <th style="width:130px;">Code</th>
          <th style="width:140px;">Category</th>
          <th>Feature</th>
          <th style="width:190px;">Coordinates</th>
          <th style="width:50px;"><el-button @click="addRow()" size="mini" type="primary"><i class="fa-solid fa-plus"></i></el-button></th>
          <th style="width:50px;"><el-button @click="clearAll" size="mini" type="danger"><i class="fa-solid fa-trash"></i></el-button></th>
        </tr></thead>
        <tbody>
          <tr v-for="(row, index) in tableData" :key="index"
            :style="{ background: index % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid #EBEEF5' }">
            <td><el-input v-model="row.code" placeholder="e.g. A1" size="mini" /></td>
            <td>
              <el-select v-model="row.category" size="mini" style="width:100%" @change="() => { row.featureLevels = [{}] }">
                <el-option v-for="c in categoryOptions" :key="c.value" :label="c.label" :value="c.value" />
              </el-select>
            </td>
            <td>
              <div v-for="(level, li) in row.featureLevels" :key="index + '-' + li" style="margin-bottom:4px;">
                <el-select v-model="level.key" size="mini" style="width:100%" placeholder="Select feature"
                  @change="onFeatureLevelChange(row, li)">
                  <el-option v-for="opt in getFeatureOptionsByLevel(row, li)" :key="opt.key" :label="opt.label" :value="opt.key" />
                </el-select>
              </div>
            </td>
            <td>
              <template v-if="row.coordinates && row.coordinates.length">
                <el-tag v-for="coord in row.coordinates" :key="coord" size="mini" type="info" style="margin:2px;font-size:11px;">{{ coord }}</el-tag>
              </template>
              <span v-else style="color:#C0C4CC;font-size:11px;">not found</span>
            </td>
            <td><el-button @click="addRow(index)" type="primary" size="mini" style="width:100%"><i class="fa-solid fa-plus"></i></el-button></td>
            <td><el-button @click="removeRow(index)" type="danger" size="mini" style="width:100%"><i class="fa-solid fa-trash"></i></el-button></td>
          </tr>
        </tbody>
      </table>
      </div>
    </template>
    <div v-else style="padding:30px;text-align:center;color:#C0C4CC;font-size:13px;">
      Select a template or click <b>Add Template</b> to get started
    </div>
  </div>

  <el-dialog title="Add new template" :visible.sync="showAddDialog" width="420px" append-to-body @close="resetAddDialog">
    <el-form ref="addForm" :model="addForm" :rules="addRules" size="small" label-width="120px" label-position="left">
      <el-form-item label="Template name" prop="name"><el-input v-model="addForm.name" placeholder="e.g. EVN Report" clearable /></el-form-item>
      <el-form-item label="Excel file">
        <div style="display:flex;align-items:center;gap:8px;">
          <el-input v-model="addForm.filePath" placeholder="No file selected" readonly size="small" style="flex:1;" />
          <el-button size="small" type="success" @click="uploadExcelForNew"><i class="fa-solid fa-upload"></i> Upload</el-button>
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
      <!-- Node picker -->
      <div style="margin-bottom:12px;">
        <div style="font-size:12px;color:#909399;margin-bottom:6px;">Select a node to export data:</div>
        <el-button size="small" icon="el-icon-share" @click="nodePickerVisible = true">
          {{ selectedNodeLabel || 'Select node from tree...' }}
        </el-button>
        <el-button v-if="selectedNodeLabel" size="small" icon="el-icon-close" circle @click="clearSelectedNode" />
      </div>
      <div v-if="selectedNodeLabel" style="font-size:11px;color:#67C23A;padding:4px 8px;background:#f0f9eb;border-radius:4px;">
        <i class="el-icon-check"></i> {{ selectedNodeLabel }}
      </div>
      <div v-else style="font-size:11px;color:#E6A23C;padding:4px 8px;background:#fdf6ec;border-radius:4px;">
        <i class="el-icon-warning-outline"></i> No node selected — categories without a match will be skipped
      </div>
    </div>
    <div slot="footer">
      <el-button size="small" @click="showExportDialog = false">Cancel</el-button>
      <el-button size="small" type="primary" :loading="exportLoading" @click="doExport">Export</el-button>
    </div>
  </el-dialog>

  <!-- ── Tree Node Picker Dialog ──────────────────────────────── -->
  <el-dialog title="Select Node" :visible.sync="nodePickerVisible" width="540px" :append-to-body="true">
    <div style="margin-bottom:8px;font-size:12px;color:#909399;">
      Navigate the tree: Organisation → Substation → VoltageLevel → Bay → Asset → Job
    </div>
    <el-tree
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
    <span slot="footer">
      <el-button size="small" @click="nodePickerVisible = false">Cancel</el-button>
      <el-button size="small" type="primary" :disabled="!pickerTempSelected" @click="confirmPickerSelection">Confirm</el-button>
    </span>
  </el-dialog>

</div>
</template>

<script>
/* eslint-disable */
import { OrgEntityToOrgDto }                       from '@/views/Mapping/Organisation/index.js'
import { mapEntityToDto as substationEntityToDto }  from '@/views/Mapping/Substation/index.js'
import { volEntityToVolDto }                        from '@/views/Mapping/VoltageLevel/index.js'
import { transformerEntityToDto }                   from '@/views/Mapping/Transformer/index.js'
import { voltageTransformerEntityToDto }            from '@/views/Mapping/VoltageTransformer/index.js'
import { currentTransformerEntityToDto }            from '@/views/Mapping/CurrentTransformer/index.js'
import { breakerEntityToDto }                       from '@/views/Mapping/Breaker/index.js'
import { powerCableEntityToDto }                    from '@/views/Mapping/PowerCable/index.js'
import { surgeArresterEntityToDto }                 from '@/views/Mapping/SurgeArrester/index.js'
import { mapEntityToDto as reactorEntityToDto }     from '@/views/Mapping/Reactor/index.js'
import { mapEntityToDto as rotatingEntityToDto }    from '@/views/Mapping/RotatingMachine/index.js'
import { disconnectorEntityToDto }                  from '@/views/Mapping/Disconnector/index.js'
import { capacitorEntityToDto }                     from '@/views/Mapping/Capacitor/index.js'
import { bushingEntityToDto }                       from '@/views/Mapping/Bushing/index.js'

const v = (obj) => (obj && obj.value !== undefined) ? String(obj.value ?? '') : String(obj ?? '')

export default {
  name: 'ExportView',
  props: { exportType: { type: String, default: 'excel' } },
  data() {
    return {
      templateList: [], selectedTemplateName: '', currentFilePath: '', tableData: [],
      showAddDialog: false, addLoading: false,
      addForm: { name: '', filePath: '' },
      addRules: { name: [{ required: true, message: 'Please enter template name', trigger: 'blur' }] },
      showExportDialog: false, exportLoading: false,
      // Asset type → category key mapping
      assetTypeToKey: {
        'Transformer': 'Asset_TransformerDataDto',
        'Voltage transformer': 'Asset_VoltageTransformerDto',
        'Current transformer': 'Asset_CurrentTransformerDto',
        'Circuit breaker': 'Asset_CircuitBreakerDto',
        'Power cable': 'Asset_PowerCableDTO',
        'Surge arrester': 'Asset_SurgeArresterDto',
        'Reactor': 'Asset_ReactorDto',
        'Bushing': 'Asset_BushingAssetDto',
        'Capacitor': 'Asset_CapacitorsDTO',
        'Disconnector': 'Asset_DisconnectorDTO',
        'Rotating machine': 'Asset_RotatingMachineDTO',
      },
      // Node picker (tree-based)
      nodePickerVisible: false,
      pickerTempSelected: null,     // node đang hover/click trong picker
      selectedNode: null,           // node đã confirm
      selectedNodeLabel: '',        // label hiển thị
      selectedNodeContext: {},      // { organisation, substation, voltageLevel, bay, asset, job }
      categoryOptions: [
        { label: 'Organisation',  value: 'OrgEntityToOrgDto' },
        { label: 'Substation',    value: 'SubstationDto' },
        { label: 'Voltage level', value: 'VoltageLevelDto' },
        { label: 'Bay',           value: 'Bay' },
        { label: 'Asset',         value: 'Asset' },
        { label: 'Job',           value: 'Job' }
      ],
      FEATURE_TREE: {
        OrgEntityToOrgDto: { label: 'Organisation', children: {
          name:              { label: 'Name',             value: 'name' },
          aliasName:         { label: 'Alias name',       value: 'aliasName' },
          tax_code:          { label: 'Tax code',         value: 'tax_code' },
          street:            { label: 'Street',           value: 'street' },
          ward_or_commune:   { label: 'Ward/Commune',     value: 'ward_or_commune' },
          district_or_town:  { label: 'District/Town',    value: 'district_or_town' },
          city:              { label: 'City',             value: 'city' },
          state_or_province: { label: 'State/Province',   value: 'state_or_province' },
          postal_code:       { label: 'Postal code',      value: 'postal_code' },
          country:           { label: 'Country',          value: 'country' },
          phoneNumber:       { label: 'Phone number',     value: 'phoneNumber' },
          fax:               { label: 'Fax',              value: 'fax' },
          email:             { label: 'Email',            value: 'email' },
          comment:           { label: 'Comment',          value: 'comment' },
          positionPoints:    { label: 'Geo position', children: {
            x: { label: 'Position X', value: 'pos_x' },
            y: { label: 'Position Y', value: 'pos_y' },
            z: { label: 'Position Z', value: 'pos_z' }
          }}
        }},
        SubstationDto: { label: 'Substation', children: {
          name: { label: 'Name', value: 'name' }, aliasName: { label: 'Alias name', value: 'aliasName' },
          type: { label: 'Type', value: 'type' }, generation: { label: 'Generation', value: 'generation' },
          industry: { label: 'Industry', value: 'industry' }, locationName: { label: 'Location name', value: 'locationName' },
          street: { label: 'Street', value: 'street' }, ward_or_commune: { label: 'Ward/Commune', value: 'ward_or_commune' },
          district_or_town: { label: 'District/Town', value: 'district_or_town' },
          state_or_province: { label: 'State/Province', value: 'state_or_province' },
          city: { label: 'City', value: 'city' }, country: { label: 'Country', value: 'country' },
          personName: { label: 'Contact name', value: 'personName' }, department: { label: 'Department', value: 'department' },
          position: { label: 'Position', value: 'position' }, phoneNumber: { label: 'Phone number', value: 'phoneNumber' },
          fax: { label: 'Fax', value: 'fax' }, email: { label: 'Email', value: 'email' }, comment: { label: 'Comment', value: 'comment' }
        }},
        VoltageLevelDto: { label: 'Voltage Level', children: {
          name: { label: 'Name', value: 'name' }, comment: { label: 'Comment', value: 'comment' },
          high_voltage_limit_value: { label: 'High voltage limit', value: 'high_voltage_limit_value' },
          low_voltage_limit_value:  { label: 'Low voltage limit',  value: 'low_voltage_limit_value' },
          base_voltage_value:       { label: 'Base voltage',       value: 'base_voltage_value' }
        }},
        Bay: { label: 'Bay', children: {
          name: { label: 'Name', value: 'name' }, aliasName: { label: 'Alias name', value: 'aliasName' },
          breaker_configuration: { label: 'Breaker configuration', value: 'breaker_configuration' },
          bus_bar_configuration: { label: 'Bus Bar configuration', value: 'bus_bar_configuration' }
        }},
        Asset: { label: 'Asset', children: {
          TransformerDataDto: { label: 'Transformer', children: {
            PropertiesDto: { label: 'Properties', children: {
              type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
              manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
              manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' }, model: { label: 'Model', value: 'model' },
              country_of_origin: { label: 'Country of origin', value: 'country_of_origin' }, apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' },
              comment: { label: 'Comment', value: 'comment' }
            }},
            WindingConfigurationDto: { label: 'Winding Config', children: {
              phases: { label: 'Phases', value: 'phases' }, vector_group_custom: { label: 'Vector group (custom)', value: 'vector_group_custom' },
              unsupported_vector_group: { label: 'Vector group (unsupported)', value: 'unsupported_vector_group' },
              vector_group_data: { label: 'Vector group (computed)', value: 'vector_group_data' }
            }},
            RatingsDto: { label: 'Ratings', children: {
              rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' },
              short_circuit_ka: { label: 'Max SC current', value: 'short_circuit_ka' },
              short_circuit_s: { label: 'SC duration', value: 'short_circuit_s' },
              voltage_ratings: { label: 'Voltage ratings', children: {
                winding:            { label: 'Winding',                  value: 'vr_winding' },
                voltage_ll:         { label: 'Voltage L-L',              value: 'vr_voltage_ll' },
                voltage_ln:         { label: 'Voltage L-N',              value: 'vr_voltage_ln' },
                insul_level_ll:     { label: 'Insulation level (BIL)',   value: 'vr_insul_level_ll' },
                insulation_class:   { label: 'Insulation class',         value: 'vr_insulation_class' },
                voltage_regulation: { label: 'Voltage regulation',       value: 'vr_voltage_regulation' }
              }},
              power_ratings: { label: 'Power ratings', children: {
                rated_power:    { label: 'Rated power',       value: 'pr_rated_power' },
                cooling_class:  { label: 'Cooling class',     value: 'pr_cooling_class' },
                temp_rise_wind: { label: 'Temp. rise winding',value: 'pr_temp_rise_wind' }
              }},
              current_ratings: { label: 'Current ratings', children: {
                prim: { label: 'Current prim', value: 'cr_prim' },
                sec:  { label: 'Current sec',  value: 'cr_sec' },
                tert: { label: 'Current tert', value: 'cr_tert' }
              }}
            }},
            ImpedancesDto: { label: 'Impedances', children: {
              ref_temp: { label: 'Ref. temperature', value: 'ref_temp' },
              zsi_base_power: { label: 'Zero seq. base power', value: 'zsi_base_power' }, zsi_base_voltage: { label: 'Zero seq. base voltage', value: 'zsi_base_voltage' },
              zsi_zero: { label: 'Zero seq. Z0 (zero)', value: 'zsi_zero' }, zsi_prim: { label: 'Zero seq. Z0 (prim)', value: 'zsi_prim' }, zsi_sec: { label: 'Zero seq. Z0 (sec)', value: 'zsi_sec' },
              prim_sec: { label: 'SC impedance Prim-Sec', children: {
                uk:          { label: 'Impedance (uk%)', value: 'ps_uk' },
                base_power:  { label: 'Base power',     value: 'ps_base_power' },
                base_voltage:{ label: 'Base voltage',   value: 'ps_base_voltage' },
                load_losses: { label: 'Load losses (pk)',value: 'ps_load_losses' }
              }},
              prim_tert: { label: 'SC impedance Prim-Tert', children: {
                uk:          { label: 'Impedance (uk%)', value: 'pt_uk' },
                base_power:  { label: 'Base power',     value: 'pt_base_power' },
                base_voltage:{ label: 'Base voltage',   value: 'pt_base_voltage' },
                load_losses: { label: 'Load losses (pk)',value: 'pt_load_losses' }
              }},
              sec_tert: { label: 'SC impedance Sec-Tert', children: {
                uk:          { label: 'Impedance (uk%)', value: 'st_uk' },
                base_power:  { label: 'Base power',     value: 'st_base_power' },
                base_voltage:{ label: 'Base voltage',   value: 'st_base_voltage' },
                load_losses: { label: 'Load losses (pk)',value: 'st_load_losses' }
              }}
            }},
            OthersDto: { label: 'Others', children: {
              category: { label: 'Category', value: 'category' }, status: { label: 'Status', value: 'status' },
              tank_type: { label: 'Tank type', value: 'tank_type' }, insulation_medium: { label: 'Insulation medium', value: 'insulation_medium' },
              total_weight: { label: 'Total weight', value: 'total_weight' }, insulation_weight: { label: 'Insulation weight', value: 'insulation_weight' }, insulation_volume: { label: 'Insulation volume', value: 'insulation_volume' },
              winding: { label: 'Winding material', children: { prim: { label: 'Prim', value: 'winding_prim' }, sec: { label: 'Sec', value: 'winding_sec' }, tert: { label: 'Tert', value: 'winding_tert' } }}
            }},
            TapChangersDto: { label: 'Tap changer', children: {
              mode: { label: 'Mode', value: 'tap_mode' }, serial_no: { label: 'Serial no.', value: 'tap_serial_no' },
              manufacturer: { label: 'Manufacturer', value: 'tap_manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'tap_manufacturer_type' },
              winding: { label: 'Winding', value: 'tap_winding' }, tap_scheme: { label: 'Tap scheme', value: 'tap_scheme' }, no_of_taps: { label: 'Num of taps', value: 'no_of_taps' }
            }},
            BushingDto: { label: 'Bushing', children: {
              prim: { label: 'Primary bushings', children: {
                pos: { label: 'Position', value: 'bushing_prim_pos' },
                asset_type: { label: 'Asset type', value: 'bushing_prim_asset_type' },
                serial_no: { label: 'Serial no.', value: 'bushing_prim_serial_no' },
                manufacturer: { label: 'Manufacturer', value: 'bushing_prim_manufacturer' },
                manufacturer_type: { label: 'Manufacturer type', value: 'bushing_prim_manufacturer_type' },
                manufacturer_year: { label: 'Manufacturing year', value: 'bushing_prim_manufacturer_year' },
                insulation_level: { label: 'Insul. level (BIL)', value: 'bushing_prim_insulation_level' },
                voltage_l_ground: { label: 'Voltage L-ground', value: 'bushing_prim_voltage_l_ground' },
                max_system_voltage: { label: 'Max system voltage', value: 'bushing_prim_max_system_voltage' },
                rate_current: { label: 'Rated current', value: 'bushing_prim_rate_current' },
                df_c1: { label: 'DF (C1)', value: 'bushing_prim_df_c1' },
                cap_c1: { label: 'Cap. (C1)', value: 'bushing_prim_cap_c1' },
                df_c2: { label: 'DF (C2)', value: 'bushing_prim_df_c2' },
                cap_c2: { label: 'Cap. (C2)', value: 'bushing_prim_cap_c2' },
                insulation_type: { label: 'Insulation type', value: 'bushing_prim_insulation_type' }
              }},
              sec: { label: 'Secondary bushings', children: {
                pos: { label: 'Position', value: 'bushing_sec_pos' },
                asset_type: { label: 'Asset type', value: 'bushing_sec_asset_type' },
                serial_no: { label: 'Serial no.', value: 'bushing_sec_serial_no' },
                manufacturer: { label: 'Manufacturer', value: 'bushing_sec_manufacturer' },
                manufacturer_type: { label: 'Manufacturer type', value: 'bushing_sec_manufacturer_type' },
                manufacturer_year: { label: 'Manufacturing year', value: 'bushing_sec_manufacturer_year' },
                insulation_level: { label: 'Insul. level (BIL)', value: 'bushing_sec_insulation_level' },
                voltage_l_ground: { label: 'Voltage L-ground', value: 'bushing_sec_voltage_l_ground' },
                max_system_voltage: { label: 'Max system voltage', value: 'bushing_sec_max_system_voltage' },
                rate_current: { label: 'Rated current', value: 'bushing_sec_rate_current' },
                df_c1: { label: 'DF (C1)', value: 'bushing_sec_df_c1' },
                cap_c1: { label: 'Cap. (C1)', value: 'bushing_sec_cap_c1' },
                df_c2: { label: 'DF (C2)', value: 'bushing_sec_df_c2' },
                cap_c2: { label: 'Cap. (C2)', value: 'bushing_sec_cap_c2' },
                insulation_type: { label: 'Insulation type', value: 'bushing_sec_insulation_type' }
              }},
              tert: { label: 'Tertiary bushings', children: {
                pos: { label: 'Position', value: 'bushing_tert_pos' },
                asset_type: { label: 'Asset type', value: 'bushing_tert_asset_type' },
                serial_no: { label: 'Serial no.', value: 'bushing_tert_serial_no' },
                manufacturer: { label: 'Manufacturer', value: 'bushing_tert_manufacturer' },
                manufacturer_type: { label: 'Manufacturer type', value: 'bushing_tert_manufacturer_type' },
                manufacturer_year: { label: 'Manufacturing year', value: 'bushing_tert_manufacturer_year' },
                insulation_level: { label: 'Insul. level (BIL)', value: 'bushing_tert_insulation_level' },
                voltage_l_ground: { label: 'Voltage L-ground', value: 'bushing_tert_voltage_l_ground' },
                max_system_voltage: { label: 'Max system voltage', value: 'bushing_tert_max_system_voltage' },
                rate_current: { label: 'Rated current', value: 'bushing_tert_rate_current' },
                df_c1: { label: 'DF (C1)', value: 'bushing_tert_df_c1' },
                cap_c1: { label: 'Cap. (C1)', value: 'bushing_tert_cap_c1' },
                df_c2: { label: 'DF (C2)', value: 'bushing_tert_df_c2' },
                cap_c2: { label: 'Cap. (C2)', value: 'bushing_tert_cap_c2' },
                insulation_type: { label: 'Insulation type', value: 'bushing_tert_insulation_type' }
              }}
            }},
            SurgeArresterDto: { label: 'Surge arrester', children: {
              prim: { label: 'Primary', children: {
                properties: { label: 'Properties', children: {
                  sa_prim_serial_no:         { label: 'Serial no.',        value: 'sa_prim_serial_no' },
                  sa_prim_manufacturer:      { label: 'Manufacturer',      value: 'sa_prim_manufacturer' },
                  sa_prim_manufacturer_year: { label: 'Manufacturing year', value: 'sa_prim_manufacturer_year' },
                  sa_prim_asset_system_code: { label: 'Asset system code',  value: 'sa_prim_asset_system_code' }
                }},
                ratings: { label: 'Ratings', children: {
                  sa_prim_unit:         { label: 'Units in stack', value: 'sa_prim_unit' },
                  sa_prim_serial:       { label: 'Serial no.',     value: 'sa_prim_table_serial' },
                  sa_prim_voltageLl:    { label: 'Voltage L-L',    value: 'sa_prim_table_voltageLl' },
                  sa_prim_voltageLn:    { label: 'Voltage L-N',    value: 'sa_prim_table_voltageLn' },
                  sa_prim_mcovRating:   { label: 'MCOV rating',    value: 'sa_prim_table_mcovRating' }
                }}
              }},
              sec: { label: 'Secondary', children: {
                properties: { label: 'Properties', children: {
                  sa_sec_serial_no:         { label: 'Serial no.',        value: 'sa_sec_serial_no' },
                  sa_sec_manufacturer:      { label: 'Manufacturer',      value: 'sa_sec_manufacturer' },
                  sa_sec_manufacturer_year: { label: 'Manufacturing year', value: 'sa_sec_manufacturer_year' },
                  sa_sec_asset_system_code: { label: 'Asset system code',  value: 'sa_sec_asset_system_code' }
                }},
                ratings: { label: 'Ratings', children: {
                  sa_sec_unit:         { label: 'Units in stack', value: 'sa_sec_unit' },
                  sa_sec_serial:       { label: 'Serial no.',     value: 'sa_sec_table_serial' },
                  sa_sec_voltageLl:    { label: 'Voltage L-L',    value: 'sa_sec_table_voltageLl' },
                  sa_sec_voltageLn:    { label: 'Voltage L-N',    value: 'sa_sec_table_voltageLn' },
                  sa_sec_mcovRating:   { label: 'MCOV rating',    value: 'sa_sec_table_mcovRating' }
                }}
              }},
              tert: { label: 'Tertiary', children: {
                properties: { label: 'Properties', children: {
                  sa_tert_serial_no:         { label: 'Serial no.',        value: 'sa_tert_serial_no' },
                  sa_tert_manufacturer:      { label: 'Manufacturer',      value: 'sa_tert_manufacturer' },
                  sa_tert_manufacturer_year: { label: 'Manufacturing year', value: 'sa_tert_manufacturer_year' },
                  sa_tert_asset_system_code: { label: 'Asset system code',  value: 'sa_tert_asset_system_code' }
                }},
                ratings: { label: 'Ratings', children: {
                  sa_tert_unit:         { label: 'Units in stack', value: 'sa_tert_unit' },
                  sa_tert_serial:       { label: 'Serial no.',     value: 'sa_tert_table_serial' },
                  sa_tert_voltageLl:    { label: 'Voltage L-L',    value: 'sa_tert_table_voltageLl' },
                  sa_tert_voltageLn:    { label: 'Voltage L-N',    value: 'sa_tert_table_voltageLn' },
                  sa_tert_mcovRating:   { label: 'MCOV rating',    value: 'sa_tert_table_mcovRating' }
                }}
              }}
            }}
          }},
          VoltageTransformerDto: { label: 'VT', children: {
            PropertiesDto: { label: 'Properties', children: {
              type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
              manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
              manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' }, country_of_origin: { label: 'Country of origin', value: 'country_of_origin' },
              apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' }, comment: { label: 'Comment', value: 'comment' }
            }},
            RatingDto: { label: 'Rating', children: {
              standard: { label: 'Standard', value: 'standard' }, rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' },
              upr: { label: 'Upr formula', value: 'upr' }, rated_voltage: { label: 'Rated voltage', value: 'rated_voltage' },
              c1: { label: 'C1', value: 'c1' }, c2: { label: 'C2', value: 'c2' }
            }},
            VTConfigurationDto: { label: 'VT Configuration', children: {
              windings: { label: 'Windings', value: 'windings' },
              dataVT: { label: 'VT Data', children: {
                usr_formula:        { label: 'Usr formula',       value: 'usr_formula' },
                usr_rated_voltage:  { label: 'Usr rated voltage', value: 'usr_rated_voltage' },
                rated_burden:       { label: 'Rated burden',      value: 'rated_burden' },
                rated_power_factor: { label: 'cosφ',               value: 'rated_power_factor' }
              }}
            }}
          }},
          CurrentTransformerDto: { label: 'CT', children: {
            PropertiesDto: { label: 'Properties', children: {
              type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
              manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
              manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' }, country_of_origin: { label: 'Country of origin', value: 'country_of_origin' },
              apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' }, comment: { label: 'Comment', value: 'comment' }
            }},
            RatingsDto: { label: 'Ratings', children: {
              standard: { label: 'Standard', value: 'standard' }, rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' },
              primary_winding_count: { label: 'Primary windings', value: 'primary_winding_count' }, um_rms: { label: 'Um (rms)', value: 'um_rms' },
              u_withstand_rms: { label: 'U withstand (rms)', value: 'u_withstand_rms' }, u_lightning_peak: { label: 'U lightning (peak)', value: 'u_lightning_peak' },
              icth: { label: 'Icth', value: 'icth' }, idyn_peak: { label: 'Idyn (peak)', value: 'idyn_peak' },
              ith_rms: { label: 'Ith (rms)', value: 'ith_rms' }, ith_duration: { label: 'Duration', value: 'ith_duration' },
              system_voltage: { label: 'System voltage', value: 'system_voltage' }, bil: { label: 'BIL', value: 'bil' }, rating_factor: { label: 'Rating factor', value: 'rating_factor' }
            }},
            CTConfigurationDto: { label: 'CT Configuration', children: {
              cores: { label: 'Cores', value: 'ct_cores' },
              dataCT: { label: 'CT Core', children: {
                taps:      { label: 'Taps',       value: 'ct_taps' },
                commonTap: { label: 'Common tap', value: 'ct_commonTap' },
                fullTap: { label: 'Full tap', children: {
                  table: { label: 'Table', children: {
                    fulltap_name:  { label: 'Name',   value: 'ct_fulltap_name' },
                    fulltap_ipn:   { label: 'Ipn (A)', value: 'ct_fulltap_ipn' },
                    fulltap_isn:   { label: 'Isn (A)', value: 'ct_fulltap_isn' },
                    fulltap_inuse: { label: 'In use',  value: 'ct_fulltap_inuse' }
                  }},
                  classRating: { label: 'Class rating', children: {
                    ct_class_app:           { label: 'Application',          value: 'ct_class_app' },
                    ct_class:               { label: 'Class',                value: 'ct_class' },
                    ct_class_wr:            { label: 'Winding resistance (Ω)',value: 'ct_class_wr' },
                    ct_class_kx:            { label: 'Kx',                   value: 'ct_class_kx' },
                    ct_class_re20lsn:       { label: 'RE(20×lsn) (%)',        value: 'ct_class_re20lsn' },
                    ct_class_k:             { label: 'K',                    value: 'ct_class_k' },
                    ct_class_fs:            { label: 'FS',                   value: 'ct_class_fs' },
                    ct_class_kssc:          { label: 'KSSC',                 value: 'ct_class_kssc' },
                    ct_class_ktd:           { label: 'Ktd',                  value: 'ct_class_ktd' },
                    ct_class_duty:          { label: 'Duty',                 value: 'ct_class_duty' },
                    ct_class_vb:            { label: 'Vb (V)',               value: 'ct_class_vb' },
                    ct_class_alf:           { label: 'ALF',                  value: 'ct_class_alf' },
                    ct_class_ts:            { label: 'Ts',                   value: 'ct_class_ts' },
                    ct_class_ek:            { label: 'Ek',                   value: 'ct_class_ek' },
                    ct_class_le:            { label: 'le',                   value: 'ct_class_le' },
                    ct_class_e1:            { label: 'E1',                   value: 'ct_class_e1' },
                    ct_class_le1:           { label: 'le1',                  value: 'ct_class_le1' },
                    ct_class_val:           { label: 'Val',                  value: 'ct_class_val' },
                    ct_class_lal:           { label: 'lal',                  value: 'ct_class_lal' },
                    ct_class_t1:            { label: 't1',                   value: 'ct_class_t1' },
                    ct_class_tal1:          { label: 'tal1',                 value: 'ct_class_tal1' },
                    ct_class_tp:            { label: 'Tp',                   value: 'ct_class_tp' },
                    ct_class_tpts:          { label: 'Ts (TP)',              value: 'ct_class_tpts' },
                    ct_class_vk:            { label: 'Vk',                   value: 'ct_class_vk' },
                    ct_class_lk:            { label: 'lk',                   value: 'ct_class_lk' },
                    ct_class_vk1:           { label: 'Vk1',                  value: 'ct_class_vk1' },
                    ct_class_lk1:           { label: 'lk1',                  value: 'ct_class_lk1' },
                    ct_class_rated_burden:  { label: 'Rated burden (VA)',     value: 'ct_class_rated_burden' },
                    ct_class_burden:        { label: 'Burden (VA)',           value: 'ct_class_burden' },
                    ct_class_burden_cos:    { label: 'cos φ (burden)',        value: 'ct_class_burden_cos' },
                    ct_class_op_burden:     { label: 'Op. burden (VA)',       value: 'ct_class_op_burden' },
                    ct_class_op_burden_cos: { label: 'cos φ (op. burden)',    value: 'ct_class_op_burden_cos' }
                  }}
                }},
                mainTap: { label: 'Main tap', children: {
                  ct_main_ipn:          { label: 'Ipn (A)',          value: 'ct_main_ipn' },
                  ct_main_isn:          { label: 'Isn (A)',          value: 'ct_main_isn' },
                  ct_main_rated_burden: { label: 'Rated burden (VA)',value: 'ct_main_rated_burden' },
                  ct_main_burden:       { label: 'Burden (VA)',      value: 'ct_main_burden' },
                  ct_main_burden_cos:   { label: 'cos φ',            value: 'ct_main_burden_cos' },
                  ct_main_op_burden:    { label: 'Op. burden (VA)',  value: 'ct_main_op_burden' },
                  ct_main_op_burden_cos:{ label: 'cos φ (op.)',      value: 'ct_main_op_burden_cos' }
                }},
                interTap: { label: 'Inter tap', children: {
                  ct_inter_ipn:          { label: 'Ipn (A)',          value: 'ct_inter_ipn' },
                  ct_inter_isn:          { label: 'Isn (A)',          value: 'ct_inter_isn' },
                  ct_inter_rated_burden: { label: 'Rated burden (VA)',value: 'ct_inter_rated_burden' },
                  ct_inter_burden:       { label: 'Burden (VA)',      value: 'ct_inter_burden' },
                  ct_inter_burden_cos:   { label: 'cos φ',            value: 'ct_inter_burden_cos' },
                  ct_inter_op_burden:    { label: 'Op. burden (VA)',  value: 'ct_inter_op_burden' },
                  ct_inter_op_burden_cos:{ label: 'cos φ (op.)',      value: 'ct_inter_op_burden_cos' }
                }}
              }}
            }}
          }},
          CircuitBreakerDto: { label: 'Breaker', children: {
            PropertiesDto: { label: 'Properties', children: {
              type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
              manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
              manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' }, country_of_origin: { label: 'Country of origin', value: 'country_of_origin' },
              apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' }, comment: { label: 'Comment', value: 'comment' }
            }},
            circuitBreakerDto: { label: 'Circuit Breaker', children: {
              numberOfPhases: { label: 'Number of phases', value: 'numberOfPhases' }, interruptersPerPhase: { label: 'Interrupters per phase', value: 'interruptersPerPhase' },
              poleOperation: { label: 'Pole operation', value: 'poleOperation' }, hasPIR: { label: 'Has PIR', value: 'hasPIR' }, pirValue: { label: 'PIR value', value: 'pirValue' },
              hasGradingCapacitors: { label: 'Has grading capacitors', value: 'hasGradingCapacitors' }, capacitorValue: { label: 'Capacitor value', value: 'capacitorValue' },
              interruptingMedium: { label: 'Interrupting medium', value: 'interruptingMedium' }, tankType: { label: 'Tank type', value: 'tankType' }
            }},
            RatingsDto: { label: 'Ratings', children: {
              rated_voltage_ll: { label: 'Rated voltage (LL)', value: 'rated_voltage_ll' }, rated_current: { label: 'Rated current', value: 'rated_current' },
              rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' },
              rated_short_circuit_breaking_current: { label: 'Rated SC breaking current', value: 'rated_short_circuit_breaking_current' },
              short_circuit_nominal_duration: { label: 'SC nominal duration', value: 'short_circuit_nominal_duration' },
              rated_insulation_level: { label: 'Rated insulation level (BIL)', value: 'rated_insulation_level' },
              rated_interrupting_time: { label: 'Rated interrupting time', value: 'rated_interrupting_time' },
              interrupting_duty_cycle: { label: 'Interrupting duty cycle', value: 'interrupting_duty_cycle' },
              rated_power_at_closing: { label: 'Rated power at closing', value: 'rated_power_at_closing' },
              rated_power_at_opening: { label: 'Rated power at opening', value: 'rated_power_at_opening' },
              rated_power_at_motor_charge: { label: 'Rated power at motor charge', value: 'rated_power_at_motor_charge' }
            }},
            ContactSystemDto: { label: 'Contact system', children: {
              nominal_total_travel: { label: 'Nominal total travel', value: 'nominal_total_travel' },
              damping_time: { label: 'Damping time', value: 'damping_time' }, nozzle_length: { label: 'Nozzle length', value: 'nozzle_length' }
            }},
            OtherDto: { label: 'Other', children: {
              total_weight_with_gas: { label: 'Total weight with gas', value: 'total_weight_with_gas' },
              weight_of_gas: { label: 'Weight of gas', value: 'weight_of_gas' }, volume_of_gas: { label: 'Volume of gas', value: 'volume_of_gas' },
              rated_gas_pressure: { label: 'Rated gas pressure', value: 'rated_gas_pressure' }, rated_gas_temperature: { label: 'Rated gas temperature', value: 'rated_gas_temperature' }
            }},
            OperatingDto: { label: 'Operating', children: {
              type:                  { label: 'Type',               value: 'op_type' },
              serial_no:             { label: 'Serial no.',         value: 'op_serial_no' },
              manufacturer:          { label: 'Manufacturer',       value: 'op_manufacturer' },
              manufacturer_year:     { label: 'Manufacturing year', value: 'op_manufacturer_year' },
              manufacturer_type:     { label: 'Manufacturer type',  value: 'op_manufacturer_type' },
              number_of_trip_coil:   { label: 'No. of trip coils',  value: 'number_of_trip_coil' },
              number_of_close_coil:  { label: 'No. of close coils', value: 'number_of_close_coil' },
              rated_operating_pressure:             { label: 'Rated op. pressure (Pa)',    value: 'op_pressure' },
              rated_operating_pressure_temperature: { label: 'Rated pressure temp. (°C)', value: 'op_pressure_temp' },
              motor: { label: 'Motor', children: {
                motor_rated_voltage: { label: 'Rated voltage', value: 'motor_rated_voltage' },
                motor_rated_current: { label: 'Rated current', value: 'motor_rated_current' },
                motor_power:         { label: 'DC / AC',       value: 'motor_power' },
                motor_frequency:     { label: 'Frequency',     value: 'motor_frequency' }
              }},
              auxiliary_circuits: { label: 'Auxiliary circuits', children: {
                aux_rated_voltage: { label: 'Rated voltage', value: 'aux_rated_voltage' },
                aux_rated_current: { label: 'Rated current', value: 'aux_rated_current' },
                aux_power:         { label: 'DC / AC',       value: 'aux_power' },
                aux_frequency:     { label: 'Frequency',     value: 'aux_frequency' }
              }},
              trip_coil_component: { label: 'Trip coil (array)', children: {
                tc_rated_voltage: { label: 'Rated voltage', value: 'tc_rated_voltage' },
                tc_rated_current: { label: 'Rated current', value: 'tc_rated_current' },
                tc_power:         { label: 'DC / AC',       value: 'tc_power' },
                tc_frequency:     { label: 'Frequency',     value: 'tc_frequency' }
              }},
              close_coil_component: { label: 'Close coil (array)', children: {
                cc_rated_voltage: { label: 'Rated voltage', value: 'cc_rated_voltage' },
                cc_rated_current: { label: 'Rated current', value: 'cc_rated_current' },
                cc_power:         { label: 'DC / AC',       value: 'cc_power' },
                cc_frequency:     { label: 'Frequency',     value: 'cc_frequency' }
              }},
              comment: { label: 'Comment', value: 'op_comment' }
            }},
            AssessmentLimitsDto: { label: 'Assessment limits', children: {
              limits: { label: 'Mode', value: 'assess_limits' },
              contact_resistance: { label: 'Contact resistance', children: {
                cr_abs_r_min: { label: 'R min (abs)', value: 'cr_abs_r_min' },
                cr_abs_r_max: { label: 'R max (abs)', value: 'cr_abs_r_max' },
                cr_rel_r_ref: { label: 'R ref (rel)', value: 'cr_rel_r_ref' },
                cr_rel_r_dev: { label: 'R dev (rel)', value: 'cr_rel_r_dev' }
              }},
              operating_time: { label: 'Operating time', children: {
                opening_time:               { label: 'Opening time',               children: {
                    ot_opening_abs_t_min:   { label: 't min (abs)',  value: 'ot_opening_abs_t_min' },
                    ot_opening_abs_t_max:   { label: 't max (abs)',  value: 'ot_opening_abs_t_max' },
                    ot_opening_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_opening_rel_t_ref' },
                    ot_opening_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_opening_rel_p_t_dev' },
                    ot_opening_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_opening_rel_m_t_dev' }
                  } },
                opening_sync_within_phase:  { label: 'Opening sync within phase',  children: {
                    ot_oswp_abs_t_min:   { label: 't min (abs)',  value: 'ot_oswp_abs_t_min' },
                    ot_oswp_abs_t_max:   { label: 't max (abs)',  value: 'ot_oswp_abs_t_max' },
                    ot_oswp_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_oswp_rel_t_ref' },
                    ot_oswp_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_oswp_rel_p_t_dev' },
                    ot_oswp_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_oswp_rel_m_t_dev' }
                  } },
                opening_sync_breaker_phase: { label: 'Opening sync breaker phase', children: {
                    ot_osbp_abs_t_min:   { label: 't min (abs)',  value: 'ot_osbp_abs_t_min' },
                    ot_osbp_abs_t_max:   { label: 't max (abs)',  value: 'ot_osbp_abs_t_max' },
                    ot_osbp_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_osbp_rel_t_ref' },
                    ot_osbp_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_osbp_rel_p_t_dev' },
                    ot_osbp_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_osbp_rel_m_t_dev' }
                  } },
                closing_time:               { label: 'Closing time',               children: {
                    ot_closing_abs_t_min:   { label: 't min (abs)',  value: 'ot_closing_abs_t_min' },
                    ot_closing_abs_t_max:   { label: 't max (abs)',  value: 'ot_closing_abs_t_max' },
                    ot_closing_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_closing_rel_t_ref' },
                    ot_closing_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_closing_rel_p_t_dev' },
                    ot_closing_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_closing_rel_m_t_dev' }
                  } },
                closing_sync_within_phase:  { label: 'Closing sync within phase',  children: {
                    ot_cswp_abs_t_min:   { label: 't min (abs)',  value: 'ot_cswp_abs_t_min' },
                    ot_cswp_abs_t_max:   { label: 't max (abs)',  value: 'ot_cswp_abs_t_max' },
                    ot_cswp_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_cswp_rel_t_ref' },
                    ot_cswp_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_cswp_rel_p_t_dev' },
                    ot_cswp_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_cswp_rel_m_t_dev' }
                  } },
                closing_sync_breaker_phase: { label: 'Closing sync breaker phase', children: {
                    ot_csbp_abs_t_min:   { label: 't min (abs)',  value: 'ot_csbp_abs_t_min' },
                    ot_csbp_abs_t_max:   { label: 't max (abs)',  value: 'ot_csbp_abs_t_max' },
                    ot_csbp_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_csbp_rel_t_ref' },
                    ot_csbp_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_csbp_rel_p_t_dev' },
                    ot_csbp_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_csbp_rel_m_t_dev' }
                  } },
                reclosing_time:             { label: 'Reclosing time',             children: {
                    ot_reclosing_abs_t_min:   { label: 't min (abs)',  value: 'ot_reclosing_abs_t_min' },
                    ot_reclosing_abs_t_max:   { label: 't max (abs)',  value: 'ot_reclosing_abs_t_max' },
                    ot_reclosing_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_reclosing_rel_t_ref' },
                    ot_reclosing_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_reclosing_rel_p_t_dev' },
                    ot_reclosing_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_reclosing_rel_m_t_dev' }
                  } },
                close_open_time:            { label: 'Close-open time (CO)',       children: {
                    ot_co_abs_t_min:   { label: 't min (abs)',  value: 'ot_co_abs_t_min' },
                    ot_co_abs_t_max:   { label: 't max (abs)',  value: 'ot_co_abs_t_max' },
                    ot_co_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_co_rel_t_ref' },
                    ot_co_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_co_rel_p_t_dev' },
                    ot_co_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_co_rel_m_t_dev' }
                  } },
                open_close_time:            { label: 'Open-close time (OC)',       children: {
                    ot_oc_abs_t_min:   { label: 't min (abs)',  value: 'ot_oc_abs_t_min' },
                    ot_oc_abs_t_max:   { label: 't max (abs)',  value: 'ot_oc_abs_t_max' },
                    ot_oc_rel_t_ref:   { label: 't ref (rel)',  value: 'ot_oc_rel_t_ref' },
                    ot_oc_rel_p_t_dev: { label: '+t dev (rel)', value: 'ot_oc_rel_p_t_dev' },
                    ot_oc_rel_m_t_dev: { label: '-t dev (rel)', value: 'ot_oc_rel_m_t_dev' }
                  } }
              }},
              contact_travel: { label: 'Contact travel', children: {
                total_travel:      { label: 'Total travel (TT)',        children: {
                    ct_total_abs_d_min: { label: 'd min (abs)', value: 'ct_total_abs_d_min' },
                    ct_total_abs_d_max: { label: 'd max (abs)', value: 'ct_total_abs_d_max' },
                    ct_total_rel_d_ref: { label: 'd ref (rel)', value: 'ct_total_rel_d_ref' },
                    ct_total_rel_d_dev: { label: 'd dev (rel)', value: 'ct_total_rel_d_dev' }
                  } },
                over_travel_trip:  { label: 'Over-travel trip (OT)',    children: {
                    ct_ot_trip_abs_d_min: { label: 'd min (abs)', value: 'ct_ot_trip_abs_d_min' },
                    ct_ot_trip_abs_d_max: { label: 'd max (abs)', value: 'ct_ot_trip_abs_d_max' },
                    ct_ot_trip_rel_d_ref: { label: 'd ref (rel)', value: 'ct_ot_trip_rel_d_ref' },
                    ct_ot_trip_rel_d_dev: { label: 'd dev (rel)', value: 'ct_ot_trip_rel_d_dev' }
                  } },
                over_travel_close: { label: 'Over-travel close (OC)',   children: {
                    ct_ot_close_abs_d_min: { label: 'd min (abs)', value: 'ct_ot_close_abs_d_min' },
                    ct_ot_close_abs_d_max: { label: 'd max (abs)', value: 'ct_ot_close_abs_d_max' },
                    ct_ot_close_rel_d_ref: { label: 'd ref (rel)', value: 'ct_ot_close_rel_d_ref' },
                    ct_ot_close_rel_d_dev: { label: 'd dev (rel)', value: 'ct_ot_close_rel_d_dev' }
                  } },
                rebound_trip:      { label: 'Rebound trip',             children: {
                    ct_rb_trip_abs_d_min: { label: 'd min (abs)', value: 'ct_rb_trip_abs_d_min' },
                    ct_rb_trip_abs_d_max: { label: 'd max (abs)', value: 'ct_rb_trip_abs_d_max' },
                    ct_rb_trip_rel_d_ref: { label: 'd ref (rel)', value: 'ct_rb_trip_rel_d_ref' },
                    ct_rb_trip_rel_d_dev: { label: 'd dev (rel)', value: 'ct_rb_trip_rel_d_dev' }
                  } },
                rebound_close:     { label: 'Rebound close',            children: {
                    ct_rb_close_abs_d_min: { label: 'd min (abs)', value: 'ct_rb_close_abs_d_min' },
                    ct_rb_close_abs_d_max: { label: 'd max (abs)', value: 'ct_rb_close_abs_d_max' },
                    ct_rb_close_rel_d_ref: { label: 'd ref (rel)', value: 'ct_rb_close_rel_d_ref' },
                    ct_rb_close_rel_d_dev: { label: 'd dev (rel)', value: 'ct_rb_close_rel_d_dev' }
                  } },
                contact_wipe_trip: { label: 'Contact wipe trip (CWT)',  children: {
                    ct_cw_trip_abs_d_min: { label: 'd min (abs)', value: 'ct_cw_trip_abs_d_min' },
                    ct_cw_trip_abs_d_max: { label: 'd max (abs)', value: 'ct_cw_trip_abs_d_max' },
                    ct_cw_trip_rel_d_ref: { label: 'd ref (rel)', value: 'ct_cw_trip_rel_d_ref' },
                    ct_cw_trip_rel_d_dev: { label: 'd dev (rel)', value: 'ct_cw_trip_rel_d_dev' }
                  } },
                contact_wipe_close:{ label: 'Contact wipe close (CWC)', children: {
                    ct_cw_close_abs_d_min: { label: 'd min (abs)', value: 'ct_cw_close_abs_d_min' },
                    ct_cw_close_abs_d_max: { label: 'd max (abs)', value: 'ct_cw_close_abs_d_max' },
                    ct_cw_close_rel_d_ref: { label: 'd ref (rel)', value: 'ct_cw_close_rel_d_ref' },
                    ct_cw_close_rel_d_dev: { label: 'd dev (rel)', value: 'ct_cw_close_rel_d_dev' }
                  } },
                damping_distance:  { label: 'Damping distance (DD)',    children: {
                    ct_dd_abs_d_min: { label: 'd min (abs)', value: 'ct_dd_abs_d_min' },
                    ct_dd_abs_d_max: { label: 'd max (abs)', value: 'ct_dd_abs_d_max' },
                    ct_dd_rel_d_ref: { label: 'd ref (rel)', value: 'ct_dd_rel_d_ref' },
                    ct_dd_rel_d_dev: { label: 'd dev (rel)', value: 'ct_dd_rel_d_dev' }
                  } }
              }},
              auxiliary_contacts: { label: 'Auxiliary contacts', children: {
                trip_operation: { label: 'Trip operation', children: {
                  stta_trip: { label: 'Switching time type A', children: {
                    ac_trip_stta_abs_t_min:   { label: 't min (abs)',  value: 'ac_trip_stta_abs_t_min' },
                    ac_trip_stta_abs_t_max:   { label: 't max (abs)',  value: 'ac_trip_stta_abs_t_max' },
                    ac_trip_stta_rel_t_ref: { label: 't ref (rel)', value: 'ac_trip_stta_rel_t_ref' },
                    ac_trip_stta_rel_t_dev: { label: 't dev (rel)', value: 'ac_trip_stta_rel_t_dev' }
                  } },
                  dmta_trip: { label: 'Diff to main type A',   children: {
                    ac_trip_dmta_abs_t_min:   { label: 't min (abs)',  value: 'ac_trip_dmta_abs_t_min' },
                    ac_trip_dmta_abs_t_max:   { label: 't max (abs)',  value: 'ac_trip_dmta_abs_t_max' },
                    ac_trip_dmta_rel_t_ref: { label: 't ref (rel)', value: 'ac_trip_dmta_rel_t_ref' },
                    ac_trip_dmta_rel_t_dev: { label: 't dev (rel)', value: 'ac_trip_dmta_rel_t_dev' }
                  } },
                  sttb_trip: { label: 'Switching time type B', children: {
                    ac_trip_sttb_abs_t_min:   { label: 't min (abs)',  value: 'ac_trip_sttb_abs_t_min' },
                    ac_trip_sttb_abs_t_max:   { label: 't max (abs)',  value: 'ac_trip_sttb_abs_t_max' },
                    ac_trip_sttb_rel_t_ref: { label: 't ref (rel)', value: 'ac_trip_sttb_rel_t_ref' },
                    ac_trip_sttb_rel_t_dev: { label: 't dev (rel)', value: 'ac_trip_sttb_rel_t_dev' }
                  } },
                  dmtb_trip: { label: 'Diff to main type B',   children: {
                    ac_trip_dmtb_abs_t_min:   { label: 't min (abs)',  value: 'ac_trip_dmtb_abs_t_min' },
                    ac_trip_dmtb_abs_t_max:   { label: 't max (abs)',  value: 'ac_trip_dmtb_abs_t_max' },
                    ac_trip_dmtb_rel_t_ref: { label: 't ref (rel)', value: 'ac_trip_dmtb_rel_t_ref' },
                    ac_trip_dmtb_rel_t_dev: { label: 't dev (rel)', value: 'ac_trip_dmtb_rel_t_dev' }
                  } },
                  stw_trip:  { label: 'Switching time wiper',  children: {
                    ac_trip_stw_abs_t_min:   { label: 't min (abs)',  value: 'ac_trip_stw_abs_t_min' },
                    ac_trip_stw_abs_t_max:   { label: 't max (abs)',  value: 'ac_trip_stw_abs_t_max' },
                    ac_trip_stw_rel_t_ref: { label: 't ref (rel)', value: 'ac_trip_stw_rel_t_ref' },
                    ac_trip_stw_rel_t_dev: { label: 't dev (rel)', value: 'ac_trip_stw_rel_t_dev' }
                  } },
                  dur_trip:  { label: 'Duration',              children: {
                    ac_trip_dur_abs_t_min:   { label: 't min (abs)',  value: 'ac_trip_dur_abs_t_min' },
                    ac_trip_dur_abs_t_max:   { label: 't max (abs)',  value: 'ac_trip_dur_abs_t_max' },
                    ac_trip_dur_rel_t_ref: { label: 't ref (rel)', value: 'ac_trip_dur_rel_t_ref' },
                    ac_trip_dur_rel_t_dev: { label: 't dev (rel)', value: 'ac_trip_dur_rel_t_dev' }
                  } }
                }},
                close_operation: { label: 'Close operation', children: {
                  stta_close: { label: 'Switching time type A', children: {
                    ac_close_stta_abs_t_min:   { label: 't min (abs)',  value: 'ac_close_stta_abs_t_min' },
                    ac_close_stta_abs_t_max:   { label: 't max (abs)',  value: 'ac_close_stta_abs_t_max' },
                    ac_close_stta_rel_t_ref: { label: 't ref (rel)', value: 'ac_close_stta_rel_t_ref' },
                    ac_close_stta_rel_t_dev: { label: 't dev (rel)', value: 'ac_close_stta_rel_t_dev' }
                  } },
                  dmta_close: { label: 'Diff to main type A',   children: {
                    ac_close_dmta_abs_t_min:   { label: 't min (abs)',  value: 'ac_close_dmta_abs_t_min' },
                    ac_close_dmta_abs_t_max:   { label: 't max (abs)',  value: 'ac_close_dmta_abs_t_max' },
                    ac_close_dmta_rel_t_ref: { label: 't ref (rel)', value: 'ac_close_dmta_rel_t_ref' },
                    ac_close_dmta_rel_t_dev: { label: 't dev (rel)', value: 'ac_close_dmta_rel_t_dev' }
                  } },
                  sttb_close: { label: 'Switching time type B', children: {
                    ac_close_sttb_abs_t_min:   { label: 't min (abs)',  value: 'ac_close_sttb_abs_t_min' },
                    ac_close_sttb_abs_t_max:   { label: 't max (abs)',  value: 'ac_close_sttb_abs_t_max' },
                    ac_close_sttb_rel_t_ref: { label: 't ref (rel)', value: 'ac_close_sttb_rel_t_ref' },
                    ac_close_sttb_rel_t_dev: { label: 't dev (rel)', value: 'ac_close_sttb_rel_t_dev' }
                  } },
                  dmtb_close: { label: 'Diff to main type B',   children: {
                    ac_close_dmtb_abs_t_min:   { label: 't min (abs)',  value: 'ac_close_dmtb_abs_t_min' },
                    ac_close_dmtb_abs_t_max:   { label: 't max (abs)',  value: 'ac_close_dmtb_abs_t_max' },
                    ac_close_dmtb_rel_t_ref: { label: 't ref (rel)', value: 'ac_close_dmtb_rel_t_ref' },
                    ac_close_dmtb_rel_t_dev: { label: 't dev (rel)', value: 'ac_close_dmtb_rel_t_dev' }
                  } },
                  stw_close:  { label: 'Switching time wiper',  children: {
                    ac_close_stw_abs_t_min:   { label: 't min (abs)',  value: 'ac_close_stw_abs_t_min' },
                    ac_close_stw_abs_t_max:   { label: 't max (abs)',  value: 'ac_close_stw_abs_t_max' },
                    ac_close_stw_rel_t_ref: { label: 't ref (rel)', value: 'ac_close_stw_rel_t_ref' },
                    ac_close_stw_rel_t_dev: { label: 't dev (rel)', value: 'ac_close_stw_rel_t_dev' }
                  } },
                  dur_close:  { label: 'Duration',              children: {
                    ac_close_dur_abs_t_min:   { label: 't min (abs)',  value: 'ac_close_dur_abs_t_min' },
                    ac_close_dur_abs_t_max:   { label: 't max (abs)',  value: 'ac_close_dur_abs_t_max' },
                    ac_close_dur_rel_t_ref: { label: 't ref (rel)', value: 'ac_close_dur_rel_t_ref' },
                    ac_close_dur_rel_t_dev: { label: 't dev (rel)', value: 'ac_close_dur_rel_t_dev' }
                  } }
                }}
              }},
              miscellaneous: { label: 'Miscellaneous', children: {
                bounce_time:   { label: 'Bounce time',    children: {
                    misc_bt_abs_min: { label: 'Min (abs)', value: 'misc_bt_abs_min' },
                    misc_bt_abs_max: { label: 'Max (abs)', value: 'misc_bt_abs_max' },
                    misc_bt_rel_ref: { label: 'Ref (rel)', value: 'misc_bt_rel_ref' },
                    misc_bt_rel_dev: { label: 'Dev (rel)', value: 'misc_bt_rel_dev' }
                  } },
                bounce_count:  { label: 'Bounce count',   children: {
                    misc_bc_abs_min: { label: 'Min (abs)', value: 'misc_bc_abs_min' },
                    misc_bc_abs_max: { label: 'Max (abs)', value: 'misc_bc_abs_max' },
                    misc_bc_rel_ref: { label: 'Ref (rel)', value: 'misc_bc_rel_ref' },
                    misc_bc_rel_dev: { label: 'Dev (rel)', value: 'misc_bc_rel_dev' }
                  } },
                pir_close_time:{ label: 'PIR close time', children: {
                    misc_pct_abs_min: { label: 'Min (abs)', value: 'misc_pct_abs_min' },
                    misc_pct_abs_max: { label: 'Max (abs)', value: 'misc_pct_abs_max' },
                    misc_pct_rel_ref: { label: 'Ref (rel)', value: 'misc_pct_rel_ref' },
                    misc_pct_rel_dev: { label: 'Dev (rel)', value: 'misc_pct_rel_dev' }
                  } },
                reaction_time: { label: 'Reaction time',  children: {
                    misc_rt_abs_min: { label: 'Min (abs)', value: 'misc_rt_abs_min' },
                    misc_rt_abs_max: { label: 'Max (abs)', value: 'misc_rt_abs_max' },
                    misc_rt_rel_ref: { label: 'Ref (rel)', value: 'misc_rt_rel_ref' },
                    misc_rt_rel_dev: { label: 'Dev (rel)', value: 'misc_rt_rel_dev' }
                  } }
              }},
              coil_characteristics: { label: 'Coil characteristics', children: {
                peak_close_coil_current:    { label: 'Peak close coil current',    children: {
                    cc_peak_close_abs_min:   { label: 'Min (abs)',  value: 'cc_peak_close_abs_min' },
                    cc_peak_close_abs_max:   { label: 'Max (abs)',  value: 'cc_peak_close_abs_max' },
                    cc_peak_close_rel_ref:   { label: 'Ref (rel)',  value: 'cc_peak_close_rel_ref' },
                    cc_peak_close_rel_m_dev: { label: '-Dev (rel)', value: 'cc_peak_close_rel_m_dev' },
                    cc_peak_close_rel_p_dev: { label: '+Dev (rel)', value: 'cc_peak_close_rel_p_dev' }
                  } },
                peak_trip_coil_current:     { label: 'Peak trip coil current',     children: {
                    cc_peak_trip_abs_min:   { label: 'Min (abs)',  value: 'cc_peak_trip_abs_min' },
                    cc_peak_trip_abs_max:   { label: 'Max (abs)',  value: 'cc_peak_trip_abs_max' },
                    cc_peak_trip_rel_ref:   { label: 'Ref (rel)',  value: 'cc_peak_trip_rel_ref' },
                    cc_peak_trip_rel_m_dev: { label: '-Dev (rel)', value: 'cc_peak_trip_rel_m_dev' },
                    cc_peak_trip_rel_p_dev: { label: '+Dev (rel)', value: 'cc_peak_trip_rel_p_dev' }
                  } },
                average_close_coil_current: { label: 'Avg close coil current',     children: {
                    cc_avg_close_i_abs_min:   { label: 'Min (abs)',  value: 'cc_avg_close_i_abs_min' },
                    cc_avg_close_i_abs_max:   { label: 'Max (abs)',  value: 'cc_avg_close_i_abs_max' },
                    cc_avg_close_i_rel_ref:   { label: 'Ref (rel)',  value: 'cc_avg_close_i_rel_ref' },
                    cc_avg_close_i_rel_m_dev: { label: '-Dev (rel)', value: 'cc_avg_close_i_rel_m_dev' },
                    cc_avg_close_i_rel_p_dev: { label: '+Dev (rel)', value: 'cc_avg_close_i_rel_p_dev' }
                  } },
                average_trip_coil_current:  { label: 'Avg trip coil current',      children: {
                    cc_avg_trip_i_abs_min:   { label: 'Min (abs)',  value: 'cc_avg_trip_i_abs_min' },
                    cc_avg_trip_i_abs_max:   { label: 'Max (abs)',  value: 'cc_avg_trip_i_abs_max' },
                    cc_avg_trip_i_rel_ref:   { label: 'Ref (rel)',  value: 'cc_avg_trip_i_rel_ref' },
                    cc_avg_trip_i_rel_m_dev: { label: '-Dev (rel)', value: 'cc_avg_trip_i_rel_m_dev' },
                    cc_avg_trip_i_rel_p_dev: { label: '+Dev (rel)', value: 'cc_avg_trip_i_rel_p_dev' }
                  } },
                average_close_coil_voltage: { label: 'Avg close coil voltage',     children: {
                    cc_avg_close_u_abs_min:   { label: 'Min (abs)',  value: 'cc_avg_close_u_abs_min' },
                    cc_avg_close_u_abs_max:   { label: 'Max (abs)',  value: 'cc_avg_close_u_abs_max' },
                    cc_avg_close_u_rel_ref:   { label: 'Ref (rel)',  value: 'cc_avg_close_u_rel_ref' },
                    cc_avg_close_u_rel_m_dev: { label: '-Dev (rel)', value: 'cc_avg_close_u_rel_m_dev' },
                    cc_avg_close_u_rel_p_dev: { label: '+Dev (rel)', value: 'cc_avg_close_u_rel_p_dev' }
                  } },
                average_trip_coil_voltage:  { label: 'Avg trip coil voltage',      children: {
                    cc_avg_trip_u_abs_min:   { label: 'Min (abs)',  value: 'cc_avg_trip_u_abs_min' },
                    cc_avg_trip_u_abs_max:   { label: 'Max (abs)',  value: 'cc_avg_trip_u_abs_max' },
                    cc_avg_trip_u_rel_ref:   { label: 'Ref (rel)',  value: 'cc_avg_trip_u_rel_ref' },
                    cc_avg_trip_u_rel_m_dev: { label: '-Dev (rel)', value: 'cc_avg_trip_u_rel_m_dev' },
                    cc_avg_trip_u_rel_p_dev: { label: '+Dev (rel)', value: 'cc_avg_trip_u_rel_p_dev' }
                  } },
                close_coil_resistance:      { label: 'Close coil resistance',      children: {
                    cc_close_res_abs_min:   { label: 'Min (abs)',  value: 'cc_close_res_abs_min' },
                    cc_close_res_abs_max:   { label: 'Max (abs)',  value: 'cc_close_res_abs_max' },
                    cc_close_res_rel_ref:   { label: 'Ref (rel)',  value: 'cc_close_res_rel_ref' },
                    cc_close_res_rel_m_dev: { label: '-Dev (rel)', value: 'cc_close_res_rel_m_dev' },
                    cc_close_res_rel_p_dev: { label: '+Dev (rel)', value: 'cc_close_res_rel_p_dev' }
                  } },
                trip_coil_resistance:       { label: 'Trip coil resistance',       children: {
                    cc_trip_res_abs_min:   { label: 'Min (abs)',  value: 'cc_trip_res_abs_min' },
                    cc_trip_res_abs_max:   { label: 'Max (abs)',  value: 'cc_trip_res_abs_max' },
                    cc_trip_res_rel_ref:   { label: 'Ref (rel)',  value: 'cc_trip_res_rel_ref' },
                    cc_trip_res_rel_m_dev: { label: '-Dev (rel)', value: 'cc_trip_res_rel_m_dev' },
                    cc_trip_res_rel_p_dev: { label: '+Dev (rel)', value: 'cc_trip_res_rel_p_dev' }
                  } }
              }},
              pickup_voltage: { label: 'Pickup voltage', children: {
                min_pickup_voltage_close: { label: 'Min pickup voltage (close)', children: {
                    pv_close_abs_v_min: { label: 'V min (abs)', value: 'pv_close_abs_v_min' },
                    pv_close_abs_v_max: { label: 'V max (abs)', value: 'pv_close_abs_v_max' },
                    pv_close_rel_v_ref: { label: 'V ref (rel)', value: 'pv_close_rel_v_ref' },
                    pv_close_rel_v_dev: { label: 'V dev (rel)', value: 'pv_close_rel_v_dev' }
                  } },
                min_pickup_voltage_trip:  { label: 'Min pickup voltage (trip)',  children: {
                    pv_trip_abs_v_min: { label: 'V min (abs)', value: 'pv_trip_abs_v_min' },
                    pv_trip_abs_v_max: { label: 'V max (abs)', value: 'pv_trip_abs_v_max' },
                    pv_trip_rel_v_ref: { label: 'V ref (rel)', value: 'pv_trip_rel_v_ref' },
                    pv_trip_rel_v_dev: { label: 'V dev (rel)', value: 'pv_trip_rel_v_dev' }
                  } }
              }},
              motor_characteristics: { label: 'Motor characteristics', children: {
                inrush_current:  { label: 'Inrush current',  children: {
                    mc_inrush_abs_min: { label: 'Min (abs)', value: 'mc_inrush_abs_min' },
                    mc_inrush_abs_max: { label: 'Max (abs)', value: 'mc_inrush_abs_max' },
                    mc_inrush_rel_ref: { label: 'Ref (rel)', value: 'mc_inrush_rel_ref' },
                    mc_inrush_rel_dev: { label: 'Dev (rel)', value: 'mc_inrush_rel_dev' }
                  } },
                charging_time:   { label: 'Charging time',   children: {
                    mc_chg_t_abs_min: { label: 'Min (abs)', value: 'mc_chg_t_abs_min' },
                    mc_chg_t_abs_max: { label: 'Max (abs)', value: 'mc_chg_t_abs_max' },
                    mc_chg_t_rel_ref: { label: 'Ref (rel)', value: 'mc_chg_t_rel_ref' },
                    mc_chg_t_rel_dev: { label: 'Dev (rel)', value: 'mc_chg_t_rel_dev' }
                  } },
                charging_current:{ label: 'Charging current',children: {
                    mc_chg_i_abs_min: { label: 'Min (abs)', value: 'mc_chg_i_abs_min' },
                    mc_chg_i_abs_max: { label: 'Max (abs)', value: 'mc_chg_i_abs_max' },
                    mc_chg_i_rel_ref: { label: 'Ref (rel)', value: 'mc_chg_i_rel_ref' },
                    mc_chg_i_rel_dev: { label: 'Dev (rel)', value: 'mc_chg_i_rel_dev' }
                  } },
                minimum_voltage: { label: 'Minimum voltage', children: {
                    mc_min_u_abs_min: { label: 'Min (abs)', value: 'mc_min_u_abs_min' },
                    mc_min_u_abs_max: { label: 'Max (abs)', value: 'mc_min_u_abs_max' },
                    mc_min_u_rel_ref: { label: 'Ref (rel)', value: 'mc_min_u_rel_ref' },
                    mc_min_u_rel_dev: { label: 'Dev (rel)', value: 'mc_min_u_rel_dev' }
                  } }
              }},
              under_voltage_release: { label: 'Under voltage release', children: {
                uv_coil_trip_voltage: { label: 'UV coil trip voltage', children: {
                    uvr_abs_v_min: { label: 'V min (abs)', value: 'uvr_abs_v_min' },
                    uvr_abs_v_max: { label: 'V max (abs)', value: 'uvr_abs_v_max' },
                    uvr_rel_v_ref: { label: 'V ref (rel)', value: 'uvr_rel_v_ref' },
                    uvr_rel_v_dev: { label: 'V dev (rel)', value: 'uvr_rel_v_dev' }
                  } }
              }},
              overcurrent_release: { label: 'Overcurrent release', children: {
                oc_relay_trip_current: { label: 'OC relay trip current', children: {
                    ocr_abs_min: { label: 'Min (abs)', value: 'ocr_abs_min' },
                    ocr_abs_max: { label: 'Max (abs)', value: 'ocr_abs_max' },
                    ocr_rel_ref: { label: 'Ref (rel)', value: 'ocr_rel_ref' },
                    ocr_rel_dev: { label: 'Dev (rel)', value: 'ocr_rel_dev' }
                  } }
              }}
            }}
          }},
          PowerCableDTO: { label: 'Power cable', children: {
            PropertiesDto: { label: 'Properties', children: {
              type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
              manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
              manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' }, country_of_origin: { label: 'Country of origin', value: 'country_of_origin' },
              apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' }, comment: { label: 'Comment', value: 'comment' }
            }},
            configsData: { label: 'Configurations', children: { phases: { label: 'Phases', value: 'phases' }, cores: { label: 'Cores', value: 'cores' } }},
            ratingsData: { label: 'Ratings', children: {
              rated_voltage: { label: 'Rated voltage (rms)', value: 'rated_voltage' }, max_voltage: { label: 'Maximum voltage (rms)', value: 'max_voltage' },
              rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' }, shortcircuit: { label: 'Short circuit current', value: 'shortcircuit' },
              rated_duration: { label: 'Rated SC duration', value: 'rated_duration' }
            }},
            othersData: { label: 'Others', children: {
              insulation_method: { label: 'Installation method', value: 'insulation_method' }, bonding_type: { label: 'Bonding type', value: 'bonding_type' },
              install_location: { label: 'Install location', value: 'install_location' }, cable_length: { label: 'Cable length', value: 'cable_length' }
            }},
            datasData: { label: 'Layer data', children: {
              conductor: { label: 'Conductor', children: {
                conductor_size:            { label: 'Size (mm²)',         value: 'conductor_size' },
                conductor_class:           { label: 'Class',              value: 'conductor_class' },
                conductor_count:           { label: 'Count',              value: 'conductor_count' },
                conductor_material:        { label: 'Material',           value: 'conductor_material' },
                conductor_material_custom: { label: 'Material (custom)',  value: 'conductor_material_custom' },
                conductor_type:            { label: 'Type',               value: 'conductor_type' },
                conductor_type_custom:     { label: 'Type (custom)',      value: 'conductor_type_custom' },
                conductor_diameter:        { label: 'Diameter (mm)',      value: 'conductor_diameter' }
              }},
              insulation: { label: 'Insulation', children: {
                insulation_type:        { label: 'Type',            value: 'insulation_type' },
                insulation_type_custom: { label: 'Type (custom)',   value: 'insulation_type_custom' },
                ins_thickness:          { label: 'Thickness (mm)',  value: 'ins_thickness' },
                ins_diameter:           { label: 'Diameter (mm)',   value: 'ins_diameter' },
                insulation_operating:   { label: 'Max temp (°C)',   value: 'insulation_operating' }
              }},
              conductor_shield: { label: 'Conductor shield', children: {
                cs_thickness: { label: 'Thickness (mm)', value: 'cs_thickness' },
                cs_diameter:  { label: 'Diameter (mm)',  value: 'cs_diameter' }
              }},
              insulation_screen: { label: 'Insulation screen', children: {
                is_material:        { label: 'Material',          value: 'is_material' },
                is_material_custom: { label: 'Material (custom)', value: 'is_material_custom' },
                is_thickness:       { label: 'Thickness (mm)',    value: 'is_thickness' },
                is_diameter:        { label: 'Diameter (mm)',     value: 'is_diameter' }
              }},
              sheath: { label: 'Sheath', children: {
                sheath_multicore:         { label: 'Multicore',            value: 'sheath_multicore' },
                sheath_type:              { label: 'Sheath type',          value: 'sheath_type' },
                sheath_type_custom:       { label: 'Sheath type (custom)', value: 'sheath_type_custom' },
                sheath_construction:      { label: 'Construction',         value: 'sheath_construction' },
                sheath_construction_custom:{ label: 'Construction (custom)',value: 'sheath_construction_custom' },
                sheath_thickness:         { label: 'Thickness (mm)',       value: 'sheath_thickness' },
                sheath_diameter:          { label: 'Diameter (mm)',        value: 'sheath_diameter' }
              }},
              sheath_reinforcing: { label: 'Sheath reinforcing tape', children: {
                sr_material:        { label: 'Material',          value: 'sr_material' },
                sr_material_custom: { label: 'Material (custom)', value: 'sr_material_custom' },
                sr_thickness:       { label: 'Thickness (mm)',    value: 'sr_thickness' },
                sr_diameter:        { label: 'Diameter (mm)',     value: 'sr_diameter' },
                sr_width:           { label: 'Width (mm)',        value: 'sr_width' },
                sr_lengthOfLay:     { label: 'Length of lay (mm)',value: 'sr_lengthOfLay' },
                sr_numOfTapes:      { label: 'No. of tapes',      value: 'sr_numOfTapes' }
              }},
              concentric_neutral: { label: 'Concentric neutral', children: {
                cn_material:             { label: 'Material',             value: 'cn_material' },
                cn_material_custom:      { label: 'Material (custom)',    value: 'cn_material_custom' },
                cn_construction:         { label: 'Construction',         value: 'cn_construction' },
                cn_construction_custom:  { label: 'Construction (custom)',value: 'cn_construction_custom' },
                cn_thickness:            { label: 'Thickness (mm)',       value: 'cn_thickness' },
                cn_diameter:             { label: 'Diameter (mm)',        value: 'cn_diameter' },
                cn_area:                 { label: 'Area (mm²)',           value: 'cn_area' },
                cn_lengthOfLay:          { label: 'Length of lay (mm)',   value: 'cn_lengthOfLay' },
                cn_numOfWires:           { label: 'No. of wires',         value: 'cn_numOfWires' }
              }},
              armour_bedding: { label: 'Armour bedding', children: {
                ab_material:        { label: 'Material',          value: 'ab_material' },
                ab_material_custom: { label: 'Material (custom)', value: 'ab_material_custom' },
                ab_thickness:       { label: 'Thickness (mm)',    value: 'ab_thickness' },
                ab_diameter:        { label: 'Diameter (mm)',     value: 'ab_diameter' }
              }},
              armour: { label: 'Armour', children: {
                armour_material:          { label: 'Material',             value: 'armour_material' },
                armour_material_custom:   { label: 'Material (custom)',    value: 'armour_material_custom' },
                armour_thickness:         { label: 'Thickness (mm)',       value: 'armour_thickness' },
                armour_diameter:          { label: 'Diameter (mm)',        value: 'armour_diameter' },
                armour_layerOfTapes:      { label: 'Layer of tapes',       value: 'armour_layerOfTapes' },
                armour_layerOfTapes_custom:{ label: 'Layer of tapes (custom)',value: 'armour_layerOfTapes_custom' },
                armour_crossSectional:    { label: 'Cross-sectional area', value: 'armour_crossSectional' }
              }},
              oversheath: { label: 'Oversheath / Jacket', children: {
                os_material:        { label: 'Material',          value: 'os_material' },
                os_material_custom: { label: 'Material (custom)', value: 'os_material_custom' },
                os_thickness:       { label: 'Thickness (mm)',    value: 'os_thickness' },
                os_diameter:        { label: 'Diameter (mm)',     value: 'os_diameter' }
              }},
              terminalsData: { label: 'Terminals', children: {
                term_rated_u:         { label: 'Rated voltage',      value: 'term_rated_u' },
                term_bil:             { label: 'BIL',                value: 'term_bil' },
                term_bsl:             { label: 'BSL',                value: 'term_bsl' },
                term_type:            { label: 'Type',               value: 'term_type' },
                term_class:           { label: 'Class',              value: 'term_class' },
                term_connector_type:  { label: 'Connector type',     value: 'term_connector_type' },
                term_service_condition:{ label: 'Service condition', value: 'term_service_condition' }
              }},
              jointsData: { label: 'Joints', children: {
                joint_rated_u:           { label: 'Rated voltage',    value: 'joint_rated_u' },
                joint_rated_current:     { label: 'Rated current',    value: 'joint_rated_current' },
                joint_category:          { label: 'Category',         value: 'joint_category' },
                joint_construction:      { label: 'Construction',     value: 'joint_construction' },
                joint_service_condition: { label: 'Service condition',value: 'joint_service_condition' }
              }},
              sheathLimitsData: { label: 'Sheath voltage limits', children: {
                sl_rated_voltage_ur:                      { label: 'Rated voltage Ur',                     value: 'sl_rated_voltage_ur' },
                sl_max_continuous_operating_voltage:      { label: 'Max continuous operating voltage Uc',  value: 'sl_max_continuous_operating_voltage' },
                sl_nominal_discharge_current:             { label: 'Nominal discharge current',            value: 'sl_nominal_discharge_current' },
                sl_high_current_impulse_withstand:        { label: 'High current impulse withstand',       value: 'sl_high_current_impulse_withstand' },
                sl_long_duration_current_impulse_withstand:{ label: 'Long duration impulse withstand',     value: 'sl_long_duration_current_impulse_withstand' },
                sl_short_circuit_withstand:               { label: 'Short circuit withstand',             value: 'sl_short_circuit_withstand' }
              }}
            }}
          }},
          SurgeArresterDto: { label: 'Surge Arrester', children: {
            PropertiesDto: { label: 'Properties', children: {
              type:              { label: 'Asset type',         value: 'type' },
              serial_no:         { label: 'Serial no.',         value: 'serial_no' },
              manufacturer:      { label: 'Manufacturer',       value: 'manufacturer' },
              manufacturer_type: { label: 'Manufacturer type',  value: 'manufacturer_type' },
              manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' },
              country_of_origin: { label: 'Country of origin',  value: 'country_of_origin' },
              apparatus_id:      { label: 'Apparatus ID',       value: 'apparatus_id' },
              comment:           { label: 'Comment',             value: 'comment' }
            }},
            RatingsDto: { label: 'Ratings', children: {
              unitStack:   { label: 'Units in stack', value: 'unitStack' },
              tableRating: { label: 'Rating table (array)', children: {
                sa_serial:         { label: 'Serial no.',                                     value: 'sa_serial' },
                sa_ratedVoltage:   { label: 'Rated voltage Ur',                               value: 'sa_ratedVoltage' },
                sa_maximumVoltage: { label: 'Maximum system voltage Us',                      value: 'sa_maximumVoltage' },
                sa_continousVoltage:{ label: 'Continuous operating voltage Uc',              value: 'sa_continousVoltage' },
                sa_shortCurrent:   { label: 'Short time withstand current',                  value: 'sa_shortCurrent' },
                sa_ratedCircuit:   { label: 'Rated duration of short circuit',               value: 'sa_ratedCircuit' },
                sa_polesVoltage:   { label: 'PF withstand voltage (earth & poles)',          value: 'sa_polesVoltage' },
                sa_isoVoltage:     { label: 'PF withstand voltage (isolating distance)',     value: 'sa_isoVoltage' }
              }}
            }}
          }},
          BushingAssetDto: { label: 'Bushing', children: {
            PropertiesDto: { label: 'Properties', children: {
              type:              { label: 'Asset type',         value: 'type' },
              serial_no:         { label: 'Serial no.',         value: 'serial_no' },
              manufacturer:      { label: 'Manufacturer',       value: 'manufacturer' },
              manufacturer_type: { label: 'Manufacturer type',  value: 'manufacturer_type' },
              manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' },
              country_of_origin: { label: 'Country of origin',  value: 'country_of_origin' },
              apparatus_id:      { label: 'Apparatus ID',       value: 'apparatus_id' },
              comment:           { label: 'Comment',             value: 'comment' }
            }},
            BushingDataDto: { label: 'Bushing data', children: {
              rated_frequency:   { label: 'Rated frequency',       value: 'rated_frequency' },
              insulation_level:  { label: 'Insul. level LL (BIL)', value: 'insulation_level' },
              voltage_l_ground:  { label: 'Voltage L-ground',      value: 'voltage_l_ground' },
              max_system_voltage:{ label: 'Max system voltage',     value: 'max_system_voltage' },
              rated_current:     { label: 'Rated current',         value: 'rated_current' },
              df_c1:             { label: 'DF (C1)',               value: 'df_c1' },
              cap_c1:            { label: 'Cap. (C1)',             value: 'cap_c1' },
              df_c2:             { label: 'DF (C2)',               value: 'df_c2' },
              cap_c2:            { label: 'Cap. (C2)',             value: 'cap_c2' },
              insulation_type:   { label: 'Insulation type',       value: 'insulation_type' }
            }}
          }},
          ReactorDto: { label: 'Reactor', children: {
            PropertiesDto: { label: 'Properties', children: {
              type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
              manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
              manufacturing_year: { label: 'Manufacturing year', value: 'manufacturing_year' }, country_of_origin: { label: 'Country of origin', value: 'country_of_origin' },
              apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' }, feeder: { label: 'Feeder', value: 'feeder' }, comment: { label: 'Comment', value: 'comment' }
            }},
            ReactorRatingDto: { label: 'Ratings', children: {
              rated_voltage: { label: 'Rated voltage', value: 'rated_voltage' }, rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' },
              rated_current: { label: 'Rated current', value: 'rated_current' }, rated_power: { label: 'Rated power', value: 'rated_power' }, inductance: { label: 'Inductance', value: 'inductance' }
            }},
            ReactorOtherDto: { label: 'Others', children: {
              insulation_type: { label: 'Insulation type', value: 'insulation_type' }, weight: { label: 'Weight', value: 'weight' }
            }}
          }},
          CapacitorsDTO: { label: 'Capacitor', children: {
            PropertiesDto: { label: 'Properties', children: {
              type:               { label: 'Asset type',         value: 'type' },
              serial_no:          { label: 'Serial no.',         value: 'serial_no' },
              manufacturer:       { label: 'Manufacturer',       value: 'manufacturer' },
              manufacturer_type:  { label: 'Manufacturer type',  value: 'manufacturer_type' },
              manufacturing_year: { label: 'Manufacturing year', value: 'manufacturing_year' },
              country_of_origin:  { label: 'Country of origin',  value: 'country_of_origin' },
              apparatus_id:       { label: 'Apparatus ID',       value: 'apparatus_id' },
              feeder:             { label: 'Feeder',             value: 'feeder' },
              comment:            { label: 'Comment',             value: 'comment' }
            }},
            configsData: { label: 'Configuration', children: {
              cap_phase:      { label: 'Phase (1 or 3)', value: 'cap_phase' },
              cap_phase_name: { label: 'Phase name',    value: 'cap_phase_name' }
            }},
            RatingsDto: { label: 'Ratings', children: {
              cap_rated_voltage:   { label: 'Rated voltage',   value: 'cap_rated_voltage' },
              cap_rated_frequency: { label: 'Rated frequency', value: 'cap_rated_frequency' },
              cap_rated_current:   { label: 'Rated current',   value: 'cap_rated_current' },
              cap_rated_power:     { label: 'Rated power',     value: 'cap_rated_power' }
            }},
            CapacitanceDto: { label: 'Capacitance', children: {
              cap_capacitance:   { label: 'Capacitance (phase 1)', value: 'cap_capacitance' },
              cap_capacitance_A: { label: 'Capacitance phase A',   value: 'cap_capacitance_A' },
              cap_capacitance_B: { label: 'Capacitance phase B',   value: 'cap_capacitance_B' },
              cap_capacitance_C: { label: 'Capacitance phase C',   value: 'cap_capacitance_C' }
            }},
            DissipationFactorDto: { label: 'Dissipation factor', children: {
              cap_df:   { label: 'Dissipation factor (phase 1)', value: 'cap_df' },
              cap_df_A: { label: 'Dissipation factor phase A',   value: 'cap_df_A' },
              cap_df_B: { label: 'Dissipation factor phase B',   value: 'cap_df_B' },
              cap_df_C: { label: 'Dissipation factor phase C',   value: 'cap_df_C' }
            }},
            OthersData: { label: 'Others', children: {
              cap_insulation_type: { label: 'Insulation type', value: 'cap_insulation_type' },
              cap_weight:          { label: 'Weight (kg)',      value: 'cap_weight' }
            }}
          }},
          DisconnectorDTO: { label: 'Disconnector', children: {
            PropertiesDto: { label: 'Properties', children: {
              type:               { label: 'Asset type',         value: 'type' },
              serial_no:          { label: 'Serial no.',         value: 'serial_no' },
              manufacturer:       { label: 'Manufacturer',       value: 'manufacturer' },
              manufacturer_type:  { label: 'Manufacturer type',  value: 'manufacturer_type' },
              manufacturing_year: { label: 'Manufacturing year', value: 'manufacturing_year' },
              country_of_origin:  { label: 'Country of origin',  value: 'country_of_origin' },
              apparatus_id:       { label: 'Apparatus ID',       value: 'apparatus_id' },
              feeder:             { label: 'Feeder',             value: 'feeder' },
              comment:            { label: 'Comment',             value: 'comment' }
            }},
            RatingsDto: { label: 'Ratings', children: {
              rated_voltage:                             { label: 'Rated voltage',                              value: 'dc_rated_voltage' },
              rated_frequency:                           { label: 'Rated frequency',                            value: 'dc_rated_frequency' },
              rated_current:                             { label: 'Rated current',                             value: 'dc_rated_current' },
              short_time_withstand_current:              { label: 'Short time withstand current',               value: 'dc_short_time_withstand_current' },
              rated_duration_of_short_circuit:           { label: 'Rated duration of short circuit',           value: 'dc_rated_duration_of_short_circuit' },
              power_freq_withstand_voltage_earth_poles:  { label: 'PF withstand voltage (earth & poles)',      value: 'dc_pf_earth_poles' },
              power_freq_withstand_voltage_isolating_distance: { label: 'PF withstand voltage (isolating distance)', value: 'dc_pf_isolating_distance' }
            }}
          }},
          RotatingMachineDTO: { label: 'Rotating Machine', children: {
            PropertiesDto: { label: 'Properties', children: {
              type: { label: 'Asset type', value: 'type' }, serial_no: { label: 'Serial no.', value: 'serial_no' },
              manufacturer: { label: 'Manufacturer', value: 'manufacturer' }, manufacturer_type: { label: 'Manufacturer type', value: 'manufacturer_type' },
              manufacturer_year: { label: 'Manufacturing year', value: 'manufacturer_year' }, country_of_origin: { label: 'Country of origin', value: 'country_of_origin' },
              apparatus_id: { label: 'Apparatus ID', value: 'apparatus_id' }, comment: { label: 'Comment', value: 'comment' }
            }},
            configsData: { label: 'Configurations', children: { star_point: { label: 'Star point', value: 'star_point' } }},
            ratingsData: { label: 'Ratings', children: {
              rated_u: { label: 'Rated voltage (LL)', value: 'rated_u' }, rated_current: { label: 'Rated current', value: 'rated_current' },
              rated_speed: { label: 'Rated speed (rpm)', value: 'rated_speed' }, rated_frequency: { label: 'Rated frequency', value: 'rated_frequency' },
              rated_power: { label: 'Rated power', value: 'rated_power' }, rated_power_factor: { label: 'Rated power factor', value: 'rated_power_factor' },
              rated_thermal_class: { label: 'Rated thermal class', value: 'rated_thermal_class' },
              rated_ifd: { label: 'Rated excitation current', value: 'rated_ifd' }, rated_ufd: { label: 'Rated excitation voltage', value: 'rated_ufd' }
            }}
          }}
        }}
,
        Job: { label: 'Job', children: {
          TransformerJobDto: { label: 'Transformer Job', children: {
            PropertiesDto: { label: 'Properties', children: {
                name:          { label: 'Job name',          value: 'job_name' },
                job_type:      { label: 'Job type',          value: 'job_type' },
                creation_date: { label: 'Creation date',     value: 'creation_date' },
                execution_date:{ label: 'Execution date',    value: 'execution_date' },
                tested_by:     { label: 'Tested by',         value: 'tested_by' },
                approved_by:   { label: 'Approved by',       value: 'approved_by' },
                approval_date: { label: 'Approval date',     value: 'approval_date' },
                test_method:   { label: 'Test method',       value: 'test_method' },
                ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
                summary:       { label: 'Summary',           value: 'summary' }
            }}
          }},
          VoltageTransformerJobDto: { label: 'VT Job', children: {
            PropertiesDto: { label: 'Properties', children: {
                name:          { label: 'Job name',          value: 'job_name' },
                job_type:      { label: 'Job type',          value: 'job_type' },
                creation_date: { label: 'Creation date',     value: 'creation_date' },
                execution_date:{ label: 'Execution date',    value: 'execution_date' },
                tested_by:     { label: 'Tested by',         value: 'tested_by' },
                approved_by:   { label: 'Approved by',       value: 'approved_by' },
                approval_date: { label: 'Approval date',     value: 'approval_date' },
                test_method:   { label: 'Test method',       value: 'test_method' },
                ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
                summary:       { label: 'Summary',           value: 'summary' }
            }}
          }},
          CurrentTransformerJobDto: { label: 'CT Job', children: {
            PropertiesDto: { label: 'Properties', children: {
                name:          { label: 'Job name',          value: 'job_name' },
                job_type:      { label: 'Job type',          value: 'job_type' },
                creation_date: { label: 'Creation date',     value: 'creation_date' },
                execution_date:{ label: 'Execution date',    value: 'execution_date' },
                tested_by:     { label: 'Tested by',         value: 'tested_by' },
                approved_by:   { label: 'Approved by',       value: 'approved_by' },
                approval_date: { label: 'Approval date',     value: 'approval_date' },
                test_method:   { label: 'Test method',       value: 'test_method' },
                ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
                summary:       { label: 'Summary',           value: 'summary' }
            }}
          }},
          CircuitBreakerJobDto: { label: 'Breaker Job', children: {
            PropertiesDto: { label: 'Properties', children: {
                name:          { label: 'Job name',          value: 'job_name' },
                job_type:      { label: 'Job type',          value: 'job_type' },
                creation_date: { label: 'Creation date',     value: 'creation_date' },
                execution_date:{ label: 'Execution date',    value: 'execution_date' },
                tested_by:     { label: 'Tested by',         value: 'tested_by' },
                approved_by:   { label: 'Approved by',       value: 'approved_by' },
                approval_date: { label: 'Approval date',     value: 'approval_date' },
                test_method:   { label: 'Test method',       value: 'test_method' },
                ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
                summary:       { label: 'Summary',           value: 'summary' }
            }}
          }},
          PowerCableJobDto: { label: 'Power Cable Job', children: {
            PropertiesDto: { label: 'Properties', children: {
                name:          { label: 'Job name',          value: 'job_name' },
                job_type:      { label: 'Job type',          value: 'job_type' },
                creation_date: { label: 'Creation date',     value: 'creation_date' },
                execution_date:{ label: 'Execution date',    value: 'execution_date' },
                tested_by:     { label: 'Tested by',         value: 'tested_by' },
                approved_by:   { label: 'Approved by',       value: 'approved_by' },
                approval_date: { label: 'Approval date',     value: 'approval_date' },
                test_method:   { label: 'Test method',       value: 'test_method' },
                ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
                summary:       { label: 'Summary',           value: 'summary' }
            }}
          }},
          SurgeArresterJobDto: { label: 'Surge Arrester Job', children: {
            PropertiesDto: { label: 'Properties', children: {
                name:          { label: 'Job name',          value: 'job_name' },
                job_type:      { label: 'Job type',          value: 'job_type' },
                creation_date: { label: 'Creation date',     value: 'creation_date' },
                execution_date:{ label: 'Execution date',    value: 'execution_date' },
                tested_by:     { label: 'Tested by',         value: 'tested_by' },
                approved_by:   { label: 'Approved by',       value: 'approved_by' },
                approval_date: { label: 'Approval date',     value: 'approval_date' },
                test_method:   { label: 'Test method',       value: 'test_method' },
                ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
                summary:       { label: 'Summary',           value: 'summary' }
            }}
          }},
          ReactorJobDto: { label: 'Reactor Job', children: {
            PropertiesDto: { label: 'Properties', children: {
                name:          { label: 'Job name',          value: 'job_name' },
                job_type:      { label: 'Job type',          value: 'job_type' },
                creation_date: { label: 'Creation date',     value: 'creation_date' },
                execution_date:{ label: 'Execution date',    value: 'execution_date' },
                tested_by:     { label: 'Tested by',         value: 'tested_by' },
                approved_by:   { label: 'Approved by',       value: 'approved_by' },
                approval_date: { label: 'Approval date',     value: 'approval_date' },
                test_method:   { label: 'Test method',       value: 'test_method' },
                ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
                summary:       { label: 'Summary',           value: 'summary' }
            }}
          }},
          CapacitorJobDto: { label: 'Capacitor Job', children: {
            PropertiesDto: { label: 'Properties', children: {
                name:          { label: 'Job name',          value: 'job_name' },
                job_type:      { label: 'Job type',          value: 'job_type' },
                creation_date: { label: 'Creation date',     value: 'creation_date' },
                execution_date:{ label: 'Execution date',    value: 'execution_date' },
                tested_by:     { label: 'Tested by',         value: 'tested_by' },
                approved_by:   { label: 'Approved by',       value: 'approved_by' },
                approval_date: { label: 'Approval date',     value: 'approval_date' },
                test_method:   { label: 'Test method',       value: 'test_method' },
                ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
                summary:       { label: 'Summary',           value: 'summary' }
            } }
          }},
          DisconnectorJobDto: { label: 'Disconnector Job', children: {
            PropertiesDto: { label: 'Properties', children: {
                name:          { label: 'Job name',          value: 'job_name' },
                job_type:      { label: 'Job type',          value: 'job_type' },
                creation_date: { label: 'Creation date',     value: 'creation_date' },
                execution_date:{ label: 'Execution date',    value: 'execution_date' },
                tested_by:     { label: 'Tested by',         value: 'tested_by' },
                approved_by:   { label: 'Approved by',       value: 'approved_by' },
                approval_date: { label: 'Approval date',     value: 'approval_date' },
                test_method:   { label: 'Test method',       value: 'test_method' },
                ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
                summary:       { label: 'Summary',           value: 'summary' }
            }}
          }},
          RotatingMachineJobDto: { label: 'Rotating Machine Job', children: {
            PropertiesDto: { label: 'Properties', children: {
                name:          { label: 'Job name',          value: 'job_name' },
                job_type:      { label: 'Job type',          value: 'job_type' },
                creation_date: { label: 'Creation date',     value: 'creation_date' },
                execution_date:{ label: 'Execution date',    value: 'execution_date' },
                tested_by:     { label: 'Tested by',         value: 'tested_by' },
                approved_by:   { label: 'Approved by',       value: 'approved_by' },
                approval_date: { label: 'Approval date',     value: 'approval_date' },
                test_method:   { label: 'Test method',       value: 'test_method' },
                ref_standard:  { label: 'Reference standard',value: 'ref_standard' },
                summary:       { label: 'Summary',           value: 'summary' }
            }}
          }}
        }}
      }
    }
  },
  computed: {
    exportCategories() {
      const seen = new Set(), result = []
      for (const row of this.tableData) {
        if (!row.category) continue
        if (row.category === 'Asset') {
          const assetType = row.featureLevels?.[0]?.key
          if (!assetType) continue
          const key = `Asset_${assetType}`
          if (seen.has(key)) continue
          seen.add(key)
          const node = this.FEATURE_TREE.Asset?.children?.[assetType]
          result.push({ key, label: node?.label ?? assetType, category: 'Asset', assetType })
        } else if (row.category === 'Job') {
          const jobType = row.featureLevels?.[0]?.key
          if (!jobType) continue
          const key = `Job_${jobType}`
          if (seen.has(key)) continue
          seen.add(key)
          const node = this.FEATURE_TREE.Job?.children?.[jobType]
          result.push({ key, label: node?.label ?? jobType, category: 'Job', assetType: jobType })
        } else {
          if (seen.has(row.category)) continue
          seen.add(row.category)
          const opt = this.categoryOptions.find(c => c.value === row.category)
          result.push({ key: row.category, label: opt?.label ?? row.category, category: row.category, assetType: null })
        }
      }
      return result
    }
  },
  async mounted() { await this.loadTemplates() },
  methods: {
    async loadTemplates() {
      try {
        const rs = await window.electronAPI.getAllTemplates()
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
    async uploadExcelForNew() {
      if (!this.addForm.name) { this.$message.warning('Please enter template name first'); return }
      try {
        const rs = await window.electronAPI.uploadExcelTemplate(this.addForm.name)
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
          const rs = await window.electronAPI.insertTemplate({ name: this.addForm.name, path: this.addForm.filePath||'', variable: JSON.stringify([]) })
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
    async handleSave() { await this.saveWithScan() },
    async saveWithScan() {
      if (!this.selectedTemplateName || !this.currentFilePath) { this.$message.warning('Please upload an Excel file first'); return }
      const variables = this.tableData.map(r => ({ code: r.code, category: r.category, featureLevels: r.featureLevels, coordinates: r.coordinates||[] }))
      try {
        const rs = await window.electronAPI.saveTemplateWithScan({ name: this.selectedTemplateName, filePath: this.currentFilePath, variables })
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
    async handleExport() {
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
    clearSelectedNode() {
      this.selectedNode = null; this.selectedNodeLabel = ''; this.selectedNodeContext = {}; this.pickerTempSelected = null
    },
    // ── el-tree lazy load ────────────────────────────────────────────
    async loadPickerNode(node, resolve) {
      const ROOT = '00000000-0000-0000-0000-000000000000'
      try {
        if (node.level === 0) {
          // Load root organisation
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
          // Child orgs + substations
          const [childOrgs, subs] = await Promise.all([
            window.electronAPI.getParentOrganizationByParentMrid(data.mrid),
            window.electronAPI.getSubstationsInOrganisationForUser(data.mrid, this.$store?.state?.user?.user_id || null)
          ])
          ;(childOrgs?.data || []).forEach(o => rows.push({ mrid: o.mrid, displayName: o.aliasName || o.name, mode: 'organisation', pickerIsLeaf: false, parentArr: nextParentArr }))
          ;(subs?.data || []).forEach(s => rows.push({ mrid: s.mrid, displayName: s.name, mode: 'substation', pickerIsLeaf: false, parentArr: nextParentArr }))
        } else if (data.mode === 'substation') {
          // VoltageLevel + Bay (at substation level)
          const [vls, bays] = await Promise.all([
            window.electronAPI.getVoltageLevelBySubstationId(data.mrid),
            window.electronAPI.getBayByVoltageBySubstationId(null, data.mrid)
          ])
          ;(vls?.data || []).forEach(vl => rows.push({ mrid: vl.mrid, displayName: vl.name, mode: 'voltageLevel', pickerIsLeaf: false, parentArr: nextParentArr }))
          ;(bays?.data || []).forEach(b => rows.push({ mrid: b.mrid, displayName: b.name, mode: 'bay', pickerIsLeaf: false, parentArr: nextParentArr }))
          // Assets directly under substation
          const assets = await this.pickerFetchAssets(data.mrid, nextParentArr)
          rows.push(...assets)
        } else if (data.mode === 'voltageLevel') {
          const rs = await window.electronAPI.getBayByVoltageBySubstationId(data.mrid, null)
          ;(rs?.data || []).forEach(b => rows.push({ mrid: b.mrid, displayName: b.name, mode: 'bay', pickerIsLeaf: false, parentArr: nextParentArr }))
        } else if (data.mode === 'bay') {
          const assets = await this.pickerFetchAssets(data.mrid, nextParentArr)
          rows.push(...assets)
        } else if (data.mode === 'asset') {
          // Jobs under asset — API: getOldWorkByAssetId (từ fetchJobsByAssetId mixin)
          const rs = await window.electronAPI.getOldWorkByAssetId(data.mrid)
          ;(rs?.data || []).forEach(j => rows.push({ mrid: j.mrid, displayName: j.name || j.job_name || j.mrid, mode: 'job', assetType: data.assetType, pickerIsLeaf: true, parentArr: nextParentArr }))
        }
        resolve(rows)
      } catch(e) { console.error('loadPickerNode error:', e); resolve([]) }
    },
    async pickerFetchAssets(psrId, parentArr) {
      const kindMap = [
        ['Transformer','getAssetByPsrIdAndKind'], ['Voltage transformer','getAssetByPsrIdAndKind'],
        ['Current transformer','getAssetByPsrIdAndKind'], ['Circuit breaker','getAssetByPsrIdAndKind'],
        ['Power cable','getAssetByPsrIdAndKind'], ['Disconnector','getAssetByPsrIdAndKind'],
        ['Rotating machine','getAssetByPsrIdAndKind'], ['Capacitor','getAssetByPsrIdAndKind'],
        ['Reactor','getAssetByPsrIdAndKind'],
      ]
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
    confirmPickerSelection() {
      if (!this.pickerTempSelected) return
      const node = this.pickerTempSelected
      this.selectedNode = node
      // Build full path label
      const path = (node.parentArr || []).map(p => p.name).join(' / ')
      this.selectedNodeLabel = path ? `${path} / ${node.displayName}` : node.displayName
      // Build context: walk parentArr + current node
      const ctx = {}
      ;(node.parentArr || []).forEach(p => { if (p.mode) ctx[p.mode] = { mrid: p.mrid, name: p.name } })
      ctx[node.mode] = { mrid: node.mrid, name: node.displayName, assetType: node.assetType }
      this.selectedNodeContext = ctx
      this.nodePickerVisible = false
    },
    async doExport() {
      this.exportLoading = true
      try {
        const dto = {}
        const partials = await Promise.all(this.exportCategories.map(cat => this.buildDtoForCat(cat)))
        for (const p of partials) { if (p) Object.assign(dto, p) }
        const tmpl = this.templateList.find(t => t.name === this.selectedTemplateName)
        const rs = await window.electronAPI.exportTemplateWithData({ templatePath: this.currentFilePath, variables: tmpl?.variable||[], dto })
        if (rs.canceled) return
        if (rs.success) { this.showExportDialog = false; this.$message.success('Exported: ' + rs.filePath) }
        else this.$message.error(rs.message || 'Export failed')
      } catch(e) { this.$message.error('Export error: ' + e.message) } finally { this.exportLoading = false }
    },
    mapProps(p) {
      if (!p) return {}
      return { type: p.type||'', kind: p.kind||'', serial_no: p.serial_no||'', manufacturer: p.manufacturer||'', manufacturer_type: p.manufacturer_type||'', manufacturer_year: p.manufacturer_year||'', model: p.model||'', country_of_origin: p.country_of_origin||'', apparatus_id: p.apparatus_id||'', comment: p.comment||'' }
    },
    // Get nodeId from selectedNodeContext based on category
    getNodeIdForCat(catKey) {
      const ctx = this.selectedNodeContext
      if (!ctx) return null
      if (catKey === 'OrgEntityToOrgDto')   return ctx.organisation?.mrid   || null
      if (catKey === 'SubstationDto')        return ctx.substation?.mrid     || null
      if (catKey === 'VoltageLevelDto')      return ctx.voltageLevel?.mrid   || null
      if (catKey === 'Bay')                  return ctx.bay?.mrid            || null
      if (catKey.startsWith('Asset_')) {
        if (!ctx.asset) return null
        const expectedKey = this.assetTypeToKey[ctx.asset.assetType]
        return catKey === expectedKey ? ctx.asset.mrid : null
      }
      if (catKey.startsWith('Job_')) {
        if (!ctx.job) return null
        // Job type matching: extract asset type from catKey
        const jobTypeMap = {
          'Job_TransformerJobDto': 'Transformer', 'Job_VoltageTransformerJobDto': 'Voltage transformer',
          'Job_CurrentTransformerJobDto': 'Current transformer', 'Job_CircuitBreakerJobDto': 'Circuit breaker',
          'Job_PowerCableJobDto': 'Power cable', 'Job_SurgeArresterJobDto': 'Surge arrester',
          'Job_ReactorJobDto': 'Reactor', 'Job_CapacitorJobDto': 'Capacitor',
          'Job_DisconnectorJobDto': 'Disconnector', 'Job_RotatingMachineJobDto': 'Rotating machine',
          'Job_BushingJobDto': 'Bushing',
        }
        const expectedAsset = jobTypeMap[catKey]
        return ctx.job.assetType === expectedAsset ? ctx.job.mrid : null
      }
      return null
    },
    async buildDtoForCat(cat) {
      const nodeId = this.getNodeIdForCat(cat.key)
      if (!nodeId) return {}
      try {
        let flatMap = {}
        let arrayMap = null
        if (cat.key === 'OrgEntityToOrgDto') {
          const rs = await window.electronAPI.getOrganisationEntityByMrid(nodeId); if (!rs?.success || !rs.data) return {}
          const dto = OrgEntityToOrgDto(rs.data)
          flatMap = { name: dto.name||'', aliasName: dto.aliasName||'', tax_code: dto.tax_code||'', street: dto.street||'', ward_or_commune: dto.ward_or_commune||'', district_or_town: dto.district_or_town||'', city: dto.city||'', state_or_province: dto.state_or_province||'', postal_code: dto.postal_code||'', country: dto.country||'', phoneNumber: dto.phoneNumber||'', fax: dto.fax||'', email: dto.email||'', comment: dto.comment||'', pos_x: (dto.positionPoints?.x||[]).map(p=>p.coor).join(', '), pos_y: (dto.positionPoints?.y||[]).map(p=>p.coor).join(', '), pos_z: (dto.positionPoints?.z||[]).map(p=>p.coor).join(', ') }
        }
        else if (cat.key === 'SubstationDto') {
          const rs = await window.electronAPI.getSubstationEntityByMrid(nodeId); if (!rs?.success || !rs.data) return {}
          const dto = substationEntityToDto(rs.data)
          flatMap = { name: dto.name||'', aliasName: dto.aliasName||'', type: dto.type||'', generation: dto.generation||'', industry: dto.industry||'', locationName: dto.locationName||'', street: dto.street||'', ward_or_commune: dto.ward_or_commune||'', district_or_town: dto.district_or_town||'', state_or_province: dto.state_or_province||'', city: dto.city||'', country: dto.country||'', personName: dto.personName||'', department: dto.department||'', position: dto.position||'', phoneNumber: dto.phoneNumber||'', fax: dto.fax||'', email: dto.email||'', comment: dto.comment||'', pos_x: (dto.positionPoints?.x||[]).map(p=>p.coor).join(', '), pos_y: (dto.positionPoints?.y||[]).map(p=>p.coor).join(', '), pos_z: (dto.positionPoints?.z||[]).map(p=>p.coor).join(', ') }
        }
        else if (cat.key === 'VoltageLevelDto') {
          const rs = await window.electronAPI.getVoltageLevelEntityByMrid(nodeId); if (!rs?.success || !rs.data) return {}
          const dto = volEntityToVolDto(rs.data)
          flatMap = { name: dto.name||'', comment: dto.comment||'', high_voltage_limit_value: dto.high_voltage_limit_value||'', low_voltage_limit_value: dto.low_voltage_limit_value||'', base_voltage_value: dto.base_voltage_value||'' }
        }
        else if (cat.key === 'Bay') {
          const rs = await window.electronAPI.getBayEntityByMrid(nodeId); if (!rs?.success || !rs.data) return {}
          const e = rs.data
          flatMap = { name: e.name||'', aliasName: e.aliasName||'', breaker_configuration: e.breaker_configuration||e.breakerConfiguration||'', bus_bar_configuration: e.bus_bar_configuration||e.busBarConfiguration||'' }
        }
        else if (cat.key === 'Asset_TransformerDataDto') {
          const rs = await window.electronAPI.getTransformerEntityByMrid(nodeId); if (!rs?.success || !rs.data) return {}
          const dto = transformerEntityToDto(rs.data)
          const r = dto.ratings||{}, imp = dto.impedances||{}, oth = dto.others||{}, tc = dto.tap_changers||{}, wc = dto.winding_configuration||{}
          flatMap = { ...this.mapProps(dto.properties), phases: wc.phases||'', vector_group_custom: wc.vector_group_custom||'', unsupported_vector_group: wc.unsupported_vector_group||'', vector_group_data: wc.vector_group_data||'', rated_frequency: v(r.rated_frequency), short_circuit_ka: v(r.short_circuit?.ka), short_circuit_s: v(r.short_circuit?.s), category: oth.category||'', status: oth.status||'', tank_type: oth.tank_type||'', insulation_medium: oth.insulation_medium||'', total_weight: v(oth.total_weight), insulation_weight: v(oth.insulation?.weight), insulation_volume: v(oth.insulation?.volume), winding_prim: oth.winding?.prim||'', winding_sec: oth.winding?.sec||'', winding_tert: oth.winding?.tert||'', tap_mode: tc.mode||'', tap_serial_no: tc.serial_no||'', tap_manufacturer: tc.manufacturer||'', tap_manufacturer_type: tc.manufacturer_type||'', tap_winding: tc.winding||'', tap_scheme: tc.tap_scheme||'', no_of_taps: String(tc.no_of_taps||''), ref_temp: v(imp.ref_temp), zsi_base_power: v(imp.zero_sequence_impedance?.base_power?.data), zsi_base_voltage: v(imp.zero_sequence_impedance?.base_voltage?.data), zsi_zero: v(imp.zero_sequence_impedance?.zero_percent?.zero?.data), zsi_prim: v(imp.zero_sequence_impedance?.zero_percent?.prim?.data), zsi_sec: v(imp.zero_sequence_impedance?.zero_percent?.sec?.data) }
          // array-based fields → arrayMap (occurrence-indexed)
          arrayMap = {
            vr_winding:            (r.voltage_ratings||[]).map(x => x.winding||''),
            vr_voltage_ll:         (r.voltage_ratings||[]).map(x => v(x.voltage_ll)),
            vr_voltage_ln:         (r.voltage_ratings||[]).map(x => v(x.voltage_ln)),
            vr_insul_level_ll:     (r.voltage_ratings||[]).map(x => v(x.insul_level_ll)),
            vr_insulation_class:   (r.voltage_ratings||[]).map(x => x.insulation_class||''),
            vr_voltage_regulation: (r.voltage_ratings||[]).map(x => x.voltage_regulation||''),
            pr_rated_power:        (r.power_ratings||[]).map(x => v(x.rated_power)),
            pr_cooling_class:      (r.power_ratings||[]).map(x => x.cooling_class||''),
            pr_temp_rise_wind:     (r.power_ratings||[]).map(x => v(x.temp_rise_wind)),
            cr_prim:               (r.current_ratings||[]).map(x => v(x.prim?.data)),
            cr_sec:                (r.current_ratings||[]).map(x => v(x.sec?.data)),
            cr_tert:               (r.current_ratings||[]).map(x => v(x.tert?.data)),
            ps_uk:                 (imp.prim_sec||[]).map(x => v(x.short_circuit_impedances_uk)),
            ps_base_power:         (imp.prim_sec||[]).map(x => v(x.base_power?.data)),
            ps_base_voltage:       (imp.prim_sec||[]).map(x => v(x.base_voltage?.data)),
            ps_load_losses:        (imp.prim_sec||[]).map(x => v(x.load_losses_pk)),
            pt_uk:                 (imp.prim_tert||[]).map(x => v(x.short_circuit_impedances_uk)),
            pt_base_power:         (imp.prim_tert||[]).map(x => v(x.base_power?.data)),
            pt_base_voltage:       (imp.prim_tert||[]).map(x => v(x.base_voltage?.data)),
            pt_load_losses:        (imp.prim_tert||[]).map(x => v(x.load_losses_pk)),
            st_uk:                 (imp.sec_tert||[]).map(x => v(x.short_circuit_impedances_uk)),
            st_base_power:         (imp.sec_tert||[]).map(x => v(x.base_power?.data)),
            st_base_voltage:       (imp.sec_tert||[]).map(x => v(x.base_voltage?.data)),
            st_load_losses:        (imp.sec_tert||[]).map(x => v(x.load_losses_pk)),
            // bushing_data: prim / sec / tert
            bushing_prim_pos:                (dto.bushing_data?.prim||[]).map(x => String(x.pos||'')),
            bushing_prim_asset_type:         (dto.bushing_data?.prim||[]).map(x => x.asset_type||''),
            bushing_prim_serial_no:          (dto.bushing_data?.prim||[]).map(x => x.serial_no||''),
            bushing_prim_manufacturer:       (dto.bushing_data?.prim||[]).map(x => x.manufacturer||''),
            bushing_prim_manufacturer_type:  (dto.bushing_data?.prim||[]).map(x => x.manufacturer_type||''),
            bushing_prim_manufacturer_year:  (dto.bushing_data?.prim||[]).map(x => x.manufacturer_year||''),
            bushing_prim_insulation_level:   (dto.bushing_data?.prim||[]).map(x => v(x.insulation_level)),
            bushing_prim_voltage_l_ground:   (dto.bushing_data?.prim||[]).map(x => v(x.voltage_l_ground)),
            bushing_prim_max_system_voltage: (dto.bushing_data?.prim||[]).map(x => v(x.max_system_voltage)),
            bushing_prim_rate_current:       (dto.bushing_data?.prim||[]).map(x => v(x.rate_current)),
            bushing_prim_df_c1:              (dto.bushing_data?.prim||[]).map(x => v(x.df_c1)),
            bushing_prim_cap_c1:             (dto.bushing_data?.prim||[]).map(x => v(x.cap_c1)),
            bushing_prim_df_c2:              (dto.bushing_data?.prim||[]).map(x => v(x.df_c2)),
            bushing_prim_cap_c2:             (dto.bushing_data?.prim||[]).map(x => v(x.cap_c2)),
            bushing_prim_insulation_type:    (dto.bushing_data?.prim||[]).map(x => x.insulation_type||''),
            bushing_sec_pos:                (dto.bushing_data?.sec||[]).map(x => String(x.pos||'')),
            bushing_sec_asset_type:         (dto.bushing_data?.sec||[]).map(x => x.asset_type||''),
            bushing_sec_serial_no:          (dto.bushing_data?.sec||[]).map(x => x.serial_no||''),
            bushing_sec_manufacturer:       (dto.bushing_data?.sec||[]).map(x => x.manufacturer||''),
            bushing_sec_manufacturer_type:  (dto.bushing_data?.sec||[]).map(x => x.manufacturer_type||''),
            bushing_sec_manufacturer_year:  (dto.bushing_data?.sec||[]).map(x => x.manufacturer_year||''),
            bushing_sec_insulation_level:   (dto.bushing_data?.sec||[]).map(x => v(x.insulation_level)),
            bushing_sec_voltage_l_ground:   (dto.bushing_data?.sec||[]).map(x => v(x.voltage_l_ground)),
            bushing_sec_max_system_voltage: (dto.bushing_data?.sec||[]).map(x => v(x.max_system_voltage)),
            bushing_sec_rate_current:       (dto.bushing_data?.sec||[]).map(x => v(x.rate_current)),
            bushing_sec_df_c1:              (dto.bushing_data?.sec||[]).map(x => v(x.df_c1)),
            bushing_sec_cap_c1:             (dto.bushing_data?.sec||[]).map(x => v(x.cap_c1)),
            bushing_sec_df_c2:              (dto.bushing_data?.sec||[]).map(x => v(x.df_c2)),
            bushing_sec_cap_c2:             (dto.bushing_data?.sec||[]).map(x => v(x.cap_c2)),
            bushing_sec_insulation_type:    (dto.bushing_data?.sec||[]).map(x => x.insulation_type||''),
            bushing_tert_pos:                (dto.bushing_data?.tert||[]).map(x => String(x.pos||'')),
            bushing_tert_asset_type:         (dto.bushing_data?.tert||[]).map(x => x.asset_type||''),
            bushing_tert_serial_no:          (dto.bushing_data?.tert||[]).map(x => x.serial_no||''),
            bushing_tert_manufacturer:       (dto.bushing_data?.tert||[]).map(x => x.manufacturer||''),
            bushing_tert_manufacturer_type:  (dto.bushing_data?.tert||[]).map(x => x.manufacturer_type||''),
            bushing_tert_manufacturer_year:  (dto.bushing_data?.tert||[]).map(x => x.manufacturer_year||''),
            bushing_tert_insulation_level:   (dto.bushing_data?.tert||[]).map(x => v(x.insulation_level)),
            bushing_tert_voltage_l_ground:   (dto.bushing_data?.tert||[]).map(x => v(x.voltage_l_ground)),
            bushing_tert_max_system_voltage: (dto.bushing_data?.tert||[]).map(x => v(x.max_system_voltage)),
            bushing_tert_rate_current:       (dto.bushing_data?.tert||[]).map(x => v(x.rate_current)),
            bushing_tert_df_c1:              (dto.bushing_data?.tert||[]).map(x => v(x.df_c1)),
            bushing_tert_cap_c1:             (dto.bushing_data?.tert||[]).map(x => v(x.cap_c1)),
            bushing_tert_df_c2:              (dto.bushing_data?.tert||[]).map(x => v(x.df_c2)),
            bushing_tert_cap_c2:             (dto.bushing_data?.tert||[]).map(x => v(x.cap_c2)),
            bushing_tert_insulation_type:    (dto.bushing_data?.tert||[]).map(x => x.insulation_type||''),
            // surge_arrester.prim
            sa_prim_serial_no:           (dto.surge_arrester?.prim||[]).map(x => x.properties?.serial_no||''),
            sa_prim_manufacturer:        (dto.surge_arrester?.prim||[]).map(x => x.properties?.manufacturer||''),
            sa_prim_manufacturer_year:   (dto.surge_arrester?.prim||[]).map(x => x.properties?.manufacturer_year||''),
            sa_prim_asset_system_code:   (dto.surge_arrester?.prim||[]).map(x => x.properties?.asset_system_code||''),
            sa_prim_unit:                (dto.surge_arrester?.prim||[]).map(x => String(x.ratings?.unit||'')),
            sa_prim_table_serial:        (dto.surge_arrester?.prim||[]).map(x => x.ratings?.table?.[0]?.serial||''),
            sa_prim_table_voltageLl:     (dto.surge_arrester?.prim||[]).map(x => v(x.ratings?.table?.[0]?.voltageLl)),
            sa_prim_table_voltageLn:     (dto.surge_arrester?.prim||[]).map(x => v(x.ratings?.table?.[0]?.voltageLn)),
            sa_prim_table_mcovRating:    (dto.surge_arrester?.prim||[]).map(x => v(x.ratings?.table?.[0]?.mcovRating)),
            // surge_arrester.sec
            sa_sec_serial_no:           (dto.surge_arrester?.sec||[]).map(x => x.properties?.serial_no||''),
            sa_sec_manufacturer:        (dto.surge_arrester?.sec||[]).map(x => x.properties?.manufacturer||''),
            sa_sec_manufacturer_year:   (dto.surge_arrester?.sec||[]).map(x => x.properties?.manufacturer_year||''),
            sa_sec_asset_system_code:   (dto.surge_arrester?.sec||[]).map(x => x.properties?.asset_system_code||''),
            sa_sec_unit:                (dto.surge_arrester?.sec||[]).map(x => String(x.ratings?.unit||'')),
            sa_sec_table_serial:        (dto.surge_arrester?.sec||[]).map(x => x.ratings?.table?.[0]?.serial||''),
            sa_sec_table_voltageLl:     (dto.surge_arrester?.sec||[]).map(x => v(x.ratings?.table?.[0]?.voltageLl)),
            sa_sec_table_voltageLn:     (dto.surge_arrester?.sec||[]).map(x => v(x.ratings?.table?.[0]?.voltageLn)),
            sa_sec_table_mcovRating:    (dto.surge_arrester?.sec||[]).map(x => v(x.ratings?.table?.[0]?.mcovRating)),
            // surge_arrester.tert
            sa_tert_serial_no:           (dto.surge_arrester?.tert||[]).map(x => x.properties?.serial_no||''),
            sa_tert_manufacturer:        (dto.surge_arrester?.tert||[]).map(x => x.properties?.manufacturer||''),
            sa_tert_manufacturer_year:   (dto.surge_arrester?.tert||[]).map(x => x.properties?.manufacturer_year||''),
            sa_tert_asset_system_code:   (dto.surge_arrester?.tert||[]).map(x => x.properties?.asset_system_code||''),
            sa_tert_unit:                (dto.surge_arrester?.tert||[]).map(x => String(x.ratings?.unit||'')),
            sa_tert_table_serial:        (dto.surge_arrester?.tert||[]).map(x => x.ratings?.table?.[0]?.serial||''),
            sa_tert_table_voltageLl:     (dto.surge_arrester?.tert||[]).map(x => v(x.ratings?.table?.[0]?.voltageLl)),
            sa_tert_table_voltageLn:     (dto.surge_arrester?.tert||[]).map(x => v(x.ratings?.table?.[0]?.voltageLn)),
            sa_tert_table_mcovRating:    (dto.surge_arrester?.tert||[]).map(x => v(x.ratings?.table?.[0]?.mcovRating)),
          }
        }
        else if (cat.key === 'Asset_VoltageTransformerDto') {
          const rs = await window.electronAPI.getVoltageTransformerEntityByMrid(nodeId); if (!rs?.success || !rs.data) return {}
          const dto = voltageTransformerEntityToDto(rs.data); const r = dto.ratings||{}, cfg = dto.vt_Configuration||{}
          flatMap = { ...this.mapProps(dto.properties), standard: r.standard||'', rated_frequency: v(r.rated_frequency), upr: String(r.upr||''), rated_voltage: v(r.rated_voltage), c1: v(r.c1), c2: v(r.c2), windings: String(cfg.windings||'') }
          // dataVT → arrayMap (occurrence-indexed by winding)
          arrayMap = {
            usr_formula:        (cfg.dataVT||[]).map(x => x.usr_formula||''),
            usr_rated_voltage:  (cfg.dataVT||[]).map(x => v(x.usr_rated_voltage)),
            rated_burden:       (cfg.dataVT||[]).map(x => v(x.rated_burden)),
            rated_power_factor: (cfg.dataVT||[]).map(x => String(x.rated_power_factor||'')),
          }
        }
        else if (cat.key === 'Asset_CurrentTransformerDto') {
          const rs = await window.electronAPI.getCurrentTransformerEntityByMrid(nodeId); if (!rs?.success || !rs.data) return {}
          const dto = currentTransformerEntityToDto(rs.data); const r = dto.ratings||{}, cfg = dto.ctConfiguration||{}
          flatMap = { ...this.mapProps(dto.properties), standard: v(r.standard), rated_frequency: v(r.rated_frequency), primary_winding_count: String(r.primary_winding_count||''), um_rms: v(r.um_rms), u_withstand_rms: v(r.u_withstand_rms), u_lightning_peak: v(r.u_lightning_peak), icth: v(r.icth), idyn_peak: v(r.idyn_peak), ith_rms: v(r.ith_rms), ith_duration: v(r.ith_duration), system_voltage: v(r.system_voltage), bil: v(r.bil), rating_factor: String(r.rating_factor||''), ct_cores: String(cfg.cores||'') }
          // dataCT → arrayMap (occurrence-indexed by core = tất cả fields mỗi core)
          const d = cfg.dataCT || []
          arrayMap = {
            ct_taps:        d.map(x => String(x.taps||'')),
            ct_commonTap:   d.map(x => String(x.commonTap||'')),
            // fullTap.table
            ct_fulltap_name:  d.map(x => x.fullTap?.table?.name||''),
            ct_fulltap_ipn:   d.map(x => v(x.fullTap?.table?.ipn)),
            ct_fulltap_isn:   d.map(x => v(x.fullTap?.table?.isn)),
            ct_fulltap_inuse: d.map(x => String(x.fullTap?.table?.inUse||false)),
            // fullTap.classRating
            ct_class_app:           d.map(x => x.fullTap?.classRating?.app||''),
            ct_class:               d.map(x => x.fullTap?.classRating?.class||''),
            ct_class_wr:            d.map(x => v(x.fullTap?.classRating?.wr)),
            ct_class_kx:            d.map(x => String(x.fullTap?.classRating?.kx||'')),
            ct_class_re20lsn:       d.map(x => String(x.fullTap?.classRating?.re20lsn||'')),
            ct_class_k:             d.map(x => String(x.fullTap?.classRating?.k||'')),
            ct_class_fs:            d.map(x => String(x.fullTap?.classRating?.fs||'')),
            ct_class_kssc:          d.map(x => String(x.fullTap?.classRating?.kssc||'')),
            ct_class_ktd:           d.map(x => String(x.fullTap?.classRating?.ktd||'')),
            ct_class_duty:          d.map(x => x.fullTap?.classRating?.duty||''),
            ct_class_vb:            d.map(x => v(x.fullTap?.classRating?.vb)),
            ct_class_alf:           d.map(x => String(x.fullTap?.classRating?.alf||'')),
            ct_class_ts:            d.map(x => String(x.fullTap?.classRating?.ts||'')),
            ct_class_ek:            d.map(x => String(x.fullTap?.classRating?.ek||'')),
            ct_class_le:            d.map(x => String(x.fullTap?.classRating?.le||'')),
            ct_class_e1:            d.map(x => String(x.fullTap?.classRating?.e1||'')),
            ct_class_le1:           d.map(x => String(x.fullTap?.classRating?.le1||'')),
            ct_class_val:           d.map(x => String(x.fullTap?.classRating?.val||'')),
            ct_class_lal:           d.map(x => String(x.fullTap?.classRating?.lal||'')),
            ct_class_t1:            d.map(x => String(x.fullTap?.classRating?.t1||'')),
            ct_class_tal1:          d.map(x => String(x.fullTap?.classRating?.tal1||'')),
            ct_class_tp:            d.map(x => String(x.fullTap?.classRating?.tp||'')),
            ct_class_tpts:          d.map(x => String(x.fullTap?.classRating?.tpts||'')),
            ct_class_vk:            d.map(x => String(x.fullTap?.classRating?.vk||'')),
            ct_class_lk:            d.map(x => String(x.fullTap?.classRating?.lk||'')),
            ct_class_vk1:           d.map(x => String(x.fullTap?.classRating?.vk1||'')),
            ct_class_lk1:           d.map(x => String(x.fullTap?.classRating?.lk1||'')),
            ct_class_rated_burden:  d.map(x => v(x.fullTap?.classRating?.rated_burden)),
            ct_class_burden:        d.map(x => v(x.fullTap?.classRating?.burden)),
            ct_class_burden_cos:    d.map(x => String(x.fullTap?.classRating?.burdenCos||'')),
            ct_class_op_burden:     d.map(x => v(x.fullTap?.classRating?.operatingBurden)),
            ct_class_op_burden_cos: d.map(x => String(x.fullTap?.classRating?.operatingBurdenCos||'')),
            // mainTap.data[0]
            ct_main_ipn:           d.map(x => v(x.mainTap?.data?.[0]?.table?.ipn)),
            ct_main_isn:           d.map(x => v(x.mainTap?.data?.[0]?.table?.isn)),
            ct_main_rated_burden:  d.map(x => v(x.mainTap?.data?.[0]?.classRating?.rated_burden)),
            ct_main_burden:        d.map(x => v(x.mainTap?.data?.[0]?.classRating?.burden)),
            ct_main_burden_cos:    d.map(x => String(x.mainTap?.data?.[0]?.classRating?.burdenCos||'')),
            ct_main_op_burden:     d.map(x => v(x.mainTap?.data?.[0]?.classRating?.operatingBurden)),
            ct_main_op_burden_cos: d.map(x => String(x.mainTap?.data?.[0]?.classRating?.operatingBurdenCos||'')),
            // interTap.data[0]
            ct_inter_ipn:           d.map(x => v(x.interTap?.data?.[0]?.table?.ipn)),
            ct_inter_isn:           d.map(x => v(x.interTap?.data?.[0]?.table?.isn)),
            ct_inter_rated_burden:  d.map(x => v(x.interTap?.data?.[0]?.classRating?.rated_burden)),
            ct_inter_burden:        d.map(x => v(x.interTap?.data?.[0]?.classRating?.burden)),
            ct_inter_burden_cos:    d.map(x => String(x.interTap?.data?.[0]?.classRating?.burdenCos||'')),
            ct_inter_op_burden:     d.map(x => v(x.interTap?.data?.[0]?.classRating?.operatingBurden)),
            ct_inter_op_burden_cos: d.map(x => String(x.interTap?.data?.[0]?.classRating?.operatingBurdenCos||'')),
          }
        }
        else if (cat.key === 'Asset_CircuitBreakerDto') {
          const rs = await window.electronAPI.getCircuitBreakerEntityByMrid(nodeId); if (!rs?.success || !rs.data) return {}
          const dto = breakerEntityToDto(rs.data); const cb = dto.circuitBreaker||{}, r = dto.ratings||{}, cs = dto.contactSystem||{}, oth = dto.others||{}, op = dto.operating||{}
          flatMap = { ...this.mapProps(dto.properties), numberOfPhases: String(cb.numberOfPhases||''), interruptersPerPhase: String(cb.interruptersPerPhase||''), poleOperation: cb.poleOperation||'', hasPIR: String(cb.hasPIR||''), pirValue: v(cb.pirValue), hasGradingCapacitors: String(cb.hasGradingCapacitors||''), capacitorValue: v(cb.capacitorValue), interruptingMedium: cb.interruptingMedium||'', tankType: cb.tankType||'', rated_voltage_ll: v(r.rated_voltage_ll), rated_current: v(r.rated_current), rated_frequency: v(r.rated_frequency), rated_short_circuit_breaking_current: v(r.rated_short_circuit_breaking_current), short_circuit_nominal_duration: v(r.short_circuit_nominal_duration), rated_insulation_level: v(r.rated_insulation_level), rated_interrupting_time: v(r.rated_interrupting_time), interrupting_duty_cycle: String(r.interrupting_duty_cycle||''), rated_power_at_closing: v(r.rated_power_at_closing), rated_power_at_opening: v(r.rated_power_at_opening), rated_power_at_motor_charge: v(r.rated_power_at_motor_charge), nominal_total_travel: v(cs.nominal_total_travel), damping_time: v(cs.damping_time), nozzle_length: v(cs.nozzle_length), total_weight_with_gas: v(oth.total_weight_with_gas), weight_of_gas: v(oth.weight_of_gas), volume_of_gas: v(oth.volume_of_gas), rated_gas_pressure: v(oth.rated_gas_pressure), rated_gas_temperature: v(oth.rated_gas_temperature), op_type: op.type||'', op_serial_no: op.serial_no||'', op_manufacturer: op.manufacturer||'', op_manufacturer_year: op.manufacturer_year||'', op_manufacturer_type: op.manufacturer_type||'', number_of_trip_coil: String(op.number_of_trip_coil||''), number_of_close_coil: String(op.number_of_close_coil||''), op_comment: op.comment||'',
            op_pressure:      v(op.rated_operating_pressure),
            op_pressure_temp: v(op.rated_operating_pressure_temperature),
            motor_rated_voltage: v(op.motor?.rated_voltage), motor_rated_current: v(op.motor?.rated_current), motor_power: op.motor?.power||'', motor_frequency: v(op.motor?.frequency),
            aux_rated_voltage:   v(op.auxiliary_circuits?.rated_voltage), aux_rated_current: v(op.auxiliary_circuits?.rated_current), aux_power: op.auxiliary_circuits?.power||'', aux_frequency: v(op.auxiliary_circuits?.frequency),
            // assessment limits
            assess_limits: String(dto.assessmentLimits?.limits||''),
            cr_abs_r_min: v(dto.assessmentLimits?.contact_resistance.abs?.r_min), cr_abs_r_max: v(dto.assessmentLimits?.contact_resistance.abs?.r_max),
            cr_rel_r_ref: v(dto.assessmentLimits?.contact_resistance.rel?.r_ref), cr_rel_r_dev: v(dto.assessmentLimits?.contact_resistance.rel?.r_dev),
            // operating_time
            ot_opening_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.opening_time?.t_min), ot_opening_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.opening_time?.t_max),
            ot_opening_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.opening_time?.t_ref), ot_opening_rel_p_t_dev: v(dto.assessmentLimits?.operating_time.rel.opening_time?.plus_t_dev), ot_opening_rel_m_t_dev: v(dto.assessmentLimits?.operating_time.rel.opening_time?.minus_t_dev),
            ot_oswp_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.opening_sync_within_phase?.t_min), ot_oswp_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.opening_sync_within_phase?.t_max), ot_oswp_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.opening_sync_within_phase?.t_ref),
            ot_osbp_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.opening_sync_breaker_phase?.t_min), ot_osbp_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.opening_sync_breaker_phase?.t_max), ot_osbp_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.opening_sync_breaker_phase?.t_ref),
            ot_closing_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.closing_time?.t_min), ot_closing_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.closing_time?.t_max),
            ot_closing_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.closing_time?.t_ref), ot_closing_rel_p_t_dev: v(dto.assessmentLimits?.operating_time.rel.closing_time?.plus_t_dev), ot_closing_rel_m_t_dev: v(dto.assessmentLimits?.operating_time.rel.closing_time?.minus_t_dev),
            ot_cswp_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.closing_sync_within_phase?.t_min), ot_cswp_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.closing_sync_within_phase?.t_max), ot_cswp_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.closing_sync_within_phase?.t_ref),
            ot_csbp_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.closing_sync_breaker_phase?.t_min), ot_csbp_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.closing_sync_breaker_phase?.t_max), ot_csbp_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.closing_sync_breaker_phase?.t_ref),
            ot_reclosing_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.reclosing_time?.t_min), ot_reclosing_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.reclosing_time?.t_max), ot_reclosing_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.reclosing_time?.t_ref),
            ot_co_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.close_open_time?.t_min), ot_co_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.close_open_time?.t_max), ot_co_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.close_open_time?.t_ref),
            ot_oc_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.open_close_time?.t_min), ot_oc_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.open_close_time?.t_max), ot_oc_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.open_close_time?.t_ref),
            // contact_travel
            ct_total_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.total_travel?.d_min), ct_total_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.total_travel?.d_max), ct_total_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.total_travel?.d_ref), ct_total_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.total_travel?.d_dev),
            ct_ot_trip_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.over_travel_trip?.d_min), ct_ot_trip_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.over_travel_trip?.d_max), ct_ot_trip_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.over_travel_trip?.d_ref), ct_ot_trip_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.over_travel_trip?.d_dev),
            ct_ot_close_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.over_travel_close?.d_min), ct_ot_close_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.over_travel_close?.d_max), ct_ot_close_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.over_travel_close?.d_ref), ct_ot_close_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.over_travel_close?.d_dev),
            ct_rb_trip_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.rebound_trip?.d_min), ct_rb_trip_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.rebound_trip?.d_max), ct_rb_trip_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.rebound_trip?.d_ref), ct_rb_trip_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.rebound_trip?.d_dev),
            ct_rb_close_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.rebound_close?.d_min), ct_rb_close_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.rebound_close?.d_max), ct_rb_close_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.rebound_close?.d_ref), ct_rb_close_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.rebound_close?.d_dev),
            ct_cw_trip_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.contact_wipe_trip?.d_min), ct_cw_trip_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.contact_wipe_trip?.d_max), ct_cw_trip_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.contact_wipe_trip?.d_ref), ct_cw_trip_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.contact_wipe_trip?.d_dev),
            ct_cw_close_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.contact_wipe_close?.d_min), ct_cw_close_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.contact_wipe_close?.d_max), ct_cw_close_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.contact_wipe_close?.d_ref), ct_cw_close_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.contact_wipe_close?.d_dev),
            ct_dd_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.damping_distance?.d_min), ct_dd_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.damping_distance?.d_max), ct_dd_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.damping_distance?.d_ref), ct_dd_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.damping_distance?.d_dev),
            // auxiliary_contacts
            ac_trip_stta_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.switching_time_type_a?.t_min), ac_trip_stta_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.switching_time_type_a?.t_max), ac_trip_stta_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.switching_time_type_a?.t_ref), ac_trip_stta_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.switching_time_type_a?.t_dev),
            ac_trip_dmta_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.diff_to_main_type_a?.t_min), ac_trip_dmta_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.diff_to_main_type_a?.t_max), ac_trip_dmta_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.diff_to_main_type_a?.t_ref), ac_trip_dmta_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.diff_to_main_type_a?.t_dev),
            ac_trip_sttb_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.switching_time_type_b?.t_min), ac_trip_sttb_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.switching_time_type_b?.t_max), ac_trip_sttb_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.switching_time_type_b?.t_ref), ac_trip_sttb_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.switching_time_type_b?.t_dev),
            ac_trip_dmtb_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.diff_to_main_type_b?.t_min), ac_trip_dmtb_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.diff_to_main_type_b?.t_max), ac_trip_dmtb_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.diff_to_main_type_b?.t_ref), ac_trip_dmtb_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.diff_to_main_type_b?.t_dev),
            ac_trip_stw_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.switching_time_wiper?.t_min), ac_trip_stw_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.switching_time_wiper?.t_max), ac_trip_stw_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.switching_time_wiper?.t_ref), ac_trip_stw_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.switching_time_wiper?.t_dev),
            ac_trip_dur_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.duration?.t_min), ac_trip_dur_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.duration?.t_max), ac_trip_dur_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.duration?.t_ref), ac_trip_dur_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.duration?.t_dev),
            ac_close_stta_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.switching_time_type_a?.t_min), ac_close_stta_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.switching_time_type_a?.t_max), ac_close_stta_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.switching_time_type_a?.t_ref), ac_close_stta_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.switching_time_type_a?.t_dev),
            ac_close_dmta_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.diff_to_main_type_a?.t_min), ac_close_dmta_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.diff_to_main_type_a?.t_max), ac_close_dmta_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.diff_to_main_type_a?.t_ref), ac_close_dmta_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.diff_to_main_type_a?.t_dev),
            ac_close_sttb_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.switching_time_type_b?.t_min), ac_close_sttb_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.switching_time_type_b?.t_max), ac_close_sttb_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.switching_time_type_b?.t_ref), ac_close_sttb_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.switching_time_type_b?.t_dev),
            ac_close_dmtb_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.diff_to_main_type_b?.t_min), ac_close_dmtb_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.diff_to_main_type_b?.t_max), ac_close_dmtb_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.diff_to_main_type_b?.t_ref), ac_close_dmtb_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.diff_to_main_type_b?.t_dev),
            ac_close_stw_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.switching_time_wiper?.t_min), ac_close_stw_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.switching_time_wiper?.t_max), ac_close_stw_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.switching_time_wiper?.t_ref), ac_close_stw_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.switching_time_wiper?.t_dev),
            ac_close_dur_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.duration?.t_min), ac_close_dur_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.duration?.t_max), ac_close_dur_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.duration?.t_ref), ac_close_dur_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.duration?.t_dev),
            // miscellaneous
            misc_bt_abs_min: v(dto.assessmentLimits?.miscellaneous.abs.bounce_time?.min), misc_bt_abs_max: v(dto.assessmentLimits?.miscellaneous.abs.bounce_time?.max), misc_bt_rel_ref: v(dto.assessmentLimits?.miscellaneous.rel.bounce_time?.ref), misc_bt_rel_dev: v(dto.assessmentLimits?.miscellaneous.rel.bounce_time?.dev),
            misc_bc_abs_min: v(dto.assessmentLimits?.miscellaneous.abs.bounce_count?.min), misc_bc_abs_max: v(dto.assessmentLimits?.miscellaneous.abs.bounce_count?.max), misc_bc_rel_ref: v(dto.assessmentLimits?.miscellaneous.rel.bounce_count?.ref), misc_bc_rel_dev: v(dto.assessmentLimits?.miscellaneous.rel.bounce_count?.dev),
            misc_pct_abs_min: v(dto.assessmentLimits?.miscellaneous.abs.pir_close_time?.min), misc_pct_abs_max: v(dto.assessmentLimits?.miscellaneous.abs.pir_close_time?.max), misc_pct_rel_ref: v(dto.assessmentLimits?.miscellaneous.rel.pir_close_time?.ref), misc_pct_rel_dev: v(dto.assessmentLimits?.miscellaneous.rel.pir_close_time?.dev),
            misc_rt_abs_min: v(dto.assessmentLimits?.miscellaneous.abs.reaction_time?.min), misc_rt_abs_max: v(dto.assessmentLimits?.miscellaneous.abs.reaction_time?.max), misc_rt_rel_ref: v(dto.assessmentLimits?.miscellaneous.rel.reaction_time?.ref), misc_rt_rel_dev: v(dto.assessmentLimits?.miscellaneous.rel.reaction_time?.dev),
            // coil_characteristics
            cc_peak_close_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.peak_close_coil_current?.min), cc_peak_close_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.peak_close_coil_current?.max), cc_peak_close_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.peak_close_coil_current?.ref), cc_peak_close_rel_m_dev: v(dto.assessmentLimits?.coil_characteristics.rel.peak_close_coil_current?.minus_dev), cc_peak_close_rel_p_dev: v(dto.assessmentLimits?.coil_characteristics.rel.peak_close_coil_current?.plus_dev),
            cc_peak_trip_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.peak_trip_coil_current?.min), cc_peak_trip_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.peak_trip_coil_current?.max), cc_peak_trip_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.peak_trip_coil_current?.ref), cc_peak_trip_rel_m_dev: v(dto.assessmentLimits?.coil_characteristics.rel.peak_trip_coil_current?.minus_dev), cc_peak_trip_rel_p_dev: v(dto.assessmentLimits?.coil_characteristics.rel.peak_trip_coil_current?.plus_dev),
            cc_avg_close_i_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.average_close_coil_current?.min), cc_avg_close_i_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.average_close_coil_current?.max), cc_avg_close_i_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.average_close_coil_current?.ref),
            cc_avg_trip_i_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.average_trip_coil_current?.min), cc_avg_trip_i_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.average_trip_coil_current?.max), cc_avg_trip_i_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.average_trip_coil_current?.ref),
            cc_avg_close_u_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.average_close_coil_voltage?.min), cc_avg_close_u_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.average_close_coil_voltage?.max), cc_avg_close_u_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.average_close_coil_voltage?.ref),
            cc_avg_trip_u_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.average_trip_coil_voltage?.min), cc_avg_trip_u_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.average_trip_coil_voltage?.max), cc_avg_trip_u_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.average_trip_coil_voltage?.ref),
            cc_close_res_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.close_coil_resistance?.min), cc_close_res_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.close_coil_resistance?.max), cc_close_res_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.close_coil_resistance?.ref), cc_close_res_rel_m_dev: v(dto.assessmentLimits?.coil_characteristics.rel.close_coil_resistance?.minus_dev), cc_close_res_rel_p_dev: v(dto.assessmentLimits?.coil_characteristics.rel.close_coil_resistance?.plus_dev),
            cc_trip_res_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.trip_coil_resistance?.min), cc_trip_res_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.trip_coil_resistance?.max), cc_trip_res_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.trip_coil_resistance?.ref), cc_trip_res_rel_m_dev: v(dto.assessmentLimits?.coil_characteristics.rel.trip_coil_resistance?.minus_dev), cc_trip_res_rel_p_dev: v(dto.assessmentLimits?.coil_characteristics.rel.trip_coil_resistance?.plus_dev),
            // pickup_voltage
            pv_close_abs_v_min: v(dto.assessmentLimits?.pickup_voltage.abs.min_pickup_voltage_close?.v_min), pv_close_abs_v_max: v(dto.assessmentLimits?.pickup_voltage.abs.min_pickup_voltage_close?.v_max), pv_close_rel_v_ref: v(dto.assessmentLimits?.pickup_voltage.rel.min_pickup_voltage_close?.v_ref), pv_close_rel_v_dev: v(dto.assessmentLimits?.pickup_voltage.rel.min_pickup_voltage_close?.v_dev),
            pv_trip_abs_v_min: v(dto.assessmentLimits?.pickup_voltage.abs.min_pickup_voltage_trip?.v_min), pv_trip_abs_v_max: v(dto.assessmentLimits?.pickup_voltage.abs.min_pickup_voltage_trip?.v_max), pv_trip_rel_v_ref: v(dto.assessmentLimits?.pickup_voltage.rel.min_pickup_voltage_trip?.v_ref), pv_trip_rel_v_dev: v(dto.assessmentLimits?.pickup_voltage.rel.min_pickup_voltage_trip?.v_dev),
            // motor_characteristics
            mc_inrush_abs_min: v(dto.assessmentLimits?.motor_characteristics.abs.inrush_current?.min), mc_inrush_abs_max: v(dto.assessmentLimits?.motor_characteristics.abs.inrush_current?.max), mc_inrush_rel_ref: v(dto.assessmentLimits?.motor_characteristics.rel.inrush_current?.ref), mc_inrush_rel_dev: v(dto.assessmentLimits?.motor_characteristics.rel.inrush_current?.dev),
            mc_chg_t_abs_min: v(dto.assessmentLimits?.motor_characteristics.abs.charging_time?.min), mc_chg_t_abs_max: v(dto.assessmentLimits?.motor_characteristics.abs.charging_time?.max), mc_chg_t_rel_ref: v(dto.assessmentLimits?.motor_characteristics.rel.charging_time?.ref), mc_chg_t_rel_dev: v(dto.assessmentLimits?.motor_characteristics.rel.charging_time?.dev),
            mc_chg_i_abs_min: v(dto.assessmentLimits?.motor_characteristics.abs.charging_current?.min), mc_chg_i_abs_max: v(dto.assessmentLimits?.motor_characteristics.abs.charging_current?.max), mc_chg_i_rel_ref: v(dto.assessmentLimits?.motor_characteristics.rel.charging_current?.ref), mc_chg_i_rel_dev: v(dto.assessmentLimits?.motor_characteristics.rel.charging_current?.dev),
            mc_min_u_abs_min: v(dto.assessmentLimits?.motor_characteristics.abs.minimum_voltage?.min), mc_min_u_abs_max: v(dto.assessmentLimits?.motor_characteristics.abs.minimum_voltage?.max), mc_min_u_rel_ref: v(dto.assessmentLimits?.motor_characteristics.rel.minimum_voltage?.ref), mc_min_u_rel_dev: v(dto.assessmentLimits?.motor_characteristics.rel.minimum_voltage?.dev),
            // under_voltage_release / overcurrent_release
            uvr_abs_v_min: v(dto.assessmentLimits?.under_voltage_release.abs.uv_coil_trip_voltage?.min), uvr_abs_v_max: v(dto.assessmentLimits?.under_voltage_release.abs.uv_coil_trip_voltage?.max),
            uvr_rel_v_ref: v(dto.assessmentLimits?.under_voltage_release.rel.uv_coil_trip_voltage?.ref), uvr_rel_v_dev: v(dto.assessmentLimits?.under_voltage_release.rel.uv_coil_trip_voltage?.dev),
            ocr_abs_min: v(dto.assessmentLimits?.overcurrent_release.abs.oc_replay_trip_current?.min), ocr_abs_max: v(dto.assessmentLimits?.overcurrent_release.abs.oc_replay_trip_current?.max),
            ocr_rel_ref: v(dto.assessmentLimits?.overcurrent_release.rel.oc_replay_trip_current?.ref), ocr_rel_dev: v(dto.assessmentLimits?.overcurrent_release.rel.oc_replay_trip_current?.dev)
          }
          // trip_coil_component[] and close_coil_component[] → arrayMap
          arrayMap = {
            tc_rated_voltage: (op.trip_coil_component||[]).map(x => v(x.rated_voltage)),
            tc_rated_current: (op.trip_coil_component||[]).map(x => v(x.rated_current)),
            tc_power:         (op.trip_coil_component||[]).map(x => x.power||''),
            tc_frequency:     (op.trip_coil_component||[]).map(x => v(x.frequency)),
            cc_rated_voltage: (op.close_coil_component||[]).map(x => v(x.rated_voltage)),
            cc_rated_current: (op.close_coil_component||[]).map(x => v(x.rated_current)),
            cc_power:         (op.close_coil_component||[]).map(x => x.power||''),
            cc_frequency:     (op.close_coil_component||[]).map(x => v(x.frequency)),
          }
        }
        else if (cat.key === 'Asset_PowerCableDTO') {
          const rs = await window.electronAPI.getPowerCableEntityByMrid(nodeId); if (!rs?.success || !rs.data) return {}
          const dto = powerCableEntityToDto(rs.data); const cfg = dto.configsData||{}, rat = dto.ratingsData||{}, oth = dto.othersData||{}, dat = dto.datasData||{}
          flatMap = { ...this.mapProps(dto.properties), phases: v(cfg.phases), cores: v(cfg.cores), rated_voltage: v(rat.rated_voltage), max_voltage: v(rat.max_voltage), rated_frequency: v(rat.rated_frequency), shortcircuit: v(rat.shortcircuit), rated_duration: v(rat.rated_duration), insulation_method: v(oth.insulation_method), bonding_type: v(oth.bonding_type), install_location: v(oth.install_location), cable_length: v(oth.cable_length), conductor_size: v(dat.conductor?.conductor_size), conductor_class: v(dat.conductor?.conductor_class), conductor_material: v(dat.conductor?.conductor_material), conductor_type: v(dat.conductor?.conductor_type), conductor_diameter: v(dat.conductor?.conductor_diameter), insulation_type: v(dat.insulation?.insulation_type), ins_thickness: v(dat.insulation?.thickness), ins_diameter: v(dat.insulation?.diameter), insulation_operating: v(dat.insulation?.insulation_operating), sheath_type: v(dat.sheath?.sheath_type), sheath_construction: v(dat.sheath?.construction), sheath_thickness: v(dat.sheath?.thickness), sheath_diameter: v(dat.sheath?.diameter), armour_material: v(dat.armour?.material), armour_thickness: v(dat.armour?.thickness), armour_diameter: v(dat.armour?.diameter) }
        }
        else if (cat.key === 'Asset_SurgeArresterDto') {
          const rs = await window.electronAPI.getSurgeArresterEntityByMrid(nodeId); if (!rs?.success || !rs.data) return {}
          const dto = surgeArresterEntityToDto(rs.data)
          flatMap = { ...this.mapProps(dto.properties), unitStack: String(dto.ratings?.unitStack||'') }
          arrayMap = {
            sa_serial:          (dto.ratings?.tableRating||[]).map(x => x.serial||''),
            sa_ratedVoltage:    (dto.ratings?.tableRating||[]).map(x => v(x.ratedVoltage)),
            sa_maximumVoltage:  (dto.ratings?.tableRating||[]).map(x => v(x.maximumVoltage)),
            sa_continousVoltage:(dto.ratings?.tableRating||[]).map(x => v(x.continousVoltage)),
            sa_shortCurrent:    (dto.ratings?.tableRating||[]).map(x => v(x.shortCurrent)),
            sa_ratedCircuit:    (dto.ratings?.tableRating||[]).map(x => v(x.ratedCircuit)),
            sa_polesVoltage:    (dto.ratings?.tableRating||[]).map(x => v(x.polesVoltage)),
            sa_isoVoltage:      (dto.ratings?.tableRating||[]).map(x => v(x.isoVoltage)),
          }
        }
        else if (cat.key === 'Asset_BushingAssetDto') {
          const rs = await window.electronAPI.getBushingAssetEntityByMrid(nodeId)
          if (!rs?.success || !rs.data) return {}
          const dto = bushingEntityToDto(rs.data)
          const b = dto.bushing || {}   // BushingDataDto: rated_frequency, insulation_level, ...
          flatMap = {
            ...this.mapProps(dto.properties),
            rated_frequency:    v(b.rated_frequency),
            insulation_level:   v(b.insulation_level),
            voltage_l_ground:   v(b.voltage_l_ground),
            max_system_voltage: v(b.max_system_voltage),
            rated_current:      v(b.rated_current),
            df_c1:              v(b.df_c1),
            cap_c1:             v(b.cap_c1),
            df_c2:              v(b.df_c2),
            cap_c2:             v(b.cap_c2),
            insulation_type:    b.insulation_type || ''
          }
        }
        else if (cat.key === 'Asset_ReactorDto') {
          const rs = await window.electronAPI.getReactorEntityByMrid(nodeId); if (!rs?.success || !rs.data) return {}
          const dto = reactorEntityToDto(rs.data); const rat = dto.reactorRating||{}, oth = dto.reactorOther||{}
          flatMap = { ...this.mapProps(dto.properties), rated_voltage: v(rat.rated_voltage), rated_frequency: v(rat.rated_frequency), rated_current: v(rat.rated_current), rated_power: v(rat.rated_power), inductance: v(rat.inductance), insulation_type: oth.insulation_type||'', weight: v(oth.weight) }
        }
        else if (cat.key === 'Asset_CapacitorsDTO') {
          const rs = await window.electronAPI.getCapacitorEntityByMrid(nodeId)
          if (!rs?.success || !rs.data) return {}
          const dto = capacitorEntityToDto(rs.data)
          const r = dto.ratings||{}, cfg = dto.configsData||{}
          const cap = dto.capacitance||{}, df = dto.dissipationFactor||{}, oth = dto.othersData||{}
          flatMap = {
            ...this.mapProps(dto.properties),
            cap_phase:           String(cfg.phase||''),
            cap_phase_name:      cfg.phase_name||'',
            cap_rated_voltage:   v(r.rated_voltage),
            cap_rated_frequency: v(r.rated_frequency),
            cap_rated_current:   v(r.rated_current),
            cap_rated_power:     v(r.rated_power),
            // capacitance.value is a ValueUnit object → v() extracts .value
            cap_capacitance:     v(cap.capacitance?.value),
            cap_capacitance_A:   v(cap.capacitance_A?.value),
            cap_capacitance_B:   v(cap.capacitance_B?.value),
            cap_capacitance_C:   v(cap.capacitance_C?.value),
            // dissipation_factor.value is a ValueUnit object
            cap_df:              v(df.dissipation_factor?.value),
            cap_df_A:            v(df.dissipation_factor_A?.value),
            cap_df_B:            v(df.dissipation_factor_B?.value),
            cap_df_C:            v(df.dissipation_factor_C?.value),
            cap_insulation_type: oth.insulation_type||'',
            cap_weight:          v(oth.weight)
          }
        }
        else if (cat.key === 'Asset_DisconnectorDTO') {
          const rs = await window.electronAPI.getDisconnectorEntityByMrid(nodeId)
          if (!rs?.success || !rs.data) return {}
          const dto = disconnectorEntityToDto(rs.data)
          const r = dto.ratings || {}
          flatMap = {
            ...this.mapProps(dto.properties),
            dc_rated_voltage:                     v(r.rated_voltage),
            dc_rated_frequency:                   v(r.rated_frequency),
            dc_rated_current:                     v(r.rated_current),
            dc_short_time_withstand_current:      v(r.short_time_withstand_current),
            dc_rated_duration_of_short_circuit:   v(r.rated_duration_of_short_circuit),
            dc_pf_earth_poles:                    v(r.power_freq_withstand_voltage_earth_poles),
            dc_pf_isolating_distance:             v(r.power_freq_withstand_voltage_isolating_distance)
          }
        }
        else if (cat.key === 'Asset_RotatingMachineDTO') {
          const rs = await window.electronAPI.getRotatingMachineEntityByMrid(nodeId); if (!rs?.success || !rs.data) return {}
          const dto = rotatingEntityToDto(rs.data); const rat = dto.ratingsData||{}
          flatMap = { ...this.mapProps(dto.properties), star_point: dto.configsData?.star_point||'', rated_u: v(rat.rated_u), rated_current: v(rat.rated_current), rated_speed: String(rat.rated_speed||''), rated_frequency: v(rat.rated_frequency), rated_power: v(rat.rated_power), rated_power_factor: String(rat.rated_power_factor||''), rated_thermal_class: String(rat.rated_thermal_class||''), rated_ifd: v(rat.rated_ifd), rated_ufd: v(rat.rated_ufd) }
        }

        else if (cat.key.startsWith('Job_')) {
          const jobApiMap = {
            'Job_TransformerJobDto':        () => window.electronAPI.getTransformerJobByMrid(nodeId),
            'Job_VoltageTransformerJobDto': () => window.electronAPI.getVoltageTransformerJobByMrid(nodeId),
            'Job_CurrentTransformerJobDto': () => window.electronAPI.getCurrentTransformerJobByMrid(nodeId),
            'Job_CircuitBreakerJobDto':     () => window.electronAPI.getCircuitBreakerJobByMrid(nodeId),
            'Job_PowerCableJobDto':         () => window.electronAPI.getPowerCableJobByMrid(nodeId),
            'Job_SurgeArresterJobDto':      () => window.electronAPI.getSurgeArresterJobByMrid(nodeId),
            'Job_ReactorJobDto':            () => window.electronAPI.getReactorJobByMrid(nodeId),
            'Job_CapacitorJobDto':          () => window.electronAPI.getCapacitorJobByMrid(nodeId),
            'Job_DisconnectorJobDto':       () => window.electronAPI.getDisconnectorJobByMrid(nodeId),
            'Job_RotatingMachineJobDto':    () => window.electronAPI.getRotatingMachineJobByMrid(nodeId),
          }
          const fn = jobApiMap[cat.key]; if (!fn) return {}
          const rs = await fn(); if (!rs?.success || !rs.data) return {}
          const p = rs.data.properties || rs.data
          flatMap = {
            job_name:      p.name          || '',
            job_type:      p.type          || '',
            creation_date: p.creation_date || '',
            execution_date:p.execution_date|| '',
            tested_by:     p.tested_by     || '',
            approved_by:   p.approved_by   || '',
            approval_date: p.approval_date || '',
            test_method:   p.test_method   || '',
            ref_standard:  p.ref_standard  || '',
            summary:       p.summary       || ''
          }
        }
        return this.extractFromMaps(cat, flatMap, arrayMap)
      } catch(e) { console.error('buildDtoForCat error:', cat.key, e); return {} }
    },
    // extractFromMaps:
    // - Scalar fields (flatMap only): luôn trả cùng 1 giá trị, không đếm occurrence
    // - Table/array fields (arrayMap): code lần 1 → [0], lần 2 → [1], ...
    //   out-of-bounds (bảng 6 dòng mà xuất hiện lần 7) → '' (rỗng)
    extractFromMaps(cat, flatMap, arrayMap) {
      const result = {}
      const occurrences = {}  // chỉ đếm cho array fields
      for (const row of this.tableData) {
        if (!row.code || row.category !== cat.category) continue
        if (cat.assetType && row.featureLevels?.[0]?.key !== cat.assetType) continue
        const leafValue = this.getLeafValue(row.featureLevels, row.category)
        if (!leafValue) continue

        let val
        if (arrayMap && leafValue in arrayMap) {
          // ── table data: occurrence-based ─────────────────────────────
          const idx = occurrences[leafValue] ?? 0
          occurrences[leafValue] = idx + 1          // tăng CHỈ cho array field
          const arr = arrayMap[leafValue]
          val = idx < arr.length ? arr[idx] : ''    // out-of-bounds → '' (không phải null/0)
        } else {
          // ── scalar: không đếm occurrence, luôn cùng giá trị ─────────
          val = flatMap[leafValue]
        }

        result[row.code] = (val !== undefined && val !== null) ? String(val) : ''
      }
      return result
    },
    getLeafValue(featureLevels, category) {
      if (!featureLevels?.length) return null
      let node = this.FEATURE_TREE[category]; if (!node) return null
      for (const level of featureLevels) { if (!level.key) break; node = node.children?.[level.key]; if (!node) return null }
      return node?.value ?? null
    },
    clearAll() { this.tableData = [] },
    addRow(index) {
      const r = { code: '', category: '', featureLevels: [], coordinates: [] }
      if (typeof index === 'number') this.tableData.splice(index + 1, 0, r); else this.tableData.push(r)
    },
    removeRow(index) { this.tableData.splice(index, 1) },
    getNodeByLevel(row, levelIndex) {
      let node = this.FEATURE_TREE[row.category]; if (!node) return null
      for (let i = 0; i < levelIndex; i++) { const key = row.featureLevels[i]?.key; node = node?.children?.[key]; if (!node) return null }
      return node
    },
    getFeatureOptionsByLevel(row, levelIndex) {
      const node = this.getNodeByLevel(row, levelIndex); if (!node?.children) return []
      return Object.entries(node.children).map(([key, child]) => ({ key, label: child.label, hasChildren: !!child.children, isLeaf: !!child.value }))
    },
    onFeatureLevelChange(row, levelIndex) {
      row.featureLevels.splice(levelIndex + 1)
      const key = row.featureLevels[levelIndex]?.key; const parent = this.getNodeByLevel(row, levelIndex)
      const selected = parent?.children?.[key]
      if (selected?.children) row.featureLevels.push({ key: '' })
    }
  }
}
</script>

<style scoped>
.export-view { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
th {
  background: #f5f7fa;
  font-weight: 600;
  border-bottom: 2px solid #EBEEF5;
  padding: 8px;
  white-space: nowrap;
}
td, th { vertical-align: middle; }
td { border-bottom: 1px solid #EBEEF5; }
tr:last-child td { border-bottom: none; }
</style>

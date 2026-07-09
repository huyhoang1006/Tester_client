<template>
  <el-dialog title="Select Testing Equipment" :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    width="560px" append-to-body @open="load">
    <div style="margin-bottom:8px;display:flex;align-items:center;gap:8px;">
      <el-input v-model="keyword" size="small" clearable prefix-icon="el-icon-search"
        placeholder="Search by name, model, serial no., manufacturer" style="flex:1;" />
      <el-button size="mini" icon="el-icon-refresh" :loading="loading" @click="load" style="padding:7px 10px;">Refresh</el-button>
    </div>

    <el-table ref="table" :data="filtered" size="mini" height="320" border
      v-loading="loading" @selection-change="sel => selection = sel">
      <el-table-column type="selection" width="40" />
      <el-table-column label="Equipment name" prop="name" min-width="150" show-overflow-tooltip>
        <template slot-scope="{ row }">
          {{ row.name || '—' }}
          <el-tag v-if="row.is_accessory" size="mini" type="warning" style="font-size:10px;">Accessory</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Model" prop="model" width="110" show-overflow-tooltip />
      <el-table-column label="Serial no." prop="serial" width="110" show-overflow-tooltip />
      <el-table-column label="Manufacturer" prop="manufacturer" width="120" show-overflow-tooltip />
    </el-table>

    <span slot="footer" style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:11px;color:#909399;">{{ selection.length }} selected · {{ filtered.length }} / {{ items.length }} equipment</span>
      <span>
        <el-button size="small" @click="$emit('update:visible', false)">Cancel</el-button>
        <el-button size="small" type="primary" :disabled="!selection.length" @click="confirm">{{ confirmLabel }}</el-button>
      </span>
    </span>
  </el-dialog>
</template>

<script>
/* eslint-disable */
// Picker chọn thiết bị từ danh sách testing equipment (DB local, theo user hiện tại).
// Emit 'add' với các row đã chọn: [{ mrid, name, model, serial, manufacturer, ... }]
export default {
  name: 'EquipmentPicker',
  props: {
    visible: { type: Boolean, default: false },
    confirmLabel: { type: String, default: 'Add to list' }
  },
  data() {
    return { items: [], selection: [], keyword: '', loading: false }
  },
  computed: {
    filtered() {
      const k = this.keyword.trim().toLowerCase()
      if (!k) return this.items
      return this.items.filter(it =>
        [it.name, it.model, it.serial, it.manufacturer]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(k))
      )
    }
  },
  methods: {
    async load() {
      this.loading = true
      try {
        const user = this.$store && this.$store.getters.getUser
        const rs = await window.electronAPI.getAllTestingEquipmentList((user && user.user_id) || null)
        this.items = (rs && rs.success && Array.isArray(rs.data)) ? rs.data : []
      } catch (e) {
        console.error('EquipmentPicker load failed:', e)
        this.items = []
      } finally {
        this.loading = false
      }
    },
    confirm() {
      this.$emit('add', this.selection.slice())
      if (this.$refs.table) this.$refs.table.clearSelection()
      this.$emit('update:visible', false)
    }
  }
}
</script>

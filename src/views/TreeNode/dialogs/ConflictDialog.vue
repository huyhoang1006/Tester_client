<template>
  <el-dialog
    title="Conflict Resolution"
    :visible.sync="visible"
    width="860px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    custom-class="conflict-dialog"
    @close="onCancel"
  >
    <div class="conflict-header">
      <div class="conflict-stats">
        <span class="stat auto">
          <i class="el-icon-check" />
          {{ autoCount }} feature merged automatically
        </span>
        <span class="stat conflict">
          <i class="el-icon-warning-outline" />
          {{ conflictCount }} conflicting fields
        </span>
        <span class="stat unchanged">
          <i class="el-icon-minus" />
          {{ unchangedCount }} unchanged fields
        </span>
      </div>
      <div class="legend">
        <span class="legend-item base">Base</span>
        <span class="legend-item client">Client</span>
        <span class="legend-item server">Server</span>
      </div>
    </div>

    <div class="field-groups">
      <div v-for="group in fieldGroups" :key="group.label" class="field-group">
        <div class="group-title">{{ group.label }}</div>

        <div
          v-for="field in group.fields"
          :key="field.key"
          class="field-row"
          :class="field.status"
        >
          <div class="field-label">{{ field.label }}</div>

          <template v-if="field.status === 'unchanged'">
            <div class="field-value unchanged-value">{{ field.client || '—' }}</div>
            <div class="field-badge unchanged">Không đổi</div>
          </template>

          <template v-else-if="field.status === 'auto'">
            <div class="diff-cols">
              <div class="diff-cell base">{{ field.base || '—' }}</div>
              <div class="diff-cell client" :class="{ changed: field.autoResolved === 'client' || field.autoResolved === 'both' }">
                {{ field.client || '—' }}
              </div>
              <div class="diff-cell server" :class="{ changed: field.autoResolved === 'server' || field.autoResolved === 'both' }">
                {{ field.server || '—' }}
              </div>
            </div>
            <div class="field-badge auto">
              <i class="el-icon-check" />
              {{ field.autoResolved === 'server' ? 'Server' : field.autoResolved === 'client' ? 'Client' : 'Cả hai' }}
            </div>
          </template>

          <template v-else-if="field.status === 'conflict'">
            <div class="diff-cols">
              <div class="diff-cell base">{{ field.base || '—' }}</div>
              <div class="diff-cell client conflict-val">{{ field.client || '—' }}</div>
              <div class="diff-cell server conflict-val">{{ field.server || '—' }}</div>
            </div>
            <div class="conflict-actions">
              <el-radio-group v-model="field.resolved" size="mini">
                <el-radio-button :label="field.client">Client</el-radio-button>
                <el-radio-button :label="field.server">Server</el-radio-button>
              </el-radio-group>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div v-if="hasUnresolved" class="unresolved-warning">
      <i class="el-icon-warning" />
      Còn {{ unresolvedCount }} trường xung đột chưa được xử lý
    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="onCancel">Hủy</el-button>
      <el-button @click="onKeepClient" type="default">Giữ tất cả Client</el-button>
      <el-button @click="onTakeServer" type="default">Lấy tất cả Server</el-button>
      <el-button
        type="primary"
        :disabled="hasUnresolved"
        @click="onConfirm"
      >
        Xác nhận merge
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
const FIELD_GROUPS = [
  {
    label: 'Thông tin trạm',
    fields: [
      { key: 'name',       label: 'Tên trạm' },
      { key: 'aliasName',  label: 'Tên khác' },
      { key: 'type',       label: 'Loại PSR' },
      { key: 'generation', label: 'Generation' },
      { key: 'industry',   label: 'Ngành' },
      { key: 'comment',    label: 'Mô tả' },
    ],
  },
  {
    label: 'Địa chỉ',
    fields: [
      { key: 'locationName',     label: 'Tên địa điểm' },
      { key: 'street',           label: 'Đường' },
      { key: 'ward_or_commune',  label: 'Phường / Xã' },
      { key: 'district_or_town', label: 'Quận / Huyện' },
      { key: 'city',             label: 'Thành phố' },
      { key: 'state_or_province','label': 'Tỉnh' },
      { key: 'country',          label: 'Quốc gia' },
    ],
  },
  {
    label: 'Người liên hệ',
    fields: [
      { key: 'personName',  label: 'Tên liên hệ' },
      { key: 'department',  label: 'Phòng ban' },
      { key: 'position',    label: 'Chức vụ' },
      { key: 'phoneNumber', label: 'Số điện thoại' },
      { key: 'email',       label: 'Email' },
      { key: 'fax',         label: 'Fax' },
    ],
  },
]

export default {
  name: 'SubstationConflictDialog',

  props: {
    visible: { type: Boolean, default: false },
    // Kết quả từ detectConflicts()
    // [{ key, label, base, client, server, status, autoResolved, resolved }]
    diffFields: { type: Array, default: () => [] },
  },

  data() {
    return {
      fieldGroups: [],
    }
  },

  computed: {
    autoCount()      { return this.allFields.filter(f => f.status === 'auto').length },
    conflictCount()  { return this.allFields.filter(f => f.status === 'conflict').length },
    unchangedCount() { return this.allFields.filter(f => f.status === 'unchanged').length },
    allFields()      { return this.fieldGroups.flatMap(g => g.fields) },
    unresolvedCount(){ return this.allFields.filter(f => f.status === 'conflict' && !f.resolved).length },
    hasUnresolved()  { return this.unresolvedCount > 0 },
  },

  watch: {
    visible(val) {
      if (val) this.buildFieldGroups()
    },
  },

  methods: {
    buildFieldGroups() {
      const diffMap = {}
      for (const f of this.diffFields) diffMap[f.key] = f

      this.fieldGroups = FIELD_GROUPS.map(group => ({
        label: group.label,
        fields: group.fields.map(f => {
          const diff = diffMap[f.key] || {}
          return {
            ...f,
            base:         diff.base         ?? null,
            client:       diff.client       ?? null,
            server:       diff.server       ?? null,
            status:       diff.status       || 'unchanged',
            autoResolved: diff.autoResolved || null,
            resolved:     diff.resolved     ?? null,
          }
        }),
      }))
    },

    onKeepClient() {
      this.allFields.forEach(f => {
        if (f.status === 'conflict') f.resolved = f.client
      })
    },

    onTakeServer() {
      this.allFields.forEach(f => {
        if (f.status === 'conflict') f.resolved = f.server
      })
    },

    onConfirm() {
      if (this.hasUnresolved) return
      const resolvedFields = this.allFields.map(f => ({ ...f }))
      this.$emit('resolve', resolvedFields)
      this.$emit('update:visible', false)
    },

    onCancel() {
      this.$emit('cancel')
      this.$emit('update:visible', false)
    },
  },
}
</script>

<style scoped>
.conflict-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.conflict-stats { display: flex; gap: 16px; }
.stat { font-size: 13px; display: flex; align-items: center; gap: 4px; }
.stat.auto     { color: #67c23a; }
.stat.conflict { color: #e6a23c; }
.stat.unchanged{ color: #909399; }

.legend { display: flex; gap: 8px; }
.legend-item {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 500;
}
.legend-item.base   { background: #f4f4f5; color: #909399; }
.legend-item.client { background: #ecf5ff; color: #409eff; }
.legend-item.server { background: #fdf6ec; color: #e6a23c; }

.field-groups { max-height: 520px; overflow-y: auto; padding-right: 4px; }

.field-group { margin-bottom: 20px; }

.group-title {
  font-size: 12px;
  font-weight: 600;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 6px;
  border-radius: 6px;
  min-height: 40px;
}
.field-row:hover            { background: #fafafa; }
.field-row.conflict         { background: #fffbf0; }
.field-row.conflict:hover   { background: #fff7e6; }

.field-label {
  width: 140px;
  flex-shrink: 0;
  font-size: 13px;
  color: #606266;
}

.unchanged-value {
  flex: 1;
  font-size: 13px;
  color: #909399;
}

.field-badge {
  flex-shrink: 0;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.field-badge.unchanged { background: #f4f4f5; color: #909399; }
.field-badge.auto      { background: #f0f9eb; color: #67c23a; display: flex; align-items: center; gap: 3px; }

.diff-cols {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
}

.diff-cell {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  color: #606266;
  background: #f4f4f5;
  min-height: 28px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.diff-cell.base   { background: #f4f4f5; color: #909399; }
.diff-cell.client { background: #f4f4f5; }
.diff-cell.server { background: #f4f4f5; }
.diff-cell.changed.client { background: #ecf5ff; color: #409eff; font-weight: 500; }
.diff-cell.changed.server { background: #fdf6ec; color: #e6a23c; font-weight: 500; }
.diff-cell.conflict-val.client { background: #ecf5ff; color: #409eff; }
.diff-cell.conflict-val.server { background: #fdf6ec; color: #e6a23c; }

.conflict-actions { flex-shrink: 0; }

.unresolved-warning {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fef0f0;
  border-radius: 6px;
  font-size: 13px;
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dialog-footer { display: flex; gap: 8px; justify-content: flex-end; }
</style>
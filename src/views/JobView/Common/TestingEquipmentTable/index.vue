<template>
    <div class="te-wrap">
        <table class="te-table">
            <thead>
                <tr>
                    <th class="col-idx">#</th>
                    <th class="col-eq">Equipment</th>
                    <th class="col-serial">Serial number</th>
                    <th class="col-cal">Calibration date</th>
                    <th class="col-test">Test used</th>
                    <th class="col-act">
                        <el-tooltip content="Add equipment" placement="top">
                            <button type="button" class="act-btn add" @click="addRow()"><i class="fa-solid fa-plus"></i></button>
                        </el-tooltip>
                    </th>
                    <th class="col-act">
                        <el-tooltip content="Remove all" placement="top">
                            <button type="button" class="act-btn danger" @click="removeAll()"><i class="fa-solid fa-trash"></i></button>
                        </el-tooltip>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="rows.length === 0">
                    <td colspan="7" class="te-empty">
                        No testing equipment — click <i class="fa-solid fa-plus"></i> to add one from the equipment manager.
                    </td>
                </tr>
                <tr v-for="(item, index) in rows" :key="index">
                    <td class="col-idx">{{ index + 1 }}</td>
                    <td class="col-eq">
                        <div class="eq-cell">
                            <el-select
                                :value="item.mrid || null"
                                size="mini"
                                filterable
                                clearable
                                placeholder="Select equipment"
                                class="eq-select"
                                @visible-change="onDropdown"
                                @change="onSelectEquipment(item, $event)">
                                <el-option
                                    v-for="eq in optionsFor(item)"
                                    :key="eq.mrid"
                                    :value="eq.mrid"
                                    :label="labelOf(eq)"
                                    :disabled="isUsedElsewhere(eq.mrid, item)">
                                    <div class="eq-option">
                                        <span class="eq-option-name">{{ eq.model || eq.name || '(no model)' }}</span>
                                        <span class="eq-option-sub">{{ eq.serial || '' }}</span>
                                    </div>
                                </el-option>
                            </el-select>
                            <el-popover
                                v-if="detailsOf(item)"
                                placement="right"
                                width="280"
                                trigger="click"
                                popper-class="te-info-popover">
                                <div class="eq-info">
                                    <div class="eq-info-title">{{ detailsOf(item).model || detailsOf(item).name || 'Equipment' }}</div>
                                    <div class="eq-info-row"><span>Name</span><b>{{ detailsOf(item).name || '—' }}</b></div>
                                    <div class="eq-info-row"><span>Manufacturer</span><b>{{ detailsOf(item).manufacturer || '—' }}</b></div>
                                    <div class="eq-info-row"><span>Model</span><b>{{ detailsOf(item).model || '—' }}</b></div>
                                    <div class="eq-info-row"><span>Serial number</span><b>{{ detailsOf(item).serial || '—' }}</b></div>
                                    <div class="eq-info-row"><span>Asset tag</span><b>{{ detailsOf(item).asset_tag || '—' }}</b></div>
                                    <div class="eq-info-row"><span>Last calibration</span><b>{{ detailsOf(item).calibration_date || '—' }}</b></div>
                                    <div class="eq-info-row"><span>Repairs</span><b>{{ detailsOf(item).repair_count || 0 }}</b></div>
                                </div>
                                <button slot="reference" type="button" class="act-btn info" title="Equipment info">
                                    <i class="fa-solid fa-circle-info"></i>
                                </button>
                            </el-popover>
                        </div>
                    </td>
                    <td class="col-serial"><span class="ro" :class="{ empty: !item.serial_number }">{{ item.serial_number || '—' }}</span></td>
                    <td class="col-cal"><span class="ro" :class="{ empty: !item.calibration_date }">{{ item.calibration_date || '—' }}</span></td>
                    <td class="col-test">
                        <el-select
                            multiple
                            collapse-tags
                            size="mini"
                            v-model="item[testTypeField]"
                            placeholder="Select test type"
                            class="w-100">
                            <el-option v-for="test in testTypeListData" :key="test.mrid" :label="test.name" :value="test.mrid"></el-option>
                        </el-select>
                    </td>
                    <td class="col-act">
                        <el-tooltip content="Add row below" placement="top">
                            <button type="button" class="act-btn add" @click="addRow(index)"><i class="fa-solid fa-plus"></i></button>
                        </el-tooltip>
                    </td>
                    <td class="col-act">
                        <el-tooltip content="Remove" placement="top">
                            <button type="button" class="act-btn danger" @click="removeRow(index)"><i class="fa-solid fa-trash"></i></button>
                        </el-tooltip>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
/* eslint-disable */
// Bảng testing equipment dùng chung cho mọi JobView.
// Chỉ cho CHỌN thiết bị từ kho (equipment manager) — không cho tạo mới từ droplist.
export default {
    name: 'TestingEquipmentTable',
    props: {
        data: {
            type: Array,
            required: true,
            default: () => []
        },
        testTypeListData: {
            type: Array,
            required: true,
            default: () => []
        },
        // tên field chứa danh sách test type id, khác nhau theo loại thiết bị
        // vd: test_type_transformer_id, test_type_circuit_breaker_id...
        testTypeField: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            pool: []
        }
    },
    created() {
        this.loadPool()
    },
    computed: {
        rows() {
            return this.data || []
        }
    },
    methods: {
        async loadPool() {
            try {
                const user = this.$store && this.$store.getters.getUser
                const userId = (user && user.user_id) || ''
                const rs = await window.electronAPI.getAllTestingEquipmentList(userId)
                if (rs && rs.success) this.pool = (rs.data || []).filter(e => !e.is_accessory)
            } catch (e) {
                console.error('Load testing equipment pool failed', e)
            }
        },
        onDropdown(visible) {
            if (visible) this.loadPool()
        },
        labelOf(eq) {
            const main = eq.model || eq.name || '(no model)'
            return eq.serial ? `${main} — ${eq.serial}` : main
        },
        // dữ liệu cũ có thể trỏ tới equipment không còn trong kho của user -> thêm option "mồ côi" để vẫn hiển thị được
        optionsFor(item) {
            if (item.mrid && !this.pool.some(e => e.mrid === item.mrid)) {
                return [{
                    mrid: item.mrid,
                    model: item.model,
                    name: item.model,
                    serial: item.serial_number,
                    calibration_date: item.calibration_date
                }, ...this.pool]
            }
            return this.pool
        },
        // chặn chọn trùng 1 thiết bị ở 2 hàng
        isUsedElsewhere(mrid, current) {
            return this.rows.some(r => r !== current && r.mrid === mrid)
        },
        detailsOf(item) {
            if (!item.mrid) return null
            return this.pool.find(e => e.mrid === item.mrid) || null
        },
        onSelectEquipment(item, mrid) {
            const eq = this.pool.find(e => e.mrid === mrid)
            this.$set(item, 'mrid', mrid || '')
            this.$set(item, 'model', eq ? (eq.model || eq.name || '') : '')
            this.$set(item, 'serial_number', eq ? (eq.serial || '') : '')
            this.$set(item, 'calibration_date', eq ? (eq.calibration_date || '') : '')
        },
        newRow() {
            const row = {
                mrid: '',
                model: '',
                serial_number: '',
                calibration_date: '',
                work_id: ''
            }
            row[this.testTypeField] = []
            return row
        },
        addRow(index) {
            if (index === undefined || index === null) this.rows.push(this.newRow())
            else this.rows.splice(index + 1, 0, this.newRow())
        },
        removeRow(index) {
            this.rows.splice(index, 1)
        },
        removeAll() {
            this.rows.splice(0, this.rows.length)
        }
    }
}
</script>
<style scoped>
.te-wrap {
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    /* responsive: bảng scroll ngang khi hẹp thay vì bóp nát cột */
    overflow-x: auto;
}
.te-table {
    width: 100%;
    min-width: 720px;
    table-layout: fixed;
    border-collapse: collapse;
    font-size: 12px;
}
.te-table th {
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
    text-align: left;
    padding: 8px 10px;
    border-bottom: 1px solid #e4e7ed;
    white-space: nowrap;
}
.te-table td {
    padding: 6px 10px;
    border-bottom: 1px solid #f0f2f5;
    vertical-align: middle;
}
.te-table tbody tr:last-child td {
    border-bottom: none;
}
.te-table tbody tr:hover td {
    background: #fafbfc;
}
.col-idx { width: 34px; text-align: center; color: #909399; }
.col-serial { width: 130px; }
.col-cal { width: 120px; }
.col-act { width: 36px; text-align: center; }
.col-eq, .col-test { width: auto; }

.te-empty {
    text-align: center;
    color: #909399;
    padding: 18px 10px;
    font-style: italic;
}

.eq-cell {
    display: flex;
    align-items: center;
    gap: 4px;
}
.eq-select {
    flex: 1;
    min-width: 0;
}
.eq-cell .act-btn { flex-shrink: 0; }

.ro { color: #303133; }
.ro.empty { color: #c0c4cc; }

.act-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 4px;
    color: #909399;
    line-height: 1;
    transition: background 0.15s, color 0.15s;
}
.act-btn.add:hover { color: #409eff; background: #ecf5ff; }
.act-btn.danger:hover { color: #f56c6c; background: #fef0f0; }
.act-btn.info { color: #409eff; }
.act-btn.info:hover { background: #ecf5ff; }

.eq-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}
.eq-option-name { overflow: hidden; text-overflow: ellipsis; }
.eq-option-sub { color: #909399; font-size: 11px; }

.eq-info-title {
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid #ebeef5;
}
.eq-info-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding: 3px 0;
    font-size: 12px;
}
.eq-info-row span { color: #909399; }
.eq-info-row b { font-weight: 500; text-align: right; word-break: break-all; }

.w-100 { width: 100%; }

/* đồng bộ chiều dài control trong bảng (el-select có width mặc định riêng) */
.te-table ::v-deep .el-select {
    width: 100%;
}

::v-deep(.el-select .el-select__tags) {
    flex-wrap: nowrap;
}
::v-deep(.el-select .el-tag) {
    max-width: calc(100% - 25px);
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>

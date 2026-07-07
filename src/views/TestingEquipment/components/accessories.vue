<template>
    <div class="acc">
        <div class="sec-title">
            <h3>Accessories</h3>
            <button class="btn primary sm" @click="openPicker">+ Add accessory</button>
        </div>
        <table>
            <thead>
                <tr>
                    <th style="min-width:180px">Name</th>
                    <th style="min-width:150px">Model</th>
                    <th style="min-width:150px">Serial no.</th>
                    <th style="width:130px">Calibration</th>
                    <th style="min-width:200px">Description</th>
                    <th style="width:44px"></th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="!items.length"><td colspan="6" class="empty">No accessories</td></tr>
                <tr v-for="(a, i) in items" :key="i">
                    <td><input class="inp" v-model="a.name" placeholder="e.g. CP TD12" /></td>
                    <td><input class="inp" v-model="a.model" /></td>
                    <td><input class="inp" v-model="a.serial_no" /></td>
                    <td class="ctr">
                        <label class="switch">
                            <input type="checkbox" :checked="a.needs_calibration"
                                @change="a.needs_calibration = $event.target.checked ? 1 : 0" />
                            <span class="slider"></span>
                        </label>
                    </td>
                    <td><input class="inp" v-model="a.description" /></td>
                    <td class="ctr"><button class="del" @click="removeRow(i)" title="Remove">✕</button></td>
                </tr>
            </tbody>
        </table>

        <!-- Bảng chọn phụ kiện: lấy từ kho phụ kiện đã có hoặc thêm mới -->
        <div v-if="pickerOpen" class="ap-overlay" @click.self="closePicker">
            <div class="ap-modal">
                <div class="ap-head">
                    <h4>Add accessory</h4>
                    <button class="ap-x" @click="closePicker" title="Close">✕</button>
                </div>

                <input class="ap-search" v-model="pickerSearch" placeholder="Search existing accessories…" />

                <div class="ap-list">
                    <div v-if="loading" class="ap-empty">Loading…</div>
                    <label v-for="opt in filteredPool" :key="opt.mrid" class="ap-item" :class="{ disabled: isAdded(opt.mrid) }">
                        <input type="checkbox" :disabled="isAdded(opt.mrid)"
                            :checked="isAdded(opt.mrid) || picked.includes(opt.mrid)" @change="togglePick(opt.mrid)" />
                        <span class="ap-name">{{ opt.name || '(no name)' }}</span>
                        <span class="ap-sub">{{ opt.model }}<span v-if="opt.serial_no"> · S/N {{ opt.serial_no }}</span></span>
                        <span v-if="isAdded(opt.mrid)" class="ap-added">added</span>
                    </label>
                    <div v-if="!loading && !filteredPool.length" class="ap-empty">No existing accessory in the pool</div>
                </div>

                <div class="ap-foot">
                    <button class="btn sm" @click="addBlank">+ New accessory</button>
                    <div class="ap-spacer"></div>
                    <button class="btn sm" @click="closePicker">Cancel</button>
                    <button class="btn primary sm" :disabled="!picked.length" @click="addSelected">
                        Add selected{{ picked.length ? ' (' + picked.length + ')' : '' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name: 'TeAccessories',
    props: { items: { type: Array, default: () => [] } },
    data() {
        return { pickerOpen: false, pickerSearch: '', pool: [], picked: [], loading: false }
    },
    computed: {
        addedMrids() { return new Set(this.items.map(a => a.mrid).filter(Boolean)) },
        filteredPool() {
            const k = this.pickerSearch.trim().toLowerCase()
            if (!k) return this.pool
            return this.pool.filter(o =>
                [o.name, o.model, o.serial_no].filter(Boolean).some(v => String(v).toLowerCase().includes(k)))
        }
    },
    methods: {
        async openPicker() {
            this.pickerOpen = true
            this.picked = []
            this.pickerSearch = ''
            this.loading = true
            try {
                const rs = await window.electronAPI.getAllAccessories()
                this.pool = (rs && rs.success && Array.isArray(rs.data)) ? rs.data : []
            } catch (e) {
                console.error('load accessories pool failed:', e)
                this.pool = []
            } finally {
                this.loading = false
            }
        },
        closePicker() { this.pickerOpen = false },
        isAdded(mrid) { return this.addedMrids.has(mrid) },
        togglePick(mrid) {
            if (this.isAdded(mrid)) return
            const i = this.picked.indexOf(mrid)
            if (i >= 0) this.picked.splice(i, 1)
            else this.picked.push(mrid)
        },
        // chọn phụ kiện đã có -> thêm vào danh sách (giữ mrid để chỉ tạo link, không tạo trùng)
        addSelected() {
            for (const mrid of this.picked) {
                if (this.isAdded(mrid)) continue
                const o = this.pool.find(x => x.mrid === mrid)
                if (!o) continue
                this.items.push({
                    mrid: o.mrid,
                    pamId: o.product_asset_model || '',
                    name: o.name || '',
                    model: o.model || '',
                    serial_no: o.serial_no || '',
                    needs_calibration: 0,
                    description: o.description || ''
                })
            }
            this.closePicker()
        },
        // thêm phụ kiện hoàn toàn mới (dòng trống)
        addBlank() {
            this.items.push({ mrid: '', name: '', model: '', serial_no: '', needs_calibration: 0, description: '' })
            this.closePicker()
        },
        removeRow(i) { this.items.splice(i, 1) }
    }
}
</script>

<style scoped>
.acc { --blue-900:#0b2f86; --blue-800:#123c9c; --gray-900:#111827; --gray-700:#374151; --gray-500:#6b7280; --gray-400:#9ca3af; --gray-300:#d1d5db; --gray-200:#e5e7eb; --gray-100:#f3f4f6; overflow-x: auto; }
.sec-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.sec-title h3 { margin: 0; font-size: 16px; color: var(--gray-900); }
table { width: 100%; min-width: 880px; border-collapse: collapse; border: 1px solid var(--gray-200); border-radius: 10px; overflow: hidden; background: #fff; }
th { background: var(--gray-100); color: var(--gray-700); text-align: left; padding: 12px 14px; font-size: 12px; font-weight: 800; border-bottom: 1px solid var(--gray-300); white-space: nowrap; }
td { padding: 8px 12px; border-bottom: 1px solid var(--gray-200); vertical-align: middle; }
tr:last-child td { border-bottom: 0; }
.empty { text-align: center; color: var(--gray-400); padding: 22px; font-weight: 600; }
.inp { width: 100%; border: 1px solid var(--gray-200); border-radius: 7px; padding: 6px 8px; font-size: 13px; color: var(--gray-900); background: #fff; outline: none; }
.inp:focus { border-color: var(--blue-900); box-shadow: 0 0 0 3px rgba(11,47,134,0.08); }
.ctr { text-align: center; }
.del { border: none; background: transparent; color: #d90429; font-size: 15px; cursor: pointer; padding: 4px; border-radius: 6px; }
.del:hover { background: #fee2e2; }
.btn { border: 1px solid var(--gray-300); background: #fff; padding: 8px 13px; border-radius: 8px; font-weight: 700; cursor: pointer; color: var(--gray-700); font-size: 13px; }
.btn.primary { background: var(--blue-900); border-color: var(--blue-900); color: #fff; }
.btn.primary:hover { background: var(--blue-800); }
.btn.sm { padding: 7px 12px; }
.switch { position: relative; display: inline-block; width: 40px; height: 22px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; border-radius: 999px; transition: .2s; }
.slider::before { content: ""; position: absolute; height: 16px; width: 16px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: .2s; }
.switch input:checked + .slider { background: var(--blue-900); }
.switch input:checked + .slider::before { transform: translateX(18px); }

/* accessory picker */
.ap-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); display: grid; place-items: center; z-index: 3000; }
.ap-modal { width: min(560px, 92vw); max-height: 82vh; background: #fff; border-radius: 14px; box-shadow: 0 20px 60px rgba(15,23,42,0.3); display: flex; flex-direction: column; overflow: hidden; }
.ap-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--gray-200); }
.ap-head h4 { margin: 0; font-size: 15px; color: var(--gray-900); }
.ap-x { border: none; background: transparent; font-size: 16px; color: var(--gray-500); cursor: pointer; }
.ap-search { margin: 14px 18px 8px; border: 1px solid var(--gray-200); border-radius: 8px; padding: 8px 10px; font-size: 13px; outline: none; }
.ap-search:focus { border-color: var(--blue-900); box-shadow: 0 0 0 3px rgba(11,47,134,0.08); }
.ap-list { overflow-y: auto; padding: 4px 10px; margin: 0 8px; flex: 1; min-height: 80px; }
.ap-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; cursor: pointer; font-size: 13px; color: var(--gray-900); }
.ap-item:hover { background: #eef4ff; }
.ap-item.disabled { opacity: 0.55; cursor: default; }
.ap-name { font-weight: 700; }
.ap-sub { flex: 1; color: var(--gray-500); font-size: 12px; }
.ap-added { font-size: 11px; font-weight: 800; color: #166534; background: #dcfce7; padding: 2px 8px; border-radius: 999px; }
.ap-empty { text-align: center; color: var(--gray-400); padding: 18px; font-weight: 600; }
.ap-foot { display: flex; align-items: center; gap: 8px; padding: 12px 18px; border-top: 1px solid var(--gray-200); background: var(--gray-50, #f9fafb); }
.ap-spacer { flex: 1; }
.btn:disabled { opacity: 0.55; cursor: default; }
</style>

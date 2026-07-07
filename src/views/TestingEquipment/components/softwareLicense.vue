<template>
    <div class="lic">
        <div class="sec-title">
            <h3>Software licenses</h3>
            <button class="btn primary sm" @click="openPicker">+ Add license</button>
        </div>

        <div v-if="!licenses.length" class="empty-card">No licenses yet</div>

        <div class="lic-grid">
            <div v-for="(l, i) in licenses" :key="i" class="lic-card" :class="{ enabled: l.enabled }">
                <div class="lic-top">
                    <input class="lic-name-inp" v-model="l.option_name" placeholder="Option / module name" />
                    <label class="switch">
                        <input type="checkbox" :checked="l.enabled" @change="l.enabled = $event.target.checked ? 1 : 0" />
                        <span class="slider"></span>
                    </label>
                </div>
                <input class="lic-desc-inp" v-model="l.description" placeholder="Description" />

                <div class="lic-meta">
                    <div class="lm">
                        <span class="lm-k">License key</span>
                        <input class="lm-inp" v-model="l.license_key" />
                    </div>
                    <div class="lm">
                        <span class="lm-k">Activation</span>
                        <input class="lm-inp" type="date" v-model="l.activation_date" />
                    </div>
                    <div class="lm">
                        <span class="lm-k">Expiry</span>
                        <input class="lm-inp" type="date" v-model="l.expiry_date" />
                    </div>
                </div>

                <div class="lic-foot">
                    <span class="tag" :class="l.enabled ? 'green' : 'gray'">{{ l.enabled ? 'Enabled' : 'Disabled' }}</span>
                    <span v-if="expiryTag(l)" class="tag" :class="expiryTag(l).cls">{{ expiryTag(l).label }}</span>
                    <button class="del" @click="removeRow(i)" title="Remove">✕</button>
                </div>
            </div>
        </div>

        <!-- Bảng chọn license mặc định (từ Excel) hoặc thêm license tùy chỉnh -->
        <div v-if="pickerOpen" class="lp-overlay" @click.self="closePicker">
            <div class="lp-modal">
                <div class="lp-head">
                    <h4>Add licenses</h4>
                    <button class="lp-x" @click="closePicker" title="Close">✕</button>
                </div>

                <input class="lp-search" v-model="pickerSearch" placeholder="Search default licenses…" />

                <div class="lp-list">
                    <label v-for="opt in filteredCatalog" :key="opt" class="lp-item" :class="{ disabled: isAdded(opt) }">
                        <input type="checkbox" :disabled="isAdded(opt)"
                            :checked="isAdded(opt) || picked.includes(opt)" @change="togglePick(opt)" />
                        <span class="lp-name">{{ opt }}</span>
                        <span v-if="isAdded(opt)" class="lp-added">added</span>
                    </label>
                    <div v-if="!filteredCatalog.length" class="lp-empty">No matching license</div>
                </div>

                <div class="lp-custom">
                    <input class="lp-custom-inp" v-model="customName"
                        placeholder="Or type a new license name…" @keyup.enter="addCustom" />
                    <button class="btn sm" :disabled="!customName.trim()" @click="addCustom">Add custom</button>
                </div>

                <div class="lp-foot">
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
import licenseCatalog from '../licenseCatalog.js'

export default {
    name: 'TeSoftwareLicense',
    props: { licenses: { type: Array, default: () => [] } },
    data() {
        return { pickerOpen: false, pickerSearch: '', picked: [], customName: '' }
    },
    computed: {
        catalog() { return licenseCatalog },
        // tên license đã có (để đánh dấu "added" + tránh trùng)
        addedNames() {
            return new Set(this.licenses.map(l => (l.option_name || '').trim().toLowerCase()))
        },
        filteredCatalog() {
            const k = this.pickerSearch.trim().toLowerCase()
            return k ? this.catalog.filter(o => o.toLowerCase().includes(k)) : this.catalog
        }
    },
    methods: {
        openPicker() {
            this.pickerOpen = true
            this.picked = []
            this.pickerSearch = ''
            this.customName = ''
        },
        closePicker() { this.pickerOpen = false },
        isAdded(opt) { return this.addedNames.has(String(opt).trim().toLowerCase()) },
        togglePick(opt) {
            if (this.isAdded(opt)) return
            const i = this.picked.indexOf(opt)
            if (i >= 0) this.picked.splice(i, 1)
            else this.picked.push(opt)
        },
        newLicense(name) {
            return { mrid: '', option_name: name, license_key: '', enabled: 1,
                description: '', activation_date: '', expiry_date: '' }
        },
        addSelected() {
            for (const opt of this.picked) {
                if (!this.isAdded(opt)) this.licenses.push(this.newLicense(opt))
            }
            this.closePicker()
        },
        addCustom() {
            const name = this.customName.trim()
            if (!name) return
            if (!this.isAdded(name)) this.licenses.push(this.newLicense(name))
            this.customName = ''
        },
        removeRow(i) { this.licenses.splice(i, 1) },
        expiryTag(l) {
            if (!l.expiry_date) return null
            const days = Math.round((new Date(l.expiry_date) - new Date()) / 86400000)
            if (days < 0)  return { label: 'Expired', cls: 'red' }
            if (days < 30) return { label: 'Expiring soon', cls: 'yellow' }
            return null
        }
    }
}
</script>

<style scoped>
.lic { --blue-900:#0b2f86; --blue-800:#123c9c; --blue-50:#eef4ff; --gray-900:#111827; --gray-700:#374151; --gray-600:#4b5563; --gray-500:#6b7280; --gray-400:#9ca3af; --gray-200:#e5e7eb; --gray-100:#f3f4f6; --gray-50:#f9fafb; }
.sec-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
.sec-title h3 { margin: 0; font-size: 16px; color: var(--gray-900); }
.lic-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.lic-card { border: 1px solid var(--gray-200); border-radius: 12px; padding: 14px; background: #fcfcfd; }
.lic-card.enabled { border-color: #b7c7ff; background: #f7f9ff; }
.lic-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.lic-name-inp { flex: 1; border: none; background: transparent; font-size: 15px; font-weight: 800; color: var(--gray-900); outline: none; }
.lic-name-inp::placeholder { color: var(--gray-400); }
.lic-desc-inp { width: 100%; border: none; background: transparent; font-size: 13px; color: var(--gray-600); outline: none; margin-bottom: 12px; }
.lic-meta { display: grid; gap: 8px; margin-bottom: 12px; }
.lm { display: grid; grid-template-columns: 90px 1fr; align-items: center; gap: 8px; }
.lm-k { font-size: 12px; font-weight: 700; color: var(--gray-500); }
.lm-inp { border: 1px solid var(--gray-200); border-radius: 7px; padding: 6px 8px; font-size: 13px; color: var(--gray-900); background: #fff; outline: none; }
.lm-inp:focus { border-color: var(--blue-900); box-shadow: 0 0 0 3px rgba(11,47,134,0.08); }
.lic-foot { display: flex; align-items: center; gap: 8px; }
.tag { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 800; }
.tag.green { background: #dcfce7; color: #166534; }
.tag.gray { background: var(--gray-100); color: var(--gray-700); }
.tag.red { background: #fee2e2; color: #991b1b; }
.tag.yellow { background: #fef9c3; color: #854d0e; }
.del { margin-left: auto; border: none; background: transparent; color: #d90429; font-size: 15px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.del:hover { background: #fee2e2; }
.empty-card { border: 1px dashed var(--gray-300); border-radius: 12px; padding: 30px; text-align: center; color: var(--gray-400); font-weight: 600; }
.btn { border: 1px solid #d1d5db; background: #fff; padding: 8px 13px; border-radius: 8px; font-weight: 700; cursor: pointer; color: var(--gray-700); font-size: 13px; }
.btn.primary { background: var(--blue-900); border-color: var(--blue-900); color: #fff; }
.btn.primary:hover { background: var(--blue-800); }
.btn.sm { padding: 7px 12px; }
/* toggle switch */
.switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; border-radius: 999px; transition: .2s; }
.slider::before { content: ""; position: absolute; height: 16px; width: 16px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: .2s; }
.switch input:checked + .slider { background: var(--blue-900); }
.switch input:checked + .slider::before { transform: translateX(18px); }

/* license picker */
.lp-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); display: grid; place-items: center; z-index: 3000; }
.lp-modal { width: min(520px, 92vw); max-height: 82vh; background: #fff; border-radius: 14px; box-shadow: 0 20px 60px rgba(15,23,42,0.3); display: flex; flex-direction: column; overflow: hidden; }
.lp-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid var(--gray-200); }
.lp-head h4 { margin: 0; font-size: 15px; color: var(--gray-900); }
.lp-x { border: none; background: transparent; font-size: 16px; color: var(--gray-500); cursor: pointer; }
.lp-search { margin: 14px 18px 8px; border: 1px solid var(--gray-200); border-radius: 8px; padding: 8px 10px; font-size: 13px; outline: none; }
.lp-search:focus { border-color: var(--blue-900); box-shadow: 0 0 0 3px rgba(11,47,134,0.08); }
.lp-list { overflow-y: auto; padding: 4px 10px; margin: 0 8px; flex: 1; }
.lp-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; cursor: pointer; font-size: 13px; color: var(--gray-900); }
.lp-item:hover { background: var(--blue-50); }
.lp-item.disabled { opacity: 0.55; cursor: default; }
.lp-name { flex: 1; }
.lp-added { font-size: 11px; font-weight: 800; color: #166534; background: #dcfce7; padding: 2px 8px; border-radius: 999px; }
.lp-empty { text-align: center; color: var(--gray-400); padding: 18px; font-weight: 600; }
.lp-custom { display: flex; gap: 8px; padding: 10px 18px; border-top: 1px solid var(--gray-200); }
.lp-custom-inp { flex: 1; border: 1px solid var(--gray-200); border-radius: 8px; padding: 8px 10px; font-size: 13px; outline: none; }
.lp-custom-inp:focus { border-color: var(--blue-900); box-shadow: 0 0 0 3px rgba(11,47,134,0.08); }
.lp-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 18px; border-top: 1px solid var(--gray-200); background: var(--gray-50); }
.btn:disabled { opacity: 0.55; cursor: default; }
</style>

<template>
    <div class="ov">
        <div class="ov-grid">
            <div class="panel">
                <div class="panel-header">Identification</div>
                <div class="frow">
                    <div class="flabel">Name</div>
                    <div class="fvalue"><input class="inp" v-model="form.name" placeholder="e.g. OMICRON CMC 356" /></div>
                </div>
                <div class="frow">
                    <div class="flabel">Equipment type</div>
                    <div class="fvalue">
                        <select class="inp" v-model="form.type">
                            <option value="TestSet">Relay / Test set</option>
                            <option value="Insulation">Insulation tester</option>
                            <option value="WindingRes">Winding resistance</option>
                            <option value="TurnsRatio">Turns ratio</option>
                            <option value="PowerQuality">Power quality</option>
                            <option value="Misc">Miscellaneous</option>
                        </select>
                    </div>
                </div>
                <div class="frow">
                    <div class="flabel">Serial no. <span class="req">*</span></div>
                    <div class="fvalue"><input class="inp" v-model="form.serial_no" /></div>
                </div>
                <div class="frow">
                    <div class="flabel">Manufacturer <span class="req">*</span></div>
                    <div class="fvalue">
                        <select class="inp" v-model="form.manufacturer">
                            <option value="">— Select manufacturer —</option>
                            <option v-for="m in manufacturerOptions" :key="m" :value="m">{{ m }}</option>
                        </select>
                    </div>
                </div>
                <div class="frow">
                    <div class="flabel">Model</div>
                    <div class="fvalue"><input class="inp" v-model="form.model" /></div>
                </div>
                <div class="frow">
                    <div class="flabel">Manufacturing date</div>
                    <div class="fvalue">
                        <input class="inp" type="date" v-model="form.manufacturer_year" />
                    </div>
                </div>
            </div>

            <div class="ov-side">
                <div class="panel">
                    <div class="panel-header">Inventory & Status</div>
                    <div class="frow">
                        <div class="flabel">Asset tag</div>
                        <div class="fvalue"><input class="inp" v-model="form.asset_tag" placeholder="Internal tag" /></div>
                    </div>
                    <div class="frow">
                        <div class="flabel">Status</div>
                        <div class="fvalue">
                            <select class="inp" v-model="form.status">
                                <option value="Available">Available</option>
                                <option value="InUse">In use</option>
                                <option value="UnderRepair">Under repair</option>
                                <option value="Retired">Retired</option>
                            </select>
                        </div>
                    </div>
                    <div class="frow">
                        <div class="flabel">Equipment role</div>
                        <div class="fvalue">
                            <select class="inp" v-model.number="form.is_accessory">
                                <option :value="0">Main equipment</option>
                                <option :value="1">Accessory equipment</option>
                            </select>
                        </div>
                    </div>
                    <div class="frow">
                        <div class="flabel">Country of origin</div>
                        <div class="fvalue">
                            <select class="inp" v-model="form.country_of_origin">
                                <option value="">— Select country —</option>
                                <option v-for="c in countryOptions" :key="c" :value="c">{{ c }}</option>
                            </select>
                        </div>
                    </div>
                    <div class="frow">
                        <div class="flabel">In use date</div>
                        <div class="fvalue"><input class="inp" type="date" v-model="form.in_use_date" /></div>
                    </div>
                </div>

                <div class="panel">
                    <div class="panel-header">Comment</div>
                    <div class="cbox">
                        <textarea class="inp txt" v-model="form.comment" placeholder="Notes about this equipment…"></textarea>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import { country } from '@/views/ConstantAsset/index'
import MANUFACTURER_MAP from '@/views/ConstantAsset/manufacturer.js'

export default {
    name: 'TeOverview',
    props: { data: { type: Object, default: () => ({}) } },
    data() {
        // local proxy referencing the same object so v-model doesn't
        // mutate the prop directly (avoids vue/no-mutating-props)
        return { form: this.data }
    },
    watch: {
        data(val) { this.form = val }
    },
    computed: {
        countryList() { return country.default },
        manufacturerList() { return MANUFACTURER_MAP['TestingEquipmentDto'] || [] },
        // đảm bảo giá trị đang có (kể cả tự nhập/từ DB) luôn nằm trong option
        manufacturerOptions() {
            const list = [...this.manufacturerList]
            const v = this.form.manufacturer
            if (v && !list.includes(v)) list.unshift(v)
            return list
        },
        countryOptions() {
            const list = [...this.countryList]
            const v = this.form.country_of_origin
            if (v && !list.includes(v)) list.unshift(v)
            return list
        },
    }
}
</script>

<style scoped>
.ov { --blue-900:#0b2f86; --gray-900:#111827; --gray-700:#374151; --gray-600:#4b5563; --gray-200:#e5e7eb; --gray-50:#f9fafb; }
.ov-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 18px; }
.ov-side { display: grid; gap: 18px; align-content: start; }
.panel { border: 1px solid var(--gray-200); border-radius: 12px; overflow: hidden; background: #fff; }
.panel-header { background: var(--gray-50); border-bottom: 1px solid var(--gray-200); padding: 12px 14px; font-weight: 900; color: var(--gray-900); font-size: 13px; }
.frow { display: grid; grid-template-columns: 160px 1fr; border-bottom: 1px solid var(--gray-200); }
.frow:last-child { border-bottom: 0; }
.flabel { background: #fbfbfc; color: var(--gray-600); padding: 10px 14px; border-right: 1px solid var(--gray-200); font-weight: 700; font-size: 13px; display: flex; align-items: center; }
.fvalue { padding: 7px 10px; }
.inp {
    width: 100%; border: 1px solid var(--gray-200); border-radius: 7px;
    padding: 7px 9px; font-size: 13px; color: var(--gray-900); background: #fff; outline: none;
}
.inp:focus { border-color: var(--blue-900); box-shadow: 0 0 0 3px rgba(11,47,134,0.08); }
.inp-err { border-color: #dc2626; }
.inp-err:focus { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.12); }
.fhint-err { color: #dc2626; font-size: 11px; font-weight: 700; margin-top: 4px; }
.req { color: #dc2626; font-weight: 800; }
.cbox { padding: 12px 14px; }
.txt { min-height: 110px; resize: vertical; font-family: inherit; }
</style>

<template>
    <div class="mini-preset ct-preset">
        <strong>{{ title }}</strong>
        <div class="preset-identity-grid">
            <label class="field"><span>Manufacturer</span><el-select v-model="form.manufacturer" size="mini" filterable clearable><el-option v-for="item in manufacturerOptions" :key="item" :label="item" :value="item" /></el-select></label>
            <label class="field"><span>Model</span><el-input v-model="form.model" size="mini" /></label>
            <label class="field"><span>Manufacturing year</span><el-input :value="form.manufacturingYear" size="mini" maxlength="4" @input="setNumeric(form, 'manufacturingYear', $event, true)" /></label>
            <label class="field"><span>Country of origin</span><el-select v-model="form.country" size="mini" filterable clearable><el-option v-for="item in countryOptions" :key="item" :label="item" :value="item" /></el-select></label>
            <label class="field"><span>CT type</span><el-input value="Inductive" size="mini" disabled /></label>
            <label class="field"><span>Phase per asset</span><el-input value="1" size="mini" disabled /></label>
            <label class="field"><span>Cores</span><el-input-number v-model="form.cores" :min="1" :max="10" size="mini" controls-position="right" @change="syncCores" /></label>
            <label class="field"><span>Primary windings</span><el-input :value="form.primaryWindingCount" size="mini" @input="setNumeric(form, 'primaryWindingCount', $event, true)" /></label>
        </div>
        <el-collapse class="core-profiles">
            <el-collapse-item v-for="(profile, coreIndex) in form.coreProfiles" :key="coreIndex" :name="coreIndex">
                <template slot="title">
                    <strong>Core {{ coreIndex + 1 }}</strong>
                    <span class="collapse-summary">{{ profile.taps }} taps · Common tap {{ profile.commonTap }}</span>
                </template>
                <div class="core-grid">
                    <label class="field"><span>Taps</span><el-input-number v-model="profile.taps" :min="2" :max="10" size="mini" controls-position="right" /></label>
                    <label class="field"><span>Common tap</span><el-input :value="profile.commonTap" size="mini" @input="setNumeric(profile, 'commonTap', $event, true)" /></label>
                    <label class="field span-two">
                        <span>Full tap Ipn / Isn (A)</span>
                        <div class="ratio-input"><el-input :value="profile.fullIpn" size="mini" @input="setNumeric(profile, 'fullIpn', $event)" /><b>:</b><el-input :value="profile.fullIsn" size="mini" @input="setNumeric(profile, 'fullIsn', $event)" /></div>
                    </label>
                </div>
                <div class="main-taps">
                    <div class="main-taps-heading">
                        <span>Main taps</span>
                        <el-button type="text" size="mini" icon="fa-solid fa-plus" @click.stop="addMainTap(profile)">Add</el-button>
                    </div>
                    <div v-if="!profile.mainTaps.length" class="blank-value">Blank</div>
                    <div v-for="(tap, tapIndex) in profile.mainTaps" :key="tapIndex" class="main-tap-row">
                        <span>Tap {{ tapIndex + 1 }}</span>
                        <el-input :value="tap.ipn" size="mini" placeholder="Ipn" @input="setNumeric(tap, 'ipn', $event)" />
                        <b>:</b>
                        <el-input :value="tap.isn" size="mini" placeholder="Isn" @input="setNumeric(tap, 'isn', $event)" />
                        <el-button type="text" class="danger-link" icon="fa-solid fa-trash" @click.stop="removeMainTap(profile, tapIndex)" />
                    </div>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script>
import MANUFACTURER_MAP from '@/views/ConstantAsset/manufacturer'
import { country } from '@/views/ConstantAsset'

const createProfile = (taps = 3, fullIpn = '', fullIsn = '', mainTaps = []) => ({
    taps,
    commonTap: '1',
    fullIpn,
    fullIsn,
    mainTaps: JSON.parse(JSON.stringify(mainTaps))
})

export default {
    name: 'PresetCtForm',
    props: {
        preset: { type: Object, required: true },
        title: { type: String, required: true }
    },
    data() {
        return {
            form: this.preset,
            manufacturerOptions: MANUFACTURER_MAP.CurrentTransformerDto || [],
            countryOptions: country.default || []
        }
    },
    watch: {
        preset(value) {
            this.form = value
            this.syncCores(value.cores)
        }
    },
    created() {
        this.syncCores(this.form.cores)
    },
    methods: {
        syncCores(value) {
            if (!Array.isArray(this.form.coreProfiles)) {
                const legacyProfile = createProfile(
                    this.form.taps || 3,
                    this.form.fullIpn || '',
                    this.form.fullIsn || '',
                    this.form.mainTaps || []
                )
                this.$set(this.form, 'coreProfiles', Array.from(
                    { length: Number(value) },
                    () => JSON.parse(JSON.stringify(legacyProfile))
                ))
            }
            while (this.form.coreProfiles.length < Number(value)) this.form.coreProfiles.push(createProfile())
            this.form.coreProfiles.splice(Number(value))
        },
        addMainTap(profile) {
            profile.mainTaps.push({ ipn: '', isn: '' })
        },
        removeMainTap(profile, index) {
            profile.mainTaps.splice(index, 1)
        },
        setNumeric(target, key, value, integer = false) {
            const source = String(value == null ? '' : value).replace(',', '.')
            let sanitized = source.replace(integer ? /[^0-9]/g : /[^0-9.]/g, '')
            if (!integer) {
                const decimalIndex = sanitized.indexOf('.')
                if (decimalIndex >= 0) sanitized = sanitized.slice(0, decimalIndex + 1) + sanitized.slice(decimalIndex + 1).replace(/\./g, '')
                if (sanitized.startsWith('.')) sanitized = `0${sanitized}`
            }
            this.$set(target, key, sanitized)
        }
    }
}
</script>

<template>
    <div class="mini-preset ct-preset">
        <strong>{{ title }}</strong>
        <div class="preset-identity-grid">
            <label class="field"><span>Manufacturer</span><el-input v-model="form.manufacturer" size="mini" /></label>
            <label class="field"><span>Model</span><el-input v-model="form.model" size="mini" /></label>
            <label class="field"><span>Manufacturing year</span><el-input v-model="form.manufacturingYear" size="mini" /></label>
            <label class="field"><span>Country of origin</span><el-input v-model="form.country" size="mini" /></label>
            <label class="field"><span>CT type</span><el-input value="Inductive" size="mini" disabled /></label>
            <label class="field"><span>Phase per asset</span><el-input value="1" size="mini" disabled /></label>
            <label class="field"><span>Cores</span><el-input-number v-model="form.cores" :min="1" :max="10" size="mini" controls-position="right" @change="syncCores" /></label>
            <label class="field"><span>Primary windings</span><el-input v-model="form.primaryWindingCount" size="mini" /></label>
        </div>
        <el-collapse class="core-profiles">
            <el-collapse-item v-for="(profile, coreIndex) in form.coreProfiles" :key="coreIndex" :name="coreIndex">
                <template slot="title">
                    <strong>Core {{ coreIndex + 1 }}</strong>
                    <span class="collapse-summary">{{ profile.taps }} taps · Common tap {{ profile.commonTap }}</span>
                </template>
                <div class="core-grid">
                    <label class="field"><span>Taps</span><el-input-number v-model="profile.taps" :min="2" :max="10" size="mini" controls-position="right" /></label>
                    <label class="field"><span>Common tap</span><el-input v-model="profile.commonTap" size="mini" /></label>
                    <label class="field span-two">
                        <span>Full tap Ipn / Isn (A)</span>
                        <div class="ratio-input"><el-input v-model="profile.fullIpn" size="mini" /><b>:</b><el-input v-model="profile.fullIsn" size="mini" /></div>
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
                        <el-input v-model="tap.ipn" size="mini" placeholder="Ipn" />
                        <b>:</b>
                        <el-input v-model="tap.isn" size="mini" placeholder="Isn" />
                        <el-button type="text" class="danger-link" icon="fa-solid fa-trash" @click.stop="removeMainTap(profile, tapIndex)" />
                    </div>
                </div>
            </el-collapse-item>
        </el-collapse>
    </div>
</template>

<script>
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
        return { form: this.preset }
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
        }
    }
}
</script>

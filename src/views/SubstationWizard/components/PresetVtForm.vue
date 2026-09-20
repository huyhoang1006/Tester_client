<template>
    <div class="mini-preset vt-preset">
        <strong>{{ title }}</strong>
        <div class="preset-identity-grid">
            <label class="field"><span>Manufacturer</span><el-input v-model="form.manufacturer" size="mini" /></label>
            <label class="field"><span>Model</span><el-input v-model="form.model" size="mini" /></label>
            <label class="field"><span>Manufacturing year</span><el-input v-model="form.manufacturingYear" size="mini" /></label>
            <label class="field"><span>Country of origin</span><el-input v-model="form.country" size="mini" /></label>
            <label class="field">
                <span>Type</span>
                <el-select v-model="form.type" size="mini">
                    <el-option label="CVT / CCVT" value="CVTCCTV" />
                    <el-option label="IVT" value="IVT" />
                </el-select>
            </label>
            <label class="field"><span>Phase per asset</span><el-input value="1" size="mini" disabled /></label>
            <label class="field"><span>C1</span><el-input v-model="form.c1" size="mini"><template slot="append">pF</template></el-input></label>
            <label class="field"><span>C2</span><el-input v-model="form.c2" size="mini"><template slot="append">pF</template></el-input></label>
            <label class="field"><span>Upr</span><el-input v-model="form.upr" size="mini"><template slot="append">kV</template></el-input></label>
            <label class="field"><span>Windings</span><el-input :value="form.windings.length" size="mini" disabled /></label>
        </div>
        <div class="winding-table">
            <div class="winding-row winding-header"><span>Name</span><span>Usr ratio</span><span>Usr voltage (V)</span><span>Burden (VA)</span><span>cos phi</span></div>
            <div v-for="(winding, index) in form.windings" :key="index" class="winding-row">
                <el-input v-model="winding.name" size="mini" />
                <el-select v-model="winding.usr" size="mini" clearable>
                    <el-option label="1 / 3" value="3" />
                    <el-option label="1 / sqrt(3)" value="3sqrt" />
                </el-select>
                <el-input v-model="winding.voltage" size="mini" />
                <el-input v-model="winding.burden" size="mini" />
                <el-input v-model="winding.powerFactor" size="mini" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'PresetVtForm',
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
        }
    }
}
</script>

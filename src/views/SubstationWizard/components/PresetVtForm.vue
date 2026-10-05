<template>
    <div class="mini-preset vt-preset">
        <strong>{{ title }}</strong>
        <div class="preset-identity-grid">
            <label class="field"><span>Manufacturer</span><el-select v-model="form.manufacturer" size="mini" filterable clearable><el-option v-for="item in manufacturerOptions" :key="item" :label="item" :value="item" /></el-select></label>
            <label class="field"><span>Model</span><el-input v-model="form.model" size="mini" /></label>
            <label class="field"><span>Manufacturing year</span><el-input :value="form.manufacturingYear" size="mini" maxlength="4" @input="setNumeric(form, 'manufacturingYear', $event, true)" /></label>
            <label class="field"><span>Country of origin</span><el-select v-model="form.country" size="mini" filterable clearable><el-option v-for="item in countryOptions" :key="item" :label="item" :value="item" /></el-select></label>
            <label class="field">
                <span>Type</span>
                <el-select v-model="form.type" size="mini">
                    <el-option label="CVT / CCVT" value="CVTCCTV" />
                    <el-option label="IVT" value="IVT" />
                </el-select>
            </label>
            <label class="field"><span>Phase per asset</span><el-input value="1" size="mini" disabled /></label>
            <label class="field"><span>C1</span><el-input :value="form.c1" size="mini" @input="setNumeric(form, 'c1', $event)"><template slot="append">pF</template></el-input></label>
            <label class="field"><span>C2</span><el-input :value="form.c2" size="mini" @input="setNumeric(form, 'c2', $event)"><template slot="append">pF</template></el-input></label>
            <label class="field"><span>Upr</span><el-input :value="form.upr" size="mini" @input="setNumeric(form, 'upr', $event)"><template slot="append">kV</template></el-input></label>
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
                <el-input :value="winding.voltage" size="mini" @input="setNumeric(winding, 'voltage', $event)" />
                <el-input :value="winding.burden" size="mini" @input="setNumeric(winding, 'burden', $event)" />
                <el-input :value="winding.powerFactor" size="mini" @input="setNumeric(winding, 'powerFactor', $event)" />
            </div>
        </div>
    </div>
</template>

<script>
import MANUFACTURER_MAP from '@/views/ConstantAsset/manufacturer'
import { country } from '@/views/ConstantAsset'

export default {
    name: 'PresetVtForm',
    props: {
        preset: { type: Object, required: true },
        title: { type: String, required: true }
    },
    data() {
        return {
            form: this.preset,
            manufacturerOptions: MANUFACTURER_MAP.VoltageTransformerDto || [],
            countryOptions: country.default || []
        }
    },
    watch: {
        preset(value) {
            this.form = value
        }
    },
    methods: {
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

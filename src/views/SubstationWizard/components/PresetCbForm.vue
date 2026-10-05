<template>
    <div class="form-grid four-columns preset-form">
        <label class="field"><span>Manufacturer</span><el-select v-model="form.manufacturer" size="mini" filterable clearable><el-option v-for="item in manufacturerOptions" :key="item" :label="item" :value="item" /></el-select></label>
        <label class="field"><span>Model</span><el-input v-model="form.model" size="mini" /></label>
        <label class="field"><span>Manufacturing year</span><el-input :value="form.manufacturingYear" size="mini" maxlength="4" @input="setNumeric('manufacturingYear', $event, true)" /></label>
        <label class="field"><span>Country of origin</span><el-select v-model="form.country" size="mini" filterable clearable><el-option v-for="item in countryOptions" :key="item" :label="item" :value="item" /></el-select></label>
        <label class="field">
            <span>CB type</span>
            <el-select v-model="form.type" size="mini">
                <el-option label="Vacuum" value="Vacuum" />
                <el-option label="Live tank SF6" value="LiveSF6" />
            </el-select>
        </label>
        <label class="field"><span>Number of phase</span><el-input value="3" size="mini" disabled /></label>
        <label class="field"><span>Rated voltage</span><el-input :value="form.ratedVoltage" size="mini" @input="setNumeric('ratedVoltage', $event)"><template slot="append">kV</template></el-input></label>
        <label class="field"><span>Rated current</span><el-input :value="form.ratedCurrent" size="mini" @input="setNumeric('ratedCurrent', $event)"><template slot="append">A</template></el-input></label>
        <label class="field"><span>Breaking current</span><el-input :value="form.breakingCurrent" size="mini" @input="setNumeric('breakingCurrent', $event)"><template slot="append">kA</template></el-input></label>
        <label class="field"><span>Interrupters / phase</span><el-input :value="form.interruptersPerPhase" size="mini" @input="setNumeric('interruptersPerPhase', $event, true)" /></label>
        <label class="field"><span>Duration</span><el-input :value="form.duration" size="mini" @input="setNumeric('duration', $event)"><template slot="append">s</template></el-input></label>
        <label class="field span-two"><span>Duty cycle</span><el-input v-model="form.dutyCycle" size="mini" /></label>
    </div>
</template>

<script>
import MANUFACTURER_MAP from '@/views/ConstantAsset/manufacturer'
import { country } from '@/views/ConstantAsset'

export default {
    name: 'PresetCbForm',
    props: {
        preset: { type: Object, required: true }
    },
    data() {
        return {
            form: this.preset,
            manufacturerOptions: MANUFACTURER_MAP.CircuitBreakerDto || [],
            countryOptions: country.default || []
        }
    },
    watch: {
        preset(value) { this.form = value }
    },
    methods: {
        setNumeric(key, value, integer = false) {
            const source = String(value == null ? '' : value).replace(',', '.')
            let sanitized = source.replace(integer ? /[^0-9]/g : /[^0-9.]/g, '')
            if (!integer) {
                const decimalIndex = sanitized.indexOf('.')
                if (decimalIndex >= 0) sanitized = sanitized.slice(0, decimalIndex + 1) + sanitized.slice(decimalIndex + 1).replace(/\./g, '')
                if (sanitized.startsWith('.')) sanitized = `0${sanitized}`
            }
            this.$set(this.form, key, sanitized)
        }
    }
}
</script>

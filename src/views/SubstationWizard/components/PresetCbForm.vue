<template>
    <div class="form-grid four-columns preset-form">
        <label class="field"><span>Manufacturer</span><el-input v-model="form.manufacturer" size="mini" /></label>
        <label class="field"><span>Model</span><el-input v-model="form.model" size="mini" /></label>
        <label class="field"><span>Manufacturing year</span><el-input v-model="form.manufacturingYear" size="mini" /></label>
        <label class="field"><span>Country of origin</span><el-input v-model="form.country" size="mini" /></label>
        <label class="field">
            <span>CB type</span>
            <el-select v-model="form.type" size="mini">
                <el-option label="Vacuum" value="Vacuum" />
                <el-option label="Live tank SF6" value="LiveSF6" />
            </el-select>
        </label>
        <label class="field"><span>Number of phase</span><el-input value="3" size="mini" disabled /></label>
        <label class="field"><span>Rated voltage</span><el-input v-model="form.ratedVoltage" size="mini"><template slot="append">kV</template></el-input></label>
        <label class="field"><span>Rated current</span><el-input v-model="form.ratedCurrent" size="mini"><template slot="append">A</template></el-input></label>
        <label class="field"><span>Breaking current</span><el-input v-model="form.breakingCurrent" size="mini"><template slot="append">kA</template></el-input></label>
        <label class="field"><span>Interrupters / phase</span><el-input v-model="form.interruptersPerPhase" size="mini" /></label>
        <label class="field"><span>Duration</span><el-input v-model="form.duration" size="mini"><template slot="append">s</template></el-input></label>
        <label class="field span-two"><span>Duty cycle</span><el-input v-model="form.dutyCycle" size="mini" /></label>
    </div>
</template>

<script>
export default {
    name: 'PresetCbForm',
    props: {
        preset: { type: Object, required: true }
    },
    data() {
        return { form: this.preset }
    },
    watch: {
        preset(value) { this.form = value }
    }
}
</script>

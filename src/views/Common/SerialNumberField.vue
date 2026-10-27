<template>
    <div class="serial-number-field">
        <el-input :value="unknown ? 'Unknown' : value" :disabled="unknown" :placeholder="placeholder" :size="size"
            @input="$emit('input', $event)" />
        <el-checkbox :value="unknown" :title="compact ? 'I don\'t know the serial number yet' : ''" @change="toggleUnknown">
            {{ compact ? 'Unknown serial' : "I don't know the serial number yet" }}
        </el-checkbox>
    </div>
</template>

<script>
import { isUnknownSerial, newUnknownSerial } from '@/utils/unknownSerial'

export default {
    name: 'SerialNumberField',
    props: {
        value: { type: [String, Number], default: '' },
        placeholder: { type: String, default: '' },
        size: { type: String, default: undefined },
        compact: { type: Boolean, default: false }
    },
    data() {
        return { previousSerial: '' }
    },
    computed: {
        unknown() { return isUnknownSerial(this.value) }
    },
    methods: {
        toggleUnknown(checked) {
            if (checked && !this.unknown) {
                this.previousSerial = this.value || ''
                this.$emit('input', newUnknownSerial())
            } else if (!checked && this.unknown) {
                this.$emit('input', this.previousSerial)
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.serial-number-field {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
}

.serial-number-field > .el-input {
    width: 100%;
}

.serial-number-field > .el-checkbox {
    margin-top: 6px;
    line-height: 20px;
}

::v-deep(.serial-number-field .el-checkbox__label) {
    white-space: normal;
    line-height: 1.4;
}
</style>

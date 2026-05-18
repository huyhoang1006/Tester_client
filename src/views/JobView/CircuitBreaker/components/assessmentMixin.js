/* eslint-disable */
/**
 * assessmentMixin.js
 * Shared cho tất cả Circuit Breaker test components.
 *
 * Mỗi component khi dùng mixin này cần khai báo thêm:
 *   - assessmentIpcChannel: tên IPC channel để update (xem từng component)
 *   - assessmentSectionKeys: (optional) dùng cho coilCharacteristics
 */

export default {
    data() {
        return {
            openAssessmentDialog: false,
            backupLimits: null,
        }
    },

    methods: {
        // ─── helpers ───────────────────────────────────────────────────────────
        getVal(obj) {
            if (obj === null || obj === undefined || obj === '') return null
            if (typeof obj === 'object' && 'value' in obj) {
                var v = obj.value
                if (v === '' || v === null || v === undefined) return null
                var n = parseFloat(v)
                return isNaN(n) ? null : n
            }
            var n2 = parseFloat(obj)
            return isNaN(n2) ? null : n2
        },

        // ─── assessment helpers ────────────────────────────────────────────────
        // Absolute: min ≤ value ≤ max
        assessAbsolute(value, minObj, maxObj) {
            var v   = parseFloat(value)
            var min = this.getVal(minObj)
            var max = this.getVal(maxObj)
            if (isNaN(v) || value === '' || value === null || value === undefined) return ''
            if (min === null || max === null) return ''
            return v >= min && v <= max ? 'Pass' : 'Fail'
        },

        // Relative: |value - ref| ≤ dev
        assessRelative(value, refObj, devObj) {
            var v   = parseFloat(value)
            var ref = this.getVal(refObj)
            var dev = this.getVal(devObj)
            if (isNaN(v) || value === '' || value === null || value === undefined) return ''
            if (ref === null || dev === null) return ''
            return Math.abs(v - ref) <= dev ? 'Pass' : 'Fail'
        },

        // Relative asymmetric: ref-minusDev ≤ value ≤ ref+plusDev
        // Dùng cho coil_characteristics (±dev riêng biệt)
        assessRelativeAsym(value, refObj, minusDevObj, plusDevObj) {
            var v        = parseFloat(value)
            var ref      = this.getVal(refObj)
            var minusDev = this.getVal(minusDevObj)
            var plusDev  = this.getVal(plusDevObj)
            if (isNaN(v) || value === '' || value === null || value === undefined) return ''
            if (ref === null || minusDev === null || plusDev === null) return ''
            if (v <= ref) return v >= (ref - minusDev) ? 'Pass' : 'Fail'
            return v <= (ref + plusDev) ? 'Pass' : 'Fail'
        },

        // Gom kết quả nhiều field: Fail > '' > Pass
        assessRow(results) {
            var hasEmpty = false
            for (var i = 0; i < results.length; i++) {
                if (results[i] === 'Fail') return 'Fail'
                if (results[i] === '')     hasEmpty = true
            }
            return hasEmpty ? '' : 'Pass'
        },

        // ─── dialog ───────────────────────────────────────────────────────────
        openAssessmentSettings() {
            this.backupLimits = JSON.parse(JSON.stringify(this.assetData.assessmentLimits))
            this.openAssessmentDialog = true
        },

        async updateAssessment() {
            var assetId = this.assetData.properties.mrid
            var result  = await window.electronAPI[this.assessmentIpcChannel]({
                assetId:          assetId,
                assessmentLimits: this.assetData.assessmentLimits,
                sectionKeys:      this.assessmentSectionKeys || null,
            })
            if (result.success) {
                this.$message.success('Update successfully')
                this.openAssessmentDialog = false
            } else {
                this.$message.error('Update failed: ' + (result.message || ''))
            }
        },

        resetAssessment() {
            this.$set(this.assetData, 'assessmentLimits', this.backupLimits)
            this.openAssessmentDialog = false
        },
    }
}

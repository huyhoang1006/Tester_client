/* eslint-disable */
/**
 * timingMixin.js
 * Shared logic cho tất cả Timing components (CTiming, OTiming, OCTiming, COTiming, OCOTiming, COCOTiming, OCOCOTiming).
 *
 * openTime index mapping (từ normalize function):
 * [0] opening_time
 * [1] opening_sync_within_phase
 * [2] opening_sync_breaker_phase
 * [3] closing_time
 * [4] closing_sync_within_phase
 * [5] closing_sync_breaker_phase
 * [6] reclosing_time
 * [7] open_close_time
 * [8] close_open_time
 *
 * auxContact mapping: [0-5] = switching_time_type_a, diff_to_main_type_a, switching_time_type_b, diff_to_main_type_b, switching_time_wiper, duration
 * miscell mapping: [0-3] = bounce_time, bounce_count, pir_close_time, reaction_time
 * coilCharacter mapping: [0-7] = peak_close_coil_current, peak_trip_coil_current, average_close_coil_current, average_trip_coil_current, average_close_coil_voltage, average_trip_coil_voltage, close_coil_resistance, trip_coil_resistance
 */

export default {
    data() {
        return {
            backupAsset_: null,
        }
    },

    methods: {

        // ─── Iterate testData.table safely (handles both object and array) ──────
        getTableEntries() {
            var table = this.testData && this.testData.table ? this.testData.table : {}
            if (Array.isArray(table)) {
                return table.map(function(rows, i) { return { key: 'table' + (i + 1), rows: rows } })
            }
            return Object.keys(table).map(function(key) { return { key: key, rows: table[key] } })
        },

        // ─── Assessment helpers ───────────────────────────────────────────────────
        // Absolute: min <= value <= max
        assessAbs(value, tmin, tmax) {
            var v  = parseFloat(value)
            var mn = parseFloat(tmin)
            var mx = parseFloat(tmax)
            if (isNaN(v) || value === '' || value === null || value === undefined) return null
            if (isNaN(mn) || isNaN(mx) || tmin === '' || tmax === '') return null
            return v >= mn && v <= mx ? 'Pass' : 'Fail'
        },

        // Relative symmetric: |value - ref| <= dev
        assessRel(value, tref, tdev) {
            var v   = parseFloat(value)
            var ref = parseFloat(tref)
            var dev = parseFloat(tdev)
            if (isNaN(v) || value === '' || value === null || value === undefined) return null
            if (isNaN(ref) || isNaN(dev) || tref === '' || tdev === '') return null
            return Math.abs(v - ref) <= dev ? 'Pass' : 'Fail'
        },

        // Relative asymmetric: ref-devZ <= value <= ref+devN
        assessRelAsym(value, rref, tdevZ, tdevN) {
            var v    = parseFloat(value)
            var ref  = parseFloat(rref)
            var devZ = parseFloat(tdevZ)
            var devN = parseFloat(tdevN)
            if (isNaN(v) || value === '' || value === null || value === undefined) return null
            if (isNaN(ref) || isNaN(devZ) || isNaN(devN)) return null
            if (rref === '' || tdevZ === '' || tdevN === '') return null
            if (v <= ref) return v >= (ref - devZ) ? 'Pass' : 'Fail'
            return v <= (ref + devN) ? 'Pass' : 'Fail'
        },

        // Apply assessment for a single timing value against openTime limit at given index
        assessTiming(value, index) {
            var openTime = this.asset_ && this.asset_.openTime ? this.asset_.openTime : null
            if (!openTime) return null
            var mode = this.testData && this.testData.limits ? this.testData.limits : 'Absolute'
            if (mode === 'Absolute') {
                var abs = openTime.abs[index] || {}
                return this.assessAbs(value, abs.tmin, abs.tmax)
            } else {
                var rel = openTime.rel[index] || {}
                return this.assessRelAsym(value, rel.rref, rel.tdevZ, rel.tdevN)
            }
        },

        // Merge new result into current row assessment (Fail wins, null = no data)
        mergeResult(current, newResult) {
            if (current === 'Fail') return 'Fail'
            if (newResult === 'Fail') return 'Fail'
            if (newResult === null) return current // no limit → keep current
            if (current === null || current === '' || current === undefined) return newResult
            if (newResult === 'Pass' && current === 'Pass') return 'Pass'
            return 'Fail'
        },

        // ─── Reverse normalize: write asset_ values back into assetData.assessmentLimits ─
        // Needed before saving to DB (assetData.assessmentLimits has all unit MRIDs)
        reverseNormalizeToAssessmentLimits() {
            var al     = this.assetData && this.assetData.assessmentLimits ? this.assetData.assessmentLimits : null
            var asset_ = this.asset_
            if (!al || !asset_) return

            var absMapping = [
                'opening_time', 'opening_sync_within_phase', 'opening_sync_breaker_phase',
                'closing_time', 'closing_sync_within_phase', 'closing_sync_breaker_phase',
                'reclosing_time', 'open_close_time', 'close_open_time'
            ]
            var tripMapping = ['switching_time_type_a','diff_to_main_type_a','switching_time_type_b','diff_to_main_type_b','switching_time_wiper','duration']
            var miscMapping = ['bounce_time','bounce_count','pir_close_time','reaction_time']
            var coilMapping = ['peak_close_coil_current','peak_trip_coil_current','average_close_coil_current','average_trip_coil_current','average_close_coil_voltage','average_trip_coil_voltage','close_coil_resistance','trip_coil_resistance']

            // limits type
            if (asset_.limits) al.limits = asset_.limits

            // operating_time
            if (asset_.openTime && al.operating_time) {
                absMapping.forEach(function(key, i) {
                    var abs = asset_.openTime.abs[i] || {}
                    var rel = asset_.openTime.rel[i] || {}
                    if (al.operating_time.abs[key]) {
                        if (al.operating_time.abs[key].t_min) al.operating_time.abs[key].t_min.value = abs.tmin || ''
                        if (al.operating_time.abs[key].t_max) al.operating_time.abs[key].t_max.value = abs.tmax || ''
                    }
                    if (al.operating_time.rel[key]) {
                        if (al.operating_time.rel[key].t_ref)      al.operating_time.rel[key].t_ref.value       = rel.rref  || ''
                        if (al.operating_time.rel[key].minus_t_dev) al.operating_time.rel[key].minus_t_dev.value = rel.tdevZ || ''
                        if (al.operating_time.rel[key].plus_t_dev)  al.operating_time.rel[key].plus_t_dev.value  = rel.tdevN || ''
                    }
                })
            }

            // auxiliary_contacts - trip_operation
            if (asset_.auxContact && al.auxiliary_contacts) {
                tripMapping.forEach(function(key, i) {
                    var absT = asset_.auxContact.abs && asset_.auxContact.abs.trip ? asset_.auxContact.abs.trip[i] || {} : {}
                    var relT = asset_.auxContact.rel && asset_.auxContact.rel.trip ? asset_.auxContact.rel.trip[i] || {} : {}
                    var absC = asset_.auxContact.abs && asset_.auxContact.abs.close ? asset_.auxContact.abs.close[i] || {} : {}
                    var relC = asset_.auxContact.rel && asset_.auxContact.rel.close ? asset_.auxContact.rel.close[i] || {} : {}
                    if (al.auxiliary_contacts.trip_operation) {
                        if (al.auxiliary_contacts.trip_operation.abs[key]) {
                            if (al.auxiliary_contacts.trip_operation.abs[key].t_min) al.auxiliary_contacts.trip_operation.abs[key].t_min.value = absT.tmin || ''
                            if (al.auxiliary_contacts.trip_operation.abs[key].t_max) al.auxiliary_contacts.trip_operation.abs[key].t_max.value = absT.tmax || ''
                        }
                        if (al.auxiliary_contacts.trip_operation.rel[key]) {
                            if (al.auxiliary_contacts.trip_operation.rel[key].t_ref) al.auxiliary_contacts.trip_operation.rel[key].t_ref.value = relT.tref || ''
                            if (al.auxiliary_contacts.trip_operation.rel[key].t_dev) al.auxiliary_contacts.trip_operation.rel[key].t_dev.value = relT.tdef || ''
                        }
                    }
                    if (al.auxiliary_contacts.close_operation) {
                        if (al.auxiliary_contacts.close_operation.abs[key]) {
                            if (al.auxiliary_contacts.close_operation.abs[key].t_min) al.auxiliary_contacts.close_operation.abs[key].t_min.value = absC.tmin || ''
                            if (al.auxiliary_contacts.close_operation.abs[key].t_max) al.auxiliary_contacts.close_operation.abs[key].t_max.value = absC.tmax || ''
                        }
                        if (al.auxiliary_contacts.close_operation.rel[key]) {
                            if (al.auxiliary_contacts.close_operation.rel[key].t_ref) al.auxiliary_contacts.close_operation.rel[key].t_ref.value = relC.tref || ''
                            if (al.auxiliary_contacts.close_operation.rel[key].t_dev) al.auxiliary_contacts.close_operation.rel[key].t_dev.value = relC.tdef || ''
                        }
                    }
                })
            }

            // miscellaneous
            if (asset_.miscell && al.miscellaneous) {
                miscMapping.forEach(function(key, i) {
                    var abs = asset_.miscell.abs ? asset_.miscell.abs[i] || {} : {}
                    var rel = asset_.miscell.rel ? asset_.miscell.rel[i] || {} : {}
                    if (al.miscellaneous.abs[key]) {
                        if (al.miscellaneous.abs[key].min) al.miscellaneous.abs[key].min.value = abs.min || ''
                        if (al.miscellaneous.abs[key].max) al.miscellaneous.abs[key].max.value = abs.max || ''
                    }
                    if (al.miscellaneous.rel[key]) {
                        if (al.miscellaneous.rel[key].ref) al.miscellaneous.rel[key].ref.value = rel.ref || ''
                        if (al.miscellaneous.rel[key].dev) al.miscellaneous.rel[key].dev.value = rel.dev || ''
                    }
                })
            }

            // coil_characteristics
            if (asset_.coilCharacter && al.coil_characteristics) {
                coilMapping.forEach(function(key, i) {
                    var abs = asset_.coilCharacter.abs ? asset_.coilCharacter.abs[i] || {} : {}
                    var rel = asset_.coilCharacter.rel ? asset_.coilCharacter.rel[i] || {} : {}
                    if (al.coil_characteristics.abs[key]) {
                        if (al.coil_characteristics.abs[key].min) al.coil_characteristics.abs[key].min.value = abs.min || ''
                        if (al.coil_characteristics.abs[key].max) al.coil_characteristics.abs[key].max.value = abs.max || ''
                    }
                    if (al.coil_characteristics.rel[key]) {
                        if (al.coil_characteristics.rel[key].ref)       al.coil_characteristics.rel[key].ref.value       = rel.ref  || ''
                        if (al.coil_characteristics.rel[key].minus_dev) al.coil_characteristics.rel[key].minus_dev.value = rel.devZ || ''
                        if (al.coil_characteristics.rel[key].plus_dev)  al.coil_characteristics.rel[key].plus_dev.value  = rel.devN || ''
                    }
                })
            }
        },

        // ─── Dialog management ────────────────────────────────────────────────────
        openAssessmentSettings() {
            this.backupAsset_ = JSON.parse(JSON.stringify(this.asset_ || {}))
            this.openAssessmentDialog = true
        },

        async updateAssessment() {
            // 1. Sync limits type
            if (this.testData && this.testData.limits) {
                this.asset_.limits = this.testData.limits
            }
            // 2. Write asset_ values back into assetData.assessmentLimits (preserves unit MRIDs)
            this.reverseNormalizeToAssessmentLimits()
            // 3. Save via IPC
            var assetId = this.assetData && this.assetData.properties ? this.assetData.properties.mrid : null
            if (!assetId) {
                this.$message.error('Asset ID not found')
                return
            }
            var result = await window.electronAPI.updateTimingAssessmentLimits({
                assetId:          assetId,
                assessmentLimits: this.assetData.assessmentLimits,
            })
            var dataTemp = JSON.parse(JSON.stringify(this.asset_ || {}))
            this.backupAsset_ = dataTemp
            if (result.success) {
                this.$message.success('Update successfully')
                this.openAssessmentDialog = false
            } else {
                this.$message.error('Update cannot complete')
                this.openAssessmentDialog = false
            }
        },

        resetAssessment() {
            this.asset_ = JSON.parse(JSON.stringify(this.backupAsset_ || {}))
            if (this.asset_.limits && this.testData) {
                this.$set(this.testData, 'limits', this.asset_.limits)
            }
            this.openAssessmentDialog = false
        },
    }
}
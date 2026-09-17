<template>
    <el-form-item label="Status">
        <el-select
            v-model="statusValue"
            allow-create
            filterable
            :reserve-keyword="false"
            placeholder="Select status"
        >
            <el-option v-for="status in statuses" :key="status" :label="status" :value="status"></el-option>
        </el-select>
    </el-form-item>
</template>

<script>
export default {
    name: 'AssetStatusField',
    props: {
        properties: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            statuses: ['In operation', 'Spare', 'Repair', 'Out of operation', 'Scrap']
        }
    },
    computed: {
        statusValue: {
            get() {
                return this.properties.status || ''
            },
            set(value) {
                const status = value || ''
                if (status !== this.properties.status) {
                    this.$set(this.properties, 'status', status)
                    this.$set(this.properties, 'status_date_time', status ? new Date().toISOString() : '')
                }
            }
        }
    }
}
</script>

<template>
    <testing-equipment-table
        :data="data"
        :test-type-list-data="testTypeListData"
        test-type-field="test_type_disconnector_id" />
</template>
<script>
/* eslint-disable */
import TestingEquipmentTable from '@/views/JobView/Common/TestingEquipmentTable/index.vue'

export default {
    name: 'testingEquipment',
    components: { TestingEquipmentTable },
    props: {
        data: {
            type: Array,
            required: true,
            default: () => []
        },
        testTypeListData: {
            type: Array,
            required: true,
            default: () => []
        }
    }
}
</script>

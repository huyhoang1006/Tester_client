<template>
    <testing-equipment-table
        :data="data"
        :test-list="testList" />
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
        testList: {
            type: Array,
            required: true,
            default: () => []
        }
    }
}
</script>

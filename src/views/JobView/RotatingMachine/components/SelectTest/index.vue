<template>
    <select-test-panel
        :data="data"
        :test-type-list-data="testTypeListData"
        :asset-data="assetData"
        :init-test="initTest" />
</template>
<script>
/* eslint-disable */
import SelectTestPanel from '@/views/JobView/Common/SelectTestPanel/index.vue'
import mixin from './mixin'

export default {
    name: 'selectTest',
    mixins: [mixin],
    components: { SelectTestPanel },
    props: {
        data: {
            type: Array,
            default: () => []
        },
        assetData: {
            type: Object,
            default: () => ({})
        },
        testTypeListData: {
            type: Array,
            default: () => []
        }
    }
}
</script>

<template>
    <job-overview-panel
        :data="data"
        :location-data="locationData"
        :asset-data="assetData"
        :product-asset-model-data="productAssetModelData"
        :attachment="attachment"
        @update-attachment="$emit('update-attachment', $event)" />
</template>
<script>
/* eslint-disable */
import JobOverviewPanel from '@/views/JobView/Common/JobOverviewPanel/index.vue'

export default {
    name: 'overview',
    components: { JobOverviewPanel },
    props: {
        data: {
            type: Object,
            default: () => ({})
        },
        locationData: {
            type: Object,
            default: () => ({})
        },
        assetData: {
            type: Object,
            default: () => ({})
        },
        productAssetModelData: {
            type: Object,
            default: () => ({})
        },
        attachment: {
            type: Array,
            default: () => []
        }
    }
}
</script>

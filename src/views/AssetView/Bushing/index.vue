<template>
    <div style="flex: 1; margin-top: 20px;">
        <properties :data="this.bushing_data.properties" @update-attachment="updateAttachment" :attachment.sync="this.attachmentData"></properties>
        <bushing :data="this.bushing_data.bushing"></bushing>
    </div>
</template>

<script>
/* eslint-disable */
import properties from './components/property/index.vue'
import bushing from './components/bushing/index.vue'
import mixin from './mixin/index.js'
export default {
    name: 'Bushing',
    components: {
        properties,
        bushing
    },
    data() {
        return {
            parentData : JSON.parse(JSON.stringify(this.parent)),
        }
    },
    mixins: [mixin],
    props: {
        parent : {
            type: Object,
            default: () => ({})
        },
        organisationId: {
            type: String,
            default: ''
        },

        locationId: {
            type: String,
            default: ''
        },
    },
    methods: {
        updateAttachment(attachment) {
            this.attachmentData = attachment
        },
        loadMapForView() {

        },
    }
}
</script>

<style lang="scss" scoped>
</style>
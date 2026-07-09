<template>
    <div class="bushing-view">
        <properties :data="this.bushing_data.properties" @update-attachment="updateAttachment" :attachment="normalAttachmentData">
            <template #side-top>
                <name-plate
                    class="bushing-media-card"
                    :attachment_="nameplateAttachment"
                    :file-url="nameplateFileUrl"
                    height="230px"
                    @data-attachment="updateNameplate">
                </name-plate>
            </template>
        </properties>
        <bushing :data="this.bushing_data.bushing" :config="this.bushing_data.configuration"></bushing>
    </div>
</template>

<script>
/* eslint-disable */
import properties from './components/property/index.vue'
import bushing from './components/bushing/index.vue'
import NamePlate from '@/views/Common/NamePlate.vue'
import mixin from './mixin/index.js'
export default {
    name: 'Bushing',
    components: {
        properties,
        bushing,
        NamePlate
    },
    data() {
        return {
            normalAttachmentData: []
        }
    },
    computed: {
        parentData() {
            return this.parent
        },
        nameplateAttachment() {
            return (this.attachmentData || []).find(item => item && item.role === 'nameplate') || null
        },
        nameplateFileUrl() {
            return this.nameplateAttachment && this.nameplateAttachment.path ? this.nameplateAttachment.path : '-1'
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
    watch: {
        attachmentData: {
            deep: true,
            immediate: true,
            handler(value) {
                const normalAttachments = this.getNormalAttachments(value)
                if (!this.isSameAttachmentList(this.normalAttachmentData, normalAttachments)) {
                    this.normalAttachmentData = normalAttachments
                }
            }
        }
    },
    methods: {
        updateAttachment(attachment) {
            this.mergeAttachmentData(attachment, this.nameplateAttachment)
        },
        updateNameplate(nameplate) {
            this.mergeAttachmentData(this.normalAttachmentData, nameplate)
        },
        mergeAttachmentData(attachments, nameplate) {
            const normalAttachments = this.getNormalAttachments(attachments)
            const data = [...normalAttachments]
            if (nameplate && nameplate.path) {
                data.push({
                    ...nameplate,
                    role: 'nameplate'
                })
            }
            if (!this.isSameAttachmentList(this.attachmentData, data)) {
                this.attachmentData = data
            }
        },
        getNormalAttachments(attachments) {
            return (attachments || [])
                .filter(item => item && item.path && item.role !== 'nameplate')
                .map(item => {
                    const { role, ...rest } = item
                    return rest
                })
        },
        isSameAttachmentList(left, right) {
            return JSON.stringify(left || []) === JSON.stringify(right || [])
        },
        loadMapForView() {

        },
    }
}
</script>

<style lang="scss" scoped>
.bushing-view {
    flex: 1;
    margin-top: 14px;
    padding-bottom: 16px;
}
</style>

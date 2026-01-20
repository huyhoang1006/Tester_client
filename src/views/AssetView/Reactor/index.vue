<template>
    <div>
        <PropertiesReactor :data="reactor.properties" @update-attachment="updateAttachment" :attachment.sync="this.attachmentData"></PropertiesReactor>
        <el-row :gutter="20" class="content">
            <el-col :xs="24" :md="12" class="col-content mgt-20">    
                <RatingsReactor :data="reactor.reactorRating"></RatingsReactor>
            </el-col>
            <el-col :xs="24" :md="12" class="col-content mgt-20">    
                <OthersReactor :data="reactor.reactorOther"></OthersReactor>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import PropertiesReactor from './components/properties.vue'
import OthersReactor from './components/others.vue'
import RatingsReactor from './components/ratings.vue'
import mixin from './mixin'
export default {
    name: 'Reactor',
    components: {
        PropertiesReactor,
        OthersReactor,
        RatingsReactor
    },
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
    data() {
        return {
        }
    },
    computed: {
        parentData() {
            return this.parent
        }
    },
    mixins : [mixin],
    methods: {
        updateAttachment(attachment) {
            this.attachmentData = attachment
        },
        loadMapForView() {
        }
    },
}

</script>
<style scoped>
</style>
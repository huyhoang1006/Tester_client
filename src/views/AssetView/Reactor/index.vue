<template>
    <div>
        <PropertiesReactor :data="reactor.properties" @update-attachment="updateAttachment" :attachment.sync="this.attachmentData"></PropertiesReactor>
        <el-row style="margin-top: 20px;" :gutter="20" class="content">
            <el-col :span="12" class="col-content">    
                <RatingsReactor :data="reactor.reactorRating"></RatingsReactor>
            </el-col>
            <el-col :span="12" class="col-content">    
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
<template>
    <div id="asset">
        <div>
            <property :data="this.surge_arrester_data.properties" @update-attachment="updateAttachment" :attachment.sync="this.attachmentData"></property>
            <ratings :data="this.surge_arrester_data.ratings"></ratings>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import mixin from './mixin'
import property from './components/property/index.vue'
import ratings from './components/ratings/index.vue'

export default {
    name: 'surgeArrester',
    components: {
        property,
        ratings,
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
    }
}
</script>

<style lang="scss" scoped>
#asset {
    width: 100%;
    height: 100%;
}

table,
td,
th {
    border: 1px solid;
}

table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
}

th,
td {
    padding: 0px 10px;
    height: 30px;
}
</style>

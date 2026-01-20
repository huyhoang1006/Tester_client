<template>
    <div id="asset">
        <div style="display: flex; flex-direction: column;">
            <el-row justify="center" class="top-switch">
                <el-col :xs="24" :md="18" :lg="12">
                    <el-row :gutter="8">
                        <el-col :xs="12" :sm="6" :md="6">
                            <el-button class="trs-btn" @click="switchData('circuitBreaker')" size="mini"
                                style="width: 100%;" type="primary">Circuit Breaker</el-button>
                        </el-col>
                        <el-col :xs="12" :sm="6" :md="6">
                            <el-button class="trs-btn" @click="switchData('operatingMechanism')" size="mini"
                                style="width: 100%;" type="primary">Operating</el-button>
                        </el-col>
                        <el-col :xs="12" :sm="6" :md="6">
                            <el-button class="trs-btn" @click="switchData('assessmentLimit')" size="mini"
                                style="width: 100%;" type="primary">Assessment</el-button>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
            <div style="flex: 1; display: flex; flex-direction: column;">
                <div v-if="this.switch == 'circuitBreaker'">
                    <circuitBreakProperty :title="title" :properties.sync="circuitBreakerDto.properties"
                        @update-attachment="updateAttachment" :attachment.sync="this.attachmentData">
                    </circuitBreakProperty>
                    <circuitBreakerData :properties="circuitBreakerDto.properties"
                        :circuitBreaker="circuitBreakerDto.circuitBreaker"></circuitBreakerData>
                    <circuitBreakRating :ratings.sync="circuitBreakerDto.ratings"></circuitBreakRating>
                    <contactSystem :contactSys.sync="circuitBreakerDto.contactSystem"></contactSystem>
                    <others :others="circuitBreakerDto.others"></others>
                </div>
                <div v-else-if="this.switch == 'operatingMechanism'">
                    <operatingMechanism :operating.sync="circuitBreakerDto.operating"></operatingMechanism>
                </div>
                <div v-else-if="this.switch == 'assessmentLimit'">
                    <assessmentLimit :assessLimits.sync="circuitBreakerDto.assessmentLimits"></assessmentLimit>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import mixin from './mixin'
import circuitBreakProperty from '../CircuitBreaker/components/properties.vue'
import circuitBreakRating from '../CircuitBreaker/components/ratings.vue'
import circuitBreakerData from '../CircuitBreaker/components/circuitBreaker.vue'
import contactSystem from '../CircuitBreaker/components/contactSystem.vue'
import others from '../CircuitBreaker/components/others.vue'
import operatingMechanism from '../CircuitBreaker/components/operatingMechanism.vue'
import assessmentLimit from '../CircuitBreaker/components/assessmentLimits.vue'

export default {
    name: 'circuitBreaker',
    components: {
        circuitBreakProperty,
        circuitBreakRating,
        circuitBreakerData,
        contactSystem,
        others,
        operatingMechanism,
        assessmentLimit,
    },
    props: {
        parent: {
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
            title: 'Circuit breaker',
            switch: 'circuitBreaker',
        }
    },
    computed: {
        parentData() {
            return this.parent
        }
    },
    mixins: [mixin],
    methods: {
        switchData(data) {
            this.switch = data;
        },
        updateAttachment(attachment) {
            this.attachmentData = attachment
        },
        loadMapForView() {
        },
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

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
}

::v-deep .el-input__inner,
::v-deep .el-select .el-input__inner {
    font-size: 12px !important;
}

::v-deep(.top-switch) {
    ::v-deep(.el-button) {
        white-space: nowrap;
        line-height: 1.4;
        padding: 4px;
        text-align: center;
        text-overflow: ellipsis;
        font-size: 12px;
    }
}

::v-deep(.top-switch .trs-btn) {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 768px) {
    .top-switch {
        ::v-deep(.el-col) {
            margin-bottom: 8px;
        }
    }
}
</style>
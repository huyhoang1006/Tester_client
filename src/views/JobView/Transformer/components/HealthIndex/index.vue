<template>
    <div id="health-index">

        <div  class="display-flex mgb-10">
            <table class="table-strip-input-data mgr-10">
                <thead>
                    <tr>
                        <th class="no-col">No</th>
                        <th>Test</th>
                        <th>Score (Average case)</th>
                        <th>Weighting factor</th>
                        <th>Total score</th>
                    </tr>
                </thead>
                <tbody v-for="(item, index) in data_" :key="index">
                    <tr v-if="['BushingPrimC1', 'BushingPrimC2', 'WindingDfCap'].includes(item.testTypeCode) && item.name.includes('(DF)')">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.name }}</td>
                        <td v-if="item.average_score_df != null">{{ parseFloat(item.average_score_df).toFixed(4) }}</td>
                        <td v-if="item.weighting_factor_df != null">{{ parseFloat(item.weighting_factor_df).toFixed(4) }}</td>
                        <td>{{ total_score(item.weighting_factor_df, item.average_score_df) }}</td>
                    </tr>
                    <tr v-else-if="['BushingPrimC1', 'BushingPrimC2', 'WindingDfCap'].includes(item.testTypeCode) && item.name.includes('(C)')">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.name }}</td>
                        <td v-if="item.average_score_c != null">{{ parseFloat(item.average_score_c).toFixed(4) }}</td>
                        <td v-if="item.weighting_factor_c != null">{{ parseFloat(item.weighting_factor_c).toFixed(4) }}</td>
                        <td>{{ total_score(item.weighting_factor_c, item.average_score_c) }}</td>
                    </tr>
                    <tr v-else>
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.name }}</td>
                        <td v-if="item.average_score != null">{{ parseFloat(item.average_score).toFixed(4) }}</td>
                        <td v-if="item.weighting_factor != null">{{ parseFloat(item.weighting_factor).toFixed(4) }}</td>
                        <td>{{ total_score(item.weighting_factor, item.average_score) }}</td>
                    </tr>
                </tbody>

            </table>

            <table class="" style="width: 340px">
                <tbody>
                    <tr>
                        <th>Health Index (Average)</th>
                        <td v-if="properties.average_health_index != null && properties.average_health_index != undefined && properties.average_health_index != ''" >{{properties.average_health_index.toFixed(4)}}</td>
                    </tr>
                    <tr>
                        <th>Assessment</th>
                        <td v-if="properties.average_health_index != null && properties.average_health_index != undefined && properties.average_health_index != ''" :class="nameColor(judge_average(parseFloat(properties.average_health_index).toFixed(4)))">{{judge_average(properties.average_health_index.toFixed(4))}}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="display-flex">
            <table class="table-strip-input-data mgr-10">
                <thead>
                    <tr>
                        <th class="no-col">No</th>
                        <th>Test</th>
                        <th>Score (Worst case)</th>
                        <th>Weighting factor</th>
                        <th>Total score</th>
                    </tr>
                </thead>
                <tbody v-for="(item, index) in data_" :key="index">
                    
                    <tr v-if="['BushingPrimC1', 'BushingPrimC2', 'WindingDfCap'].includes(item.testTypeCode) && item.name.includes('(DF)')">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.name }}</td>
                        <td>{{ parseFloat(item.worst_score_df).toFixed(4) }}</td>
                        <td>{{ parseFloat(item.weighting_factor_df).toFixed(4) }}</td>
                        <td>{{ total_score(item.weighting_factor_df, item.worst_score_df) }}</td>
                    </tr>
                    <tr v-else-if="['BushingPrimC1', 'BushingPrimC2', 'WindingDfCap'].includes(item.testTypeCode) && item.name.includes('(C)')">
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.name }}</td>
                        <td>{{ parseFloat(item.worst_score_c).toFixed(4) }}</td>
                        <td>{{ parseFloat(item.weighting_factor_c).toFixed(4) }}</td>
                        <td>{{ total_score(item.weighting_factor_c, item.worst_score_c) }}</td>
                    </tr>
                    <tr v-else>
                        <td>{{ index + 1 }}</td>
                        <td>{{ item.name }}</td>
                        <td>{{ parseFloat(item.worst_score).toFixed(4) }}</td>
                        <td>{{ parseFloat(item.weighting_factor).toFixed(4) }}</td>
                        <td>{{ total_score(item.weighting_factor, item.worst_score) }}</td>
                    </tr>
                </tbody>
            </table>

            <table class="" style="width: 340px">
                <tbody>
                    <tr>
                        <th>Health Index (Worst)</th>
                        <td>{{parseFloat(properties.worst_health_index).toFixed(4)}}</td>
                    </tr>
                    <tr>
                        <th>Assessment</th>
                        <td :class="nameColor(judge_worst(parseFloat(properties.worst_health_index).toFixed(4)))">{{judge_worst(parseFloat(properties.worst_health_index).toFixed(4))}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {

    props: {
        data: {
            type: Array,
            required: true,
            default() {
                return []
            }
        },
        properties: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            isMonitor : false,
            data__ : []
        }
    },

    computed: {
        data_() {
            return Object.values(this.data)
        }
    },

    async beforeMount() {
    },

    mounted: function() {
    },

    methods: {
        judge_worst(worsrt_score) {
            if(8 <= parseFloat(worsrt_score) && parseFloat(worsrt_score) <= 10) {
                return "Good"
            }
            else if (6 <= parseFloat(worsrt_score) && parseFloat(worsrt_score) < 8) {
                return "Fair"
            } else if (4 <= parseFloat(worsrt_score) && parseFloat(worsrt_score) < 6) {
                return "Poor"
            } else if (2 <= parseFloat(worsrt_score) && parseFloat(worsrt_score) < 4) {
                return "Bad"
            } else if (parseFloat(worsrt_score) < 2) {
                return "Unacceptable"
            } else {
                return ''
            }
        },
        judge_average(average_score) {
            if(8 <= parseFloat(average_score) && parseFloat(average_score) <= 10) {
                return "Good"
            }
            else if (6 <= parseFloat(average_score) && parseFloat(average_score) < 8) {
                return "Fair"
            } else if (4 <= parseFloat(average_score) && parseFloat(average_score) < 6) {
                return "Poor"
            } else if (2 <= parseFloat(average_score) && parseFloat(average_score) < 4) {
                return "Bad"
            } else if (parseFloat(average_score) < 2) {
                return "Unacceptable"
            } else {
                return ''
            }
        },
        total_score(weighting_factor, score) {
           return parseFloat(weighting_factor * score).toFixed(4)
        },
        nameColor(data) {
            if(data === this.$constant.GOOD) {
                return 'Good'
            }
            else if(data === this.$constant.FAIR) {
                return 'Fair'
            }
            else if(data === this.$constant.POOR) {
                return 'Poor'
            }
            else if(data === this.$constant.BAD) {
                return 'Bad'
            }
            else {
                return;
            }
        }             
    }
}
</script>

<style lang="scss" scoped>
#health-index {
    width: calc(100vw - 145px);
    height: calc(100vh - 150px);
    overflow-y: auto;
    overflow-x: hidden;
}

.Good {
    background: #00CC00;
}

.Fair {
    background: #FFFF00;
}

.Poor {
    background: #FFC000;
}

.Bad {
    background: #FF0000;
}
</style>

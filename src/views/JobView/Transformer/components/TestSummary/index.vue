<template>
    <div id="test-summary">
        <table class="w-100" style="table-layout: fixed">
            <thead>
                <tr>
                    <th style="height: 40px" colspan="4">Test conditions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Serial no</td>
                    <td>{{ asset.serial_no }}</td>
                    <td>Apparatus ID</td>
                    <td>{{ asset.apparatus_id }}</td>
                </tr>
                <tr>
                    <td>Manufacturer</td>
                    <td>{{ asset.manufacturer }}</td>
                    <td>Feeder</td>
                    <td>{{ asset.feeder }}</td>
                </tr>
                <tr>
                    <td>Manufacturing year</td>
                    <td>{{ asset.manufacturing_year }}</td>
                    <td>Number of phase</td>
                    <td>{{ asset.phases }}</td>
                </tr>
                <tr>
                    <td>Manufacturer type</td>
                    <td>{{ asset.manufacturer_type }}</td>
                    <td>Vector group</td>
                    <td>{{ vectorGroup }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Đánh giá theo average -->
        <!-- <table class="w-100 mgt-10">
            <thead>
                <tr>
                    <th style="height: 40px" colspan="3">Test conditions (Average score)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th class="no-col">No.</th>
                    <th>Test</th>
                    <th class="condition-indicator-col">Condition</th>
                </tr>
                <tr v-for="(item, index) in testListData" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.name }}</td>
                    <template v-if="['BushingPrimC1', 'BushingPrimC2', 'DcWindingPrim', 'DcWindingSec'].includes(item.testTypeCode)">
                        <td style="padding: 0">
                            <div class="flex-container">
                                <template>
                                    <div v-if="item.average_score_df == 3" class="good">Good (DF)</div>
                                    <div v-else-if="item.average_score_df == 2" class="fair">Fair (DF)</div>
                                    <div v-else-if="item.average_score_df == 1" class="poor">Poor (DF)</div>
                                    <div v-else-if="item.average_score_df == 0" class="bad">Bad (DF)</div>
                                    <div v-else></div>
                                </template>
                                
                                <template>
                                    <div v-if="item.average_score_c == 3" class="good">Good (C)</div>
                                    <div v-else-if="item.average_score_c == 2" class="fair">Fair (C)</div>
                                    <div v-else-if="item.average_score_c == 1" class="poor">Poor (C)</div>
                                    <div v-else-if="item.average_score_c == 0" class="bad">Bad (C)</div>
                                    <div v-else></div>
                                </template>
                            </div>
                        </td>
                    </template>
                    <template v-else>
                        <td v-if="item.average_score == 3" class="good">Good</td>
                        <td v-else-if="item.average_score == 2" class="fair">Fair</td>
                        <td v-else-if="item.average_score == 1" class="poor">Poor</td>
                        <td v-else-if="item.average_score == 0" class="bad">Bad</td>
                        <td v-else></td>
                    </template>
                </tr>
            </tbody>
        </table> -->

        <!-- Đánh giá theo wort -->
        <table class="w-100 mgt-10">
            <thead>
                <tr>
                    <th style="height: 40px" colspan="3">Test conditions (Worst score)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th class="no-col">No.</th>
                    <th>Test</th>
                    <th class="condition-indicator-col">Condition</th>
                </tr>
                <tr v-for="(item, index) in testListData" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.name }}</td>
                    <template v-if="['BushingPrimC1', 'BushingPrimC2', 'WindingDfCap'].includes(item.testTypeCode)">
                        <td style="padding: 0">
                            <div class="flex-container">
                                <template>
                                    <div v-if="item.worst_score_df == 3" class="good">Good (DF)</div>
                                    <div v-else-if="item.worst_score_df == 2" class="fair">Fair (DF)</div>
                                    <div v-else-if="item.worst_score_df == 1" class="poor">Poor (DF)</div>
                                    <div v-else-if="item.worst_score_df == 0" class="bad">Bad (DF)</div>
                                    <div v-else></div>
                                </template>

                                <template>
                                    <div v-if="item.worst_score_c == 3" class="good">Good (C)</div>
                                    <div v-else-if="item.worst_score_c == 2" class="fair">Fair (C)</div>
                                    <div v-else-if="item.worst_score_c == 1" class="poor">Poor (C)</div>
                                    <div v-else-if="item.worst_score_c == 0" class="bad">Bad (C)</div>
                                    <div v-else></div>
                                </template>
                            </div>
                        </td>
                    </template>
                    <template v-else>
                        <td v-if="item.worst_score == 3" class="good">Good</td>
                        <td v-else-if="item.worst_score == 2" class="fair">Fair</td>
                        <td v-else-if="item.worst_score == 1" class="poor">Poor</td>
                        <td v-else-if="item.worst_score == 0" class="bad">Bad</td>
                        <td v-else></td>
                    </template>
                </tr>
                <!-- online monitor -->
                <tr v-if="this.isMonitor">
                    <td>{{ testListData.length + 1 }}</td>
                    <td>Online Monitoring</td>
                    <td style="padding: 0">
                        <div class="flex-container">
                            <template>
                                <div v-if="dataOnlineMonitoring && dataOnlineMonitoring.bushing_df_worst == 3" class="good">Good (DF)</div>
                                <div v-else-if="dataOnlineMonitoring && dataOnlineMonitoring.bushing_df_worst == 2" class="fair">Fair (DF)</div>
                                <div v-else-if="dataOnlineMonitoring && dataOnlineMonitoring.bushing_df_worst == 1" class="poor">Poor (DF)</div>
                                <div v-else-if="dataOnlineMonitoring && dataOnlineMonitoring.bushing_df_worst == 0" class="bad">Bad (DF)</div>
                                <div v-else></div>
                            </template>

                            <template>
                                <div v-if="dataOnlineMonitoring && dataOnlineMonitoring.bushing_c_worst == 3" class="good">Good (C)</div>
                                <div v-else-if="dataOnlineMonitoring && dataOnlineMonitoring.bushing_c_worst == 2" class="fair">Fair (C)</div>
                                <div v-else-if="dataOnlineMonitoring && dataOnlineMonitoring.bushing_c_worst == 1" class="poor">Poor (C)</div>
                                <div v-else-if="dataOnlineMonitoring && dataOnlineMonitoring.bushing_c_worst == 0" class="bad">Bad (C)</div>
                                <div v-else></div>
                            </template>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
    props: {
        data: {
            type: Array,
            required: true
        },
        asset: {
            type: Object,
            require: true
        }
    },
    data() {
        return {
            dataOnlineMonitoring: null,
            isMonitor : false
        }
    },
    async beforeMount() {
        if (this.selectedAsset && Array.isArray(this.selectedAsset) && this.selectedAsset.length > 0 && this.selectedAsset[0] && this.selectedAsset[0].id) {
            const assetId = this.selectedAsset[0].id
            const rs = await window.electronAPI.getOnlineMonitoringData(assetId)
            
            if (rs.success && rs.data) {
                this.dataOnlineMonitoring = rs.data
                this.isMonitor = true
            } else {
                this.isMonitor = false
            }
        } else {
            this.isMonitor = false
        }
    },
    computed: {
        ...mapState(['selectedAsset']),
        testListData: function () {
            return this.data
        },
        vectorGroup: function () {
            if (!this.asset || !this.asset.vector_group) {
                return ''
            }
            try {
                const vg = JSON.parse(this.asset.vector_group)
                return '' + vg.prim + ('' + vg.sec.I + vg.sec.Value + vg.tert.I + vg.tert.Value + vg.tert.accessibility).toLowerCase()
            } catch (error) {
                return ''
            }
        }
    }
}
</script>

<style lang="scss" scoped>
#test-summary {
    width: calc(100vw - 145px);
    height: calc(100vh - 150px);
    overflow-y: auto;
    overflow-x: hidden;
}

table {
    background-color: #dbdbdb;
    border-collapse: collapse;
}

td,
th {
    border: thin solid #fff;
    height: 30px;
    padding: 0px 10px;
}

.flex-container {
    display: flex;
    flex-direction: column;

    div {
        height: 30px;
        line-height: 30px;
        padding: 0 10px;
        box-sizing: border-box;
    }
}
</style>

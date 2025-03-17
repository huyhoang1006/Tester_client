<template>
    <div id="select-test">
        <table class="mgt-5 w-100 table-strip-input-data" style="width: 70%;">
            <thead>
                <tr>
                    <th class="no-col">No</th>
                    <th style="width: 300px">Test type</th>
                    <th>Test name</th>
                    <th class="action-col"><el-checkbox v-model="checkAll" size="large" /></th>
                    <th class="assessment-col">Assessment</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in testListData" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>
                        {{ item.testTypeName }}
                    </td>
                    <td>
                        <el-input size="mini" type="text" v-model="item.name"></el-input>
                    </td>
                    <td style="text-align: center;">
                        <el-checkbox value="data" v-model="checkbox_[index]" size="large" />
                    </td>
                    <td>
                        <el-select class="assessment" size="mini" v-model="assessment_[index]">
                            <el-option value="Pass"><i class="fa-solid fa-square-check pass"></i> Pass</el-option>
                            <el-option value="Fail"><i class="fa-solid fa-xmark fail"></i> Fail</el-option>
                        </el-select>
                        <span v-if="assessment_[index] === 'Pass'" class="fa-solid fa-square-check pass icon-status"></span>
                        <span v-else-if="assessment_[index] === 'Fail'" class="fa-solid fa-xmark fail icon-status"></span>
                    </td>
                </tr>
            </tbody>
        </table>
        <br/><br/><br/>
        <el-button type="primary" @click="show()" size="mini">Export</el-button>
    </div>
</template>

<script>
/* eslint-disable */
import { mapState } from 'vuex'

export default {
    name : "exportData",
    props: {
        data: {
            type: Array,
            required: true,
            default() {
                return []
            }
        },
    },
    data() {
        return {
            checkbox_ : [],
            checkAll : '',
            assessment_ : [],
            assessmentAll : true
        }
    },
    async beforeMount() {

    },
    mounted() {},
    watch : {
        checkbox : {
            deep: true,
            immediate: true,
            handler: function (newVal) {
                this.checkbox_ = newVal
            }
        },
        assessment : {
            deep: true,
            immediate: true,
            handler: function (newVal) {
                this.assessment_ = newVal
            }
        },
        checkAll : {
            handler: function (newVal) {
                for(let i=0; i < this.checkbox_.length; i ++) {
                    this.checkbox_[i] = newVal
                }
            }
        }
    },
    computed: {
        ...mapState(['selectedLocation', 'selectedAsset']),
        testListData() {
            return this.data
        },
        assessment() {
            let data = []
            for(let i = 0; i < this.testListData.length; i++) {
                data.push('')
            }
            return data 
        },
        checkbox() {
            let data = []
            for(let i = 0; i < this.testListData.length; i++) {
                data.push(false)
            }
            return data
        }
    },
    methods: {
        async show() {
            await window.electronAPI.exportEtrc(this.$store.state.selectedAsset[0], "")
        },
        async createCheckbox() {
            let data = []
            for(let i = 0; i < this.testListData.length; i++) {
                data.push(true)
            }
            return data
        },
        checkAll_() {
            for(let i =0; i < this.checkbox_.length; i++) {
                this.checkbox_[i] = !this.checkbox_[i]
            }
        },
    }
}
</script>

<style lang="scss" scoped>
#select-test {
    width: calc(100vw - 145px);
    height: calc(100vh - 150px);
    overflow-y: auto;
    overflow-x: hidden;
}
</style>

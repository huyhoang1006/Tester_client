<template>
    <div class="st-wrap">
        <div class="st-panel st-left">
            <div class="st-header">
                <span class="st-title">Available tests <span class="st-count">{{ filteredTestTypes.length }}</span></span>
                <el-input
                    v-model="search"
                    size="mini"
                    placeholder="Search test type..."
                    prefix-icon="el-icon-search"
                    clearable
                    class="st-search" />
            </div>
            <div class="st-list">
                <div v-if="filteredTestTypes.length === 0" class="st-empty">No test type found.</div>
                <div
                    v-for="item in filteredTestTypes"
                    :key="item.mrid"
                    class="st-item"
                    @dblclick="add(item)">
                    <span class="st-item-name" :title="item.name">{{ item.name }}</span>
                    <span v-if="usageCount[item.mrid]" class="st-badge" title="Times added">{{ usageCount[item.mrid] }}</span>
                    <button type="button" class="st-btn add" title="Add test" @click="add(item)">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>

        <div class="st-panel st-right">
            <div class="st-header">
                <span class="st-title">Selected tests <span class="st-count">{{ testListData.length }}</span></span>
                <span class="st-hint">Test name is editable</span>
            </div>
            <div class="st-list">
                <div v-if="testListData.length === 0" class="st-empty">
                    No test selected — add one from the list on the left.
                </div>
                <div v-for="(item, index) in testListData" :key="item.mrid || index" class="st-item selected">
                    <span class="st-idx">{{ index + 1 }}</span>
                    <span class="st-tag" :title="item.testTypeName">{{ item.testTypeName }}</span>
                    <el-input size="mini" v-model="item.name" class="st-name-input" placeholder="Test name"></el-input>
                    <button type="button" class="st-btn danger" title="Remove test" @click="remove(index)">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
/* eslint-disable */
// Panel "Test settings" dùng chung cho mọi JobView.
// Logic khởi tạo test (initTest) khác nhau theo loại thiết bị -> truyền từ wrapper qua prop.
import Attachment from '@/views/Flatten/Attachment'
import TestStandard from '@/views/Cim/TestStandard'
import uuid from '@/utils/uuid'

export default {
    name: 'SelectTestPanel',
    props: {
        data: {
            type: Array,
            default: () => []
        },
        testTypeListData: {
            type: Array,
            default: () => []
        },
        assetData: {
            type: Object,
            default: () => ({})
        },
        initTest: {
            type: Function,
            required: true
        }
    },
    data() {
        return {
            search: ''
        }
    },
    computed: {
        testListData() {
            return this.data || []
        },
        filteredTestTypes() {
            const list = this.testTypeListData || []
            const q = this.search.trim().toLowerCase()
            if (!q) return list
            return list.filter(t => (t.name || '').toLowerCase().includes(q))
        },
        // số lần mỗi test type đã được thêm (hiện badge bên trái)
        usageCount() {
            const map = {}
            for (const t of this.testListData) {
                if (t.testTypeId) map[t.testTypeId] = (map[t.testTypeId] || 0) + 1
            }
            return map
        }
    },
    methods: {
        async add(testType) {
            const count = this.usageCount[testType.mrid] || 0
            const initTest = await this.initTest(testType.alias_name, this.assetData)
            const name = count === 0 ? testType.name : `${testType.name} (${count})`
            this.testListData.push({
                mrid: uuid.newUuid(),
                testTypeId: testType.mrid,
                testTypeCode: testType.alias_name,
                testTypeName: testType.name,
                name,
                data: { table: initTest.table },
                testCondition: {
                    mrid: '',
                    condition: initTest.rowDataExampleCondition,
                    comment: '',
                    attachment: new Attachment(),
                    attachmentData: []
                },
                testAssessment: {
                    testStandard: new TestStandard(),
                    assessment: initTest.rowDataAssessment
                },
                worst_score: null,
                worst_score_df: null,
                worst_score_c: null,
                average_score: null,
                average_score_df: null,
                average_score_c: null,
                weighting_factor: null,
                total_average_score: null,
                total_worst_score: null,
                created_on: new Date().getTime()
            })
        },
        remove(index) {
            this.$confirm('Remove this test and its data from the job?', 'Warning', {
                confirmButtonText: 'Remove',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(() => {
                    this.testListData.splice(index, 1)
                })
                .catch(() => {})
        }
    }
}
</script>
<style scoped>
.st-wrap {
    display: flex;
    gap: 14px;
    align-items: stretch;
    /* responsive: 2 panel tự xếp dọc khi bề ngang hẹp */
    flex-wrap: wrap;
}
.st-panel {
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: #fff;
}
.st-left { flex: 4 1 280px; }
.st-right { flex: 6 1 380px; }

.st-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 10px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 6px 6px 0 0;
}
.st-title {
    font-size: 12px;
    font-weight: 600;
    color: #606266;
    white-space: nowrap;
}
.st-count {
    display: inline-block;
    min-width: 18px;
    padding: 0 5px;
    margin-left: 4px;
    border-radius: 9px;
    background: #e4e7ed;
    color: #606266;
    font-size: 11px;
    text-align: center;
    line-height: 18px;
}
.st-search { flex: 0 1 180px; min-width: 110px; }
.st-hint { font-size: 11px; color: #c0c4cc; white-space: nowrap; }
.st-header { flex-wrap: wrap; }

.st-list {
    flex: 1;
    overflow-y: auto;
    max-height: calc(100vh - 220px);
    padding: 4px 0;
}
.st-empty {
    text-align: center;
    color: #909399;
    font-style: italic;
    font-size: 12px;
    padding: 18px 10px;
}

.st-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px;
    font-size: 12px;
    border-bottom: 1px solid #f5f7fa;
}
.st-item:last-child { border-bottom: none; }
.st-item:hover { background: #fafbfc; }

.st-item-name {
    flex: 1;
    min-width: 0;
    font-weight: 600;
    color: #303133;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.st-badge {
    min-width: 16px;
    padding: 0 4px;
    border-radius: 8px;
    background: #ecf5ff;
    color: #409eff;
    font-size: 11px;
    text-align: center;
    line-height: 16px;
}

.st-idx {
    width: 20px;
    text-align: center;
    color: #909399;
    flex-shrink: 0;
}
.st-tag {
    max-width: 160px;
    padding: 1px 8px;
    border-radius: 3px;
    background: #ecf5ff;
    color: #409eff;
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
}
.st-name-input { flex: 1; min-width: 0; }

.st-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 4px;
    color: #909399;
    line-height: 1;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
}
.st-btn.add:hover { color: #409eff; background: #ecf5ff; }
.st-btn.danger:hover { color: #f56c6c; background: #fef0f0; }
</style>

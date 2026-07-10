<template>
    <div class="bay-view">
        <div class="bay-row">
            <div class="col-content">
                <section class="bay-card">
                    <div class="bay-header">
                        <i class="fa-solid fa-diagram-project"></i>
                        <span>Properties</span>
                    </div>
                    <div class="bay-body">
                        <el-form :model="properties" :inline-message="true" :label-width="labelWidth" size="mini"
                            label-position="left">
                            <el-form-item label="Name">
                                <el-input v-model="properties.name"></el-input>
                            </el-form-item>
                            <el-form-item label="Breaker configuration">
                                <el-select v-model="properties.breaker_configuration" allow-create filterable
                                    placeholder="Value">
                                    <el-option v-for="(value, index) in breakerConfigList" :key="index" :label="value"
                                        :value="value"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="Bus Bar configuration">
                                <el-select v-model="properties.bus_bar_configuration" allow-create filterable
                                    placeholder="Value">
                                    <el-option v-for="(value, index) in busBarConfigList" :key="index" :label="value"
                                        :value="value"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-form>
                    </div>
                </section>
            </div>
            <div class="col-content">
                <section class="bay-card bay-comment-card">
                    <div class="bay-header">
                        <i class="fa-solid fa-align-left"></i>
                        <span>Comment</span>
                    </div>
                    <div class="bay-body">
                        <el-form size="mini" class="bay-comment-form">
                            <el-input class="bay-comment-input" type="textarea" v-model="properties.comment"></el-input>
                        </el-form>
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
import mixin from './mixin/index'
export default {
    name: 'Bay',
    mixins: [mixin],
    props: {
        parent: {
            type: Object,
            default: () => ({})
        },
        locationId: {
            type: String,
            default: ''
        }
    },
}
</script>

<style scoped>
.bay-view {
    display: flex;
    flex-direction: column;
    padding: 0 4px 16px;
}

.bay-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
    gap: 20px;
    margin-top: 14px;
}

.col-content {
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.bay-card {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
}

.bay-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 6px 6px 0 0;
    color: #606266;
    font-size: 12px;
    font-weight: 600;
}

.bay-header i {
    color: #909399;
}

.bay-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px;
}

.bay-body ::v-deep(.el-form) {
    width: 100%;
}

.bay-comment-form,
.bay-comment-input,
.bay-comment-input ::v-deep(.el-textarea__inner) {
    height: 100%;
}

.bay-comment-form {
    display: flex;
    flex: 1;
}

.bay-comment-input ::v-deep(.el-textarea__inner) {
    min-height: 120px !important;
    resize: vertical;
}

::v-deep(.el-select),
::v-deep(.el-input),
::v-deep(.el-textarea) {
    width: 100%;
}

::v-deep(.el-form-item) {
    margin-bottom: 10px;
}

::v-deep(.el-form-item__label) {
    font-size: 12px !important;
    color: #303133;
}

::v-deep(.el-input__inner),
::v-deep(.el-select .el-input__inner) {
    width: 100%;
    font-size: 12px !important;
    height: 32px;
    line-height: 32px;
}

@media (max-width: 767px) {
    .bay-view {
        padding: 0 0 12px;
    }

    .bay-row {
        gap: 10px;
        margin-top: 10px;
    }

    .bay-header {
        padding: 8px 10px;
    }

    .bay-body {
        padding: 10px;
    }

    ::v-deep(.el-form-item) {
        display: block;
    }

    ::v-deep(.el-form-item__label) {
        float: none;
        display: block;
        width: 100% !important;
        margin-left: 0 !important;
        padding: 0 0 4px;
        text-align: left;
    }

    ::v-deep(.el-form-item__content) {
        width: 100%;
        margin-left: 0 !important;
    }
}
</style>

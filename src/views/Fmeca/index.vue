<template>
    <div class="fmeca-view" v-loading="loading">
        <header class="fmeca-head">
            <div class="fmeca-heading">
                <span class="fmeca-eyebrow">Transformer assessment</span>
                <h1>{{ selectedRecord ? selectedRecord.name : 'FMECA' }}</h1>
                <p v-if="selectedRecord">
                    {{ selectedRecord.protected ? 'Protected default assessment model' : 'Local assessment model' }}
                    <span v-if="selectedRecord.isHiSource" class="hi-source-label"><i></i> Used for HI</span>
                </p>
            </div>

            <div class="fmeca-actions">
                <el-select
                    v-if="records.length"
                    :value="selectedId"
                    size="small"
                    class="fmeca-selector"
                    :disabled="editMode"
                    aria-label="FMECA table"
                    @change="selectFmeca">
                    <el-option
                        v-for="record in records"
                        :key="record.localId"
                        :value="record.localId"
                        :label="`${record.name}${record.isHiSource ? ' · HI' : ''}`" />
                </el-select>

                <el-button size="small" :disabled="editMode" @click="openCreateDialog">
                    <i class="el-icon-plus" aria-hidden="true"></i>
                    New FMECA
                </el-button>

                <el-dropdown v-if="selectedRecord" :disabled="editMode" trigger="click" @command="manageFmeca">
                    <el-button size="small" :disabled="editMode">
                        <i class="el-icon-more" aria-hidden="true"></i>
                        Manage
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="set-hi" :disabled="selectedRecord.isHiSource">
                            Use this FMECA for HI
                        </el-dropdown-item>
                        <el-dropdown-item command="rename" :disabled="selectedRecord.protected">
                            Rename FMECA
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" :disabled="selectedRecord.protected" divided>
                            Delete FMECA
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>

                <el-button v-if="selectedRecord && !editMode" type="primary" size="small" @click="startEdit">
                    <i class="el-icon-edit" aria-hidden="true"></i>
                    Edit
                </el-button>
            </div>
        </header>

        <div class="fmeca-tabbar" role="tablist">
            <button :class="{active: activeSection === 'fmeca'}" role="tab" @click="activeSection = 'fmeca'">
                <i class="fa-solid fa-table-list" aria-hidden="true"></i>
                FMECA table
            </button>
            <button :class="{active: activeSection === 'weighting'}" role="tab" @click="activeSection = 'weighting'">
                <i class="fa-solid fa-chart-column" aria-hidden="true"></i>
                Weighting &amp; HI
            </button>
        </div>

        <el-alert v-if="loadError" type="error" :title="loadError" :closable="false" show-icon />

        <div v-if="editMode" class="edit-banner">
            <span><strong>Edit mode.</strong> Update scores, tests and the Component → Failure Mode structure.</span>
            <div>
                <el-button size="small" @click="cancelEdit">Cancel</el-button>
                <el-button type="primary" size="small" :loading="saving" @click="saveChanges">Save changes</el-button>
            </div>
        </div>

        <div v-if="!selectedRecord && !loading && !loadError" class="empty-state">
            <i class="el-icon-document"></i>
            <strong>No FMECA available</strong>
            <span>Create an FMECA to begin configuring failure modes.</span>
        </div>

        <section v-else-if="selectedRecord && activeSection === 'fmeca'" class="fmeca-panel">
            <div class="panel-head">
                <div>
                    <h2>Failure mode assessment</h2>
                    <p>{{ failureModeCount }} failure modes across {{ components.length }} components</p>
                </div>
                <el-button v-if="editMode" size="small" @click="addComponent">
                    <i class="el-icon-plus" aria-hidden="true"></i>
                    Component
                </el-button>
            </div>

            <div class="fmeca-table-scroll">
                <table class="fmeca-table">
                    <thead>
                        <tr>
                            <th class="col-number">No.</th>
                            <th class="col-failure">Failure Mode</th>
                            <th class="col-indicator">Condition Indicator</th>
                            <th class="col-test">Test</th>
                            <th class="col-score">
                                <span>SoF <el-tooltip content="Severity of Failure, scored from 1 to 10"><i class="el-icon-info"></i></el-tooltip></span>
                            </th>
                            <th class="col-score">
                                <span>PoF <el-tooltip content="Probability of Failure, scored from 1 to 10"><i class="el-icon-info"></i></el-tooltip></span>
                            </th>
                            <th class="col-score">
                                <span>SoT <el-tooltip content="Sensitivity of Test, scored from 1 to 10"><i class="el-icon-info"></i></el-tooltip></span>
                            </th>
                            <th class="col-rpn">
                                <span>RPN <el-tooltip content="RPN = SoF × PoF × SoT"><i class="el-icon-info"></i></el-tooltip></span>
                            </th>
                            <th class="col-include">
                                <span>Include in HI <el-tooltip content="Excluded failure modes remain saved but do not contribute to Weighting or HI"><i class="el-icon-info"></i></el-tooltip></span>
                            </th>
                            <th v-if="editMode" class="col-action"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="(component, componentIndex) in components">
                            <tr :key="component.id" class="component-row">
                                <td class="row-number">{{ componentIndex + 1 }}</td>
                                <td>
                                    <div class="component-cell">
                                        <button class="icon-button" :title="component.collapsed ? 'Expand' : 'Collapse'" @click="component.collapsed = !component.collapsed">
                                            <i :class="component.collapsed ? 'el-icon-arrow-right' : 'el-icon-arrow-down'"></i>
                                        </button>
                                        <el-input v-if="editMode" v-model="component.name" size="mini" />
                                        <strong v-else>{{ component.name }}</strong>
                                        <small>{{ component.failureModes.length }} failure modes</small>
                                    </div>
                                </td>
                                <td colspan="7"></td>
                                <td v-if="editMode" class="row-actions">
                                    <el-tooltip content="Add failure mode">
                                        <el-button type="text" icon="el-icon-plus" @click="addFailureMode(component)" />
                                    </el-tooltip>
                                    <el-tooltip content="Delete component">
                                        <el-button class="danger-action" type="text" icon="el-icon-delete" @click="deleteComponent(component)" />
                                    </el-tooltip>
                                </td>
                            </tr>

                            <tr
                                v-for="(failure, failureIndex) in component.collapsed ? [] : component.failureModes"
                                :key="failure.id"
                                :class="['failure-row', {excluded: !isFailureIncluded(failure)}]">
                                <td class="row-number">{{ componentIndex + 1 }}.{{ failureIndex + 1 }}</td>
                                <td>
                                    <div class="failure-cell">
                                        <i></i>
                                        <el-input v-if="editMode" v-model="failure.name" size="mini" />
                                        <span v-else>{{ failure.name }}</span>
                                    </div>
                                </td>
                                <td>
                                    <el-input v-if="editMode" v-model="failure.conditionIndicator" size="mini" />
                                    <span v-else>{{ failure.conditionIndicator || '—' }}</span>
                                </td>
                                <td>
                                    <template v-if="editMode">
                                        <el-select v-model="failure.test" size="mini" filterable @change="testChanged(failure)">
                                            <el-option v-for="test in testOptions" :key="test" :label="test" :value="test" />
                                        </el-select>
                                        <el-input
                                            v-if="failure.test === customTest"
                                            v-model="failure.customTest"
                                            class="custom-test-input"
                                            size="mini"
                                            placeholder="Custom test name" />
                                    </template>
                                    <span v-else>{{ displayTest(failure) || '—' }}</span>
                                    <small v-if="failure.test === customTest" class="custom-warning">
                                        HI calculation is not available for custom tests.
                                    </small>
                                </td>
                                <td class="score-cell">
                                    <el-select v-if="editMode" v-model="failure.sof" size="mini">
                                        <el-option v-for="value in scores" :key="value" :label="value" :value="value" />
                                    </el-select>
                                    <span v-else>{{ failure.sof }}</span>
                                </td>
                                <td class="score-cell">
                                    <el-select v-if="editMode" v-model="failure.pof" size="mini">
                                        <el-option v-for="value in scores" :key="value" :label="value" :value="value" />
                                    </el-select>
                                    <span v-else>{{ failure.pof }}</span>
                                </td>
                                <td class="score-cell">
                                    <el-select v-if="editMode" v-model="failure.sot" size="mini">
                                        <el-option v-for="value in scores" :key="value" :label="value" :value="value" />
                                    </el-select>
                                    <span v-else>{{ failure.sot }}</span>
                                </td>
                                <td class="rpn-cell" :class="rpnClass(failure)">{{ failureRpn(failure) }}</td>
                                <td>
                                    <div class="include-cell">
                                        <el-switch
                                            v-model="failure.includeInHi"
                                            :disabled="!editMode || failure.test === customTest" />
                                        <span>{{ isFailureIncluded(failure) ? 'Included' : 'Excluded' }}</span>
                                    </div>
                                </td>
                                <td v-if="editMode" class="row-actions">
                                    <el-tooltip content="Delete failure mode">
                                        <el-button class="danger-action" type="text" icon="el-icon-delete" @click="deleteFailureMode(component, failure)" />
                                    </el-tooltip>
                                </td>
                            </tr>
                        </template>
                        <tr v-if="!components.length">
                            <td :colspan="editMode ? 10 : 9" class="table-empty">
                                No components yet. Enter Edit mode and add a component.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section v-else-if="selectedRecord" class="weighting-section">
            <div class="hi-source-banner">
                <span>HI source</span>
                <strong>{{ hiRecord ? hiRecord.name : 'ATDigital FMECA' }}</strong>
                <small>Weighting always uses the designated HI source, regardless of the FMECA currently open.</small>
            </div>

            <div :class="['summary-grid', {'has-age': weighting.includesTransformerAge}]">
                <div class="summary-item">
                    <span>Total RPN</span>
                    <strong>{{ weighting.totalRpn }}</strong>
                    <small>Included criteria only</small>
                </div>
                <div class="summary-item">
                    <span>Tests included in HI</span>
                    <strong>{{ weighting.testsIncluded }}</strong>
                    <small>Custom tests excluded</small>
                </div>
                <div v-if="weighting.includesTransformerAge" class="summary-item">
                    <span>Transformer age</span>
                    <strong class="summary-text">Included in HI</strong>
                    <small>Operating date, or manufacturing date when unavailable</small>
                </div>
            </div>

            <div v-if="weighting.rows.length" class="weighting-layout">
                <div class="fmeca-panel">
                    <div class="panel-head">
                        <div>
                            <h2>Weighting factors</h2>
                            <p>Aggregated by Transformer Condition Criteria</p>
                        </div>
                    </div>
                    <div class="weighting-table-scroll">
                        <table class="weighting-table">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>Transformer Condition Criteria</th>
                                    <th>Total RPN</th>
                                    <th>RPN Proportion</th>
                                    <th>Weighting Factor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, index) in weighting.rows" :key="row.test">
                                    <td>{{ index + 1 }}</td>
                                    <td>{{ row.test }}</td>
                                    <td class="numeric-cell">{{ row.totalRPN }}</td>
                                    <td class="numeric-cell">{{ percent(row.rpnProportion) }}</td>
                                    <td class="numeric-cell">{{ decimal(row.weightingFactor) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="fmeca-panel chart-panel">
                    <div class="panel-head">
                        <div>
                            <h2>Weight distribution</h2>
                            <p>Criteria sorted by Weighting Factor</p>
                        </div>
                    </div>
                    <div class="weight-chart">
                        <div v-for="row in weighting.rows" :key="row.test" class="chart-row">
                            <span class="chart-label" :title="row.test">{{ row.test }}</span>
                            <div class="chart-track"><i :style="{width: chartWidth(row.weightingFactor)}"></i></div>
                            <strong>{{ decimal(row.weightingFactor) }}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="empty-state fmeca-panel">
                <i class="el-icon-data-analysis"></i>
                <strong>No weighting data available</strong>
                <span>Include at least one failure mode with a supported test in the HI source FMECA.</span>
            </div>
        </section>

        <el-dialog title="Create FMECA" :visible.sync="createDialogVisible" width="460px" append-to-body>
            <el-form ref="createForm" :model="createForm" :rules="createRules" label-position="top">
                <el-form-item label="FMECA name" prop="name">
                    <el-input v-model.trim="createForm.name" maxlength="80" autocomplete="off" />
                </el-form-item>
                <el-form-item label="Use as template" prop="templateId">
                    <el-select v-model="createForm.templateId" class="dialog-select">
                        <el-option v-for="record in records" :key="record.localId" :label="record.name" :value="record.localId" />
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer">
                <el-button @click="createDialogVisible = false">Cancel</el-button>
                <el-button type="primary" :loading="saving" @click="createFmeca">Create</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import {
    CUSTOM_TEST,
    calculateWeighting,
    collectTestOptions,
    createEmptyComponent,
    createEmptyFailureMode,
    failureRpn,
    toEditableFmeca,
    validateEditableFmeca
} from './mapper'

const clone = value => JSON.parse(JSON.stringify(value))

export default {
    name: 'Fmeca',
    data() {
        return {
            records: [],
            selectedId: null,
            loading: false,
            saving: false,
            loadError: '',
            loadRequestId: 0,
            activeSection: 'fmeca',
            editMode: false,
            draft: null,
            createDialogVisible: false,
            createForm: {name: '', templateId: ''},
            createRules: {
                name: [{required: true, message: 'FMECA name is required', trigger: 'blur'}],
                templateId: [{required: true, message: 'Select an FMECA template', trigger: 'change'}]
            },
            customTest: CUSTOM_TEST,
            scores: Array.from({length: 10}, (_, index) => index + 1)
        }
    },
    computed: {
        userId() {
            const user = this.$store && this.$store.state && this.$store.state.user
            return user && user.user_id
        },
        selectedRecord() {
            return this.records.find(record => record.localId === this.selectedId) || null
        },
        hiRecord() {
            return this.records.find(record => record.isHiSource) || this.records[0] || null
        },
        components() {
            if (this.editMode && this.draft) return this.draft.components
            return this.selectedRecord ? this.selectedRecord.model.components : []
        },
        failureModeCount() {
            return this.components.reduce((total, component) => total + component.failureModes.length, 0)
        },
        testOptions() {
            return collectTestOptions(this.records)
        },
        weighting() {
            return calculateWeighting(this.hiRecord ? this.hiRecord.model.components : [])
        },
        maxWeight() {
            return Math.max(0, ...this.weighting.rows.map(row => row.weightingFactor))
        }
    },
    watch: {
        userId: {
            immediate: true,
            handler() {
                this.loadFmeca()
            }
        }
    },
    methods: {
        normalizeRecords(records) {
            return (records || []).map(record => ({
                ...record,
                model: toEditableFmeca(record.tableFmeca, record.tableCalculate)
            }))
        },
        async loadFmeca(preferredId = null) {
            const userId = this.userId
            const requestId = ++this.loadRequestId
            this.loadError = ''
            if (!userId) {
                this.records = []
                this.selectedId = null
                return
            }
            if (!window.electronAPI || !window.electronAPI.listFmeca) {
                this.loadError = 'FMECA data is unavailable'
                return
            }

            this.loading = true
            try {
                const records = await window.electronAPI.listFmeca(userId)
                if (this.loadRequestId !== requestId) return
                this.records = this.normalizeRecords(Array.isArray(records) ? records : [])
                const selected = this.records.find(record => record.localId === (preferredId || this.selectedId))
                    || this.records.find(record => record.protected)
                    || this.records[0]
                this.selectedId = selected ? selected.localId : null
            } catch (error) {
                if (this.loadRequestId === requestId) this.loadError = error.message || 'Could not load FMECA'
            } finally {
                if (this.loadRequestId === requestId) this.loading = false
            }
        },
        selectFmeca(id) {
            if (this.editMode) {
                this.$message.warning('Save or cancel edits before switching FMECA')
                return
            }
            this.selectedId = id
        },
        startEdit() {
            this.draft = clone(this.selectedRecord.model)
            this.editMode = true
            this.activeSection = 'fmeca'
        },
        cancelEdit() {
            this.draft = null
            this.editMode = false
            this.$message.info('Edits discarded')
        },
        async saveChanges() {
            const error = validateEditableFmeca(this.components)
            if (error) {
                this.$message.error(error)
                return
            }
            this.saving = true
            try {
                await window.electronAPI.updateFmeca({
                    localId: this.selectedRecord.localId,
                    tableFmeca: {schemaVersion: 2, components: this.components},
                    tableCalculate: this.selectedRecord.tableCalculate,
                    total: this.selectedRecord.total
                }, this.userId)
                const selectedId = this.selectedRecord.localId
                this.editMode = false
                this.draft = null
                await this.loadFmeca(selectedId)
                this.$message.success('FMECA changes saved')
            } catch (error) {
                this.$message.error(error.message || 'Could not save FMECA')
            } finally {
                this.saving = false
            }
        },
        openCreateDialog() {
            const defaultRecord = this.records.find(record => record.protected) || this.records[0]
            this.createForm = {name: '', templateId: defaultRecord ? defaultRecord.localId : ''}
            this.createDialogVisible = true
            this.$nextTick(() => this.$refs.createForm && this.$refs.createForm.clearValidate())
        },
        createFmeca() {
            this.$refs.createForm.validate(async valid => {
                if (!valid || this.saving) return
                this.saving = true
                try {
                    const created = await window.electronAPI.createFmeca(this.createForm, this.userId)
                    this.createDialogVisible = false
                    await this.loadFmeca(created.localId)
                    this.$message.success('FMECA created')
                } catch (error) {
                    this.$message.error(error.message || 'Could not create FMECA')
                } finally {
                    this.saving = false
                }
            })
        },
        manageFmeca(command) {
            if (command === 'set-hi') this.setHiSource()
            if (command === 'rename') this.renameFmeca()
            if (command === 'delete') this.deleteFmeca()
        },
        async setHiSource() {
            if (!this.selectedRecord || this.selectedRecord.isHiSource) return
            try {
                await window.electronAPI.setHiFmeca(this.selectedRecord.localId, this.userId)
                await this.loadFmeca(this.selectedRecord.localId)
                this.$message.success('HI source updated')
            } catch (error) {
                this.$message.error(error.message || 'Could not update HI source')
            }
        },
        async renameFmeca() {
            if (!this.selectedRecord || this.selectedRecord.protected) return
            try {
                const {value} = await this.$prompt('Enter a new FMECA name', 'Rename FMECA', {
                    inputValue: this.selectedRecord.name,
                    inputValidator: value => Boolean(String(value || '').trim()),
                    inputErrorMessage: 'FMECA name is required',
                    confirmButtonText: 'Rename'
                })
                await window.electronAPI.renameFmeca(this.selectedRecord.localId, value, this.userId)
                await this.loadFmeca(this.selectedRecord.localId)
                this.$message.success('FMECA renamed')
            } catch (error) {
                if (error !== 'cancel' && error !== 'close') this.$message.error(error.message || 'Could not rename FMECA')
            }
        },
        async deleteFmeca() {
            if (!this.selectedRecord || this.selectedRecord.protected) return
            try {
                await this.$confirm(
                    this.selectedRecord.isHiSource
                        ? 'This FMECA is used for HI. Deleting it will return the HI source to ATDigital FMECA.'
                        : `Delete ${this.selectedRecord.name}? This action cannot be undone.`,
                    'Delete FMECA',
                    {type: 'warning', confirmButtonText: 'Delete', confirmButtonClass: 'el-button--danger'}
                )
                await window.electronAPI.deleteFmeca(this.selectedRecord.localId, this.userId)
                await this.loadFmeca()
                this.$message.success('FMECA deleted')
            } catch (error) {
                if (error !== 'cancel' && error !== 'close') this.$message.error(error.message || 'Could not delete FMECA')
            }
        },
        addComponent() {
            this.components.push(createEmptyComponent())
        },
        addFailureMode(component) {
            component.failureModes.push(createEmptyFailureMode())
            component.collapsed = false
        },
        async deleteComponent(component) {
            if (component.failureModes.length) {
                try {
                    await this.$confirm(
                        `Delete ${component.name} and all ${component.failureModes.length} failure modes inside it?`,
                        'Delete component',
                        {type: 'warning', confirmButtonText: 'Delete', confirmButtonClass: 'el-button--danger'}
                    )
                } catch (error) {
                    return
                }
            }
            this.draft.components = this.components.filter(item => item.id !== component.id)
        },
        deleteFailureMode(component, failure) {
            component.failureModes = component.failureModes.filter(item => item.id !== failure.id)
        },
        testChanged(failure) {
            if (failure.test === CUSTOM_TEST) {
                failure.includeInHi = false
                return
            }
            failure.customTest = ''
        },
        isFailureIncluded(failure) {
            return failure.includeInHi && failure.test !== CUSTOM_TEST
        },
        displayTest(failure) {
            return failure.test === CUSTOM_TEST ? (failure.customTest || CUSTOM_TEST) : failure.test
        },
        failureRpn,
        rpnClass(failure) {
            const rpn = failureRpn(failure)
            if (rpn >= 300) return 'rpn-high'
            if (rpn >= 100) return 'rpn-medium'
            return 'rpn-low'
        },
        percent(value) {
            return `${(Number(value || 0) * 100).toFixed(1)}%`
        },
        decimal(value) {
            return Number(value || 0).toFixed(3)
        },
        chartWidth(value) {
            return this.maxWeight ? `${Math.max(2, (value / this.maxWeight) * 100)}%` : '0%'
        }
    }
}
</script>

<style lang="scss" scoped>
.fmeca-view {
    min-height: 220px;
    color: #172033;
}

.fmeca-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 14px;
}

.fmeca-heading {
    min-width: 220px;
}

.fmeca-eyebrow {
    display: block;
    margin-bottom: 3px;
    color: #155eef;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0;
}

.fmeca-heading h1 {
    margin: 0;
    font-size: 24px;
    line-height: 1.25;
    font-weight: 600;
    letter-spacing: 0;
}

.fmeca-heading p {
    margin: 4px 0 0;
    color: #667085;
    font-size: 13px;
}

.hi-source-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-left: 8px;
    color: #087a65;
    font-weight: 600;
}

.hi-source-label i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #13a88a;
}

.fmeca-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.fmeca-selector {
    width: min(330px, 34vw);
}

.fmeca-actions ::v-deep .el-button i {
    margin-right: 5px;
}

.fmeca-tabbar {
    display: flex;
    gap: 24px;
    margin-bottom: 14px;
    border-bottom: 1px solid #d9e0ea;
}

.fmeca-tabbar button {
    min-height: 42px;
    padding: 0 2px;
    border: 0;
    border-bottom: 3px solid transparent;
    background: transparent;
    color: #637084;
    font-weight: 600;
    cursor: pointer;
}

.fmeca-tabbar button.active {
    border-bottom-color: #155eef;
    color: #08285d;
}

.fmeca-tabbar i {
    margin-right: 6px;
}

.edit-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 13px;
    padding: 10px 13px;
    border: 1px solid #b8d0ff;
    border-left: 4px solid #155eef;
    border-radius: 5px;
    background: #eaf2ff;
    color: #24405f;
    font-size: 13px;
}

.edit-banner > div {
    display: flex;
    gap: 8px;
    flex: none;
}

.fmeca-panel {
    min-width: 0;
    border: 1px solid #d9e0ea;
    background: #ffffff;
    box-shadow: 0 8px 24px rgba(8, 40, 93, 0.08);
}

.panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 13px 15px;
    border-bottom: 1px solid #d9e0ea;
}

.panel-head h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
}

.panel-head p {
    margin: 3px 0 0;
    color: #667085;
    font-size: 12px;
}

.fmeca-table-scroll {
    max-height: calc(100vh - 286px);
    overflow: auto;
}

.fmeca-table,
.weighting-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
}

.fmeca-table {
    min-width: 1180px;
}

.fmeca-table thead,
.weighting-table thead {
    position: sticky;
    top: 0;
    z-index: 4;
}

.fmeca-table th,
.weighting-table th {
    padding: 9px 8px;
    border-bottom: 1px solid #d9e0ea;
    background: #f3f6fa;
    color: #344054;
    font-size: 11px;
    font-weight: 700;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
    letter-spacing: 0;
}

.fmeca-table td,
.weighting-table td {
    padding: 7px 8px;
    border-bottom: 1px solid #e9edf3;
    background: #ffffff;
    font-size: 12px;
    vertical-align: middle;
}

.col-number { width: 56px; text-align: center !important; }
.col-failure { min-width: 210px; }
.col-indicator { min-width: 170px; }
.col-test { min-width: 210px; }
.col-score { width: 70px; text-align: center !important; }
.col-rpn { width: 80px; text-align: right !important; }
.col-include { width: 130px; }
.col-action { width: 72px; }

.component-row td {
    border-bottom-color: #d5deea;
    background: #edf2f8;
    color: #243b5b;
}

.component-cell,
.failure-cell,
.include-cell {
    display: flex;
    align-items: center;
    gap: 7px;
}

.component-cell small {
    flex: none;
    color: #718096;
    font-size: 11px;
}

.component-cell ::v-deep .el-input {
    max-width: 250px;
}

.icon-button {
    width: 24px;
    height: 24px;
    flex: none;
    padding: 0;
    border: 0;
    background: transparent;
    color: #53657a;
    cursor: pointer;
}

.failure-cell > i {
    width: 7px;
    height: 7px;
    flex: none;
    margin-left: 24px;
    border: 2px solid #6b93d6;
    border-radius: 50%;
}

.failure-row.excluded td {
    background: #f5f6f8;
    color: #9299a5;
}

.row-number {
    color: #7c8798;
    text-align: center;
    font-variant-numeric: tabular-nums;
}

.score-cell {
    text-align: center;
}

.score-cell ::v-deep .el-select {
    width: 55px;
}

.rpn-cell,
.numeric-cell {
    text-align: right;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.rpn-high { color: #b42318; }
.rpn-medium { color: #9a5b00; }
.rpn-low { color: #087a65; }

.include-cell {
    align-items: flex-start;
    flex-direction: column;
    gap: 3px;
}

.include-cell span {
    font-size: 11px;
}

.row-actions {
    white-space: nowrap;
    text-align: right;
}

.row-actions ::v-deep .el-button {
    margin: 0 0 0 7px;
}

.danger-action {
    color: #c43244;
}

.custom-test-input {
    margin-top: 5px;
}

.custom-warning {
    display: block;
    margin-top: 4px;
    color: #9a5b00;
    line-height: 1.3;
}

.table-empty {
    padding: 34px !important;
    color: #667085;
    text-align: center;
}

.hi-source-banner {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 10px;
    align-items: center;
    margin-bottom: 14px;
    padding: 10px 13px;
    border-left: 4px solid #13a88a;
    background: #eef9f6;
    color: #31564f;
    font-size: 12px;
}

.hi-source-banner > span {
    font-weight: 700;
    text-transform: uppercase;
}

.hi-source-banner small {
    color: #5d746f;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-bottom: 14px;
    border: 1px solid #d9e0ea;
    background: #ffffff;
}

.summary-grid.has-age {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.summary-item {
    min-width: 0;
    padding: 15px 17px;
    border-right: 1px solid #e9edf3;
}

.summary-item:last-child {
    border-right: 0;
}

.summary-item span,
.summary-item small {
    display: block;
    color: #667085;
    font-size: 11px;
}

.summary-item strong {
    display: block;
    margin: 4px 0 2px;
    color: #08285d;
    font-size: 23px;
    line-height: 1.2;
}

.summary-item .summary-text {
    font-size: 15px;
}

.weighting-layout {
    display: grid;
    grid-template-columns: minmax(520px, 1.2fr) minmax(360px, 0.8fr);
    gap: 14px;
    align-items: start;
}

.weighting-table-scroll {
    max-height: calc(100vh - 390px);
    overflow: auto;
}

.weighting-table {
    min-width: 650px;
}

.weighting-table th:nth-child(n + 3) {
    text-align: right;
}

.weight-chart {
    max-height: calc(100vh - 390px);
    padding: 16px;
    overflow: auto;
}

.chart-row {
    display: grid;
    grid-template-columns: minmax(120px, 170px) minmax(100px, 1fr) 48px;
    gap: 10px;
    align-items: center;
    margin-bottom: 12px;
    font-size: 12px;
}

.chart-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.chart-track {
    height: 9px;
    overflow: hidden;
    background: #e5eaf1;
}

.chart-track i {
    display: block;
    height: 100%;
    background: #155eef;
}

.chart-row strong {
    text-align: right;
    font-variant-numeric: tabular-nums;
}

.empty-state {
    display: flex;
    min-height: 220px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 30px;
    color: #667085;
    text-align: center;
}

.empty-state i {
    color: #7f91a9;
    font-size: 28px;
}

.empty-state strong {
    color: #344054;
    font-size: 14px;
}

.dialog-select {
    width: 100%;
}

@media (max-width: 1200px) {
    .fmeca-head {
        flex-direction: column;
    }

    .fmeca-actions {
        width: 100%;
        justify-content: flex-start;
    }

    .fmeca-selector {
        width: min(420px, 100%);
    }

    .weighting-layout {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 720px) {
    .edit-banner,
    .hi-source-banner {
        align-items: flex-start;
        grid-template-columns: 1fr;
        flex-direction: column;
    }

    .summary-grid,
    .summary-grid.has-age {
        grid-template-columns: 1fr;
    }

    .summary-item {
        border-right: 0;
        border-bottom: 1px solid #e9edf3;
    }

    .summary-item:last-child {
        border-bottom: 0;
    }
}
</style>

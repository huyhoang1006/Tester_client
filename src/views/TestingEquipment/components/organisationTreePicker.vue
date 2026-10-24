<template>
    <div class="org-picker">
        <button type="button" class="org-select" @click="visible = true">
            <span :class="{ placeholder: !value }">{{ selectedName || (value ? value : 'Select organisation') }}</span>
            <i class="fa-solid fa-sitemap" aria-hidden="true"></i>
        </button>
        <button v-if="value && clearable" type="button" class="org-clear" title="Clear organisation" @click="$emit('input', '')">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
        <el-dialog :visible.sync="visible" width="620px" top="8vh" custom-class="org-tree-dialog" append-to-body>
            <template slot="title">
                <div class="org-dialog-heading">
                    <span class="org-dialog-icon"><i class="fa-solid fa-sitemap" aria-hidden="true"></i></span>
                    <span class="org-dialog-title">{{ title }}</span>
                    <el-tooltip content="Refresh organisations" placement="bottom">
                        <el-button class="org-refresh" size="mini" icon="el-icon-refresh" :loading="loadingRoot" aria-label="Refresh organisations" @click="refreshTree" />
                    </el-tooltip>
                </div>
            </template>
            <div class="org-tree-scroll">
                <el-tree
                    v-if="visible"
                    :key="treeKey"
                    node-key="mrid"
                    lazy
                    :load="loadNode"
                    :props="treeProps"
                    highlight-current
                    :current-node-key="value"
                    @node-click="selectNode">
                    <span slot-scope="{ data }" class="org-tree-node" :title="data.name || data.aliasName || data.mrid">
                        <i class="fa-solid fa-building org-tree-node-icon" aria-hidden="true"></i>
                        <span class="org-tree-node-name">{{ data.name || data.aliasName || data.mrid }}</span>
                    </span>
                </el-tree>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import constant from '@/utils/constant'
import * as organisationApi from '@/api/demo'
import { toServerId } from '@/utils/serverId'

export default {
    name: 'OrganisationTreePicker',
    props: {
        value: { type: String, default: '' },
        title: { type: String, default: 'Select organisation' },
        clearable: { type: Boolean, default: true },
        allowRoot: { type: Boolean, default: true },
        serverMode: { type: Boolean, default: false }
    },
    data() {
        return {
            visible: false,
            selectedName: '',
            ownedIds: null,
            treeKey: 0,
            loadingRoot: false,
            treeProps: { label: 'name' }
        }
    },
    watch: {
        value: {
            immediate: true,
            handler(id) { this.loadSelectedName(id) }
        },
        serverMode() {
            this.refreshTree()
        }
    },
    methods: {
        async loadSelectedName(id) {
            if (!id) {
                this.selectedName = ''
                return
            }
            try {
                const result = this.serverMode
                    ? await organisationApi.getOrganisationById(id)
                    : await window.electronAPI.getParentOrganizationByMrid(id)
                if (this.value === id) {
                    const row = this.serverMode ? result : (result && result.success ? result.data : null)
                    this.selectedName = row ? row.name || row.shortName || row.aliasName || id : id
                }
            } catch (error) {
                if (this.value === id) this.selectedName = id
            }
        },
        refreshTree() {
            this.ownedIds = null
            this.treeKey += 1
            this.loadSelectedName(this.value)
        },
        async loadNode(node, resolve) {
            if (node.level === 0) this.loadingRoot = true
            try {
                if (this.serverMode) {
                    const result = node.level === 0
                        ? await organisationApi.getOwnerOrganisation()
                        : await organisationApi.getChildOrganisation(node.data.mrid)
                    const rows = Array.isArray(result) ? result : (result ? [result] : [])
                    resolve(rows.map(row => ({
                        ...row,
                        mrid: String(row.id || row.mrid || ''),
                        name: row.name || row.shortName || row.aliasName || ''
                    })))
                    return
                }
                if (node.level === 0) {
                    const user = this.$store && this.$store.getters.getUser
                    if (user && user.user_id && window.electronAPI.getIdentifiedObjectIdsByUser) {
                        const ownership = await window.electronAPI.getIdentifiedObjectIdsByUser(user.user_id)
                        this.ownedIds = ownership && ownership.success && Array.isArray(ownership.data)
                            ? new Set(ownership.data) : null
                    }
                }
                const result = node.level === 0
                    ? await window.electronAPI.getParentOrganizationByMrid(constant.ROOT)
                    : await window.electronAPI.getParentOrganizationByParentMrid(node.data.mrid)
                if (!result || !result.success) {
                    this.$message.error('Cannot load organisations')
                    resolve([])
                    return
                }
                const rows = node.level === 0 ? (result.data ? [result.data] : []) : (result.data || [])
                resolve(node.level === 0 || !this.ownedIds
                    ? rows : rows.filter(row => this.ownedIds.has(row.mrid)))
            } catch (error) {
                this.$message.error('Cannot load organisations')
                resolve([])
            } finally {
                if (node.level === 0) this.loadingRoot = false
            }
        },
        selectNode(data) {
            if (!this.allowRoot && !this.serverMode && data.mrid === constant.ROOT) {
                this.$message.warning('Select an organisation below Root')
                return
            }
            this.selectedName = data.name || data.aliasName || data.mrid
            this.$emit('input', this.serverMode ? String(toServerId(data.mrid)) : data.mrid)
            this.visible = false
        }
    }
}
</script>

<style scoped>
.org-picker { display: flex; gap: 6px; min-width: 0; }
.org-select { flex: 1; min-width: 0; min-height: 34px; padding: 7px 9px; display: flex; align-items: center; justify-content: space-between; gap: 8px; border: 1px solid #e5e7eb; border-radius: 7px; background: #fff; color: #111827; font-size: 13px; text-align: left; cursor: pointer; }
.org-select:hover, .org-select:focus-visible { border-color: #0b2f86; }
.org-select span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.org-select .placeholder { color: #9ca3af; }
.org-select i { color: #6b7280; flex-shrink: 0; }
.org-clear { width: 34px; border: 1px solid #e5e7eb; border-radius: 7px; background: #fff; color: #6b7280; cursor: pointer; }
.org-clear:hover { color: #dc2626; border-color: #dc2626; }
</style>

<style>
.org-tree-dialog { max-width: calc(100vw - 32px); border-radius: 6px; }
.org-tree-dialog .el-dialog__header { padding: 16px 20px; border-bottom: 1px solid #e5e9f0; }
.org-tree-dialog .el-dialog__headerbtn { top: 22px; right: 20px; }
.org-tree-dialog .el-dialog__body { padding: 16px 20px 20px; }
.org-dialog-heading { display: flex; align-items: center; gap: 10px; min-width: 0; padding-right: 40px; }
.org-dialog-icon { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; flex: 0 0 30px; border-radius: 5px; background: #eaf0fb; color: #153b82; font-size: 14px; }
.org-dialog-title { min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #202c3e; font-size: 16px; font-weight: 600; }
.org-tree-dialog .org-refresh { padding: 7px 9px; flex: 0 0 auto; }
.org-tree-scroll { min-height: 240px; max-height: min(58vh, 520px); overflow: auto; }
.org-tree-dialog .el-tree { padding-right: 4px; color: #263347; }
.org-tree-dialog .el-tree-node__content { height: 38px; min-width: 0; border-radius: 4px; }
.org-tree-dialog .el-tree-node__content:hover { background: #f0f4fa; }
.org-tree-dialog .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content { background: #e8f0fc; color: #153b82; }
.org-tree-dialog .el-tree-node__expand-icon { color: #718096; }
.org-tree-dialog .el-tree-node__expand-icon.is-leaf { color: transparent; }
.org-tree-node { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0; overflow: hidden; }
.org-tree-node-icon { flex: 0 0 16px; color: #6e829b; font-size: 13px; text-align: center; }
.org-tree-node-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.org-tree-dialog .el-tree-node.is-current > .el-tree-node__content .org-tree-node-icon { color: #153b82; }
@media (max-width: 640px) {
    .org-tree-dialog .el-dialog__header { padding: 14px 16px; }
    .org-tree-dialog .el-dialog__body { padding: 12px 14px 16px; }
    .org-dialog-title { font-size: 14px; }
    .org-tree-scroll { max-height: 65vh; }
}
</style>

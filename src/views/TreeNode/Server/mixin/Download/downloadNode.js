/* eslint-disable */
import Vue from 'vue'
import * as demoAPI from '@/api/demo'

// =========================================================
// 1. CHUYỂN TOÀN BỘ REQUIRE LÊN ĐẦU FILE (TỐI ƯU HIỆU NĂNG)
// =========================================================
import * as SubstationServerMapper from '@/views/Mapping/ServerToDTO/Substation/index.js'
import * as SubstationMapper from '@/views/Mapping/Substation/index.js'

import * as OrganisationServerMapper from '@/views/Mapping/ServerToDTO/Organisation/index.js'
import * as OrganisationMapper from '@/views/Mapping/Organisation/index.js'

import * as VoltageLevelServerMapper from '@/views/Mapping/ServerToDTO/VoltageLevel/index.js'
import * as VoltageLevelMapper from '@/views/Mapping/VoltageLevel/index.js'

import * as BayServerMapper from '@/views/Mapping/ServerToDTO/Bay/index.js'

import * as PowerCableServerMapper from '@/views/Mapping/ServerToDTO/PowerCable/index.js'
import * as PowerCableMapping from '@/views/Mapping/PowerCable/index.js'
import PowerCableEntity from '@/views/Flatten/PowerCable/index.js'


export default {
    methods: {
        handleDownloadTargetSelection(node) {
            const targetNode = Array.isArray(node) ? node[node.length - 1] : node
            if (!targetNode || targetNode.disabled) {
                this.selectedDownloadTargetNodes = []
                this.selectedDownloadTargetNode = null
                return
            }
            this.selectedDownloadTargetNodes = [targetNode]
            this.selectedDownloadTargetNode = targetNode
        },

        // =========================================================
        // 2. REFACTOR HANDLER CHÍNH (STRATEGY PATTERN)
        // =========================================================
        async handleDownloadNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                return this.$message.warning('Please select a node to download')
            }

            const node = this.selectedNodes[this.selectedNodes.length - 1]
            const loading = this.$loading({ lock: true, text: 'Đang xử lý tải xuống...', spinner: 'el-icon-loading' })

            try {
                // Object mapping các handler tương ứng với mode
                const downloadStrategies = {
                    'organisation': this.processOrganisationDownload,
                    'substation': this.processSubstationDownload,
                    'voltageLevel': this.processVoltageLevelDownload,
                    'bay': this.processBayDownload
                }

                // Chạy hàm tương ứng
                if (downloadStrategies[node.mode]) {
                    await downloadStrategies[node.mode](node, loading)
                } else {
                    // Fallback cho phần tải Asset (PowerCable, v.v...)
                    await this.processAssetDownload(node, loading)
                }

                // CHỈ REFRESH CÂY 1 LẦN DUY NHẤT Ở ĐÂY SAU KHI MỌI THỨ HOÀN TẤT
                await this.showLocationRoot()

            } catch (error) {
                console.error('[Download Error]:', error)
                this.$message.error('Download failed: ' + error.message)
            } finally {
                loading.close()
            }
        },

        // =========================================================
        // 3. TÁCH CÁC TIẾN TRÌNH THÀNH HÀM RIÊNG BIỆT (CLEAN CODE)
        // =========================================================

        async processOrganisationDownload(node) {
            const { chain } = await this.prepareOrganisationDownloadData(node)
            await this.downloadOrganisationChain(chain)
            this.$message.success('Organisation chain downloaded successfully!')
        },

        async processSubstationDownload(node) {
            if (!node.mrid && !node.id) throw new Error('Substation ID not found')
            if (!node.parentId) throw new Error('Parent organisation not found.')

            const parentNode = this.findNodeById(node.parentId, this.ownerServerList)
            if (!parentNode) throw new Error('Parent organisation not found in Server Tree.')

            await this.downloadOrganisationChainForParent(parentNode)
            const { substation, parentOrgId } = await this.prepareSubstationDownloadData(node)
            const result = await this.downloadSubstationToDb(substation, parentOrgId)

            if (result.success) this.$message.success('Substation downloaded successfully!')
            else throw new Error(result.message)
        },

        async processVoltageLevelDownload(node) {
            if (!node.mrid && !node.id) throw new Error('VoltageLevel ID not found')
            if (!node.parentId) throw new Error('Parent substation not found')

            const parentSubstationNode = this.findNodeById(node.parentId, this.ownerServerList)
            if (!parentSubstationNode) throw new Error('Parent substation not found in Server Tree.')

            // Tải Org cha của Substation
            if (parentSubstationNode.parentId) {
                const orgNode = this.findNodeById(parentSubstationNode.parentId, this.ownerServerList)
                if (orgNode) await this.downloadOrganisationChainForParent(orgNode)
            }

            // Tải Substation cha
            const existingSubstation = this.findNodeById(node.parentId, this.organisationClientList)
            if (!existingSubstation) {
                const { substation } = await this.prepareSubstationDownloadData(parentSubstationNode)
                await this.downloadSubstationToDb(substation, parentSubstationNode.parentId)
            }

            // Tải VoltageLevel
            const { voltageLevel, parentSubstationId } = await this.prepareVoltageLevelDownloadData(node)
            const result = await this.downloadVoltageLevelToDb(voltageLevel, parentSubstationId)

            if (result.success) this.$message.success('VoltageLevel downloaded successfully!')
            else throw new Error(result.message)
        },

        async processBayDownload(node, loading) {
            if (!node.mrid && !node.id) throw new Error('Bay ID not found')
            if (!node.parentId) throw new Error('Parent VoltageLevel not found')

            try {
                await this.$confirm(`Download Bay[${node.name}] + ancestors?`, 'Xác nhận', { type: 'info' })
            } catch (cancel) {
                throw new Error('Đã hủy tải')
            }

            loading.setText('Đang kiểm tra dữ liệu cha...')
            const parentVLNode = this.findNodeById(node.parentId, this.ownerServerList)
            if (!parentVLNode) throw new Error('VoltageLevel cha không tồn tại trong ServerTree')

            // Tải Org + Substation cha
            const parentSubstationNode = this.findNodeById(parentVLNode.parentId, this.ownerServerList)
            if (parentSubstationNode) {
                const orgNode = this.findNodeById(parentSubstationNode.parentId, this.ownerServerList)
                if (orgNode) await this.downloadOrganisationChainForParent(orgNode)

                const { substation } = await this.prepareSubstationDownloadData(parentSubstationNode)
                await this.downloadSubstationToDb(substation, parentSubstationNode.parentId)
            }

            // Tải VoltageLevel cha
            const existingVL = this.findNodeById(node.parentId, this.organisationClientList)
            if (!existingVL) {
                const { voltageLevel } = await this.prepareVoltageLevelDownloadData(parentVLNode)
                await this.downloadVoltageLevelToDb(voltageLevel, parentVLNode.parentId)
            }

            // Lấy dữ liệu API có Retry
            loading.setText('Đang tải Bay...')
            let bayData = null
            for (let i = 0; i < 3; i++) {
                try {
                    const res = await demoAPI.getBayById(node.mrid || node.id)
                    if (res && (res.mRID || res.mrid)) { bayData = res; break; }
                } catch (e) { if (i === 2) throw e }
            }

            if (!bayData) throw new Error('Không lấy được dữ liệu từ API')

            const { bay } = await this.prepareBayDownloadData(node, bayData, node.parentId)
            const result = await this.downloadBayToDb(bay, node.parentId)

            if (result.success) this.$message.success(`Bay [${node.name}] downloaded successfully!`)
            else throw new Error(result.message)
        },

        async processAssetDownload(node) {
            const serverResponse = await demoAPI.getAssetById(node.mrid, 'PowerCable') // Cần động hóa 'PowerCable' sau này
            if (!serverResponse) return

            const dto = PowerCableServerMapper.mapServerToDto(serverResponse)
            dto.assetInfoId = serverResponse.cableInfo?.mRID || serverResponse.cableInfo?.mrid || this.generateUuid()
            dto.productAssetModelId = serverResponse.assetData?.productAssetModel?.mRID || this.generateUuid()
            dto.lifecycleDateId = this.generateUuid()
            dto.oldCableInfoId = dto.assetInfoId
            dto.assetPsrId = this.generateUuid()

            const clientParent = this.findNodeById(node.parentId, this.organisationClientList)

            if (clientParent) {
                dto.psrId = clientParent.mrid
                dto.locationId = clientParent.location || clientParent.mrid
                await this.executeDownloadAndSave(dto, clientParent)
            } else {
                this.nodeToDownloadData = dto
                this.moveTreeData = this.buildMoveTreeData(this.organisationClientList, { mrid: 'none' }, this.getValidParentTypes('asset'))
                this.downloadDialogVisible = true
            }
        },

        // =========================================================
        // CÁC HÀM XỬ LÝ DATABASE DƯỚI ĐÂY GIỮ NGUYÊN LOGIC CỦA BẠN
        // CHỈ XÓA BỎ REQUIRE VÌ ĐÃ ĐƯỢC CHUYỂN LÊN ĐẦU FILE
        // =========================================================

        async downloadOrganisationChainForParent(parentNode) {
            const { chain } = await this.prepareOrganisationDownloadData(parentNode)
            await this.downloadOrganisationChain(chain)

            const rootOrg = this.organisationClientList?.find(org => org.mrid === '00000000-0000-0000-0000-000000000000')
            if (rootOrg) {
                if (!rootOrg.children) rootOrg.children = []
                for (const org of chain) {
                    const orgNode = {
                        mrid: org.mrid,
                        name: org.name,
                        aliasName: org.aliasName || org.name,
                        parentId: '00000000-0000-0000-0000-000000000000',
                        mode: 'organisation'
                    }
                    const existingIndex = rootOrg.children.findIndex(c => c.mrid === org.mrid)
                    if (existingIndex >= 0) rootOrg.children[existingIndex] = orgNode
                    else rootOrg.children.push(orgNode)
                }
                this.$set(rootOrg, 'expanded', true)
            }
        },

        async prepareSubstationDownloadData(node) {
            const substationId = node.mrid || node.id
            const parentOrgId = node.parentId

            let substationData = null
            try {
                const response = await demoAPI.getSubstationById(substationId)
                if (response && response.name) {
                    substationData = response
                    if (!substationData.aliasName) substationData.aliasName = substationData.name
                }
            } catch (error) {
                throw new Error('Failed to fetch substation: ' + error.message)
            }

            const substationObj = {
                id: substationId,
                mrid: String(substationId),
                name: substationData?.name || node.name || '',
                aliasName: substationData?.aliasName || node.aliasName || node.name || '',
                parentId: String(parentOrgId),
                _type: 'substation',
                _serverData: substationData || { id: substationId, name: node.name, mRID: substationId, organisation_id: parentOrgId }
            }
            return { substation: substationObj, parentOrgId: String(parentOrgId) }
        },

        async downloadSubstationToDb(substation, parentOrgId) {
            // Không require lại Mapper nữa
            const serverData = { ...substation._serverData, mRID: substation.mrid }

            const dto = SubstationServerMapper.mapServerToDto(serverData)
            dto.organisationId = parentOrgId
            dto.userId = this.$store.state.user.user_id
            dto.userIdentifiedObjectId = this.generateUuid()
            dto.organisationPsrId = this.generateUuid()

            const entity = SubstationMapper.mapDtoToEntity(dto)

            try {
                const insertResult = await window.electronAPI.insertSubstationEntity(entity)
                if (insertResult.success) {
                    const parentOrgNode = this.findNodeById(parentOrgId, this.organisationClientList)
                    if (parentOrgNode) {
                        const newSubstationNode = { mrid: substation.mrid, name: substation.name, aliasName: substation.aliasName, parentId: parentOrgId, mode: 'substation' }
                        const children = Array.isArray(parentOrgNode.children) ? [...parentOrgNode.children] : []
                        const existingIndex = children.findIndex(c => c.mrid === substation.mrid)

                        if (existingIndex >= 0) children[existingIndex] = newSubstationNode
                        else children.push(newSubstationNode)

                        this.$set(parentOrgNode, 'children', children)
                        this.$set(parentOrgNode, 'expanded', true)
                    }
                    return { success: true, message: 'Download successful' }
                }
                return { success: false, message: 'Download failed DB Insert' }
            } catch (e) {
                return { success: false, message: e.message }
            }
        },

        async executeDownloadAndSave(dto, parentNode) {
            try {
                const existingLocalRes = await window.electronAPI.getPowerCableEntityByMrid(dto.properties.mrid, dto.psrId)
                let oldEntity = (existingLocalRes.success && existingLocalRes.data)
                    ? existingLocalRes.data
                    : new PowerCableEntity()

                const newEntity = PowerCableMapping.mapDtoToEntity(dto)
                const saveRs = await window.electronAPI.insertPowerCableEntity(oldEntity, newEntity)

                if (saveRs.success) {
                    this.$message.success('Download and overwrite successful!')
                    this.downloadDialogVisible = false
                    if (parentNode) {
                        this.$set(parentNode, '_childrenFetched', false)
                        await this.fetchChildren(parentNode)
                        this.$set(parentNode, 'expanded', true)
                    }
                } else {
                    this.$message.error('Save failed: ' + saveRs.message)
                }
            } catch (error) {
                console.error('[executeDownloadAndSave Error]:', error)
                this.$message.error('Error saving to local database')
            }
        },

        async buildAncestors(node) {
            const CLIENT_ROOT = '00000000-0000-0000-0000-000000000000'
            const chain = []
            let prevParentId = ''

            if (node.parentArr && Array.isArray(node.parentArr)) {
                for (let i = 0; i < node.parentArr.length; i++) {
                    const ancestor = node.parentArr[i]
                    const ancestorId = ancestor.mrid || ancestor.id
                    if (!ancestorId) continue

                    let assignedParentId = (i === 0 && !prevParentId) ? CLIENT_ROOT : prevParentId
                    let ancestorData = null

                    try {
                        const response = await demoAPI.getOrganisationById(ancestorId)
                        ancestorData = response.data || response
                        if (!ancestorData.mRID) ancestorData.mRID = ancestorId
                        if (!ancestorData.organisation) ancestorData.organisation = {}
                        if (!ancestorData.organisation.mRID) ancestorData.organisation.mRID = ancestorId
                        if (!ancestorData.organisation.parentOrganisation) ancestorData.organisation.parentOrganisation = assignedParentId
                    } catch (e) {
                        throw new Error(`Failed to fetch organisation ${ancestorId}: ${e.message}`)
                    }

                    chain.push({
                        id: ancestorId, mrid: ancestorId, name: ancestor.parent || ancestor.name || '',
                        parentId: assignedParentId, _type: 'organisation',
                        _serverData: ancestorData || { id: ancestorId, name: ancestor.parent }
                    })
                    prevParentId = ancestorId
                }
            }

            const selectedOrgId = node.mrid || node.id
            let orgData = null

            try {
                const response = await demoAPI.getOrganisationById(selectedOrgId)
                if (response && typeof response === 'object' && response.aliasName) orgData = response
                else if (response?.data?.data) orgData = response.data.data
                else if (response?.data) orgData = response.data
            } catch (e) {
                if (node._serverData) orgData = node._serverData
            }

            let finalParentId = node.parentId || prevParentId
            if ((!node.parentArr || node.parentArr.length === 0) && !finalParentId) finalParentId = CLIENT_ROOT

            chain.push({
                id: selectedOrgId, mrid: selectedOrgId, name: node.name || node.aliasName || '',
                parentId: finalParentId, _type: 'organisation',
                _serverData: orgData || { id: selectedOrgId, name: node.name }
            })

            return chain
        },

        async fetchAllDescendants(nodeId, nodeType, visited = new Set()) {
            let allDescendants = []
            if (!nodeId || visited.has(nodeId)) return allDescendants
            visited.add(nodeId)

            try {
                if (nodeType === 'organisation') {
                    const substations = await demoAPI.getChildSubstation(nodeId)
                    for (const sub of substations) {
                        const subId = sub.mrid !== undefined && sub.mrid !== null ? sub.mrid : sub.id
                        allDescendants.push({ id: subId, mrid: subId, name: sub.name, _type: 'substation', parentId: nodeId, _serverData: sub })
                        allDescendants.push(...await this.fetchAllDescendants(subId, 'substation', visited))
                    }
                } else if (nodeType === 'substation') {
                    const voltageLevels = await demoAPI.getVoltageLevelBySubstationId(nodeId)
                    for (const vl of voltageLevels) {
                        const vlId = vl.mrid !== undefined && vl.mrid !== null ? vl.mrid : vl.id
                        allDescendants.push({ id: vlId, mrid: vlId, name: vl.name, _type: 'voltageLevel', parentId: nodeId, _serverData: vl })
                        allDescendants.push(...await this.fetchAllDescendants(vlId, 'voltageLevel', visited))
                    }
                } else if (nodeType === 'voltageLevel') {
                    const bays = await demoAPI.getBayByVoltageLevel(nodeId)
                    for (const bay of bays) {
                        const bayId = bay.mrid || bay.id
                        allDescendants.push({ id: bayId, mrid: bayId, name: bay.name, _type: 'bay', parentId: nodeId, _serverData: bay })
                        allDescendants.push(...await this.fetchAllDescendants(bayId, 'bay', visited))
                    }
                } else if (nodeType === 'bay') {
                    const assetTypes = ['PowerCable', 'Transformer', 'CircuitBreaker', 'CurrentTransformer', 'Disconnector', 'SurgeArrester', 'VoltageTransformer', 'Capacitor', 'Reactor', 'RotatingMachine', 'Bushing']
                    for (const assetType of assetTypes) {
                        try {
                            const assets = await demoAPI.getAssetByOwner(nodeId, assetType)
                            for (const asset of assets) {
                                const assetId = asset.mrid || asset.id
                                allDescendants.push({ id: assetId, mrid: assetId, name: asset.name || asset.apparatus_id, _type: 'asset', _assetType: assetType, parentId: nodeId, _serverData: asset })
                            }
                        } catch (e) { } // Bỏ qua log khi không có asset
                    }
                }
            } catch (error) {
                console.error('[fetchAllDescendants Error]:', error)
            }
            return allDescendants
        },

        async prepareOrganisationDownloadData(node) {
            const chain = await this.buildAncestors(node)
            return { chain, descendants: [] }
        },

        async fetchWithRetry(fn, maxRetries = 3, delayMs = 1000) {
            for (let i = 1; i <= maxRetries; i++) {
                try {
                    return await fn()
                } catch (error) {
                    if (i < maxRetries) await new Promise(resolve => setTimeout(resolve, delayMs * i))
                }
            }
            throw new Error(`Failed after ${maxRetries} retries`)
        },

        async downloadOrganisationChain(chain) {
            const CLIENT_ROOT = '00000000-0000-0000-0000-000000000000'
            let failedCount = 0

            for (let i = 0; i < chain.length; i++) {
                const org = chain[i]
                try {
                    const rawPositionPoints = org._serverData?.positionPoints || []
                    const hasValidPositionData = rawPositionPoints.some(p => p.xposition !== null || p.yposition !== null || p.zposition !== null)

                    const serverData = {
                        name: org._serverData?.name || org.name,
                        aliasName: org._serverData?.shortName || org._serverData?.aliasName || org.name,
                        mRID: org.mrid,
                        parentOrganisation: org.parentId,
                        organisation: {
                            mRID: org.mrid,
                            parentOrganisation: org.parentId,
                            taxCode: org._serverData?.organisation?.taxCode || '',
                            electronicAddress: org._serverData?.organisation?.electronicAddress || {},
                            phone: org._serverData?.organisation?.phone || {}
                        },
                        positionPoints: hasValidPositionData ? rawPositionPoints : []
                    }

                    const dto = OrganisationServerMapper.mapServerToDto(serverData)
                    dto.parentId = org.parentId
                    dto.organisationId = org.mrid
                    const entity = OrganisationMapper.OrgDtoToOrgEntity(dto)

                    if (org.parentId && org.parentId !== CLIENT_ROOT) {
                        try { await this.fetchWithRetry(() => window.electronAPI.getOrganisationEntityByMrid(org.parentId)) } catch (e) { }
                    }

                    let exists = false
                    try {
                        const existingResult = await this.fetchWithRetry(() => window.electronAPI.getOrganisationEntityByMrid(org.mrid))
                        exists = existingResult.success && existingResult.data
                    } catch (e) { }

                    if (exists) {
                        try { await this.fetchWithRetry(() => window.electronAPI.deleteParentOrganizationEntity(org.mrid)) } catch (e) { }
                    }

                    try {
                        const insertResult = await this.fetchWithRetry(() => window.electronAPI.insertParentOrganizationEntity(entity))
                        if (!insertResult.success) failedCount++
                    } catch (e) {
                        failedCount++
                    }
                } catch (error) {
                    failedCount++
                }
            }
            if (failedCount > 0) console.warn(`[downloadOrganisationChain] ⚠️ ${failedCount} org(s) failed to download`)
        },

        async prepareVoltageLevelDownloadData(node) {
            const voltageLevelId = node.mrid || node.id
            if (!voltageLevelId) throw new Error('VoltageLevel ID not found')

            let voltageLevelData = null
            try {
                const response = await demoAPI.getVoltageLevelBySubstationId(node.parentId)
                if (Array.isArray(response)) {
                    voltageLevelData = response.find(vl => vl.mRID === voltageLevelId || vl.mrid === voltageLevelId || vl.id === voltageLevelId)
                } else if (response && (response.mRID === voltageLevelId || response.mrid === voltageLevelId)) {
                    voltageLevelData = response
                }
            } catch (error) {
                throw new Error('Failed to fetch voltageLevel from server: ' + error.message)
            }

            if (!voltageLevelData) voltageLevelData = { mRID: voltageLevelId, name: node.name, shortName: node.aliasName || node.name }

            return {
                voltageLevel: {
                    id: voltageLevelId,
                    mrid: String(voltageLevelId),
                    name: voltageLevelData?.name || node.name || '',
                    aliasName: voltageLevelData?.shortName || voltageLevelData?.aliasName || node.aliasName || node.name || '',
                    _type: 'voltageLevel',
                    _serverData: voltageLevelData,
                    parentId: node.parentId
                },
                parentSubstationId: node.parentId
            }
        },

        async downloadVoltageLevelToDb(voltageLevel, parentSubstationId) {
            const serverData = { ...voltageLevel._serverData, mRID: voltageLevel.mrid, substation: { mRID: parentSubstationId } }
            const dto = VoltageLevelServerMapper.mapServerToDto(serverData)
            dto.substationId = parentSubstationId
            dto.userIdentifiedObjectId = this.generateUuid()

            const entity = VoltageLevelMapper.volDtoToVolEntity(dto)

            try {
                const insertResult = await window.electronAPI.insertVoltageLevelEntity(entity)
                if (insertResult.success) {
                    await this.addVoltageLevelToClientTree(voltageLevel, parentSubstationId)
                    return { success: true, message: 'Download successful' }
                }
                return { success: false, message: 'Download failed DB Insert' }
            } catch (e) {
                return { success: false, message: e.message }
            }
        },

        async addVoltageLevelToClientTree(voltageLevel, parentSubstationId) {
            const parentNode = this.findNodeById(parentSubstationId, this.organisationClientList)
            if (parentNode) {
                const children = Array.isArray(parentNode.children) ? [...(parentNode.children || [])] : []
                const newVoltageLevelNode = { mrid: voltageLevel.mrid, name: voltageLevel.name, aliasName: voltageLevel.aliasName, parentId: parentSubstationId, mode: 'voltageLevel' }
                const existingIndex = children.findIndex(c => c.mrid === voltageLevel.mrid)

                if (existingIndex >= 0) children[existingIndex] = newVoltageLevelNode
                else children.push(newVoltageLevelNode)

                this.$set(parentNode, 'children', children)
                this.$set(parentNode, 'expanded', true)
            }
        },

        async prepareBayDownloadData(node, bayServerData, parentVoltageLevelId) {
            const bayId = node.mrid || node.id
            if (!bayId) throw new Error('Bay ID not found')

            const serverData = { ...bayServerData, mRID: bayId, voltageLevel: { mRID: parentVoltageLevelId } }
            const dto = BayServerMapper.mapServerToDto(serverData)

            return {
                bay: {
                    mrid: dto.bayId, name: dto.name,
                    bay_energy_meas_flag: dto.bay_energy_meas_flag,
                    bay_power_meas_flag: dto.bay_power_meas_flag,
                    breaker_configuration: dto.breaker_configuration,
                    bus_bar_configuration: dto.bus_bar_configuration,
                    voltage_level: parentVoltageLevelId,
                    _type: 'bay', _serverData: bayServerData
                },
                parentVoltageLevelId: parentVoltageLevelId
            }
        },

        async downloadBayToDb(bay, parentVoltageLevelId) {
            try {
                const entityData = {
                    mrid: bay.mrid, name: bay.name,
                    bay_energy_meas_flag: bay.bay_energy_meas_flag || '',
                    bay_power_meas_flag: bay.bay_power_meas_flag || '',
                    breaker_configuration: bay.breaker_configuration || '',
                    bus_bar_configuration: bay.bus_bar_configuration || '',
                    voltage_level: parentVoltageLevelId, substation: null
                }

                const insertResult = await window.electronAPI.insertBayEntity(entityData)
                if (!insertResult.success) return { success: false, message: insertResult.message }

                const parentNode = this.findNodeById(parentVoltageLevelId, this.organisationClientList)
                if (parentNode) {
                    if (!parentNode.children) parentNode.children = []
                    const newBayNode = { id: bay.mrid, mrid: bay.mrid, name: bay.name, aliasName: bay.name, parentId: parentVoltageLevelId, mode: 'bay' }
                    const existingIndex = parentNode.children.findIndex(c => c.mrid === bay.mrid)

                    if (existingIndex >= 0) parentNode.children[existingIndex] = newBayNode
                    else parentNode.children.push(newBayNode)

                    this.$set(parentNode, 'expanded', true)
                }

                return { success: true, message: 'Bay downloaded successfully' }
            } catch (error) {
                return { success: false, message: error.message }
            }
        }
    }
}
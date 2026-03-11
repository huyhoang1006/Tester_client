/* eslint-disable */
import * as demoAPI from '@/api/demo'
import Vue from 'vue'

export default {
    methods: {
        handleDownloadTargetSelection(node) {
            const targetNode = Array.isArray(node) ? node[node.length - 1] : node
            if (!targetNode || targetNode.disabled) {
                this.selectedDownloadTargetNodes =[]
                this.selectedDownloadTargetNode = null
                return
            }
            this.selectedDownloadTargetNodes = [targetNode]
            this.selectedDownloadTargetNode = targetNode
        },

        async handleDownloadNode() {            
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node to download')
                return
            }

            const node = this.selectedNodes[this.selectedNodes.length - 1]

            if (node.mode === 'organisation') {
                try {
                    const { chain } = await this.prepareOrganisationDownloadData(node)
                    await this.downloadOrganisationChain(chain)
                    await this.showLocationRoot()
                    this.$message.success('Organisation chain downloaded successfully!')
                } catch (error) {
                    console.error('[Organisation Download Error]:', error)
                    this.$message.error('Download failed: ' + error.message)
                }
                return
            } else if (node.mode === 'substation') {
                const substationId = node.mrid || node.id
                const parentOrgId = node.parentId
                
                if (!substationId) {
                    this.$message.error('Substation ID not found')
                    return
                }
                
                if (!parentOrgId) {
                    this.$message.error('Parent organisation not found. Please select a substation under an organisation.')
                    return
                }
                
                try {
                    const parentNode = this.findNodeById(parentOrgId, this.ownerServerList)

                    if (!parentNode) {
                        this.$message.error('Parent organisation not found in Server Tree. Please download from root.')
                        return
                    }

                    await this.downloadOrganisationChainForParent(parentNode)
                } catch (error) {
                    this.$message.error('Error downloading organisation chain: ' + error.message)
                    return
                }
                
                try {
                    const { substation, parentOrgId: preparedOrgId } = await this.prepareSubstationDownloadData(node)
                    const result = await this.downloadSubstationToDb(substation, preparedOrgId)
                    
                    if (result.success) {
                        this.$message.success('Substation downloaded successfully!')
                    } else {
                        this.$message.error('Download failed: ' + result.message)
                    }
                } catch (error) {
                    console.error('[Substation Download Error]:', error)
                    this.$message.error('Substation download failed: ' + error.message)
                }
                
                return
            } else if (node.mode === 'voltageLevel') {
                const voltageLevelId = node.mrid || node.id
                if (!voltageLevelId) {
                    this.$message.error('VoltageLevel ID not found')
                    return
                }

                const parentSubstationId = node.parentId
                if (!parentSubstationId) {
                    this.$message.error('Parent substation not found')
                    return
                }

                try {
                    const parentSubstationNode = this.findNodeById(parentSubstationId, this.ownerServerList)

                    if (!parentSubstationNode) {
                        this.$message.error('Parent substation not found in Server Tree.')
                        return
                    }

                    const parentOrgId = parentSubstationNode.parentId
                    if (!parentOrgId) {
                        this.$message.error('Parent organisation not found')
                        return
                    }

                    const orgNode = this.findNodeById(parentOrgId, this.ownerServerList)
                    if (orgNode) {
                        await this.downloadOrganisationChainForParent(orgNode)
                    } else {
                        console.warn('[VoltageLevel Download] Parent org node not found in Server Tree')
                    }
                } catch (error) {
                    console.error('[VoltageLevel Download] Error downloading org chain:', error)
                    this.$message.error('Error downloading organisation chain: ' + error.message)
                }

                try {
                    const parentSubstationNode = this.findNodeById(parentSubstationId, this.ownerServerList)
                    
                    if (parentSubstationNode) {
                        const existingSubstation = this.findNodeById(parentSubstationId, this.organisationClientList)
                        
                        if (!existingSubstation) {
                            const { substation } = await this.prepareSubstationDownloadData(parentSubstationNode)
                            const result = await this.downloadSubstationToDb(substation, parentSubstationNode.parentId)
                            
                            if (!result.success) {
                                console.error('[VoltageLevel Download] Failed to download parent substation:', result.message)
                            }
                        }
                    }
                } catch (error) {
                    console.error('[VoltageLevel Download] Error checking parent substation:', error)
                }

                await this.showLocationRoot()

                try {
                    const { voltageLevel, parentSubstationId: vlParentSubstationId } = await this.prepareVoltageLevelDownloadData(node)
                    const result = await this.downloadVoltageLevelToDb(voltageLevel, vlParentSubstationId)
                    
                    if (result.success) {
                        this.$message.success('VoltageLevel downloaded successfully!')
                    } else {
                        this.$message.error('Download failed: ' + result.message)
                    }
                } catch (error) {
                    console.error('[VoltageLevel Download Error]:', error)
                    this.$message.error('VoltageLevel download failed: ' + error.message)
                }

                return
            } else if (node.mode === 'bay') {
                const bayId = node.mrid || node.id
                if (!bayId) {
                    this.$message.error('Bay ID not found')
                    return
                }

                const parentVoltageLevelId = node.parentId
                if (!parentVoltageLevelId) {
                    this.$message.error('Parent VoltageLevel not found')
                    return
                }

                try {
                    await this.$confirm(
                        `Download Bay[${node.name}] + ancestors?`,
                        'Xác nhận',
                        {
                            confirmButtonText: 'Tải',
                            cancelButtonText: 'Hủy',
                            type: 'info'
                        }
                    )
                } catch (cancel) {
                    this.$message.info('Đã hủy tải')
                    return
                }

                const parentVLNode = this.findNodeById(parentVoltageLevelId, this.ownerServerList)
                if (!parentVLNode) {
                    this.$message.error('VoltageLevel cha không tồn tại trong ServerTree')
                    return
                }

                try {
                    const parentSubstationId = parentVLNode.parentId
                    if (parentSubstationId) {
                        const parentSubstationNode = this.findNodeById(parentSubstationId, this.ownerServerList)
                        
                        if (parentSubstationNode) {
                            const parentOrgId = parentSubstationNode.parentId
                            if (parentOrgId) {
                                const orgNode = this.findNodeById(parentOrgId, this.ownerServerList)
                                if (orgNode) {
                                    await this.downloadOrganisationChainForParent(orgNode)
                                }
                            }
                            
                            const { substation } = await this.prepareSubstationDownloadData(parentSubstationNode)
                            await this.downloadSubstationToDb(substation, parentSubstationNode.parentId)
                        } else {
                            console.warn('[Bay Download] Parent Substation node not found in ServerTree')
                        }
                    }
                } catch (error) {
                    console.warn('[Bay Download] Chain download warning:', error)
                }

                await this.showLocationRoot()
                try {
                    const existingVL = this.findNodeById(parentVoltageLevelId, this.organisationClientList)
                    if (!existingVL) {
                        const { voltageLevel } = await this.prepareVoltageLevelDownloadData(parentVLNode)
                        const result = await this.downloadVoltageLevelToDb(voltageLevel, parentVLNode.parentId)
                        if (!result.success) {
                            console.warn('[Bay Download] VL download warning:', result.message)
                        }
                    }
                } catch (error) {
                    console.error('[Bay Download] Error checking parent VL:', error)
                }
                try {
                    let bayData = null
                    let retryCount = 0
                    const maxRetries = 3

                    while (retryCount < maxRetries) {
                        try {
                            const response = await demoAPI.getBayById(bayId)
                            if (response && (response.mRID || response.mrid)) {
                                bayData = response
                                break
                            }
                            retryCount++
                        } catch (apiError) {
                            retryCount++
                            if (retryCount >= maxRetries) throw apiError
                        }
                    }

                    if (!bayData) {
                        this.$message.error('Không lấy được dữ liệu từ API')
                        return
                    }

                    const { bay } = await this.prepareBayDownloadData(node, bayData, parentVoltageLevelId)
                    const result = await this.downloadBayToDb(bay, parentVoltageLevelId)
                    
                    if (result.success) {
                        await this.showLocationRoot()
                        this.$message.success(`Bay [${node.name}] + ancestors downloaded successfully!`)
                    } else {
                        this.$message.error('Download failed: ' + result.message)
                    }
                    
                } catch (error) {
                    console.error('[Bay Download Error]:', error)
                    this.$message.error('Bay download failed: ' + error.message)
                }

                return
            }

            try {
                const serverResponse = await demoAPI.getAssetById(node.mrid, 'PowerCable')
                if (!serverResponse) return

                const PowerCableServerMapper = require('@/views/Mapping/ServerToDTO/PowerCable/index.js')
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
            } catch (error) {
                console.error('[PowerCable Download Error]:', error)
                this.$message.error('Download failed: ' + error.message)
            }
        },

        async downloadOrganisationChainForParent(parentNode) {
            try {
                const { chain } = await this.prepareOrganisationDownloadData(parentNode)
                await this.downloadOrganisationChain(chain)
                
                const rootOrg = this.organisationClientList?.find(org => org.mrid === '00000000-0000-0000-0000-000000000000')
                
                if (rootOrg) {
                    if (!rootOrg.children) {
                        rootOrg.children =[]
                    }
                    
                    for (const org of chain) {
                        const orgNode = {
                            mrid: org.mrid,
                            name: org.name,
                            aliasName: org.aliasName || org.name,
                            parentId: '00000000-0000-0000-0000-000000000000',
                            mode: 'organisation'
                        }
                        
                        const existingIndex = rootOrg.children.findIndex(c => c.mrid === org.mrid)
                        if (existingIndex >= 0) {
                            rootOrg.children[existingIndex] = orgNode
                        } else {
                            rootOrg.children.push(orgNode)
                        }
                    }
                    
                    this.$set(rootOrg, 'expanded', true)
                } else {
                    console.warn('[downloadOrganisationChainForParent] Root org not found in client tree')
                }
            } catch (error) {
                console.error('[downloadOrganisationChainForParent Error]:', error)
                throw error
            }
        },

        async prepareSubstationDownloadData(node) {
            const substationId = node.mrid || node.id
            const parentOrgId = node.parentId
            
            if (!substationId) throw new Error('Substation ID not found')
            if (!parentOrgId) throw new Error('Parent organisation ID not found')
            
            let substationData = null
            
            try {
                const response = await demoAPI.getSubstationById(substationId)
                
                if (response && response.name) {
                    substationData = response
                    if (!substationData.aliasName || substationData.aliasName === null) {
                        substationData.aliasName = substationData.name
                    }
                }
            } catch (error) {
                console.error('[prepareSubstationDownloadData Error]:', error)
                throw new Error('Failed to fetch substation: ' + error.message)
            }
            
            const substationObj = {
                id: substationId,
                mrid: String(substationId),
                name: substationData?.name || node.name || '',
                aliasName: substationData?.aliasName || node.aliasName || node.name || '',
                parentId: String(parentOrgId),
                _type: 'substation',
                _serverData: substationData || {
                    id: substationId,
                    name: node.name,
                    mRID: substationId,
                    organisation_id: parentOrgId
                }
            }
            
            return {
                substation: substationObj,
                parentOrgId: String(parentOrgId)
            }
        },

        async downloadSubstationToDb(substation, parentOrgId) {
            const SubstationServerMapper = require('@/views/Mapping/ServerToDTO/Substation/index.js')
            const SubstationMapper = require('@/views/Mapping/Substation/index.js')
            const SubstationEntity = require('@/views/Flatten/Substation/index.js').default
            
            const serverData = {
                ...substation._serverData,
                mRID: substation.mrid,
            }
            
            const dto = SubstationServerMapper.mapServerToDto(serverData)
            dto.organisationId = parentOrgId
            dto.userId = this.$store.state.user.user_id
            dto.userIdentifiedObjectId = this.generateUuid()
            dto.organisationPsrId = this.generateUuid()
            
            const entity = SubstationMapper.mapDtoToEntity(dto)
            
            let insertSuccess = false
            try {
                const insertResult = await window.electronAPI.insertSubstationEntity(entity)
                insertSuccess = insertResult.success
            } catch (e) {
                console.error('[downloadSubstationToDb Insert Error]:', e.message)
            }
            
            if (insertSuccess) {
                const parentOrgNode = this.findNodeById(parentOrgId, this.organisationClientList)
                
                if (parentOrgNode) {
                    const newSubstationNode = {
                        mrid: substation.mrid,
                        name: substation.name,
                        aliasName: substation.aliasName,
                        parentId: parentOrgId,
                        mode: 'substation'
                    }
                    
                    const children = Array.isArray(parentOrgNode.children) ? [...parentOrgNode.children] :[]
                    const existingIndex = children.findIndex(c => c.mrid === substation.mrid)
                    
                    if (existingIndex >= 0) {
                        children[existingIndex] = newSubstationNode
                    } else {
                        children.push(newSubstationNode)
                    }
                    
                    Vue.set(parentOrgNode, 'children', children)
                    this.$set(parentOrgNode, 'expanded', true)
                } else {
                    await this.showLocationRoot()
                }
                
                return { success: true, message: 'Download successful' }
            } else {
                return { success: false, message: 'Download failed' }
            }
        },

        async executeDownloadAndSave(dto, parentNode) {
            try {
                const PowerCableMapping = require('@/views/Mapping/PowerCable/index')
                const existingLocalRes = await window.electronAPI.getPowerCableEntityByMrid(dto.properties.mrid, dto.psrId)

                let oldEntity
                if (existingLocalRes.success && existingLocalRes.data) {
                    oldEntity = existingLocalRes.data
                } else {
                    const PowerCableEntity = require('@/views/Flatten/PowerCable/index').default
                    oldEntity = new PowerCableEntity()
                }

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
            const chain =[]
            let prevParentId = ''
            
            if (node.parentArr && Array.isArray(node.parentArr)) {
                for (let i = 0; i < node.parentArr.length; i++) {
                    const ancestor = node.parentArr[i]
                    const ancestorId = ancestor.mrid || ancestor.id
                    
                    if (!ancestorId) continue
                    
                    let assignedParentId = prevParentId
                    if (i === 0 && !prevParentId) {
                        assignedParentId = CLIENT_ROOT
                    }
                    
                    let ancestorData = null
                    try {
                        const response = await demoAPI.getOrganisationById(ancestorId)
                        ancestorData = response.data || response
                        
                        if (!ancestorData.mRID) ancestorData.mRID = ancestorId
                        if (!ancestorData.organisation) ancestorData.organisation = {}
                        if (!ancestorData.organisation.mRID) ancestorData.organisation.mRID = ancestorId
                        if (!ancestorData.organisation.parentOrganisation) ancestorData.organisation.parentOrganisation = assignedParentId
                        
                    } catch (e) {
                        console.error('[buildAncestors API Error]:', ancestorId, e.message)
                        throw new Error(`Failed to fetch organisation ${ancestorId}: ${e.message}`)
                    }
                    
                    chain.push({
                        id: ancestorId,
                        mrid: ancestorId,
                        name: ancestor.parent || ancestor.name || '',
                        parentId: assignedParentId,
                        _type: 'organisation',
                        _serverData: ancestorData || { id: ancestorId, name: ancestor.parent }
                    })
                    
                    prevParentId = ancestorId
                }
            }
            
            const selectedOrgId = node.mrid || node.id
            let orgData = null
            
            try {
                const response = await demoAPI.getOrganisationById(selectedOrgId)
                if (response && typeof response === 'object' && response.aliasName) {
                    orgData = response
                } else if (response?.data?.data) {
                    orgData = response.data.data
                } else if (response?.data) {
                    orgData = response.data
                }
            } catch (e) {
                console.warn('[buildAncestors Fetch Selected Org Warning]:', selectedOrgId, e.message)
                if (node._serverData) orgData = node._serverData
            }
            
            let finalParentId = node.parentId || prevParentId
            if ((!node.parentArr || node.parentArr.length === 0) && !finalParentId) {
                finalParentId = CLIENT_ROOT
            }
            
            chain.push({
                id: selectedOrgId,
                mrid: selectedOrgId,
                name: node.name || node.aliasName || '',
                parentId: finalParentId,
                _type: 'organisation',
                _serverData: orgData || { id: selectedOrgId, name: node.name }
            })
            
            return chain
        },

        async fetchAllDescendants(nodeId, nodeType, visited = new Set()) {
            let allDescendants =[]
            
            if (!nodeId || visited.has(nodeId)) return allDescendants
            visited.add(nodeId)
            
            try {
                if (nodeType === 'organisation') {
                    const substations = await demoAPI.getChildSubstation(nodeId)
                    
                    for (const sub of substations) {
                        const subId = sub.mrid !== undefined && sub.mrid !== null ? sub.mrid : sub.id
                        
                        allDescendants.push({
                            id: subId,
                            mrid: subId,
                            name: sub.name,
                            _type: 'substation',
                            parentId: nodeId,
                            _serverData: sub
                        })
                        
                        const subDescendants = await this.fetchAllDescendants(subId, 'substation', visited)
                        allDescendants.push(...subDescendants)
                    }
                } 
                else if (nodeType === 'substation') {
                    const voltageLevels = await demoAPI.getVoltageLevelBySubstationId(nodeId)
                    
                    for (const vl of voltageLevels) {
                        const vlId = vl.mrid !== undefined && vl.mrid !== null ? vl.mrid : vl.id
                        
                        allDescendants.push({
                            id: vlId,
                            mrid: vlId,
                            name: vl.name,
                            _type: 'voltageLevel',
                            parentId: nodeId,
                            _serverData: vl
                        })
                        
                        const vlDescendants = await this.fetchAllDescendants(vlId, 'voltageLevel', visited)
                        allDescendants.push(...vlDescendants)
                    }
                } 
                else if (nodeType === 'voltageLevel') {
                    const bays = await demoAPI.getBayByVoltageLevel(nodeId)
                    
                    for (const bay of bays) {
                        const bayId = bay.mrid || bay.id
                        
                        allDescendants.push({
                            id: bayId,
                            mrid: bayId,
                            name: bay.name,
                            _type: 'bay',
                            parentId: nodeId,
                            _serverData: bay
                        })
                        
                        const bayDescendants = await this.fetchAllDescendants(bayId, 'bay', visited)
                        allDescendants.push(...bayDescendants)
                    }
                } 
                else if (nodeType === 'bay') {
                    const assetTypes =[
                        'PowerCable', 'Transformer', 'CircuitBreaker', 'CurrentTransformer',
                        'Disconnector', 'SurgeArrester', 'VoltageTransformer', 'Capacitor',
                        'Reactor', 'RotatingMachine', 'Bushing'
                    ]
                    
                    for (const assetType of assetTypes) {
                        try {
                            const assets = await demoAPI.getAssetByOwner(nodeId, assetType)
                            
                            for (const asset of assets) {
                                const assetId = asset.mrid || asset.id
                                
                                allDescendants.push({
                                    id: assetId,
                                    mrid: assetId,
                                    name: asset.name || asset.apparatus_id,
                                    _type: 'asset',
                                    _assetType: assetType,
                                    parentId: nodeId,
                                    _serverData: asset
                                })
                            }
                        } catch (e) {
                            // Bỏ qua log warning khi fetch asset không có dữ liệu
                        }
                    }
                }
            } catch (error) {
                console.error('[fetchAllDescendants Error]:', error)
            }
            
            return allDescendants
        },

        async prepareOrganisationDownloadData(node) {
            const chain = await this.buildAncestors(node)
            return { chain, descendants:[] }
        },

        async fetchWithRetry(fn, maxRetries = 3, delayMs = 1000) {
            for (let i = 1; i <= maxRetries; i++) {
                try {
                    return await fn()
                } catch (error) {
                    if (i < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, delayMs * i))
                    }
                }
            }
            throw new Error(`Failed after ${maxRetries} retries`)
        },

        async downloadOrganisationChain(chain) {
            const CLIENT_ROOT = '00000000-0000-0000-0000-000000000000'
            const OrganisationServerMapper = require('@/views/Mapping/ServerToDTO/Organisation/index.js')
            const OrganisationMapper = require('@/views/Mapping/Organisation/index.js')
            const OrganisationEntity = require('@/views/Flatten/Organisation/index.js').default
            
            let failedCount = 0
            
            for (let i = 0; i < chain.length; i++) {
                const org = chain[i]
                
                try {
                    const rawPositionPoints = org._serverData?.positionPoints ||[]
                    const hasValidPositionData = rawPositionPoints.some(p => 
                        p.xposition !== null || p.yposition !== null || p.zposition !== null
                    )
                    
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
                        positionPoints: hasValidPositionData ? rawPositionPoints :[]
                    }
                    
                    const dto = OrganisationServerMapper.mapServerToDto(serverData)
                    dto.parentId = org.parentId
                    dto.organisationId = org.mrid
                    
                    const entity = OrganisationMapper.OrgDtoToOrgEntity(dto)
                    
                    if (org.parentId && org.parentId !== CLIENT_ROOT) {
                        try {
                            await this.fetchWithRetry(
                                () => window.electronAPI.getOrganisationEntityByMrid(org.parentId)
                            )
                        } catch (e) {
                            console.warn('[downloadOrganisationChain Parent check warning]:', e.message)
                        }
                    }
                    
                    let exists = false
                    try {
                        const existingResult = await this.fetchWithRetry(
                            () => window.electronAPI.getOrganisationEntityByMrid(org.mrid)
                        )
                        exists = existingResult.success && existingResult.data
                    } catch (e) {
                        console.warn('[downloadOrganisationChain Existing check warning]:', e.message)
                    }
                    
                    if (exists) {
                        try {
                            await this.fetchWithRetry(
                                () => window.electronAPI.deleteParentOrganizationEntity(org.mrid)
                            )
                        } catch (e) {
                            console.warn('[downloadOrganisationChain Delete warning]:', e.message)
                        }
                    }
                    
                    try {
                        const insertResult = await this.fetchWithRetry(
                            () => window.electronAPI.insertParentOrganizationEntity(entity)
                        )
                        if (!insertResult.success) failedCount++
                    } catch (e) {
                        console.error('[downloadOrganisationChain Insert error]:', e.message)
                        failedCount++
                    }
                    
                } catch (error) {
                    console.error('[downloadOrganisationChain Error processing org]:', org.name, error)
                    failedCount++
                }
            }
            
            if (failedCount > 0) {
                console.warn(`[downloadOrganisationChain] ⚠️ ${failedCount} org(s) failed to download`)
            }
        },

        async prepareVoltageLevelDownloadData(node) {
            const voltageLevelId = node.mrid || node.id
            if (!voltageLevelId) throw new Error('VoltageLevel ID not found')

            let voltageLevelData = null
            try {
                const response = await demoAPI.getVoltageLevelBySubstationId(node.parentId)
                
                if (Array.isArray(response)) {
                    voltageLevelData = response.find(vl => 
                        vl.mRID === voltageLevelId || 
                        vl.mrid === voltageLevelId ||
                        vl.id === voltageLevelId
                    )
                } else if (response && (response.mRID === voltageLevelId || response.mrid === voltageLevelId)) {
                    voltageLevelData = response
                }
            } catch (error) {
                console.error('[prepareVoltageLevelDownloadData Error]:', error)
                throw new Error('Failed to fetch voltageLevel from server: ' + error.message)
            }

            if (!voltageLevelData) {
                voltageLevelData = {
                    mRID: voltageLevelId,
                    name: node.name,
                    shortName: node.aliasName || node.name
                }
            }

            const voltageLevelObj = {
                id: voltageLevelId,
                mrid: String(voltageLevelId),
                name: voltageLevelData?.name || node.name || '',
                aliasName: voltageLevelData?.shortName || voltageLevelData?.aliasName || node.aliasName || node.name || '',
                _type: 'voltageLevel',
                _serverData: voltageLevelData,
                parentId: node.parentId
            }

            return {
                voltageLevel: voltageLevelObj,
                parentSubstationId: node.parentId
            }
        },

        async downloadVoltageLevelToDb(voltageLevel, parentSubstationId) {
            const VoltageLevelServerMapper = require('@/views/Mapping/ServerToDTO/VoltageLevel/index.js')
            const VoltageLevelMapper = require('@/views/Mapping/VoltageLevel/index.js')
            const VoltageLevelEntity = require('@/views/Flatten/VoltageLevel/index.js').default

            const serverData = {
                ...voltageLevel._serverData,
                mRID: voltageLevel.mrid,
                substation: { mRID: parentSubstationId }
            }

            const dto = VoltageLevelServerMapper.mapServerToDto(serverData)
            dto.substationId = parentSubstationId
            dto.userIdentifiedObjectId = this.generateUuid()

            const entity = VoltageLevelMapper.volDtoToVolEntity(dto)

            let insertSuccess = false
            try {
                const insertResult = await window.electronAPI.insertVoltageLevelEntity(entity)
                insertSuccess = insertResult.success
            } catch (e) {
                console.error('[downloadVoltageLevelToDb Insert Error]:', e.message)
            }

            if (insertSuccess) {
                await this.addVoltageLevelToClientTree(voltageLevel, parentSubstationId)
                return { success: true, message: 'Download successful' }
            } else {
                return { success: false, message: 'Download failed' }
            }
        },

        async addVoltageLevelToClientTree(voltageLevel, parentSubstationId) {
            const parentNode = this.findNodeById(parentSubstationId, this.organisationClientList)

            if (parentNode) {
                const children = Array.isArray(parentNode.children) ? [...(parentNode.children || [])] :[]
                
                const newVoltageLevelNode = {
                    mrid: voltageLevel.mrid,
                    name: voltageLevel.name,
                    aliasName: voltageLevel.aliasName,
                    parentId: parentSubstationId,
                    mode: 'voltageLevel'
                }

                const existingIndex = children.findIndex(c => c.mrid === voltageLevel.mrid)
                if (existingIndex >= 0) {
                    children[existingIndex] = newVoltageLevelNode
                } else {
                    children.push(newVoltageLevelNode)
                }

                Vue.set(parentNode, 'children', children)
                this.$set(parentNode, 'expanded', true)
            } else {
                await this.showLocationRoot()
            }
        },

        async prepareBayDownloadData(node, bayServerData, parentVoltageLevelId) {
            const bayId = node.mrid || node.id
            if (!bayId) throw new Error('Bay ID not found')

            const BayServerMapper = require('@/views/Mapping/ServerToDTO/Bay/index.js')

            const serverData = {
                ...bayServerData,
                mRID: bayId,
                voltageLevel: { mRID: parentVoltageLevelId }
            }

            const dto = BayServerMapper.mapServerToDto(serverData)

            const bayObj = {
                mrid: dto.bayId,
                name: dto.name,
                bay_energy_meas_flag: dto.bay_energy_meas_flag,
                bay_power_meas_flag: dto.bay_power_meas_flag,
                breaker_configuration: dto.breaker_configuration,
                bus_bar_configuration: dto.bus_bar_configuration,
                voltage_level: parentVoltageLevelId,
                _type: 'bay',
                _serverData: bayServerData
            }

            return {
                bay: bayObj,
                parentVoltageLevelId: parentVoltageLevelId
            }
        },

        async downloadBayToDb(bay, parentVoltageLevelId) {
            try {
                const entityData = {
                    mrid: bay.mrid,
                    name: bay.name,
                    bay_energy_meas_flag: bay.bay_energy_meas_flag || '',
                    bay_power_meas_flag: bay.bay_power_meas_flag || '',
                    breaker_configuration: bay.breaker_configuration || '',
                    bus_bar_configuration: bay.bus_bar_configuration || '',
                    voltage_level: parentVoltageLevelId,
                    substation: null
                }

                const insertResult = await window.electronAPI.insertBayEntity(entityData)
                
                if (!insertResult.success) {
                    return { success: false, message: insertResult.message }
                }

                const parentNode = this.findNodeById(parentVoltageLevelId, this.organisationClientList)
                
                if (parentNode) {
                    if (!parentNode.children) {
                        parentNode.children =[]
                    }
                    
                    const children = parentNode.children
                    
                    const newBayNode = {
                        id: bay.mrid,
                        mrid: bay.mrid,
                        name: bay.name,
                        aliasName: bay.name,
                        parentId: parentVoltageLevelId,
                        mode: 'bay'
                    }

                    const existingIndex = children.findIndex(c => c.mrid === bay.mrid)
                    if (existingIndex >= 0) {
                        children[existingIndex] = newBayNode
                    } else {
                        children.push(newBayNode)
                    }

                    Vue.set(parentNode, 'children', children)
                    this.$set(parentNode, 'expanded', true)
                }

                return { success: true, message: 'Bay downloaded successfully' }

            } catch (error) {
                console.error('[downloadBayToDb Error]:', error)
                return { success: false, message: error.message }
            }
        },
    }
}
import * as demoAPI from '@/api/demo'
export default {
    methods: {
        // 4. Handler cho việc chọn node trong tree dialog (tương tự move node)
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
        // 1. Khi nhấn nút Download trên toolbar
        async handleDownloadNode() {
            console.log('[STAGE 1] handleDownloadNode - START')
            
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                console.log('[STAGE 1] No selected nodes - returning')
                this.$message.warning('Please select a node to download')
                return
            }

            const node = this.selectedNodes[this.selectedNodes.length - 1]
            console.log('[STAGE 1] Selected node:', node)
            console.log('[STAGE 1] Node mode:', node.mode)
            console.log('[STAGE 1] Node name:', node.name)
            console.log('[STAGE 1] Node mrid:', node.mrid)

            // STAGE 2: Organisation download flow
            if (node.mode === 'organisation') {
                console.log('[STAGE 1] Organisation mode - CALLING STAGE 2')
                
                try {
                    // Stage 2: Prepare data
                    console.log('[STAGE 2] Starting prepareOrganisationDownloadData')
                    const { chain } = await this.prepareOrganisationDownloadData(node)
                    
                    console.log('[STAGE 2] Data prepared:')
                    console.log('  - Chain length:', chain.length)
                    
                    // === GỌI STAGE 3 ===
                    console.log('[STAGE 3] Starting downloadOrganisationChain')
                    await this.downloadOrganisationChain(chain)
                    // ====================
                    
                    // === REFRESH CLIENT TREE ===
                    console.log('[STAGE 6] Refreshing client tree...')
                    await this.showLocationRoot()
                    // ==========================
                    
                    this.$message.success('Organisation chain downloaded successfully!')
                    
                } catch (error) {
                    console.error('[STAGE 2] Error:', error)
                    this.$message.error('Prepare download failed: ' + error.message)
                }
                return
            } else if (node.mode === 'substation') {
                console.log('[STAGE 1] Substation mode - NOT IMPLEMENTED')
                this.$message.warning('Substation download not implemented yet')
                return
            }

            try {
                console.log('[STAGE 1] Proceeding with PowerCable download')
                // 1. Lấy dữ liệu thô từ Server
                console.log('[STAGE 1] Calling demoAPI.getAssetById with mrid:', node.mrid)
                const serverResponse = await demoAPI.getAssetById(node.mrid, 'PowerCable')
                console.log('[STAGE 1] Server response:', serverResponse)
                if (!serverResponse) {
                    console.log('[STAGE 1] No server response - returning')
                    return
                }

                // 2. Map sang DTO bằng hàm của bạn
                console.log('[STAGE 1] Mapping server response to DTO')
                const PowerCableServerMapper = require('@/views/Mapping/ServerToDTO/PowerCable/index.js')
                const dto = PowerCableServerMapper.mapServerToDto(serverResponse)

                // 3. QUAN TRỌNG: Gán các ID quan hệ để Map về Entity local không bị lỗi
                // Vì Database local của bạn chia làm nhiều bảng (Asset, AssetInfo, Model...)
                dto.assetInfoId = serverResponse.cableInfo?.mRID || serverResponse.cableInfo?.mrid || this.generateUuid()
                dto.productAssetModelId = serverResponse.assetData?.productAssetModel?.mRID || this.generateUuid()
                dto.lifecycleDateId = this.generateUuid() // Thường server không trả về ID bảng này, nên tạo mới
                dto.oldCableInfoId = dto.assetInfoId // Trong PowerCable, OldCableInfo dùng chung ID với AssetInfo
                dto.assetPsrId = this.generateUuid()

                // 4. Kiểm tra node cha trên Client
                // node.parentId là ID của cha (Substation/Bay) từ server
                console.log('[STAGE 1] Looking for parent node with parentId:', node.parentId)
                const clientParent = this.findNodeById(node.parentId, this.organisationClientList)
                console.log('[STAGE 1] Client parent found:', clientParent)

                if (clientParent) {
                    // Trường hợp 1: Đã có cha trên Client -> Tự động gắn
                    console.log('[STAGE 1] Parent found - auto attaching')
                    dto.psrId = clientParent.mrid
                    dto.locationId = clientParent.location || clientParent.mrid
                    await this.executeDownloadAndSave(dto, clientParent)
                } else {
                    // Trường hợp 2: Chưa có cha -> Hiện cây Client để chọn cha
                    console.log('[STAGE 1] Parent NOT found - showing download dialog')
                    this.nodeToDownloadData = dto
                    this.moveTreeData = this.buildMoveTreeData(this.organisationClientList, { mrid: 'none' }, this.getValidParentTypes('asset'))
                    this.downloadDialogVisible = true
                }
            } catch (error) {
                console.error('[STAGE 1] Download error:', error)
                this.$message.error('Download failed: ' + error.message)
            }
            console.log('[STAGE 1] handleDownloadNode - END')
        },

        // 2. Hàm thực hiện lưu vào DB (Xử lý ghi đè nếu đã tồn tại)
        async executeDownloadAndSave(dto, parentNode) {
            console.log('[STAGE 1] executeDownloadAndSave - START')
            try {
                const PowerCableMapping = require('@/views/Mapping/PowerCable/index')

                // 1. Kiểm tra xem node này đã có ở client chưa (Dựa vào MRID từ server)
                console.log('[STAGE 1] Checking if asset exists in local DB, mrid:', dto.properties.mrid, 'psrId:', dto.psrId)
                const existingLocalRes = await window.electronAPI.getPowerCableEntityByMrid(dto.properties.mrid, dto.psrId)
                console.log('[STAGE 1] Existing local response:', existingLocalRes)

                let oldEntity
                if (existingLocalRes.success && existingLocalRes.data) {
                    // ĐÃ CÓ -> Đây là trường hợp GHI ĐÈ
                    oldEntity = existingLocalRes.data
                } else {
                    // CHƯA CÓ -> Tạo mới hoàn toàn
                    const PowerCableEntity = require('@/views/Flatten/PowerCable/index').default
                    oldEntity = new PowerCableEntity()
                }

                // 2. Chuyển DTO thành Entity chuẩn của client
                const newEntity = PowerCableMapping.mapDtoToEntity(dto)

                // 3. Lưu vào Database local
                // Nhờ lệnh "ON CONFLICT(mrid) DO UPDATE" trong các hàm của bạn,
                // dữ liệu mới sẽ tự động ghi đè lên các bản ghi cũ cùng MRID.
                console.log('[STAGE 1] Saving to local DB...')
                const saveRs = await window.electronAPI.insertPowerCableEntity(oldEntity, newEntity)
                console.log('[STAGE 1] Save result:', saveRs)

                if (saveRs.success) {
                    console.log('[STAGE 1] Save successful')
                    this.$message.success('Download and overwrite successful!')
                    this.downloadDialogVisible = false

                    // 4. Refresh lại cây bên Client để thấy node mới/cập nhật
                    if (parentNode) {
                        console.log('[STAGE 1] Refreshing client tree...')
                        this.$set(parentNode, '_childrenFetched', false)
                        await this.fetchChildren(parentNode)
                        this.$set(parentNode, 'expanded', true)
                    }
                } else {
                    console.log('[STAGE 1] Save failed')
                    this.$message.error('Save failed: ' + saveRs.message)
                }
            } catch (error) {
                console.error('[STAGE 1] Save error:', error)
                this.$message.error('Error saving to local database')
            }
            console.log('[STAGE 1] executeDownloadAndSave - END')
        },

        // =========================================================================
        // STAGE 2: PREPARE DATA
        // =========================================================================
        
        // 2.1: Build chain (ancestors) - Lấy danh sách tổ tiên từ root đến selected org
        async buildAncestors(node) {
            console.log('[STAGE 2.1] buildAncestors - START')
            console.log('[STAGE 2.1] node:', node)
            console.log('[STAGE 2.1] parentArr:', node.parentArr)
            
            const CLIENT_ROOT = '00000000-0000-0000-0000-000000000000' // this.$constant.ROOT
            
            const chain = []
            let prevParentId = '' // ROOT sẽ được gán sau
            
            // 1. Process ancestors từ parentArr (root -> parent of selected)
            if (node.parentArr && Array.isArray(node.parentArr)) {
                for (let i = 0; i < node.parentArr.length; i++) {
                    const ancestor = node.parentArr[i]
                    const ancestorId = ancestor.mrid || ancestor.id
                    
                    if (!ancestorId) continue
                    
                    // ===== SỬA: Nếu là ancestor đầu tiên (top của server tree) =====
                    // thì gán parentId = ROOT của client
                    let assignedParentId = prevParentId
                    if (i === 0 && !prevParentId) {
                        assignedParentId = CLIENT_ROOT
                        console.log('[STAGE 2.1] Top ancestor - assigning CLIENT_ROOT as parent')
                    }
                    // ===== HẾT SỬA =====
                    
                    // Fetch từ API nếu chưa có data
                    let ancestorData = null
                    if (ancestor._serverData) {
                        ancestorData = ancestor._serverData
                    } else {
                        try {
                            const response = await demoAPI.getOrganisationById(ancestorId)
                            ancestorData = response.data || response
                        } catch (e) {
                            console.warn('[STAGE 2.1] Could not fetch ancestor:', ancestorId, e.message)
                        }
                    }
                    
                    // Build ancestor object
                    chain.push({
                        id: ancestorId,
                        mrid: ancestorId,
                        name: ancestor.parent || ancestor.name || '',
                        parentId: assignedParentId,  // ← Dùng assignedParentId
                        _type: 'organisation',
                        _serverData: ancestorData || { id: ancestorId, name: ancestor.parent }
                    })
                    
                    prevParentId = ancestorId
                }
            }
            
            // 2. Thêm selected organisation vào cuối chain
            const selectedOrgId = node.mrid || node.id
            
            // Fetch selected org data
            let orgData = null
            if (node._serverData) {
                orgData = node._serverData
            } else {
                try {
                    const response = await demoAPI.getChildOrganisation(selectedOrgId)
                    if (response.data && Array.isArray(response.data)) {
                        orgData = response.data.find(org => org.id == selectedOrgId || org.mrid == selectedOrgId)
                    }
                } catch (e) {
                    console.warn('[STAGE 2.1] Could not fetch selected org:', selectedOrgId, e.message)
                }
            }
            
            chain.push({
                id: selectedOrgId,
                mrid: selectedOrgId,
                name: node.name || node.aliasName || '',
                parentId: node.parentId || prevParentId,
                _type: 'organisation',
                _serverData: orgData || { id: selectedOrgId, name: node.name }
            })
            
            console.log('[STAGE 2.1] chain built:', chain)
            console.log('[STAGE 2.1] buildAncestors - END')
            
            return chain
        },

        // 2.2: Fetch descendants đệ quy - Lấy tất cả con cháu
        async fetchAllDescendants(nodeId, nodeType, visited = new Set()) {
            console.log('[STAGE 2.2] fetchAllDescendants - START')
            console.log('[STAGE 2.2] nodeId:', nodeId, 'nodeType:', nodeType)
            
            let allDescendants = []
            
            // Prevent circular reference
            if (!nodeId) {
                console.warn('[STAGE 2.2] nodeId is undefined, skipping')
                return allDescendants
            }
            
            if (visited.has(nodeId)) {
                console.warn('[STAGE 2.2] Circular reference detected for node', nodeId)
                return allDescendants
            }
            visited.add(nodeId)
            
            try {
                if (nodeType === 'organisation') {
                    // Fetch Substations
                    console.log('[STAGE 2.2] Fetching substations for org:', nodeId)
                    const substations = await demoAPI.getChildSubstation(nodeId)
                    console.log('[STAGE 2.2] Found substations:', substations.length)
                    
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
                        
                        // Recursive: Substation -> VoltageLevels
                        const subDescendants = await this.fetchAllDescendants(subId, 'substation', visited)
                        allDescendants.push(...subDescendants)
                    }
                } 
                else if (nodeType === 'substation') {
                    // Fetch VoltageLevels
                    console.log('[STAGE 2.2] Fetching voltageLevels for substation:', nodeId)
                    const voltageLevels = await demoAPI.getVoltageLevelBySubstationId(nodeId)
                    console.log('[STAGE 2.2] Found voltageLevels:', voltageLevels.length)
                    
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
                        
                        // Recursive: VoltageLevel -> Bays
                        const vlDescendants = await this.fetchAllDescendants(vlId, 'voltageLevel', visited)
                        allDescendants.push(...vlDescendants)
                    }
                } 
                else if (nodeType === 'voltageLevel') {
                    // Fetch Bays
                    console.log('[STAGE 2.2] Fetching bays for voltageLevel:', nodeId)
                    const bays = await demoAPI.getBayByVoltageLevel(nodeId)
                    console.log('[STAGE 2.2] Found bays:', bays.length)
                    
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
                        
                        // Recursive: Bay -> Assets
                        const bayDescendants = await this.fetchAllDescendants(bayId, 'bay', visited)
                        allDescendants.push(...bayDescendants)
                    }
                } 
                else if (nodeType === 'bay') {
                    // Fetch Assets (11 types)
                    console.log('[STAGE 2.2] Fetching assets for bay:', nodeId)
                    
                    const assetTypes = [
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
                            console.warn('[STAGE 2.2] Failed to fetch', assetType, 'for bay', nodeId, e.message)
                        }
                    }
                }
                // Asset is leaf - no more descendants
            } catch (error) {
                console.error('[STAGE 2.2] Error fetching descendants:', error)
            }
            
            console.log('[STAGE 2.2] fetchAllDescendants - END, count:', allDescendants.length)
            return allDescendants
        },

        // 2.3: Main Stage 2 - Prepare organisation download data (CHAIN ONLY - Version 3.0)
        async prepareOrganisationDownloadData(node) {
            console.log('[STAGE 2] prepareOrganisationDownloadData - START')
            console.log('[STAGE 2] node:', node)
            
            // Step 1: Build chain (ancestors) only - NO descendants in Version 3.0
            console.log('[STAGE 2] Building chain...')
            const chain = await this.buildAncestors(node)
            console.log('[STAGE 2] Chain built, length:', chain.length)
            
            // Log chain details
            console.log('[STAGE 2] Chain details:')
            chain.forEach((item, index) => {
                console.log(`  [${index}] ${item.name} (id: ${item.id}, mrid: ${item.mrid}, parentId: ${item.parentId})`)
            })
            
            console.log('[STAGE 2] prepareOrganisationDownloadData - END')
            
            // Version 3.0: Only return chain, NO descendants
            return { chain, descendants: [] }
        },

        // =========================================================================
        // STAGE 3: DOWNLOAD CHAIN TO LOCAL DB
        // =========================================================================

        // Helper function: Retry với exponential backoff
        async fetchWithRetry(fn, maxRetries = 3, delayMs = 1000) {
            for (let i = 1; i <= maxRetries; i++) {
                try {
                    return await fn()
                } catch (error) {
                    console.warn(`[RETRY] Attempt ${i}/${maxRetries} failed:`, error.message)
                    if (i < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, delayMs * i))
                    }
                }
            }
            throw new Error(`Failed after ${maxRetries} retries`)
        },

        // 3: Download Chain to Local DB
        async downloadOrganisationChain(chain) {
            console.log('[STAGE 3] downloadOrganisationChain - START')
            console.log('[STAGE 3] Chain length:', chain.length)
            
            const CLIENT_ROOT = '00000000-0000-0000-0000-000000000000'
            const PROGRESS_START = 30
            const PROGRESS_END = 70
            
            // Import mappers and entity
            console.log('[STAGE 3] Importing mappers and entity...')
            const OrganisationServerMapper = require('@/views/Mapping/ServerToDTO/Organisation/index.js')
            const OrganisationMapper = require('@/views/Mapping/Organisation/index.js')
            // eslint-disable-next-line no-unused-vars
            const OrganisationEntity = require('@/views/Flatten/Organisation/index.js').default
            
            console.log('[STAGE 3] Mappers imported successfully')
            
            // Statistics
            let successCount = 0
            let failedCount = 0
            
            // Loop through chain in order (ROOT → ... → Selected)
            for (let i = 0; i < chain.length; i++) {
                const org = chain[i]
                
                // === 3.2: Progress tracking ===
                const currentProgress = PROGRESS_START + Math.round((i / chain.length) * (PROGRESS_END - PROGRESS_START))
                console.log(`[STAGE 3] Progress: ${currentProgress}% (${i + 1}/${chain.length})`)
                
                console.log('[STAGE 3] Processing org:', i, org.name, 'mrid:', org.mrid, 'parentId:', org.parentId)
                
                try {
                    // === CHECKPOINT 1: Map Server → DTO ===
                    console.log('[STAGE 3] Step 1: Mapping server to DTO...')
                    
                    // Merge server data với chain data để đảm bảo đầy đủ thông tin
                    const serverData = {
                        ...(org._serverData || {}),
                        name: org.name,
                        mRID: org.mrid,
                        parentOrganisation: org.parentId
                    }
                    
                    const dto = OrganisationServerMapper.mapServerToDto(serverData)
                    
                    // FIX: Preserve parentId và organisationId từ chain
                    dto.parentId = org.parentId
                    dto.organisationId = org.mrid
                    
                    console.log('[STAGE 3] DTO mapped')
                    console.log('[STAGE 3] DTO parentId:', dto.parentId)
                    console.log('[STAGE 3] DTO organisationId:', dto.organisationId)
                    
                    // === CHECKPOINT 2: Map DTO → Entity ===
                    console.log('[STAGE 3] Step 2: Mapping DTO to Entity...')
                    const entity = OrganisationMapper.OrgDtoToOrgEntity(dto)
                    console.log('[STAGE 3] Entity mapped')
                    
                    // === CHECKPOINT 3: Verify parent exists (skip for ROOT) ===
                    console.log('[STAGE 3] Step 3: Verifying parent exists...')
                    if (org.parentId && org.parentId !== CLIENT_ROOT) {
                        // === 3.1: Retry logic for parent check ===
                        try {
                            const parentExists = await this.fetchWithRetry(
                                () => window.electronAPI.getOrganisationEntityByMrid(org.parentId)
                            )
                            console.log('[STAGE 3] Parent exists check:', org.parentId, parentExists.success)
                            
                            if (!parentExists.success || !parentExists.data) {
                                console.warn('[STAGE 3] ⚠️ Parent not found in DB:', org.parentId, '- Will still insert')
                            }
                        } catch (e) {
                            console.warn('[STAGE 3] ⚠️ Parent check error:', e.message)
                        }
                    } else {
                        console.log('[STAGE 3] Skipping parent check - this is ROOT or has no parent')
                    }
                    
                    // === CHECKPOINT 4: Check if entity exists (Upsert) ===
                    console.log('[STAGE 3] Step 4: Checking if entity exists in DB...')
                    
                    // === 3.1: Retry logic for get entity ===
                    let exists = false
                    try {
                        const existingResult = await this.fetchWithRetry(
                            () => window.electronAPI.getOrganisationEntityByMrid(org.mrid)
                        )
                        exists = existingResult.success && existingResult.data
                    } catch (e) {
                        console.warn('[STAGE 3] ⚠️ Get entity error:', e.message)
                    }
                    console.log('[STAGE 3] Entity exists:', exists)
                    
                    if (exists) {
                        // === CHECKPOINT 5: Delete old entity ===
                        console.log('[STAGE 3] Step 5a: Deleting existing entity...')
                        
                        // === 3.1: Retry logic for delete ===
                        try {
                            const deleteResult = await this.fetchWithRetry(
                                () => window.electronAPI.deleteParentOrganizationEntity(org.mrid)
                            )
                            console.log('[STAGE 3] Delete result:', deleteResult)
                        } catch (e) {
                            console.warn('[STAGE 3] ⚠️ Delete error:', e.message)
                        }
                    }
                    
                    // === CHECKPOINT 6: Insert new entity ===
                    console.log('[STAGE 3] Step 6: Inserting new entity...')
                    
                    // === 3.1: Retry logic for insert ===
                    let insertSuccess = false
                    try {
                        const insertResult = await this.fetchWithRetry(
                            () => window.electronAPI.insertParentOrganizationEntity(entity)
                        )
                        console.log('[STAGE 3] Insert result:', insertResult)
                        insertSuccess = insertResult.success
                    } catch (e) {
                        console.warn('[STAGE 3] ⚠️ Insert error:', e.message)
                    }
                    
                    if (insertSuccess) {
                        console.log('[STAGE 3] ✅ Org saved successfully:', org.name)
                        successCount++
                    } else {
                        console.error('[STAGE 3] ❌ Failed to save org:', org.name)
                        failedCount++
                    }
                    
                } catch (error) {
                    console.error('[STAGE 3] ❌ Error processing org:', org.name, error)
                    failedCount++
                }
                
                console.log('[STAGE 3] Progress:', i + 1, '/', chain.length)
            }
            
            // === Stage 4: Validate ===
            console.log('[STAGE 4] Validating download results...')
            console.log('[STAGE 4] Statistics:')
            console.log('  - Success:', successCount)
            console.log('  - Failed:', failedCount)
            console.log('  - Total:', chain.length)
            
            if (failedCount > 0) {
                console.warn(`[STAGE 4] ⚠️ ${failedCount} org(s) failed to download`)
            }
            
            console.log('[STAGE 3] downloadOrganisationChain - END')
        },
    }
}
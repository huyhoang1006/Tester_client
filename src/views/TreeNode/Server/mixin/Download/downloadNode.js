import * as demoAPI from '@/api/demo'
import Vue from 'vue'
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
                // ================================================================
                // STAGE 1: SUBSTATION DOWNLOAD
                // ================================================================
                console.log('[STAGE 1] Substation mode - START')
                
                // ================================================================
                // STAGE 1.1: Validate Selected Node
                // ================================================================
                console.log('[STAGE 1.1] Validating selected node...')
                
                const substationId = node.mrid || node.id
                const parentOrgId = node.parentId
                
                // Validate: mrid exists
                if (!substationId) {
                    console.log('[STAGE 1.1] ERROR: No mrid found in node')
                    this.$message.error('Substation ID not found')
                    return
                }
                
                // Validate: parentId exists (need parent organisation)
                if (!parentOrgId) {
                    console.log('[STAGE 1.1] ERROR: No parentId found')
                    this.$message.error('Parent organisation not found. Please select a substation under an organisation.')
                    return
                }
                
                console.log('[STAGE 1.1] Selected substation:', {
                    mrid: substationId,
                    name: node.name,
                    aliasName: node.aliasName,
                    parentId: parentOrgId
                })
                
                // ================================================================
                // STAGE 1.2: Always Download FULL Organisation Chain
                // (Not just parent - download all ancestors to ensure complete chain)
                // ================================================================
                console.log('[STAGE 1.2] Starting FULL Organisation Chain download...')
                console.log('[STAGE 1.2] Parent org ID:', parentOrgId)

                try {
                    // Tìm node parent trong Server Tree
                    const parentNode = this.findNodeById(parentOrgId, this.ownerServerList)

                    if (!parentNode) {
                        console.log('[STAGE 1.2] ERROR: Parent node not found in Server Tree')
                        this.$message.error('Parent organisation not found in Server Tree. Please download from root.')
                        return
                    }

                    console.log('[STAGE 1.2] Found parent node in Server Tree:', {
                        mrid: parentNode.mrid,
                        name: parentNode.name,
                        aliasName: parentNode.aliasName,
                        parentArr: parentNode.parentArr
                    })

                    // Gọi download full organisation chain (bao gồm tất cả ancestors)
                    console.log('[STAGE 1.2] Calling downloadOrganisationChainForParent (FULL CHAIN)...')
                    await this.downloadOrganisationChainForParent(parentNode)
                    console.log('[STAGE 1.2] Full organisation chain downloaded successfully')

                } catch (error) {
                    console.error('[STAGE 1.2] ERROR checking parent:', error)
                    this.$message.error('Error downloading organisation chain: ' + error.message)
                    return
                }
                
                // ================================================================
                // STAGE 1.3: Proceed to prepareSubstationDownloadData (STAGE 2)
                // ================================================================
                console.log('[STAGE 1] All validations passed')
                console.log('[STAGE 1] Calling STAGE 2: prepareSubstationDownloadData')
                
                try {
                    // Gọi Stage 2: Prepare data
                    const { substation, parentOrgId } = await this.prepareSubstationDownloadData(node)
                    
                    console.log('[STAGE 1] Stage 2 completed, calling STAGE 3...')
                    
                    // Gọi Stage 3: Download to DB
                    const result = await this.downloadSubstationToDb(substation, parentOrgId)
                    
                    if (result.success) {
                        this.$message.success('Substation downloaded successfully!')
                    } else {
                        this.$message.error('Download failed: ' + result.message)
                    }
                    
                } catch (error) {
                    console.error('[STAGE 1] Error in substation download:', error)
                    this.$message.error('Substation download failed: ' + error.message)
                }
                
                return
            } else if (node.mode === 'voltageLevel') {
                // ================================================================
                // STAGE 1: VOLTAGE LEVEL DOWNLOAD
                // ================================================================
                console.log('[STAGE 1] VoltageLevel mode - START')
                
                // ================================================================
                // ================================================================
                // STAGE 1.1: Validate Selected Node
                // ================================================================
                console.log('[STAGE 1.1] Validating voltageLevel node...')

                // Validate: mrid exists
                const voltageLevelId = node.mrid || node.id
                if (!voltageLevelId) {
                    console.log('[STAGE 1.1] ERROR: No mrid found in node')
                    this.$message.error('VoltageLevel ID not found')
                    return
                }

                // Validate: parent substation exists
                const parentSubstationId = node.parentId
                if (!parentSubstationId) {
                    console.log('[STAGE 1.1] ERROR: No parentId found')
                    this.$message.error('Parent substation not found')
                    return
                }

                console.log('[STAGE 1.1] Selected voltageLevel:', {
                    mrid: voltageLevelId,
                    name: node.name,
                    aliasName: node.aliasName,
                    parentId: parentSubstationId
                })

                // ================================================================
                // STAGE 1.2: Download FULL Organisation Chain first
                // ================================================================
                console.log('[STAGE 1.2] Starting FULL Organisation Chain download...')

                try {
                    // Find parentSubstation in ServerTree
                    const parentSubstationNode = this.findNodeById(parentSubstationId, this.ownerServerList)

                    if (!parentSubstationNode) {
                        console.log('[STAGE 1.2] ERROR: Parent substation not found in Server Tree')
                        this.$message.error('Parent substation not found in Server Tree.')
                        return
                    }

                    const parentOrgId = parentSubstationNode.parentId

                    if (!parentOrgId) {
                        console.log('[STAGE 1.2] ERROR: Parent org not found')
                        this.$message.error('Parent organisation not found')
                        return
                    }

                    // Find organisation node
                    const orgNode = this.findNodeById(parentOrgId, this.ownerServerList)

                    if (orgNode) {
                        console.log('[STAGE 1.2] Found parent org:', orgNode.name)
                        await this.downloadOrganisationChainForParent(orgNode)
                        console.log('[STAGE 1.2] Full organisation chain downloaded successfully')
                    } else {
                        console.warn('[STAGE 1.2] WARNING: Parent org node not found in Server Tree')
                    }

                } catch (error) {
                    console.error('[STAGE 1.2] Error downloading org chain:', error)
                    this.$message.error('Error downloading organisation chain: ' + error.message)
                }

                // ================================================================
                // STAGE 1.3: Download Parent Substation if not exists
                // ================================================================
                console.log('[STAGE 1.3] Checking parent substation in client tree...')

                try {
                    const parentSubstationNode = this.findNodeById(parentSubstationId, this.ownerServerList)
                    
                    if (parentSubstationNode) {
                        // Check if exists in client tree
                        const existingSubstation = this.findNodeById(parentSubstationId, this.organisationClientList)
                        
                        if (!existingSubstation) {
                            console.log('[STAGE 1.3] Parent substation not in client tree - downloading...')
                            
                            // Download substation
                            const { substation } = await this.prepareSubstationDownloadData(parentSubstationNode)
                            const result = await this.downloadSubstationToDb(substation, parentSubstationNode.parentId)
                            
                            if (!result.success) {
                                console.error('[STAGE 1.3] Failed to download parent substation:', result.message)
                            }
                        } else {
                            console.log('[STAGE 1.3] Parent substation already in client tree')
                        }
                    }

                } catch (error) {
                    console.error('[STAGE 1.3] Error checking parent substation:', error)
                }

                // ================================================================
                // STAGE 1.4: Refresh client tree after downloading parent substation
                // This ensures parent substation is in client tree before voltageLevel download
                // ================================================================
                console.log('[STAGE 1.4] Refreshing client tree after parent substation download...')
                await this.showLocationRoot()

                // ================================================================
                // STAGE 2: Prepare and Download VoltageLevel
                // ================================================================
                console.log('[STAGE 2] Starting prepareVoltageLevelDownloadData')

                try {
                    // Gọi Stage 2: Prepare data
                    const { voltageLevel, parentSubstationId: vlParentSubstationId } = 
                        await this.prepareVoltageLevelDownloadData(node)
                    
                    console.log('[STAGE 2] Data prepared, calling STAGE 3...')
                    
                    // Gọi Stage 3: Download to DB
                    const result = await this.downloadVoltageLevelToDb(voltageLevel, vlParentSubstationId)
                    
                    if (result.success) {
                        this.$message.success('VoltageLevel downloaded successfully!')
                    } else {
                        this.$message.error('Download failed: ' + result.message)
                    }
                    
                } catch (error) {
                    console.error('[STAGE 2] Error in voltageLevel download:', error)
                    this.$message.error('VoltageLevel download failed: ' + error.message)
                }

                return
            } else if (node.mode === 'bay') {
                // ================================================================
                // STAGE 1: BAY DOWNLOAD
                // ================================================================
                console.log('[STAGE 1] Bay mode - START')

                // ================================================================
                // STAGE 1.1: Validate Selected Node
                // ================================================================
                console.log('[STAGE 1.1] Validating Bay node...')

                const bayId = node.mrid || node.id
                if (!bayId) {
                    console.log('[STAGE 1.1] ERROR: No mrid found in node')
                    this.$message.error('Bay ID not found')
                    return
                }

                const parentVoltageLevelId = node.parentId
                if (!parentVoltageLevelId) {
                    console.log('[STAGE 1.1] ERROR: No parentId (VoltageLevel) found')
                    this.$message.error('Parent VoltageLevel not found')
                    return
                }

                console.log('[STAGE 1.1] Selected Bay:', {
                    mrid: bayId,
                    name: node.name,
                    parentId: parentVoltageLevelId
                })

                // ================================================================
                // STAGE 1.2: User Confirmation Dialog
                // ================================================================
                try {
                    await this.$confirm(
                        `Download Bay [${node.name}] + ancestors?`,
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

                // ================================================================
                // STAGE 1.3: Show Progress Loading
                // ================================================================
                const loading = this.$loading({
                    lock: true,
                    text: 'Đang kiểm tra...',
                    spinner: 'el-icon-loading'
                })

                // ================================================================
                // STAGE 1.4: Validate Parent VoltageLevel Exists in ServerTree
                // ================================================================
                console.log('[STAGE 1.4] Validating parent VoltageLevel in ServerTree...')
                loading.setText('Đang kiểm tra VoltageLevel cha...')

                const parentVLNode = this.findNodeById(parentVoltageLevelId, this.ownerServerList)
                if (!parentVLNode) {
                    loading.close()
                    this.$message.error('VoltageLevel cha không tồn tại trong ServerTree')
                    return
                }

                // ================================================================
                // STAGE 1.5: Download FULL Chain: Organisation -> Substation
                // CRITICAL: Download in order - Organisation FIRST, then Substation
                // ================================================================
                console.log('[STAGE 1.5] Starting FULL chain download (Org + Substation)...')
                loading.setText('Đang tải ancestors...')

                try {
                    const parentSubstationId = parentVLNode.parentId
                    console.log('[STAGE 1.5] Parent Substation ID:', parentSubstationId)
                    
                    if (parentSubstationId) {
                        const parentSubstationNode = this.findNodeById(parentSubstationId, this.ownerServerList)
                        console.log('[STAGE 1.5] Parent Substation Node:', parentSubstationNode)
                        
                        if (parentSubstationNode) {
                            // Step 1: Download Organisation FIRST (needed by Substation)
                            const parentOrgId = parentSubstationNode.parentId
                            if (parentOrgId) {
                                const orgNode = this.findNodeById(parentOrgId, this.ownerServerList)
                                if (orgNode) {
                                    console.log('[STAGE 1.5] Step 1: Downloading Organisation chain FIRST...')
                                    await this.downloadOrganisationChainForParent(orgNode)
                                    console.log('[STAGE 1.5] Organisation chain complete')
                                }
                            }
                            
                            // Step 2: Then download Substation (Organisation now exists)
                            console.log('[STAGE 1.5] Step 2: Downloading Substation chain...')
                            const { substation } = await this.prepareSubstationDownloadData(parentSubstationNode)
                            const subResult = await this.downloadSubstationToDb(substation, parentSubstationNode.parentId)
                            console.log('[STAGE 1.5] Substation download result:', subResult)
                        } else {
                            console.warn('[STAGE 1.5] Parent Substation node not found in ServerTree')
                        }
                    } else {
                        console.warn('[STAGE 1.5] No parentSubstationId found')
                    }
                } catch (error) {
                    console.warn('[STAGE 1.5] Chain download warning:', error)
                }

                // Refresh after chain download
                await this.showLocationRoot()

                // ================================================================
                // STAGE 1.6: Download Parent VoltageLevel if Not Exists
                // ================================================================
                console.log('[STAGE 1.6] Checking parent VoltageLevel in client tree...')
                loading.setText('Đang kiểm tra VoltageLevel...')

                try {
                    const existingVL = this.findNodeById(parentVoltageLevelId, this.organisationClientList)
                    if (!existingVL) {
                        console.log('[STAGE 1.6] Parent VoltageLevel not in client tree - downloading...')
                        const { voltageLevel } = await this.prepareVoltageLevelDownloadData(parentVLNode)
                        const result = await this.downloadVoltageLevelToDb(voltageLevel, parentVLNode.parentId)
                        if (!result.success) {
                            console.warn('[STAGE 1.6] VL download warning:', result.message)
                        }
                    } else {
                        console.log('[STAGE 1.6] Parent VoltageLevel already in client tree')
                    }
                } catch (error) {
                    console.error('[STAGE 1.6] Error checking parent VL:', error)
                }

                // ================================================================
                // STAGE 2: Prepare and Download Bay
                // ================================================================
                console.log('[STAGE 2] Starting prepareBayDownloadData')
                loading.setText('Đang tải Bay...')

                try {
                    // Gọi API lấy chi tiết Bay
                    console.log('[STAGE 2] Fetching Bay from API, bayId:', bayId)
                    
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
                            if (retryCount < maxRetries) {
                                console.warn(`[STAGE 2] Retry ${retryCount}/${maxRetries} - invalid response`)
                            }
                        } catch (apiError) {
                            retryCount++
                            console.error(`[STAGE 2] API call failed, retry ${retryCount}/${maxRetries}:`, apiError.message)
                            if (retryCount >= maxRetries) {
                                throw apiError
                            }
                        }
                    }

                    if (!bayData) {
                        loading.close()
                        this.$message.error('Không lấy được dữ liệu từ API')
                        return
                    }

                    const { bay } = await this.prepareBayDownloadData(node, bayData, parentVoltageLevelId)
                    
                    console.log('[STAGE 2] Data prepared, calling STAGE 3...')
                    
                    // Gọi Stage 3: Download to DB
                    const result = await this.downloadBayToDb(bay, parentVoltageLevelId)
                    
                    loading.close()

                    if (result.success) {
                        // Refresh client tree
                        await this.showLocationRoot()
                        this.$message.success(`Bay [${node.name}] + ancestors downloaded successfully!`)
                    } else {
                        this.$message.error('Download failed: ' + result.message)
                    }
                    
                } catch (error) {
                    console.error('[STAGE 2] Error in Bay download:', error)
                    loading.close()
                    this.$message.error('Bay download failed: ' + error.message)
                }

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

        // ================================================================
        // HELPER: Download Organisation Chain for Parent
        // ================================================================
        async downloadOrganisationChainForParent(parentNode) {
            console.log('[downloadOrganisationChainForParent] START')
            console.log('[downloadOrganisationChainForParent] Parent node:', parentNode)
            
            try {
                // Gọi hàm prepareOrganisationDownloadData đã có sẵn
                const { chain } = await this.prepareOrganisationDownloadData(parentNode)
                
                console.log('[downloadOrganisationChainForParent] Chain prepared:', chain)
                console.log('[downloadOrganisationChainForParent] Chain length:', chain.length)
                
                // Gọi download
                await this.downloadOrganisationChain(chain)
                
                // ================================================================
                // Add downloaded organisations to client tree
                // This ensures parent org is available when adding substations
                // ================================================================
                console.log('[downloadOrganisationChainForParent] Adding orgs to client tree...')
                
                // Get Root org from client tree
                const rootOrg = this.organisationClientList?.find(org => org.mrid === '00000000-0000-0000-0000-000000000000')
                
                if (rootOrg) {
                    // Initialize children if not exists
                    if (!rootOrg.children) {
                        rootOrg.children = []
                    }
                    
                    // Add each downloaded org to Root's children
                    for (const org of chain) {
                        const orgNode = {
                            mrid: org.mrid,
                            name: org.name,
                            aliasName: org.aliasName || org.name,
                            parentId: '00000000-0000-0000-0000-000000000000',
                            mode: 'organisation'
                        }
                        
                        // Check if already exists
                        const existingIndex = rootOrg.children.findIndex(c => c.mrid === org.mrid)
                        if (existingIndex >= 0) {
                            console.log('[downloadOrganisationChainForParent] Org already in tree:', org.name)
                            rootOrg.children[existingIndex] = orgNode
                        } else {
                            console.log('[downloadOrganisationChainForParent] Adding org to tree:', org.name)
                            rootOrg.children.push(orgNode)
                        }
                    }
                    
                    // Expand Root to show
                    this.$set(rootOrg, 'expanded', true)
                    console.log('[downloadOrganisationChainForParent] Orgs added to client tree')
                } else {
                    console.warn('[downloadOrganisationChainForParent] Root org not found in client tree, skipping tree addition')
                }
                
                console.log('[downloadOrganisationChainForParent] SUCCESS')
                
            } catch (error) {
                console.error('[downloadOrganisationChainForParent] ERROR:', error)
                throw error
            }
        },

        // ================================================================
        // STAGE 2: Prepare Substation Download Data
        // ================================================================
        async prepareSubstationDownloadData(node) {
            // [STAGE 2.0] START
            console.log('[STAGE 2] prepareSubstationDownloadData - START')
            console.log('[STAGE 2] Input node:', {
                mrid: node.mrid,
                name: node.name,
                parentId: node.parentId
            })
            console.log('[STAGE 2] Function started')
            
            // ============================================================
            // STAGE 2.1: Extract thông tin từ node
            // ============================================================
            console.log('[STAGE 2.1] Extracting node information...')
            
            const substationId = node.mrid || node.id
            const parentOrgId = node.parentId
            
            console.log('[STAGE 2.1] substationId from node.mrid:', node.mrid)
            console.log('[STAGE 2.1] substationId from node.id:', node.id)
            console.log('[STAGE 2.1] Final substationId:', substationId)
            console.log('[STAGE 2.1] parentOrgId:', parentOrgId)
            console.log('[STAGE 2.1] node.name:', node.name)
            console.log('[STAGE 2.1] node.aliasName:', node.aliasName)
            
            // Validate
            if (!substationId) {
                console.error('[STAGE 2.1] ERROR: Substation ID not found')
                throw new Error('Substation ID not found')
            }
            console.log('[STAGE 2.1] Validation: substationId required - PASS')
            
            if (!parentOrgId) {
                console.error('[STAGE 2.1] ERROR: Parent organisation ID not found')
                throw new Error('Parent organisation ID not found')
            }
            console.log('[STAGE 2.1] Validation: parentOrgId required - PASS')
            
            // ============================================================
            // STAGE 2.2: Gọi API lấy chi tiết substation
            // ============================================================
            console.log('[STAGE 2.2] Fetching substation from API...')
            console.log('[STAGE 2.2] API endpoint: /api/substation/cim/' + substationId)
            
            let substationData = null
            
            try {
                console.log('[STAGE 2.2] API call initiated')
                const response = await demoAPI.getSubstationById(substationId)
                console.log('[STAGE 2.2] API call completed')
                
                // DEBUG: Log full response để xem structure
                console.log('[STAGE 2.2] Full response:', response)
                console.log('[STAGE 2.2] Response type:', typeof response)
                
                // Axios interceptor unwrap: response = { status, success, data }
                // Nên: response.status, response.success, response.data
                console.log('[STAGE 2.2] Response.status:', response?.status)
                console.log('[STAGE 2.2] Response.success:', response?.success)
                console.log('[STAGE 2.2] Response.data:', response?.data)
                
                // ============================================================
                // STAGE 2.3: Xử lý Response + FALLBACK
                // ============================================================
                console.log('[STAGE 2.3] Processing API response...')
                
                // Axios interceptor đã unwrap response rồi!
                // Response = trực tiếp là data object {name, aliasName, mRID, ...}
                // Không cần .data hay .success nữa
                
                // Check response có dữ liệu (có name field)
                if (response && response.name) {
                    substationData = response
                    console.log('[STAGE 2.3] Response is unwrapped data object: true')
                    console.log('[STAGE 2.3] Response has name: true')
                    
                    console.log('[STAGE 2.3] Original aliasName:', substationData.aliasName)
                    console.log('[STAGE 2.3] Original name:', substationData.name)
                    
                    // === FALLBACK LOGIC ===
                    console.log('[STAGE 2.3] Checking aliasName...')
                    if (!substationData.aliasName || substationData.aliasName === null) {
                        console.log('[STAGE 2.3] ⚠️ ALIASNAME IS NULL - Applying fallback')
                        substationData.aliasName = substationData.name
                        console.log('[STAGE 2.3] Fallback: aliasName = name')
                    }
                    
                    console.log('[STAGE 2.3] New aliasName:', substationData.aliasName)
                    
                    console.log('[STAGE 2.3] Final values:')
                    console.log('[STAGE 2.3]   - name:', substationData.name)
                    console.log('[STAGE 2.3]   - aliasName:', substationData.aliasName, '(from fallback)')
                    console.log('[STAGE 2.3]   - mRID:', substationData.mRID)
                    
                    console.log('[STAGE 2.3] Response processed successfully')
                    
                } else {
                    console.log('[STAGE 2.3] WARNING: No valid data in response, using fallback')
                    console.log('[STAGE 2.3] Response structure:', {
                        exists: !!response,
                        hasName: !!response?.name,
                        hasAliasName: !!response?.aliasName
                    })
                    substationData = null
                }
                
            } catch (error) {
                console.error('[STAGE 2.2] ERROR fetching substation:', error)
                throw new Error('Failed to fetch substation: ' + error.message)
            }
            
            // ============================================================
            // STAGE 2.4: Chuẩn bị substation object
            // ============================================================
            console.log('[STAGE 2.4] Preparing substation object...')
            
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
            
            console.log('[STAGE 2.4] Setting id:', substationObj.id)
            console.log('[STAGE 2.4] Setting mrid:', substationObj.mrid)
            console.log('[STAGE 2.4] Setting name:', substationObj.name)
            console.log('[STAGE 2.4] Setting aliasName:', substationObj.aliasName)
            console.log('[STAGE 2.4] Setting parentId:', substationObj.parentId)
            console.log('[STAGE 2.4] Setting _type:', substationObj._type)
            console.log('[STAGE 2.4] Substation object prepared')
            
            // ============================================================
            // STAGE 2.5: Kết thúc
            // ============================================================
            console.log('[STAGE 2] Substation prepared successfully')
            console.log('[STAGE 2] Output:', {
                substation: substationObj,
                parentOrgId: String(parentOrgId)
            })
            console.log('[STAGE 2] prepareSubstationDownloadData - END')
            
            return {
                substation: substationObj,
                parentOrgId: String(parentOrgId)
            }
        },

        // ================================================================
        // STAGE 3: Download Substation to DB
        // ================================================================
        async downloadSubstationToDb(substation, parentOrgId) {
            console.log('[STAGE 3] downloadSubstationToDb - START')
            console.log('[STAGE 3] Substation:', substation.name, substation.mrid)
            console.log('[STAGE 3] Parent Org ID:', parentOrgId)
            
            // [3.1] IMPORT MAPPERS & ENTITY
            console.log('[STAGE 3.1] Importing mappers and entity...')
            const SubstationServerMapper = require('@/views/Mapping/ServerToDTO/Substation/index.js')
            const SubstationMapper = require('@/views/Mapping/Substation/index.js')
            // eslint-disable-next-line no-unused-vars
            const SubstationEntity = require('@/views/Flatten/Substation/index.js').default
            console.log('[STAGE 3.1] Import completed')
            
            // [3.2] TRANSFORM SERVER DATA
            console.log('[STAGE 3.2] Transforming server data...')
            const serverData = {
                ...substation._serverData,
                mRID: substation.mrid,
            }
            console.log('[STAGE 3.2] Server data transformed:')
            console.log('[STAGE 3.2]   - mRID:', serverData.mRID)
            console.log('[STAGE 3.2]   - name:', serverData.name)
            console.log('[STAGE 3.2]   - aliasName:', serverData.aliasName)
            
            // [3.3] MAP SERVER → DTO
            console.log('[STAGE 3.3] Mapping server to DTO...')
            const dto = SubstationServerMapper.mapServerToDto(serverData)
            
            // QUAN TRỌNG: Gán organisationId (parentOrgId)
            dto.organisationId = parentOrgId
            
            // FIX: Gán userId để query getSubstationsInOrganisationForUser hoạt động khi reload app
            dto.userId = this.$store.state.user.user_id
            
            // FIX: Generate userIdentifiedObjectId để insert vào table user_identified_object
            dto.userIdentifiedObjectId = this.generateUuid()
            
            // FIX: Generate organisationPsrId để insert vào table organisation_psr
            dto.organisationPsrId = this.generateUuid()
            
            console.log('[STAGE 3.3] DTO mapped:')
            console.log('[STAGE 3.3]   - dto.subsId:', dto.subsId)
            console.log('[STAGE 3.3]   - dto.name:', dto.name)
            console.log('[STAGE 3.3]   - dto.organisationId:', dto.organisationId)
            console.log('[STAGE 3.3]   - dto.userId:', dto.userId)
            console.log('[STAGE 3.3]   - dto.userIdentifiedObjectId:', dto.userIdentifiedObjectId)
            console.log('[STAGE 3.3]   - dto.organisationPsrId:', dto.organisationPsrId)
            console.log('[STAGE 3.3]   - dto.locationId:', dto.locationId)
            
            // [3.4] MAP DTO → ENTITY
            console.log('[STAGE 3.4] Mapping DTO to Entity...')
            const entity = SubstationMapper.mapDtoToEntity(dto)
            console.log('[STAGE 3.4] Entity mapped:')
            console.log('[STAGE 3.4]   - entity.substation.mrid:', entity.substation.mrid)
            console.log('[STAGE 3.4]   - entity.substation.name:', entity.substation.name)
            console.log('[STAGE 3.4]   - entity.organisationLocation.organisation_id:', entity.organisationLocation.organisation_id)
            
            // [3.5] CHECK EXISTS IN DB
            console.log('[STAGE 3.5] Checking if entity exists in DB...')
            let exists = false
            try {
                const existingResult = await window.electronAPI.getSubstationEntityByMrid(substation.mrid)
                exists = existingResult.success && existingResult.data
                console.log('[STAGE 3.5] Existing check result:')
                console.log('[STAGE 3.5]   - success:', existingResult.success)
                console.log('[STAGE 3.5]   - data:', existingResult.data ? 'exists' : 'null')
            } catch (e) {
                console.error('[STAGE 3.5] ERROR checking exists:', e.message)
            }
            
            // [3.6] DELETE - Skip vì INSERT có ON CONFLICT DO UPDATE
            // Insert sẽ tự động update nếu đã tồn tại
            if (exists) {
                console.log('[STAGE 3.6] Entity exists - skipping delete (insert will upsert)')
            } else {
                console.log('[STAGE 3.6] No existing entity, ready to insert')
            }
            
            // [3.7] INSERT TO DB
            console.log('[STAGE 3.7] Inserting entity to DB...')
            let insertSuccess = false
            try {
                const insertResult = await window.electronAPI.insertSubstationEntity(entity)
                console.log('[STAGE 3.7] Insert result:')
                console.log('[STAGE 3.7]   - success:', insertResult.success)
                console.log('[STAGE 3.7]   - message:', insertResult.message)
                insertSuccess = insertResult.success
            } catch (e) {
                console.error('[STAGE 3.7] ERROR inserting:', e.message)
            }
            
            // [3.8] RESULT SUMMARY
            console.log('[STAGE 3.8] Result summary:')
            console.log('[STAGE 3.8]   - Insert success:', insertSuccess)
            
            if (insertSuccess) {
                console.log('[STAGE 3] ✅ Substation downloaded successfully:', substation.name)
                
                // [3.9] REFRESH CLIENT TREE - Add substation directly to tree
                console.log('[STAGE 3.9] Adding substation to client tree...')
                
                // [3.9] DEBUG: Log structure of organisationClientList
                console.log('[STAGE 3.9] DEBUG - parentOrgId type:', typeof parentOrgId, 'value:', parentOrgId)
                console.log('[STAGE 3.9] DEBUG - organisationClientList length:', this.organisationClientList?.length)
                if (this.organisationClientList && this.organisationClientList.length > 0) {
                    console.log('[STAGE 3.9] DEBUG - First org in list:', {
                        mrid: this.organisationClientList[0].mrid,
                        name: this.organisationClientList[0].name,
                        mode: this.organisationClientList[0].mode,
                        parentId: this.organisationClientList[0].parentId,
                        children: this.organisationClientList[0].children?.length
                    })
                }
                
                console.log('[STAGE 3.9] Finding parent org in client tree, parentOrgId:', parentOrgId)
                
                const parentOrgNode = this.findNodeById(parentOrgId, this.organisationClientList)
                console.log('[STAGE 3.9] Parent org node found:', parentOrgNode ? 'yes' : 'no')
                
                if (parentOrgNode) {
                    // Create new node for substation
                    const newSubstationNode = {
                        mrid: substation.mrid,
                        name: substation.name,
                        aliasName: substation.aliasName,
                        parentId: parentOrgId,
                        mode: 'substation'
                    }
                    
                    console.log('[STAGE 3.9] Adding substation node to parent org children')
                    console.log('[STAGE 3.9] New node:', newSubstationNode)
                    
                    // Add to children of parent org
                    const children = Array.isArray(parentOrgNode.children) ? [...parentOrgNode.children] : []
                    
                    // Check if already exists
                    const existingIndex = children.findIndex(c => c.mrid === substation.mrid)
                    if (existingIndex >= 0) {
                        console.log('[STAGE 3.9] Substation already exists in children, updating...')
                        children[existingIndex] = newSubstationNode
                    } else {
                        console.log('[STAGE 3.9] Pushing new substation to children')
                        children.push(newSubstationNode)
                    }
                    
                    Vue.set(parentOrgNode, 'children', children)
                    
                    // Expand parent org to show
                    this.$set(parentOrgNode, 'expanded', true)
                    
                    console.log('[STAGE 3.9] ✅ Substation added to client tree successfully')
                } else {
                    // Fallback: call showLocationRoot
                    console.log('[STAGE 3.9] Parent org not in tree, calling showLocationRoot()...')
                    await this.showLocationRoot()
                    console.log('[STAGE 3.9] Client tree refreshed (full reload)')
                }
                
                return { success: true, message: 'Download successful' }
            } else {
                console.error('[STAGE 3] ❌ Failed to download substation:', substation.name)
                return { success: false, message: 'Download failed' }
            }
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
                    
                    // Fetch từ API - LUÔN dùng API, không dùng cache
                    let ancestorData = null
                    try {
                        const response = await demoAPI.getOrganisationById(ancestorId)
                        ancestorData = response.data || response
                        
                        // FIX: Nếu mRID null, dùng ancestorId làm mRID
                        if (!ancestorData.mRID) {
                            ancestorData.mRID = ancestorId
                        }
                        if (!ancestorData.organisation) {
                            ancestorData.organisation = {}
                        }
                        if (!ancestorData.organisation.mRID) {
                            ancestorData.organisation.mRID = ancestorId
                        }
                        if (!ancestorData.organisation.parentOrganisation) {
                            ancestorData.organisation.parentOrganisation = assignedParentId
                        }
                        
                        console.log('[STAGE 2.1] API response for', ancestorId, ':', ancestorData)
                        
                    } catch (e) {
                        // NẾU FAIL THÌ BÁO FAIL LUÔN
                        console.error('[STAGE 2.1] ❌ API call FAILED for ancestor:', ancestorId, '- Error:', e.message)
                        throw new Error(`Failed to fetch organisation ${ancestorId}: ${e.message}`)
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
            
            // Fetch selected org data - LUÔN gọi API để lấy full details (bao gồm aliasName)
            let orgData = null
            console.log('[STAGE 2.1] DEBUG: Fetching full org data for selected node:', selectedOrgId)
            try {
                // LUÔN gọi getOrganisationById để lấy chi tiết đầy đủ (bao gồm aliasName)
                const response = await demoAPI.getOrganisationById(selectedOrgId)
                console.log('[STAGE 2.1] DEBUG: Full API response:', response)
                
                // API trả về data trực tiếp (không có .data wrapper)
                // Check if response IS the data (direct) or wrapped
                if (response && typeof response === 'object' && response.aliasName) {
                    // Direct response - use it directly
                    orgData = response
                    console.log('[STAGE 2.1] DEBUG: Using direct response')
                } else if (response?.data?.data) {
                    // Double nested: response.data.data
                    orgData = response.data.data
                    console.log('[STAGE 2.1] DEBUG: Using nested response.data.data')
                } else if (response?.data) {
                    // Single wrapped: response.data
                    orgData = response.data
                    console.log('[STAGE 2.1] DEBUG: Using response.data')
                } else {
                    console.log('[STAGE 2.1] DEBUG: No valid data in response, using fallback')
                }
            } catch (e) {
                console.warn('[STAGE 2.1] Could not fetch selected org:', selectedOrgId, e.message)
                // Fallback về node._serverData nếu API fail
                if (node._serverData) {
                    orgData = node._serverData
                }
            }
            
            console.log('[STAGE 2.1] DEBUG: orgData to be stored:', orgData)
            
            // FIX: If parentArr is empty and parentId is empty, this is a top-level org
            // Use existing CLIENT_ROOT variable
            let finalParentId = node.parentId || prevParentId
            
            // Check if this is a top-level organisation (parentArr empty + parentId empty)
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
                    
                    // FIX: Clear positionPoints nếu all null để tránh FK constraint error
                    const rawPositionPoints = org._serverData?.positionPoints || []
                    const hasValidPositionData = rawPositionPoints.some(p => 
                        p.xposition !== null || p.yposition !== null || p.zposition !== null
                    )
                    console.log('[STAGE 3] Raw positionPoints:', rawPositionPoints)
                    console.log('[STAGE 3] Has valid position data:', hasValidPositionData)
                    console.log('[STAGE 3] DEBUG: org._serverData:', org._serverData)
                    
                    // Transform data để match với mapper expectations
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
                        // Chỉ set positionPoints nếu có data thực, không thì empty array
                        positionPoints: hasValidPositionData ? rawPositionPoints : []
                    }
                    
                    console.log('[STAGE 3] Transformed serverData:', serverData)
                    
                    const dto = OrganisationServerMapper.mapServerToDto(serverData)
                    
                    // FIX: Preserve parentId và organisationId từ chain (override mapper result)
                    dto.parentId = org.parentId
                    dto.organisationId = org.mrid
                    
                    console.log('[STAGE 3] DTO mapped')
                    console.log('[STAGE 3] DTO parentId:', dto.parentId)
                    console.log('[STAGE 3] DTO organisationId:', dto.organisationId)
                    console.log('[STAGE 3] DTO name:', dto.name)
                    console.log('[STAGE 3] DTO aliasName:', dto.aliasName)
                    
                    // === CHECKPOINT 2: Map DTO → Entity ===
                    console.log('[STAGE 3] Step 2: Mapping DTO to Entity...')
                    const entity = OrganisationMapper.OrgDtoToOrgEntity(dto)
                    
                    // DEBUG: Log entity details
                    console.log('[STAGE 3] Entity mapped - DEBUG:')
                    console.log('[STAGE 3]   entity.organisation.mrid:', entity.organisation.mrid)
                    console.log('[STAGE 3]   entity.organisation.name:', entity.organisation.name)
                    console.log('[STAGE 3]   entity.organisation.alias_name:', entity.organisation.alias_name)
                    console.log('[STAGE 3]   entity.organisation.parent_organisation:', entity.organisation.parent_organisation)
                    console.log('[STAGE 3]   Full entity:', entity)
                    
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

        // ================================================================
        // STAGE 2: Prepare VoltageLevel Download Data
        // ================================================================
        async prepareVoltageLevelDownloadData(node) {
            console.log('[STAGE 2] prepareVoltageLevelDownloadData - START')
            console.log('[STAGE 2] Input node:', {
                mrid: node.mrid,
                name: node.name,
                parentId: node.parentId
            })

            const voltageLevelId = node.mrid || node.id
            if (!voltageLevelId) {
                throw new Error('VoltageLevel ID not found')
            }

            // Gọi API lấy chi tiết voltageLevel
            console.log('[STAGE 2] Fetching voltageLevel from API, parentSubstationId:', node.parentId)
            
            let voltageLevelData = null
            try {
                const response = await demoAPI.getVoltageLevelBySubstationId(node.parentId)
                console.log('[STAGE 2] API response:', response)
                
                // Find voltageLevel with matching mRID
                if (Array.isArray(response)) {
                    voltageLevelData = response.find(vl => 
                        vl.mRID === voltageLevelId || 
                        vl.mrid === voltageLevelId ||
                        vl.id === voltageLevelId
                    )
                } else if (response && (response.mRID === voltageLevelId || response.mrid === voltageLevelId)) {
                    voltageLevelData = response
                }
                
                console.log('[STAGE 2] Found voltageLevel data:', voltageLevelData)
                
            } catch (error) {
                console.error('[STAGE 2] ERROR fetching voltageLevel:', error)
                throw new Error('Failed to fetch voltageLevel from server: ' + error.message)
            }

            if (!voltageLevelData) {
                console.warn('[STAGE 2] WARNING: voltageLevel not found in API response, using node data')
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

            console.log('[STAGE 2] VoltageLevel prepared:', {
                mrid: voltageLevelObj.mrid,
                name: voltageLevelObj.name,
                aliasName: voltageLevelObj.aliasName,
                parentId: voltageLevelObj.parentId
            })
            console.log('[STAGE 2] prepareVoltageLevelDownloadData - END')

            return {
                voltageLevel: voltageLevelObj,
                parentSubstationId: node.parentId
            }
        },

        // ================================================================
        // STAGE 3: Download VoltageLevel to DB
        // ================================================================
        async downloadVoltageLevelToDb(voltageLevel, parentSubstationId) {
            console.log('[STAGE 3] downloadVoltageLevelToDb - START')
            console.log('[STAGE 3] VoltageLevel:', voltageLevel.name, voltageLevel.mrid)
            console.log('[STAGE 3] Parent Substation ID:', parentSubstationId)

            // [3.1] IMPORT MAPPERS & ENTITY
            console.log('[STAGE 3.1] Importing mappers and entity...')
            const VoltageLevelServerMapper = require('@/views/Mapping/ServerToDTO/VoltageLevel/index.js')
            const VoltageLevelMapper = require('@/views/Mapping/VoltageLevel/index.js')
            // eslint-disable-next-line no-unused-vars
            const VoltageLevelEntity = require('@/views/Flatten/VoltageLevel/index.js').default
            console.log('[STAGE 3.1] Import completed')

            // [3.2] TRANSFORM SERVER DATA
            console.log('[STAGE 3.2] Transforming server data...')
            const serverData = {
                ...voltageLevel._serverData,
                mRID: voltageLevel.mrid,
                substation: { mRID: parentSubstationId }
            }
            console.log('[STAGE 3.2] Server data transformed:')
            console.log('[STAGE 3.2]   - mRID:', serverData.mRID)
            console.log('[STAGE 3.2]   - name:', serverData.name)

            // [3.3] MAP SERVER → DTO
            console.log('[STAGE 3.3] Mapping server to DTO...')
            const dto = VoltageLevelServerMapper.mapServerToDto(serverData)
            
            // QUAN TRỌNG: Gán substationId (parentSubstationId)
            dto.substationId = parentSubstationId
            
            // FIX: Generate userIdentifiedObjectId để insert vào table user_identified_object
            dto.userIdentifiedObjectId = this.generateUuid()
            
            console.log('[STAGE 3.3] DTO mapped:')
            console.log('[STAGE 3.3]   - dto.voltageLevelId:', dto.voltageLevelId)
            console.log('[STAGE 3.3]   - dto.name:', dto.name)
            console.log('[STAGE 3.3]   - dto.substationId:', dto.substationId)
            console.log('[STAGE 3.3]   - dto.userIdentifiedObjectId:', dto.userIdentifiedObjectId)

            // [3.4] MAP DTO → ENTITY
            console.log('[STAGE 3.4] Mapping DTO to Entity...')
            const entity = VoltageLevelMapper.volDtoToVolEntity(dto)
            console.log('[STAGE 3.4] Entity mapped:')
            console.log('[STAGE 3.4]   - entity.voltageLevel.mrid:', entity.voltageLevel?.mrid)
            console.log('[STAGE 3.4]   - entity.voltageLevel.name:', entity.voltageLevel?.name)
            console.log('[STAGE 3.4]   - entity.voltageLevelSubstation.substation_id:', entity.voltageLevelSubstation?.substation_id)

            // [3.5] CHECK EXISTS IN DB
            console.log('[STAGE 3.5] Checking if entity exists in DB...')
            // Note: insertVoltageLevelEntity will upsert, no need to get oldEntity

            // [3.6] INSERT TO DB
            console.log('[STAGE 3.6] Inserting entity to DB...')
            let insertSuccess = false
            try {
                const insertResult = await window.electronAPI.insertVoltageLevelEntity(entity)
                console.log('[STAGE 3.6] Insert result:')
                console.log('[STAGE 3.6]   - success:', insertResult.success)
                console.log('[STAGE 3.6]   - message:', insertResult.message)
                insertSuccess = insertResult.success
            } catch (e) {
                console.error('[STAGE 3.6] ERROR inserting:', e.message)
            }

            // [3.7] RESULT SUMMARY
            console.log('[STAGE 3.7] Result summary:')
            console.log('[STAGE 3.7]   - Insert success:', insertSuccess)

            if (insertSuccess) {
                console.log('[STAGE 3] ✅ VoltageLevel downloaded successfully:', voltageLevel.name)

                // [3.8] Add to ClientTree
                console.log('[STAGE 3.8] Adding voltageLevel to client tree...')
                await this.addVoltageLevelToClientTree(voltageLevel, parentSubstationId)

                return { success: true, message: 'Download successful' }
            } else {
                console.error('[STAGE 3] ❌ Failed to download voltageLevel:', voltageLevel.name)
                return { success: false, message: 'Download failed' }
            }
        },

        // ================================================================
        // STAGE 3.9: Add VoltageLevel to ClientTree
        // ================================================================
        async addVoltageLevelToClientTree(voltageLevel, parentSubstationId) {
            console.log('[STAGE 3.9] Adding voltageLevel to client tree...')
            console.log('[STAGE 3.9] voltageLevel:', voltageLevel.name, voltageLevel.mrid)
            console.log('[STAGE 3.9] parentSubstationId:', parentSubstationId)

            // Find parent substation in client tree
            const parentNode = this.findNodeById(parentSubstationId, this.organisationClientList)
            
            console.log('[STAGE 3.9] Parent node found:', parentNode ? 'yes' : 'no')

            if (parentNode) {
                const children = Array.isArray(parentNode.children) ? [...(parentNode.children || [])] : []
                
                const newVoltageLevelNode = {
                    mrid: voltageLevel.mrid,
                    name: voltageLevel.name,
                    aliasName: voltageLevel.aliasName,
                    parentId: parentSubstationId,
                    mode: 'voltageLevel'
                }

                console.log('[STAGE 3.9] New voltageLevel node:', newVoltageLevelNode)

                const existingIndex = children.findIndex(c => c.mrid === voltageLevel.mrid)
                if (existingIndex >= 0) {
                    console.log('[STAGE 3.9] VoltageLevel already exists in children, updating...')
                    children[existingIndex] = newVoltageLevelNode
                } else {
                    console.log('[STAGE 3.9] Pushing new voltageLevel to children')
                    children.push(newVoltageLevelNode)
                }

                Vue.set(parentNode, 'children', children)
                this.$set(parentNode, 'expanded', true)

                console.log('[STAGE 3.9] ✅ VoltageLevel added to client tree successfully')
            } else {
                console.warn('[STAGE 3.9] Parent substation not found in client tree')
                console.log('[STAGE 3.9] Refreshing client tree...')
                await this.showLocationRoot()
            }
        },

        // ================================================================
        // BAY DOWNLOAD: Prepare Bay Download Data
        // ================================================================
        async prepareBayDownloadData(node, bayServerData, parentVoltageLevelId) {
            console.log('[STAGE 2] prepareBayDownloadData - START')
            console.log('[STAGE 2] Input node:', {
                mrid: node.mrid,
                name: node.name,
                parentId: parentVoltageLevelId
            })

            const bayId = node.mrid || node.id
            if (!bayId) {
                throw new Error('Bay ID not found')
            }

            // Import Bay mapper
            const BayServerMapper = require('@/views/Mapping/ServerToDTO/Bay/index.js')

            // Transform server data
            const serverData = {
                ...bayServerData,
                mRID: bayId,
                voltageLevel: { mRID: parentVoltageLevelId }
            }

            // Map to DTO
            const dto = BayServerMapper.mapServerToDto(serverData)

            console.log('[STAGE 2] Bay DTO mapped:', {
                bayId: dto.bayId,
                name: dto.name,
                voltage_level: dto.voltage_level
            })

            // Prepare Bay object for DB
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

            console.log('[STAGE 2] Bay prepared:', {
                mrid: bayObj.mrid,
                name: bayObj.name,
                voltage_level: bayObj.voltage_level
            })
            console.log('[STAGE 2] prepareBayDownloadData - END')

            return {
                bay: bayObj,
                parentVoltageLevelId: parentVoltageLevelId
            }
        },

        // ================================================================
        // BAY DOWNLOAD: Download Bay to DB
        // ================================================================
        async downloadBayToDb(bay, parentVoltageLevelId) {
            console.log('[STAGE 3] downloadBayToDb - START')
            console.log('[STAGE 3] Bay:', bay.name, bay.mrid)
            console.log('[STAGE 3] Parent VoltageLevel ID:', parentVoltageLevelId)

            try {
                // [3.1] Check if Bay already exists
                console.log('[STAGE 3.1] Checking if Bay exists in DB...')
                const existingBay = await window.electronAPI.getBayEntityByMrid(bay.mrid)
                
                if (existingBay && existingBay.success && existingBay.data) {
                    console.log('[STAGE 3.1] Bay already exists, will update')
                }

                // [3.2] Insert/Update Bay via IPC
                console.log('[STAGE 3.2] Inserting/Updating Bay to DB...')
                
                const entityData = {
                    mrid: bay.mrid,
                    name: bay.name,
                    bay_energy_meas_flag: bay.bay_energy_meas_flag || '',
                    bay_power_meas_flag: bay.bay_power_meas_flag || '',
                    breaker_configuration: bay.breaker_configuration || '',
                    bus_bar_configuration: bay.bus_bar_configuration || '',
                    voltage_level: parentVoltageLevelId,
                    substation: null // Will be set via voltageLevel relationship
                }

                const insertResult = await window.electronAPI.insertBayEntity(entityData)
                
                if (!insertResult.success) {
                    console.error('[STAGE 3.2] Bay insert failed:', insertResult.message)
                    return { success: false, message: insertResult.message }
                }

                console.log('[STAGE 3.2] ✅ Bay inserted successfully:', bay.name)

                // [3.3] Add Bay to ClientTree
                console.log('[STAGE 3.3] Adding Bay to client tree...')
                
                const parentNode = this.findNodeById(parentVoltageLevelId, this.organisationClientList)
                
                if (parentNode) {
                    if (!parentNode.children) {
                        parentNode.children = []
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
                        console.log('[STAGE 3.3] Bay already exists in children, updating...')
                        children[existingIndex] = newBayNode
                    } else {
                        console.log('[STAGE 3.3] Pushing new Bay to children')
                        children.push(newBayNode)
                    }

                    Vue.set(parentNode, 'children', children)
                    this.$set(parentNode, 'expanded', true)

                    console.log('[STAGE 3.3] ✅ Bay added to client tree successfully')
                } else {
                    console.warn('[STAGE 3.3] Parent VoltageLevel not found in client tree')
                }

                console.log('[STAGE 3] ✅ Bay downloaded successfully:', bay.name)
                return { success: true, message: 'Bay downloaded successfully' }

            } catch (error) {
                console.error('[STAGE 3] ❌ Failed to download Bay:', error)
                return { success: false, message: error.message }
            }
        },
    }
}
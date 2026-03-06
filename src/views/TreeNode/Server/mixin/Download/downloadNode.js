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
    }
}
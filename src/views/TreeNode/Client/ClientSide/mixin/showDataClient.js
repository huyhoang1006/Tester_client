
import * as SubstationMapping from '@/views/Mapping/Substation/index'


export default {
    methods: {
        async doubleClickNode(node) {
            await this.showDataClient(node)
            // showPropertiesDataClient được gọi tự động từ single click event
            // Không cần gọi lại ở đây để tránh duplicate
            // await this.showPropertiesDataClient(node)
        },
        async showDataClient(node) {
            try {
                // Tạo bản sao của node để đảm bảo reactivity
                const newNode = { ...node }
                const index = this.tabsClient.findIndex((item) => item.mrid === newNode.mrid)
                if (index !== -1) {
                    // Nếu tab đã tồn tại, active nó
                    this.activeTabClient = newNode
                    const clientTabs = this.getClientTabsRef ? this.getClientTabsRef() : this.$refs.clientTabs
                    if (clientTabs) {
                        clientTabs.selectTab(this.activeTabClient, index)
                    }
                } else {
                    const newTabs = [...this.tabsClient] // Tạo mảng mới
                    if (this.activeTabClient?.mrid) {
                        const index = newTabs.findIndex((item) => item.mrid === this.activeTabClient.mrid)
                        newTabs.splice(index + 1, 0, newNode)
                    } else {
                        newTabs.push(newNode)
                    }
                    // Gán lại để trigger reactivity
                    this.tabsClient = newTabs
                    this.activeTabClient = newNode
                    const clientTabs = this.getClientTabsRef ? this.getClientTabsRef() : this.$refs.clientTabs
                    if (clientTabs) {
                        clientTabs.selectTab(this.activeTabClient, newTabs.length - 1)
                        
                        // ✅ Nếu node có cache (_cachedEntityData), truyền vào như savedData
                        if (newNode._cachedEntityData) {
                            clientTabs.loadData(newNode, newTabs.length - 1, newNode._cachedEntityData)
                        } else {
                            clientTabs.loadData(newNode, newTabs.length - 1)
                        }
                    }
                }
            } catch (error) {
                this.$message.error('Some error occur when loading data')
                console.error(error)
            }
        },
        async showPropertiesDataClient(node) {
            // Debounce: Tránh gọi API nhiều lần trong thời gian ngắn
            const now = Date.now()
            const lastCall = this._lastPropertiesCall || 0
            const isSameNode = this._lastPropertiesNode?.mrid === node.mrid
            
            // Nếu cùng node và gọi trong vòng 300ms → skip
            if (isSameNode && (now - lastCall) < 300) {
                return
            }
            
            // Update tracking
            this._lastPropertiesCall = now
            this._lastPropertiesNode = node
            
            this.assetPropertySignClient = false
            this.jobPropertySignClient = false
            if (node.asset != undefined) {
                this.assetPropertySignClient = true
                
                let assetDetailData
                
                // ✅ Ưu tiên dùng _cachedEntityData nếu có (data mới từ save)
                if (node._cachedEntityData) {
                    // DTO structure: data.properties.serial_no, data.properties.manufacturer, etc.
                    // Cần flatten để mapping function có thể đọc được
                    // Lưu ý: Một số asset dùng manufacturer_year, một số dùng manufacturing_year
                    assetDetailData = {
                        serial_number: node._cachedEntityData.properties?.serial_no,
                        manufacturer: node._cachedEntityData.properties?.manufacturer,
                        manufacturer_type: node._cachedEntityData.properties?.manufacturer_type,
                        // Hỗ trợ cả 2 tên field: manufacturer_year (8 assets) và manufacturing_year (3 assets: Disconnector, Capacitor, Reactor)
                        manufacturer_year: node._cachedEntityData.properties?.manufacturer_year || node._cachedEntityData.properties?.manufacturing_year,
                        country_of_origin: node._cachedEntityData.properties?.country_of_origin,
                        apparatus_id: node._cachedEntityData.properties?.apparatus_id,
                        type: node.type || node._cachedEntityData.properties?.type  // ✅ Lấy từ node.type (đã được update) hoặc từ cached data
                    }
                } else {
                    // Tất cả asset đều có _hasFullProperties = true từ fetchChildren
                    // Không cần gọi API, dùng trực tiếp data từ node
                    assetDetailData = node
                }
                
                // Map từ assetDetailData
                await this.mappingAssetPropertiesClient(assetDetailData)
                this.assetPropertiesClient.asset = node.asset || ''

                // Tìm parent thực sự từ cây dữ liệu thay vì dùng node.parent
                const parentNode = node.parentId ? this.findNodeById(node.parentId, this.organisationClientList) : null
                if (parentNode) {
                    let parentDetailData = parentNode
                    
                    // Nếu parent là Substation, cần lấy đầy đủ thông tin
                    if (parentNode.mode === 'substation') {
                        // Kiểm tra xem đã cache entity data chưa
                        if (parentNode._cachedEntityData) {
                            parentDetailData = parentNode._cachedEntityData
                        } else {
                            try {
                                //console.log('[API CALL] Fetching parent substation detail for asset')
                                // @ts-ignore
                                const res = await window.electronAPI.getSubstationEntityByMrid(parentNode.mrid, this.$store.state.user.user_id, parentNode.parentId)
                                if (res.success && res.data) {
                                    parentDetailData = SubstationMapping.mapEntityToDto(res.data)
                                    // Cache kết quả vào node để lần sau không cần gọi API
                                    parentNode._cachedEntityData = parentDetailData
                                }
                            } catch (error) {
                                console.error('Error fetching parent substation detail:', error)
                            }
                        }
                    }
                    // Nếu parent là Organisation, kiểm tra xem đã có đầy đủ thông tin chưa
                    else if (parentNode.mode === 'organisation') {
                        if (parentNode._hasFullProperties) {
                            parentDetailData = parentNode
                        } else {
                            try {
                                // @ts-ignore
                                const res = await window.electronAPI.getOrganisationEntityByMrid(parentNode.mrid)
                                if (res.success && res.data) {
                                    const orgMapping = await import('@/views/Mapping/Organisation/index')
                                    parentDetailData = orgMapping.OrgEntityToOrgDto(res.data)
                                }
                            } catch (error) {
                                console.error('Error fetching parent organisation detail:', error)
                            }
                        }
                    }
                    // Nếu parent là Bay hoặc VoltageLevel, lấy thông tin từ grandparent (Substation)
                    else if (parentNode.mode === 'bay' || parentNode.mode === 'voltageLevel') {
                        const grandParentNode = parentNode.parentId ? this.findNodeById(parentNode.parentId, this.organisationClientList) : null
                        if (grandParentNode && grandParentNode.mode === 'substation') {
                            // Kiểm tra xem đã cache entity data chưa
                            if (grandParentNode._cachedEntityData) {
                                parentDetailData = grandParentNode._cachedEntityData
                            } else {
                                try {
                                    // @ts-ignore
                                    const res = await window.electronAPI.getSubstationEntityByMrid(grandParentNode.mrid, this.$store.state.user.user_id, grandParentNode.parentId)
                                    if (res.success && res.data) {
                                        parentDetailData = SubstationMapping.mapEntityToDto(res.data)
                                        // Cache kết quả vào node để lần sau không cần gọi API
                                        grandParentNode._cachedEntityData = parentDetailData
                                    }
                                } catch (error) {
                                    console.error('Error fetching grandparent substation detail:', error)
                                }
                            }
                        }
                    }
                    
                    await this.mappingPropertiesClient(parentDetailData)
                }
                await this.loadPathMapClient(node)
                // Với asset: ưu tiên serial_number/serial_no, nếu không có thì dùng name
                const assetName = node.serial_number || node.serial_no || node.name || 'Unknown'
                this.pathMapClient.push({
                    id: node.id || node.mrid,
                    mrid: node.mrid,
                    parent: assetName
                })
            } else if (node.type == 'test') {
                this.assetPropertySignClient = true
                this.jobPropertySignClient = true
                const jobNode = node.parentId ? this.findNodeById(node.parentId, this.organisationClientList) : null
                const assetNode = jobNode ? (jobNode.parentId ? this.findNodeById(jobNode.parentId, this.organisationClientList) : null) : null
                const locationNode = assetNode ? (assetNode.parentId ? this.findNodeById(assetNode.parentId, this.organisationClientList) : null) : null
                if (locationNode) {
                    await this.mappingPropertiesClient(locationNode)
                }
                if (assetNode) {
                    await this.mappingAssetPropertiesClient(assetNode)
                }
                if (jobNode) {
                    await this.mappingJobPropertiesClient(jobNode)
                }
                await this.loadPathMapClient(node)
                const testName = node.name || node.serial_number || node.serial_no || 'Unknown'
                this.pathMapClient.push({
                    id: node.id || node.mrid,
                    mrid: node.mrid,
                    parent: testName
                })
            } else if (node.type == 'job') {
                this.assetPropertySignClient = true
                this.jobPropertySignClient = true
                // Tìm parent thực sự từ cây dữ liệu
                // Job -> Asset (parent)
                // Job -> Location (parent.parent)
                const assetNode = node.parentId ? this.findNodeById(node.parentId, this.organisationClientList) : null
                const locationNode = assetNode ? (assetNode.parentId ? this.findNodeById(assetNode.parentId, this.organisationClientList) : null) : null
                if (locationNode) {
                    await this.mappingPropertiesClient(locationNode)
                }
                if (assetNode) {
                    await this.mappingAssetPropertiesClient(assetNode)
                }
                await this.mappingJobPropertiesClient(node)
                await this.loadPathMapClient(node)
                const jobName = node.name || node.serial_number || node.serial_no || 'Unknown'
                this.pathMapClient.push({
                    id: node.id || node.mrid,
                    mrid: node.mrid,
                    parent: jobName
                })
            } else {
                let detailData = node

                // Nếu là Substation, kiểm tra xem đã có đầy đủ thông tin từ fetchChildren chưa
                if (node.mode === 'substation') {
                    // Kiểm tra xem đã cache entity data chưa
                    if (node._cachedEntityData) {
                        detailData = node._cachedEntityData
                    } else {
                        try {
                            // @ts-ignore
                            const res = await window.electronAPI.getSubstationEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                            if (res.success && res.data) {
                                // Map từ Entity sang DTO để có các trường street, city, email...
                                detailData = SubstationMapping.mapEntityToDto(res.data)
                                // Cache kết quả vào node để lần sau không cần gọi API
                                node._cachedEntityData = detailData
                            }
                        } catch (error) {
                            console.error('Error fetching substation detail:', error)
                        }
                    }
                }
                // Nếu là Organisation, kiểm tra xem đã có đầy đủ thông tin từ fetchChildren chưa
                else if (node.mode === 'organisation') {
                    // Nếu node đã có flag _hasFullProperties = true, nghĩa là fetchChildren đã lấy đầy đủ thông tin
                    // Không cần gọi API lại, tận dụng luôn dữ liệu đã có
                    if (node._hasFullProperties) {
                        
                        // ✅ Ưu tiên dùng _cachedEntityData nếu có (data mới từ save)
                        if (node._cachedEntityData) {
                            detailData = node._cachedEntityData
                        } else {
                            detailData = node
                        }
                    } else {
                        // Trường hợp node chưa có đầy đủ thông tin (ví dụ: root node, hoặc node được load từ nguồn khác)
                        // Mới gọi API để lấy
                        try {
                            // @ts-ignore
                            const res = await window.electronAPI.getOrganisationEntityByMrid(node.mrid)
                            if (res.success && res.data) {
                                // Map từ Entity sang DTO để có các trường address, city, state, country...
                                const orgMapping = await import('@/views/Mapping/Organisation/index')
                                detailData = orgMapping.OrgEntityToOrgDto(res.data)
                            }
                        } catch (error) {
                            console.error('Error fetching organisation detail:', error)
                        }
                    }
                }

                await this.mappingPropertiesClient(detailData)
                await this.loadPathMapClient(node)
                const nodeName = node.name || node.serial_number || node.serial_no || 'Unknown'
                this.pathMapClient.push({
                    id: node.id || node.mrid,
                    mrid: node.mrid,
                    parent: nodeName
                })
            }
        },
    }
}
/**
 * Handle refresh node from context menu
 * Refresh chính node đó và fetch lại children để đảm bảo dữ liệu được cập nhật
 */

export default {
  methods: {
    async handleRefreshNode(node) {
      try {
        if (!node) {
          this.$message.warning('No node selected to refresh')
          return
        }

        // Thêm flag refreshing cho node và tất cả children
        this.setRefreshingState(node, true)

        // 1. Refresh chính node hiện tại - fetch lại thông tin từ database
        await this.refreshNodeData(node)

        // 2. Nếu node đang expanded, fetch lại children
        if (node.expanded) {
          // Reset flag để force fetch lại
          this.$set(node, '_childrenFetched', false)
          
          // Gọi fetchChildren tùy theo client hay server
          if (this.clientSlide) {
            await this.fetchChildren(node)
          } else {
            await this.fetchChildrenServer(node)
          }
        }
        
        // Xóa flag refreshing sau khi hoàn thành
        // Delay một chút để người dùng thấy hiệu ứng
        setTimeout(() => {
          this.setRefreshingState(node, false)
        }, 500)
        
        this.$message.success('Node refreshed successfully')
      } catch (error) {
        console.error('[REFRESH] Error refreshing node:', error)
        // Xóa flag refreshing nếu có lỗi
        this.setRefreshingState(node, false)
        this.$message.error('Failed to refresh node')
      }
    },

    // Helper function để set refreshing state cho node và tất cả children
    setRefreshingState(node, isRefreshing) {
      if (!node) return
      
      // Set cho chính node
      this.$set(node, '_isRefreshing', isRefreshing)
      
      // Set cho tất cả children (recursive)
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(child => {
          this.setRefreshingState(child, isRefreshing)
        })
      }
    },

    async refreshNodeData(node) {
      try {
        let updatedData = null

        // Fetch lại data từ database dựa vào mode của node
        if (node.mode === 'organisation') {
          const result = await window.electronAPI.getOrganisationEntityByMrid(node.mrid)
          if (result.success && result.data) {
            // Map từ Entity sang DTO
            const orgMapping = await import('@/views/Mapping/Organisation/index')
            updatedData = orgMapping.OrgEntityToOrgDto(result.data)
            // Update node properties
            this.$set(node, 'name', updatedData.name || node.name)
            this.$set(node, 'aliasName', updatedData.aliasName || node.aliasName)
            this.$set(node, 'geo_x', updatedData.x_position)
            this.$set(node, 'geo_y', updatedData.y_position)
            this.$set(node, 'phone_no', updatedData.phoneNumber)
            this.$set(node, 'email', updatedData.email)
          }
        } else if (node.mode === 'substation') {
          const result = await window.electronAPI.getSubstationEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
          if (result.success && result.data) {
            // Map từ Entity sang DTO
            const SubstationMapping = await import('@/views/Mapping/Substation/index')
            updatedData = SubstationMapping.mapEntityToDto(result.data)
            // Update node properties
            this.$set(node, 'name', updatedData.name || node.name)
            this.$set(node, 'type', updatedData.type || node.type)
            this.$set(node, 'generation', updatedData.generation || node.generation)
            this.$set(node, 'industry', updatedData.industry || node.industry)
          }
        } else if (node.mode === 'voltageLevel') {
          const result = await window.electronAPI.getVoltageLevelEntityByMrid(node.mrid)
          if (result.success && result.data) {
            updatedData = result.data
            // Update node properties
            this.$set(node, 'name', updatedData.name || node.name)
            this.$set(node, 'type', updatedData.type || node.type)
          }
        } else if (node.mode === 'bay') {
          const result = await window.electronAPI.getBayEntityByMrid(node.mrid)
          if (result.success && result.data) {
            updatedData = result.data
            // Update node properties
            this.$set(node, 'name', updatedData.name || node.name)
            this.$set(node, 'type', updatedData.type || node.type)
          }
        } else if (node.mode === 'asset') {
          // Fetch asset data based on asset type
          const assetType = node.asset
          let result = null
          
          if (assetType === 'Transformer') {
            result = await window.electronAPI.getTransformerEntityByMrid(node.mrid)
          } else if (assetType === 'Circuit breaker') {
            result = await window.electronAPI.getBreakerEntityByMrid(node.mrid)
          } else if (assetType === 'Surge arrester') {
            result = await window.electronAPI.getSurgeArresterEntityByMrid(node.mrid)
          } else if (assetType === 'Current transformer') {
            result = await window.electronAPI.getCurrentTransformerEntityByMrid(node.mrid)
          } else if (assetType === 'Voltage transformer') {
            result = await window.electronAPI.getVoltageTransformerEntityByMrid(node.mrid)
          } else if (assetType === 'Power cable') {
            result = await window.electronAPI.getPowerCableEntityByMrid(node.mrid)
          } else if (assetType === 'Disconnector') {
            result = await window.electronAPI.getDisconnectorEntityByMrid(node.mrid)
          } else if (assetType === 'Bushing') {
            result = await window.electronAPI.getBushingEntityByMrid(node.mrid)
          } else if (assetType === 'Capacitor') {
            result = await window.electronAPI.getCapacitorEntityByMrid(node.mrid)
          } else if (assetType === 'Reactor') {
            result = await window.electronAPI.getReactorEntityByMrid(node.mrid)
          } else if (assetType === 'Rotating machine') {
            result = await window.electronAPI.getRotatingMachineEntityByMrid(node.mrid)
          }

          if (result && result.success && result.data) {
            updatedData = result.data
            // Update asset node properties
            this.$set(node, 'serial_number', updatedData.properties?.serial_no || node.serial_number)
            this.$set(node, 'apparatus_id', updatedData.properties?.apparatus_id || node.apparatus_id)
            this.$set(node, 'manufacturer', updatedData.properties?.manufacturer || node.manufacturer)
            this.$set(node, 'type', updatedData.properties?.type || node.type)
          }
        } else if (node.mode === 'job') {
          // Job không có API getJobEntityByMrid riêng, skip refresh job
          // Job sẽ được refresh thông qua fetchChildren của asset parent
          return
        }

        // Đánh dấu node đã có full properties
        if (updatedData) {
          this.$set(node, '_hasFullProperties', true)
          this.$set(node, '_cachedEntityData', updatedData)
        }
      } catch (error) {
        console.error('[REFRESH] Error refreshing node data:', error)
        throw error
      }
    }
  }
}

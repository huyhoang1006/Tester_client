export default {
    methods: {
        // Method được gọi khi activeTabClient thay đổi (khi user chuyển tab)
        async onActiveTabClientChanged(newTab, oldTab) {
            if (!newTab || !newTab.mrid) return
            
            // Chỉ cập nhật properties nếu tab thực sự thay đổi
            if (oldTab && oldTab.mrid === newTab.mrid) return
            
            try {
                //console.log('[TAB-SYNC] Tab changed to:', newTab)
                
                // ✅ Tìm treeNode trong tree (có _cachedEntityData)
                const treeNode = this.findNodeById(newTab.mrid, this.organisationClientList)
                
                if (treeNode) {
                    //console.log('[TAB-SYNC] Found treeNode, using it instead of tab')
                    //console.log('[TAB-SYNC] treeNode._cachedEntityData:', treeNode._cachedEntityData)
                    // Gọi showPropertiesDataClient với treeNode (có cache)
                    await this.showPropertiesDataClient(treeNode)
                } else {
                    //console.warn('[TAB-SYNC] TreeNode not found, using tab as fallback')
                    // Fallback: dùng tab nếu không tìm thấy node
                    await this.showPropertiesDataClient(newTab)
                }
            } catch (error) {
                console.error('Error updating properties for tab:', error)
            }
        },

        // Method để handle khi tab được select từ Tabs component
        async handleTabSelect(selectedTab) {
            // Cập nhật activeTabClient
            this.activeTabClient = selectedTab
            
            // Cập nhật Object Properties
            await this.onActiveTabClientChanged(selectedTab, null)
        }
    },
    
    watch: {
        // Watch activeTabClient để tự động cập nhật properties khi tab thay đổi
        activeTabClient: {
            handler(newTab, oldTab) {
                this.onActiveTabClientChanged(newTab, oldTab)
            },
            deep: true
        }
    }
}
export default {
    methods: {
        // Method được gọi khi activeTabClient thay đổi (khi user chuyển tab)
        async onActiveTabClientChanged(newTab, oldTab) {
            if (!newTab || !newTab.mrid) return
            
            // Chỉ cập nhật properties nếu tab thực sự thay đổi
            if (oldTab && oldTab.mrid === newTab.mrid) return
            
            try {
                // Gọi showPropertiesDataClient để cập nhật Object Properties
                await this.showPropertiesDataClient(newTab)
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
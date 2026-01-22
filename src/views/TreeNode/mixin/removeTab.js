export default {
    methods: {
        removeTab(index) {
            if (this.activeTab.id == this.tabs[index].id) {
                this.activeTab = {}
            }
            this.tabs.splice(index, 1)
        },
        removeTabClient(index) {
            if (this.activeTabClient.mrid == this.tabsClient[index].mrid) {
                this.activeTabClient = {}
            }
            this.tabsClient.splice(index, 1)
        },
    }
}
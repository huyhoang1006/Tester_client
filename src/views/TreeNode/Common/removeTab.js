export default {
    methods: {
        getTabKey(tab) {
            return tab ? (tab.mrid || tab.id) : null
        },
        getNextActiveTab(tabs, index) {
            return tabs[index - 1] || tabs[index + 1] || {}
        },
        removeTab(index) {
            const tabToClose = this.tabs[index]
            if (this.getTabKey(this.activeTab) === this.getTabKey(tabToClose)) {
                this.activeTab = this.getNextActiveTab(this.tabs, index)
            }
            this.tabs.splice(index, 1)
        },
        removeTabClient(index) {
            const tabToClose = this.tabsClient[index]
            if (this.getTabKey(this.activeTabClient) === this.getTabKey(tabToClose)) {
                this.activeTabClient = this.getNextActiveTab(this.tabsClient, index)
            }
            this.tabsClient.splice(index, 1)
        },
    }
}

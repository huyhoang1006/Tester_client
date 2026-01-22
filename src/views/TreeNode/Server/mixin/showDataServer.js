export default {
    methods: {
        async showData(node) {
            try {
                const newNode = { ...node };
                const nodeKey = newNode.mrid || newNode.id;

                // Tìm index của tab
                const index = this.tabs.findIndex(t => (t.mrid || t.id) === nodeKey);

                if (index !== -1) {
                    // Nếu tab đã mở:
                    this.activeTab = this.tabs[index]; // Cập nhật biến bind v-model
                    this.$refs.serverTabs.selectTab(this.activeTab, index);
                } else {
                    // Nếu tab chưa mở:
                    this.tabs.push(newNode);
                    this.activeTab = newNode; // Cập nhật biến bind v-model
                    const newIndex = this.tabs.length - 1;

                    this.$nextTick(() => {
                        if (this.$refs.serverTabs) {
                            this.$refs.serverTabs.selectTab(newNode, newIndex);
                            this.$refs.serverTabs.loadDataServer(newNode, newIndex);
                        }
                    });
                }
            } catch (error) {
                console.error(error);
            }
        },
    }
}
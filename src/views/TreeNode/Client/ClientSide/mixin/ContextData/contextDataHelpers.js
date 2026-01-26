export default {
    methods: {
        // Helper methods to access ContextData component refs
        getContextDataClientRef() {
            return this.$refs.contextDataClient ? this.$refs.contextDataClient.getContextDataClientRef() : null
        },
        getContentDataClientRef() {
            return this.$refs.contextDataClient ? this.$refs.contextDataClient.getContentDataClientRef() : null
        },
        getContentClientRef() {
            return this.$refs.contextDataClient ? this.$refs.contextDataClient.getContentClientRef() : null
        },
        getPropertiesClientRef() {
            return this.$refs.contextDataClient ? this.$refs.contextDataClient.getPropertiesClientRef() : null
        },
        getLogBarClientRef() {
            return this.$refs.contextDataClient ? this.$refs.contextDataClient.getLogBarClientRef() : null
        },
        getClientTabsRef() {
            return this.$refs.contextDataClient ? this.$refs.contextDataClient.getClientTabsRef() : null
        }
    }
}
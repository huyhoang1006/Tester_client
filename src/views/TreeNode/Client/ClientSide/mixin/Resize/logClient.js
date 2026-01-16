
export default {
    methods: {
        hideLogBarClient() {
            this.logSignClient = false
            const element = this.$refs.contentDataClient
            element.style.height = '100%'
        },
        async reloadLogClient(doneCallback) {
            try {
                const data = await window.electronAPI.getAllConfigurationEvents()
                if (data && data.success) {
                    this.logDataClient = data.data
                    await new Promise((resolve) => setTimeout(resolve, 500))
                    this.$message.success('Log data reloaded successfully.')
                }
            } catch (error) {
                console.error('Error fetching server log data:', error)
                this.$message.error('Failed to fetch log data.')
            } finally {
                if (typeof doneCallback === 'function') doneCallback()
            }
        },
        showLogBarClient() {
            this.logSignClient = true
            const element = this.$refs.contentDataClient
            element.style.height = '80%'
            this.$nextTick(() => {
                const elementLog = this.$refs.logBarClient
                elementLog.style.height = '20%'
            })
        },
    }
}
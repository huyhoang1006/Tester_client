export default {
    methods: {
        hideLogBar() {
            this.logSign = false
            const element = this.$refs.contentData
            element.style.height = '100%'
        },
        async reloadLogServer(doneCallback) {
            try {
                const data = await window.electronAPI.getAllConfigurationEvents()
                if (data && data.success) {
                    this.logDataServer = data.data
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
        showLogBar() {
            this.logSign = true
            const element = this.$refs.contentData
            element.style.height = '80%'
            this.$nextTick(() => {
                const elementLog = this.$refs.logBar
                elementLog.style.height = '20%'
            })
        },
    }
}

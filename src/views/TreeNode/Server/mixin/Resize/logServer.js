export default {
    methods: {
        hideLogBar() {
            this.logSign = false
            const element = this.$refs.contentData
            element.style.height = '100%'
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
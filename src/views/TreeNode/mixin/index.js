export default {
    mounted() {
        window.addEventListener("keydown", this.handleKeyDown);
    },
    beforeDestroy() {
        window.removeEventListener("keydown", this.handleKeyDown);
    },
    methods: {
        handleKeyDown(event) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
            event.preventDefault()
            this.saveCtrS()
        }
        },
        saveCtrS() {
            if(this.clientSlide) {
                if(this.$refs.clientTabs) {
                    this.$refs.clientTabs.saveCtrlS()
                }
            } else {
                if(this.$refs.serverTabs) {
                    this.$refs.serverTabs.saveCtrlS()
                }
            }
        }
    }
};
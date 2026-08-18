/* eslint-disable */
export default {
    data() {
        return {
            savingByShortcut: false
        }
    },
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
                this.saveCtrSInTree();
            }
        },
        async saveCtrSInTree() {
            if (this.savingByShortcut) return
            this.savingByShortcut = true
            try {
                if(this.clientSlide) {
                    const clientTabs = this.getClientTabsRef ? this.getClientTabsRef() : this.$refs.clientTabs
                    if(clientTabs) {
                        await clientTabs.saveCtrlS()
                    }
                } else {
                    if(this.$refs.serverTabs) {
                        await this.$refs.serverTabs.saveActiveServerTab()
                    }
                }
            } finally {
                this.savingByShortcut = false
            }
        }
    }
};

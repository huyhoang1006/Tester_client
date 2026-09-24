export default {
    methods: {
        handleClickFmeca() {
            this.activeWorkspaceTab = 'fmeca'
            if (this.clientSlide) this.clientWorkspaceTab = 'fmeca'
            this.openImportDialog = false
            this.openExportDialog = false
            this.$nextTick(() => {
                const workspace = this.$refs.fmecaWorkspace
                if (workspace && typeof workspace.loadFmeca === 'function') workspace.loadFmeca()
            })
        }
    }
}

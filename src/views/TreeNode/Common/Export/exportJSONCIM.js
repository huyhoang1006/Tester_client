export default {
    methods: {
        async handleExportJSONCIMFromContext(node) {
            await this.exportSingleNodeToJSON(node, 'cim')
        },
    }
}
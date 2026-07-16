// Đồng bộ context menu với toolbar: set selection theo node chuột phải
// rồi gọi ĐÚNG handler mà toolbar đang dùng (cùng pattern handleDuplicateFromContext).
export default {
    methods: {
        handleUploadFromContext(node) {
            this.selectedNodes = [node]
            this.handleUploadNode()
        },
        handleUploadFullTreeFromContext(node) {
            this.selectedNodes = [node]
            this.handleUploadFullTreeNode()
        },
        handleFmecaFromContext(node) {
            this.selectedNodes = [node]
            this.handleClickFmeca()
        },
        handleDownloadFromContext(node) {
            this.selectedNodes = [node]
            this.handleDownloadNode()
        },
        handleDownloadOnlyFromContext(node) {
            this.selectedNodes = [node]
            this.handleDownloadOnlyNode()
        },
        handleImportExcelFromContext(node) {
            this.selectedNodes = [node]
            this.handleImportCommand('importExcel')
        },
        handleImportWordFromContext(node) {
            this.selectedNodes = [node]
            this.handleImportCommand('importWord')
        },
        handleExportJsonOnlyNodeFromContext(node) {
            this.selectedNodes = [node]
            this.exportJsonOnlyNode()
        },
        handleExportJsonFullTreeFromContext(node) {
            this.selectedNodes = [node]
            this.exportJsonFullTree()
        }
    }
}

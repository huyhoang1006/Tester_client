export default {
    methods: {
        async handleDeleteNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node first')
                return
            }

            const node = this.selectedNodes[this.selectedNodes.length - 1]

            // Lấy tên node - kiểm tra nhiều field khả năng
            let nodeName = node.serial_no || node.serial_number
            if (!nodeName || nodeName.toString().trim() === '') {
                nodeName = node.name
            }
            nodeName = nodeName || 'Unknown'
            // Confirm before delete
            this.$confirm(`Delete "${nodeName}"?`, 'Warning', {
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
                cancelButtonClass: 'el-button--danger',
                type: 'warning'
            })
                .then(async () => {
                    try {
                        if (this.clientSlide) {
                            // Delete from client side
                            await this.deleteDataClient(node)
                        } else {
                            // Delete from server side - cần implement tương tự
                            this.$message.info('Delete from server side not yet implemented')
                        }
                        // Clear selection sau khi xóa
                        this.selectedNodes = []
                    } catch (error) {
                        this.$message.error('Error deleting node: ' + error.message)
                        console.error(error)
                    }
                })
                .catch((err) => {
                    if (err !== 'cancel') console.error('Lỗi confirm:', err)    
                })
        },
    }
}
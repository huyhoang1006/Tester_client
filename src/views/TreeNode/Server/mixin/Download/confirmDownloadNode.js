export default {
    methods: {
        // 3. Xử lý khi chọn cha thủ công trong Dialog và nhấn Confirm
        async confirmDownloadSelection() {
            if (!this.selectedDownloadTargetNode) {
                this.$message.warning('Please select a target parent node')
                return
            }

            this.nodeToDownloadData.psrId = this.selectedDownloadTargetNode.mrid
            await this.executeDownloadAndSave(this.nodeToDownloadData, this.selectedDownloadTargetNode)
        },
    }
}
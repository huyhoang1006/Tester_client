import { startLoading } from '@/utils/loading';

export default {
    methods: {
        async handleDeleteNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node first');
                return;
            }

            const node = this.selectedNodes[this.selectedNodes.length - 1];
            let nodeName = node.apparatus_id || node.serial_number || node.serial_no || node.name || 'Unknown';

            // Node có con thì hỏi xác nhận xóa cả cây con thay vì chặn như trước.
            // Chỉ áp dụng cho client, job là node lá nên bỏ qua.
            let cascade = false;
            if (this.clientSlide && node.mode !== 'job') {
                try {
                    const checkResult = await this.checkChildren(node);
                    cascade = !!(checkResult && checkResult.hasChildren);
                } catch (error) {
                    console.error('Check children before delete failed:', error);
                }
            }

            const confirmMessage = cascade
                ? `"${nodeName}" has child nodes. Deleting it will permanently delete this node and ALL of its child nodes. Are you sure?`
                : `Delete "${nodeName}"?`;
            const confirmTitle = cascade ? 'Node has child nodes' : 'Warning';

            this.$confirm(confirmMessage, confirmTitle, {
                confirmButtonText: cascade ? 'Delete all' : 'Delete',
                cancelButtonText: 'Cancel',
                cancelButtonClass: 'el-button--danger',
                type: 'warning'
            })
            .then(async () => {
                // Sử dụng Wrapper để bắt đầu loading
                // Xóa cả cây con chạy lâu hơn nhiều nên dùng timeout 'heavy'
                const { close, timeoutValue } = startLoading(this, {
                    action: 'delete',
                    type: cascade ? 'heavy' : 'default'
                });

                // Intercept messages để hiển thị sau khi loading đóng
                const originalMessage = this.$message;
                let deleteSuccess = false;
                let capturedMessages = [];

                this.$message = {
                    success: (msg) => { 
                        deleteSuccess = true; 
                        capturedMessages.push({ type: 'success', message: msg });
                    },
                    error: (msg) => { 
                        capturedMessages.push({ type: 'error', message: msg });
                    },
                    warning: (msg) => { 
                        capturedMessages.push({ type: 'warning', message: msg });
                    },
                    info: (msg) => { 
                        capturedMessages.push({ type: 'info', message: msg });
                    }
                };

                try {
                    // Delay 0.2s để loading hiển thị trước khi bắt đầu xóa
                    await new Promise(resolve => setTimeout(resolve, 200));

                    const deletePromise = this.clientSlide
                        ? this.deleteDataClient(node, cascade)
                        : this.deleteDataServer(node);

                    // Xóa cả cây con không giới hạn thời gian: nếu race timeout thắng thì
                    // $message được restore trong finally trong khi vòng xóa vẫn chạy tiếp,
                    // mỗi node còn lại sẽ bắn 1 toast thật ra màn hình.
                    if (timeoutValue > 0 && !cascade) {
                        const timeoutPromise = new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout')), timeoutValue)
                        );
                        
                        await Promise.race([deletePromise, timeoutPromise]);
                    } else {
                        await deletePromise;
                    }

                } catch (error) {
                    // Restore original message
                    this.$message = originalMessage;
                    
                    // Đóng loading và đợi modal biến mất
                    await close();
                    
                    // Hiển thị lỗi sau khi modal đã biến mất
                    this.$message.error(
                        error.message === 'Timeout' 
                            ? 'Delete timed out' 
                            : 'Error: ' + error.message
                    );
                    return; // Thoát sớm nếu có lỗi
                } finally {
                    // Restore original message
                    this.$message = originalMessage;
                }

                // Đóng loading và đợi modal biến mất hoàn toàn
                await close();
                
                // Hiển thị messages SAU KHI loading đã đóng
                if (capturedMessages.length > 0) {
                    const last = capturedMessages[capturedMessages.length - 1];
                    const finalMessage = (cascade && last.type === 'success')
                        ? `Deleted "${nodeName}" and all of its child nodes successfully`
                        : last.message;
                    this.$message[last.type](finalMessage);
                }

                if (deleteSuccess) {
                    this.selectedNodes = [];
                    this.$emit('close-properties');
                }
            })
            .catch(() => {
                // User cancelled confirmation dialog
            });
        },
    }
}

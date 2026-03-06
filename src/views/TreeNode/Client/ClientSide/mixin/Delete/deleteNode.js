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
            
            this.$confirm(`Delete "${nodeName}"?`, 'Warning', {
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
                cancelButtonClass: 'el-button--danger',
                type: 'warning'
            })
            .then(async () => {
                // Sử dụng Wrapper để bắt đầu loading
                const { close, timeoutValue } = startLoading(this, { 
                    action: 'delete',
                    type: 'default' 
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
                        ? this.deleteDataClient(node)
                        : Promise.reject(new Error('Delete from server not implemented'));

                    // Xử lý timeout nếu có
                    if (timeoutValue > 0) {
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
                    this.$message[last.type](last.message);
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
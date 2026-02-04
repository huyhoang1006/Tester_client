import { startLoading } from '@/utils/loading';

export default {
    methods: {
        async handleDeleteNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node first');
                return;
            }

            const node = this.selectedNodes[this.selectedNodes.length - 1];
            let nodeName = node.serial_no || node.serial_number || node.name || 'Unknown';
            
            this.$confirm(`Delete "${nodeName}"?`, 'Warning', {
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
                cancelButtonClass: 'el-button--danger',
                type: 'warning'
            })
            .then(async () => {
                const { instance, timeoutValue } = startLoading(this, { 
                    text: 'Deleting...', 
                    isDanger: true, 
                    type: 'default' 
                });

                const originalMessage = this.$message;
                let deleteSuccess = false;
                let capturedMessages = [];

                this.$message = {
                    success: (msg) => { deleteSuccess = true; capturedMessages.push({ type: 'success', message: msg }) },
                    error: (msg) => { capturedMessages.push({ type: 'error', message: msg }) },
                    warning: (msg) => { capturedMessages.push({ type: 'warning', message: msg }) },
                    info: (msg) => { capturedMessages.push({ type: 'info', message: msg }) }
                };

                try {
                    const deletePromise = this.clientSlide 
                        ? this.deleteDataClient(node)
                        : Promise.reject(new Error('Delete from server not implemented'));

                    // SỬA TẠI ĐÂY: minDelay phải khớp với timeoutValue (500ms)
                    const waitTime = timeoutValue > 0 ? timeoutValue : 500;
                    const minDelay = new Promise(resolve => setTimeout(resolve, waitTime));

                    if (timeoutValue > 0) {
                        const timeoutPromise = new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout')), timeoutValue)
                        );
                        
                        await Promise.all([
                            Promise.race([deletePromise, timeoutPromise]),
                            minDelay
                        ]);
                    } else {
                        await Promise.all([deletePromise, minDelay]);
                    }

                    this.$message = originalMessage;
                    instance.close();

                    if (capturedMessages.length > 0) {
                        const last = capturedMessages[capturedMessages.length - 1];
                        this.$message[last.type](last.message);
                    }

                    if (deleteSuccess) {
                        this.selectedNodes = [];
                        this.$emit('close-properties');
                    }

                } catch (error) {
                    this.$message = originalMessage;
                    instance.close();
                    this.$message.error(error.message === 'Timeout' ? 'Delete timed out' : 'Error: ' + error.message);
                }
            })
            .catch(() => {});
        },
    }
}
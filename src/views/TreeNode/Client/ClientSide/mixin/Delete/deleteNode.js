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
                const { close, progress, aborted } = startLoading(this, {
                    action: 'delete',
                    text: `Deleting "${nodeName}"`,
                    type: cascade ? 'heavy' : 'default'
                });

                // Cầu nối để vòng xoá bên trong báo tiến độ và đọc được lệnh dừng.
                // Đặt lên `this` vì `deleteDescendantsClient` là mixin cùng component,
                // không nhận tham số nào để truyền hai hàm này xuống.
                this.reportDeleteProgress = (text) => progress(text);
                this.isDeleteAborted = aborted;

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

                    // CHỜ XOÁ XONG THẬT, không đặt hạn giờ ở đây nữa.
                    //
                    // Bản trước dùng `Promise.race` với một hạn giờ cố định. Hạn giờ
                    // thắng thì hàm này đi tiếp và đóng overlay, NHƯNG vòng xoá vẫn
                    // chạy — giao diện báo xong trong khi DB còn đang ghi, và mỗi node
                    // còn lại bắn một toast thật ra màn hình vì `$message` đã được
                    // restore trong `finally`.
                    //
                    // Việc canh "treo hay không" giờ do overlay lo, và nó canh theo NHỊP
                    // TIM: mỗi node xoá xong là một lần `progress()`, hẹn giờ im lặng
                    // đặt lại từ đầu. Im lặng quá lâu thì nó bật cờ dừng, và vòng xoá
                    // tự thoát ở ranh giới an toàn thay vì bị bỏ rơi.
                    await (this.clientSlide
                        ? this.deleteDataClient(node, cascade)
                        : this.deleteDataServer(node));

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
                    // Gỡ cầu nối, không để rớt lại sang lượt xoá sau
                    this.reportDeleteProgress = null;
                    this.isDeleteAborted = null;
                }

                const wasAborted = aborted();

                // Đóng loading và đợi modal biến mất hoàn toàn
                await close();

                // DỪNG GIỮA ĐƯỜNG THÌ NÓI THẲNG. Xoá cây con là thao tác xoá dần từng
                // node, nên dừng giữa đường để lại một cây xoá dở — báo "thành công" ở
                // đây là nói dối, mà báo lỗi thì cũng sai vì phần đã xoá là xoá thật.
                if (wasAborted) {
                    this.$message.warning(
                        `Stopped while deleting "${nodeName}". Part of the subtree may already be deleted \u2014 check before continuing.`
                    );
                    this.selectedNodes = [];
                    return;
                }

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

/**
 * Upload mixin — entry point
 *
 * Chia thành 2 file con:
 *   - upload-resolve-ids.js  : resolve UUID → numeric ID từ server
 *   - upload-process.js      : xử lý upload từng loại entity
 *
 * File này chỉ chứa handleUploadNode (điều phối confirm + gọi process)
 */
import resolveIdsMixin  from './upload-resolve-ids.js'
import processUploadMixin from './upload-process.js'

export default {
    mixins: [resolveIdsMixin, processUploadMixin],

    methods: {
        async handleUploadNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node to upload');
                return;
            }

            const node = this.selectedNodes[this.selectedNodes.length - 1];

            if (!node.parentId) {
                this.$message.error('Cannot upload root node. Please select a child node with parent.');
                return;
            }

            const confirmAndRun = (label, handler) => {
                this.$confirm(`Upload ${label} "${node.name || node.serial_number}" to Server?`, 'Confirm Upload', {
                    confirmButtonText: 'Upload',
                    cancelButtonText: 'Cancel',
                    type: 'info'
                }).then(() => handler(node)).catch(() => { });
            }

            if (node.mode === 'substation') {
                confirmAndRun('Substation', this.processUploadSubstation);

            } else if (node.mode === 'voltageLevel') {
                confirmAndRun('VoltageLevel', this.processUploadVoltageLevel);

            } else if (node.mode === 'bay') {
                confirmAndRun('Bay', this.processUploadBay);

            } else if (node.asset === 'Power cable') {
                this.$confirm(`Upload Power Cable "${node.serial_number || node.name}" to Server?`, 'Confirm Upload', {
                    confirmButtonText: 'Upload',
                    cancelButtonText: 'Cancel',
                    type: 'info'
                }).then(() => this.processUploadPowerCable(node)).catch(() => { });

            } else if (node.asset === 'Transformer') {
                confirmAndRun('Transformer', this.processUploadTransformer);

            } else if (node.asset === 'Voltage transformer') {
                confirmAndRun('Voltage transformer', this.processUploadVoltageTransformer); 
            } else if (node.asset === 'Current transformer') {
                confirmAndRun('Current transformer', this.processUploadCurrentTransformer);
            } else if (node.asset === 'Circuit breaker') {
                confirmAndRun('Circuit breaker', this.processUploadCircuitBreaker);
            } else if (node.asset === 'Disconnector') {
                confirmAndRun('Disconnector', this.processUploadDisconnector);
            } else if (node.asset === 'Surge arrester') {
                confirmAndRun('Surge arrester', this.processUploadSurgeArrester);
            } else {
                this.$message.warning('TYPE NOT SUPPORTED FOR UPLOAD');
            }
        },
    }
}
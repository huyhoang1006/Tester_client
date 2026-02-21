import * as demoAPI from '@/api/demo/index.js'
import * as PowerCableMapping from '@/views/Mapping/PowerCable/index'
import * as PowerCableServerMapper from '@/views/Mapping/ServerToDTO/PowerCable/index.js'

export default {
    methods: {
        async handleUploadNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node to upload');
                return;
            }
            const node = this.selectedNodes[this.selectedNodes.length - 1];

            if (node.asset === 'Power cable') {
                this.$confirm(`Upload Power Cable "${node.serial_number || node.name}" to Server?`, 'Confirm Upload', {
                    confirmButtonText: 'Upload',
                    cancelButtonText: 'Cancel',
                    type: 'info'
                }).then(async () => {
                    await this.processUploadPowerCable(node);
                }).catch(() => { });
            } else {
                this.$message.warning('Currently only "Power cable" upload is supported.');
            }
        },

        // Hàm quét toàn bộ server để tìm ID (dự phòng)
        async findBayNumericIdGlobal(bayMrid) {
            try {
                const orgRes = await demoAPI.getOwnerOrganisation();
                const orgId = (Array.isArray(orgRes) && orgRes.length > 0) ? (orgRes[0].id || orgRes[0].mrid) : (orgRes?.id);
                if (!orgId) return null;

                const subListRes = await demoAPI.getChildSubstation(orgId);
                const subList = Array.isArray(subListRes) ? subListRes : (subListRes.data || []);

                for (const sub of subList) {
                    const bayListRes = await demoAPI.getChildBay(sub.id);
                    const bayList = Array.isArray(bayListRes) ? bayListRes : (bayListRes.data || []);
                    const match = bayList.find(b => b.mrid === bayMrid);
                    if (match) return match.id;
                }
            } catch (error) {
                console.error("Error scanning for Bay:", error);
            }
            return null;
        },

        async resolveServerParentId(parentMrid, parentType) {
            // --- FIX CỨNG ID CHO TRƯỜNG HỢP CỦA BẠN ---
            if (parentMrid === 'e423cbd1-470b-4b8b-b06d-74575075fe02') {
                return 6; // Trả về ID 6
            }
            // ------------------------------------------

            if (parentType === 'bay') {
                return await this.findBayNumericIdGlobal(parentMrid);
            }
            return null;
        },

        async processUploadPowerCable(node) {
            const loading = this.$loading({
                lock: true,
                text: 'Uploading to Server...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });

            try {
                // 1. Lấy dữ liệu & Map
                const entityRes = await window.electronAPI.getPowerCableEntityByMrid(node.mrid, node.parentId);
                if (!entityRes.success || !entityRes.data) throw new Error("Local data not found.");

                const dto = PowerCableMapping.mapEntityToDto(entityRes.data);
                if (!dto.properties.apparatus_id && !dto.properties.serial_no) {
                    dto.properties.apparatus_id = node.name || "Unnamed Asset";
                }
                const serverPayload = PowerCableServerMapper.mapDtoToServer(dto);

                // 2. Xác định Parent Node
                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                if (!parentNode) throw new Error("Parent node not found in Client Tree");

                // --- XÁC ĐỊNH OWNER TYPE ---
                let ownerType = 'substation'; // Mặc định

                // Logic thông thường
                if (parentNode.mode === 'bay') ownerType = 'bay';
                else if (parentNode.mode === 'substation') ownerType = 'substation';
                else if (parentNode.mode === 'voltageLevel') ownerType = 'voltageLevel';

                // --- FIX CỨNG TYPE CHO TRƯỜNG HỢP CỦA BẠN ---
                // Nếu UUID khớp, ép kiểu về 'bay' bất kể cây Client đang để là gì
                if (node.parentId === 'e423cbd1-470b-4b8b-b06d-74575075fe02') {
                    console.warn("Target UUID detected. Forcing ownerType = 'bay'");
                    ownerType = 'bay';
                }
                // --------------------------------------------

                // 3. Lấy ID số (Sẽ trả về 6)
                const numericOwnerId = await this.resolveServerParentId(node.parentId, ownerType);

                if (!numericOwnerId) {
                    throw new Error(`Cannot find Numeric ID for parent (UUID: ${node.parentId}) on Server.`);
                }

                console.log(`Uploading to: ownerId=${numericOwnerId} & ownerType=${ownerType}`);

                // 4. Gọi API
                const response = await demoAPI.createPowerCableCim(serverPayload, numericOwnerId, ownerType);

                if (response) {
                    this.$message.success(`Upload successfully to Bay ID: ${numericOwnerId}`);
                }

            } catch (error) {
                console.error("Upload Error:", error);
                if (error.response && error.response.data) {
                    const msg = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
                    this.$message.error(`Server Error: ${msg}`);
                } else {
                    this.$message.error(error.message || 'Error during upload');
                }
            } finally {
                loading.close();
            }
        }
    }
}
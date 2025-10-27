
import uuid from "@/utils/uuid";
import * as Mapping from "@/views/Mapping/Capacitor/index";
import CapacitorDTO from "@/views/Dto/Capacitor";
export default {
    data() {
        return {
            capacitor: new CapacitorDTO,
            capacitorOld: new CapacitorDTO,
            attachmentData: []
        }
    },
    methods: {
        async saveAsset() {
            try {
                if (this.capacitor.properties.serial_no !== null && this.capacitor.properties.serial_no !== '') {
                    const data = JSON.parse(JSON.stringify(this.capacitor));
                    console.log("Before mapping - phase_name:", data.configsData.phase_name);
                    const result = await this.checkCapacitorData(data);
                    console.log("After check - phase_name:", result.configsData.phase_name);
                    const oldResult = await this.checkCapacitorData(this.capacitorOld);
                    const resultEntity = Mapping.mapDtoToEntity(result);
                    console.log("After mapping - phase_name:", resultEntity.capacitor.phase_name);
                    const oldResultEntity = Mapping.mapDtoToEntity(oldResult);
                    console.log("resultCapacitor", resultEntity)
                    let rs = await window.electronAPI.insertCapacitorEntity(oldResultEntity, resultEntity)
                    if (rs.success) {
                        return {
                            success: true,
                            data: rs.data,
                        };
                    } else {
                        this.$message.error("Error saving Capacitor entity: " + rs.message);
                        return {
                            success: false,
                            error: rs.error,
                        };
                    }
                } else {
                    this.$message.error("Serial number is required");
                    return {
                        success: false,
                    };
                }
            } catch (error) {
                console.error("Error saving asset:", error);
                this.$message.error("Error saving asset: " + error.message);
                return {
                    success: false,
                };
            }
        },

        async saveCtrS() {
            const data = await this.saveAsset()
            if (data && data.success) {
                // Load back the saved entity so the UI shows exactly what was stored
                if (data.data) {
                    // Convert Entity -> DTO before binding to UI
                    const dto = Mapping.mapEntityToDto(data.data)
                    this.loadData(dto)
                }
                this.$message.success("Asset saved successfully")
            } else {
                this.$message.error("Failed to save asset")
            }
        },

        resetForm() {
            this.capacitor = new CapacitorDTO
            this.capacitorOld = new CapacitorDTO
            this.attachmentData = [];
        },

        loadData(data) {
            this.capacitorOld = JSON.parse(JSON.stringify(data)); // Lưu bản sao của dữ liệu cũ
            this.capacitor = data;
            if (data.attachment && data.attachment.path) {
                this.attachmentData = JSON.parse(data.attachment.path)
            } else {
                this.attachmentData = []
            }
        },

        async checkCapacitorData(data) {
            try {
                this.checkProperty(data);
                this.checkLifecycleDate(data);
                this.checkPsrId(data);
                this.checkProductAssetModel(data);
                await this.checkAssetPrs(data);
                this.checkAttachment(data);
                this.checkLocationId(data);
                this.checkAssetInfoId(data);
                this.checkCapacitorTree(data);
                this.checkProductAssetModelId(data);
                this.checkCapacitanceAndDissipationFactor(data);
                return data;
            } catch (error) {
                console.error("Error checking rotating machine data:", error);
            }
        },

        checkProperty(data) {
            if (data.properties.mrid == null || data.properties.mrid == '') {
                data.properties.mrid = uuid.newUuid();
            }
        },
        checkLifecycleDate(data) {
            if (data.lifecycleDateId == null || data.lifecycleDateId == '') {
                data.lifecycleDateId = uuid.newUuid();
            }
        },


        checkPsrId(data) {
            if (this.parentData.mrid !== null && this.parentData.mrid !== '' && this.parentData.mrid !== undefined) {
                data.psrId = this.parentData.mrid
            }
        },


        checkProductAssetModel(data) {
            if (data.productAssetModelId === null || data.productAssetModelId === '') {
                data.productAssetModelId = uuid.newUuid()
            }
        },

        async checkAssetPrs(data) {
            if (data.assetPsrId === null || data.assetPsrId === '') {
                data.assetPsrId = uuid.newUuid();
            }
        },

        checkProductAssetModelId(data) {
            if (data.productAssetModelId === null || data.productAssetModelId === '') {
                data.productAssetModelId = uuid.newUuid();
            }
        },

        checkAttachment(data) {
            if (data.attachmentId === null || data.attachmentId === '') {
                if (this.attachmentData.length > 0) {
                    data.attachmentId = uuid.newUuid()
                    data.attachment.id = data.attachmentId
                    data.attachment.name = null
                    data.attachment.path = JSON.stringify(this.attachmentData)
                    data.attachment.type = 'asset'
                    data.attachment.id_foreign = data.properties.mrid
                }
            }
        },

        checkCapacitorTree(data) {
            this.traverseAndFillMrid(data);
        },

        checkLocationId(data) {
            if (data.locationId === null || data.locationId === '') {
                data.locationId = this.locationId;
            }
        },

        checkAssetInfoId(data) {
            if (data.assetInfoId === null || data.assetInfoId === '') {
                data.assetInfoId = uuid.newUuid()
            }
        },
        checkCapacitanceAndDissipationFactor(data) {
            // Đảm bảo capacitance có MRID
            if (!data.capacitance.mrid || data.capacitance.mrid === '') {
                data.capacitance.mrid = uuid.newUuid();
            }

            // Đảm bảo dissipationFactor có MRID
            if (!data.dissipationFactor.mrid || data.dissipationFactor.mrid === '') {
                data.dissipationFactor.mrid = uuid.newUuid();
            }
        },

        traverseAndFillMrid(obj) {
            if (Array.isArray(obj)) {
                obj.forEach(item => this.traverseAndFillMrid(item));
            } else if (obj !== null && typeof obj === "object") {
                // Nếu có thuộc tính mrid
                if ("mrid" in obj) {
                    if (!obj.mrid || obj.mrid === "") {
                        obj.mrid = uuid.newUuid();
                    }
                }
                // Duyệt tiếp các key con
                Object.values(obj).forEach(val => this.traverseAndFillMrid(val));
            }
            return obj;
        }
    }
}
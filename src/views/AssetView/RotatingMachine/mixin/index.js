
import uuid from "@/utils/uuid";
import * as Mapping from "@/views/Mapping/RotatingMachine/index"
import RotatingMachineDTO from "@/views/Dto/RotatingMachine";
export default {
    data() {
        return {
            rotatingMachine: new RotatingMachineDTO,
            attachmentData: []
        }
    },
    methods: {
        async saveAsset() {
            try {
                if (this.rotatingMachine.properties.serial_no !== null && this.rotatingMachine.properties.serial_no !== '') {
                    const data = JSON.parse(JSON.stringify(this.rotatingMachine));
                    const result = await this.checkRotatingMachineData(data);
                    const resultEntity = Mapping.mapDtoToEntity(result);
                    console.log("resultEntity", resultEntity)
                    let rs = await window.electronAPI.insertRotatingMachineEntity(resultEntity)
                    if (rs.success) {
                        return {
                            success: true,
                            data: rs.data,
                        };
                    } else {
                        this.$message.error("Error saving Rotating Machine entity: " + rs.message);
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
                    const dto = Mapping.disconnectorEntityToDto(data.data)
                    this.loadData(dto)
                }
                this.$message.success("Asset saved successfully")
            } else {
                this.$message.error("Failed to save asset")
            }
        },

        resetForm() {
            this.rotatingMachine = new RotatingMachineDTO
            this.attachmentData = [];
        },

        loadData(data) {
            this.rotatingMachine = data;
            if (data.attachment && data.attachment.path) {
                this.attachmentData = JSON.parse(data.attachment.path)
            } else {
                this.attachmentData = []
            }
        },

        async checkRotatingMachineData(data) {
            try {
                this.checkProperty(data);
                this.checkLifecycleDate(data);
                this.checkPsrId(data);
                this.checkProductAssetModel(data);
                await this.checkAssetPrs(data);
                this.checkAttachment(data);
                this.checkLocationId(data);
                this.checkAssetInfoId(data)
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

        checkLocationId(data) {
            if (data.locationId === null || data.locationId === '') {
                data.locationId = this.locationId;
            }
        },

        checkAssetInfoId(data) {
            if (data.assetInfoId === null || data.assetInfoId === '') {
                data.assetInfoId = uuid.newUuid()
            }
        }
    }
}
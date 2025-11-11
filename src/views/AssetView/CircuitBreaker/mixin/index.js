import circuitBreakerDto from "@/views/Dto/CircuitBreaker"
import uuid from "@/utils/uuid";
import * as Mapping from "@/views/Mapping/Breaker/index";
/* eslint-disable */
export default {
    data() {
        return {
            circuitBreakerDto : new circuitBreakerDto(),
            oldCircuitBreakerDto : new circuitBreakerDto(),
            attachmentData : []
        }
    },
    methods : {
        async saveAsset() {
            try {
                if (this.circuitBreakerDto.properties.serial_no !== null && this.circuitBreakerDto.properties.serial_no !== '') {
                    const data = JSON.parse(JSON.stringify(this.circuitBreakerDto));
                    const result = await this.checkBreakerData(data);
                    const oldResult = await this.checkBreakerData(this.oldCircuitBreakerDto);
                    const resultEntity = Mapping.mapDtoToEntity(result);
                    const oldResultEntity = Mapping.mapDtoToEntity(oldResult);
                    let rs = await window.electronAPI.insertBreakerEntity(oldResultEntity, resultEntity)
                    if (rs.success) {
                        return {
                            success: true,
                            data: rs.data,
                        };
                    } else {
                        this.$message.error("Error saving Breaker entity: " + rs.message);
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
        async checkBreakerData(data) {
            try {
                this.checkProperty(data);
                this.checkLifecycleDate(data);
                this.checkPsrId(data);
                this.checkProductAssetModel(data);
                await this.checkAssetPrs(data);
                this.checkAttachment(data);
                this.checkLocationId(data);
                this.checkAssetInfoId(data);
                this.checkAssessmentLimitBreakerInfoId(data)
                this.checkBreakerRatingInfoId(data);
                this.checkBreakerContactSystemInfoId(data);
                this.checkBreakerOtherInfoId(data);
                this.checkBreakerTree(data);
                return data;
            } catch (error) {
                console.error("Error checking rotating machine data:", error);
            }
        },
        loadData(data) {
            this.oldCircuitBreakerDto = JSON.parse(JSON.stringify(data));
            this.circuitBreakerDto = data;
            if (data.attachment && data.attachment.path) {
                this.attachmentData = JSON.parse(data.attachment.path)
            } else {
                this.attachmentData = []
            }
        },
        async resetForm() {
            this.circuitBreakerDto = new circuitBreakerDto(),
            this.oldCircuitBreakerDto = new circuitBreakerDto(),
            this.attachmentData = []
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
        checkProperty(data) {
            if (data.properties.mrid == null || data.properties.mrid == '') {
                data.properties.mrid = uuid.newUuid();
            }
            if(data.operatingMechanismId == null || data.operatingMechanismId == '') {
                data.operatingMechanismId = uuid.newUuid();
            }
        },
        checkLifecycleDate(data) {
            if (data.lifecycleDateId == null || data.lifecycleDateId == '') {
                data.lifecycleDateId = uuid.newUuid();
            }
            if (data.operatingMechanismLifecycleDateId == null || data.operatingMechanismLifecycleDateId == '') {
                data.operatingMechanismLifecycleDateId = uuid.newUuid();
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
            if (data.operatingMechanismProductAssetModelId === null || data.operatingMechanismProductAssetModelId === '') {
                data.operatingMechanismProductAssetModelId = uuid.newUuid()
            }
        },
        async checkAssetPrs(data) {
            if (data.assetPsrId === null || data.assetPsrId === '') {
                data.assetPsrId = uuid.newUuid();
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
            if (data.operatingMechanismInfoId === null || data.operatingMechanismInfoId === '') {
                data.operatingMechanismInfoId = uuid.newUuid()
            }
        },
        checkAssessmentLimitBreakerInfoId(data) {
            if (data.assessmentLimitBreakerInfoId === null || data.assessmentLimitBreakerInfoId === '') {
                data.assessmentLimitBreakerInfoId = uuid.newUuid()
            }
        },
        checkBreakerRatingInfoId(data) {
            if (data.breakerRatingInfoId === null || data.breakerRatingInfoId === '') {
                data.breakerRatingInfoId = uuid.newUuid()
            }
        },
        checkBreakerContactSystemInfoId(data) {
            if (data.breakerContactSystemInfoId === null || data.breakerContactSystemInfoId === '') {
                data.breakerContactSystemInfoId = uuid.newUuid()
            }
        },
        checkBreakerOtherInfoId(data) {
            if (data.breakerOtherInfoId === null || data.breakerOtherInfoId === '') {
                data.breakerOtherInfoId = uuid.newUuid()
            }
        },
        checkBreakerTree(data) {
            this.traverseAndFillMrid(data);
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
/* eslint-disable */
import TransformerDataDto from "@/views/Dto/Transformer"
import uuid from "@/utils/uuid"
import * as transformerMapping from "@/views/Mapping/Transformer"
import OldTransformerEndInfo from "@/views/Cim/OldTransformerEndInfo"
import { WindingConnection } from "@/views/Enum/WindingConnection"
import { PhaseCode } from "@/views/Enum/PhaseCode"
export default {
    data() {
        return {
            transformerDto: new TransformerDataDto(),
            oldTransformerDto: new TransformerDataDto(),
            attachmentData: [],
        }
    },
    watch: {
        'transformerDto.winding_configuration.vector_group': {
            deep: true,
            immediate: true,
            handler() {
                this.changeDataBushing()
            }
        },
        'transformerDto.properties.type': {
            deep: true,
            immediate: true,
            handler() {
                this.changeDataBushing()
            }
        },

        'transformerDto.winding_configuration.phases': {
            deep: true,
            immediate: true,
            handler() {
                this.changeDataBushing()
            }
        },

    },
    methods: {
        onChangeAssetType(value) {
            this.transformerDto.winding_configuration = new TransformerDataDto().winding_configuration
            for (let [index, item] of this.transformerDto.ratings.voltage_ratings.entries()) {
                if (item.winding === this.$constant.TERT) {
                    if (value !== this.$constant.THREE_WINDING) {
                        this.transformerDto.ratings.voltage_ratings.splice(index, 1)
                    }
                }
            }
            for (let [index, item] of this.transformerDto.ratings.current_ratings.entries()) {
                if (value !== this.$constant.THREE_WINDING) {
                    if (item.tert !== undefined) {
                        this.transformerDto.ratings.current_ratings[index].tert.mrid = ''
                        this.transformerDto.ratings.current_ratings[index].tert.value = ''
                        this.transformerDto.ratings.current_ratings[index].tert.unit = 'A'
                    }
                }
            }

            if (value === this.$constant.TWO_WINDING || value === this.$constant.WITHOUT_TERT) {
                this.transformerDto.impedances.prim_tert = []
                this.transformerDto.impedances.sec_tert = []
            }

            if (value === this.$constant.THREE_WINDING || value === this.$constant.TWO_WINDING) {
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.prim.mrid = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.prim.value = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.prim.unit = '%'
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.sec.mrid = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.sec.value = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.sec.unit = '%'
            } else {
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.zero.mrid = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.zero.value = ''
                this.transformerDto.impedances.zero_sequence_impedance.zero_percent.zero.unit = '%'
            }

            if (value === this.$constant.TWO_WINDING || value === this.$constant.WITHOUT_TERT) {
                this.transformerDto.others.winding.tert = ''
            }
        },

        async saveAsset() {
            try {
                if (this.transformerDto.properties.type && this.transformerDto.properties.kind && this.transformerDto.properties.serial_no) {
                    const data = JSON.parse(JSON.stringify(this.transformerDto));
                    const result = this.checkTransformerDto(data);
                    const oldResult = this.checkTransformerDto(this.oldTransformerDto);
                    const resultEntity = transformerMapping.transformerDtoToEntity(result);
                    const oldResultEntity = transformerMapping.transformerDtoToEntity(oldResult);
                    let rs = await window.electronAPI.insertTransformerEntity(oldResultEntity, resultEntity)
                    if (rs.success) {
                        return {
                            success: true,
                            data: rs.data,
                        };
                    } else {
                        this.$message.error("Error saving transformer entity: " + rs.message);
                        return {
                            success: false,
                            error: rs.error,
                        };
                    }

                } else {
                    this.$message({
                        type: 'warning',
                        message: "Please select the type and kind of Asset and serial number before saving."
                    });
                    return {
                        success: false,
                    };
                }
            } catch (error) {
                console.error("Error saving asset:", error);
                this.$message({
                    success: false,
                    type: 'error',
                    message: "An error occurred while saving the asset."
                });
            }
        },

        loadData(data) {
            this.oldTransformerDto = JSON.parse(JSON.stringify(data));
            this.transformerDto = data;
            if (data.attachment && data.attachment.path) {
                this.attachmentData = JSON.parse(data.attachment.path)
            } else {
                this.attachmentData = []
            }
        },

        async saveCtrS() {
            const data = await this.saveAsset()
            if (data && data.success) {
                // Load back the saved entity so the UI shows exactly what was stored
                if (data.data) {
                    // Convert Entity -> DTO before binding to UI
                    const dto = transformerMapping.transformerEntityToDto(data.data)
                    this.loadData(dto)
                }
                this.$message.success("Asset saved successfully")
            } else {
                this.$message.error("Failed to save asset")
            }
        },

        async resetForm() {
            this.transformerDto = new TransformerDataDto(),
                this.oldTransformerDto = new TransformerDataDto(),
                this.attachmentData = []
        },

        checkTransformerDto(data) {
            this.checkPsrId(data)
            this.checkOldTransformerEndInfo(data)
            this.checkAsset(data)
            this.checkLifecycleDate(data)
            this.checkAssetInfo(data)
            this.checkLocationId(data)
            this.checkAssetPrs(data)
            this.checkProductAssetModel(data)
            this.checkAttachment(data);
            this.checkVoltageRating(data)
            this.checkPowerRating(data)
            this.checkCurrentRating(data)
            this.checkShortCircuitRatings(data)
            this.checkRatedFrequency(data)
            this.checkRefTemperature(data)
            this.checkShortCircuitTest(data)
            this.checkZeroImpedance(data)
            this.checkOther(data)
            return data;
        },

        checkPsrId(data) {
            if (this.parentData.mrid !== null && this.parentData.mrid !== '' && this.parentData.mrid !== undefined) {
                data.psrId = this.parentData.mrid
            }
        },

        async checkAssetPrs(data) {
            if (data.assetPsrId === null || data.assetPsrId === '') {
                data.assetPsrId = uuid.newUuid();
            }
        },

        checkOldTransformerEndInfo(data) {
            if (data.oldTransformerEndInfo.length === 0) {
                if (data.properties.type === this.$constant.THREE_WINDING || data.properties.type === this.$constant.WITH_TERT) {
                    for (let i = 1; i <= 3; i++) {
                        const transformerEndInfo = new OldTransformerEndInfo();
                        transformerEndInfo.mrid = uuid.newUuid();
                        transformerEndInfo.end_number = i
                        data.oldTransformerEndInfo.push(transformerEndInfo);
                    }
                } else {
                    for (let i = 1; i <= 2; i++) {
                        const transformerEndInfo = new OldTransformerEndInfo();
                        transformerEndInfo.mrid = uuid.newUuid();
                        transformerEndInfo.end_number = i
                        data.oldTransformerEndInfo.push(transformerEndInfo);
                    }
                }
            } else {
                if (data.properties.type === this.$constant.THREE_WINDING || data.properties.type !== this.$constant.WITH_TERT) {
                    if (data.oldTransformerEndInfo.length < 3) {
                        const transformerEndInfo = new OldTransformerEndInfo();
                        transformerEndInfo.mrid = uuid.newUuid();
                        transformerEndInfo.end_number = 3
                        data.oldTransformerEndInfo.push(transformerEndInfo);
                    }
                } else {
                    if (data.oldTransformerEndInfo.length > 2) {
                        for (let i = 1; i <= data.oldTransformerEndInfo.length; i++) {
                            if (data.oldTransformerEndInfo[i - 1].end_number === 3) {
                                data.oldTransformerEndInfo.splice(i - 1, 1);
                                break;
                            }
                        }
                    }
                }
            }
        },

        checkLocationId(data) {
            if (data.locationId === null || data.locationId === '') {
                data.locationId = this.locationId;
            }
        },

        checkAsset(data) {
            if (data.properties.mrid === null || data.properties.mrid === '') {
                data.properties.mrid = uuid.newUuid()
            }
        },

        checkLifecycleDate(data) {
            if (data.lifecycleDateId === null || data.lifecycleDateId === '') {
                data.lifecycleDateId = uuid.newUuid()
            }
        },

        checkAssetInfo(data) {
            if (data.oldPowerTransformerInfoId === null || data.oldPowerTransformerInfoId === '') {
                data.oldPowerTransformerInfoId = uuid.newUuid()
            }
        },

        checkProductAssetModel(data) {
            if (data.productAssetModelId === null || data.productAssetModelId === '') {
                data.productAssetModelId = uuid.newUuid()
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

        checkVoltageRating(data) {
            for (let item of data.ratings.voltage_ratings) {
                if (item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if (typeof item[key] === 'object' && item[key] !== null) {
                            if (item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                            }
                        }
                    }
                }
            }
        },

        checkPowerRating(data) {
            for (let item of data.ratings.power_ratings) {
                if (item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if (typeof item[key] === 'object' && item[key] !== null) {
                            if (item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                            }
                        }
                    }
                }
            }
        },

        checkCurrentRating(data) {
            for (let item of data.ratings.current_ratings) {
                if (data.properties.type === this.$constant.WITHOUT_TERT || data.properties.type === this.$constant.TWO_WINDING) {
                    if (item.mrid === null || item.mrid === '') {
                        item.mrid = uuid.newUuid()
                    }
                    for (const key in item) {
                        if (item.hasOwnProperty(key) && key !== 'tert') {
                            if (typeof item[key] === 'object' && item[key] !== null) {
                                if (item[key].mrid === null || item[key].mrid === '') {
                                    item[key].mrid = uuid.newUuid()
                                }
                                if (item[key].data.mrid === null || item[key].data.mrid === '') {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                } else {
                    if (item.mrid === null || item.mrid === '') {
                        item.mrid = uuid.newUuid()
                    }
                    for (const key in item) {
                        if (item.hasOwnProperty(key)) {
                            if (typeof item[key] === 'object' && item[key] !== null) {
                                if (item[key].mrid === null || item[key].mrid === '') {
                                    item[key].mrid = uuid.newUuid()
                                }
                                if (item[key].data.mrid === null || item[key].data.mrid === '') {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                }
            }
        },

        checkShortCircuitRatings(data) {
            if (data.ratings.short_circuit.mrid === null || data.ratings.short_circuit.mrid === '') {
                data.ratings.short_circuit.mrid = uuid.newUuid()
                if (data.ratings.short_circuit.ka.mrid === null || data.ratings.short_circuit.ka.mrid === '') {
                    data.ratings.short_circuit.ka.mrid = uuid.newUuid()
                }
                if (data.ratings.short_circuit.s.mrid === null || data.ratings.short_circuit.s.mrid === '') {
                    data.ratings.short_circuit.s.mrid = uuid.newUuid()
                }
            }
        },

        checkRatedFrequency(data) {
            if (data.ratings.rated_frequency.mrid === null || data.ratings.rated_frequency.mrid === '') {
                data.ratings.rated_frequency.mrid = uuid.newUuid()
            }
        },

        checkRefTemperature(data) {
            if (data.impedances.ref_temp.mrid === null || data.impedances.ref_temp.mrid === '') {
                data.impedances.ref_temp.mrid = uuid.newUuid()
            }
        },

        checkShortCircuitTest(data) {
            for (let item of data.impedances.prim_sec) {
                if (item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if (typeof item[key] === 'object' && item[key] !== null) {
                            if (item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                                if (item[key].data && (item[key].data.mrid === null || item[key].data.mrid === '')) {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                }
            }

            for (let item of data.impedances.prim_tert) {
                if (item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if (typeof item[key] === 'object' && item[key] !== null) {
                            if (item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                                if (item[key].data && (item[key].data.mrid === null || item[key].data.mrid === '')) {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                }
            }

            for (let item of data.impedances.sec_tert) {
                if (item.mrid === null || item.mrid === '') {
                    item.mrid = uuid.newUuid()
                }
                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        if (typeof item[key] === 'object' && item[key] !== null) {
                            if (item[key].mrid === null || item[key].mrid === '') {
                                item[key].mrid = uuid.newUuid()
                                if (item[key].data && (item[key].data.mrid === null || item[key].data.mrid === '')) {
                                    item[key].data.mrid = uuid.newUuid()
                                }
                            }
                        }
                    }
                }
            }
        },

        checkZeroImpedance(data) {
            if (data.impedances.zero_sequence_impedance.mrid === null || data.impedances.zero_sequence_impedance.mrid === '') {
                data.impedances.zero_sequence_impedance.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.base_power.mrid === null || data.impedances.zero_sequence_impedance.base_power.mrid === '') {
                data.impedances.zero_sequence_impedance.base_power.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.base_power.data.mrid === null || data.impedances.zero_sequence_impedance.base_power.data.mrid === '') {
                data.impedances.zero_sequence_impedance.base_power.data.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.base_voltage.mrid === null || data.impedances.zero_sequence_impedance.base_voltage.mrid === '') {
                data.impedances.zero_sequence_impedance.base_voltage.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.base_voltage.data.mrid === null || data.impedances.zero_sequence_impedance.base_voltage.data.mrid === '') {
                data.impedances.zero_sequence_impedance.base_voltage.data.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.zero_percent.prim.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.prim.mrid === '') {
                data.impedances.zero_sequence_impedance.zero_percent.prim.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.zero_percent.prim.data.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.prim.data.mrid === '') {
                data.impedances.zero_sequence_impedance.zero_percent.prim.data.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.zero_percent.sec.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.sec.mrid === '') {
                data.impedances.zero_sequence_impedance.zero_percent.sec.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.zero_percent.sec.data.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.sec.data.mrid === '') {
                data.impedances.zero_sequence_impedance.zero_percent.sec.data.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.zero_percent.zero.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.zero.mrid === '') {
                data.impedances.zero_sequence_impedance.zero_percent.zero.mrid = uuid.newUuid()
            }
            if (data.impedances.zero_sequence_impedance.zero_percent.zero.data.mrid === null || data.impedances.zero_sequence_impedance.zero_percent.zero.data.mrid === '') {
                data.impedances.zero_sequence_impedance.zero_percent.zero.data.mrid = uuid.newUuid()
            }
        },

        checkOther(data) {
            if (data.others.mrid === null || data.others.mrid === '') {
                data.others.mrid = uuid.newUuid()
            }
            if (data.others.insulation.weight.mrid === null || data.others.insulation.weight.mrid === '') {
                data.others.insulation.weight.mrid = uuid.newUuid()
            }
            if (data.others.insulation.volume.mrid === null || data.others.insulation.volume.mrid === '') {
                data.others.insulation.volume.mrid = uuid.newUuid()
            }
            if (data.others.total_weight.mrid === null || data.others.total_weight.mrid === '') {
                data.others.total_weight.mrid = uuid.newUuid()
            }
        },

        changeDataBushing() {
            const bushingTemplate = {
                pos: '',
                asset_type: '',
                serial_no: '',
                manufacturer: '',
                manufacturer_type: '',
                manufacturer_year: '',
                insulation_level: {
                    value: '',
                    label: 'kV',
                    unit: 'k|V'
                },
                voltage_l_ground: {
                    value: '',
                    label: 'kV',
                    unit: 'k|V'
                },
                max_system_voltage: {
                    value: '',
                    label: 'kV',
                    unit: 'k|V'
                },
                rate_current: {
                    value: '',
                    label: 'A',
                    unit: 'A'
                },
                df_c1: {
                    value: '',
                    label: '%',
                    unit: '%'
                },
                cap_c1: {
                    value: '',
                    label: 'pF',
                    unit: 'p|F'
                },
                df_c2: {
                    value: '',
                    label: '%',
                    unit: '%'
                },
                cap_c2: {
                    value: '',
                    label: 'pF',
                    unit: 'p|F'
                },
                insulation_type: ''
            }
            if (this.transformerDto.properties.type === this.$constant.TWO_WINDING) {
                if (this.transformerDto.winding_configuration.phases === '1') {
                    this.transformerDto.bushing_data.tert = []
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.prim.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.prim.length < 2) {
                            for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 2; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.prim.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                this.transformerDto.bushing_data.prim.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                            this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.sec.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.sec.length < 2) {
                            for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 2; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.sec.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                            this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                } else if (this.transformerDto.winding_configuration.phases === '3') {
                    this.transformerDto.bushing_data.tert = []
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        if (this.transformerDto.winding_configuration.vector_group.prim === WindingConnection.Yn) {
                            for (let i = 1; i <= 4; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else {
                            for (let i = 1; i <= 3; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        }
                    } else {
                        if (this.transformerDto.winding_configuration.vector_group.prim === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.prim === '') {
                            if (this.transformerDto.bushing_data.prim.length < 4) {
                                for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 4; i++) {
                                    const bushing = Object.assign({}, bushingTemplate);
                                    bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.prim.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                    this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                    this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            }
                        } else {
                            if (this.transformerDto.bushing_data.prim.length < 3) {
                                for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 3; i++) {
                                    const bushing = Object.assign({}, bushingTemplate);
                                    bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.prim.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                    this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                if (this.transformerDto.bushing_data.prim.length === 3) {
                                    for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                        this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                } else {
                                    for (let i = 1; i <= 3; i++) {
                                        this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                    this.transformerDto.bushing_data.prim.splice(3, 1);
                                }
                            }
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        if (this.transformerDto.winding_configuration.vector_group.sec.i === WindingConnection.Yn) {
                            for (let i = 1; i <= 4; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else {
                            for (let i = 1; i <= 3; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        }
                    } else {
                        if (this.transformerDto.winding_configuration.vector_group.sec.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.sec.i === '') {
                            if (this.transformerDto.bushing_data.sec.length < 4) {
                                for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 4; i++) {
                                    const bushing = Object.assign({}, bushingTemplate);
                                    bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.sec.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                    this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                    this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            }
                        } else {
                            if (this.transformerDto.bushing_data.sec.length < 3) {
                                for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 3; i++) {
                                    const bushing = Object.assign({}, bushingTemplate);
                                    bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.sec.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                    this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                if (this.transformerDto.bushing_data.sec.length === 3) {
                                    for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                        this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                } else {
                                    for (let i = 1; i <= 3; i++) {
                                        this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                    this.transformerDto.bushing_data.sec.splice(3, 1);
                                }
                            }
                        }
                    }
                }
            } else if (this.transformerDto.properties.type === this.$constant.THREE_WINDING) {
                if (this.transformerDto.winding_configuration.phases === '1') {
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.prim.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.prim.length < 2) {
                            for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 2; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.prim.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                this.transformerDto.bushing_data.prim.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                            this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.sec.push(bushing);
                        }
                    }
                    else {
                        if (this.transformerDto.bushing_data.sec.length < 2) {
                            for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 2; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.sec.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                            this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.tert.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.tert.push(bushing);
                        }
                    }
                    else {
                        if (this.transformerDto.bushing_data.tert.length < 2) {
                            for (let i = this.transformerDto.bushing_data.tert.length + 1; i <= 2; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.tert.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.tert.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.tert.length; i++) {
                                this.transformerDto.bushing_data.tert.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.tert.length; i++) {
                            this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                } else if (this.transformerDto.winding_configuration.phases === '3') {
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        if (this.transformerDto.winding_configuration.vector_group.prim === WindingConnection.Yn) {
                            for (let i = 1; i <= 4; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else {
                            for (let i = 1; i <= 3; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        }
                    } else {
                        if (this.transformerDto.winding_configuration.vector_group.prim === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.prim === '') {
                            if (this.transformerDto.bushing_data.prim.length < 4) {
                                for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 4; i++) {
                                    const bushing = Object.assign({}, bushingTemplate);
                                    bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.prim.push(bushing);
                                }
                            }
                            for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            }
                        } else {
                            if (this.transformerDto.bushing_data.prim.length < 3) {
                                for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 3; i++) {
                                    const bushing = Object.assign({}, bushingTemplate);
                                    bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.prim.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                    this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                if (this.transformerDto.bushing_data.prim.length === 3) {
                                    for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                        this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                } else {
                                    for (let i = 1; i <= 3; i++) {
                                        this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                    this.transformerDto.bushing_data.prim.splice(3, 1);
                                }
                            }
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        if (this.transformerDto.winding_configuration.vector_group.sec.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.sec.i === '' || this.transformerDto.winding_configuration.vector_group.sec.i === WindingConnection.Zn) {
                            for (let i = 1; i <= 4; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else {
                            for (let i = 1; i <= 3; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        }
                    }
                    else {
                        if (this.transformerDto.winding_configuration.vector_group.sec.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.prim === '' || this.transformerDto.winding_configuration.vector_group.sec.i === WindingConnection.Zn) {
                            if (this.transformerDto.bushing_data.sec.length < 4) {
                                for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 4; i++) {
                                    const bushing = Object.assign({}, bushingTemplate);
                                    bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.sec.push(bushing);
                                }
                            }
                            for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            }
                        } else {
                            if (this.transformerDto.bushing_data.sec.length < 3) {
                                for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 3; i++) {
                                    const bushing = Object.assign({}, bushingTemplate);
                                    bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.sec.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                    this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                if (this.transformerDto.bushing_data.sec.length === 3) {
                                    for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                        this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                } else {
                                    for (let i = 1; i <= 3; i++) {
                                        this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                    this.transformerDto.bushing_data.sec.splice(3, 1);
                                }
                            }
                        }
                    }
                    if (this.transformerDto.bushing_data.tert.length === 0) {
                        if (this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.tert.i === '' || this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Zn) {
                            for (let i = 1; i <= 4; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.tert.push(bushing);
                            }
                        } else {
                            for (let i = 1; i <= 3; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.tert.push(bushing);
                            }
                        }
                    }
                    else {
                        if (this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.tert.i === '' || this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Zn) {
                            if (this.transformerDto.bushing_data.tert.length < 4) {
                                for (let i = this.transformerDto.bushing_data.tert.length + 1; i <= 4; i++) {
                                    const bushing = Object.assign({}, bushingTemplate);
                                    bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.tert.push(bushing);
                                }
                            }
                            for (let i = 1; i <= this.transformerDto.bushing_data.tert.length; i++) {
                                this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            }
                        } else {
                            if (this.transformerDto.bushing_data.tert.length < 3) {
                                for (let i = this.transformerDto.bushing_data.tert.length + 1; i <= 3; i++) {
                                    const bushing = Object.assign({}, bushingTemplate);
                                    bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.tert.push(bushing);
                                }
                                for (let i = 1; i <= this.transformerDto.bushing_data.tert.length; i++) {
                                    this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            } else {
                                if (this.transformerDto.bushing_data.tert.length === 3) {
                                    for (let i = 1; i <= this.transformerDto.bushing_data.tert.length; i++) {
                                        this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                } else {
                                    for (let i = 1; i <= 3; i++) {
                                        this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    }
                                    this.transformerDto.bushing_data.tert.splice(3, 1);
                                }
                            }
                        }
                    }
                }
            } else if (this.transformerDto.properties.type === this.$constant.WITH_TERT) {
                if (this.transformerDto.winding_configuration.phases === '1') {
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.prim.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.prim.length < 2) {
                            for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 2; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.prim.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                this.transformerDto.bushing_data.prim.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                            this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        for (let i = 1; i <= 1; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.sec.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.sec.length < 1) {
                            for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 1; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.sec.length > 1) {
                            for (let i = 2; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                            this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.tert.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.tert.push(bushing);
                        }
                    }
                    else {
                        if (this.transformerDto.bushing_data.tert.length < 2) {
                            for (let i = this.transformerDto.bushing_data.tert.length + 1; i <= 2; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.tert.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.tert.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.tert.length; i++) {
                                this.transformerDto.bushing_data.tert.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.tert.length; i++) {
                            this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                } else if (this.transformerDto.winding_configuration.phases === '3') {
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        for (let i = 1; i <= 4; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.prim.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.prim.length < 4) {
                            for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 4; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                            this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        for (let i = 1; i <= 3; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.sec.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.sec.length < 3) {
                            for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 3; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.sec.length > 3) {
                            for (let i = 4; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                            this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.tert.length === 0) {
                        if (this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.tert.i === '' || this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Zn) {
                            for (let i = 1; i <= 4; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.tert.push(bushing);
                            }
                        }
                    } else {
                        if (this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.tert.i === '' || this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Zn) {
                            for (let i = 1; i <= 4; i++) {
                                if (i > this.transformerDto.bushing_data.tert.length) {
                                    const bushing = Object.assign({}, bushingTemplate);
                                    bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.tert.push(bushing);
                                } else {
                                    this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                }
                            }
                        } else {
                            if (this.transformerDto.bushing_data.tert.length < 3) {
                                for (let i = this.transformerDto.bushing_data.tert.length + 1; i <= 3; i++) {
                                    const bushing = Object.assign({}, bushingTemplate);
                                    bushing.pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                    this.transformerDto.bushing_data.tert.push(bushing);
                                }
                            } else if (this.transformerDto.bushing_data.tert.length > 3) {
                                for (let i = 4; i <= this.transformerDto.bushing_data.tert.length; i++) {
                                    this.transformerDto.bushing_data.tert.splice(i - 1, 1);
                                }
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.tert.length; i++) {
                            this.transformerDto.bushing_data.tert[i - 1].pos = this.bushingPosReturn(i, 'tert', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                }
            } else if (this.transformerDto.properties.type === this.$constant.WITHOUT_TERT) {
                if (this.transformerDto.winding_configuration.phases === '1') {
                    this.transformerDto.bushing_data.tert = [];
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        for (let i = 1; i <= 2; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.prim.push(bushing);
                        }

                    } else {
                        if (this.transformerDto.bushing_data.prim.length < 2) {
                            for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 2; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.prim.length > 2) {
                            for (let i = 3; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                this.transformerDto.bushing_data.prim.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                            this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        for (let i = 1; i <= 1; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.sec.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.sec.length < 1) {
                            for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 1; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.sec.length > 1) {
                            for (let i = 2; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                            this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                } else if (this.transformerDto.winding_configuration.phases === '3') {
                    this.transformerDto.bushing_data.tert = [];
                    if (this.transformerDto.bushing_data.prim.length === 0) {
                        for (let i = 1; i <= 4; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.prim.push(bushing);
                        }

                    } else {
                        if (this.transformerDto.bushing_data.prim.length < 4) {
                            for (let i = this.transformerDto.bushing_data.prim.length + 1; i <= 4; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.prim.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.prim.length > 4) {
                            for (let i = 5; i <= this.transformerDto.bushing_data.prim.length; i++) {
                                this.transformerDto.bushing_data.prim.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.prim.length; i++) {
                            this.transformerDto.bushing_data.prim[i - 1].pos = this.bushingPosReturn(i, 'prim', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                    if (this.transformerDto.bushing_data.sec.length === 0) {
                        for (let i = 1; i <= 3; i++) {
                            const bushing = Object.assign({}, bushingTemplate);
                            bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                            this.transformerDto.bushing_data.sec.push(bushing);
                        }
                    } else {
                        if (this.transformerDto.bushing_data.sec.length < 3) {
                            for (let i = this.transformerDto.bushing_data.sec.length + 1; i <= 3; i++) {
                                const bushing = Object.assign({}, bushingTemplate);
                                bushing.pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                                this.transformerDto.bushing_data.sec.push(bushing);
                            }
                        } else if (this.transformerDto.bushing_data.sec.length > 3) {
                            for (let i = 4; i <= this.transformerDto.bushing_data.sec.length; i++) {
                                this.transformerDto.bushing_data.sec.splice(i - 1, 1);
                            }
                        }
                        for (let i = 1; i <= this.transformerDto.bushing_data.sec.length; i++) {
                            this.transformerDto.bushing_data.sec[i - 1].pos = this.bushingPosReturn(i, 'sec', this.transformerDto.properties.type, this.transformerDto.winding_configuration.phases);
                        }
                    }
                }
            }

            this.changeSurgeArresterData();
        },

        bushingPosReturn(i, end_label, type, phases) {
            const vectorGroup = this.transformerDto.winding_configuration.vector_group
            if (type == this.$constant.TWO_WINDING) {
                if (phases === '1') {
                    if (end_label === 'prim') {
                        if (i == 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.A
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.B
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.C
                            }
                            else {
                                return 1
                            }
                        } else if (i == 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.B
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.C
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.A
                            } else {
                                return 2
                            }
                        }
                    } else if (end_label === 'sec') {
                        if (i == 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.sec === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.a1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.sec === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.b1
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.sec === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.c1
                            }
                            else if (vectorGroup.prim === WindingConnection.I + 'Spare I') {
                                return 3
                            } else {
                                return 5
                            }
                        } else if (i == 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.n1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.n1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.n1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.b1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.c1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.a1
                            } else if (vectorGroup.prim === WindingConnection.I + 'Spare I') {
                                return 4
                            } else {
                                return 6
                            }
                        }
                    }
                } else if (phases === '3') {
                    if (end_label === 'prim') {
                        if (i == 1) {
                            return PhaseCode.A
                        } else if (i == 2) {
                            return PhaseCode.B
                        } else if (i == 3) {
                            return PhaseCode.C
                        } else if (i == 4) {
                            return PhaseCode.N
                        }
                    } else if (end_label === 'sec') {
                        if (i == 1) {
                            return PhaseCode.a1
                        } else if (i == 2) {
                            return PhaseCode.b1
                        } else if (i == 3) {
                            return PhaseCode.c1
                        }
                        else if (i == 4) {
                            return PhaseCode.n1
                        }
                    }
                }
            } else if (type === this.$constant.THREE_WINDING) {
                if (phases === '1') {
                    if (end_label === 'prim') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.A
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.B
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.C
                            }
                            else {
                                return 1
                            }
                        } else if (i === 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.B
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.C
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.A
                            } else {
                                return 2
                            }
                        }
                    } else if (end_label === 'sec') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.a1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.b1
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.c1
                            }
                            else {
                                return 5
                            }
                        } else if (i === 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.n1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.n1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.n1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.b1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.c1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.a1
                            } else {
                                return 6
                            }
                        }
                    } else if (end_label === 'tert') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.tert === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.a2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.tert === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.b2
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.tert === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.c2
                            }
                            else {
                                return 9
                            }
                        } else if (i === 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.n2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.n2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.n2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.b2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.c2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.a2
                            } else {
                                return 10
                            }
                        }
                    }
                } else if (phases === '3') {
                    if (end_label === 'prim') {
                        if (i === 1) {
                            return PhaseCode.A
                        } else if (i === 2) {
                            return PhaseCode.B
                        } else if (i === 3) {
                            return PhaseCode.C
                        } else if (i === 4) {
                            return PhaseCode.N
                        }
                    } else if (end_label === 'sec') {
                        if (i === 1) {
                            return PhaseCode.a1
                        } else if (i === 2) {
                            return PhaseCode.b1
                        } else if (i === 3) {
                            return PhaseCode.c1
                        }
                        else if (i === 4) {
                            return PhaseCode.n1
                        }
                    } else if (end_label === 'tert') {
                        if (i === 1) {
                            return PhaseCode.a2
                        } else if (i === 2) {
                            return PhaseCode.b2
                        } else if (i === 3) {
                            return PhaseCode.c2
                        }
                        else if (i === 4) {
                            return PhaseCode.n2
                        }
                    }
                }

            } else if (type === this.$constant.WITH_TERT) {
                if (phases === '1') {
                    if (end_label === 'prim') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.A
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.B
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.C
                            }
                            else {
                                return 1
                            }
                        } else if (i === 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.B
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.C
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.A
                            } else if (vectorGroup.prim === WindingConnection.I + 'Spare I') {
                                return '2+4'
                            } else {
                                return 2
                            }
                        }
                    } else if (end_label === 'sec') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.a1
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.b1
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.c1
                            }
                            else {
                                return 5
                            }
                        }
                    } else if (end_label === 'tert') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.a2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.b2
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.c2
                            }
                            else {
                                return 9
                            }
                        } else if (i === 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.n2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.n2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.n2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.b2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.c2
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.a2
                            } else {
                                return 2
                            }
                        }
                    }
                } else if (phases === '3') {
                    if (end_label === 'prim') {
                        if (i === 1) {
                            return PhaseCode.A
                        } else if (i === 2) {
                            return PhaseCode.B
                        } else if (i === 3) {
                            return PhaseCode.C
                        }
                        else if (i === 4) {
                            return PhaseCode.N
                        }
                    } else if (end_label === 'sec') {
                        if (i === 1) {
                            return PhaseCode.a1
                        } else if (i === 2) {
                            return PhaseCode.b1
                        }
                        else if (i === 3) {
                            return PhaseCode.c1
                        }
                    } else if (end_label === 'tert') {
                        if (this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Yn || this.transformerDto.winding_configuration.vector_group.tert.i === '' || this.transformerDto.winding_configuration.vector_group.tert.i === WindingConnection.Zn) {
                            if (i === 1) {
                                return PhaseCode.a2
                            } else if (i === 2) {
                                return PhaseCode.b2
                            } else if (i === 3) {
                                return PhaseCode.c2
                            }
                            else if (i === 4) {
                                return PhaseCode.n2
                            }
                        }
                        else {
                            if (i === 1) {
                                return PhaseCode.a2
                            } else if (i === 2) {
                                return PhaseCode.b2
                            } else if (i === 3) {
                                return PhaseCode.c2
                            }
                        }
                    }
                }
            } else if (type === this.$constant.WITHOUT_TERT) {
                if (phases === '1') {
                    if (end_label === 'prim') {
                        if (i === 1) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.A
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.B
                            }
                            else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.C
                            }
                            else {
                                return 1
                            }
                        } else if (i === 2) {
                            if (vectorGroup.prim === WindingConnection.I + PhaseCode.A) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C) {
                                return PhaseCode.N
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                                return PhaseCode.B
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                                return PhaseCode.C
                            } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                                return PhaseCode.A
                            } else if (vectorGroup.prim === WindingConnection.I + 'Spare I') {
                                return '2+4'
                            } else {
                                return 2
                            }
                        }
                    } else if (end_label === 'sec') {
                        if (vectorGroup.prim === WindingConnection.I + PhaseCode.A || vectorGroup.prim === WindingConnection.I + PhaseCode.AB) {
                            return PhaseCode.a1
                        } else if (vectorGroup.prim === WindingConnection.I + PhaseCode.B || vectorGroup.prim === WindingConnection.I + PhaseCode.BC) {
                            return PhaseCode.b1
                        }
                        else if (vectorGroup.prim === WindingConnection.I + PhaseCode.C || vectorGroup.prim === WindingConnection.I + PhaseCode.CA) {
                            return PhaseCode.c1
                        }
                        else if (vectorGroup.prim === WindingConnection.I + 'Spare I') {
                            return 5
                        }
                        else {
                            return 1
                        }
                    }
                } else if (phases === '3') {
                    if (end_label === 'prim') {
                        if (i === 1) {
                            return PhaseCode.A
                        } else if (i === 2) {
                            return PhaseCode.B
                        } else if (i === 3) {
                            return PhaseCode.C
                        } else if (i === 4) {
                            return PhaseCode.N
                        }
                    } else if (end_label === 'sec') {
                        if (i === 1) {
                            return PhaseCode.a1
                        } else if (i === 2) {
                            return PhaseCode.b1
                        } else if (i === 3) {
                            return PhaseCode.c1
                        }
                    }
                }
            }
        },

        changeSurgeArresterData() {
            const surgeArresterTemplate = {
                sign: false,
                properties: {
                    serial_no: '',
                    manufacturer: '',
                    manufacturer_year: '',
                    asset_system_code: '',
                },
                ratings: {
                    pos: '',
                    unit: '',
                    table: []
                }
            }
            //primary
            if (this.transformerDto.surge_arrester.prim.length === 0) {
                for (let i = 0; i < this.transformerDto.bushing_data.prim.length; i++) {
                    const surgeArresterPrim = JSON.parse(JSON.stringify(surgeArresterTemplate))
                    surgeArresterPrim.ratings.pos = this.transformerDto.bushing_data.prim[i].pos;
                    this.transformerDto.surge_arrester.prim.push(surgeArresterPrim)
                }
            } else {
                if (this.transformerDto.surge_arrester.prim.length < this.transformerDto.bushing_data.prim.length) {
                    for (let i = this.transformerDto.surge_arrester.prim.length; i < this.transformerDto.bushing_data.prim.length; i++) {
                        const surgeArresterPrim = JSON.parse(JSON.stringify(surgeArresterTemplate))
                        surgeArresterPrim.ratings.pos = this.transformerDto.bushing_data.prim[i].pos;
                        this.transformerDto.surge_arrester.prim.push(surgeArresterPrim)
                    }
                } else if (this.transformerDto.surge_arrester.prim.length > this.transformerDto.bushing_data.prim.length) {
                    for (let i = this.transformerDto.bushing_data.prim.length; i < this.transformerDto.surge_arrester.prim.length; i++) {
                        this.transformerDto.surge_arrester.prim.splice(i, 1);
                    }
                }
                for (let i = 0; i < this.transformerDto.surge_arrester.prim.length; i++) {
                    this.transformerDto.surge_arrester.prim[i].ratings.pos = this.transformerDto.bushing_data.prim[i].pos;
                }
            }
            //secondary
            if (this.transformerDto.surge_arrester.sec.length === 0) {
                for (let i = 0; i < this.transformerDto.bushing_data.sec.length; i++) {
                    const surgeArresterSec = JSON.parse(JSON.stringify(surgeArresterTemplate))
                    surgeArresterSec.ratings.pos = this.transformerDto.bushing_data.sec[i].pos;
                    this.transformerDto.surge_arrester.sec.push(surgeArresterSec)
                }
            } else {
                if (this.transformerDto.surge_arrester.sec.length < this.transformerDto.bushing_data.sec.length) {
                    for (let i = this.transformerDto.surge_arrester.sec.length; i < this.transformerDto.bushing_data.sec.length; i++) {
                        const surgeArresterSec = Object.assign({}, surgeArresterTemplate);
                        surgeArresterSec.ratings.pos = this.transformerDto.bushing_data.sec[i].pos;
                        this.transformerDto.surge_arrester.sec.push(surgeArresterSec)
                    }
                } else if (this.transformerDto.surge_arrester.sec.length > this.transformerDto.bushing_data.sec.length) {
                    for (let i = this.transformerDto.bushing_data.sec.length; i < this.transformerDto.surge_arrester.sec.length; i++) {
                        this.transformerDto.surge_arrester.sec.splice(i, 1);
                    }
                }
                for (let i = 0; i < this.transformerDto.surge_arrester.sec.length; i++) {
                    this.transformerDto.surge_arrester.sec[i].ratings.pos = this.transformerDto.bushing_data.sec[i].pos;
                }
            }
            //tertiary
            if (this.transformerDto.surge_arrester.tert.length === 0) {
                for (let i = 0; i < this.transformerDto.bushing_data.tert.length; i++) {
                    const surgeArresterTert = JSON.parse(JSON.stringify(surgeArresterTemplate))
                    surgeArresterTert.ratings.pos = this.transformerDto.bushing_data.tert[i].pos;
                    this.transformerDto.surge_arrester.tert.push(surgeArresterTert)
                }
            } else {
                if (this.transformerDto.surge_arrester.tert.length < this.transformerDto.bushing_data.tert.length) {
                    for (let i = this.transformerDto.surge_arrester.tert.length; i < this.transformerDto.bushing_data.tert.length; i++) {
                        const surgeArresterTert = JSON.parse(JSON.stringify(surgeArresterTemplate))
                        surgeArresterTert.ratings.pos = this.transformerDto.bushing_data.tert[i].pos;
                        this.transformerDto.surge_arrester.tert.push(surgeArresterTert)
                    }
                } else if (this.transformerDto.surge_arrester.tert.length > this.transformerDto.bushing_data.tert.length) {
                    for (let i = this.transformerDto.bushing_data.tert.length; i < this.transformerDto.surge_arrester.tert.length; i++) {
                        this.transformerDto.surge_arrester.tert.splice(i, 1);
                    }
                }
                for (let i = 0; i < this.transformerDto.surge_arrester.tert.length; i++) {
                    this.transformerDto.surge_arrester.tert[i].ratings.pos = this.transformerDto.bushing_data.tert[i].pos;
                }
            }
        },

        removeShortCircuitTest(mrid) {
            for (let index in this.transformerDto.shortCircuitTestTransformerEndInfo) {
                if (this.transformerDto.shortCircuitTestTransformerEndInfo[index].short_circuit_test_id === mrid) {
                    this.transformerDto.shortCircuitTestTransformerEndInfo.splice(index, 1);
                }
            }
        },

        removeShortCircuitTestArr(mrids) {
            this.transformerDto.shortCircuitTestTransformerEndInfo = this.transformerDto.shortCircuitTestTransformerEndInfo.filter(item => !mrids.includes(item.short_circuit_test_id));
        },

        addShortCircuitTest(mrid) {
            this.transformerDto.shortCircuitTestTransformerEndInfo.push({
                mrid: uuid.newUuid(),
                short_circuit_test_id: mrid,
                transformer_end_info_id: ''
            })
        },

    }
}
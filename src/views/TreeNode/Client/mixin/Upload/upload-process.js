/* eslint-disable */
import * as demoAPI from '@/api/demo/index.js'
import * as voltageAPI from '@/api/demo/VoltageTransformer.js'
import * as currentAPI from '@/api/demo/CurrentTransformer.js'

import * as voltageTransformerMapping from '@/views/Mapping/VoltageTransformer/index.js'
import * as currentTransformerMapping from '@/views/Mapping/CurrentTransformer/index.js'

import * as PowerCableMapping from '@/views/Mapping/PowerCable/index'
import * as PowerCableServerMapper from '@/views/Mapping/ServerToDTO/PowerCable/index.js'
import { mapSubstationEntityToServer } from '@/utils/MapperClient/mapSubstationToServer.js'
import { mapVoltageLevelEntityToServer } from '@/utils/MapperClient/mapVoltageLevelToServer.js'
import { mapBayEntityToServer } from '@/utils/MapperClient/mapBayToServer.js'
import { mapTransformerEntityToServer } from '@/utils/MapperClient/mapTransformerToServer.js'
import * as voltageTransformerMappingServer from '@/views/Mapping/ServerToDTO/VoltageTransformer/index.js'
import * as currentTransformerMappingServer from '@/views/Mapping/ServerToDTO/CurrentTransformer/index.js'

/**
 * Mixin chứa các hàm xử lý upload từng loại entity lên server
 */
export default {
    methods: {
        async processUploadSubstation(node) {
            try {
                const userId = this.$store.state.user.user_id
                const entityRes = await window.electronAPI.getSubstationEntityByMrid(node.mrid, userId, node.parentId);
                if (!entityRes.success || !entityRes.data) throw new Error('Local substation data not found.');

                const entity = entityRes.data;
                if (!node.parentId) throw new Error('Cannot upload substation without parent organisation.');

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                const serverPayload = mapSubstationEntityToServer(entity, parentNode);
                const response = await demoAPI.createSubstation(serverPayload, node.parentId);

                console.log('[Upload Substation] Response:', response);
                this.$message.success(`Upload Substation "${node.name}" successfully!`);
                if (this.clientSlide) await this.showLocationRoot();

            } catch (error) {
                console.error('[Upload Substation] Error:', error);
                this._handleUploadError(error);
            }
        },

        async processUploadVoltageLevel(node) {
            try {
                const entityRes = await window.electronAPI.getVoltageLevelEntityByMrid(node.mrid);
                if (!entityRes.success || !entityRes.data) throw new Error('Local voltage level data not found.');

                if (!node.parentId) throw new Error('Cannot upload voltage level without parent substation.');

                const serverPayload = mapVoltageLevelEntityToServer(entityRes.data, null);

                let numericOwnerId = await this.resolveSubstationNumericId(node.parentId);
                if (!numericOwnerId && /^\d+$/.test(String(node.parentId))) {
                    numericOwnerId = parseInt(node.parentId);
                }
                if (!numericOwnerId) throw new Error('Cannot find parent Substation on Server. Make sure Substation is uploaded first.');

                const response = await demoAPI.createVoltageLevel(serverPayload, numericOwnerId);
                console.log('[Upload VoltageLevel] Response:', response);
                this.$message.success(`Upload VoltageLevel "${node.name}" successfully!`);
                if (this.clientSlide) await this.showLocationRoot();

            } catch (error) {
                console.error('[Upload VoltageLevel] Error:', error);
                this._handleUploadError(error);
            }
        },

        async processUploadBay(node) {
            try {
                const entityRes = await window.electronAPI.getBayEntityByMrid(node.mrid);
                if (!entityRes.success || !entityRes.data) throw new Error('Local bay data not found.');

                if (!node.parentId) throw new Error('Cannot upload bay without parent.');

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                const substationId = parentNode?.parentId;

                let ownerType = ''
                let numericOwnerId = null

                if (parentNode?.mode === 'voltageLevel') {
                    ownerType = 'VOLTAGE_LEVEL';
                    numericOwnerId = await this.resolveVoltageLevelNumericId(node.parentId, substationId);
                } else if (parentNode?.mode === 'substation') {
                    ownerType = 'SUBSTATION';
                    numericOwnerId = await this.resolveSubstationNumericId(node.parentId);
                }

                // Fallback: parentId đã là numeric
                if (!numericOwnerId && /^\d+$/.test(String(node.parentId))) {
                    numericOwnerId = parseInt(node.parentId);
                    ownerType = parentNode?.mode === 'voltageLevel' ? 'VOLTAGE_LEVEL' : 'SUBSTATION';
                }

                if (!numericOwnerId || !ownerType) {
                    throw new Error(`Cannot find Numeric ID for parent (UUID: ${node.parentId}). Make sure parent is uploaded first.`);
                }

                const serverPayload = mapBayEntityToServer(entityRes.data);
                const response = await demoAPI.createBay(serverPayload, numericOwnerId, ownerType);

                console.log('[Upload Bay] Response:', response);
                this.$message.success(`Upload Bay "${node.name}" successfully!`);
                if (this.clientSlide) await this.showLocationRoot();

            } catch (error) {
                console.error('[Upload Bay] Error:', error);
                this._handleUploadError(error);
            }
        },

        async processUploadPowerCable(node) {
            try {
                const entityRes = await window.electronAPI.getPowerCableEntityByMrid(node.mrid, node.parentId);
                if (!entityRes.success || !entityRes.data) throw new Error('Local data not found.');

                const dto = PowerCableMapping.mapEntityToDto(entityRes.data);
                if (!dto.properties.apparatus_id && !dto.properties.serial_no) {
                    dto.properties.apparatus_id = node.name || 'Unnamed Asset';
                }
                const serverPayload = PowerCableServerMapper.mapDtoToServer(dto);

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);
                if (!parentNode) throw new Error('Parent node not found in Client Tree');

                let ownerType = 'SUBSTATION';
                if (parentNode.mode === 'bay') ownerType = 'BAY';
                else if (parentNode.mode === 'voltageLevel') ownerType = 'VOLTAGE_LEVEL';

                if (node.parentId === 'e423cbd1-470b-4b8b-b06d-74575075fe02') ownerType = 'BAY';

                const numericOwnerId = await this.resolveServerParentId(node.parentId, ownerType);
                if (!numericOwnerId) throw new Error(`Cannot find Numeric ID for parent (UUID: ${node.parentId}).`);

                const response = await demoAPI.createPowerCableCim(serverPayload, numericOwnerId, ownerType);
                if (response) this.$message.success(`Upload successfully to Bay ID: ${numericOwnerId}`);

            } catch (error) {
                console.error('[Upload PowerCable] Error:', error);
                this._handleUploadError(error);
            }
        },

        async processUploadTransformer(node) {
            try {
                const userId = this.$store.state.user.user_id;
                const entityRes = await window.electronAPI.getTransformerEntityByMrid(node.mrid, userId, node.parentId);
                if (!entityRes.success || !entityRes.data) throw new Error('Local transformer data not found.');

                if (!node.parentId) throw new Error('Cannot upload transformer without parent.');

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);

                let ownerType = ''
                let numericOwnerId = null

                if (parentNode?.mode === 'bay') {
                    ownerType = 'BAY';
                    numericOwnerId = await this.findBayNumericIdGlobal(node.parentId);
                } else if (parentNode?.mode === 'substation') {
                    ownerType = 'SUBSTATION';
                    numericOwnerId = await this.resolveSubstationNumericId(node.parentId);
                }

                if (!numericOwnerId && /^\d+$/.test(String(node.parentId))) {
                    numericOwnerId = parseInt(node.parentId);
                    ownerType = parentNode?.mode === 'bay' ? 'BAY' : 'SUBSTATION';
                }

                if (!numericOwnerId || !ownerType) {
                    throw new Error(`Cannot find Numeric ID for parent (UUID: ${node.parentId}). Make sure parent is uploaded first.`);
                }

                const serverPayload = mapTransformerEntityToServer(entityRes.data);
                const response = await demoAPI.createTransformer(serverPayload, numericOwnerId, ownerType);

                console.log('[Upload Transformer] Response:', response);
                this.$message.success(`Upload Transformer "${node.name}" successfully!`);
                if (this.clientSlide) await this.showLocationRoot();

            } catch (error) {
                console.error('[Upload Transformer] Error:', error);
                this._handleUploadError(error);
            }
        },

        async processUploadVoltageTransformer(node) {
            try {
                const entityRes = await window.electronAPI.getVoltageTransformerEntityByMrid(node.mrid, node.parentId);
                if (!entityRes.success || !entityRes.data) throw new Error('Voltage transformer data not found.');

                if (!node.parentId) throw new Error('Cannot upload voltage transformer without parent.');

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);

                let ownerType = ''

                if (parentNode?.mode === 'bay') {
                    ownerType = 'BAY';
                } else if (parentNode?.mode === 'substation') {
                    ownerType = 'SUBSTATION';
                }

                const serverPayloadDto = voltageTransformerMapping.mapEntityToDto(entityRes.data);
                const serverPayload = voltageTransformerMappingServer.mapDtoToServer(serverPayloadDto);
                const response = await voltageAPI.createVoltageTransformer(serverPayload, node.parentId, ownerType);

                console.log('[Upload Voltage Transformer] Response:', response);
                this.$message.success(`Upload Voltage Transformer "${node.name}" successfully!`);

            } catch (error) {
                this.$message.error(`Error uploading Voltage Transformer: ${error.message}`);
                console.error('[Upload Voltage Transformer] Error:', error);
                this._handleUploadError(error);
            }
        },

        async processUploadCurrentTransformer(node) {
            try {
                const entityRes = await window.electronAPI.getCurrentTransformerEntityByMrid(node.mrid, node.parentId);
                if (!entityRes.success || !entityRes.data) throw new Error('Current transformer data not found.');

                if (!node.parentId) throw new Error('Cannot upload current transformer without parent.');

                const parentNode = this.findNodeById(node.parentId, this.organisationClientList);

                let ownerType = ''

                if (parentNode?.mode === 'bay') {
                    ownerType = 'BAY';
                } else if (parentNode?.mode === 'substation') {
                    ownerType = 'SUBSTATION';
                }

                const serverPayloadDto = currentTransformerMapping.mapEntityToDto(entityRes.data);
                const serverPayload = currentTransformerMappingServer.mapDtoToServer(serverPayloadDto);
                console.log('Mapped Server Payload:', JSON.stringify(serverPayloadDto));
                // const response = await currentAPI.createCurrentTransformer(serverPayload, node.parentId, ownerType);

                // console.log('[Upload Current Transformer] Response:', response);
                // this.$message.success(`Upload Current Transformer "${node.name}" successfully!`);
                // if (this.clientSlide) await this.showLocationRoot();

            } catch (error) {
                this.$message.error(`Error uploading Current Transformer: ${error.message}`);
                console.error('[Upload Current Transformer] Error:', error);
                this._handleUploadError(error);
            }
        },

        // ─── Helper dùng chung ───────────────────────────────────────────────
        _handleUploadError(error) {
            if (error.response?.data) {
                const msg = error.response.data.message
                    || error.response.data.error
                    || JSON.stringify(error.response.data);
                this.$message.error(`Server Error: ${msg}`);
            } else {
                this.$message.error(error.message || 'Error during upload');
            }
        },
    }
}
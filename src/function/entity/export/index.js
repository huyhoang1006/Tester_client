/**
 * Helper function to sanitize filename (remove invalid characters)
 * @param {string} name
 * @returns {string}
 */
const sanitizeFileName = (name) => {
    if (!name) return 'export-data'
    return name.replace(/[<>:"/\\|?*]/g, '').trim() || 'export-data'
}

/**
 * Fetch entity data and convert to DTO for a single node or multiple nodes
 * @param {Object|Array} nodes - Single node or array of nodes to export
 * @param {Object} dependencies - Object containing electronAPI, mappings, and userId
 * @returns {Promise<Array>} Array of DTOs
 */
export const fetchNodeDataToDto = async (nodes, dependencies) => {
    // Support both single node and array of nodes
    const nodesArray = Array.isArray(nodes) ? nodes : [nodes]
    const { electronAPI, mappings, userId } = dependencies
    const dtos = []

    // Process each node
    for (const node of nodesArray) {
        try {
            if (node.mode === 'substation') {
                const entity = await electronAPI.getSubstationEntityByMrid(node.mrid, userId, node.parentId)
                if (entity.success && entity.data) {
                    const dto = mappings.SubstationMapping.mapEntityToDto(entity.data)
                    dtos.push({ type: 'substation', data: dto })
                }
            } else if (node.mode === 'organisation') {
                const entity = await electronAPI.getOrganisationEntityByMrid(node.mrid)
                if (entity.success && entity.data) {
                    const dto = mappings.OrganisationMapping.OrgEntityToOrgDto(entity.data)
                    dtos.push({ type: 'organisation', data: dto })
                }
            } else if (node.mode === 'voltageLevel') {
                const entity = await electronAPI.getVoltageLevelEntityByMrid(node.mrid)
                if (entity.success && entity.data) {
                    dtos.push({ type: 'voltageLevel', data: entity.data })
                }
            } else if (node.mode === 'bay') {
                const entity = await electronAPI.getBayEntityByMrid(node.mrid)
                if (entity.success && entity.data) {
                    dtos.push({ type: 'bay', data: entity.data })
                }
            } else if (node.mode === 'asset') {
                if (node.asset === 'Surge arrester') {
                    const entity = await electronAPI.getSurgeArresterEntityByMrid(node.mrid)
                    if (entity.success && entity.data) {
                        const dto = mappings.SurgeArresterMapping.mapEntityToDto(entity.data)
                        dtos.push({ type: 'surgeArrester', data: dto })
                    }
                } else if (node.asset === 'Power cable') {
                    const entity = await electronAPI.getPowerCableEntityByMrid(node.mrid, node.parentId)
                    if (entity.success && entity.data) {
                        const dto = mappings.PowerCableMapping.mapEntityToDto(entity.data)
                        dtos.push({ type: 'powerCable', data: dto })
                    }
                } else if (node.asset === 'Disconnector') {
                    const entity = await electronAPI.getDisconnectorEntityByMrid(node.mrid, node.parentId)
                    if (entity.success && entity.data) {
                        const dto = mappings.DisconnectorMapping.disconnectorEntityToDto(entity.data)
                        dtos.push({ type: 'disconnector', data: dto })
                    }
                } else if (node.asset === 'Rotating machine') {
                    const entity = await electronAPI.getRotatingMachineEntityByMrid(node.mrid, node.parentId)
                    if (entity.success && entity.data) {
                        const dto = mappings.rotatingMachineMapping.mapEntityToDto(entity.data)
                        dtos.push({ type: 'rotatingMachine', data: dto })
                    }
                } else if (node.asset === 'Capacitor') {
                    const entity = await electronAPI.getCapacitorEntityByMrid(node.mrid, node.parentId)
                    if (entity.success && entity.data) {
                        const dto = mappings.CapacitorMapping.mapEntityToDto(entity.data)
                        dtos.push({ type: 'capacitor', data: dto })
                    }
                } else if (node.asset === 'Voltage transformer') {
                    const entity = await electronAPI.getVoltageTransformerEntityByMrid(node.mrid, node.parentId)
                    if (entity.success && entity.data) {
                        const dto = mappings.VoltageTransformerMapping.mapEntityToDto(entity.data)
                        dtos.push({ type: 'voltageTransformer', data: dto })
                    }
                } else if (node.asset === 'Current transformer') {
                    const entity = await electronAPI.getCurrentTransformerEntityByMrid(node.mrid, node.parentId)
                    if (entity.success && entity.data) {
                        const dto = mappings.CurrentTransformerMapping.mapEntityToDto(entity.data)
                        dtos.push({ type: 'currentTransformer', data: dto })
                    }
                } else if (node.asset === 'Transformer') {
                    const entity = await electronAPI.getTransformerEntityByMrid(node.mrid, node.parentId)
                    if (entity.success && entity.data) {
                        const dto = mappings.TransformerMapping.transformerEntityToDto(entity.data)
                        dtos.push({ type: 'transformer', data: dto })
                    }
                } else if (node.asset === 'Circuit breaker') {
                    const entity = await electronAPI.getBreakerEntityByMrid(node.mrid, node.parentId)
                    if (entity.success && entity.data) {
                        const dto = mappings.BreakerMapping.mapEntityToDto(entity.data)
                        dtos.push({ type: 'breaker', data: dto })
                    }
                } else if (node.asset === 'Reactor') {
                    const entity = await electronAPI.getReactorEntityByMrid(node.mrid, node.parentId)
                    if (entity.success && entity.data) {
                        const dto = mappings.ReactorMapping.mapEntityToDto(entity.data)
                        dtos.push({ type: 'reactor', data: dto })
                    }
                } else if (node.asset === 'Bushing') {
                    const entity = await electronAPI.getBushingEntityByMrid(node.mrid, node.parentId)
                    if (entity.success && entity.data) {
                        const dto = mappings.BushingMapping.mapEntityToDto(entity.data)
                        dtos.push({ type: 'bushing', data: dto })
                    }
                }
            }
        } catch (error) {
            console.error(`Error fetching and converting entity for node ${node.mrid}:`, error)
            // Continue processing other nodes even if one fails
        }
    }

    return dtos
}

/**
 * Export node(s) to JSON file
 * @param {Object|Array} nodes - Single node or array of nodes to export
 * @param {string} type - Export type: 'dto' or 'cim'
 * @param {Object} dependencies - Object containing electronAPI, mappings, userId, and messageHandler
 * @returns {Promise<void>}
 */
export const exportNodeToJSON = async (nodes, type, dependencies) => {
    const { electronAPI, mappings, userId, messageHandler } = dependencies

    try {
        // Support both single node and array of nodes
        const nodesArray = Array.isArray(nodes) ? nodes : (nodes ? [nodes] : [])
        
        if (nodesArray.length === 0) {
            if (messageHandler) {
                messageHandler.warning('No node selected to export')
            }
            return
        }

        // Prepare dependencies for fetchNodeDataToDto
        const fetchDependencies = {
            electronAPI,
            mappings,
            userId
        }

        // Fetch and convert node data to DTOs
        const dtos = await fetchNodeDataToDto(nodesArray, fetchDependencies)

        if (dtos.length === 0) {
            if (messageHandler) {
                messageHandler.warning('No data found to export')
            }
            return
        }

        // Generate default filename from first node (user can change it in dialog)
        // Priority: node.name > node.serial_number > node.asset > fallback
        const firstNode = nodesArray[0]
        let fileName
        
        if (firstNode?.name) {
            // Có tên node (substation, voltageLevel, bay, organisation, job, test)
            fileName = `${sanitizeFileName(firstNode.name)}.json`
        } else if (firstNode?.serial_number) {
            // Asset có serial_number
            fileName = `${sanitizeFileName(firstNode.serial_number)}.json`
        } else if (firstNode?.asset) {
            // Asset có loại asset
            fileName = `${sanitizeFileName(firstNode.asset)}.json`
        } else {
            // Fallback
            fileName = type === 'cim' ? 'tree-export-cim.json' : 'tree-export-dto.json'
        }
        
        const result = await electronAPI.exportJSON(dtos, {
            defaultFileName: fileName,
            title: 'Save JSON file',
            buttonLabel: 'Save'
        })

        if (result && result.success) {
            if (messageHandler) {
                messageHandler.success(result.message || `Exported ${dtos.length} items successfully`)
            }
        } else {
            if (result && result.message !== 'Export cancelled') {
                if (messageHandler) {
                    messageHandler.error(result.message || 'Failed to export node to JSON')
                }
            }
        }
    } catch (error) {
        console.error('Error exporting node to JSON:', error)
        if (messageHandler) {
            messageHandler.error('An error occurred while exporting node to JSON')
        }
        throw error
    }
}

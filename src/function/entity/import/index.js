export const importNodeFromJSON = async (dtos, parentNode, dependencies) => {
    const { electronAPI, mappings, messageHandler } = dependencies

    try {
        if (!dtos || !Array.isArray(dtos) || dtos.length === 0) {
            if (messageHandler) {
                messageHandler.warning('No data found to import')
            }
            return { success: false, message: 'No data found to import' }
        }

        let successCount = 0
        let errorCount = 0
        const errors = []

        // Process each DTO
        for (const dtoItem of dtos) {
            try {
                const { type, data: dto } = dtoItem

                if (!type || !dto) {
                    errorCount++
                    errors.push(`Invalid DTO format: missing type or data`)
                    continue
                }

                let result

                // Convert DTO to Entity and insert/update
                if (type === 'substation') {
                    result = await importSubstation(dto, parentNode, { electronAPI, mappings })
                } else if (type === 'organisation') {
                    result = await importOrganisation(dto, parentNode, { electronAPI, mappings })
                } else if (type === 'voltageLevel') {
                    result = await importVoltageLevel(dto, parentNode, { electronAPI })
                } else if (type === 'bay') {
                    result = await importBay(dto, parentNode, { electronAPI })
                } else if (type === 'surgeArrester') {
                    result = await importSurgeArrester(dto, parentNode, { electronAPI, mappings })
                } else if (type === 'powerCable') {
                    result = await importPowerCable(dto, parentNode, { electronAPI, mappings })
                } else if (type === 'disconnector') {
                    result = await importDisconnector(dto, parentNode, { electronAPI, mappings })
                } else if (type === 'rotatingMachine') {
                    result = await importRotatingMachine(dto, parentNode, { electronAPI, mappings })
                } else if (type === 'capacitor') {
                    result = await importCapacitor(dto, parentNode, { electronAPI, mappings })
                } else if (type === 'voltageTransformer') {
                    result = await importVoltageTransformer(dto, parentNode, { electronAPI, mappings })
                } else if (type === 'currentTransformer') {
                    result = await importCurrentTransformer(dto, parentNode, { electronAPI, mappings })
                } else if (type === 'transformer') {
                    result = await importTransformer(dto, parentNode, { electronAPI, mappings })
                } else if (type === 'breaker') {
                    result = await importBreaker(dto, parentNode, { electronAPI, mappings })
                } else if (type === 'reactor') {
                    result = await importReactor(dto, parentNode, { electronAPI, mappings })
                } else if (type === 'bushing') {
                    result = await importBushing(dto, parentNode, { electronAPI, mappings })
                } else {
                    errorCount++
                    errors.push(`Unknown type: ${type}`)
                    continue
                }

                if (result && result.success) {
                    successCount++
                } else {
                    errorCount++
                    errors.push(`${type}: ${result?.message || 'Import failed'}`)
                }
            } catch (error) {
                errorCount++
                errors.push(`Error importing ${dtoItem.type}: ${error.message}`)
                console.error(`Error importing ${dtoItem.type}:`, error)
            }
        }

        // Return summary
        const message = `Imported ${successCount} item(s) successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`
        
        if (messageHandler) {
            if (errorCount === 0) {
                messageHandler.success(message)
            } else if (successCount > 0) {
                messageHandler.warning(message)
            } else {
                messageHandler.error(`Import failed: ${errors.join('; ')}`)
            }
        }

        return {
            success: successCount > 0,
            message,
            successCount,
            errorCount,
            errors
        }
    } catch (error) {
        console.error('Error importing nodes from JSON:', error)
        if (messageHandler) {
            messageHandler.error('An error occurred while importing nodes from JSON')
        }
        return { success: false, message: error.message || 'Import failed' }
    }
}

/**
 * Import Substation
 */
async function importSubstation(dto, parentNode, { electronAPI, mappings }) {
    try {
        // Convert DTO to Entity
        const entity = mappings.SubstationMapping.mapDtoToEntity(dto)
        
        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.organisationLocation.organisation_id = parentNode.mrid
        }

        // Insert/Update entity (insertSubstationEntity handles update internally if mrid exists)
        const result = await electronAPI.insertSubstationEntity(entity)
        return result
    } catch (error) {
        console.error('Error importing substation:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Organisation
 */
async function importOrganisation(dto, parentNode, { electronAPI, mappings }) {
    try {
        // Convert DTO to Entity
        const entity = mappings.OrganisationMapping.OrgDtoToOrgEntity(dto)
        
        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.organisation.parent_organisation = parentNode.mrid
        }

        // Insert/Update entity (insertOrganisationEntity handles update internally if mrid exists)
        const result = await electronAPI.insertOrganisationEntity(entity)
        return result
    } catch (error) {
        console.error('Error importing organisation:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Voltage Level
 */
async function importVoltageLevel(dto, parentNode, { electronAPI }) {
    try {
        // VoltageLevel doesn't have mapping, use data directly
        const entity = dto
        
        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.location_id = parentNode.mrid
        }

        // Insert/Update entity
        const result = await electronAPI.insertVoltageLevelEntity(entity)
        return result
    } catch (error) {
        console.error('Error importing voltage level:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Bay
 */
async function importBay(dto, parentNode, { electronAPI }) {
    try {
        // Bay doesn't have mapping, use data directly
        const entity = dto
        
        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.voltage_level_id = parentNode.mrid
        }

        // Insert/Update entity
        const result = await electronAPI.insertBayEntity(entity)
        return result
    } catch (error) {
        console.error('Error importing bay:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Surge Arrester
 */
async function importSurgeArrester(dto, parentNode, { electronAPI, mappings }) {
    try {
        // Convert DTO to Entity
        const entity = mappings.SurgeArresterMapping.mapDtoToEntity(dto)
        
        // Check if mrid exists to get old_entity
        let oldEntity = null
        if (entity.surgeArrester.mrid) {
            const existing = await electronAPI.getSurgeArresterEntityByMrid(entity.surgeArrester.mrid)
            if (existing.success && existing.data) {
                oldEntity = existing.data
            }
        }

        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.asset.location = parentNode.mrid
        }

        // Insert/Update entity (SurgeArrester uses old_entity pattern)
        const result = await electronAPI.insertSurgeArresterEntity(oldEntity || {}, entity)
        return result
    } catch (error) {
        console.error('Error importing surge arrester:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Power Cable
 */
async function importPowerCable(dto, parentNode, { electronAPI, mappings }) {
    try {
        // Convert DTO to Entity
        const entity = mappings.PowerCableMapping.mapDtoToEntity(dto)
        
        // Check if mrid exists to get old_entity
        let oldEntity = null
        if (entity.asset.mrid) {
            const existing = await electronAPI.getPowerCableEntityByMrid(entity.asset.mrid, parentNode?.mrid || null)
            if (existing.success && existing.data) {
                oldEntity = existing.data
            }
        }

        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.asset.location = parentNode.mrid
        }

        // Insert/Update entity (PowerCable uses old_entity pattern)
        const result = await electronAPI.insertPowerCableEntity(oldEntity || {}, entity)
        return result
    } catch (error) {
        console.error('Error importing power cable:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Disconnector
 */
async function importDisconnector(dto, parentNode, { electronAPI, mappings }) {
    try {
        // Convert DTO to Entity
        const entity = mappings.DisconnectorMapping.disconnectorDtoToEntity(dto)
        
        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.asset.location = parentNode.mrid
        }

        // Insert/Update entity (insertDisconnectorEntity doesn't use old_entity pattern)
        const result = await electronAPI.insertDisconnectorEntity(entity)
        return result
    } catch (error) {
        console.error('Error importing disconnector:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Rotating Machine
 */
async function importRotatingMachine(dto, parentNode, { electronAPI, mappings }) {
    try {
        // Convert DTO to Entity
        const entity = mappings.rotatingMachineMapping.mapDtoToEntity(dto)
        
        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.asset.location = parentNode.mrid
        }

        // Insert/Update entity (insertRotatingMachineEntity doesn't use old_entity pattern)
        const result = await electronAPI.insertRotatingMachineEntity(entity)
        return result
    } catch (error) {
        console.error('Error importing rotating machine:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Capacitor
 */
async function importCapacitor(dto, parentNode, { electronAPI, mappings }) {
    try {
        // Convert DTO to Entity
        const entity = mappings.CapacitorMapping.mapDtoToEntity(dto)
        
        // Check if mrid exists to get old_entity
        let oldEntity = null
        if (entity.asset.mrid) {
            const existing = await electronAPI.getCapacitorEntityByMrid(entity.asset.mrid, parentNode?.mrid || null)
            if (existing.success && existing.data) {
                oldEntity = existing.data
            }
        }

        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.asset.location = parentNode.mrid
        }

        // Insert/Update entity (Capacitor uses old_entity pattern)
        const result = await electronAPI.insertCapacitorEntity(oldEntity || {}, entity)
        return result
    } catch (error) {
        console.error('Error importing capacitor:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Voltage Transformer
 */
async function importVoltageTransformer(dto, parentNode, { electronAPI, mappings }) {
    try {
        // Convert DTO to Entity
        const entity = mappings.VoltageTransformerMapping.mapDtoToEntity(dto)
        
        // Check if mrid exists to get old_entity
        let oldEntity = null
        if (entity.asset.mrid) {
            const existing = await electronAPI.getVoltageTransformerEntityByMrid(entity.asset.mrid, parentNode?.mrid || null)
            if (existing.success && existing.data) {
                oldEntity = existing.data
            }
        }

        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.asset.location = parentNode.mrid
        }

        // Insert/Update entity (VoltageTransformer uses old_entity pattern)
        const result = await electronAPI.insertVoltageTransformerEntity(oldEntity || {}, entity)
        return result
    } catch (error) {
        console.error('Error importing voltage transformer:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Current Transformer
 */
async function importCurrentTransformer(dto, parentNode, { electronAPI, mappings }) {
    try {
        // Convert DTO to Entity
        const entity = mappings.CurrentTransformerMapping.mapDtoToEntity(dto)
        
        // Check if mrid exists to get old_entity
        let oldEntity = null
        if (entity.asset.mrid) {
            const existing = await electronAPI.getCurrentTransformerEntityByMrid(entity.asset.mrid, parentNode?.mrid || null)
            if (existing.success && existing.data) {
                oldEntity = existing.data
            }
        }

        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.asset.location = parentNode.mrid
        }

        // Insert/Update entity (CurrentTransformer uses old_entity pattern)
        const result = await electronAPI.insertCurrentTransformerEntity(oldEntity || {}, entity)
        return result
    } catch (error) {
        console.error('Error importing current transformer:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Transformer
 */
async function importTransformer(dto, parentNode, { electronAPI, mappings }) {
    try {
        // Convert DTO to Entity
        const entity = mappings.TransformerMapping.transformerDtoToEntity(dto)
        
        // Check if mrid exists to get old_entity
        let oldEntity = null
        if (entity.asset.mrid) {
            const existing = await electronAPI.getTransformerEntityByMrid(entity.asset.mrid, parentNode?.mrid || null)
            if (existing.success && existing.data) {
                oldEntity = existing.data
            }
        }

        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.asset.location = parentNode.mrid
        }

        // Insert/Update entity (Transformer uses old_entity pattern)
        const result = await electronAPI.insertTransformerEntity(oldEntity || {}, entity)
        return result
    } catch (error) {
        console.error('Error importing transformer:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Breaker
 */
async function importBreaker(dto, parentNode, { electronAPI, mappings }) {
    try {
        // Convert DTO to Entity
        const entity = mappings.BreakerMapping.mapDtoToEntity(dto)
        
        // Check if mrid exists to get old_entity
        let oldEntity = null
        if (entity.asset.mrid) {
            const existing = await electronAPI.getBreakerEntityByMrid(entity.asset.mrid, parentNode?.mrid || null)
            if (existing.success && existing.data) {
                oldEntity = existing.data
            }
        }

        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.asset.location = parentNode.mrid
        }

        // Insert/Update entity (Breaker uses old_entity pattern)
        const result = await electronAPI.insertBreakerEntity(oldEntity || {}, entity)
        return result
    } catch (error) {
        console.error('Error importing breaker:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Reactor
 */
async function importReactor(dto, parentNode, { electronAPI, mappings }) {
    try {
        // Convert DTO to Entity
        const entity = mappings.ReactorMapping.mapDtoToEntity(dto)
        
        // Check if mrid exists to get old_entity
        let oldEntity = null
        if (entity.asset.mrid) {
            const existing = await electronAPI.getReactorEntityByMrid(entity.asset.mrid, parentNode?.mrid || null)
            if (existing.success && existing.data) {
                oldEntity = existing.data
            }
        }

        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.asset.location = parentNode.mrid
        }

        // Insert/Update entity (Reactor uses old_entity pattern)
        const result = await electronAPI.insertReactorEntity(oldEntity || {}, entity)
        return result
    } catch (error) {
        console.error('Error importing reactor:', error)
        return { success: false, message: error.message }
    }
}

/**
 * Import Bushing
 */
async function importBushing(dto, parentNode, { electronAPI, mappings }) {
    try {
        // Convert DTO to Entity
        const entity = mappings.BushingMapping.mapDtoToEntity(dto)
        
        // Update parent if provided
        if (parentNode && parentNode.mrid) {
            entity.asset.location = parentNode.mrid
        }

        // Insert/Update entity (insertBushingEntity doesn't use old_entity pattern)
        const result = await electronAPI.insertBushingEntity(entity)
        return result
    } catch (error) {
        console.error('Error importing bushing:', error)
        return { success: false, message: error.message }
    }
}

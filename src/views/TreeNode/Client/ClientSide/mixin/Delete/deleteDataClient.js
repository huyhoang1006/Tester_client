export default {
    methods: {
        async deleteDataClient(node) {
            if(node.mode != 'job') {
                const checkDelete = await this.checkChildren(node)
                if (checkDelete.hasChildren) {
                    this.$message.error('Node has children, cannot delete')
                    return
                }
                try {
                    if (node.mode == 'substation') {
                        const entity = await window.electronAPI.getSubstationEntityByMrid(node.mrid, this.$store.state.user.user_id, node.parentId)
                        if (!entity.success) {
                            this.$message.error('Entity not found')
                            return
                        }
                        const deleteSign = await window.electronAPI.deleteSubstationEntityByMrid(entity.data)
                        if (!deleteSign.success) {
                            this.$message.error('Delete data failed')
                            return
                        }

                        // ✅ Xóa node khỏi cây organisationClientList
                        const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                        if (parentNode && Array.isArray(parentNode.children)) {
                            const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                            if (index !== -1) {
                                parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                this.$message.success('Delete data successfully')
                            } else {
                                this.$message.warning('Node not found in tree structure')
                            }
                        } else {
                            this.$message.warning('Parent node not found in tree')
                        }
                    } else if (node.mode == 'organisation') {
                        const entity = await window.electronAPI.getOrganisationEntityByMrid(node.mrid)
                        if (!entity.success) {
                            this.$message.error('Entity not found')
                            return
                        }
                        const deleteSign = await window.electronAPI.deleteParentOrganizationEntity(entity.data)
                        if (!deleteSign.success) {
                            this.$message.error('Delete data failed')
                            return
                        }

                        // ✅ Xóa node khỏi cây organisationClientList
                        const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                        if (parentNode && Array.isArray(parentNode.children)) {
                            const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                            if (index !== -1) {
                                parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                this.$message.success('Delete data successfully')
                            } else {
                                this.$message.warning('Node not found in tree structure')
                            }
                        } else {
                            this.$message.warning('Parent node not found in tree')
                        }
                    } else if (node.mode == 'voltageLevel') {
                        const entity = await window.electronAPI.getVoltageLevelEntityByMrid(node.mrid)
                        if (!entity.success) {
                            this.$message.error('Entity not found')
                            return
                        }
                        const deleteSign = await window.electronAPI.deleteVoltageLevelEntityByMrid(entity.data)
                        if (!deleteSign.success) {
                            this.$message.error('Delete data failed')
                            return
                        }

                        // ✅ Xóa node khỏi cây organisationClientList
                        const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                        if (parentNode && Array.isArray(parentNode.children)) {
                            const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                            if (index !== -1) {
                                parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                this.$message.success('Delete data successfully')
                            } else {
                                this.$message.warning('Node not found in tree structure')
                            }
                        } else {
                            this.$message.warning('Parent node not found in tree')
                        }
                    } else if (node.mode == 'bay') {
                        const entity = await window.electronAPI.getBayEntityByMrid(node.mrid)
                        if (!entity.success) {
                            this.$message.error('Entity not found')
                            return
                        }
                        const deleteSign = await window.electronAPI.deleteBayEntityByMrid(entity.data)
                        if (!deleteSign.success) {
                            this.$message.error('Delete data failed')
                            return
                        }

                        // ✅ Xóa node khỏi cây organisationClientList
                        const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                        if (parentNode && Array.isArray(parentNode.children)) {
                            const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                            if (index !== -1) {
                                parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                this.$message.success('Delete data successfully')
                            } else {
                                this.$message.warning('Node not found in tree structure')
                            }
                        } else {
                            this.$message.warning('Parent node not found in tree')
                        }
                    } else if (node.mode == 'asset') {
                        if (node.asset === 'Surge arrester') {
                            const entity = await window.electronAPI.getSurgeArresterEntityByMrid(node.mrid)
                            if (!entity.success) {
                                this.$message.error('Entity not found')
                                return
                            }
                            const deleteSign = await window.electronAPI.deleteSurgeArresterEntity(entity.data)
                            if (!deleteSign.success) {
                                this.$message.error('Delete data failed')
                                return
                            }
                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                    this.$message.success('Delete data successfully')
                                } else {
                                    this.$message.warning('Node not found in tree structure')
                                }
                            } else {
                                this.$message.warning('Parent node not found in tree')
                            }
                        } else if (node.asset === 'Power cable') {
                            const entity = await window.electronAPI.getPowerCableEntityByMrid(node.mrid, node.parentId)
                            if (!entity.success) {
                                this.$message.error('Entity not found')
                                return
                            }
                            const deleteSign = await window.electronAPI.deletePowerCableEntity(entity.data)
                            if (!deleteSign.success) {
                                this.$message.error('Delete data failed: ' + (deleteSign.message || 'Unknown error'))
                                return
                            }
                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                    this.$message.success('Delete data successfully')
                                } else {
                                    this.$message.warning('Node not found in tree structure')
                                }
                            } else {
                                this.$message.warning('Parent node not found in tree')
                            }
                        } else if (node.asset === 'Disconnector') {
                            const entity = await window.electronAPI.getDisconnectorEntityByMrid(node.mrid, node.parentId)
                            if (!entity.success) {
                                this.$message.error('Entity not found')
                                return
                            }
                            const deleteSign = await window.electronAPI.deleteDisconnectorEntity(entity.data)
                            if (!deleteSign.success) {
                                this.$message.error('Delete data failed: ' + (deleteSign.message || 'Unknown error'))
                                return
                            }
                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                    this.$message.success('Delete data successfully')
                                } else {
                                    this.$message.warning('Node not found in tree structure')
                                }
                            } else {
                                this.$message.warning('Parent node not found in tree')
                            }
                        } else if (node.asset === 'Rotating machine') {
                            const entity = await window.electronAPI.getRotatingMachineEntityByMrid(node.mrid, node.parentId)
                            if (!entity.success) {
                                this.$message.error('Entity not found')
                                return
                            }
                            const deleteSign = await window.electronAPI.deleteRotatingMachineEntity(entity.data)
                            if (!deleteSign.success) {
                                this.$message.error('Delete data failed: ' + (deleteSign.message || 'Unknown error'))
                                return
                            }
                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                    this.$message.success('Delete data successfully')
                                } else {
                                    this.$message.warning('Node not found in tree structure')
                                }
                            } else {
                                this.$message.warning('Parent node not found in tree')
                            }
                        } else if (node.asset === 'Capacitor') {
                            const entity = await window.electronAPI.getCapacitorEntityByMrid(node.mrid, node.parentId)
                            if (!entity.success) {
                                this.$message.error('Entity not found')
                                return
                            }
                            const deleteSign = await window.electronAPI.deleteCapacitorEntity(entity.data)
                            if (!deleteSign.success) {
                                this.$message.error('Delete data failed: ' + (deleteSign.message || 'Unknown error'))
                                return
                            }
                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                    this.$message.success('Delete data successfully')
                                } else {
                                    this.$message.warning('Node not found in tree structure')
                                }
                            } else {
                                this.$message.warning('Parent node not found in tree')
                            }
                        } else if (node.asset === 'Reactor') {
                            const entity = await window.electronAPI.getReactorEntityByMrid(node.mrid, node.parentId)
                            if (!entity.success) {
                                this.$message.error('Entity not found')
                                return
                            }
                            const deleteSign = await window.electronAPI.deleteReactorEntity(entity.data)
                            if (!deleteSign.success) {
                                this.$message.error('Delete data failed: ' + (deleteSign.message || 'Unknown error'))
                                return
                            }
                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                    this.$message.success('Delete data successfully')
                                } else {
                                    this.$message.warning('Node not found in tree structure')
                                }
                            } else {
                                this.$message.warning('Parent node not found in tree')
                            }
                        } else if (node.asset === 'Voltage transformer') {
                            const entity = await window.electronAPI.getVoltageTransformerEntityByMrid(node.mrid, node.parentId)
                            if (!entity.success) {
                                this.$message.error('Entity not found')
                                return
                            }
                            const deleteSign = await window.electronAPI.deleteVoltageTransformerEntity(entity.data)
                            if (!deleteSign.success) {
                                this.$message.error('Delete data failed: ' + (deleteSign.message || 'Unknown error'))
                                return
                            }
                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                    this.$message.success('Delete data successfully')
                                } else {
                                    this.$message.warning('Node not found in tree structure')
                                }
                            } else {
                                this.$message.warning('Parent node not found in tree')
                            }
                        } else if (node.asset === 'Current transformer') {
                            const entity = await window.electronAPI.getCurrentTransformerEntityByMrid(node.mrid, node.parentId)
                            if (!entity.success) {
                                this.$message.error('Entity not found')
                                return
                            }
                            const deleteSign = await window.electronAPI.deleteCurrentTransformerEntity(entity.data)
                            if (!deleteSign.success) {
                                this.$message.error('Delete data failed: ' + (deleteSign.message || 'Unknown error'))
                                return
                            }
                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                    this.$message.success('Delete data successfully')
                                } else {
                                    this.$message.warning('Node not found in tree structure')
                                }
                            } else {
                                this.$message.warning('Parent node not found in tree')
                            }
                        } else if (node.asset === 'Bushing') {
                            const entity = await window.electronAPI.getBushingEntityByMrid(node.mrid, node.parentId)
                            if (!entity.success) {
                                this.$message.error('Entity not found')
                                return
                            }
                            const deleteSign = await window.electronAPI.deleteBushingEntity(entity.data)
                            if (!deleteSign.success) {
                                this.$message.error('Delete data failed: ' + (deleteSign.message || 'Unknown error'))
                                return
                            }
                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                    this.$message.success('Delete data successfully')
                                } else {
                                    this.$message.warning('Node not found in tree structure')
                                }
                            } else {
                                this.$message.warning('Parent node not found in tree')
                            }
                        } else if (node.asset === 'Circuit breaker') {
                            const entity = await window.electronAPI.getBreakerEntityByMrid(node.mrid, node.parentId)
                            if (!entity.success) {
                                this.$message.error('Entity not found')
                                return
                            }
                            const deleteSign = await window.electronAPI.deleteBreakerEntity(entity.data)
                            if (!deleteSign.success) {
                                this.$message.error('Delete data failed: ' + (deleteSign.message || 'Unknown error'))
                                return
                            }
                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                    this.$message.success('Delete data successfully')
                                } else {
                                    this.$message.warning('Node not found in tree structure')
                                }
                            } else {
                                this.$message.warning('Parent node not found in tree')
                            }
                        } else if (node.asset === 'Transformer') {
                            const entity = await window.electronAPI.getTransformerEntityByMrid(node.mrid, node.parentId)
                            if (!entity.success) {
                                this.$message.error('Entity not found')
                                return
                            }
                            const deleteSign = await window.electronAPI.deleteTransformerEntity(entity.data)
                            if (!deleteSign.success) {
                                this.$message.error('Delete data failed: ' + (deleteSign.message || 'Unknown error'))
                                return
                            }
                            // ✅ Xóa node khỏi cây organisationClientList
                            const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                            if (parentNode && Array.isArray(parentNode.children)) {
                                const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                                if (index !== -1) {
                                    parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                    this.$message.success('Delete data successfully')
                                } else {
                                    this.$message.warning('Node not found in tree structure')
                                }
                            } else {
                                this.$message.warning('Parent node not found in tree')
                            }
                        }
                    }
                } catch (error) {
                    this.$message.error('Some error occur when deleting data')
                    console.error(error)
                }
            } else {
                try {
                    if(node.job == 'Surge arrester') {
                        const entity = await window.electronAPI.getSurgeArresterJobByMrid(node.mrid)
                        if(!entity.success) {
                            this.$message.error('Entity not found')
                            return
                        }
                        const deleteSign = await window.electronAPI.deleteSurgeArresterJobByMrid(entity.data)
                        if (!deleteSign.success) {
                            this.$message.error('Delete data failed')
                            return
                        }

                        // ✅ Xóa node khỏi cây organisationClientList
                        const parentNode = this.findNodeById(node.parentId, this.organisationClientList)
                        if (parentNode && Array.isArray(parentNode.children)) {
                            const index = parentNode.children.findIndex((child) => child.mrid === node.mrid)
                            if (index !== -1) {
                                parentNode.children.splice(index, 1) // Xóa khỏi mảng children
                                this.$message.success('Delete data successfully')
                            } else {
                                this.$message.warning('Node not found in tree structure')
                            }
                        } else {
                            this.$message.warning('Parent node not found in tree')
                        }
                    }
                } catch(e) {
                    this.$message.error('Some error occur when deleting data')
                    console.error(e)
                }
            }
        },
    }
}
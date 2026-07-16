import processUploadMixin from './upload-process.js'

export default {
    mixins: [processUploadMixin],

    methods: {
        async handleUploadNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node to upload')
                return
            }

            const node = this.selectedNodes[this.selectedNodes.length - 1]

            if (!node.parentId) {
                this.$message.error('Cannot upload root node. Please select a child node with parent.')
                return
            }

            const confirmAndRun = async (label, handler) => {
                const canContinue = await this.confirmUploadExistingServerNode(node)
                if (!canContinue) return

                this.$confirm(`Upload ${label} "${node.name || node.serial_number}" to Server?`, 'Confirm Upload', {
                    confirmButtonText: 'Upload',
                    cancelButtonText: 'Cancel',
                    type: 'info'
                }).then(() => handler(node)).catch(() => {})
            }

            if (node.mode === 'substation') {
                confirmAndRun('Substation', this.processUploadSubstation)
            } else if (node.mode === 'voltageLevel') {
                confirmAndRun('VoltageLevel', this.processUploadVoltageLevel)
            } else if (node.mode === 'bay') {
                confirmAndRun('Bay', this.processUploadBay)
            } else if (node.asset === 'Power cable') {
                const canContinue = await this.confirmUploadExistingServerNode(node)
                if (!canContinue) return

                this.$confirm(`Upload Power Cable "${node.serial_number || node.name}" to Server?`, 'Confirm Upload', {
                    confirmButtonText: 'Upload',
                    cancelButtonText: 'Cancel',
                    type: 'info'
                }).then(() => this.processUploadPowerCable(node)).catch(() => {})
            } else if (node.asset === 'Transformer') {
                confirmAndRun('Transformer', this.processUploadTransformer)
            } else if (node.asset === 'Voltage transformer') {
                confirmAndRun('Voltage transformer', this.processUploadVoltageTransformer)
            } else if (node.asset === 'Current transformer') {
                confirmAndRun('Current transformer', this.processUploadCurrentTransformer)
            } else if (node.asset === 'Circuit breaker') {
                confirmAndRun('Circuit breaker', this.processUploadCircuitBreaker)
            } else if (node.asset === 'Disconnector') {
                confirmAndRun('Disconnector', this.processUploadDisconnector)
            } else if (node.asset === 'Surge arrester') {
                confirmAndRun('Surge arrester', this.processUploadSurgeArrester)
            } else if (node.asset === 'Bushing') {
                confirmAndRun('Bushing', this.processUploadBushing)
            } else if (node.mode === 'job') {
                if (node.job === 'Voltage transformer') {
                    confirmAndRun('Voltage transformer job', this.processUploadVoltageTransformerJob)
                } else if (node.job === 'Current transformer') {
                    confirmAndRun('Current transformer job', this.processUploadCurrentTransformerJob)
                } else if (node.job === 'Circuit breaker') {
                    confirmAndRun('Circuit breaker job', this.processUploadCircuitBreakerJob)
                } else if (node.job === 'Surge arrester') {
                    confirmAndRun('Surge arrester job', this.processUploadSurgeArresterJob)
                } else if (node.job === 'Disconnector') {
                    confirmAndRun('Disconnector job', this.processUploadDisconnectorJob)
                } else if (node.job === 'Transformer') {
                    confirmAndRun('Transformer job', this.processUploadTransformerJob)
                }
            } else {
                this.$message.warning('TYPE NOT SUPPORTED FOR UPLOAD')
            }
        },

        async confirmUploadExistingServerNode(node) {
            const exists = await this.checkServerNodeExistsForUpload(node)
            if (!exists) return true

            try {
                await this.$confirm(
                    'This node already exists on server. Do you still want to upload it?',
                    'Node already exists',
                    {
                        confirmButtonText: 'Upload',
                        cancelButtonText: 'Cancel',
                        type: 'warning'
                    }
                )
                return true
            } catch (error) {
                return false
            }
        },

        async handleUploadFullTreeNode() {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node to upload')
                return
            }

            const node = this.selectedNodes[this.selectedNodes.length - 1]
            const chain = this.buildUploadFullTreeChain(node)

            if (!chain.length) {
                this.$message.warning('No supported node found to upload')
                return
            }

            const checkedChain = await this.checkUploadFullTreeExistingNodes(chain)
            const existingNodes = checkedChain.filter(item => item.exists)

            this.uploadFullTreeChain = checkedChain
            this.uploadFullTreeExistingNodes = existingNodes.map(item => ({
                key: this.getUploadNodeKey(item.node),
                name: this.getUploadNodeName(item.node),
                typeLabel: this.getUploadNodeTypeLabel(item.node)
            }))
            this.uploadFullTreeDecisions = existingNodes.reduce((result, item) => {
                result[this.getUploadNodeKey(item.node)] = 'update'
                return result
            }, {})

            if (existingNodes.length) {
                this.uploadFullTreeDialogVisible = true
                return
            }

            await this.executeUploadFullTree()
        },

        buildUploadFullTreeChain(node) {
            const chain = []
            let current = node
            const visited = new Set()

            while (current && !visited.has(current.mrid || current.id)) {
                visited.add(current.mrid || current.id)

                if (this.isSupportedUploadNode(current)) {
                    chain.unshift(current)
                }

                if (!current.parentId) break
                current = this.findNodeById(current.parentId, this.organisationClientList)
            }

            return chain
        },

        isSupportedUploadNode(node) {
            if (!node) return false
            if (['substation', 'voltageLevel', 'bay', 'job'].includes(node.mode)) return true
            if (node.mode !== 'asset') return false
            return [
                'Power cable',
                'Transformer',
                'Voltage transformer',
                'Current transformer',
                'Circuit breaker',
                'Disconnector',
                'Surge arrester',
                'Bushing'
            ].includes(node.asset)
        },

        getUploadNodeKey(node) {
            return `${node.mode || ''}:${node.asset || node.job || ''}:${node.mrid || node.id || ''}`
        },

        getUploadNodeName(node) {
            return node.name || node.serial_number || node.apparatus_id || node.mrid || 'Unnamed'
        },

        getUploadNodeTypeLabel(node) {
            if (node.mode === 'asset') return node.asset || 'Asset'
            if (node.mode === 'job') return `${node.job || 'Asset'} job`
            if (node.mode === 'voltageLevel') return 'Voltage level'
            return node.mode || ''
        },

        async checkUploadFullTreeExistingNodes(chain) {
            const checked = []
            for (const node of chain) {
                checked.push({
                    node,
                    exists: await this.checkServerNodeExistsForUpload(node)
                })
            }
            return checked
        },

        async confirmUploadFullTreeSelection() {
            await this.executeUploadFullTree()
        },

        cancelUploadFullTree() {
            this.uploadFullTreeDialogVisible = false
            this.uploadFullTreeExistingNodes = []
            this.uploadFullTreeChain = []
            this.uploadFullTreeDecisions = {}
        },

        async executeUploadFullTree() {
            if (!this.uploadFullTreeChain.length) return

            this.uploadFullTreeUploading = true
            this.$store.dispatch('loading/start', {
                action: 'upload',
                type: 'heavy'
            })

            try {
                for (const item of this.uploadFullTreeChain) {
                    const key = this.getUploadNodeKey(item.node)
                    if (item.exists && this.uploadFullTreeDecisions[key] === 'skip') {
                        continue
                    }
                    await this.processUploadNodeWithoutConfirm(item.node)
                }

                this.$message.success('Upload full tree completed')
                this.cancelUploadFullTree()
            } catch (error) {
                this.$message.error(error.message || 'Upload full tree failed')
            } finally {
                this.uploadFullTreeUploading = false
                this.$store.dispatch('loading/stop')
            }
        },

        async processUploadNodeWithoutConfirm(node) {
            if (node.mode === 'substation') {
                await this.processUploadSubstation(node)
            } else if (node.mode === 'voltageLevel') {
                await this.processUploadVoltageLevel(node)
            } else if (node.mode === 'bay') {
                await this.processUploadBay(node)
            } else if (node.asset === 'Power cable') {
                await this.processUploadPowerCable(node)
            } else if (node.asset === 'Transformer') {
                await this.processUploadTransformer(node)
            } else if (node.asset === 'Voltage transformer') {
                await this.processUploadVoltageTransformer(node)
            } else if (node.asset === 'Current transformer') {
                await this.processUploadCurrentTransformer(node)
            } else if (node.asset === 'Circuit breaker') {
                await this.processUploadCircuitBreaker(node)
            } else if (node.asset === 'Disconnector') {
                await this.processUploadDisconnector(node)
            } else if (node.asset === 'Surge arrester') {
                await this.processUploadSurgeArrester(node)
            } else if (node.asset === 'Bushing') {
                await this.processUploadBushing(node)
            } else if (node.mode === 'job') {
                if (node.job === 'Voltage transformer') {
                    await this.processUploadVoltageTransformerJob(node)
                } else if (node.job === 'Current transformer') {
                    await this.processUploadCurrentTransformerJob(node)
                } else if (node.job === 'Circuit breaker') {
                    await this.processUploadCircuitBreakerJob(node)
                } else if (node.job === 'Surge arrester') {
                    await this.processUploadSurgeArresterJob(node)
                } else if (node.job === 'Disconnector') {
                    await this.processUploadDisconnectorJob(node)
                } else if (node.job === 'Transformer') {
                    await this.processUploadTransformerJob(node)
                }
            }
        },
    }
}

import processUploadMixin from './upload-process.js'

export default {
    mixins: [processUploadMixin],

    methods: {
        /**
         * Chạy 1 handler upload rồi ghi log kết quả.
         * processUpload* tự nuốt lỗi và chỉ gọi $message.error, nên phải chặn message
         * lại để lấy lý do; vẫn cho message hiện ra bình thường cho người dùng.
         */
        async runUploadWithLog(node, handler) {
            const originalMessage = this.$message
            let captured = ''
            this.$message = {
                success: (m) => originalMessage.success(m),
                info: (m) => originalMessage.info(m),
                warning: (m) => { captured = captured || m; originalMessage.warning(m) },
                error: (m) => { captured = captured || m; originalMessage.error(m) }
            }

            this.$store.dispatch('loading/start', { action: 'upload', type: 'heavy' })

            let response
            try {
                response = await handler.call(this, node)
            } catch (error) {
                captured = captured || (error && error.message) || 'Upload failed'
            } finally {
                this.$message = originalMessage
                this.$store.dispatch('loading/stop')
            }

            await this.writeSyncLog('UPLOAD', node, !!response, captured)
            return response
        },

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
                }).then(() => this.runUploadWithLog(node, handler)).catch(() => {})
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
                }).then(() => this.runUploadWithLog(node, this.processUploadPowerCable)).catch(() => {})
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

        // Upload full tree = đường từ node lên gốc + toàn bộ con cháu của node
        async handleUploadFullTreeNode() {
            await this.startUploadTree({ includeDescendants: true, title: 'Upload full tree' })
        },

        // Upload path node = chỉ đường từ node lên gốc, không kèm con cháu
        async handleUploadPathNode() {
            await this.startUploadTree({ includeDescendants: false, title: 'Upload path to root' })
        },

        async startUploadTree({ includeDescendants, title }) {
            if (!this.selectedNodes || this.selectedNodes.length === 0) {
                this.$message.warning('Please select a node to upload')
                return
            }

            const node = this.selectedNodes[this.selectedNodes.length - 1]
            this.uploadFullTreeTitle = title
            let chain = this.buildUploadFullTreeChain(node)

            if (includeDescendants) {
                const descendants = await this.collectUploadDescendants(node)
                // Cha luôn đứng trước con: chain đã là gốc→node, nối tiếp con cháu theo chiều sâu
                const seen = new Set(chain.map(n => this.getUploadNodeKey(n)))
                for (const child of descendants) {
                    const key = this.getUploadNodeKey(child)
                    if (seen.has(key)) continue
                    seen.add(key)
                    chain.push(child)
                }
            }

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

        /**
         * Gom toàn bộ con cháu của node theo thứ tự cha trước con.
         * Node có thể chưa expand nên phải fetchChildren để nạp vào tree.
         */
        async collectUploadDescendants(node) {
            const result = []
            const visit = async (current) => {
                if (this.fetchChildren) {
                    try {
                        await this.fetchChildren(current)
                    } catch (error) {
                        console.error('Fetch children failed while collecting upload nodes:', error)
                        return
                    }
                }
                const children = Array.isArray(current.children) ? [...current.children] : []
                for (const child of children) {
                    if (this.isSupportedUploadNode(child)) result.push(child)
                    await visit(child)
                }
            }
            await visit(node)
            return result
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

        // Node asset trên cây KHÔNG có field `name` (xem TreeNode.vue: asset hiển thị
        // apparatus_id || serial_number). Lấy theo đúng thứ tự đó để tên hiện ở
        // thông báo/bảng kết quả khớp với tên nhìn thấy trên cây.
        getUploadNodeName(node) {
            if (!node) return 'Unnamed'
            if (node.mode === 'asset') {
                return node.apparatus_id || node.serial_number || node.serial_no || node.name || node.mrid || 'Unnamed'
            }
            return node.name || node.aliasName || node.serial_number || node.apparatus_id || node.mrid || 'Unnamed'
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

            const results = []

            try {
                for (const item of this.uploadFullTreeChain) {
                    const node = item.node
                    const key = this.getUploadNodeKey(node)
                    const row = {
                        key,
                        mrid: node.mrid || node.id || null,
                        name: this.getUploadNodeName(node),
                        typeLabel: this.getUploadNodeTypeLabel(node),
                        status: 'success',
                        message: ''
                    }

                    if (item.exists && this.uploadFullTreeDecisions[key] === 'skip') {
                        row.status = 'skipped'
                        row.message = 'Already on server, skipped by user'
                        results.push(row)
                        continue
                    }

                    // processUpload* nuốt lỗi và chỉ gọi $message.error, nên chặn message
                    // lại để lấy lý do; trả về response nghĩa là thành công.
                    const originalMessage = this.$message
                    let captured = ''
                    this.$message = {
                        success: () => {},
                        info: () => {},
                        warning: (m) => { captured = captured || m },
                        error: (m) => { captured = captured || m }
                    }

                    let response
                    try {
                        response = await this.processUploadNodeWithoutConfirm(node)
                    } catch (error) {
                        // Lỗi vẫn chỉ dừng node này, các node sau chạy tiếp
                        captured = captured || (error && error.message) || 'Upload failed'
                    } finally {
                        this.$message = originalMessage
                    }

                    if (response) {
                        row.status = 'success'
                        row.message = ''
                        // mrid có thể đã đổi sang id server sau khi upload
                        row.mrid = node.mrid || node.id || row.mrid
                    } else {
                        row.status = 'failed'
                        row.message = captured || 'Upload failed'
                    }
                    results.push(row)
                }
            } finally {
                this.uploadFullTreeUploading = false
                this.$store.dispatch('loading/stop')
            }

            this.uploadFullTreeDialogVisible = false
            await this.writeSyncLogBatch('UPLOAD', results)
            this.showOpResult(this.uploadFullTreeTitle, results)

            const failed = results.filter(r => r.status === 'failed').length
            if (failed) {
                this.$message.warning(`${this.uploadFullTreeTitle}: ${results.length - failed}/${results.length} uploaded, ${failed} failed`)
            } else {
                this.$message.success(`${this.uploadFullTreeTitle} completed`)
            }

            this.uploadFullTreeExistingNodes = []
            this.uploadFullTreeChain = []
            this.uploadFullTreeDecisions = {}
        },


        // Trả về response của processUpload* để bên gọi biết node nào thành công.
        // processUpload* trả undefined khi lỗi (đã tự bắt trong _handleUploadError).
        async processUploadNodeWithoutConfirm(node) {
            if (node.mode === 'substation') {
                return await this.processUploadSubstation(node)
            } else if (node.mode === 'voltageLevel') {
                return await this.processUploadVoltageLevel(node)
            } else if (node.mode === 'bay') {
                return await this.processUploadBay(node)
            } else if (node.asset === 'Power cable') {
                return await this.processUploadPowerCable(node)
            } else if (node.asset === 'Transformer') {
                return await this.processUploadTransformer(node)
            } else if (node.asset === 'Voltage transformer') {
                return await this.processUploadVoltageTransformer(node)
            } else if (node.asset === 'Current transformer') {
                return await this.processUploadCurrentTransformer(node)
            } else if (node.asset === 'Circuit breaker') {
                return await this.processUploadCircuitBreaker(node)
            } else if (node.asset === 'Disconnector') {
                return await this.processUploadDisconnector(node)
            } else if (node.asset === 'Surge arrester') {
                return await this.processUploadSurgeArrester(node)
            } else if (node.asset === 'Bushing') {
                return await this.processUploadBushing(node)
            } else if (node.mode === 'job') {
                if (node.job === 'Voltage transformer') {
                    return await this.processUploadVoltageTransformerJob(node)
                } else if (node.job === 'Current transformer') {
                    return await this.processUploadCurrentTransformerJob(node)
                } else if (node.job === 'Circuit breaker') {
                    return await this.processUploadCircuitBreakerJob(node)
                } else if (node.job === 'Surge arrester') {
                    return await this.processUploadSurgeArresterJob(node)
                } else if (node.job === 'Disconnector') {
                    return await this.processUploadDisconnectorJob(node)
                } else if (node.job === 'Transformer') {
                    return await this.processUploadTransformerJob(node)
                }
            }
            return undefined
        },
    }
}

export default {
    methods: {
        // ================== EXPORT COMMAND ==================
        handleCommand(cmd) {
            if (cmd === 'exportExcel') {
                this.openExportDialog = true
                this.exportType = 'excel'
            } else if (cmd === 'exportWord') {
                this.openExportDialog = true
                this.exportType = 'word'
            } else if (cmd === 'exportJSONOnlyNode') {
                // JSON: không qua dialog — chọn node → chọn chỗ lưu → export luôn
                this.exportJsonOnlyNode()
            } else if (cmd === 'exportJSONFullTree') {
                this.exportJsonFullTree()
            }
        },

        // ================== IMPORT COMMAND ==================
        handleImportCommand(cmd) {
            if (cmd === 'importExcel') {
                this.openImportDialog = true
                this.importType = 'excel'
            } else if (cmd === 'importWord') {
                this.openImportDialog = true
                this.importType = 'word'
            } else if (cmd === 'importJSON') {
                // JSON: không qua dialog — chọn node đích → chọn file → import luôn
                this.handleImportJSONFromFile()
            }
        },

        // ============================================================
        // DIALOG WORD/EXCEL — đóng/xác nhận (DÙNG CHUNG, không thuộc JSON)
        // Đặt ở đây vì handleCommand là nơi quản lý vòng đời dialog
        // (mở dialog ở trên, đóng/confirm ở dưới).
        // ============================================================
        handleCancelExport() {
            this.openExportDialog = false
        },
        handleExportConfirm() {
            this.openExportDialog = false
            this.$message.success('Export successfully')
        },
        handleCancelImport() {
            this.openImportDialog = false
        },
        handleImportConfirm() {
            this.openImportDialog = false
            this.$message.success('Import successfully')
        },

        // ================== ADD COMMAND ==================
        async handleAddCommand(cmd) {
            const selectedNode = this.selectedNodes && this.selectedNodes.length > 0 ? this.selectedNodes[this.selectedNodes.length - 1] : null

            if (!selectedNode) {
                this.$message.warning('Please select a node first')
                return
            }

            // Validate command against node type
            const allowedCommands = this.getAllowedCommands(selectedNode)
            if (!allowedCommands.includes(cmd)) {
                this.$message.warning('This action is not allowed for this node type')
                return
            }

            switch (cmd) {
                case 'organisation':
                    this.showAddOrganisation(selectedNode)
                    break
                case 'substation':
                    this.showAddSubsInTree(selectedNode)
                    break
                case 'voltageLevel':
                    this.showAddVoltageLevel(selectedNode)
                    break
                case 'bay':
                    this.showAddBay(selectedNode)
                    break
                case 'asset':
                    this.showAddTransformer(selectedNode)
                    break
                case 'job':
                    this.showAddJob(selectedNode)
                    break
            }
        },
        async handleAssetCommand(assetType) {
            const selectedNode = this.selectedNodes && this.selectedNodes.length > 0 ? this.selectedNodes[this.selectedNodes.length - 1] : null

            if (!selectedNode) {
                this.$message.warning('Please select a node first')
                return
            }

            // Map asset type to show* method
            const assetMethodMap = {
                Transformer: this.showAddTransformer,
                'Surge arrester': this.showAddSurgeArrester,
                Bushing: this.showAddBushing,
                'Voltage transformer': this.showAddVt,
                Disconnector: this.showAddDisconnector,
                'Power cable': this.showAddPowerCable,
                'Current transformer': this.showAddCt,
                'Circuit breaker': this.showAddCircuitBreaker,
                'Rotating machine': this.showAddRotatingMachine,
                Capacitor: this.showAddCapacitor,
                Reactor: this.showAddReactor
            }

            const method = assetMethodMap[assetType]
            if (method) {
                await method.call(this, selectedNode)
            } else {
                this.$message.warning(`Asset type "${assetType}" not supported`)
            }
        },
        getAllowedCommands(node) {
            const commands = []

            if (node.mode === 'organisation') {
                commands.push('organisation', 'substation')
            } else if (node.mode === 'substation') {
                commands.push('voltageLevel', 'bay', 'asset')
            } else if (node.mode === 'voltageLevel') {
                commands.push('bay')
            } else if (node.mode === 'bay') {
                commands.push('asset', 'job')
            } else if (node.mode === 'asset') {
                commands.push('job')
            }

            return commands
        },
        handleDropdownVisibleChange(visible) {
            // Nếu dropdown muốn mở mà chưa có node selected, ngăn nó mở
            if (visible && (!this.selectedNodes || this.selectedNodes.length === 0)) {
                this.$message.warning('Please select a node first')
                // Ngăn dropdown mở bằng cách set visible = false
                this.$nextTick(() => {
                    // Tìm ref dropdown và close nó
                    if (this.$refs.addDropdown) {
                        this.$refs.addDropdown.visible = false
                    }
                })
            }
        },
    }
}
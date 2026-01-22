export default {
    methods: {
        handleCommand(cmd) {
            console.log('Command received:', cmd)
            if (cmd === 'exportExcel') {
                this.openExportDialog = true
                this.exportType = 'excel'
            } else if (cmd === 'exportJSON') {
                this.exportTreeToJSON('dto')
            } else if (cmd === 'exportJSONCIM') {
                this.exportTreeToJSON('cim')
            } else if (cmd === 'exportXML') {
                this.openExportDialog = true
                this.exportType = 'xml'
            } else if (cmd === 'exportWord') {
                this.openExportDialog = true
                this.exportType = 'word'
            } else if (cmd === 'exportPDF') {
                this.openExportDialog = true
                this.exportType = 'pdf'
            }
        },
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
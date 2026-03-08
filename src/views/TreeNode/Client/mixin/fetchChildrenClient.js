import Vue from 'vue'
export default {
    methods: {
        async fetchChildren(node) {
            // Lưu children hiện có (nếu có) để merge sau
            // Điều này đảm bảo không mất asset đã add trước đó khi node chưa được expand
            const existingChildren = Array.isArray(node.children) ? [...node.children] : []

            // Chỉ fetch nếu:
            // 1. Chưa có children (chưa fetch lần nào)
            // 2. Hoặc có children nhưng chưa được fetch từ server (chỉ có asset mới add)
            // 3. Hoặc có children đã fetch nhưng có asset mới add (cần merge)
            const hasExistingChildren = existingChildren.length > 0
            const needsFetch = !node.children || !node._childrenFetched || hasExistingChildren
            if (needsFetch) {
                try {
                    let newRows = []
                    let parentDisplayName = node.name;
                    if (['organisation', 'substation', 'voltageLevel', 'bay'].includes(node.mode)) {
                        parentDisplayName = node.aliasName || node.name;
                    } else if (node.mode === 'asset') {
                        parentDisplayName = node.apparatus_id || node.serial_number || node.name;
                    }
                    if (node.mode == 'asset') {
                        const clickedRow = node
                        if (node.asset && node.asset == 'Surge arrester') {
                            const jobsReturn = await this.fetchJobsByAssetId(node.mrid)
                            if (jobsReturn.success) {
                                jobsReturn.data.forEach((row) => {
                                    row.parentId = clickedRow.mrid
                                    row.mode = 'job'
                                    row.job = 'Surge arrester'
                                    let parentName = clickedRow.parentName + '/' + clickedRow.name
                                    row.parentName = parentName
                                    row.parentArr = [...(clickedRow.parentArr || [])]
                                    row.parentArr.push({
                                        mrid: clickedRow.mrid,
                                        parent: parentDisplayName
                                    })
                                })
                                newRows.push(...jobsReturn.data)
                            }
                        } else if (node.asset && node.asset == 'Transformer') {
                            const jobsReturn = await this.fetchJobsByAssetId(node.mrid)
                            if (jobsReturn.success) {
                                jobsReturn.data.forEach((row) => {
                                    row.parentId = clickedRow.mrid
                                    row.mode = 'job'
                                    row.job = 'Transformer'
                                    let parentName = clickedRow.parentName + '/' + clickedRow.name
                                    row.parentName = parentName
                                    row.parentArr = [...(clickedRow.parentArr || [])]
                                    row.parentArr.push({
                                        mrid: clickedRow.mrid,
                                        parent: parentDisplayName
                                    })
                                })
                                newRows.push(...jobsReturn.data)
                            }
                        } else if (node.asset && node.asset == 'Voltage transformer') {
                            const jobsReturn = await this.fetchJobsByAssetId(node.mrid)
                            if (jobsReturn.success) {
                                jobsReturn.data.forEach((row) => {
                                    row.parentId = clickedRow.mrid
                                    row.mode = 'job'
                                    row.job = 'Voltage transformer'
                                    let parentName = clickedRow.parentName + '/' + clickedRow.name
                                    row.parentName = parentName
                                    row.parentArr = [...(clickedRow.parentArr || [])]
                                    row.parentArr.push({
                                        mrid: clickedRow.mrid,
                                        parent: parentDisplayName
                                    })
                                })
                                newRows.push(...jobsReturn.data)
                            }
                        } else if (node.asset && node.asset == 'Current transformer') {
                            const jobsReturn = await this.fetchJobsByAssetId(node.mrid)
                            if (jobsReturn.success) {
                                jobsReturn.data.forEach((row) => {
                                    row.parentId = clickedRow.mrid
                                    row.mode = 'job'
                                    row.job = 'Current transformer'
                                    let parentName = clickedRow.parentName + '/' + clickedRow.name
                                    row.parentName = parentName
                                    row.parentArr = [...(clickedRow.parentArr || [])]
                                    row.parentArr.push({
                                        mrid: clickedRow.mrid,
                                        parent: parentDisplayName
                                    })
                                })
                                newRows.push(...jobsReturn.data)
                            }
                        } else if (node.asset && node.asset == 'Disconnector') {
                            const jobsReturn = await this.fetchJobsByAssetId(node.mrid)
                            if (jobsReturn.success) {
                                jobsReturn.data.forEach((row) => {
                                    row.parentId = clickedRow.mrid
                                    row.mode = 'job'
                                    row.job = 'Disconnector'
                                    let parentName = clickedRow.parentName + '/' + clickedRow.name
                                    row.parentName = parentName
                                    row.parentArr = [...(clickedRow.parentArr || [])]
                                    row.parentArr.push({
                                        mrid: clickedRow.mrid,
                                        parent: parentDisplayName
                                    })
                                })
                                newRows.push(...jobsReturn.data)
                            }
                        } else if (node.asset && node.asset == 'Circuit breaker') {
                            const jobsReturn = await this.fetchJobsByAssetId(node.mrid)
                            if (jobsReturn.success) {
                                jobsReturn.data.forEach((row) => {
                                    row.parentId = clickedRow.mrid
                                    row.mode = 'job'
                                    row.job = 'Circuit breaker'
                                    let parentName = clickedRow.parentName + '/' + clickedRow.name
                                    row.parentName = parentName
                                    row.parentArr = [...(clickedRow.parentArr || [])]
                                    row.parentArr.push({
                                        mrid: clickedRow.mrid,
                                        parent: parentDisplayName
                                    })
                                })
                                newRows.push(...jobsReturn.data)
                            }
                        } else if (node.asset && node.asset == 'Power cable') {
                            const jobsReturn = await this.fetchJobsByAssetId(node.mrid)
                            if (jobsReturn.success) {
                                jobsReturn.data.forEach((row) => {
                                    row.parentId = clickedRow.mrid
                                    row.mode = 'job'
                                    row.job = 'Power cable'
                                    let parentName = clickedRow.parentName + '/' + clickedRow.name
                                    row.parentName = parentName
                                    row.parentArr = [...(clickedRow.parentArr || [])]
                                    row.parentArr.push({
                                        mrid: clickedRow.mrid,
                                        parent: parentDisplayName
                                    })
                                })
                                newRows.push(...jobsReturn.data)
                            }
                        } else if (node.asset && node.asset == 'Rotating machine') {
                            const jobsReturn = await this.fetchJobsByAssetId(node.mrid)
                            if (jobsReturn.success) {
                                jobsReturn.data.forEach((row) => {
                                    row.parentId = clickedRow.mrid
                                    row.mode = 'job'
                                    row.job = 'Rotating machine'
                                    let parentName = clickedRow.parentName + '/' + clickedRow.name
                                    row.parentName = parentName
                                    row.parentArr = [...(clickedRow.parentArr || [])]
                                    row.parentArr.push({
                                        mrid: clickedRow.mrid,
                                        parent: parentDisplayName
                                    })
                                })
                                newRows.push(...jobsReturn.data)
                            }
                        } else if (node.asset && node.asset == 'Reactor') {
                            const jobsReturn = await this.fetchJobsByAssetId(node.mrid)
                            if (jobsReturn.success) {
                                jobsReturn.data.forEach((row) => {
                                    row.parentId = clickedRow.mrid
                                    row.mode = 'job'
                                    row.job = 'Reactor'
                                    let parentName = clickedRow.parentName + '/' + clickedRow.name
                                    row.parentName = parentName
                                    row.parentArr = [...(clickedRow.parentArr || [])]
                                    row.parentArr.push({
                                        mrid: clickedRow.mrid,
                                        parent: parentDisplayName
                                    })
                                })
                                newRows.push(...jobsReturn.data)
                            }
                        } else if (node.asset && node.asset == 'Capacitor') {
                            const jobsReturn = await this.fetchJobsByAssetId(node.mrid)
                            if (jobsReturn.success) {
                                jobsReturn.data.forEach((row) => {
                                    row.parentId = clickedRow.mrid
                                    row.mode = 'job'
                                    row.job = 'Capacitor'
                                    let parentName = clickedRow.parentName + '/' + clickedRow.name
                                    row.parentName = parentName
                                    row.parentArr = [...(clickedRow.parentArr || [])]
                                    row.parentArr.push({
                                        mrid: clickedRow.mrid,
                                        parent: parentDisplayName
                                    })
                                })
                                newRows.push(...jobsReturn.data)
                            }
                        } else if (node.asset && node.asset == 'Bushing') {
                            const jobsReturn = await this.fetchJobsByAssetId(node.mrid)
                            if (jobsReturn.success) {
                                jobsReturn.data.forEach((row) => {
                                    row.parentId = clickedRow.mrid
                                    row.mode = 'job'
                                    row.job = 'Bushing'
                                    let parentName = clickedRow.parentName + '/' + clickedRow.name
                                    row.parentName = parentName
                                    row.parentArr = [...(clickedRow.parentArr || [])]
                                    row.parentArr.push({
                                        mrid: clickedRow.mrid,
                                        parent: parentDisplayName
                                    })
                                })
                                newRows.push(...jobsReturn.data)
                            }
                        }
                    } else if (node.mode == 'substation') {
                        const clickedRow = node
                        const [voltageLevelReturn, bayReturn] = await Promise.all([
                            window.electronAPI.getVoltageLevelBySubstationId(clickedRow.mrid),
                            window.electronAPI.getBayByVoltageBySubstationId(null, clickedRow.mrid)
                        ])
                        const [
                            assetTransformerReturn,
                            assetSurgeReturn,
                            assetBushingReturn,
                            assetVtReturn,
                            assetDisconnectorReturn,
                            assetPowerCableReturn,
                            assetRotatingMachineReturn,
                            assetCurrentTransformerReturn,
                            assetCapacitorReturn,
                            assetBreakerReturn,
                            assetReactorReturn
                        ] = await this.fetchAssetByPsr(clickedRow.mrid)
                        if (voltageLevelReturn.success) {
                            voltageLevelReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'voltageLevel'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                            })
                            newRows.push(...voltageLevelReturn.data)
                        }

                        if (bayReturn.success) {
                            bayReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'bay'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                            })
                            newRows.push(...bayReturn.data)
                        }

                        if (assetTransformerReturn.success) {
                            assetTransformerReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Transformer'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                // Đánh dấu rằng node này đã có đầy đủ thông tin properties từ API
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetTransformerReturn.data)
                        }

                        if (assetSurgeReturn.success) {
                            assetSurgeReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Surge arrester'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                // Đánh dấu rằng node này đã có đầy đủ thông tin properties từ API
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetSurgeReturn.data)
                        }

                        if (assetBushingReturn.success) {
                            assetBushingReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Bushing'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                // Đánh dấu rằng node này đã có đầy đủ thông tin properties từ API
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetBushingReturn.data)
                        }

                        if (assetVtReturn.success) {
                            assetVtReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Voltage transformer'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                // Đánh dấu rằng node này đã có đầy đủ thông tin properties từ API
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetVtReturn.data)
                        }

                        if (assetDisconnectorReturn.success && assetDisconnectorReturn.data) {
                            const dataArray = Array.isArray(assetDisconnectorReturn.data) ? assetDisconnectorReturn.data : [assetDisconnectorReturn.data]
                            dataArray.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Disconnector'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                // Đánh dấu rằng node này đã có đầy đủ thông tin properties từ API
                                row._hasFullProperties = true
                            })
                            newRows.push(...dataArray)
                        }

                        if (assetPowerCableReturn.success) {
                            assetPowerCableReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Power cable'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                // Đánh dấu rằng node này đã có đầy đủ thông tin properties từ API
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetPowerCableReturn.data)
                        }

                        if (assetRotatingMachineReturn.success) {
                            assetRotatingMachineReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Rotating machine'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                // Đánh dấu rằng node này đã có đầy đủ thông tin properties từ API
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetRotatingMachineReturn.data)
                        }

                        if (assetCapacitorReturn.success) {
                            assetCapacitorReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Capacitor'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                // Đánh dấu rằng node này đã có đầy đủ thông tin properties từ API
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetCapacitorReturn.data)
                        }

                        if (assetReactorReturn.success) {
                            assetReactorReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Reactor'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                // Đánh dấu rằng node này đã có đầy đủ thông tin properties từ API
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetReactorReturn.data)
                        }

                        if (assetCurrentTransformerReturn.success) {
                            assetCurrentTransformerReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Current transformer'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                // Đánh dấu rằng node này đã có đầy đủ thông tin properties từ API
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetCurrentTransformerReturn.data)
                        }

                        if (assetBreakerReturn.success) {
                            assetBreakerReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Circuit breaker'
                                // ✅ Preserve type from API if exists
                                // row.type already exists from API, don't overwrite it
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                // Đánh dấu rằng node này đã có đầy đủ thông tin properties từ API
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetBreakerReturn.data)
                        }
                    } else if (node.mode == 'voltageLevel') {
                        const clickedRow = node
                        const [bayReturn] = await Promise.all([window.electronAPI.getBayByVoltageBySubstationId(clickedRow.mrid, null)])

                        if (bayReturn.success) {
                            bayReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'bay'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                            })
                            newRows.push(...bayReturn.data)
                        }
                    } else if (node.mode == 'bay') {
                        const clickedRow = node
                        const [
                            assetTransformerReturn,
                            assetSurgeReturn,
                            assetBushingReturn,
                            assetVtReturn,
                            assetDisconnectorReturn,
                            assetPowerCableReturn,
                            assetRotatingMachineReturn,
                            assetCurrentTransformerReturn,
                            assetCapacitorReturn,
                            //assetBreakerReturn,
                            assetReactorReturn
                        ] = await this.fetchAssetByPsr(clickedRow.mrid)
                        if (assetTransformerReturn.success) {
                            assetTransformerReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Transformer'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetTransformerReturn.data)
                        }
                        if (assetSurgeReturn.success) {
                            assetSurgeReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Surge arrester'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetSurgeReturn.data)
                        }
                        if (assetBushingReturn.success) {
                            assetBushingReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Bushing'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetBushingReturn.data)
                        }
                        if (assetVtReturn.success) {
                            assetVtReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Voltage transformer'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetVtReturn.data)
                        }
                        if (assetDisconnectorReturn.success && assetDisconnectorReturn.data) {
                            const dataArray = Array.isArray(assetDisconnectorReturn.data) ? assetDisconnectorReturn.data : [assetDisconnectorReturn.data]
                            dataArray.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Disconnector'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                row._hasFullProperties = true
                            })
                            newRows.push(...dataArray)
                        }
                        if (assetPowerCableReturn.success) {
                            assetPowerCableReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Power cable'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetPowerCableReturn.data)
                        }
                        if (assetCurrentTransformerReturn.success) {
                            assetCurrentTransformerReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Current transformer'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetCurrentTransformerReturn.data)
                        }
                        if (assetRotatingMachineReturn.success) {
                            assetRotatingMachineReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Rotating machine'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetRotatingMachineReturn.data)
                        }
                        if (assetCapacitorReturn.success) {
                            assetCapacitorReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Capacitor'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetCapacitorReturn.data)
                        }

                        if (assetReactorReturn.success) {
                            assetReactorReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'asset'
                                row.asset = 'Reactor'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                row._hasFullProperties = true
                            })
                            newRows.push(...assetReactorReturn.data)
                        }
                    } else {
                        const clickedRow = node
                        const [organisationReturn, substationReturn] = await Promise.all([
                            window.electronAPI.getParentOrganizationByParentMrid(clickedRow.mrid),
                            window.electronAPI.getSubstationsInOrganisationForUser(clickedRow.mrid, this.$store.state.user.user_id)
                        ])

                        if (organisationReturn.success && organisationReturn.data && organisationReturn.data.length > 0) {
                            organisationReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'organisation'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                                // Đánh dấu rằng node này đã có đầy đủ thông tin properties từ API
                                // Để tránh gọi API lại trong showPropertiesDataClient
                                row._hasFullProperties = true
                            })
                            newRows.push(...organisationReturn.data)
                        }

                        if (substationReturn.success && substationReturn.data && substationReturn.data.length > 0) {
                            substationReturn.data.forEach((row) => {
                                row.parentId = clickedRow.mrid
                                row.mode = 'substation'
                                let parentName = clickedRow.parentName + '/' + clickedRow.name
                                row.parentName = parentName
                                row.parentArr = [...(clickedRow.parentArr || [])]
                                row.parentArr.push({
                                    mrid: clickedRow.mrid,
                                    parent: parentDisplayName
                                })
                            })
                            newRows.push(...substationReturn.data)
                        }
                    }
                    // Merge với children hiện có (nếu có) để không mất asset đã add trước đó
                    if (existingChildren.length > 0) {
                        // Tạo map của mrid để tránh duplicate
                        const existingMrids = new Set(existingChildren.map((c) => c.mrid))
                        // Chỉ thêm children mới nếu chưa có trong existingChildren
                        const newChildrenToAdd = newRows.filter((row) => !existingMrids.has(row.mrid))
                        Vue.set(node, 'children', [...existingChildren, ...newChildrenToAdd])
                    } else {
                        Vue.set(node, 'children', newRows) // Đảm bảo Vue reactive
                    }
                    // Đánh dấu đã fetch để tránh fetch lại không cần thiết
                    Vue.set(node, '_childrenFetched', true)
                } catch (error) {
                    console.error('Error fetching children:', error)
                    this.$message.error('Có lỗi xảy ra khi tải dữ liệu: ' + error.message)
                }
            }
        },
    }
}
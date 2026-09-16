/**
 * SAO CHÉP và ĐI TỚI một đường dẫn trên cây.
 *
 * Thanh path phía trên cây vốn chỉ để bấm lùi về cấp trên. Mixin này thêm hai việc:
 * chép đường dẫn hiện tại ra text, và dán một đường dẫn vào để nhảy thẳng tới node đó.
 *
 * ─── VÌ SAO DẤU PHÂN CÁCH LÀ ' / ' ───────────────────────────────────────────
 *
 * Không có ký tự nào tuyệt đối an toàn — tên trạm, ngăn, thiết bị đều do người dùng đặt.
 * Chọn `/` vì nó quen thuộc như đường dẫn thư mục và hiếm gặp trong tên thiết bị, còn `>`
 * thì dễ lẫn với dấu phân cách đang hiển thị trên thanh.
 *
 * Nếu tên node CÓ chứa `/` thì tách sẽ sai và kết quả là "path does not exist" — báo sai
 * chỗ, nhưng không bao giờ đi nhầm tới node khác. Sai kiểu không tìm thấy thì người dùng
 * còn biết đường xử lý; sai kiểu mở nhầm node thì nguy hiểm hơn nhiều.
 *
 * ─── VÌ SAO PHẢI NẠP CON TỪNG CẤP ────────────────────────────────────────────
 *
 * Cây nạp lười: node chưa mở thì `children` rỗng. Nên không thể tìm một lần trên toàn cây
 * — phải đi từ gốc, mỗi cấp gọi `fetchChildren` rồi mới tìm được cấp kế tiếp.
 */

const SEPARATOR = ' / '

/** Nhãn hiển thị của một node — đúng thứ cây đang vẽ (xem TreeNode.vue). */
const nodeLabel = (node) => {
    if (!node) return ''
    if (node.mode === 'job') return String(node.name || '')
    return String(node.aliasName || node.name || '')
}

const normalize = (value) => String(value == null ? '' : value).trim().toLowerCase()

export default {
    methods: {
        /**
         * Đường dẫn hiện tại dạng text.
         *
         * Dựng từ chính `pathMap*` mà thanh đang hiển thị, nên chép ra đúng cái người dùng
         * nhìn thấy — không dựng lại từ cây, tránh lệch giữa hai nguồn.
         */
        buildCurrentPathText(side) {
            const path = side === 'server' ? this.pathMapServer : this.pathMapClient
            if (!Array.isArray(path) || path.length === 0) return ''
            return path.map(item => String((item && item.parent) || '')).join(SEPARATOR)
        },

        async copyCurrentPath(side) {
            const text = this.buildCurrentPathText(side)
            if (!text) {
                this.$message.warning('Select a node first')
                return
            }
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text)
                } else {
                    this.copyViaTextarea(text)
                }
                this.$message.success('Path copied')
            } catch (error) {
                console.error('[path] copy failed:', error)
                this.copyViaTextarea(text)
            }
        },

        /** Trình duyệt cũ hoặc không có quyền clipboard thì dùng cách này. */
        copyViaTextarea(text) {
            const area = document.createElement('textarea')
            area.value = text
            area.style.position = 'fixed'
            area.style.opacity = '0'
            document.body.appendChild(area)
            area.select()
            try { document.execCommand('copy') } catch (e) { console.error(e) }
            document.body.removeChild(area)
        },

        /**
         * Đi tới node theo đường dẫn text.
         *
         * Đi từng cấp một, mỗi cấp nạp con trước rồi mới tìm. Không tìm thấy ở cấp nào thì
         * dừng và nói RÕ hỏng ở đâu — "path does not exist" trơ trọi thì người dùng phải
         * tự dò lại từng tên.
         */
        async goToPath(side, rawText) {
            const text = String(rawText || '').trim()
            if (!text) {
                this.$message.warning('Enter a path')
                return false
            }

            const segments = text.split('/').map(s => s.trim()).filter(Boolean)
            if (segments.length === 0) {
                this.$message.warning('Enter a path')
                return false
            }

            const isServer = side === 'server'
            const roots = isServer ? this.ownerServerList : this.organisationClientList
            const fetchChildrenFn = isServer ? this.fetchChildrenServer : this.fetchChildren

            if (!Array.isArray(roots) || roots.length === 0) {
                this.$message.error('Path does not exist (tree is empty)')
                return false
            }

            let level = roots
            let current = null

            for (let i = 0; i < segments.length; i++) {
                const wanted = normalize(segments[i])
                const matches = (level || []).filter(n => normalize(nodeLabel(n)) === wanted)

                if (matches.length === 0) {
                    // Nói rõ đứt ở đâu: đoạn nào không khớp và nó nằm dưới node nào.
                    const parentLabel = current ? nodeLabel(current) : 'the root'
                    this.$message.error(`Path does not exist: "${segments[i]}" not found under ${parentLabel}`)
                    return false
                }
                if (matches.length > 1) {
                    // Trùng tên là chuyện có thật (hai ngăn cùng tên khác trạm). Đi bừa vào
                    // cái đầu tiên thì có thể mở nhầm node — nói ra để người dùng tự chọn.
                    this.$message.error(`Path is ambiguous: ${matches.length} nodes named "${segments[i]}" under ${parentLabel(current)}`)
                    return false
                }

                current = matches[0]

                // Nạp con TRƯỚC khi sang đoạn kế tiếp — cây nạp lười nên chưa mở thì rỗng.
                if (i < segments.length - 1) {
                    if (typeof fetchChildrenFn === 'function') {
                        try {
                            await fetchChildrenFn(current)
                        } catch (error) {
                            console.error('[path] fetch children failed:', error)
                            this.$message.error(`Path does not exist: cannot open "${nodeLabel(current)}"`)
                            return false
                        }
                    }
                    this.$set(current, 'expanded', true)
                    level = Array.isArray(current.children) ? current.children : []
                }
            }

            await this.$nextTick()
            await this.revealPathTarget(side, current)
            this.$message.success(`Went to ${nodeLabel(current)}`)
            return true
        },

        /**
         * ĐI TỚI NODE THEO mrid — dùng cho kết quả tìm kiếm.
         *
         * Khác `goToPath` ở chỗ đi theo mrid chứ không theo tên. Kết quả tìm kiếm chỉ có
         * mrid, và mrid là định danh thật: hai ngăn trùng tên vẫn phân biệt được, còn đi
         * theo tên thì gặp trùng là phải bỏ cuộc.
         *
         * Chuỗi cha hỏi thẳng CSDL (`getNodePath`) thay vì dò trên cây — dò thì phải bung
         * từng nhánh một, với cây vài nghìn node là bung gần hết cây để tìm một cái.
         */
        async goToNodeByMrid(result) {
            const isServer = !this.clientSlide
            let rs
            if (isServer) {
                rs = {
                    success: Array.isArray(result.path) && result.path.length > 0,
                    data: result.path || [],
                }
            } else {
                const api = window.electronAPI
                if (!api || !api.getNodePath) {
                    this.$message.error('Cannot locate the node in this build')
                    return false
                }
                rs = await api.getNodePath(result.mrid, result.mode)
            }
            if (!rs || !rs.success || !Array.isArray(rs.data) || rs.data.length === 0) {
                this.$message.error(`Could not locate "${result.title}": ${(rs && rs.message) || 'path not found'}`)
                return false
            }
            const chain = rs.data

            const roots = isServer ? this.ownerServerList : this.organisationClientList
            const fetchChildren = isServer ? this.fetchChildrenServer : this.fetchChildren
            if (!Array.isArray(roots) || roots.length === 0) {
                this.$message.error('Cannot locate the node (tree is empty)')
                return false
            }

            let level = roots
            let current = null

            for (let i = 0; i < chain.length; i++) {
                const step = chain[i]
                const found = (level || []).find((node) => {
                    if (!node || String(node.mrid) !== String(step.mrid)) return false
                    if (step.mode && node.mode !== step.mode) return false
                    if (i === chain.length - 1 && result.assetType && node.mode === 'asset') {
                        return node.asset === result.assetType
                    }
                    return true
                })
                if (!found) {
                    // Nói rõ đứt ở cấp nào. Thường gặp nhất: node thuộc về người dùng khác
                    // nên không có mặt trên cây — mà tìm kiếm đã lọc theo quyền sở hữu, nên
                    // nếu rơi vào đây thì là dữ liệu lệch, đáng để biết.
                    const where = i === 0 ? 'the root' : (chain[i - 1].name || 'the level above')
                    this.$message.error(`Could not open "${step.name || step.mrid}" under ${where}`)
                    return false
                }

                current = found
                if (i < chain.length - 1) {
                    try {
                        if (typeof fetchChildren === 'function') await fetchChildren(current)
                    } catch (error) {
                        console.error('[search] nap con that bai:', error)
                        this.$message.error(`Could not open "${step.name || step.mrid}"`)
                        return false
                    }
                    this.$set(current, 'expanded', true)
                    level = Array.isArray(current.children) ? current.children : []
                }
            }

            await this.$nextTick()
            await this.revealPathTarget(isServer ? 'server' : 'client', current)

            if (rs.truncatedPath) {
                this.$message.warning(`Went to ${nodeLabel(current)} — the parent chain looks broken, check the tree`)
            }
            return true
        },

        /**
         * Nạp ngầm node của một kết quả tìm kiếm để xem properties khi hover.
         * Không expand, không select và không đổi breadcrumb.
         */
        async resolveSearchResultNode(result, side) {
            const isServer = side === 'server'
            let pathResult
            if (isServer) {
                pathResult = {
                    success: Array.isArray(result.path) && result.path.length > 0,
                    data: result.path || []
                }
            } else {
                const api = window.electronAPI
                if (!api || !api.getNodePath) return null
                pathResult = await api.getNodePath(result.mrid, result.mode)
            }
            if (!pathResult || !pathResult.success || !Array.isArray(pathResult.data)) return null

            const roots = isServer ? this.ownerServerList : this.organisationClientList
            const fetchChildren = isServer ? this.fetchChildrenServer : this.fetchChildren
            let level = roots
            let current = null
            let parent = null

            for (let i = 0; i < pathResult.data.length; i++) {
                const step = pathResult.data[i]
                const found = (level || []).find((node) => {
                    if (!node || String(node.mrid) !== String(step.mrid)) return false
                    if (step.mode && node.mode !== step.mode) return false
                    if (i === pathResult.data.length - 1 && result.assetType && node.mode === 'asset') {
                        return node.asset === result.assetType
                    }
                    return true
                })
                if (!found) return null

                current = found
                if (parent && !current.parent) this.$set(current, 'parent', parent)
                if (i < pathResult.data.length - 1) {
                    if (typeof fetchChildren === 'function') await fetchChildren(current)
                    parent = current
                    level = Array.isArray(current.children) ? current.children : []
                }
            }
            return current
        },

        /**
         * Chọn node đích và cập nhật thanh path.
         *
         * Dùng lại đúng đường mà một cú click chuột đi qua, để trạng thái sau khi nhảy
         * giống hệt trạng thái sau khi bấm tay — không dựng một đường riêng dễ lệch.
         */
        async revealPathTarget(side, node) {
            if (!node) return
            this.selectedNodes = [node]

            const loadPath = side === 'server' ? this.loadPathMap : this.loadPathMapClient
            if (typeof loadPath === 'function') await loadPath.call(this, node)

            const showProperties = side === 'server'
                ? this.showPropertiesData
                : this.showPropertiesDataClient
            if (typeof showProperties === 'function') {
                try { await showProperties.call(this, node) } catch (error) {
                    console.error('[path] show properties failed:', error)
                }
            }
        },
    },
}

/** Nhãn node cha cho câu thông báo, hoặc 'the root' nếu đang ở cấp gốc. */
function parentLabel(node) {
    return node ? (node.aliasName || node.name || 'this node') : 'the root'
}

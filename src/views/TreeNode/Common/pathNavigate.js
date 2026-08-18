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

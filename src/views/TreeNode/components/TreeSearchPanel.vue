<template>
    <div class="search-panel">
        <el-input
            ref="input"
            v-model="keyword"
            size="small"
            clearable
            placeholder="Search name, serial, address, job..."
            prefix-icon="el-icon-search"
            @input="onType"
            @keydown.native.esc="$emit('close')" />

        <div class="search-body">
            <div v-if="loading" class="search-note">Searching...</div>

            <!--
              Ba trạng thái rỗng KHÁC NHAU, và phải nói khác nhau: chưa gõ gì, gõ chưa đủ
              dài, và gõ rồi nhưng không có. Gộp thành một câu "no results" thì người dùng
              gõ một chữ sẽ tưởng là dữ liệu không có.
            -->
            <div v-else-if="!keyword.trim()" class="search-note">
                Type to search across the whole database, not just the branches you opened.
            </div>
            <div v-else-if="keyword.trim().length < 2" class="search-note">
                Type at least 2 characters.
            </div>
            <div v-else-if="results.length === 0" class="search-note">
                Nothing matches "{{ keyword.trim() }}".
            </div>

            <template v-else>
                <div class="search-count">
                    {{ results.length }} result<span v-if="results.length !== 1">s</span>
                    <span v-if="truncated"> (showing the first {{ results.length }})</span>
                </div>

                <button
                    v-for="(r, i) in results"
                    :key="r.mode + r.mrid + i"
                    type="button"
                    class="search-item"
                    @click="$emit('select', r)">
                    <div class="search-item-top">
                        <span class="search-title">{{ r.title }}</span>
                        <span class="search-type">{{ r.typeLabel }}</span>
                    </div>
                    <!--
                      Nói rõ KHỚP Ở ĐÂU. Tìm "ABB" mà kết quả là "CT-271-A" thì nhìn vào
                      không hiểu vì sao nó ra; ghi "Manufacturer: ABB" là hiểu ngay.
                    -->
                    <div class="search-item-hit">
                        <span class="hit-label">{{ r.matchedField }}</span>
                        <span class="hit-value">{{ r.matchedValue }}</span>
                        <span v-if="r.otherMatches && r.otherMatches.length" class="hit-more">
                            +{{ r.otherMatches.length }} more
                        </span>
                    </div>
                </button>
            </template>

            <!-- Loại node truy vấn hỏng thì phải nói, nếu không người dùng tin là không có. -->
            <div v-if="failures.length" class="search-fail">
                Could not search: {{ failures.join('; ') }}
            </div>
        </div>
    </div>
</template>

<script>
/**
 * Ô TÌM KIẾM TRÊN CÂY.
 *
 * Tìm trên TOÀN BỘ CSDL chứ không lọc phần cây đã nạp — cây nạp dần từng nhánh, nên lọc
 * thứ đã nạp thì gần như không tìm ra gì lúc mới mở app.
 *
 * ─── VÌ SAO CÓ ĐỘ TRỄ KHI GÕ ────────────────────────────────────────────────
 *
 * Mỗi lần tìm là 6 truy vấn (một cho mỗi loại node), mỗi truy vấn LEFT JOIN tới 9 bảng.
 * Gõ "EVNHCMC" mà bắn theo từng phím là 7 lượt × 6 truy vấn. Chờ người dùng ngừng gõ
 * 250 ms rồi mới chạy.
 *
 * ─── VÌ SAO ĐÁNH SỐ LƯỢT ────────────────────────────────────────────────────
 *
 * Lượt gõ trước có thể về SAU lượt sau (truy vấn dài hơn). Không đánh số thì kết quả cũ
 * ghi đè kết quả mới, và danh sách hiện ra không khớp với chữ đang nằm trong ô.
 */
export default {
    name: 'TreeSearchPanel',
    data() {
        return {
            keyword: '',
            results: [],
            failures: [],
            truncated: false,
            loading: false,
            timer: null,
            runId: 0,
        }
    },
    methods: {
        focus() {
            this.$nextTick(() => {
                const input = this.$refs.input
                if (input && typeof input.focus === 'function') input.focus()
            })
        },

        onType() {
            if (this.timer) clearTimeout(this.timer)
            const term = this.keyword.trim()
            if (term.length < 2) {
                this.results = []
                this.failures = []
                this.loading = false
                return
            }
            this.timer = setTimeout(this.run, 250)
        },

        async run() {
            const term = this.keyword.trim()
            const api = window.electronAPI
            if (!api || !api.searchTree) {
                this.failures = ['search is not available in this build']
                return
            }
            const userId = this.$store && this.$store.state && this.$store.state.user
                ? this.$store.state.user.user_id
                : null
            if (!userId) {
                this.failures = ['no user is signed in']
                return
            }

            const myRun = ++this.runId
            this.loading = true
            try {
                const rs = await api.searchTree(userId, term, { limit: 50 })
                // Lượt cũ về muộn thì BỎ, không ghi đè kết quả của lượt mới hơn.
                if (myRun !== this.runId) return
                if (rs && rs.success) {
                    this.results = rs.data || []
                    this.failures = rs.failures || []
                    this.truncated = !!rs.truncated
                } else {
                    this.results = []
                    this.failures = [(rs && rs.message) || 'search failed']
                }
            } catch (error) {
                if (myRun !== this.runId) return
                console.error('[search] goi that bai:', error)
                this.results = []
                this.failures = [(error && error.message) || 'search failed']
            } finally {
                if (myRun === this.runId) this.loading = false
            }
        },

        reset() {
            this.keyword = ''
            this.results = []
            this.failures = []
            this.truncated = false
            this.loading = false
            if (this.timer) clearTimeout(this.timer)
        },
    },
    beforeDestroy() {
        if (this.timer) clearTimeout(this.timer)
    },
}
</script>

<style scoped>
.search-panel { width: 380px; }

.search-body { margin-top: 8px; max-height: 420px; overflow: auto; }

.search-note {
    padding: 14px 6px;
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
}

.search-count {
    font-size: 11px;
    color: #909399;
    padding: 2px 4px 6px;
}

.search-item {
    display: block;
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    border-radius: 4px;
    padding: 6px 8px;
    cursor: pointer;
    font: inherit;
}
.search-item:hover { background: #f0f7ff; }

.search-item-top {
    display: flex;
    align-items: baseline;
    gap: 8px;
}
.search-title {
    font-size: 13px;
    color: #303133;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.search-type {
    margin-left: auto;
    flex: none;
    font-size: 10px;
    color: #409eff;
    border: 1px solid #b3d8ff;
    border-radius: 3px;
    padding: 0 4px;
}

.search-item-hit {
    margin-top: 2px;
    font-size: 11px;
    color: #909399;
    display: flex;
    gap: 6px;
    align-items: baseline;
}
.hit-label { flex: none; color: #c0c4cc; }
.hit-value { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hit-more { flex: none; color: #c0c4cc; }

.search-fail {
    margin-top: 8px;
    padding: 6px 8px;
    font-size: 11px;
    color: #e6a23c;
    background: #fdf6ec;
    border-radius: 4px;
}
</style>

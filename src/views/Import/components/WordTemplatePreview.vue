<template>
  <el-dialog :visible="visible" custom-class="word-preview-dialog" width="min(1600px, 96vw)" top="2vh"
    append-to-body :show-close="false" @open="openPreview" @close="closePreview" @closed="clearPreview">
    <div slot="title" class="word-preview-header">
      <div class="word-preview-heading">
        <strong>Word Template Preview — {{ templateName }}</strong>
        <small>{{ fileName }}</small>
      </div>
      <div class="word-preview-header-actions">
        <label title="Highlight mapped placeholders in the template">
          <input v-model="highlightAll" type="checkbox" :disabled="renderMode === 'sample'" /> Highlight mapped positions
        </label>
        <div class="word-preview-modes" role="group" aria-label="Preview mode">
          <button type="button" :class="{active: renderMode === 'template'}" :disabled="loading" @click="switchMode('template')">Placeholders</button>
          <button type="button" :class="{active: renderMode === 'sample'}" :disabled="loading || !sampleAvailable"
            :title="sampleAvailable ? 'View saved sample report' : 'No sample report saved for this template'"
            @click="switchMode('sample')">Sample Filled Values</button>
        </div>
        <button type="button" class="word-preview-close" title="Close preview" @click="closePreview"><i class="el-icon-close"></i></button>
      </div>
    </div>

    <div class="word-preview-layout">
      <div class="word-preview-stage-shell">
        <div v-if="!loading && !errorMessage && pageCount" class="word-preview-page-nav" aria-label="Word document pages">
          <button type="button" title="Previous page" aria-label="Previous page" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)"><i class="el-icon-arrow-left"></i></button>
          <span>Page {{ currentPage }} / {{ pageCount }}</span>
          <button type="button" title="Next page" aria-label="Next page" :disabled="currentPage >= pageCount" @click="goToPage(currentPage + 1)"><i class="el-icon-arrow-right"></i></button>
        </div>
        <div ref="stage" class="word-preview-stage" @scroll="updateCurrentPage">
          <div v-if="loading" class="word-preview-status"><i class="el-icon-loading"></i> Rendering Word document...</div>
          <div v-else-if="errorMessage" class="word-preview-status word-preview-error">{{ errorMessage }}</div>
          <div ref="docRoot" class="word-preview-docx" :class="{'show-highlights': highlightAll && renderMode === 'template'}"
            @click="onDocumentClick" @keydown="onDocumentKeydown" @mouseover="onDocumentHover"></div>
          <div ref="styles"></div>
        </div>
      </div>
      <aside class="word-preview-mappings">
        <div class="word-preview-mappings-head">
          <strong>Mapped Template Fields ({{ mappedRows.length }})</strong>
          <small>{{ renderMode === 'sample' ? 'Saved sample report' : `${renderedCodes.length} / ${mappedRows.length} found in template` }}</small>
        </div>
        <div class="word-preview-mapping-list">
          <button v-for="row in mappedRows" :key="row.code" :ref="'mapping-' + row.code" type="button"
            class="word-preview-mapping" :class="{active: activeCode === row.code, missing: renderMode === 'template' && !renderedCodes.includes(row.code)}"
            :title="renderedCodes.includes(row.code) ? `Locate {${row.code}}` : 'Placeholder not found in template'"
            @click="focusCode(row.code)">
            <strong>{{ '{' + row.code + '}' }} — {{ fieldLabel(row) }}</strong>
            <small>{{ row.category }} · {{ fieldPath(row) }}</small>
          </button>
          <p v-if="!mappedRows.length" class="word-preview-empty">This template has no field mappings.</p>
        </div>
      </aside>
    </div>
    <div slot="footer" class="word-preview-footer">
      <span>{{ renderMode === 'template' ? 'Click a highlighted placeholder or a mapped field to locate it.' : 'Showing the saved sample report.' }}</span>
      <div>
        <el-button size="small" @click="openDocx">Open DOCX</el-button>
        <el-button size="small" @click="downloadDocx">Download DOCX</el-button>
        <el-button type="primary" size="small" @click="closePreview">Close</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import {renderAsync} from 'docx-preview'
import {FEATURE_TREE} from '@/views/Common/constants'

export default {
  name: 'WordTemplatePreview',
  props: {
    visible: {type: Boolean, default: false},
    templateName: {type: String, default: ''},
    filePath: {type: String, default: ''},
    mappings: {type: Array, default: () => []}
  },
  data() {
    return {
      renderMode: 'template',
      highlightAll: true,
      sampleAvailable: false,
      loading: false,
      errorMessage: '',
      activeCode: '',
      renderedCodes: [],
      currentPage: 1,
      pageCount: 0,
      previewFileName: ''
    }
  },
  computed: {
    mappedRows() {
      return this.mappings.filter(row => row && row.code).map(row => ({...row, code: String(row.code).trim()})).filter(row => row.code)
    },
    fileName() {
      return this.previewFileName || String(this.filePath || '').split(/[\\/]/).pop()
    }
  },
  created() {
    this.previewMarks = new Map()
    this.previewRequest = 0
  },
  methods: {
    async openPreview() {
      this.renderMode = 'template'
      this.highlightAll = true
      this.activeCode = ''
      this.sampleAvailable = false
      this.previewFileName = ''
      let sample = null
      try {
        sample = await window.electronAPI.getWordSampleReport(this.templateName)
      } catch (error) {
        sample = null
      }
      if (!this.visible) return
      this.sampleAvailable = !!(sample && sample.success && sample.filePath)
      await this.renderDocument()
    },
    closePreview() {
      this.$emit('update:visible', false)
    },
    clearPreview() {
      this.previewRequest += 1
      this.previewMarks.clear()
      this.renderedCodes = []
      this.currentPage = 1
      this.pageCount = 0
      if (this.$refs.docRoot) this.$refs.docRoot.replaceChildren()
      if (this.$refs.styles) this.$refs.styles.replaceChildren()
    },
    async switchMode(mode) {
      if (this.renderMode === mode || this.loading || (mode === 'sample' && !this.sampleAvailable)) return
      this.renderMode = mode
      this.activeCode = ''
      await this.renderDocument()
    },
    async renderDocument() {
      const request = ++this.previewRequest
      this.loading = true
      this.errorMessage = ''
      this.renderedCodes = []
      this.currentPage = 1
      this.pageCount = 0
      this.previewMarks.clear()
      try {
        const result = await window.electronAPI.readWordPreview({templateName: this.templateName, sample: this.renderMode === 'sample'})
        if (!result || !result.success) throw new Error((result && result.message) || 'Cannot read Word document')
        if (!this.visible || request !== this.previewRequest) return
        await this.$nextTick()
        const binary = atob(result.base64)
        const bytes = new Uint8Array(binary.length)
        for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
        await renderAsync(bytes, this.$refs.docRoot, this.$refs.styles, {breakPages: true, ignoreLastRenderedPageBreak: false})
        if (!this.visible || request !== this.previewRequest) return
        this.previewFileName = result.fileName
        if (this.renderMode === 'template') this.markPlaceholders()
        this.pageCount = this.$refs.docRoot.querySelectorAll('section.docx').length
        this.$refs.stage.scrollTop = 0
      } catch (error) {
        if (request === this.previewRequest) this.errorMessage = error.message || 'Cannot render Word document'
      } finally {
        if (request === this.previewRequest) this.loading = false
      }
    },
    markPlaceholders() {
      const codes = new Set(this.mappedRows.map(row => row.code))
      const found = new Set()
      for (const paragraph of this.$refs.docRoot.querySelectorAll('p')) {
        const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT)
        const nodes = []
        let text = ''
        while (walker.nextNode()) {
          const node = walker.currentNode
          nodes.push({node, start: text.length, end: text.length + node.textContent.length})
          text += node.textContent
        }
        const matches = [...text.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].filter(match => codes.has(match[1]))
        for (const match of matches.reverse()) {
          const start = nodes.find(part => part.end > match.index)
          const endIndex = match.index + match[0].length
          const end = nodes.find(part => part.end >= endIndex && part.start < endIndex)
          if (!start || !end) continue
          const range = document.createRange()
          range.setStart(start.node, match.index - start.start)
          range.setEnd(end.node, endIndex - end.start)
          const mark = document.createElement('span')
          mark.className = 'word-preview-token'
          mark.dataset.wordCode = match[1]
          mark.tabIndex = 0
          mark.setAttribute('role', 'button')
          mark.setAttribute('aria-label', `Locate mapping ${match[1]}`)
          mark.appendChild(range.extractContents())
          range.insertNode(mark)
          found.add(match[1])
          if (!this.previewMarks.has(match[1])) this.previewMarks.set(match[1], [])
          this.previewMarks.get(match[1]).unshift(mark)
        }
      }
      this.renderedCodes = [...found]
    },
    async focusCode(code) {
      if (this.renderMode === 'sample') {
        await this.switchMode('template')
      }
      this.activeCode = code
      this.updateActiveMarks()
      const mark = (this.previewMarks.get(code) || [])[0]
      if (mark) {
        const pages = [...this.$refs.docRoot.querySelectorAll('section.docx')]
        const page = pages.findIndex(item => item.contains(mark)) + 1
        if (page) this.currentPage = page
        this.scrollToDocumentElement(mark, true)
      }
      const mapping = this.$refs[`mapping-${code}`]
      if (mapping && mapping[0]) mapping[0].scrollIntoView({block: 'nearest'})
    },
    scrollToDocumentElement(element, center = false) {
      const stage = this.$refs.stage
      if (!stage || !element) return
      const top = element.getBoundingClientRect().top - stage.getBoundingClientRect().top + stage.scrollTop
      stage.scrollTop = Math.max(0, top - (center ? stage.clientHeight / 2 : 20))
    },
    goToPage(page) {
      const pages = this.$refs.docRoot.querySelectorAll('section.docx')
      if (page < 1 || page > pages.length) return
      this.currentPage = page
      this.scrollToDocumentElement(pages[page - 1])
    },
    updateCurrentPage() {
      const stage = this.$refs.stage
      const pages = this.$refs.docRoot && this.$refs.docRoot.querySelectorAll('section.docx')
      if (!stage || !pages || !pages.length) return
      const anchor = stage.getBoundingClientRect().top + stage.clientHeight / 3
      let page = 1
      pages.forEach((item, index) => {
        if (item.getBoundingClientRect().top <= anchor) page = index + 1
      })
      this.currentPage = page
    },
    updateActiveMarks() {
      for (const marks of this.previewMarks.values()) {
        for (const mark of marks) mark.classList.toggle('active', mark.dataset.wordCode === this.activeCode)
      }
    },
    onDocumentClick(event) {
      const mark = event.target.closest('[data-word-code]')
      if (mark) this.focusCode(mark.dataset.wordCode)
    },
    onDocumentKeydown(event) {
      if (event.key !== 'Enter' && event.key !== ' ') return
      const mark = event.target.closest('[data-word-code]')
      if (!mark) return
      event.preventDefault()
      this.focusCode(mark.dataset.wordCode)
    },
    onDocumentHover(event) {
      const mark = event.target.closest('[data-word-code]')
      if (mark && this.activeCode !== mark.dataset.wordCode) {
        this.activeCode = mark.dataset.wordCode
        this.updateActiveMarks()
      }
    },
    fieldPath(row) {
      let node = FEATURE_TREE[row.category]
      const labels = []
      for (const level of row.featureLevels || []) {
        node = node && node.children && node.children[level.key]
        if (!node) break
        labels.push(node.label || level.key)
      }
      return labels.join(' · ') || 'No target field'
    },
    fieldLabel(row) {
      let node = FEATURE_TREE[row.category]
      for (const level of row.featureLevels || []) node = node && node.children && node.children[level.key]
      return (node && node.label) || row.code
    },
    async openDocx() {
      const error = await window.electronAPI.openFileTemplate(this.filePath)
      if (error) this.$message.error(error)
    },
    async downloadDocx() {
      const result = await window.electronAPI.downloadWordTemplate(this.filePath)
      if (!result || (!result.success && !result.canceled)) this.$message.error((result && result.message) || 'Cannot download template')
    }
  }
}
</script>

<style>
.word-preview-dialog {display:flex; flex-direction:column; height:96vh; max-height:96vh; margin-bottom:0;}
.word-preview-dialog .el-dialog__header {flex:0 0 auto; padding:0; border-bottom:1px solid #dce3ec;}
.word-preview-dialog .el-dialog__body {flex:1; min-height:0; padding:0; overflow:hidden;}
.word-preview-dialog .el-dialog__footer {flex:0 0 auto; padding:0; border-top:1px solid #dce3ec;}
.word-preview-header {display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:66px; padding:10px 16px;}
.word-preview-heading {min-width:0; color:#1a2b43;}
.word-preview-heading strong {display:block; font-size:16px; line-height:1.3; overflow-wrap:anywhere;}
.word-preview-heading small {display:block; margin-top:3px; color:#68778b; overflow-wrap:anywhere;}
.word-preview-header-actions {display:flex; align-items:center; gap:14px; flex-wrap:wrap;}
.word-preview-header-actions label {display:flex; align-items:center; gap:6px; font-size:12px; white-space:nowrap;}
.word-preview-header-actions input {accent-color:#0b3695;}
.word-preview-modes {display:flex; border:1px solid #dce3ec; border-radius:4px; overflow:hidden;}
.word-preview-modes button {border:0; background:#f7f9fc; padding:8px 12px; color:#4c5e77; cursor:pointer; font-size:12px;}
.word-preview-modes button + button {border-left:1px solid #dce3ec;}
.word-preview-modes button.active {background:#fff; color:#0a318c; font-weight:700;}
.word-preview-modes button:disabled {opacity:.5; cursor:not-allowed;}
.word-preview-close {border:0; background:transparent; color:#264267; cursor:pointer; font-size:18px;}
.word-preview-layout {display:grid; grid-template-columns:minmax(0, 1fr) 330px; grid-template-rows:minmax(0, 1fr); height:100%; min-height:0;}
.word-preview-stage-shell {position:relative; min-width:0; min-height:0; overflow:hidden;}
.word-preview-stage {position:relative; box-sizing:border-box; width:100%; height:100%; min-height:0; overflow:auto; overscroll-behavior:contain; background:#525860; padding:30px 26px;}
.word-preview-page-nav {position:absolute; z-index:4; top:12px; right:24px; display:flex; align-items:center; gap:8px; padding:5px; border:1px solid #cdd6e2; border-radius:4px; background:#fff; box-shadow:0 2px 8px #1b243533; color:#223852; font-size:12px;}
.word-preview-page-nav span {min-width:72px; text-align:center; font-weight:600;}
.word-preview-page-nav button {width:24px; height:24px; border:0; border-radius:3px; background:transparent; color:#17386f; cursor:pointer;}
.word-preview-page-nav button:hover:not(:disabled) {background:#eaf1ff;}
.word-preview-page-nav button:disabled {color:#a6b1c0; cursor:default;}
.word-preview-docx {width:max-content; min-width:100%; margin:0 auto;}
.word-preview-docx .docx-wrapper {background:transparent; padding:0;}
.word-preview-docx .docx {box-shadow:0 4px 20px #1b243550; margin:0 auto 24px;}
.word-preview-status {position:absolute; z-index:2; inset:0; display:flex; align-items:center; justify-content:center; gap:8px; background:#525860; color:#fff;}
.word-preview-error {color:#ffe3e3;}
.word-preview-mappings {display:flex; flex-direction:column; min-width:0; min-height:0; overflow:hidden; border-left:1px solid #dce3ec; background:#fff;}
.word-preview-mappings-head {padding:18px 16px 12px; border-bottom:1px solid #edf0f4;}
.word-preview-mappings-head strong {display:block; color:#1a2b43;}
.word-preview-mappings-head small {display:block; margin-top:4px; color:#728094;}
.word-preview-mapping-list {flex:1; min-height:0; overflow:auto; overscroll-behavior:contain; padding:10px;}
.word-preview-mapping {display:block; width:100%; text-align:left; border:1px solid #e4e9f0; border-radius:4px; padding:10px 12px; margin-bottom:6px; background:#fff; cursor:pointer;}
.word-preview-mapping:hover {background:#f5f8ff; border-color:#a9bfe9;}
.word-preview-mapping.active {background:#eaf1ff; border-color:#88a9e8;}
.word-preview-mapping.missing {opacity:.62;}
.word-preview-mapping strong {display:block; color:#17386f; font-size:12px; line-height:1.4;}
.word-preview-mapping small {display:block; margin-top:4px; color:#68778b; line-height:1.3;}
.word-preview-empty {padding:20px 10px; color:#728094; text-align:center;}
.word-preview-token {border-radius:2px; cursor:pointer; transition:background .12s;}
.word-preview-docx.show-highlights .word-preview-token {background:#dce9ff; outline:1px solid #7da3e7;}
.word-preview-token:hover, .word-preview-token.active {background:#ffdf8a !important; outline:2px solid #d89409 !important;}
.word-preview-footer {display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 16px; color:#768397; font-size:12px;}
.word-preview-footer > div {display:flex; gap:8px;}
.word-preview-footer .el-button + .el-button {margin-left:0;}
@media (max-width:900px) {
  .word-preview-header {align-items:flex-start; flex-direction:column;}
  .word-preview-layout {grid-template-columns:minmax(0, 1fr) 220px;}
  .word-preview-stage {padding:12px;}
}
@media (max-width:650px) {
  .word-preview-layout {grid-template-columns:1fr; grid-template-rows:minmax(0, 1fr) 170px;}
  .word-preview-mappings {border-left:0; border-top:1px solid #dce3ec;}
  .word-preview-footer {flex-wrap:wrap;}
}
</style>

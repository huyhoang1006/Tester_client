<template>
  <div class="word-filled-preview">
    <header class="word-filled-header">
      <div>
        <h2>Filled report preview</h2>
        <span>{{ templateName }}</span>
      </div>
      <div class="word-filled-counts">
        <span><b>{{ filledCount }}</b> mapped</span>
        <span><b>{{ emptyCount }}</b> empty</span>
      </div>
    </header>
    <div class="word-filled-layout">
      <section class="word-filled-stage-shell" aria-label="Filled Word document">
        <div v-if="!loading && !errorMessage && pageCount" class="word-filled-page-nav">
          <button type="button" title="Previous page" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)"><i class="el-icon-arrow-left"></i></button>
          <span>Page {{ currentPage }} / {{ pageCount }}</span>
          <button type="button" title="Next page" :disabled="currentPage >= pageCount" @click="goToPage(currentPage + 1)"><i class="el-icon-arrow-right"></i></button>
        </div>
        <div ref="stage" class="word-filled-stage" @scroll="updateCurrentPage">
          <div v-if="loading" class="word-filled-status"><i class="el-icon-loading"></i> Rendering filled report...</div>
          <div v-else-if="errorMessage" class="word-filled-status word-filled-error">{{ errorMessage }}</div>
          <div ref="docRoot" class="word-filled-docx"></div>
          <div ref="styles"></div>
        </div>
      </section>
      <aside class="word-filled-fields">
        <header><strong>Mapped fields ({{ rows.length }})</strong><small>Values in the selected sources</small></header>
        <div class="word-filled-field-list">
          <div v-for="(row, index) in rows" :key="`${row.code}-${index}`" class="word-filled-field" :class="{empty: !row.value}">
            <strong>{{ '{' + row.code + '}' }} - {{ row.label }}</strong>
            <span>{{ row.value || 'No value' }}</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import {renderAsync} from 'docx-preview'

export default {
  name: 'WordFilledPreview',
  props: {
    templateName: {type: String, default: ''},
    templatePath: {type: String, required: true},
    variables: {type: Array, default: () => []},
    codeMap: {type: Object, default: () => ({})},
    rows: {type: Array, default: () => []}
  },
  data() {
    return {loading: true, errorMessage: '', currentPage: 1, pageCount: 0}
  },
  computed: {
    filledCount() { return this.rows.filter(row => row.value).length },
    emptyCount() { return this.rows.length - this.filledCount }
  },
  created() {
    this.renderRequest = 0
    this.previewFieldByMarker = new Map()
  },
  mounted() { this.renderDocument() },
  beforeDestroy() { this.renderRequest += 1 },
  methods: {
    markedCodeMap() {
      const codeMap = {...this.codeMap}
      this.previewFieldByMarker.clear()
      const markedCodes = new Set()
      this.rows.filter(row => row.code && row.value).forEach((row, index) => {
        if (index >= 0x18ff || markedCodes.has(row.code)) return
        markedCodes.add(row.code)
        const marker = String.fromCharCode(0xe000 + index)
        this.previewFieldByMarker.set(marker, row)
        const mark = value => value == null || String(value).trim() === ''
          ? value : `${marker}${value}\uf8ff`
        const value = codeMap[row.code]
        codeMap[row.code] = Array.isArray(value) ? value.map(mark) : mark(value)
      })
      return codeMap
    },
    markFilledValues() {
      for (const paragraph of this.$refs.docRoot.querySelectorAll('p')) {
        const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT)
        const parts = []
        let text = ''
        while (walker.nextNode()) {
          const node = walker.currentNode
          parts.push({node, start: text.length, end: text.length + node.textContent.length})
          text += node.textContent
        }
        const matches = [...text.matchAll(/([\ue000-\uf8fe])[^\uf8ff]*\uf8ff/g)]
          .filter(match => this.previewFieldByMarker.has(match[1]))
        for (const match of matches.reverse()) {
          const start = parts.find(part => part.end > match.index)
          const endIndex = match.index + match[0].length
          const end = parts.find(part => part.end >= endIndex && part.start < endIndex)
          if (!start || !end) continue
          const range = document.createRange()
          range.setStart(start.node, match.index - start.start)
          range.setEnd(end.node, endIndex - end.start)
          const fragment = range.extractContents()
          const textWalker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT)
          const textNodes = []
          while (textWalker.nextNode()) textNodes.push(textWalker.currentNode)
          if (!textNodes.length) continue
          if (textNodes.length === 1) textNodes[0].textContent = textNodes[0].textContent.slice(1, -1)
          else {
            textNodes[0].textContent = textNodes[0].textContent.slice(1)
            const last = textNodes[textNodes.length - 1]
            last.textContent = last.textContent.slice(0, -1)
          }
          const row = this.previewFieldByMarker.get(match[1])
          const highlight = document.createElement('span')
          highlight.className = 'word-filled-value'
          highlight.title = `{${row.code}} - ${row.label}`
          highlight.setAttribute('aria-label', highlight.title)
          highlight.appendChild(fragment)
          range.insertNode(highlight)
        }
      }
    },
    async renderDocument() {
      const request = ++this.renderRequest
      this.loading = true
      this.errorMessage = ''
      try {
        const result = await window.electronAPI.exportWordWithData({
          templatePath: this.templatePath, variables: this.variables, codeMap: this.markedCodeMap(), previewOnly: true
        })
        if (!result?.success || !result.base64) throw new Error(result?.message || 'Cannot generate filled report preview')
        if (request !== this.renderRequest) return
        const binary = atob(result.base64)
        const bytes = new Uint8Array(binary.length)
        for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
        await renderAsync(bytes, this.$refs.docRoot, this.$refs.styles, {breakPages: true, ignoreLastRenderedPageBreak: false})
        if (request !== this.renderRequest) return
        this.markFilledValues()
        this.pageCount = this.$refs.docRoot.querySelectorAll('section.docx').length
        this.$refs.stage.scrollTop = 0
      } catch (error) {
        if (request === this.renderRequest) this.errorMessage = error.message || 'Cannot render filled report'
      } finally {
        if (request === this.renderRequest) this.loading = false
      }
    },
    goToPage(page) {
      const pages = this.$refs.docRoot.querySelectorAll('section.docx')
      if (page < 1 || page > pages.length) return
      const stage = this.$refs.stage
      this.currentPage = page
      stage.scrollTop += pages[page - 1].getBoundingClientRect().top - stage.getBoundingClientRect().top - 20
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
    }
  }
}
</script>

<style>
.word-filled-preview {display:flex; flex:1; flex-direction:column; min-width:0; min-height:0; background:#fff;}
.word-filled-header {display:flex; align-items:center; justify-content:space-between; gap:16px; flex:none; min-height:64px; padding:10px 18px; border-bottom:1px solid #dce3ec;}
.word-filled-header h2 {margin:0; color:#1a2b43; font-size:16px;}
.word-filled-header span {display:block; margin-top:4px; color:#6c798d; font-size:12px;}
.word-filled-counts {display:flex; gap:12px; white-space:nowrap;}
.word-filled-counts span {margin:0;}
.word-filled-counts b {color:#0a348c;}
.word-filled-layout {display:grid; flex:1; grid-template-columns:minmax(0, 1fr) 320px; min-height:0;}
.word-filled-stage-shell {position:relative; min-width:0; min-height:0; overflow:hidden;}
.word-filled-stage {position:relative; box-sizing:border-box; width:100%; height:100%; overflow:auto; overscroll-behavior:contain; padding:28px 24px; background:#525860;}
.word-filled-docx {width:max-content; min-width:100%; margin:0 auto;}
.word-filled-docx .docx-wrapper {padding:0; background:transparent;}
.word-filled-docx .docx {margin:0 auto 24px; box-shadow:0 4px 20px #1b243550;}
.word-filled-docx .word-filled-value {background:#fff0a6; box-shadow:0 0 0 1px #e9c94d; border-radius:2px; cursor:help; box-decoration-break:clone;}
.word-filled-docx .word-filled-value:hover {background:#ffe27a; box-shadow:0 0 0 1px #cf9b1c;}
.word-filled-status {position:absolute; z-index:2; inset:0; display:flex; align-items:center; justify-content:center; gap:8px; background:#525860; color:#fff;}
.word-filled-error {color:#ffe3e3;}
.word-filled-page-nav {position:absolute; z-index:4; top:12px; right:24px; display:flex; align-items:center; gap:8px; padding:5px; border:1px solid #cdd6e2; border-radius:4px; background:#fff; color:#223852; box-shadow:0 2px 8px #1b243533; font-size:12px;}
.word-filled-page-nav span {min-width:72px; text-align:center; font-weight:600;}
.word-filled-page-nav button {width:24px; height:24px; border:0; border-radius:3px; background:transparent; color:#17386f; cursor:pointer;}
.word-filled-page-nav button:hover:not(:disabled) {background:#eaf1ff;}
.word-filled-page-nav button:disabled {color:#a6b1c0; cursor:default;}
.word-filled-fields {display:flex; flex-direction:column; min-width:0; min-height:0; overflow:hidden; border-left:1px solid #dce3ec;}
.word-filled-fields header {flex:none; padding:17px 16px 12px; border-bottom:1px solid #edf0f4;}
.word-filled-fields header strong, .word-filled-fields header small {display:block;}
.word-filled-fields header strong {color:#1a2b43;}
.word-filled-fields header small {margin-top:4px; color:#728094;}
.word-filled-field-list {flex:1; min-height:0; overflow:auto; overscroll-behavior:contain; padding:10px;}
.word-filled-field {margin-bottom:6px; padding:10px 12px; border:1px solid #e4e9f0; border-radius:4px;}
.word-filled-field strong, .word-filled-field span {display:block; overflow-wrap:anywhere; line-height:1.4;}
.word-filled-field strong {color:#17386f; font-size:12px;}
.word-filled-field span {margin-top:4px; color:#42536b; font-size:12px;}
.word-filled-field.empty {opacity:.6;}
@media (max-width:900px) {.word-filled-layout {grid-template-columns:minmax(0, 1fr) 230px;}}
@media (max-width:650px) {.word-filled-header {align-items:flex-start; flex-direction:column;} .word-filled-layout {grid-template-columns:1fr; grid-template-rows:minmax(0, 1fr) 165px;} .word-filled-fields {border-left:0; border-top:1px solid #dce3ec;} .word-filled-stage {padding:12px;}}
</style>

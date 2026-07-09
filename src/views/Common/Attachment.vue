<template>
    <section class="att-card">
        <div class="att-header">
            <div class="att-title">
                <i class="fa-solid fa-paperclip"></i>
                <span>Attachments</span>
                <span class="att-count">{{ rowData.length }}</span>
            </div>
            <div class="att-actions">
                <button type="button" class="att-btn" :class="{ disabled: rowCurrent === '' }" title="Download" @click="downloadItem()">
                    <i class="fa fa-download"></i>
                </button>
                <button type="button" class="att-btn" :class="{ disabled: rowCurrent === '' }" title="Open" @click="openFile()">
                    <i class="fa-solid fa-folder-open"></i>
                </button>
                <button type="button" class="att-btn primary" title="Upload file" @click="upload()">
                    <i class="fa-solid fa-plus"></i>
                </button>
                <button type="button" class="att-btn danger" :class="{ disabled: rowCurrent === '' }" title="Delete" @click="deleteItem(rowCurrent)">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="att-body">
            <div class="att-list" :style="{ height: height || '120px' }">
                <div v-if="rowData.length === 0" class="att-empty">
                    <i class="fa-regular fa-folder-open"></i>
                    <span>No attachment selected</span>
                </div>
                <div
                    v-for="(item, index) in rowData"
                    :key="index"
                    class="att-row"
                    :class="{ active: rowCurrent === index }"
                    @click="onTdClick(index)"
                    @dblclick="onTdDblClick">
                    <i :class="fileIcon(item.path).cls" class="att-icon" :style="{ color: fileIcon(item.path).color }"></i>
                    <span class="att-name" :title="fileName(item.path)">{{ fileName(item.path) }}</span>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'attachments',
    props: {
        title: {
            type: String,
            default: 'Attachments'
        },
        height: {
            type: String,
            default: '120px'
        },
        attachment_: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            attachment : "",
            rowCurrent : "",
            rowData : [],
            clickTimer: null,
            clickDelay: 250, // ms
        }
    },
    watch : {
        rowData : {
            deep : true,
            immediate : true,
            handler() {
                this.$emit('data-attachment', this.rowData)
            }
        },
        attachment_ : {
            deep : true,
            immediate : true,
            handler(value) {
                this.rowData = value || []
                if (this.rowCurrent !== '' && !this.rowData[this.rowCurrent]) {
                    this.rowCurrent = ''
                }
            }
        }
    },
    computed: {
        ...mapState(['selectedLocation', 'selectedAsset'])
    },
    methods: {
        deleteItem(row) {
            if(row !== '') {
                this.$confirm('This will delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                })
                .then(async () => {
                    try {
                        if(row !== '') {
                            this.rowData.splice(row, 1)
                            this.$message({
                                type: 'success',
                                message: 'Delete attachment completed'
                            })
                        }
                        this.rowCurrent = ""
                    } catch (error) {
                        this.$message.error("Some error occurred when deleting attachment")
                    }
                }).catch(() => {
                    this.$message.error("Cancel delete attachment")
                })
            }
        },
        // Sửa logic click/dblclick
        onTdClick(index) {
            if (this.clickTimer) {
                clearTimeout(this.clickTimer)
                this.clickTimer = null
            }
            this.clickTimer = setTimeout(() => {
                this.selectRow(index)
                this.clickTimer = null
            }, this.clickDelay)
        },
        onTdDblClick() {
            if (this.clickTimer) {
                clearTimeout(this.clickTimer)
                this.clickTimer = null
            }
            this.openFile()
        },
        selectRow(x) {
            this.rowCurrent = this.rowCurrent === x ? '' : x
        },
        async upload() {
            try {
                const rs = await window.electronAPI.getAttachmentpath()
                if (rs.success) {
                    if(this.rowData.map(e => e.path.split(/[/\\]/).pop()).includes(rs.path.split(/[/\\]/).pop())) {
                        this.$message.error("Name file exists, please choose another file")
                        return
                    }
                    var row = {
                        path : rs.path
                    }
                    this.rowData.push(row)
                    this.$message({
                        type: 'success',
                        message: 'Attachment completed'
                    })
                } else {
                    this.$message.error("Attachment cannot completed")
                }
            } catch (error) {
                console.log(error)
                this.$message.error("Some error occurred when uploading attachment")
            }
        },
        async openFile() {
            if(this.rowCurrent !== '') {
                let fileName = this.rowData[this.rowCurrent].path
                let extention_arr = this.rowData[this.rowCurrent].path.split(".")
                let extention = extention_arr[extention_arr.length -1].toLowerCase()
                if(await this.isIMage(fileName) === true) {
                    await this.launchFile()
                } else if(await this.isVideo(fileName) === true) {
                    await this.launchFile()
                } else if(["doc", "docx"].includes(extention) === true) {
                    await this.launchFile()
                } else if(extention === 'xlsx' || extention === 'xls' || extention === 'csv') {
                    await this.launchFile()
                } else if(extention === 'pptx') {
                    await this.launchFile()
                } else if(extention === 'pdf') {
                    await this.launchFile()
                }
                else {
                    this.$message({
                        type: 'warning',
                        message: "File extension don't be supported"
                    })
                }
            }
            else {
                this.$message({
                    type: 'error',
                    message: 'No file selected'
                })
            }
        },
        async launchFile() {
            await window.electronAPI.openFile(this.rowData[this.rowCurrent].path)
        },
        async getFileExtension(fileName){
            var  fileExtension;
            fileExtension = fileName.replace(/^.*\./, '');
            return fileExtension;
        },
        // Icon theo phần mở rộng file (FontAwesome) + màu
        fileIcon(p) {
            const parts = String(p || '').split('.')
            const ext = parts.length > 1 ? parts.pop().toLowerCase() : ''
            const byExt = {
                pdf:  { cls: 'fa-solid fa-file-pdf',        color: '#e11d48' },
                doc:  { cls: 'fa-solid fa-file-word',       color: '#2563eb' },
                docx: { cls: 'fa-solid fa-file-word',       color: '#2563eb' },
                xls:  { cls: 'fa-solid fa-file-excel',      color: '#16a34a' },
                xlsx: { cls: 'fa-solid fa-file-excel',      color: '#16a34a' },
                csv:  { cls: 'fa-solid fa-file-csv',        color: '#16a34a' },
                ppt:  { cls: 'fa-solid fa-file-powerpoint', color: '#ea580c' },
                pptx: { cls: 'fa-solid fa-file-powerpoint', color: '#ea580c' },
                png:  { cls: 'fa-solid fa-file-image',      color: '#7c3aed' },
                jpg:  { cls: 'fa-solid fa-file-image',      color: '#7c3aed' },
                jpeg: { cls: 'fa-solid fa-file-image',      color: '#7c3aed' },
                gif:  { cls: 'fa-solid fa-file-image',      color: '#7c3aed' },
                bmp:  { cls: 'fa-solid fa-file-image',      color: '#7c3aed' },
                svg:  { cls: 'fa-solid fa-file-image',      color: '#7c3aed' },
                webp: { cls: 'fa-solid fa-file-image',      color: '#7c3aed' },
                zip:  { cls: 'fa-solid fa-file-zipper',     color: '#a16207' },
                rar:  { cls: 'fa-solid fa-file-zipper',     color: '#a16207' },
                '7z': { cls: 'fa-solid fa-file-zipper',     color: '#a16207' },
                txt:  { cls: 'fa-solid fa-file-lines',      color: '#4b5563' },
                mp4:  { cls: 'fa-solid fa-file-video',      color: '#db2777' },
                avi:  { cls: 'fa-solid fa-file-video',      color: '#db2777' },
                mkv:  { cls: 'fa-solid fa-file-video',      color: '#db2777' },
                mov:  { cls: 'fa-solid fa-file-video',      color: '#db2777' },
                wmv:  { cls: 'fa-solid fa-file-video',      color: '#db2777' },
                mp3:  { cls: 'fa-solid fa-file-audio',      color: '#0891b2' },
                wav:  { cls: 'fa-solid fa-file-audio',      color: '#0891b2' },
                flac: { cls: 'fa-solid fa-file-audio',      color: '#0891b2' }
            }
            return byExt[ext] || { cls: 'fa-solid fa-file', color: '#6b7280' }
        },
        fileName(path) {
            return String(path || '').split(/[/\\]/).pop()
        },
        async isIMage(fileName){
            var fileExt = await this.getFileExtension(fileName);
            var imagesExtension = ["png", "jpg", "jpeg"];
            return imagesExtension.includes(fileExt.toLowerCase())
        },
        async isVideo(filename) {
            var ext = await this.getFileExtension(filename);
            switch (ext.toLowerCase()) {
                case 'm4v':
                case 'avi':
                case 'mpg':
                case 'mp4':
                // etc
                return true;
            }
            return false;
        },
        handleClose() {
            this.dialogVisible = false
        },
        async downloadItem() {
            if(this.rowCurrent === '' || !this.rowData[this.rowCurrent]) {
                this.$message({
                        type: 'error',
                        message: 'No file selected'
                    })
                return
            }
            const rs = await window.electronAPI.downloadFile(this.rowData[this.rowCurrent].path)
            if(rs.success) {
                this.$message({
                        type: 'success',
                        message: "Download file completed"
                    })
            } else {
                this.$message({
                        type: 'error',
                        message: rs.message
                    })
            }
        }
        
    }
}
</script>
<style lang="scss" scoped>
.att-card {
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    background: #fff;
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
}
.att-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 10px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 6px 6px 0 0;
}
.att-title {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: #606266;
    font-size: 12px;
    font-weight: 600;
}
.att-title i {
    color: #909399;
}
.att-count {
    min-width: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: #e4e7ed;
    color: #606266;
    font-size: 11px;
    text-align: center;
    line-height: 18px;
}
.att-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}
.att-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 4px;
    color: #909399;
    line-height: 1;
    font-size: 12px;
    transition: background 0.15s, color 0.15s;
}
.att-btn:hover {
    color: #409eff;
    background: #ecf5ff;
}
.att-btn.danger:hover {
    color: #f56c6c;
    background: #fef0f0;
}
.att-btn.disabled {
    color: #c0c4cc;
}
.att-body {
    padding: 8px;
    flex: 1;
    min-height: 0;
}
.att-list {
    overflow-y: auto;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background: #fff;
}
.att-empty {
    height: 100%;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #c0c4cc;
    font-size: 12px;
}
.att-empty i {
    font-size: 20px;
}
.att-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-bottom: 1px solid #f5f7fa;
    color: #303133;
    cursor: pointer;
    font-size: 12px;
    min-width: 0;
}
.att-row:last-child {
    border-bottom: none;
}
.att-row:hover {
    background: #fafbfc;
}
.att-row.active {
    background: #ecf5ff;
    color: #012596;
}
.att-icon {
    width: 16px;
    text-align: center;
    flex-shrink: 0;
}
.att-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (max-width: 767px) {
    .att-card {
        height: auto;
    }

    .att-header {
        align-items: flex-start;
        flex-wrap: wrap;
        padding: 8px 10px;
    }

    .att-title {
        flex: 1 1 140px;
    }

    .att-actions {
        justify-content: flex-end;
        flex-wrap: wrap;
    }

    .att-body {
        padding: 8px;
    }

    .att-list {
        height: 170px !important;
    }
}
</style>

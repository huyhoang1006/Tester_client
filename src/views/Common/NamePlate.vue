<template>
    <section class="np-card">
        <div class="np-header">
            <div class="np-title">
                <i class="fa-solid fa-image"></i>
                <span>{{ title || 'Name plate' }}</span>
            </div>
            <div class="np-actions">
                <button type="button" class="np-btn" :class="{ disabled: !hasImage }" title="Download" @click="downloadItem()">
                    <i class="fa fa-download"></i>
                </button>
                <button type="button" class="np-btn" :class="{ disabled: !hasImage }" title="Open" @click="openFile()">
                    <i class="fa-solid fa-folder-open"></i>
                </button>
                <button type="button" class="np-btn primary" title="Upload image" @click="upload()">
                    <i class="fa-solid fa-plus"></i>
                </button>
                <a ref="download" style="display: none"></a>
                <button type="button" class="np-btn danger" :class="{ disabled: !hasImage }" title="Delete" @click="deleteItem()">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="np-body">
            <div class="np-preview" :style="{ height: height }" @dblclick="openFile()">
                <img v-if="imageUrl" :src="imageUrl" :alt="imageName">
                <div v-else class="np-empty">
                    <i class="fa-regular fa-image"></i>
                    <span>No image selected</span>
                </div>
            </div>
            <div v-if="imageName" class="np-file" :title="imageName">{{ imageName }}</div>
        </div>
    </section>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'namePlate',
    props: {
        title: {
            type: String,
            default: 'Name plate'
        },
        height: {
            type: String,
            default: '120px'
        },
        attachment_: {
            type: [Object, Array],
            default: null
        },
        fileUrl: {
            type: String,
            default: '-1'
        },
        deleteList: {
            type: [Object, Array],
            default: null
        },
        dataParent: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            rowData: null,
            imageUrl: null,
            fileURL: '-1'
        }
    },
    watch: {
        attachment_: {
            deep: true,
            immediate: true,
            handler(value) {
                this.setAttachment(value)
            }
        },
        fileUrl: {
            immediate: true,
            handler(value) {
                this.fileURL = value || '-1'
                this.imageUrl = this.fileURL !== '-1' ? this.toDisplayUrl(this.fileURL) : null
            }
        }
    },
    computed: {
        ...mapState(['selectedLocation', 'selectedAsset']),
        imageName() {
            return this.getFileName(this.rowData)
        },
        hasImage() {
            return Boolean(this.rowData && this.rowData.path)
        }
    },
    methods: {
        setAttachment(value) {
            const item = Array.isArray(value) ? value[0] : value
            if (item && item.path) {
                this.rowData = { ...item, role: item.role || 'nameplate' }
                this.fileURL = item.path
                this.imageUrl = this.toDisplayUrl(item.path)
            } else {
                this.rowData = null
                this.fileURL = '-1'
                this.imageUrl = null
            }
        },
        emitAttachment() {
            this.$emit('data-attachment', this.rowData, this.fileURL)
        },
        reload() {
            this.rowData = null
            this.fileURL = '-1'
            this.imageUrl = null
            this.emitAttachment()
        },
        async deleteItem() {
            if (!(this.rowData && this.rowData.path)) {
                return
            }
            await this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            })
                .then(() => {
                    this.rowData = null
                    this.fileURL = '-1'
                    this.imageUrl = null
                    this.emitAttachment()
                })
                .catch(() => {})
        },
        async upload() {
            const rs = await window.electronAPI.getAttachmentpath('image')
            if (!rs.success || !rs.path) {
                return
            }
            if (!this.isImage(rs.path)) {
                this.$message({
                    type: 'error',
                    message: "File extension don't be supported"
                })
                return
            }
            this.rowData = {
                path: rs.path,
                name: this.getFileName({ path: rs.path }),
                role: 'nameplate'
            }
            this.fileURL = rs.path
            this.imageUrl = this.toDisplayUrl(rs.path)
            this.emitAttachment()
        },
        async openFile() {
            if (this.hasImage) {
                await this.launchFile()
            } else {
                this.$message({
                    type: 'error',
                    message: 'No file to open'
                })
            }
        },
        async launchFile() {
            if (this.hasImage) {
                if (this.isExternalPreview(this.rowData.path)) {
                    window.open(this.rowData.path)
                } else {
                    await window.electronAPI.openFile(this.rowData.path)
                }
            } else {
                this.$message.error('No file to open')
            }
        },
        getFileExtension(fileName) {
            return String(fileName || '').replace(/^.*\./, '')
        },
        isImage(fileName) {
            const fileExt = this.getFileExtension(fileName)
            const imagesExtension = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
            return imagesExtension.includes(fileExt.toLowerCase())
        },
        getFileName(file) {
            const path = file && (file.name || file.path)
            if (!path) {
                return ''
            }
            return String(path).split(/[\\/]/).pop()
        },
        isExternalPreview(path) {
            return /^(data:image|blob:|https?:)/i.test(String(path || ''))
        },
        toDisplayUrl(path) {
            const value = String(path || '')
            if (!value || value === '-1') {
                return null
            }
            if (this.isExternalPreview(value) || value.startsWith('file://')) {
                return value
            }
            return `file:///${value.replace(/\\/g, '/')}`
        },
        async downloadItem() {
            if (!this.hasImage) {
                this.$message({
                    type: 'error',
                    message: 'No file to download'
                })
                return
            }
            try {
                if (this.isExternalPreview(this.rowData.path)) {
                    const a = this.$refs.download
                    a.href = this.rowData.path
                    a.download = this.imageName
                    a.click()
                } else {
                    await window.electronAPI.downloadFile(this.rowData.path)
                }
                this.$message({
                    type: 'success',
                    message: 'Download file completed'
                })
            } catch (e) {
                this.$message({
                    type: 'error',
                    message: 'Download failed'
                })
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.np-card {
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    background: #fff;
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
}
.np-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 8px 10px;
    background: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 6px 6px 0 0;
}
.np-title {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: #606266;
    font-size: 12px;
    font-weight: 600;
}
.np-title i {
    color: #909399;
}
.np-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}
.np-btn {
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
.np-btn:hover {
    color: #409eff;
    background: #ecf5ff;
}
.np-btn.primary:hover {
    color: #409eff;
}
.np-btn.danger:hover {
    color: #f56c6c;
    background: #fef0f0;
}
.np-btn.disabled {
    color: #c0c4cc;
}
.np-body {
    padding: 12px;
    flex: 1;
}
.np-preview {
    width: 100%;
    min-height: 120px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    background: #fafbfc;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: pointer;
}
.np-preview img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #fff;
}
.np-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #c0c4cc;
    font-size: 12px;
}
.np-empty i {
    font-size: 22px;
}
.np-file {
    margin-top: 8px;
    color: #606266;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 767px) {
    .np-card {
        height: auto;
    }

    .np-header {
        align-items: flex-start;
        flex-wrap: wrap;
        padding: 8px 10px;
    }

    .np-title {
        flex: 1 1 140px;
    }

    .np-actions {
        justify-content: flex-end;
        flex-wrap: wrap;
    }

    .np-body {
        padding: 10px;
    }

    .np-preview {
        height: 170px !important;
    }
}
</style>

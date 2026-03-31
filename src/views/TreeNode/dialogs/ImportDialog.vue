<template>
    <el-dialog title="Import Data" :visible="visible" @update:visible="$emit('update:visible', $event)" :modal="modal"
        :show-close="showClose" :transition="transition" custom-class="app-dialog" append-to-body @close="handleCancel">
        <div class="import-wrapper">
            <div class="upload-container">
                <el-upload class="upload-area" drag action="#" ref="upload" :auto-upload="false"
                    :on-change="handleChange" :on-remove="handleRemove" :on-exceed="handleExceed" :file-list="fileList"
                    :limit="1" accept=".json, .xlsx, .xls, .doc, .docx">
                    <i class="el-icon-upload" style="color: #fff; font-size: 40px; margin-bottom: 10px;"></i>
                    <div class="el-upload__text" style="color: rgba(255,255,255,0.8);">
                        Drop file here or <em>click to upload</em>
                    </div>
                    <div class="el-upload__tip" slot="tip" style="color: rgba(255,255,255,0.5);">
                        Supported files: JSON, Excel, Word
                    </div>
                </el-upload>
            </div>
        </div>

        <span slot="footer" class="dialog-footer custom-footer">
            <el-button class="footer-btn" size="small" @click="handleCancel">Cancel</el-button>
            <el-button class="footer-btn" size="small" type="primary" @click="handleConfirm" :disabled="!selectedFile">
                Import
            </el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
    name: 'ImportDialog',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        modal: {
            type: Boolean,
            default: true
        },
        showClose: {
            type: Boolean,
            default: true
        },
        transition: {
            type: String,
            default: 'dialog-fade'
        }
    },
    data() {
        return {
            fileList: [],
            selectedFile: null
        }
    },
    watch: {
        visible(val) {
            if (val) {
                this.fileList = [];
                this.selectedFile = null;
                if (this.$refs.upload) {
                    this.$refs.upload.clearFiles();
                }
            }
        }
    },
    methods: {
        handleChange(file, fileList) {
            this.fileList = fileList;
            this.selectedFile = file.raw;
        },
        handleRemove(file, fileList) {
            this.fileList = fileList;
            this.selectedFile = null;
        },
        handleExceed(files, fileList) {
            this.$set(fileList, 0, {
                name: files[0].name,
                percentage: 0,
                uid: files[0].uid,
                raw: files[0],
                status: 'ready'
            });
            this.selectedFile = files[0];
            this.fileList = fileList;
        },
        handleCancel() {
            this.fileList = [];
            this.selectedFile = null;
            this.$emit('cancel');
            this.$emit('update:visible', false);
        },
        handleConfirm() {
            if (!this.selectedFile) {
                this.$message.warning('Please select a file to import.');
                return;
            }
            this.$emit('confirm', this.selectedFile);
        }
    }
}
</script>

<style lang="scss" scoped>
::v-deep(.app-dialog) {
    box-sizing: border-box;
}

::v-deep(.app-dialog.el-dialog) {
    max-width: 576px;
    width: 90%;
    max-height: 90%;
    height: auto !important;

    margin: 0 auto !important;
    margin-top: max(10px, min(15vh, calc(50vh - 200px))) !important;

    display: flex;
    border-radius: 16px;
    flex-direction: column;
    overflow: hidden;

    /* Hiệu ứng kính mờ (Glassmorphism) */
    background: rgba(255, 255, 255, 0.3) !important;
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3),
        0 10px 20px rgba(0, 0, 0, 0.15),
        inset 0 1px 1px rgba(255, 255, 255, 0.4);
    font-family: "Segoe UI", sans-serif;
}

/* Header Styles */
::v-deep(.app-dialog .el-dialog__header) {
    padding: 20px 25px;
}

::v-deep(.app-dialog .el-dialog__title) {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff !important;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}

::v-deep(.app-dialog .el-dialog__headerbtn) {
    top: 15px;
    right: 15px;
    padding: 8px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.15);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

::v-deep(.app-dialog .el-dialog__headerbtn .el-dialog__close) {
    color: rgba(255, 255, 255, 0.8) !important;
    font-size: 18px;
    font-weight: bold;
    transition: all 0.2s ease;
}

::v-deep(.app-dialog .el-dialog__headerbtn:hover) {
    background: rgba(255, 255, 255, 0.25);
}

::v-deep(.app-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
    color: #ffffff !important;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

/* Body Styles */
::v-deep(.app-dialog .el-dialog__body) {
    padding: 10px 25px;
    color: #ffffff;
    overflow-y: auto;
    flex: 1;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

::v-deep(.app-dialog .el-dialog__body::-webkit-scrollbar) {
    width: 0px;
    height: 0px;
}

/* Content Wrapper */
.import-wrapper {
    display: flex;
    flex-direction: column;
    gap: 15px;
    color: #ffffff;
}

.import-top-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 5px;
}

.info-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    font-weight: 600;
}

/* Upload Area - Style giống changelog-body */
.upload-container {
    padding: 20px;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15),
        inset 0 1px 1px rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    text-align: center;
}

/* Custom Element UI Upload */
::v-deep(.el-upload) {
    width: 100%;
    display: block;
}

::v-deep(.el-upload-dragger) {
    width: 100% !important;
    height: 180px !important;
    background: transparent !important;
    border: 2px dashed rgba(255, 255, 255, 0.4) !important;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

::v-deep(.el-upload-dragger:hover) {
    border-color: #ffffff !important;
    background: rgba(255, 255, 255, 0.1) !important;
}

::v-deep(.el-upload-dragger.is-dragover) {
    background: rgba(255, 255, 255, 0.2) !important;
    border-color: #ffffff !important;
}

::v-deep(.el-upload-list__item-name) {
    color: #ffffff !important;
}

::v-deep(.el-upload-list__item:hover) {
    background-color: rgba(255, 255, 255, 0.1) !important;
}

::v-deep(.el-upload-list__item .el-icon-close) {
    color: #ffffff !important;
}

/* Footer Styles */
::v-deep(.app-dialog .el-dialog__footer) {
    padding: 20px 25px;
    border-top: none !important;
}

::v-deep(.custom-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

::v-deep(.custom-footer .footer-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 35px;
    min-width: 100px;
    padding: 10px 18px !important;
    border: none !important;
    border-radius: 8px !important;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

/* Button Default (Cancel) */
::v-deep(.custom-footer .footer-btn.el-button--default) {
    background: rgba(255, 255, 255, 0.1) !important;
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
}

::v-deep(.custom-footer .footer-btn.el-button--default:hover) {
    background: rgba(255, 255, 255, 0.2) !important;
    border: 1px solid rgba(255, 255, 255, 0.5) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

/* Button Primary (Import) */
::v-deep(.custom-footer .footer-btn.el-button--primary) {
    background: linear-gradient(180deg, #1e5bb8 0%, #0f3d80 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 12px rgba(30, 91, 184, 0.4),
        0 2px 6px rgba(0, 0, 0, 0.2) !important;
}

::v-deep(.custom-footer .footer-btn.el-button--primary:hover) {
    background: linear-gradient(180deg, #2869cc 0%, #1e5bb8 100%) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(30, 91, 184, 0.5),
        0 4px 10px rgba(0, 0, 0, 0.25) !important;
}

/* Button Disabled */
::v-deep(.custom-footer .footer-btn.is-disabled) {
    background: rgba(255, 255, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    box-shadow: none !important;
    cursor: not-allowed;
    transform: none !important;
}
</style>
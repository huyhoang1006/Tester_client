<template>
    <el-dialog 
        title="Import Data" 
        :visible="visible"
        @update:visible="$emit('update:visible', $event)"
        :modal="modal"
        :show-close="showClose"
        :transition="transition"
        :custom-class="customClass"
        @close="handleCancel"
    >
        <div class="import-container">
            <!-- Khu vực upload file -->
            <el-upload
                class="upload-area"
                drag
                action="#"
                ref="upload"
                :auto-upload="false"
                :on-change="handleChange"
                :on-remove="handleRemove"
                :on-exceed="handleExceed"
                :file-list="fileList"
                :limit="1"
                accept=".json, .xlsx, .xls, .doc, .docx"
            >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">
                    Drop file here or <em>click to upload</em>
                </div>
                <div class="el-upload__tip" slot="tip">
                    Supported files: JSON, Excel, Word
                </div>
            </el-upload>
        </div>

        <span slot="footer" class="dialog-footer custom-footer">
            <el-button class="footer-btn" size="small" @click="handleCancel">Cancel</el-button>
            <el-button 
                class="footer-btn" 
                size="small" 
                type="primary" 
                @click="handleConfirm"
                :disabled="!selectedFile"
            >
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
        },
        customClass: {
            type: String,
            default: 'app-dialog custom-dialog'
        }
    },
    data() {
        return {
            fileList: [],
            selectedFile: null
        }
    },
    watch: {
        // Khi dialog mở ra thì reset lại form
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
        // Khi người dùng chọn file
        handleChange(file, fileList) {
            this.fileList = fileList;
            // Lưu file object (file.raw là native File object chứa path trong Electron)
            this.selectedFile = file.raw; 
        },

        // Khi người dùng xóa file
        handleRemove(file, fileList) {
            this.fileList = fileList;
            this.selectedFile = null;
        },

        // Nếu người dùng chọn file thứ 2, ghi đè file cũ
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
            // Quan trọng: Emit file ra component cha
            this.$emit('confirm', this.selectedFile);
        }
    }
}
</script>

<style lang="scss" scoped>
.import-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    flex-direction: column;
}

.upload-area {
    width: 100%;
    text-align: center;
}

/* Kế thừa style cũ của bạn */
::v-deep(.app-dialog) {
    box-sizing: border-box;
}

::v-deep(.app-dialog.el-dialog) {
    width: 400px; /* Chỉnh lại width cho gọn đẹp hơn với dialog import */
    margin-top: 15vh !important;
    border-radius: 6px;
    max-height: 90vh;
    height: auto !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

::v-deep(.app-dialog .el-dialog__body) {
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex: 1;
    padding: 10px 20px;
}

::v-deep(.app-dialog .el-dialog__body::-webkit-scrollbar) {
    width: 0px;
    height: 0px;
}

::v-deep(.app-dialog .el-dialog__footer) {
    padding: 10px 20px;
    border-top: 1px solid #ebeef5;
}

::v-deep(.custom-footer) {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

::v-deep(.custom-footer .footer-btn) {
    min-width: 80px;
}

/* Custom lại el-upload dragger cho vừa vặn */
::v-deep(.el-upload-dragger) {
    width: 100%;
    max-width: 300px;
}

@media (max-width: 767px) {
    ::v-deep(.app-dialog.el-dialog) {
        width: 90%;
    }
    ::v-deep(.custom-footer) {
        justify-content: center;
    }
}
</style>
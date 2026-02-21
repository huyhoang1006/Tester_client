<template>
    <div>
        <br/>
        <br/>
        <span style="font-weight: bold; font-size: 12px;">Attachments
            <span class="last-right-parent">
                <i @click="downloadItem()" class="fa fa-download mgr-10 pointer"></i>
                <i @click="openFile()" class="fa-solid fa-folder-open mgr-10 pointer"></i>
                <i @click="upload()" class="fa-solid fa-plus mgr-10 pointer"></i>
                <i @click="deleteItem(rowCurrent)" class="fa-solid fa-trash mgr-10 pointer"></i>
            </span>
        </span>
        <el-divider></el-divider>
        <div class="border-main color-main" :style="{height: height, overflow: 'auto', fontSize: '12px'}">
            <table class="table-attachment">
                <tr class="tr-hover" v-for="(item, index) in rowData" :key="index">
                    <td 
                        @click="onTdClick(index)" 
                        @dblclick="onTdDblClick" 
                        ref="table"
                    >
                        <i class="fa-regular fa-folder-open main-icon"></i> {{ item.path.split(/[/\\]/).pop() }} 
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'attachments',
    props: {
        title : String,
        height : String,
        attachment_ : []
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
            handler() {
                this.rowData = this.attachment_
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
            let ref = this.$refs['table'][x]
            let myDivObjBgColor = window.getComputedStyle(ref).backgroundColor;
            this.$refs['table'].forEach((element) => {
                element.style.backgroundColor = 'rgba(0, 0, 0, 0)',
                element.style.color = 'black'
            })
            if(myDivObjBgColor.toString() === 'rgba(0, 0, 0, 0)') {
                ref.style.backgroundColor = '#012596',
                ref.style.color = 'white'
                this.rowCurrent = x
            } else {
                ref.style.backgroundColor = 'rgba(0, 0, 0, 0)',
                ref.style.color = 'black'
                this.rowCurrent = ''
            }
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
        },
        async launchFile() {
            await window.electronAPI.openFile(this.rowData[this.rowCurrent].path)
        },
        async getFileExtension(fileName){
            var  fileExtension;
            fileExtension = fileName.replace(/^.*\./, '');
            return fileExtension;
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
.last-right-parent {
    position: relative;
    float: right;
}
.table-attachment {
    width: 100%;
    table-layout:fixed;
}
.border-main {
    border: 1px solid #9b9797!important;
}
.color-main {
    background-color: white;
    color: black;
    cursor: pointer;
}

.main-icon {
    font-size: v-bind(size);
    color: #ffc107;
    position: relative;
    z-index: 1;
}
</style>
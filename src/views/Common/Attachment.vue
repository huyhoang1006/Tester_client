<template>
    <div>
        <br/>
        <br/>
        <span class="bolder">Attachments
            <span class="last-right-parent">
                <i @click="downloadItem(rowCurrent)" class="fa fa-download mgr-10 pointer"></i>
                <i @click="openFile()" class="fa-solid fa-folder-open mgr-10 pointer"></i>
                <i @click="upload()" class="fa-solid fa-plus mgr-10 pointer"></i>
                <i @click="deleteItem(rowCurrent)" class="fa-solid fa-trash mgr-10 pointer"></i>
            </span>
        </span>
        <el-divider></el-divider>
        <div class="border-main color-main" :style="{height: height, overflow: 'auto'}">
            <table class="table-attachment">
                <tr class="tr-hover" v-for="(item, index) in rowData" :key="index">
                    <td @dblclick="openFile()" @click="selectRow(index)" ref="table">
                        <i class="fa-solid fa-file"></i> {{ item.path.split("/")[item.path.split("/").length - 1] }} 
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
import loader from "@/utils/preload"
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
        }
    },
    beforeMount() {
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
                this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                })
                .then(async () => {
                    if(row !== '') {
                        loader.loaderContainerStart()
                        const rs = await window.electronAPI.deleteAttachmentpath(this.rowData[row].path)
                        if (rs.success) {
                            this.$message({
                                type: 'success',
                                message: 'Delete attachment completed'
                            })
                            this.rowData.splice(row, 1)
                            loader.loaderEnd()
                        } else {
                            this.$message.error("Delete attachment cannot completed")
                        }
                        loader.loaderEnd()
                    }
                    this.rowCurrent = ""
                })
            }
        },
        selectRow(x) {
            this.$refs['table'].forEach((element) => {
                element.style.backgroundColor = 'rgba(0, 0, 0, 0)',
                element.style.color = 'black'
            })
            let ref = this.$refs['table'][x]
            let myDivObjBgColor = window.getComputedStyle(ref).backgroundColor;
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
            loader.loaderContainerStart()
            const rs = await window.electronAPI.getAttachmentpath()
            loader.loaderEnd()
            if (rs.success) {
                this.$message({
                    type: 'success',
                    message: 'Attachment completed'
                })
                var row = {
                    path : rs.path
                }
                this.rowData.push(row)
            } else {
                this.$message.error("Attachment cannot completed")
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
</style>
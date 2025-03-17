<template>
    <div>
        <br/>
        <br/>
        <span class="bolder">Name plate
            <span class="last-right-parent">
                <i @click="downloadItem()" class="fa fa-download mgr-10 pointer"></i>
                <i @click="openFile()" class="fa-solid fa-folder-open mgr-10 pointer"></i>
                <i @click="upload()" class="fa-solid fa-plus mgr-10 pointer"></i>
                <input type="file" ref="fileInput" style="display:none" @change="handleFileSelect" accept="image/*">
                <a style="display : none" id="download"></a>
                <i @click="deleteItem()" class="fa-solid fa-trash mgr-10 pointer"></i>
            </span>
        </span>
        <el-divider></el-divider>
        <div class="border-main color-main" :style="{height: height, overflow: 'auto'}">
            <img @dblclick="openFile()" v-if="imageUrl" :src="imageUrl" :alt="this.rowData.name" width="100%">
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import { mapState } from 'vuex'
export default {
    name: 'namePlate',
    props: {
        title : String,
        height : String,
        attachment_ : {},
        fileUrl : {
            type : String,
            require : true
        },
        deleteList : {},
        dataParent : Object
    },
    data() {
        return {
            attachment : "",
            rowCurrent : "",
            rowData : {
                name : ''
            },
            imageUrl : null,
            fileURL : String
        }
    },
    beforeMount() {
    },
    watch : {
        rowData : {
            deep : true,
            immediate : true,
            handler() {
                this.$emit('data-attachment', this.rowData, this.fileURL)
            }
        },
        attachment_ : {
            deep : true,
            immediate : true,
            handler() {
                this.rowData = this.attachment_
            }
        },
        fileUrl : {
            deep : true,
            immediate : true,
            handler() {
                this.fileURL = this.fileUrl
                if(this.fileURL != '-1') {
                    this.imageUrl = this.fileURL
                } else {
                    this.imageUrl = null
                }
            }
        }
    },
    computed: {
        ...mapState(['selectedLocation', 'selectedAsset'])
    },
    methods: {
        async reload() {
            this.rowData = {
                name : ""
            }
            this.fileURL = '-1'
            this.imageUrl = null
        },
        async deleteItem() {
            if(this.rowData.name !== undefined) {
                await this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                })
                .then(async () => {
                    if(this.rowData.upload != 'new') {
                        this.deleteList = JSON.parse(JSON.stringify(this.rowData))
                    }
                    this.rowData = {
                        name : ""
                    }
                    this.fileURL = '-1'
                    this.imageUrl = null
                })
            }
        },
        async upload() {
            this.$refs.fileInput.click();
        },
        async openFile() {
            if(this.rowData.name !== undefined && this.rowData.name !== '') {
                if(await this.isIMage((this.rowData.name)) === true) {
                    await this.launchFile()
                } else {
                    this.$message({
                        type: 'error',
                        message: "File extension don't be supported"
                    })
                }
            } else {
                this.$message({
                    type: 'error',
                    message: "No file to open"
                })
            }
        },
        async launchFile() {
            if(this.fileURL != -1) {
                if(typeof(this.fileUrl) == 'string') {
                    if(!this.fileUrl.startsWith("data:image")) {
                        window.open(this.fileURL)
                    } else {
                        const byteString = atob(this.fileUrl.split(',')[1]);
                        const mimeString = this.fileUrl.split(',')[0].split(':')[1].split(';')[0];

                        const byteNumbers = new Array(byteString.length);
                        for (let i = 0; i < byteString.length; i++) {
                            byteNumbers[i] = byteString.charCodeAt(i);
                        }

                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: mimeString });
                        this.fileUrl = URL.createObjectURL(blob);
                        window.open(this.fileUrl);
                    }
                } else {
                    window.open(this.fileURL)
                }
            } else {
                this.$message.error("No file to open")
            }
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
            if(this.rowData.name == undefined && this.rowData.name == '') {
                try {
                    const a = document.getElementById('download');
                    a.href = this.fileURL;
                    a.download = this.fileURL;
                    a.click();
                    this.$message({
                        type: 'success',
                        message: "Download file completed"
                    })
                } catch (e) {
                    this.$message({
                        type: 'error',
                        message: "Download failed"
                    })
                }
            } else {
                this.$message({
                    type: 'error',
                    message: "No file to download"
                })
            }
        },
        async handleFileSelect(event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            file.upload = "new"
            if(this.rowData.name == file.name) {
                this.$message({
                    type: 'error',
                    message: "File upload have the same name"
                })
            } else {
                if(this.rowData.name !== undefined && this.rowData.name !== '' && this.rowData.upload !== 'new') {
                    this.deleteList = JSON.parse(JSON.stringify(this.rowData))
                }
                reader.onload = (e) => {
                    this.fi
                    this.imageUrl = e.target.result;
                };
                reader.readAsDataURL(file);
                let fileURLTemp = URL.createObjectURL(file);
                this.rowData = file
                this.fileURL = fileURLTemp
            }
            this.$refs.fileInput.value = '';
        },
        
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
.mgr-10 {
    margin-left: 10px;
}
</style>
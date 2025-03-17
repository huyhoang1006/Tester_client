<template>
    <div 
        v-if="visible"
        class="context-menu"
        :style="{ top: `${position.y}px`, left: `${position.x}px` }"
    >
        <!-- Menu chuột phải -->
        <transition name="fade">
            <ul>
                <li @click="show">
                    <i class="fa-solid fa-eye"></i> Show
                </li>
                <li @click="edit">
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                </li>
                <li @click="downloadNode">
                    <i class="fa-solid fa-file-arrow-down"></i> Download
                </li>
                <li @click="deleteNode">
                    <i class="fas fa-trash-alt"></i> Delete
                </li>
                <li @click="addChild">
                    <i class="fas fa-plus-circle"></i> Add child
                </li>
                <li @click="duplicate">
                    <i class="fa-solid fa-copy"></i> Duplicate
                </li>
            </ul>
        </transition>
    </div>
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            position: { x: 0, y: 0 },
            selectedNode: null, // Lưu trữ node đang mở menu
        };
    },
    methods: {
        openContextMenu(event, node) {
            event.preventDefault();

            this.position = { x: event.clientX, y: event.clientY };
            this.selectedNode = node;
            this.visible = true;

            // Đóng menu khi click ra ngoài
            document.addEventListener("click", this.closeContextMenu);
        },
        closeContextMenu() {
            this.visible = false;
            this.selectedNode = null;
            document.removeEventListener("click", this.closeContextMenu);
        },
        
        async downloadNode() {
            // try {
            //     let listLocation = this.$store.state.selectedLocationSync.filter((location) => !location.mode.includes("OWNER"))
            //     let listOwner = this.$store.state.selectedLocationSync.filter((location) => location.mode.includes("OWNER"))
            //     if(listOwner.length != 0) {
            //         const root = await window.electronAPI.getOwnerByUserId('00000000-0000-0000-0000-000000000000')
            //         if(root.success && root.data.length > 0) {
            //             for(let i in listOwner) {
            //                 let owner = await window.electronAPI.getOwnerById(listOwner[i].mrid)
            //                 let ownerParent = await window.electronAPI.getOwnerById(listOwner[i].ref_id)
            //                 if(owner.success) {
            //                     listOwner[i].mode = listOwner[i].mode.toLowerCase()
            //                     listOwner[i].user_id = this.user.user_id
            //                     listOwner[i].id = listOwner[i].mrid
            //                     if(owner.data.length > 0) {
            //                         if(ownerParent.success) {
            //                             if(ownerParent.data.length > 0) {
            //                                 listOwner[i].ref_id = ownerParent.data[i].id
            //                                 let updateData = await window.electronAPI.updateOwnerById(owner.data[0].id, listOwner[i])
            //                             } else {
            //                                 listOwner[i].ref_id = root.data[i].id
            //                                 let updateData = await window.electronAPI.updateOwnerById(owner.data[0].id, listOwner[i])
            //                             }
            //                         }
            //                     } else {
            //                         if(ownerParent.success) {
            //                             if(ownerParent.data.length > 0) {
            //                                 listOwner[i].ref_id = ownerParent.data[0].id
            //                                 let insertOwner = await window.electronAPI.insertOwner(listOwner[i])
            //                             } else {
            //                                 listOwner[i].ref_id = root.data[0].id
            //                                 let insertOwner = await window.electronAPI.insertOwner(listOwner[i])
            //                             }
            //                         } else {
            //                             let insertOwner = await window.electronAPI.insertOwner(listOwner[i])
            //                         }
            //                     }
            //                 }
            //             }
            //         }
            //     }
                
            //     if(listLocation.length != 0) {

            //         const locationIds = listLocation.map((location) => location.id)
            //         const listPromiseLocationExist = locationIds.map(id => window.electronAPI.getLocationById(id))
            //         const listResLocationExist = await Promise.all(listPromiseLocationExist)  
            //         const listInsert = []
            //         const listUpdate = []
            //         for (let index = 0; index < listResLocationExist.length; index++) {
            //             const location = listLocation[index];
            //             const isExist = listResLocationExist[index].data !== undefined

            //             if (isExist) {
            //                 listUpdate.push(location)
            //             }
            //             else {
            //                 listInsert.push(location)
            //             }
            //         }
            //         // thêm mới location
            //         for (let index = 0; index < listInsert.length; index++) {
            //             const location = listInsert[index]
            //             const newLocation = this.locationMapper(location)
            //             let locationParent = await window.electronAPI.getLocationById(newLocation.properties.refId)
                    
            //             if(locationParent.success) {
            //                 if(locationParent.data == undefined || locationParent.data.length <= 0) {
            //                     let ownerParent = await window.electronAPI.getOwnerById(newLocation.properties.refId)
            //                     if(ownerParent.success) {
            //                         if(ownerParent.data.length <= 0) {
            //                             const root = await window.electronAPI.getOwnerByUserId('00000000-0000-0000-0000-000000000000')
            //                             newLocation.properties.ref_id_old = JSON.parse(JSON.stringify(newLocation.properties.refId))
            //                             newLocation.properties.refId = root.data[0].id
            //                         }
            //                     }
            //                 }
            //             }

            //             await window.electronAPI.insertLocation(this.user.user_id, newLocation)
            //             attachmentApi.getDataAttachment(location.id).then(async(response) => {
            //                 if(response != null && response.length > 0) {
            //                     await window.electronAPI.uploadAttachment(response[0].id_foreign, "location", JSON.parse(response[0].name))
            //                     for(let i in JSON.parse(response[0].name)) {
            //                         let data = JSON.parse(response[0].name)[i].path
            //                         fileUploadApi.download(data).then(async(reply) => {
            //                             await window.electronAPI.downloadFileData(reply, data)
            //                         })
            //                     }
            //                 }
            //             })
            //         }

            //         // cập nhật location
            //         for (let index = 0; index < listUpdate.length; index++) {
            //             const location = listUpdate[index]
            //             const newLocation = this.locationMapper(location)
            //             let locationParent = await window.electronAPI.getLocationById(newLocation.properties.refId)
            //             if(locationParent.success) {
            //                 if(locationParent.data == undefined || locationParent.data.length <= 0) {
            //                     let ownerParent = await window.electronAPI.getOwnerById(newLocation.properties.refId)
            //                     if(ownerParent.success) {
            //                         if(ownerParent.data.length <= 0) {
            //                             const root = await window.electronAPI.getOwnerByUserId('00000000-0000-0000-0000-000000000000')
            //                             newLocation.properties.ref_id_old = JSON.parse(JSON.stringify(newLocation.properties.refId))
            //                             newLocation.properties.refId = root.data[0].id
            //                         }
            //                     }
            //                 }
            //             }
            //             await window.electronAPI.updateLocation(newLocation)
            //             attachmentApi.getDataAttachment(location.id).then(async(response) => {
            //                 const data = await window.electronAPI.getAllAttachment(location.id, "location")
                            
            //                 if(response.length > 0 && data?.data?.length > 0 && response[0].name !== data.data[0].name) {
            //                     this.$confirm('Change attachment files in locations ' + location.name + ' . Continue?', 'Warning', {
            //                         confirmButtonText: 'OK',
            //                         cancelButtonText: 'Cancel',
            //                         type: 'warning'
            //                     }).then(async() => {
            //                         if(response != null && response.length > 0) {
            //                             await window.electronAPI.updateAttachment(response[0].id_foreign, JSON.parse(response[0].name), "location")
            //                             for(let i in JSON.parse(response[0].name)) {
            //                                 let data = JSON.parse(response[0].name)[i].path
            //                                 fileUploadApi.download(data).then(async(reply) => {
            //                                     await window.electronAPI.downloadFileData(reply, data)
            //                                 })
            //                             }
            //                         }
            //                     })
            //                 }
            //             })
            //         }
            //     }

            //     this.$message.success("Successful")
            //     this.closeContextMenu();
            // } catch (err) {
            //     console.log(err)
            //     this.$message.error("Error")
            //     this.closeContextMenu();
            // }
        },
        deleteNode() {
            this.closeContextMenu();
        },
        addChild() {
            this.closeContextMenu();
        },
        show() {
            this.$emit("show-data")
            this.closeContextMenu()
        },
        edit() {
            this.closeContextMenu();
        },
        duplicate() {
            this.closeContextMenu();
        }
    }
};
</script>

<style>
/* Context Menu */
.context-menu {
    position: absolute;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    list-style: none;
    padding: 8px 0;
    z-index: 1000;
    min-width: 160px;
    font-size: 14px;
    animation: fadeIn 0.2s ease-in-out;
}

.context-menu ul {
    margin: 0;
    padding: 0;
}

.context-menu li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 15px;
    cursor: pointer;
    transition: background 0.2s;
}

.context-menu li:hover {
    background-color: #F0F0F0;
}

/* Icon */
.context-menu i {
    width: 16px;
    text-align: center;
    color: #555;
}

/* Hiệu ứng menu */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.2s ease;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}

/* Keyframes cho menu */
@keyframes fadeIn {
    from {
        transform: scale(0.95);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}
</style>

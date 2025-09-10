<template>
    <div 
        v-if="visible"
        class="context-menu"
        :style="{ top: `${position.y}px`, left: `${position.x}px` }"
    >
        <!-- Menu chuột phải -->
        <transition name="fade">
            <ul v-if="sign == 'onlysubs'">
                <li @click="addSubs">
                    <i class="fa-solid fa-plus"></i> Add substation
                </li>
            </ul>
            <ul v-else>
                <li v-if="this.selectedNode && this.selectedNode.mode == 'organisation'" @click="addOrganisation">
                    <i class="fa-solid fa-plus"></i> Add organisation
                </li>
                <li v-if="this.selectedNode && this.selectedNode.mode == 'organisation'" @click="addSubsInTree">
                    <i class="fa-solid fa-plus"></i> Add substation
                </li>
                <li v-if="this.selectedNode && this.selectedNode.mode == 'substation'" @click="addVoltageLevel">
                    <i class="fa-solid fa-plus"></i> Add voltage level
                </li>
                <li v-if="this.selectedNode && (this.selectedNode.mode == 'voltageLevel' || this.selectedNode.mode == 'substation')" @click="addBay">
                    <i class="fa-solid fa-plus"></i> Add bay
                </li>
                <li class="has-submenu" v-if="this.selectedNode && (this.selectedNode.mode == 'bay' || this.selectedNode.mode == 'substation')">
                    <i class="fa-solid fa-plus"></i> Add asset
                    <ul class="submenu">
                        <li @click="addTransformer"><i class="fa-solid fa-bolt"></i> Add transformer</li>
                        <li @click="addBushing"><i class="fa-solid fa-shield"></i> Add Bushing</li>
                        <li @click="addBreaker"><i class="fa-solid fa-plug"></i> Add Breaker</li>
                        <li @click="addCt"><i class="fa-solid fa-ruler"></i> Add CT</li>
                        <li @click="addVt"><i class="fa-solid fa-bolt-lightning"></i> Add VT</li>
                        <li @click="addSurgeArrester"><i class="fa-solid fa-shield-halved"></i> Add Surge Arrester</li>
                        <li @click="addPowerCable"><i class="fa-solid fa-route"></i> Add Power Cable</li>
                        <li @click="addDisconnector"><i class="fa-solid fa-plug-circle-xmark"></i> Add Disconnector</li>
                    </ul>
                </li>
                <li @click="addJob" v-if="this.selectedNode && this.selectedNode.mode == 'asset'">
                    <i class="fa-solid fa-plus"></i> Add job
                </li>
                <li @click="show">
                    <i class="fa-solid fa-eye"></i> Show
                </li>
                <li @click="edit">
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                </li>
                <li>
                    <i class="fa-solid fa-file-arrow-down"></i> Download
                </li>
                <li @click="deleteNode">
                    <i class="fas fa-trash-alt"></i> Delete
                </li>
                <li @click="duplicate">
                    <i class="fa-solid fa-copy"></i> Duplicate
                </li>
            </ul>
        </transition>
    </div>
</template>


<script>
/* eslint-disable */
export default {
    data() {
        return {
            visible: false,
            position: { x: 0, y: 0 },
            selectedNode: null, // Lưu trữ node đang mở menu
            sign : '',
            organisationId: '00000000-0000-0000-0000-000000000000' // Mặc định là ID của tổ chức
        };
    },
    methods: {
        openContextMenu(event, node, { top, left }) {
            event.preventDefault();
            if(top && left) {
                this.position = { x: left, y: top };
            } else {
                this.position = { x: event.clientX, y: event.clientY };
            }
            this.selectedNode = node;
            this.visible = true;

            // Đóng menu khi click ra ngoài
            document.addEventListener("click", this.closeContextMenu);
        },

        openContextMenuSubstation(event, organisationId) {
            event.preventDefault();
            this.position = { x: event.clientX, y: event.clientY };
            this.sign = 'onlysubs'
            this.organisationId = organisationId
            this.visible = true;
            // Đóng menu khi click ra ngoài
            document.addEventListener("click", this.closeContextMenu);
        },

        closeContextMenu() {
            this.visible = false;
            this.selectedNode = null;
            this.sign = ''
            document.removeEventListener("click", this.closeContextMenu);
        },
        deleteNode() {
            this.$emit("delete-data", this.selectedNode)
            this.closeContextMenu();
        },
        addChild() {
            this.closeContextMenu();
        },
        show() {
            this.$emit("show-data", this.selectedNode)
            this.closeContextMenu()
        },
        edit() {
            this.closeContextMenu();
        },
        duplicate() {
            this.closeContextMenu();
        },
        addSubs() {
            this.$emit("show-addSubs", this.organisationId)
            this.closeContextMenu()
        },
        addSubsInTree() {
            console.log("tree", this.selectedNode)
            this.$emit("show-addSubsInTree", this.selectedNode)
            this.closeContextMenu()
        },
        addOrganisation() {
            this.$emit("show-addOrganisation", this.selectedNode)
            this.closeContextMenu()
        },
        addVoltageLevel() {
            this.$emit("show-addVoltageLevel", this.selectedNode)
            this.closeContextMenu()
        },
        addBay() {
            this.$emit("show-addBay", this.selectedNode)
            this.closeContextMenu()
        },
        addTransformer() {
            this.$emit("show-addTransformer", this.selectedNode)
            this.closeContextMenu()
        },
        addBushing() {
            this.$emit("show-addBushing", this.selectedNode)
            this.closeContextMenu()
        },
        addSurgeArrester() {
            this.$emit("show-addSurgeArrester", this.selectedNode)
            this.closeContextMenu()
        },
        addBreaker() {
            this.$emit("show-addCircuit", this.selectedNode)
            this.closeContextMenu()
        },
        addCt() {
            this.$emit("show-addCt", this.selectedNode)
            this.closeContextMenu()
        },
        addVt() {
            this.$emit("show-addVt", this.selectedNode)
            this.closeContextMenu()
        },
        addPowerCable() {
            this.$emit("show-addPowerCable", this.selectedNode)
            this.closeContextMenu()
        },
        addDisconnector() {
            this.$emit("show-addDisconnector", this.selectedNode)
            this.closeContextMenu()
        },
        addAsset() {
            this.$emit("show-addAsset", this.selectedNode)
            this.closeContextMenu()
        },
        addJob() {
            this.$emit("show-addJob", this.selectedNode)
            this.closeContextMenu()
        },
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
    font-size: 12px;
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

/* Định dạng submenu */
.has-submenu {
    position: relative;
}

.has-submenu > .submenu {
    display: none;
    position: absolute;
    top: 0;
    left: 100%;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    min-width: 160px;
    z-index: 1001;
    padding: 8px 0;
    white-space: nowrap;
}

.has-submenu:hover > .submenu {
    display: block;
}
</style>

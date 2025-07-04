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
                <li>
                    <i class="fa-solid fa-plus"></i> Add substation
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
/* eslint-disable */
export default {
    data() {
        return {
            visible: false,
            position: { x: 0, y: 0 },
            selectedNode: null, // Lưu trữ node đang mở menu
            sign : ''
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

        openContextMenuSubstation(event) {
            event.preventDefault();
            this.position = { x: event.clientX, y: event.clientY };
            this.sign = 'onlysubs'
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
            this.$emit("show-addSubs")
            this.closeContextMenu()
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
</style>

<template>
    <div class="toolbar">
        <div style="display: flex; align-items: center">
            <div @click="$emit('reset-all')" class="path-hover">Organisation</div>
            
            <i v-if="pathMapServer && pathMapServer.length > 0" 
               style="margin-left: 10px"
               class="fa-solid fa-angle-right"></i>
        </div>

        <div style="display: flex; align-items: center" 
             v-for="(item, index) in pathMapServer"
             :key="`server-${item.id}-${index}`">
             
            <div @click="$emit('path-click', index)" class="path-hover">
                {{ item.parent }}
            </div>
            
            <i v-if="index < pathMapServer.length - 1" 
               style="margin-left: 10px"
               class="fa-solid fa-angle-right"></i>
        </div>
    </div>
</template>

<script>
export default {
    name: "ServerSideTopBar",
    props: {
        // Nhận dữ liệu path từ cha truyền vào
        pathMapServer: {
            type: Array,
            default: () => []
        }
    }
}
</script>
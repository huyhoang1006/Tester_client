<template>
    <div class="toolbar">
        <div style="display: flex; align-items: center">
            <div @click="resetAllClient" class="path-hover">Organisation</div>
            <i v-if="pathMapClient && pathMapClient.length > 0" style="margin-left: 10px"
                class="fa-solid fa-angle-right"></i>
        </div>
        <div style="display: flex; align-items: center" v-for="(item, index) in pathMapClient"
            :key="`client-${item.id}-${index}`">
            <div @click="resetPathClient(index)" class="path-hover">{{ item.parent }}</div>
            <i v-if="index < pathMapClient.length - 1" style="margin-left: 10px" class="fa-solid fa-angle-right"></i>
        </div>
    </div>
</template>
<script>
import mixin from './mixin'
export default {
    name: "ClientSideTopBar",
    props: {
        pathMapClient: {
            type: Array,
            required: true
        },
        organisationClientList: {
            type: Array,
            required: true
        }
    },
    computed: {
        pathMapClientData: {
            get() {
                return this.pathMapClient
            },
            set(value) {
                this.$emit('update:pathMapClient', value)
            }
        }
    },
    mixins: [mixin],
}
</script>
<style scoped>
.toolbar {
    background-color: #d9d9d9;
    height: 30px;
    display: flex;
    gap: 10px;
    border-bottom: 1px solid #cccccc;
    /* Độ dày 2px, màu đen */
    align-items: center;
    font-size: 12px;
    color: #555;
    font-weight: 600;
    box-sizing: border-box;
    width: 100%;
    padding-left: 10px;
}
</style>
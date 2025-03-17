<template>
    <div style="height: 100%; ">
        <div v-if="mode.includes('OWNER')">
            <template>
                <i class="fa-solid fa-folder-tree"></i>
            </template>
            <span class="setupParameter">{{ this.params.data.name }}</span>
        </div>
        <div v-else-if="mode == 'location'">
            <template>
                <i class="fa-solid fa-location-dot"></i>
            </template>
            <span class="setupParameter">{{ this.params.data.name }}</span>
        </div>
        <div v-else-if="mode == 'voltage'">
            <template>
                <i class="fa-solid fa-bolt"></i>
            </template>
            <span class="setupParameter">{{ this.params.data.name }}</span>
        </div>
        <div v-else-if="mode == 'feeder'" style="display: flex; align-items: center; justify-content: center; height: 100%">
            <img style="width: 20px; height:20px; display: block;" src="@/assets/images/electric-pole.png"/>
            <span class="setupParameter">{{ this.params.data.name }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: "header",
    data() {
        return {
            locked: '',
            mode : '',
        }
    },
    beforeMount() {
        this.mode = this.params.data.mode
    }
}
</script>

<style lang="scss" scoped>
.setupParameter {
    font-weight: bold;
    margin-left: 10px;
}
</style>
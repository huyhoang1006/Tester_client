<template>
    <div>
        <span v-if="!locked">
            <template>
                <i class="fa-solid fa-xl fa-unlock" style="color: green"></i>
            </template>
        </span>
        <span v-else>
            <template>
                <i class="fa-solid fa-xl fa-lock" style="color: red"></i>
            </template>
        </span>
    </div>
</template>

<script>
export default {
    name : "cellRenderAssetSync",
    data() {
        return {
            locked: '',
        }
    },
    beforeMount() {
        this.locked = this.params.value
    }
}
</script>

<style lang="scss" scoped></style>
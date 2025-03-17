<template>
    <div>
        <span v-if="!mode.includes('OWNER')">
            <template v-if="locked">
                <i class="fa-solid fa-xl fa-lock" style="color: red"></i>
            </template>
            <template v-else>
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
    data() {
        return {
            locked: '',
            mode : '',
        }
    },
    beforeMount() {
        this.locked = this.params.value
        this.mode = this.params.data.mode
    }
}
</script>

<style lang="scss" scoped></style>
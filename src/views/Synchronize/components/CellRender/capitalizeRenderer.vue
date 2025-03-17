<template>
    <div style="font-weight: bold;">
        {{ this.dataValue }}
    </div>
</template>

<script>
export default {
    name: "capitalizeRenderer",
    data() {
        return {
            dataValue : '',
        }
    },
    beforeMount() {
        this.dataValue = this.params.value.charAt(0).toUpperCase() + this.params.value.slice(1).toLowerCase()
    }
}
</script>

<style lang="scss" scoped></style>
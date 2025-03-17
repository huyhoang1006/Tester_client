<template>
    <div>
        <div @click="sort()" > {{params.displayName}} <i :class="sortDataShow"></i></div>
    </div>
</template>

<script>

export default {
    name : 'headerCustom',
    data() {
        return {
            sortDataShow : '',
        }
    },
    methods: {
        sort() {
            if(this.sortDataShow == 'fa-solid fa-arrow-up') {
                this.sortDataShow = 'fa-solid fa-arrow-down'
                this.params.onclick('desc')
            } else if(this.sortDataShow == 'fa-solid fa-arrow-down') {
                this.sortDataShow = ''
                this.params.onclick('')
            } else {
                this.sortDataShow = 'fa-solid fa-arrow-up'
                this.params.onclick('asc')
            }
        }
    }
}
</script>

<style scoped>

</style>
<template>
    <div id="app">
        <router-view />
        <GlobalLoading />
    </div>
</template>

<script>
import GlobalLoading from '@/components/GlobalLoading.vue';

export default {
    name: 'App',
    components: {
        GlobalLoading
    }
};
</script>

<style lang="scss">
@charset "utf-8";
@import '~ag-grid-community/dist/styles/ag-grid.css';
@import '~ag-grid-community/dist/styles/ag-theme-alpine.css';

html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #ffffff;
}

#app {
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
    border: none;
}
</style>

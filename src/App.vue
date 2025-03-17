<template>
  <div id="app">
      <router-view />
  </div>
</template>

<style lang="scss">
@charset "utf-8";
@import '~ag-grid-community/dist/styles/ag-grid.css';
@import '~ag-grid-community/dist/styles/ag-theme-alpine.css';
#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  border: 2px #012596 solid;
}
</style>

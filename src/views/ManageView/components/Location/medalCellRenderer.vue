<template>
  <div>
    <span v-if="params.data.mode != 'feeder'" @contextmenu="rightClick($event)" @click="openName()" :class="marginData">
      <i :class="firts"></i>&nbsp;&nbsp; <i :class="second"></i>&nbsp;
      {{params.value}}
    </span>
    <span v-else @contextmenu="rightClick($event)" @click="openName()" :class="marginData" style="display: flex; align-items: center;">
      <img style="width: 20px; height:20px; display: block;" src="@/assets/images/electric-pole.png"/>&nbsp;
      {{params.value}}
    </span>
  </div>
</template>

<script>
import Vue from "vue";

export default Vue.extend({
  beforeMount() {


    if(this.params.data.mode == 'location') {
      this.second = 'fa-solid fa-location-dot'
    } else if(this.params.data.mode == 'voltage') {
      this.second = 'fa-solid fa-bolt'
    } else if(this.params.data.mode == 'feeder') {
      this.firts = ''
    } else {
      this.second = "fa-solid fa-folder-tree"
    }

    if(this.params.data.signCheck == 2) {
      this.marginData = 'mgr-20'
    } else if(this.params.data.signCheck == 3) {
      this.marginData = 'mgr-40'
    } else if(this.params.data.signCheck == 4) {
      this.marginData = 'mgr-60'
    } else if(this.params.data.signCheck == 5) {
      this.marginData = 'mgr-80'
    }

    if(this.params.data.show == "true" && this.params.mode == 'location') {
      this.firts = 'fa-solid fa-caret-down'
    }
  },
  data() {
    return {
      dataVoltage : [],
      firts : 'fa-solid fa-caret-right',
      second : 'fa-solid fa-location-dot',
      marginData : '',
    }
  },
  methods: {
    async openName() {
      if(this.params.data.mode != 'feeder') {
        if(this.params.value != '' && this.params.value != undefined) {
          if(this.firts == 'fa-solid fa-caret-down') {
            this.params.onclick(this.params.data.id, "in", this.params.data.mode, this.params.data.signCheck)
            this.firts = 'fa-solid fa-caret-right'
          } else {
            this.firts = 'fa-solid fa-caret-down'
            this.params.onclick(this.params.data.id, "out", this.params.data.mode, this.params.data.signCheck)
          }
        }
      }
    },
    /* eslint-disable */
    rightClick(event) {
      this.params.clicked(event.clientX, event.clientY, 10);
    }
  },
});
</script>

<style scoped>
.mgr-20 {
  margin-left : 20px
}
.mgr-40 {
  margin-left: 40px;
}
.mgr-60 {
  margin-left: 60px;
}

.mgr-80 {
  margin-left: 80px;
}
</style>
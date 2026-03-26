<template>
  <img :src="iconSrc" :style="{ width: size || '40px', height: size || '40px' }" class="treeview-icon" />
</template>

<script>
export default {
  name: 'ImageIcon',
  props: {
    iconName: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: '40px'
    }
  },
  computed: {
    iconSrc() {
      const map = {
        'Substation': require('@/assets/Treeview/Substation.png'),
        'VoltageLevel': require('@/assets/Treeview/Voltage Level.png'),
        'Bay': require('@/assets/Treeview/Bay.png'),
        'Disconnector': require('@/assets/Treeview/Disconnector.png'),
        'CurrentTransformer': require('@/assets/Treeview/Current Transformer.png'),
        'Capacitor': require('@/assets/Treeview/Capacitor.png'),
        'Reactor': require('@/assets/Treeview/Reactor.png'),
        'PowerCable': require('@/assets/Treeview/power cable.png'),
        'SurgeArrester': require('@/assets/Treeview/Surge arrester.png'),
        'Transformer-2W': require('@/assets/Treeview/2W Tranformer 2.png'),
        'Transformer-3W': require('@/assets/Treeview/3W Transformer 2.png'),
        'Transformer-Auto': require('@/assets/Treeview/Auto Transformer.png'),
        'Transformer': require('@/assets/Treeview/2W Tranformer 2.png')
      };
      return map[this.iconName] || map['PowerCable'];
    }
  }
}
</script>

<style scoped>
.treeview-icon {
  object-fit: contain;
  display: inline-block;
  padding: 2px; 
}
</style>
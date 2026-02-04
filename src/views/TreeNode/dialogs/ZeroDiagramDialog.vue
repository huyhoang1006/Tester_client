<template>
  <el-dialog 
    :visible="visible" 
    @close="handleClose"
    :fullscreen="false" 
    width="85%"
    top="6vh"
    custom-class="openscd-dialog"
    :show-close="false"
  >
    <!-- Header: Top App Bar -->
    <div slot="title" class="oscd-top-app-bar">
      <div class="right-section" >
        <button class="icon-btn close-btn" @click="handleClose" title="Close"><i class="el-icon-close"></i></button>
      </div>
    </div>

    <div class="openscd-layout" v-loading="loading" element-loading-text="Loading Substation Data...">
      <nav class="oscd-tabs">
      </nav>

      <!-- Main Workspace -->
      <main class="workspace">
        <!-- Substation Container -->
        <div class="action-pane substation-pane">
          <div class="pane-header">
            <h2>
              <span style="width: 24px; height: 24px; display: flex; align-items: center; color: white;"><icon-substation /></span>
              {{ substationName }}
            </h2>
            <!-- <div class="pane-actions">
              <button class="icon-btn-mini"><i class="el-icon-share"></i></button>
              <button class="icon-btn-mini"><i class="el-icon-document-copy"></i></button>
              <button class="icon-btn-mini"><i class="el-icon-edit"></i></button>
              <button class="icon-btn-mini"><i class="el-icon-delete"></i></button>
              <button class="icon-btn-mini"><i class="el-icon-plus"></i></button>
            </div> -->
          </div>

          <!-- 1. HIỂN THỊ CÁC ASSET TRỰC TIẾP CỦA SUBSTATION (NEW) -->
          <div v-if="directSubstationAssets.length > 0" class="action-pane direct-assets">
            <div class="pane-header direct-assets-header">
              <h4>
                <i class="el-icon-s-operation" style="margin-right: 8px;"></i>
                Assets
              </h4>
            </div>
            <div class="equipment-list">
              <div v-for="(eq, eIndex) in directSubstationAssets" :key="eIndex" class="equipment-item">
                <div class="eq-icon-wrapper">
                  <component :is="getIconComponent(eq.type)" />
                </div>
                <span class="eq-label">{{ eq.name }}</span>
                <div class="mini-actions">
                    <div class="mini-fab"><i class="el-icon-share"></i></div>
                    <div class="mini-fab"><i class="el-icon-edit"></i></div>
                    <div class="mini-fab"><i class="el-icon-delete"></i></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Voltage Levels Loop -->
          <div v-for="(voltage, vIndex) in voltageLevels" :key="vIndex" class="action-pane voltage-level">
            <div class="pane-header">
              <h3>
                <span style="width: 24px; height: 24px; display: flex; align-items: center; color: white;"><icon-voltage-level /></span>
                {{ voltage.name }}
              </h3>
              <!-- <div class="pane-actions">
                <button class="icon-btn-mini"><i class="el-icon-share"></i></button>
                <button class="icon-btn-mini"><i class="el-icon-document-copy"></i></button>
                <button class="icon-btn-mini"><i class="el-icon-edit"></i></button>
                <button class="icon-btn-mini"><i class="el-icon-delete"></i></button>
                <button class="icon-btn-mini"><i class="el-icon-plus"></i></button>
              </div> -->
            </div>

            <!-- Bay Container -->
            <div class="bay-container">
              <!-- Bays Loop -->
              <div v-for="(bay, bIndex) in voltage.bays" :key="bIndex" class="action-pane bay">
                <div class="pane-header">
                  <h4>
                    <span style="width: 24px; height: 24px; display: flex; align-items: center; color: white;"><icon-bay /></span>
                    {{ bay.name }}
                  </h4>
                  <!-- <div class="pane-actions">
                    <button class="icon-btn-mini"><i class="el-icon-share"></i></button>
                    <button class="icon-btn-mini"><i class="el-icon-document-copy"></i></button>
                    <button class="icon-btn-mini"><i class="el-icon-edit"></i></button>
                    <button class="icon-btn-mini"><i class="el-icon-delete"></i></button>
                    <button class="icon-btn-mini"><i class="el-icon-plus"></i></button>
                  </div> -->
                </div>

                <!-- Equipment Content -->
                <div class="equipment-list">
                  <div v-for="(eq, eIndex) in bay.equipments" :key="eIndex" class="equipment-item">
                    <div class="eq-icon-wrapper">
                      <!-- Render SVG based on type -->
                      <component :is="getIconComponent(eq.type)" />
                    </div>
                    <span class="eq-label">{{ eq.name }}</span>
                    
                    <!-- Action buttons under equipment -->
                    <div class="mini-actions">
                       <div class="mini-fab"><i class="el-icon-share"></i></div>
                       <div class="mini-fab"><i class="el-icon-edit"></i></div>
                       <div class="mini-fab"><i class="el-icon-delete"></i></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="voltageLevels.length === 0" style="padding: 20px; text-align: center; color: #666;">
            No Voltage Levels or Bays found in this Substation.
          </div>
        </div>
      </main>
    </div>
  </el-dialog>
</template>

<script>
/* eslint-disable */
const IconSubstation = {
  render(h) {
    return h('svg', { attrs: { viewBox: '0 0 24 24', width: '24', height: '24' } }, [
      h('path', { attrs: { fill: 'currentColor', d: 'M12,3L2,12H5V20H19V12H22L12,3M11,10H13V18H11V10Z' } })
    ]);
  }
};

const IconVoltageLevel = {
  render(h) {
    return h('svg', { attrs: { viewBox: '0 0 24 24', width: '24', height: '24' } }, [
      h('path', { attrs: { fill: 'currentColor', d: 'M7,2V13H10V22L17,10H13L17,2H7Z' } })
    ]);
  }
};

const IconBay = {
  render(h) {
    return h('svg', { attrs: { viewBox: '0 0 100 100', width: '24', height: '24' } }, [
      h('path', {
        attrs: {
          d: 'M 20 22 Q 20 20 23 20 L 77 20 Q 80 20 80 22 L 80 32 Q 80 34 77 34 L 77 26 L 23 26 L 23 34 Q 20 34 20 32 Z',
          fill: 'currentColor'
        }
      }),
      ...[35, 50, 65].map(x => [
        h('path', {
          attrs: {
            d: `M ${x-6} 45 L ${x+6} 45 L ${x+4} 55 L ${x-4} 55 Z`,
            fill: 'currentColor'
          }
        }),
        h('rect', {
          attrs: {
            x: x - 2, y: 50, width: '4', height: '40',
            rx: '2', 
            fill: 'currentColor'
          }
        })
      ]).flat()
    ]);
  }
};

const IconCB = {
  render(h) {
    return h('svg', { attrs: { viewBox: '0 0 100 100', width: '40', height: '40' } }, [
      h('line', { attrs: { x1: '50', y1: '90', x2: '50', y2: '70', stroke: 'currentColor', 'stroke-width': '10', 'stroke-linecap': 'round' } }),
      h('line', { attrs: { x1: '50',  y1: '70', x2: '20', y2: '35', stroke: 'currentColor', 'stroke-width': '10', 'stroke-linecap': 'round' } }),
      h('line', { attrs: { x1: '45', y1: '15', x2: '65', y2: '35', stroke: 'currentColor', 'stroke-width': '10', 'stroke-linecap': 'round' } }),
      h('line', { attrs: { x1: '45', y1: '35', x2: '65', y2: '15', stroke: 'currentColor', 'stroke-width': '10', 'stroke-linecap': 'round' } })
    ]);
  }
};

const IconPowerCable = {
  render(h) {
    return h('svg', { attrs: { viewBox: '0 0 100 100', width: '40', height: '40' } }, [
      h('circle', { attrs: { cx: '50', cy: '50', r: '30', fill: 'none', stroke: 'currentColor', 'stroke-width': '10' } }),
      h('line', { attrs: { x1: '75', y1: '25', x2: '90', y2: '10', stroke: 'currentColor', 'stroke-width': '6', 'stroke-linecap': 'round' } }),
      h('circle', { attrs: { cx: '90', cy: '10', r: '10', fill: 'currentColor' } }),
      h('line', { attrs: { x1: '25', y1: '75', x2: '15', y2: '85', stroke: 'currentColor', 'stroke-width': '6', 'stroke-linecap': 'round' } }),
      h('circle', { attrs: { cx: '10', cy: '90', r: '10', fill: 'currentColor' } })
    ]);
  }
};

const IconCT = {
  render(h) {
    return h('svg', { attrs: { viewBox: '0 0 100 100', width: '40', height: '40' } }, [
      h('circle', { attrs: { cx: '50', cy: '50', r: '30', fill: 'none', stroke: 'currentColor', 'stroke-width': '10' } }),
      h('line', { attrs: { x1: '50', y1: '95', x2: '50', y2: '5', stroke: 'currentColor', 'stroke-width': '10', 'stroke-linecap': 'round' } }),
    ]);
  }
};

const IconVT = {
  render(h) {
    return h('svg', { attrs: { viewBox: '0 0 100 100', width: '64', height: '64' } }, [
      h('circle', { attrs: { cx: '50', cy: '40', r: '20', fill: 'none', stroke: 'currentColor', 'stroke-width': '10' } }),
      h('circle', { attrs: { cx: '50', cy: '60', r: '20', fill: 'none', stroke: 'currentColor', 'stroke-width': '10' } }),
      h('line', { attrs: { x1: '50', y1: '15', x2: '50', y2: '5', stroke: 'currentColor', 'stroke-width': '10', 'stroke-linecap': 'round' } }),
      h('line', { attrs: { x1: '50', y1: '82', x2: '50', y2: '92', stroke: 'currentColor', 'stroke-width': '10', 'stroke-linecap': 'round' } }),
      h('line', { attrs: { x1: '35', y1: '95', x2: '65', y2: '95', stroke: 'currentColor', 'stroke-width': '10', 'stroke-linecap': 'round' } })
    ]);
  }
};

const IconDisconnector = {
  render(h) {
    return h('svg', { attrs: { viewBox: '0 0 100 100', width: '40', height: '40' } }, [
      h('line', { attrs: { x1: '50', y1: '90', x2: '50', y2: '70', stroke: 'currentColor', 'stroke-width': '10', 'stroke-linecap': 'round' } }),
      h('line', { attrs: { x1: '50',  y1: '70', x2: '20', y2: '35', stroke: 'currentColor', 'stroke-width': '10', 'stroke-linecap': 'round' } }),
      h('line', { attrs: { x1: '50', y1: '25', x2: '50', y2: '10', stroke: 'currentColor', 'stroke-width': '10', 'stroke-linecap': 'round' } }),
      h('line', { attrs: { x1: '40', y1: '25', x2: '60', y2: '25', stroke: 'currentColor', 'stroke-width': '10', 'stroke-linecap': 'round' } }),
    ]);
  }
};

export default {
  name: 'ZeroDiagramDialog',
  components: {
    IconSubstation, IconVoltageLevel, IconBay, IconCB, IconPowerCable, IconCT, IconVT, IconDisconnector
  },
  props: {
    visible: { type: Boolean, default: false },
    currentNode: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      directSubstationAssets: [],
      substationName: '',
      voltageLevels: [],
      loading: false
    };
  },
  watch: {
    visible(val) {
      if (val && this.currentNode) {
        this.fetchSubstationData();
      }
    }
  },
  methods: {
    handleClose() { this.$emit('close'); },
    
    getIconComponent(type) {
      switch (type) {
        case 'CB': return 'IconCB';
        case 'PowerCable': return 'IconPowerCable';
        case 'CT': return 'IconCT';
        case 'VT': return 'IconVT';
        case 'Disconnector': return 'IconDisconnector';
        default: return 'IconDisconnector';
      }
    },

    mapAssetType(dbType) {
      switch (dbType) {
        case 'Circuit breaker': return 'CB';
        case 'Power cable': return 'PowerCable';
        case 'Current transformer': return 'CT';
        case 'Voltage transformer': return 'VT';
        case 'Disconnector': return 'IconDisconnector'; // Có thể tạo icon riêng cho D.S
        case 'Transformer': return 'VT'; 
        default: return 'PowerCable';
      }
    },

    async fetchSubstationData() {
      this.loading = true;
      this.substationName = this.currentNode.name || 'Unknown Substation';
      this.voltageLevels = [];

      try {
        const subId = this.currentNode.mrid;
        
        this.directSubstationAssets = await this.fetchAssetsForBay(subId);
        // 1. Lấy Voltage Levels
        const vlRes = await window.electronAPI.getVoltageLevelBySubstationId(subId);
        const vls = (vlRes.success && Array.isArray(vlRes.data)) ? vlRes.data : [];

        // 2. Lấy Bays trực tiếp (không thuộc Voltage Level)
        const directBayRes = await window.electronAPI.getBayByVoltageBySubstationId(null, subId);
        const directBays = (directBayRes.success && Array.isArray(directBayRes.data)) ? directBayRes.data : [];

        // Xử lý các Voltage Level
        for (const vl of vls) {
          const bayRes = await window.electronAPI.getBayByVoltageBySubstationId(vl.mrid, null);
          const bays = (bayRes.success && Array.isArray(bayRes.data)) ? bayRes.data : [];
          
          const processedBays = [];
          for (const bay of bays) {
            const equipments = await this.fetchAssetsForBay(bay.mrid);
            processedBays.push({ 
              name: bay.name, 
              equipments: equipments 
            });
          }

          this.voltageLevels.push({
            name: vl.name,
            bays: processedBays
          });
        }

        // Xử lý các Bay trực tiếp (nếu có)
        if (directBays.length > 0) {
          const processedDirectBays = [];
          for (const bay of directBays) {
            const equipments = await this.fetchAssetsForBay(bay.mrid);
            processedDirectBays.push({ 
              name: bay.name, 
              equipments: equipments 
            });
          }
          this.voltageLevels.push({
            name: 'Direct Bays',
            bays: processedDirectBays
          });
        }

      } catch (error) {
        console.error("Error fetching Zero Diagram data:", error);
        this.$message.error("Failed to load diagram data");
      } finally {
        this.loading = false;
      }
    },

    async fetchAssetsForBay(bayId) {
      // Gọi song song các API lấy asset để tối ưu tốc độ
      try {
        const assetTypes = [
          'Circuit breaker', 
          'Current transformer', 
          'Voltage transformer', 
          'Power cable', 
          'Disconnector',
          'Transformer',
          'Surge arrester', 'Bushing', 'Capacitor', 'Reactor', 'Rotating machine'
        ];

        const promises = assetTypes.map(type => 
          window.electronAPI.getAssetByPsrIdAndKind(bayId, type)
        );

        const results = await Promise.all(promises);
        
        let allAssets = [];
        for (let index = 0; index < results.length; index++) {
          const res = results[index];
          if (res.success && Array.isArray(res.data)) {
            const typeStr = assetTypes[index];
            const mappedType = this.mapAssetType(typeStr);

            // Build mapped assets; if Apparatus ID not present in properties then fetch full asset by MRID
            const mappedAssetsPromises = res.data.map(async item => {
              const apparatusId = item.properties && item.properties.apparatus_id ? item.properties.apparatus_id : null;
              if (apparatusId) {
                return { name: apparatusId, type: mappedType };
              }

              // Fallback: call getAssetByMrid to obtain identified_object.name (Apparatus ID)
              try {
                // ensure item.mrid exists
                if (item.mrid) {
                  const fullAsset = await window.electronAPI.getAssetByMrid(item.mrid);
                  if (fullAsset && fullAsset.success && fullAsset.data) {
                    const fetchedName = fullAsset.data.name || fullAsset.data.serial_number || item.name || typeStr;
                    return { name: fetchedName, type: mappedType };
                  }
                }
              } catch (err) {
                console.error('Error fetching full asset for mrid', item.mrid, err);
              }

              return { name: (item.name || item.serial_number || typeStr), type: mappedType };
            });

            const mappedAssets = await Promise.all(mappedAssetsPromises);
            allAssets = allAssets.concat(mappedAssets);
          }
        }

        return allAssets;
      } catch (e) {
        console.error("Error fetching assets for bay:", bayId, e);
        return [];
      }
    }
  }
};
</script>

<style scoped lang="scss">
/* --- Solarized Theme Variables --- */
$base03: #002b36;
$base02: #073642;
$base01: #f0f0f0;
$base00: #78868b;
$base1: #485656;
$base2: #0b019b;
$base3: #faf9f5;
$cyan: #2aa198;
$violet: #6c71c4;

/* --- Dialog Styles --- */
::v-deep .openscd-dialog {
  background-color: $base3;
  height: 85vh; 
  display: flex;
  flex-direction: column;
  padding: 0;
  box-shadow: 0 11px 15px -7px rgba(0,0,0,.2), 0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12);
  border-radius: 8px;
  overflow: hidden;

  .el-dialog__header {
    padding: 0;
    margin: 0;
    border-bottom: none;
  }
  
  .el-dialog__body {
    padding: 0;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    color: $base00;
  }
}

/* --- Top Bar --- */
.oscd-top-app-bar {
  background-color: $base3;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 16px;
  box-shadow: 0 2px 4px -1px rgba(0,0,0,0.2);
  color: $base00;
  z-index: 10;
}

.direct-assets-header{
  background-color: rgba($cyan, 0.05);
}

.direct-assets {
  border-left: 5px solid $cyan;
}

.right-section { display: flex; align-items: center; }

.icon-btn {
  background: none; border: none; cursor: pointer; padding: 10px; border-radius: 50%; color: $base00; font-size: 24px; transition: background-color 0.2s; display: flex; align-items: center; justify-content: center;
  &:hover { background-color: rgba(0,0,0,0.05); }
}
.close-btn { color: $base1; }

/* --- Layout Structure --- */
.openscd-layout {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: rgb(252, 252, 252);
}

/* --- Navigation Tabs --- */
.oscd-tabs {
  background-color: $base3;
  display: flex;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
  flex-shrink: 0;
}

.tab {
  padding: 0 24px; height: 48px; display: flex; align-items: center; gap: 8px; cursor: pointer; color: #555555; border-bottom: 2px solid transparent; text-transform: uppercase; font-size: 0.875rem; font-weight: 500; opacity: 0.7;
  &.active { color: $base2; border-bottom: 2px solid $base2; opacity: 1; }
  &:hover { background-color: rgba($base2, 0.05); }
}

/* --- Main Workspace --- */
.workspace { flex-grow: 1; overflow-y: auto; padding: 24px; }

/* --- Action Panes --- */
.action-pane {
  background-color: $base3;
  border: 1px solid $base2;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 4px;
  position: relative;
  
  &.substation-pane { border-left: 5px solid $cyan; }
  &.voltage-level { border-left: 5px solid $violet; }
  
  &.bay { 
  border: 2px solid $base1; 
  display: flex;
  flex-direction: column;
  align-self: flex-start;
}
}

.pane-header {
  background-color: $base2;
  margin: -16px -16px 16px -16px;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: $base01;
  
  h2, h3, h4 { margin: 0; font-weight: 500; display: flex; align-items: center; gap: 10px; }
  .svg-icon { width: 24px; height: 24px; display: flex; align-items: center; color: $base00; }
}

.pane-actions { display: flex; gap: 2px; }
.icon-btn-mini {
  background: none; border: none; cursor: pointer; color: $base01; font-size: 16px; padding: 6px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  &:hover { background-color: rgb(125, 120, 120); }
}

/* --- Bay Container (GRID LAYOUT) --- */
.bay-container { 
  display: flex;
  flex-wrap: wrap; 
  align-items: flex-start; 
  gap: 16px;
  width: 100%;
}

.action-pane.bay { 
  border: 2px solid $base1; 
  display: flex;
  flex-direction: column;
  box-sizing: border-box; 
  width: calc(33.33% - 11px);
  min-width: 280px;
  flex-grow: 0;
}

/* --- Equipment Styles --- */
.equipment-list { 
  display: grid; 
  grid-template-columns: repeat(3, 1fr); 
  gap: 10px; 
}

.equipment-item {
  display: flex; flex-direction: column; align-items: center; min-width: 60px; position: relative; padding: 8px; border-radius: 4px; cursor: pointer;
  &:hover { background-color: rgba(0,0,0,0.03); }
}
.eq-icon-wrapper { width: 64px; height: 64px; margin-bottom: 5px; color: $base00; svg { width: 100%; height: 100%; } }
.eq-label { font-size: 0.75rem; font-weight: bold; text-align: center; color: $base00; margin-bottom: 5px; word-break: break-word; }

/* --- Mini FABs --- */
.mini-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; height: 24px; }
.equipment-item:hover .mini-actions { opacity: 1; }
.mini-fab {
  width: 22px; height: 22px; background-color: $base2; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: $base01; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  &:hover { background-color: $base1; color: white; }
}

</style>
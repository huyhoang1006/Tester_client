<template>
  <el-dialog 
    :visible="visible" 
    @close="handleClose"
    :fullscreen="false" 
    width="90%"
    top="4vh"
    custom-class="light-modern-dialog"
    :show-close="false"
  >
    <div slot="title" class="modern-header">
      <div class="header-left">
        <div class="pulse-icon"><icon-substation /></div>
        <span class="substation-title">{{ substationName }}</span>
      </div>
      <div class="header-right">
        <button class="glass-btn close-btn" @click="handleClose">
          <i class="el-icon-close"></i>
        </button>
      </div>
    </div>

    <div class="modern-layout" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)" element-loading-text="Synchronizing Assets...">
      <main class="modern-workspace">
        
<section v-if="directSubstationAssets.length > 0" class="modern-card direct-assets-card">
          <div class="card-label">
            <i class="el-icon-cpu"></i> assets
          </div>
          <div class="equipment-grid">
              <div v-for="(eq, eIndex) in directSubstationAssets" 
                :key="'direct-' + eIndex" 
                class="modern-eq-item"
                :class="{ 'is-active': activeEqKey === 'direct-' + eIndex }"
                @click.stop="toggleActions('direct-' + eIndex)">
                <div class="eq-top-label" v-if="eq.name" :title="eq.name">{{ eq.name }}</div>
              <div class="eq-content-wrapper">
                <div class="eq-icon-container">
                  <component :is="getIconComponent(eq.type)" />
                </div>
                <span class="eq-name" :title="eq.name">{{ eq.name }}</span>
              </div>

              <div class="eq-floating-actions">
                <i class="el-icon-edit" title="Edit" @click.stop="handleAction('edit', eq)"></i>
                <i class="el-icon-delete" title="Delete" @click.stop="handleAction('delete', eq)"></i>
              </div>
            </div>
          </div>
        </section>
        <div v-for="(voltage, vIndex) in voltageLevels" :key="vIndex" class="voltage-group">
          <div class="voltage-header">
            <div class="voltage-badge">
              <icon-voltage-level style="width:14px; margin-right:5px;"/>
              {{ voltage.name }}
            </div>
            <div class="voltage-line"></div>
          </div>

          <div class="bay-grid">
            <div v-for="(bay, bIndex) in voltage.bays" :key="bIndex" class="modern-bay-card">
              <div class="bay-title">
                <icon-bay />
                <span>{{ bay.name }}</span>
              </div>
              
              <div class="equipment-grid">
                 <div v-for="(eq, eIndex) in bay.equipments" 
                   :key="eIndex" 
                   class="modern-eq-item compact"
                   :class="{ 'is-active': activeEqKey === `v${vIndex}-b${bIndex}-e${eIndex}` }"
                   @click.stop="toggleActions(`v${vIndex}-b${bIndex}-e${eIndex}`)">
                  <div class="eq-top-label" v-if="eq.name" :title="eq.name">{{ eq.name }}</div>
                <div class="eq-content-wrapper">
                  <div class="eq-icon-container">
                    <component :is="getIconComponent(eq.type)" />
                  </div>
                  <span class="eq-name" :title="eq.name">{{ eq.name }}</span>
                </div>

                <div class="eq-floating-actions">
                  <i class="el-icon-edit" title="Edit" @click.stop="handleAction('edit', eq)"></i>
                  <i class="el-icon-delete" title="Delete" @click.stop="handleAction('delete', eq)"></i>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="voltageLevels.length === 0 && !loading" class="empty-state">
          <i class="el-icon-search"></i>
          <p>No network components discovered.</p>
        </div>
      </main>
    </div>
  </el-dialog>
</template>

<script>
import { IconSubstation, IconVoltageLevel, IconBay, IconCB, IconPowerCable, IconCT, IconVT, IconDisconnector, IconBushing, IconSurgeArrester, IconRotatingMachine, IconCapacitor, IconReactor, IconBreaker  } from './icons.js';

export default {
  name: 'ZeroDiagramDialog',
  components: { IconSubstation, IconVoltageLevel, IconBay, IconCB, IconPowerCable, IconCT, IconVT, IconDisconnector, IconBushing, IconSurgeArrester, IconRotatingMachine, IconCapacitor, IconReactor, IconBreaker },
  props: {
    visible: { type: Boolean, default: false },
    currentNode: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      directSubstationAssets: [],
      substationName: '',
      voltageLevels: [],
      loading: false,
      activeEqKey: null,
    };
  },
  watch: {
    visible(val) { 
      if (val && this.currentNode) {
        this.fetchSubstationData();
        this.$nextTick(() => {
          document.addEventListener('click', this.handleClickOutside);
        });
      } else {
        document.removeEventListener('click', this.handleClickOutside);
      }
    }
  },
methods: {
    handleClose() { this.$emit('close'); },
    getIconComponent(type) {
      const map = { 'CB': 'IconCB', 'PowerCable': 'IconPowerCable', 'CT': 'IconCT', 'VT': 'IconVT', 'Disconnector': 'IconDisconnector', 'Transformer': 'IconVT', 'SurgeArrester': 'IconSurgeArrester', 'Reactor': 'IconReactor', 'Bushing': 'IconBushing', 'RotatingMachine': 'IconRotatingMachine', 'Capacitor': 'IconCapacitor', 'Breaker': 'IconBreaker' };
      return map[type] || 'IconDisconnector';
    },
    mapAssetType(dbType) {
      const map = { 
        'Circuit breaker': 'CB', 
        'Power cable': 'PowerCable', 
        'Current transformer': 'CT', 
        'Voltage transformer': 'VT', 
        'Disconnector': 'Disconnector', 
        'Transformer': 'Transformer', 
        'Surge Arrester': 'SurgeArrester',
        'Reactor': 'Reactor',      
        'Bushing': 'Bushing' ,
        'Rotating machine': 'RotatingMachine',
        'Capacitor': 'Capacitor',

      };
      return map[dbType] || 'PowerCable';
    },
    async fetchSubstationData() {
      this.loading = true;
      this.substationName = this.currentNode.name || 'Unknown Substation';
      this.voltageLevels = [];
      try {
        const subId = this.currentNode.mrid;
        this.directSubstationAssets = await this.fetchAssetsForBay(subId);
        const vlRes = await window.electronAPI.getVoltageLevelBySubstationId(subId);
        const vls = (vlRes.success && Array.isArray(vlRes.data)) ? vlRes.data : [];
        const directBayRes = await window.electronAPI.getBayByVoltageBySubstationId(null, subId);
        const directBays = (directBayRes.success && Array.isArray(directBayRes.data)) ? directBayRes.data : [];

        for (const vl of vls) {
          const bayRes = await window.electronAPI.getBayByVoltageBySubstationId(vl.mrid, null);
          const bays = (bayRes.success && Array.isArray(bayRes.data)) ? bayRes.data : [];
          const processedBays = [];
          for (const bay of bays) {
            const equipments = await this.fetchAssetsForBay(bay.mrid);
            processedBays.push({ name: bay.name, equipments: equipments });
          }
          this.voltageLevels.push({ name: vl.name, bays: processedBays });
        }
        if (directBays.length > 0) {
          const processedDirectBays = [];
          for (const bay of directBays) {
            const equipments = await this.fetchAssetsForBay(bay.mrid);
            processedDirectBays.push({ name: bay.name, equipments: equipments });
          }
          this.voltageLevels.push({ name: 'Bays', bays: processedDirectBays });
        }
      } catch (error) {
        this.$message.error("Failed to load diagram data");
      } finally { this.loading = false; }
    },
    async fetchAssetsForBay(bayId) {
      try {
        const assetTypes = ['Circuit breaker', 'Current transformer', 'Voltage transformer', 'Power cable', 'Disconnector', 'Transformer', 'Surge Arrester', 'Reactor', 'Bushing', 'Rotating machine', 'Capacitor', 'Breaker'];
        
        const promises = [
             window.electronAPI.getAssetByPsrIdAndKind(bayId, 'Circuit breaker'),
             window.electronAPI.getAssetByPsrIdAndKind(bayId, 'Current transformer'),
             window.electronAPI.getAssetByPsrIdAndKind(bayId, 'Voltage transformer'),
             window.electronAPI.getAssetByPsrIdAndKind(bayId, 'Power cable'),
             window.electronAPI.getAssetByPsrIdAndKind(bayId, 'Disconnector'),
             window.electronAPI.getAssetByPsrIdAndKind(bayId, 'Transformer'),
             window.electronAPI.getAssetByPsrIdAndKind(bayId, 'Surge Arrester'), 
             window.electronAPI.getAssetByPsrIdAndKind(bayId, 'Reactor'),
             window.electronAPI.getAssetByPsrIdAndKind(bayId, 'Bushing'),
              window.electronAPI.getAssetByPsrIdAndKind(bayId, 'Rotating machine'),
              window.electronAPI.getAssetByPsrIdAndKind(bayId, 'Capacitor'),
              window.electronAPI.getAssetByPsrIdAndKind(bayId, 'Breaker')
        ];

        const results = await Promise.all(promises);
        let allAssets = [];
        
        for (let index = 0; index < results.length; index++) {
          const res = results[index];
          if (res?.success && res?.data) {
            const dataArray = Array.isArray(res.data) ? res.data : [res.data];
            const typeStr = assetTypes[index];
            const mappedType = this.mapAssetType(typeStr);
            
            const mappedAssetsPromises = dataArray.map(async item => {
              let displayName = item.apparatus_id || item.properties?.apparatus_id;
              if (!displayName && item.mrid) {
                try {
                  const fullAssetRes = await window.electronAPI.getAssetByMrid(item.mrid);
                  if (fullAssetRes?.success && fullAssetRes.data) {
                    displayName = fullAssetRes.data.properties?.apparatus_id;
                    if (!displayName) {
                      displayName = fullAssetRes.data.name;
                    }
                  }
                } catch (err) {
                  console.warn("Failed to fetch detail for asset:", item.mrid);
                }
              }
              if (!displayName) {
                displayName = item.serial_number || item.serial_no || item.name || typeStr;
              }
              return { name: displayName, type: mappedType };
            });
            
            const mappedAssets = await Promise.all(mappedAssetsPromises);
            allAssets = allAssets.concat(mappedAssets);
          }
        }
        return allAssets;
      } catch (e) { 
        console.error(e);
        return []; 
      }
    },
    handleAction() {
      this.activeEqKey = null;
    },

    toggleActions(key) {
      this.activeEqKey = (this.activeEqKey === key) ? null : key;
    },

    handleClickOutside(event) {
      const equipmentItems = document.querySelectorAll('.modern-eq-item');
      let clickedOnItem = false;
      for (let item of equipmentItems) {
        if (item.contains(event.target)) {
          clickedOnItem = true;
          break;
        }
      }
      if (!clickedOnItem) {
        this.activeEqKey = null;
      }
    }
  },

  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style scoped lang="scss">
$bg-light: #f8fafc;
$white: #ffffff;
$border-soft: #e2e8f0;
$text-dark: #1e293b;
$text-muted: #64748b;
$accent-blue: #3b82f6;
$accent-indigo: #6366f1;
$danger: #ef4444;

::v-deep .light-modern-dialog {
  background: $bg-light !important;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
  .el-dialog__header { padding: 0; }
  .el-dialog__body { padding: 0; color: $text-dark; }
}

.modern-header {
  height: 65px; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  background: $white; border-bottom: 1px solid $border-soft;
  .header-left {
    display: flex; align-items: center; gap: 12px;
    .pulse-icon { color: $accent-blue; animation: pulse 2.5s infinite; }
    .substation-title { font-size: 1.15rem; font-weight: 700; color: $text-dark; }
  }
}

.modern-layout {
  height: 78vh;
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
}

.modern-workspace {
  padding: 24px; height: 100%; overflow-y: auto;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
}

.modern-card {
  background: $white; border: 1px solid $border-soft;
  border-radius: 16px; padding: 20px; margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  .card-label {
    font-size: 0.8rem; color: $accent-blue; text-transform: uppercase;
    font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; opacity: 0.8;
  }
}

.voltage-group { margin-bottom: 32px; }
.voltage-header {
  display: flex; align-items: center; gap: 16px; margin-bottom: 16px;
  .voltage-badge {
    background: #e0e7ff; color: $accent-indigo; padding: 6px 14px;
    border-radius: 12px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center;
  }
  .voltage-line { flex: 1; height: 2px; background: $border-soft; }
}

.bay-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; align-items: start;
}

.modern-bay-card {
  background: $white; border: 1px solid $border-soft; border-radius: 16px; padding: 16px; transition: all 0.3s ease;
  &:hover { border-color: $accent-blue; transform: translateY(-4px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1); }
  .bay-title {
    display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
    color: $text-dark; font-weight: 600; font-size: 0.9rem;
    i, svg { color: $accent-blue; }
  }
}

.equipment-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px;
}

.modern-eq-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid $border-soft;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  z-index: 1;

  .eq-content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.3s ease;
  }

  .eq-icon-container {
    width: 28px;
    height: 28px;
    color: $text-muted;
    margin-bottom: 6px;
  }

  .eq-name {
    font-size: 0.65rem;
    color: $text-muted;
    font-weight: 600;
    max-width: 90px;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: center;
  }

  .eq-top-label {
    position: absolute;
    top: -34px;
    left: 50%;
    transform: translateX(-50%) translateY(6px);
    background: $white;
    color: $text-dark;
    padding: 6px 10px;
    font-size: 0.85rem;
    border-radius: 6px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.12);
    max-width: 360px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: 0;
    pointer-events: none;
    transition: all 0.18s ease;
    z-index: 50;
  }

  &.is-active {
    border-color: $accent-blue;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 10; 

    .eq-content-wrapper {
      transform: translateY(10px);
    }

    .eq-floating-actions {
      opacity: 1;
      transform: translateX(-50%) translateY(-15px);
      pointer-events: auto;
    }
    .eq-top-label {
      opacity: 0;
      transform: translateX(-50%) translateY(6px);
    }
  }

  &:hover:not(.is-active) {
    border-color: $accent-blue;
    .eq-icon-container { color: $accent-blue; }
    .eq-top-label {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
}

.eq-floating-actions {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  display: flex;
  gap: 6px;
  background: $text-dark;
  padding: 5px 8px;
  border-radius: 20px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);

  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid $text-dark;
  }

  i {
    font-size: 14px;
    color: #fff;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: background 0.2s;

    &:hover {
      background: rgba(255,255,255,0.2);
    }
    
    &.el-icon-delete:hover { color: #ff7875; }
    &.el-icon-share:hover { color: #40a9ff; }
  }
}

.glass-btn {
  background: #f1f5f9; border: none;
  color: $text-muted; width: 32px; height: 32px; border-radius: 10px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: 0.2s;
  &:hover { background: #fee2e2; color: #ef4444; }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 50vh; color: $text-muted;
  i { font-size: 2.5rem; margin-bottom: 12px; opacity: 0.3; }
}
</style>
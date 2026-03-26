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
        <el-tag size="mini" :type="isServer ? 'success' : 'primary'" style="margin-left: 10px; border-radius: 10px;">
          {{ isServer ? 'Server Mode' : 'Client Mode' }}
        </el-tag>
      </div>
      <div class="header-right">
        <button class="glass-btn close-btn" @click="handleClose">
          <i class="el-icon-close"></i>
        </button>
      </div>
    </div>

    <div class="modern-layout" v-loading="loading" element-loading-background="rgba(255, 255, 255, 0.8)" element-loading-text="Loading...">
      <main class="modern-workspace">
        
        <!-- 1. Assets trực thuộc Substation -->
        <section v-if="directSubstationAssets.length > 0" class="modern-card direct-assets-card">
          <div class="card-label">
            <i class="el-icon-cpu"></i> assets
          </div>
          <div class="equipment-grid">
            <el-tooltip 
              v-for="(eq, eIndex) in directSubstationAssets"
              :key="'direct-' + eIndex"
              effect="dark"
              :content="eq.name"
              placement="top"
              :open-delay="200"
              :disabled="activeEqKey === 'direct-' + eIndex"
            >
              <div 
                class="modern-eq-item"
                :class="{ 'is-active': activeEqKey === 'direct-' + eIndex }"
                @click.stop="toggleActions('direct-' + eIndex)"
              >
                <div class="eq-content-wrapper">
                  <div class="eq-icon-container">
                    <component :is="getIconComponent(eq.type)" :iconName="getIconName(eq.type, eq.transformerType)" />
                  </div>
                  <span class="eq-name">{{ eq.name }}</span>
                </div>

                <!-- THANH THAO TÁC (EDIT/DELETE) -->
                <div class="eq-floating-actions">
                  <i class="el-icon-edit" title="Edit" @click.stop="handleAction('edit', eq)"></i>
                  <i class="el-icon-delete" title="Delete" @click.stop="handleAction('delete', eq)"></i>
                </div>
              </div>
            </el-tooltip>
          </div>
        </section>

        <!-- 2. Phân cấp Voltage Levels -> Bays -->
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
                <el-tooltip 
                  v-for="(eq, eIndex) in bay.equipments" 
                  :key="eIndex"
                  effect="dark"
                  :content="eq.name"
                  placement="top"
                  :open-delay="200"
                  :disabled="activeEqKey === `v${vIndex}-b${bIndex}-e${eIndex}`"
                >
                  <div 
                    class="modern-eq-item compact"
                    :class="{ 'is-active': activeEqKey === `v${vIndex}-b${bIndex}-e${eIndex}` }"
                    @click.stop="toggleActions(`v${vIndex}-b${bIndex}-e${eIndex}`)"
                  >
                    <div class="eq-content-wrapper">
                      <div class="eq-icon-container">
                        <component :is="getIconComponent(eq.type)" :iconName="getIconName(eq.type, eq.transformerType)" />
                      </div>
                      <span class="eq-name">{{ eq.name }}</span>
                    </div>

                    <!-- THANH THAO TÁC (EDIT/DELETE) -->
                    <div class="eq-floating-actions">
                      <i class="el-icon-edit" title="Edit" @click.stop="handleAction('edit', eq)"></i>
                      <i class="el-icon-delete" title="Delete" @click.stop="handleAction('delete', eq)"></i>
                    </div>
                  </div>
                </el-tooltip>
                <div v-if="bay.equipments.length === 0" class="no-data-text">No equipment</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="voltageLevels.length === 0 && directSubstationAssets.length === 0 && !loading" class="empty-state">
          <i class="el-icon-search"></i>
          <p>No network components discovered.</p>
        </div>
      </main>
    </div>
  </el-dialog>
</template>

<script>
import * as demoAPI from '@/api/demo/index.js';
import { IconSubstation, IconVoltageLevel, IconBay, IconCB, IconPowerCable, IconCT, IconVT, IconDisconnector, IconBushing, IconSurgeArrester, IconRotatingMachine, IconCapacitor, IconReactor, IconBreaker  } from './icons.js';
import ImageIcon from './ImageIcon.vue';
import { startLoading } from '@/utils/loading';

export default {
  name: 'ZeroDiagramDialog',
  components: { IconSubstation, IconVoltageLevel, IconBay, IconCB, IconPowerCable, IconCT, IconVT, IconDisconnector, IconBushing, IconSurgeArrester, IconRotatingMachine, IconCapacitor, IconReactor, IconBreaker, ImageIcon },
  props: {
    visible: { type: Boolean, default: false },
    currentNode: { type: Object, default: () => ({}) },
    isServer: { type: Boolean, default: false },
    checkChildrenMethod: { type: Function, default: null }
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
      const imageIconTypes = ['PowerCable', 'CT', 'Disconnector', 'SurgeArrester', 'Reactor', 'Capacitor'];
      
      if (type === 'Transformer') {
        return 'ImageIcon';
      }
      
      if (imageIconTypes.includes(type)) {
        return 'ImageIcon';
      }
      
      const svgMap = {
        'CB': 'IconCB',
        'VT': 'IconVT',
        'Breaker': 'IconBreaker',
        'Bushing': 'IconBushing',
        'RotatingMachine': 'IconRotatingMachine'
      };
      return svgMap[type] || 'IconDisconnector';
    },
    getIconName(type, transformerType) {
      if (type === 'Transformer') {
        if (transformerType) {
          const tt = transformerType.toLowerCase();
          if (tt.includes('three') || tt.includes('3w')) return 'Transformer-3W';
          if (tt.includes('auto')) return 'Transformer-Auto';
          if (tt.includes('two') || tt.includes('2w')) return 'Transformer-2W';
        }
        return 'Transformer';
      }
      const map = {
        'PowerCable': 'PowerCable',
        'CT': 'CurrentTransformer',
        'Disconnector': 'Disconnector',
        'SurgeArrester': 'SurgeArrester',
        'Reactor': 'Reactor',
        'Capacitor': 'Capacitor'
      };
      return map[type] || 'PowerCable';
    },
    mapAssetType(dbType) {
      const map = { 
        'Circuit breaker': 'CB', 'Power cable': 'PowerCable', 'Current transformer': 'CT', 
        'Voltage transformer': 'VT', 'Disconnector': 'Disconnector', 'Transformer': 'Transformer', 
        'Surge Arrester': 'SurgeArrester', 'Surge arrester': 'SurgeArrester',
        'Reactor': 'Reactor', 'Bushing': 'Bushing' , 'Rotating machine': 'RotatingMachine', 'Capacitor': 'Capacitor', 'Breaker': 'Breaker'
      };
      return map[dbType] || 'PowerCable';
    },

    async fetchSubstationData() {
      this.loading = true;
      this.substationName = this.currentNode.name || 'Unknown Substation';
      this.voltageLevels = [];
      this.directSubstationAssets = [];

      try {
        if (this.isServer) {
          // --- LOGIC SERVER ---
          const subId = this.currentNode.id || this.currentNode.mrid;
          if (!subId) throw new Error("Substation ID is missing");

          this.directSubstationAssets = await this.fetchAssetsFromServer(subId, 'Substation');

          const vlsRes = await demoAPI.getVoltageLevelBySubstationId(subId);
          const vls = Array.isArray(vlsRes) ? vlsRes : (vlsRes?.data || []);

          for (const vl of vls) {
            const vlId = vl.id || vl.mrid;
            if (vlId === undefined || vlId === null) continue; 

            const baysRes = await demoAPI.getBayByVoltageLevel(vlId);
            const bays = Array.isArray(baysRes) ? baysRes : (baysRes?.data || []);
            const processedBays = [];
            
            for (const bay of bays) {
              const bayId = bay.id || bay.mrid;
              const equipments = bayId ? await this.fetchAssetsFromServer(bayId, 'Bay') : [];
              processedBays.push({ name: bay.aliasName || bay.name, equipments: equipments });
            }
            this.voltageLevels.push({ name: vl.aliasName || vl.name, bays: processedBays });
          }

          const directBaysRes = await demoAPI.getChildBay(subId);
          const directBays = Array.isArray(directBaysRes) ? directBaysRes : (directBaysRes?.data || []);
          if (directBays.length > 0) {
            const processedDirectBays = [];
            for (const bay of directBays) {
              const bayId = bay.id || bay.mrid;
              const equipments = bayId ? await this.fetchAssetsFromServer(bayId, 'Bay') : [];
              processedDirectBays.push({ name: bay.aliasName || bay.name, equipments: equipments });
            }
            this.voltageLevels.push({ name: 'Bays', bays: processedDirectBays });
          }

        } else {
          // --- LOGIC CLIENT (GIỮ NGUYÊN GỐC) ---
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
        }
      } catch (error) {
        console.error("ZeroDiagram Fetch Error:", error);
      } finally { this.loading = false; }
    },

    async fetchAssetsFromServer(ownerId, mode) {
      try {
        const res = await demoAPI.getAssetByOwner(ownerId, mode);
        const data = Array.isArray(res) ? res : (res?.data || []);
        return data.map(item => ({
          id: item.id,
          mrid: item.mrid,
          parentId: ownerId,
          asset: item.asset || item.assetType || item.assetKind,
          mode: 'asset',
          name: item.aliasName || item.name || item.serialNumber || 'Unnamed',
          // Sử dụng trường .asset để map đúng Icon cho Server
          type: this.mapAssetType(item.asset || item.assetType || item.assetKind)
        }));
      } catch (e) { return []; }
    },

    async fetchAssetsForBay(bayId) {
      try {
        const assetTypes = ['Circuit breaker', 'Current transformer', 'Voltage transformer', 'Power cable', 'Disconnector', 'Transformer', 'Surge Arrester', 'Reactor', 'Bushing', 'Rotating machine', 'Capacitor', 'Breaker'];
        const promises = assetTypes.map(type => window.electronAPI.getAssetByPsrIdAndKind(bayId, type));
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
              
              let transformerType = item.transformerType || null;

              if (!transformerType && typeStr === 'Transformer' && item.mrid) {
                try {
                  const fullAssetRes = await window.electronAPI.getAssetByMrid(item.mrid);
                  if (fullAssetRes?.success && fullAssetRes.data) {
                    displayName = fullAssetRes.data.properties?.apparatus_id || fullAssetRes.data.name;
                    transformerType = fullAssetRes.data.properties?.transformer_type || 
                                      fullAssetRes.data.properties?.transformerType || 
                                      fullAssetRes.data.type;
                  }
                } catch (err) { console.warn(err); }
              }
              if (!displayName) displayName = item.apparatus_id || item.serial_number || item.serial_no || typeStr;
              
              return { 
                mrid: item.mrid, 
                parentId: bayId, 
                asset: typeStr, 
                mode: 'asset',
                name: displayName, 
                type: mappedType,
                transformerType: transformerType
              };
            });
            const mappedAssets = await Promise.all(mappedAssetsPromises);
            allAssets = allAssets.concat(mappedAssets);
          }
        }
        return allAssets;
      } catch (e) { return []; }
    },

    handleAction(action, eq) { 
      if (action === 'delete') {
        this.handleDelete(eq);
      } else if (action === 'edit') {
        this.$emit('edit-node', eq);
      } else {
        console.log(`Action: ${action}`, eq);
      }
      this.activeEqKey = null; 
    },

    async handleDelete(eq) {
       if (this.checkChildrenMethod) {
    const checkResult = await this.checkChildrenMethod(eq);
    if (checkResult.hasChildren) {
      this.$message.error('Node has children, cannot delete');
      return;
    }
  }
      let nodeName = eq.name || 'Unknown';
      
      this.$confirm(`Delete "${nodeName}"?`, 'Warning', {
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        cancelButtonClass: 'el-button--danger',
        type: 'warning'
      })
      .then(async () => {
        const { close } = startLoading(this, { 
          action: 'delete',
          type: 'default' 
        });

        const originalMessage = this.$message;
        let deleteSuccess = false;
        let capturedMessages = [];

        this.$message = {
          success: (msg) => { deleteSuccess = true; capturedMessages.push({ type: 'success', message: msg }); },
          error: (msg) => { capturedMessages.push({ type: 'error', message: msg }); },
          warning: (msg) => { capturedMessages.push({ type: 'warning', message: msg }); },
          info: (msg) => { capturedMessages.push({ type: 'info', message: msg }); }
        };

        try {
          await new Promise(resolve => {
            this.$emit('delete-node', eq, (success) => {
              deleteSuccess = success;
              resolve();
            });
          });
        } catch (error) {
          capturedMessages.push({ type: 'error', message: error.message });
        } finally {
          this.$message = originalMessage;
          await close();
          
          if (capturedMessages.length > 0) {
            const last = capturedMessages[capturedMessages.length - 1];
            this.$message[last.type](last.message);
          }

          if (deleteSuccess) {
            this.removeItemFromLocalState(eq);
            this.$emit('node-deleted', eq);
          }
        }
      })
      .catch(() => {});
    },

    removeItemFromLocalState(eq) {
      // 1. Remove from directSubstationAssets
      const dIndex = this.directSubstationAssets.findIndex(item => 
        (item.mrid && item.mrid === eq.mrid) || (item.id && item.id === eq.id)
      );
      if (dIndex !== -1) {
        this.directSubstationAssets.splice(dIndex, 1);
        return;
      }

      // 2. Remove from voltageLevels hierarchy
      for (const vl of this.voltageLevels) {
        if (vl.bays) {
          for (const bay of vl.bays) {
            if (bay.equipments) {
              const eIndex = bay.equipments.findIndex(item => 
                (item.mrid && item.mrid === eq.mrid) || (item.id && item.id === eq.id)
              );
              if (eIndex !== -1) {
                bay.equipments.splice(eIndex, 1);
                return;
              }
            }
          }
        }
      }
    },
    toggleActions(key) { this.activeEqKey = (this.activeEqKey === key) ? null : key; },
    refresh() {
      console.log('[ZERO-DIAGRAM] Refreshing data...');
      this.fetchSubstationData();
    },
    handleClickOutside(event) {
      if (!event.target.closest('.modern-eq-item')) this.activeEqKey = null;
    }
  },
  beforeDestroy() { document.removeEventListener('click', this.handleClickOutside); }
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

.modern-layout { height: 78vh; background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); }
.modern-workspace { padding: 24px; height: 100%; overflow-y: auto; }

.modern-card {
  background: $white; border: 1px solid $border-soft; border-radius: 16px; padding: 20px; margin-bottom: 24px;
  .card-label { font-size: 0.8rem; color: $accent-blue; text-transform: uppercase; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; opacity: 0.8; }
}

.voltage-group { margin-bottom: 32px; }
.voltage-header {
  display: flex; align-items: center; gap: 16px; margin-bottom: 16px;
  .voltage-badge { background: #e0e7ff; color: $accent-indigo; padding: 6px 14px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; }
  .voltage-line { flex: 1; height: 2px; background: $border-soft; }
}

.bay-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 16px; align-items: start; }
.modern-bay-card {
  background: $white; border: 1px solid $border-soft; border-radius: 16px; padding: 16px; transition: all 0.3s ease;
  &:hover { border-color: $accent-blue; transform: translateY(-4px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1); }
  .bay-title { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; color: $text-dark; font-weight: 600; font-size: 0.9rem; i, svg { color: $accent-blue; } }
}

.equipment-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 14px; }
.modern-eq-item {
  position: relative; display: flex; flex-direction: column; align-items: center; padding: 12px 8px; border-radius: 12px; background: #ffffff; border: 1px solid $border-soft; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; z-index: 1;
  .eq-content-wrapper { display: flex; flex-direction: column; align-items: center; transition: transform 0.3s ease; }
  .eq-icon-container { width: 40px; height: 40px; color: $text-muted; margin-bottom: 6px; }
  .eq-name { font-size: 0.85rem; color: $text-muted; font-weight: 600; max-width: 90px; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }
  &.is-active {
    border-color: $accent-blue; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); z-index: 10; 
    .eq-content-wrapper { transform: translateY(10px); }
    .eq-floating-actions { opacity: 1; transform: translateX(-50%) translateY(-15px); pointer-events: auto; }
  }
  &:hover:not(.is-active) { border-color: $accent-blue; .eq-icon-container { color: $accent-blue; } }
}

.eq-floating-actions {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%) translateY(0); display: flex; gap: 6px; background: $text-dark; padding: 5px 8px; border-radius: 20px; opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55); box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  &::after { content: ''; position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid $text-dark; }
  i { font-size: 14px; color: #fff; cursor: pointer; padding: 4px; border-radius: 50%; transition: background 0.2s; &:hover { background: rgba(255,255,255,0.2); } &.el-icon-delete:hover { color: #ff7875; } }
}

.glass-btn { background: #f1f5f9; border: none; color: $text-muted; width: 32px; height: 32px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; &:hover { background: #fee2e2; color: #ef4444; } }

@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; color: $text-muted; i { font-size: 2.5rem; margin-bottom: 12px; opacity: 0.3; } }
</style>
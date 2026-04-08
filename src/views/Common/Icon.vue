<template>
   <div class="custom-folder">
        <template v-if="mainIconInfo.type === 'image'">
            <img :src="mainIconInfo.src" :style="{ width: size, height: size }" class="main-icon" />
        </template>
        <template v-else-if="mainIconInfo.type === 'component'">
            <component :is="mainIconInfo.component" :style="{ width: size, height: size }" />
        </template>
        <template v-else>
            <i class="fa-regular fa-folder-open main-icon"></i>
            <i :class="['badge', badgeIcon]"></i>
        </template>
    </div>
</template>
  
<script>
import { IconVT, IconCB } from '@/views/TreeNode/dialogs/icons.js';

export default {
    name: 'FolderIconWithBadge',
    props: {
        folderType: {
            type: String,
            default: 'location',
            validator: (value) => ['location', 'asset', 'job', 'test', 'owner', 'building', 'voltageLevel', 'bay', 'fileType'].includes(value)
        },
        size: {
            type: String,
            default: '20px',
            validator: (value) => ['12px', '14px', '16px', '20px', '24px', '32px'].includes(value)
        },
        fileTypeDetail: {
            type: String,
            default: 'file',
            validator: (value) => ['pdf', 'xml', 'excel', 'word', 'json', 'file'].includes(value)
        },
        badgeColor: {
            type: String,
            default: '4285f4'
        },
        assetDetail: {
            type: String,
            default: 'Unknown'
        },
        transformerType: {
            type: String,
            default: null
        }
    },
    computed: {
        mainIconInfo() {
            const faDefaults = {
                location: 'fa-solid fa-location-dot',
                job: 'fa-solid fa-toolbox',
                test: 'fa-solid fa-file-lines',
                building: 'fa-solid fa-building',
                owner: 'fa-solid fa-location-crosshairs',
                voltageLevel: 'fa-solid fa-bolt-lightning',
                bay: 'fa-solid fa-tower-observation'
            };

            const fileTypeFa = {
                pdf: 'fa-solid fa-file-pdf',
                json: 'fa-solid fa-file-code',
                xml: 'fa-solid fa-file-code',
                excel: 'fa-solid fa-file-excel',
                word: 'fa-solid fa-file-word'
            };

            try {
                if (this.folderType === 'location') {
                    const src = require('@/assets/Treeview/Substation.png');
                    return { type: 'image', src };
                }

                if (this.folderType === 'voltageLevel') {
                    const src = require('@/assets/Treeview/Voltage Level.png');
                    return { type: 'image', src };
                }

                if (this.folderType === 'bay') {
                    const src = require('@/assets/Treeview/Bay.png');
                    return { type: 'image', src };
                }

                if (this.folderType === 'owner') {
                    const src = require('@/assets/Treeview/Owner.png');
                    return { type: 'image', src };
                }

                if (this.folderType === 'asset') {
                    if (this.assetDetail === 'Voltage transformer') {
                        return { type: 'component', component: IconVT };
                    }
                    if (this.assetDetail === 'Circuit breaker' || this.assetDetail === 'Breaker') {
                        return { type: 'component', component: IconCB };
                    }

                    const assetMap = {
                        'Disconnector': 'Disconnector.png',
                        'Current transformer': 'Current Transformer.png',
                        'Capacitor': 'Capacitor.png',
                        'Reactor': 'Reactor.png',
                        'Earthing Switch': 'Earthing Switch.png',
                        'Load': 'Load.png',
                        'Motor': 'Motor.png',
                        'Transformer': '2W Tranformer 2.png',
                        'Power cable' :'power cable.png',
                        'Surge arrester' : 'Surge arrester.png'
                    };

                    if (this.assetDetail === 'Transformer') {
                        if (this.transformerType && this.transformerType.includes('Two-winding')) {
                            const src = require('@/assets/Treeview/2W Tranformer 2.png');
                            return { type: 'image', src };
                        } else if (this.transformerType && this.transformerType.includes('Three-winding')) {
                            const src = require('@/assets/Treeview/3W Transformer 2.png');
                            return { type: 'image', src };
                        } else if (this.transformerType && this.transformerType.includes('Auto w/')) {
                            const src = require('@/assets/Treeview/Auto Transformer.png');
                            return { type: 'image', src };
                        } else {
                            const src = require('@/assets/Treeview/2W Tranformer 2.png');
                            return { type: 'image', src };
                        }
                    }

                    const fileName = assetMap[this.assetDetail] || assetMap['Unknown'];
                    const src = require('@/assets/Treeview/' + fileName);
                    return { type: 'image', src };
                }

                if (this.folderType === 'fileType') {
                    const fa = fileTypeFa[this.fileTypeDetail] || 'fa-solid fa-file';
                    return { type: 'fa', class: fa };
                }
            } catch (e) {
                // require failed -> fall back to FA
            }

                    if (this.folderType === 'asset') {
                        return { type: 'fa', class: 'fa-solid fa-gear' };
                    }

                    const faClass = faDefaults[this.folderType] || faDefaults.location;
                    return { type: 'fa', class: faClass };
            },
            badgeIcon() {
                const icons = {
                    location: 'fa-solid fa-location-dot',
                    asset: {
                        "Unknown" : 'fa-solid fa-gear',
                        "Transformer" : 'fa-solid fa-bolt',
                        'Surge arrester' : 'fa-solid fa-shield-halved',
                        'Disconnector' : 'fa-solid fa-plug-circle-xmark',
                        'Power cable' : 'fa-solid fa-route',
                        'Bushing' : "fa-solid fa-shield",
                        'Voltage transformer' : 'fa-solid fa-bolt-lightning',
                        'Rotating machine': 'fa-solid fa-group-arrows-rotate',
                        'Current transformer' : 'fa-solid fa-bolt-lightning',
                        'Capacitor' : 'fa-solid fa-bolt',
                        'Circuit breaker' : 'fa-solid fa-toggle-on',
                        'Reactor' : 'fa-solid fa-industry'
                    },
                    job: 'fa-solid fa-toolbox',
                    test: 'fa-solid fa-file-lines',
                    owner: 'fa-solid fa-location-crosshairs',
                    building: 'fa-solid fa-building',
                    voltageLevel: 'fa-solid fa-bolt-lightning',
                    bay: 'fa-solid fa-tower-observation',
                    fileType: {
                        pdf : "fa-solid fa-file-pdf",
                        json : "fa-solid fa-file-code",
                        xml : "fa-solid fa-file-code",
                        excel : "fa-solid fa-file-excel",
                        word : "fa-solid fa-file-word"
                    }
                };
                if(this.folderType == 'asset') {
                    if(this.assetDetail == 'Unknown') {
                        return icons.asset['Unknown']
                    } else {
                        return icons.asset[this.assetDetail]
                    }
                } else if(this.folderType == 'fileType') {
                    return icons.fileType[this.fileTypeDetail] || 'fa-solid fa-file'
                }
                else {
                    return icons[this.folderType] || 'fa-solid fa-location-dot'
                }
            },
            badgeStyle() {
                return {
                    'badgeColor': `#${this.badgeColor}`,
                    'fontSize': `calc(${this.size} * 0.75)`
                }
            }
        }
    }
    </script>
  
<style scoped>
.custom-folder {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: v-bind(size);
    height: v-bind(size);
}

.main-icon {
    font-size: v-bind(size);
    color: #ffc107;
    position: relative;
    z-index: 1;
}

.badge {
    position: absolute;
    bottom: 0;
    right: 0;
    color: v-bind('badgeStyle.badgeColor');
    background-color: white;
    border-radius: 50%;
    padding: 1px;
    transform: translate(25%, 25%);
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
    z-index: 2;
    font-size: v-bind('badgeStyle.fontSize');
}
</style>
<template>
    <div class="custom-folder">
        <i class="fa-regular fa-folder-open main-icon"></i>
        <i :class="['badge', badgeIcon]"></i>
    </div>
</template>
  
<script>
export default {
    name: 'FolderIconWithBadge',
    props: {
        folderType: {
            type: String,
            default: 'location',
            validator: (value) => ['location', 'asset', 'job', 'test', 'owner', 'building', 'voltageLevel', 'bay'].includes(value)
        },
        size: {
            type: String,
            default: '20px',
            validator: (value) => ['14px', '16px', '20px', '24px', '32px'].includes(value)
        },
        badgeColor: {
            type: String,
            default: '4285f4'
        }
    },
    computed: {
        badgeIcon() {
            const icons = {
                location: 'fa-solid fa-location-dot',
                asset: 'fa-solid fa-gear',
                job: 'fa-solid fa-toolbox',
                test: 'fa-solid fa-file-lines',
                owner: 'fa-solid fa-location-crosshairs',
                building: 'fa-solid fa-building',
                voltageLevel: 'fa-solid fa-bolt-lightning',
                bay: 'fa-solid fa-bolt'
            }
            return icons[this.folderType] || 'fa-solid fa-location-dot'
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
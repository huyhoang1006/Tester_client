export default {
    methods: {
        showLocationRoot() {
            const locationRoot = this.$refs.locationRoot
            const ownerRoot = this.$refs.ownerRoot
            if (locationRoot) {
                locationRoot.style.borderBottom = '2px #aba7a7 solid' // Thêm viền màu đen dày 2px
                locationRoot.style.color = 'rgba(0, 0, 0, 1)' // Chữ rõ nét
            }
            if (ownerRoot) {
                ownerRoot.style.borderBottom = '2px #e6e4e4 solid'
                ownerRoot.style.color = 'rgba(0, 0, 0, 0.5)' // Chữ bị làm mờ nhưng border vẫn giữ nguyên
            }

            this.$nextTick(async () => {
                try {
                    let rs = await window.electronAPI.getParentOrganizationByMrid(this.$constant.ROOT)
                    if (rs.success) {
                        this.organisationClientList = [rs.data] || []
                    } else {
                        this.$message.error('Cannot load root organisation')
                    }
                } catch (error) {
                    this.$message.error('Error fetching root data')
                    console.error('Error fetching data:', error)
                }
            })
        },
    }
}
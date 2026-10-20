import * as demoAPI from '@/api/demo'

export default {
    methods: {
        async getOwnerLocation() {
            try {
                const res = await demoAPI.getOwnerOrganisation()
                // Máy chủ giờ trả về MẢNG tổ chức gốc: một tài khoản có thể được cấp phạm
                // vi ở nhiều tổ chức ngang hàng. Vẫn chấp nhận dạng cũ (một đối tượng) để
                // không vỡ khi chạy với bản máy chủ chưa cập nhật.
                const owners = Array.isArray(res) ? res : (res ? [res] : [])
                if (owners.length > 0) {
                    this.ownerServerList = owners.map((item) => {
                        return {
                            id: item.id || item.mrid || '',
                            name: item.name || '',
                            aliasName: item.shortName || item.name || item.aliasName || '',
                            parentName: '',
                            parentArr: [],
                            //mode: item.mode || '',
                            parentId: '',
                            mode: 'organisation',
                            mrid: item.mrid || item.id || ''
                        }
                    })
                } else {
                    this.ownerServerList = []
                    this.$message.warning('No owning organization data found.')
                }
            } catch (error) {
                this.$message.error('An error occurred while retrieving the list of owning organizations.')
                console.error('getOwnerLocation error:', error)
                this.ownerServerList = []
            }
        },
    }
}
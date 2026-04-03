import * as demoAPI from '@/api/demo'

export default {
    methods: {
        async getOwnerLocation() {
            try {
                const res = await demoAPI.getOwnerOrganisation()
                if (res !== null) {
                    this.ownerServerList = [res].map((item) => {
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
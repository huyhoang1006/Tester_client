import { removeTest } from '@/views/JobView/Common/removeTest'
import { getTestSyncStrategy } from '@/utils/testSync'
import { selectTestDto } from '@/utils/testSyncPayload'

export default {
    methods: {
        async handleDeleteFromContextMenu(node) {
            if (this.clientSlide && node.mode === 'test') {
                await this.deleteLocalTest(node)
                return
            }

            // Đặt node được chọn từ context menu vào selectedNodes để handleDeleteNode có thể sử dụng
            this.selectedNodes = [node]
            
            // Gọi handleDeleteNode để hiển thị confirm dialog và xử lý xóa
            await this.handleDeleteNode()
        },
        async deleteLocalTest(node) {
            try {
                const strategy = await getTestSyncStrategy(node.job)
                const response = await strategy.read(node.workMrid)
                if (!response.success) throw new Error(response.message || 'Unable to load the test job')

                const dto = strategy.local.JobEntityToDto(response.data)
                const test = dto.testList.find(item => item.mrid === node.mrid)
                if (!test) throw new Error('The selected test no longer exists')

                const oldEntity = strategy.local.jobDtoToEntity(dto)
                const removedDto = selectTestDto(dto, test.mrid, strategy.linkKey)
                if (!await removeTest(this.$confirm.bind(this), dto.testList, test, 'Delete')) return

                dto[strategy.linkKey] = (dto[strategy.linkKey] || []).filter(link => link.work_task_id !== test.mrid)
                for (const key of ['ctExcitationPoints', 'ctExcitationKneePoints', 'cbMotorCurrentPoints', 'cbTimingTraces']) {
                    if (!dto[key]) continue
                    dto[key] = Object.fromEntries(Object.entries(dto[key])
                        .filter(([id]) => !Object.prototype.hasOwnProperty.call(removedDto[key] || {}, id)))
                }

                const result = await strategy.write(oldEntity, strategy.local.jobDtoToEntity(dto))
                if (!result.success) throw new Error(result.message || 'Unable to delete the selected test')

                const asset = this.findNodeById(node.parentId, this.organisationClientList)
                if (asset && Array.isArray(asset.children)) {
                    this.$set(asset, 'children', asset.children.filter(child => child.mrid !== node.mrid))
                }
                const tabIndex = this.tabsClient.findIndex(tab => this.getTabKey(tab) === node.mrid)
                if (tabIndex !== -1) this.removeTabClient(tabIndex)
                this.selectedNodes = this.selectedNodes.filter(selected => selected.mrid !== node.mrid)
                this.$message.success('Test deleted successfully')
            } catch (error) {
                this.$message.error(error.message || 'Unable to delete the selected test')
            }
        }
    }
}

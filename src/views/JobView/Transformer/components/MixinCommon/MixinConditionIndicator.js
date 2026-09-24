import { calculateTransformerConditionIndicators } from '@/utils/transformerConditionIndicator'
import TransformerConditionIndicatorSettings from './TransformerConditionIndicatorSettings.vue'

export default {
    components: { TransformerConditionIndicatorSettings },
    methods: {
        calculateConditionIndicator() {
            if (typeof this.computeFields === 'function') this.computeFields()
            const result = calculateTransformerConditionIndicators(this.$options.name, this.testData)
            if (!result.supported) {
                this.$message.warning('Condition indicator calculation is not available for this test')
                return
            }
            if (!result.calculated) {
                this.$message.warning('Enter the required measurement values before calculating the condition indicator')
                return
            }
            this.$message.success(`Calculated condition indicator for ${result.calculated} row(s)`)
        }
    }
}

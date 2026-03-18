<template>
    <div style="width: 100%;">
        <div style="width: 100%;">
            <el-row :gutter="20">
                <el-col :span="12">
                    <div>
                        <div style="font-size: 12px;" class="bolder">Testing conditions</div>
                        <el-divider></el-divider>
                        <table style="width: 100%;">
                            <tr v-if="conditions.top_oil_temp">
                                <td class="condition-head">Top oil temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.top_oil_temp.value"
                                        @input="validatePositiveNumber($event, 'top_oil_temp')"
                                        @keydown="preventInvalidChars($event, 'positive')"
                                        @paste="handlePaste($event, 'positive')">
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.bottom_oil_temp">
                                <td class="condition-head">Bottom oil temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.bottom_oil_temp.value"
                                        @input="validatePositiveNumber($event, 'bottom_oil_temp')"
                                        @keydown="preventInvalidChars($event, 'positive')"
                                        @paste="handlePaste($event, 'positive')">
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.winding_temp">
                                <td class="condition-head">Winding temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.winding_temp.value"
                                        @input="validatePositiveNumber($event, 'winding_temp')"
                                        @keydown="preventInvalidChars($event, 'positive')"
                                        @paste="handlePaste($event, 'positive')" >
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.reference_temp">
                                <td class="condition-head">Reference temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.reference_temp.value"
                                        @input="validatePositiveNumber($event, 'reference_temp')"
                                        @keydown="preventInvalidChars($event, 'positive')"
                                        @paste="handlePaste($event, 'positive')" >
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.ambient_temp">
                                <td class="condition-head">Ambient temperature</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.ambient_temp.value"
                                        @input="validateNumber($event, 'ambient_temp')"
                                        @keydown="preventInvalidChars($event, 'number')"
                                        @paste="handlePaste($event, 'number')" >
                                        <template slot="append">°C</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.humidity">
                                <td class="condition-head">Humidity</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.humidity.value"
                                        @input="validatePositiveNumber($event, 'humidity')"
                                        @keydown="preventInvalidChars($event, 'positive')"
                                        @paste="handlePaste($event, 'positive')" >
                                        <template slot="append">%</template>
                                    </el-input>
                                </td>
                            </tr>
                            <tr v-if="conditions.weather">
                                <td class="condition-head">Weather</td>
                                <td>
                                    <el-input size="mini" v-model="conditions.weather.value"
                                        @input="validateText($event, 'weather')"
                                        @keydown="preventInvalidChars($event, 'text')"
                                        @paste="handlePaste($event, 'text')">>
                                    </el-input>
                                </td>
                            </tr>
                        </table>
                    </div>
                </el-col>
                <el-col :span="12">
                    <div>
                        <div style="font-size: 12px;" class="bolder">Comment </div>
                        <el-divider></el-divider>
                        <el-input type="textarea" rows="5" v-model="testConditions.comment"></el-input>
                        <Attachment :attachment_="attachment_" :title="title" height="120px"
                            @data-attachment="getDataAttachment">
                        </Attachment>
                        
                        
                    </div>

                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
/* eslint-disable */
import Attachment from '../Common/Attachment.vue';
import { UnitSymbol } from '@/views/Enum/UnitSymbol'
export default {
    components: {
        Attachment
    },
    name: "testInfomation",
    props: {
        title: String,
        data: {
            type: Object,
            require: true,
            default: () => ({})
        },
        attachment: [],
        assetData: {
            type: Object,
            default: () => ({})
        },
    },
    data() {
        return {
            attachment_: [],
            unitSymbol: UnitSymbol,
        }
    },
    methods: {
        getDataAttachment(arr) {
            this.attachment_ = arr
        },
        preventInvalidChars(event, type) {
            const char = String.fromCharCode(event.keyCode || event.which)
            const currentValue = event.target.value

            // Cho phép các phím điều khiển (Backspace, Delete, Tab, Enter, Arrow keys, etc.)
            const allowedKeys = [8, 9, 13, 27, 37, 38, 39, 40, 46] // Backspace, Tab, Enter, Esc, Arrows, Delete
            if (allowedKeys.includes(event.keyCode)) {
                return true
            }

            // Cho phép Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            if (event.ctrlKey && [65, 67, 86, 88].includes(event.keyCode)) {
                return true
            }

            if (type === 'positive') {
                // Chỉ cho phép số (0-9) và dấu chấm (.)
                if (!/[0-9.]/.test(char)) {
                    event.preventDefault()
                    return false
                }
                // Không cho phép nhiều hơn 1 dấu chấm
                if (char === '.' && currentValue.includes('.')) {
                    event.preventDefault()
                    return false
                }
            } else if (type === 'number') {
                // Cho phép số, dấu chấm và dấu trừ
                if (!/[0-9.-]/.test(char)) {
                    event.preventDefault()
                    return false
                }
                // Dấu trừ chỉ được phép ở đầu
                if (char === '-' && (currentValue.length > 0 || currentValue.includes('-'))) {
                    event.preventDefault()
                    return false
                }
                // Không cho phép nhiều hơn 1 dấu chấm
                if (char === '.' && currentValue.includes('.')) {
                    event.preventDefault()
                    return false
                }
            } else if (type === 'text') {
                // Chỉ cho phép chữ cái và khoảng trắng
                if (!/[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF]/.test(char)) {
                    event.preventDefault()
                    return false
                }
            }

            return true
        },
        handlePaste(event, type) {
            // Ngăn chặn paste mặc định
            event.preventDefault()

            // Lấy dữ liệu từ clipboard
            const pastedData = (event.clipboardData || window.clipboardData).getData('text')

            let cleanValue = pastedData

            if (type === 'positive') {
                // Chỉ giữ lại số và dấu chấm
                cleanValue = cleanValue.replace(/[^0-9.]/g, '')

                // Đảm bảo chỉ có một dấu chấm
                const parts = cleanValue.split('.')
                if (parts.length > 2) {
                    cleanValue = parts[0] + '.' + parts.slice(1).join('')
                }

                if (cleanValue.startsWith('.')) {
                    cleanValue = '0' + cleanValue
                }
            } else if (type === 'number') {
                // Giữ lại số, dấu chấm và dấu trừ
                cleanValue = cleanValue.replace(/[^0-9.-]/g, '')

                if (cleanValue.includes('-')) {
                    const isNegative = cleanValue.startsWith('-')
                    cleanValue = cleanValue.replace(/-/g, '')
                    if (isNegative) {
                        cleanValue = '-' + cleanValue
                    }
                }

                const parts = cleanValue.split('.')
                if (parts.length > 2) {
                    cleanValue = parts[0] + '.' + parts.slice(1).join('')
                }

                if (cleanValue.startsWith('.')) {
                    cleanValue = '0' + cleanValue
                } else if (cleanValue.startsWith('-.')) {
                    cleanValue = '-0' + cleanValue.substring(1)
                }
            } else if (type === 'text') {
                // Chỉ giữ lại chữ cái và khoảng trắng
                cleanValue = cleanValue.replace(/[^a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF]/g, '')
            }

            // Chèn giá trị đã clean vào input
            const input = event.target
            const start = input.selectionStart
            const end = input.selectionEnd
            const currentValue = input.value

            const newValue = currentValue.substring(0, start) + cleanValue + currentValue.substring(end)

            // Trigger input event để Vue cập nhật v-model
            input.value = newValue
            input.dispatchEvent(new Event('input', { bubbles: true }))
        },
        validatePositiveNumber(value, field) {
            // Sử dụng nextTick để đảm bảo DOM đã update
            this.$nextTick(() => {
                if (!this.conditions[field]) return

                let cleanValue = String(value || '')

                // Loại bỏ tất cả ký tự không phải số hoặc dấu chấm
                cleanValue = cleanValue.replace(/[^0-9.]/g, '')

                // Đảm bảo chỉ có một dấu chấm
                const parts = cleanValue.split('.')
                if (parts.length > 2) {
                    cleanValue = parts[0] + '.' + parts.slice(1).join('')
                }

                // Không cho phép bắt đầu bằng dấu chấm
                if (cleanValue.startsWith('.')) {
                    cleanValue = '0' + cleanValue
                }

                // Loại bỏ các số 0 thừa ở đầu (trừ trường hợp 0.xxx)
                if (cleanValue.length > 1 && cleanValue.startsWith('0') && !cleanValue.startsWith('0.')) {
                    cleanValue = cleanValue.replace(/^0+/, '') || '0'
                }

                // Update giá trị nếu có thay đổi
                if (this.conditions[field].value !== cleanValue) {
                    this.conditions[field].value = cleanValue
                }
            })
        },
        validateNumber(value, field) {
            // Sử dụng nextTick để đảm bảo DOM đã update
            this.$nextTick(() => {
                let cleanValue = value

                // Loại bỏ ký tự không hợp lệ, giữ lại dấu trừ và số
                cleanValue = cleanValue.replace(/[^0-9.-]/g, '')

                // Đảm bảo dấu trừ chỉ ở đầu
                if (cleanValue.includes('-')) {
                    const isNegative = cleanValue.startsWith('-')
                    cleanValue = cleanValue.replace(/-/g, '')
                    if (isNegative) {
                        cleanValue = '-' + cleanValue
                    }
                }

                // Đảm bảo chỉ có một dấu chấm
                const parts = cleanValue.split('.')
                if (parts.length > 2) {
                    cleanValue = parts[0] + '.' + parts.slice(1).join('')
                }

                // Không cho phép bắt đầu bằng dấu chấm (trừ khi có dấu trừ)
                if (cleanValue.startsWith('.')) {
                    cleanValue = '0' + cleanValue
                } else if (cleanValue.startsWith('-.')) {
                    cleanValue = '-0' + cleanValue.substring(1)
                }

                // Update giá trị nếu có thay đổi
                if (this.conditions[field].value !== cleanValue) {
                    this.conditions[field].value = cleanValue
                }
            })
        },
        validateText(value, field) {
            // Sử dụng nextTick để đảm bảo DOM đã update
            this.$nextTick(() => {
                // Chỉ cho phép chữ cái, khoảng trắng và một số ký tự đặc biệt thông dụng
                const cleanValue = value.replace(/[^a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF]/g, '')

                // Update giá trị nếu có thay đổi
                if (this.conditions[field].value !== cleanValue) {
                    this.conditions[field].value = cleanValue
                }
            })
        },
    },
    computed: {
        conditions: function () {
            return this.data.condition || {}
        },
        testConditions: function () {
            return this.data
        },

    },
    watch: {
        attachment: {
            immediate: true,
            deep: true,
            handler: function () {
                this.attachment_ = this.attachment
            }
        }
    }
}
</script>
<style scoped>
.condition-head {
    min-width: fit-content;
    width: 60%;
}

.margin-side {
    margin-top: 8%;
}

.margin-bot {
    margin-bottom: 3%;
}

.last-right-parent {
    position: relative;
    float: right;
}

td,
th {
    font-size: 12px;
}
</style>

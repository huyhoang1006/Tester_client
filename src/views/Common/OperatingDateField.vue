<template>
    <el-form-item label="Operating Date" class="operating-date-field">
        <div class="operating-date-control">
            <el-select
                v-model="day"
                class="od-part"
                allow-create
                filterable
                :reserve-keyword="false"
                placeholder="Day"
                @change="syncDate"
            >
                <el-option v-for="value in days" :key="value" :label="value" :value="value"></el-option>
            </el-select>
            <el-select
                v-model="month"
                class="od-part"
                allow-create
                filterable
                :reserve-keyword="false"
                placeholder="Month"
                @change="syncDate"
            >
                <el-option v-for="value in months" :key="value" :label="value" :value="value"></el-option>
            </el-select>
            <el-select
                v-model="year"
                class="od-part"
                allow-create
                filterable
                :reserve-keyword="false"
                placeholder="Year"
                @change="syncDate"
            >
                <el-option v-for="value in years" :key="value" :label="value" :value="value"></el-option>
            </el-select>
        </div>
    </el-form-item>
</template>

<script>
const pad = (value) => String(value).padStart(2, '0')

export default {
    name: 'OperatingDateField',
    props: {
        properties: {
            type: Object,
            required: true
        }
    },
    data() {
        const currentYear = new Date().getFullYear()
        return {
            day: '',
            month: '',
            year: '',
            days: Array.from({ length: 31 }, (_, index) => pad(index + 1)),
            months: Array.from({ length: 12 }, (_, index) => pad(index + 1)),
            years: Array.from({ length: 151 }, (_, index) => String(currentYear + 20 - index))
        }
    },
    computed: {
        operatingDate() {
            return this.properties.operating_date || ''
        }
    },
    watch: {
        operatingDate: {
            immediate: true,
            handler(value) {
                this.loadDate(value)
            }
        }
    },
    methods: {
        loadDate(value) {
            if (!value) {
                this.day = ''
                this.month = ''
                this.year = ''
                return
            }
            const match = String(value).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
            if (!match) return
            this.year = match[1]
            this.month = pad(match[2])
            this.day = pad(match[3])
        },
        syncDate() {
            if (!this.day && !this.month && !this.year) {
                this.$set(this.properties, 'operating_date', '')
                return
            }
            if (!this.day || !this.month || !this.year) return

            const year = Number(this.year)
            const month = Number(this.month)
            const day = Number(this.day)
            const maxDay = new Date(year, month, 0).getDate()
            if (!Number.isInteger(year) || year < 1 || month < 1 || month > 12 || day < 1 || day > maxDay) {
                return
            }
            this.$set(this.properties, 'operating_date', `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`)
        }
    }
}
</script>

<style scoped>
/* Dùng flex-wrap chứ không dùng grid + @media.
 *
 * @media đo BỀ RỘNG CỬA SỔ, mà ô này lại nằm trong cột trái của form — bảng
 * Object Properties bên phải mở ra là cột trái hẹp đi trong khi cửa sổ vẫn rộng,
 * nên media query không bao giờ khớp và ba ô cứ chen nhau trên một dòng.
 * flex-wrap thì xuống dòng theo chỗ trống THẬT của khung chứa: 3 ô -> 2 ô -> 1 ô.
 */
.operating-date-control {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    width: 100%;
}

/* flex-basis là ngưỡng xuống dòng: hẹp hơn mức này thì ô bị đẩy xuống hàng dưới.
 * min-width: 0 để ô co được thật sự — mặc định flex item không co nhỏ hơn nội dung.
 */
.operating-date-control .od-part {
    flex: 1 1 88px;
    min-width: 0;
}

.operating-date-control .od-part,
.operating-date-control >>> .el-select,
.operating-date-control >>> .el-input,
.operating-date-control >>> .el-input__inner {
    width: 100%;
}
</style>

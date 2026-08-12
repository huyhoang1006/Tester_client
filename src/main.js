import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import '@/assets/scss/element-variables.scss'
import locale from 'element-ui/lib/locale/lang/en'
import * as config from '@/utils/config'
import * as common from '@/utils/common'
import * as helper from '@/utils/helper'
import constant from '@/utils/constant'
import client from '@/utils/client'
import uuid from '@/utils/uuid'
import {LoadingPlugin} from 'vue-loading-overlay';
import CustomInput from '@/views/Common/CustomInput.vue'
import AssessmentResultLabel from '@/views/JobView/Common/AssessmentResultLabel.vue'
import radioClearable from '@/directives/radioClearable'


// element ui
Vue.config.productionTip = false

// Mọi el-select đều cho xoá lựa chọn (nút ✕), khỏi phải thêm clearable ở 464 chỗ.
// PHẢI đặt TRƯỚC Vue.use: sau đó Vue đã normalize props, gán đè object mới sẽ
// không có tác dụng nữa. Element khai báo `clearable: Boolean` nên đổi sang dạng
// object có default.
if (ElementUI.Select && ElementUI.Select.props) {
    const clearableProp = ElementUI.Select.props.clearable
    if (typeof clearableProp === 'function') {
        ElementUI.Select.props.clearable = { type: Boolean, default: true }
    } else if (clearableProp && typeof clearableProp === 'object') {
        clearableProp.default = true
    }
}

Vue.use(ElementUI, { locale })
Vue.component('ElInput', CustomInput)

// Nhãn kết luận trong bảng Assessment settings — dùng ở 43 component test.
// Đăng ký toàn cục để khỏi phải import lặp ở từng file.
Vue.component('AssessmentResultLabel', AssessmentResultLabel)

// Bấm lại radio đang chọn để bỏ chọn (dùng ở form nhập liệu AssetView/JobView)
Vue.directive('radio-clearable', radioClearable)

// check login
helper.initApp()

Vue.prototype.$config = config
Vue.prototype.$common = common
Vue.prototype.$constant = constant
Vue.prototype.$helper = helper
Vue.prototype.$client = client
Vue.prototype.$uuid = uuid

const app = new Vue({
    router,
    store,
    LoadingPlugin,
    render: h => h(App)
})
app.$mount('#app')

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


// element ui
Vue.config.productionTip = false
Vue.use(ElementUI, { locale })

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

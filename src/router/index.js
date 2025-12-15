/* eslint-disable */
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import Layout from '@/layout'
import LoginView from '@/views/LoginView'
import OnlineMonitoringDataView from '@/views/OnlineMonitoringDataView'
import TreeNavigation from '@/views/TreeNode/treeNavigation.vue'
Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        component: Layout,
        redirect: { name: 'home' },
        children: [
            {
                path: '/home',
                name: 'home',
                meta: { title: 'Home' },
                component: TreeNavigation
            },
            {
                path: '/login',
                name: 'login',
                meta: { title: 'Login' },
                component: LoginView
            },
            {
                path: '/online-monitoring-data',
                name: 'online-monitoring-data',
                meta: { title: 'Online Monitoring Data' },
                component: OnlineMonitoringDataView
            }
        ]
    }
]

const router = new VueRouter({
    mode: process.env.IS_ELECTRON ? 'hash' : 'history',
    base: process.env.BASE_URL,
    routes
})

router.beforeEach(async (to, from, next) => {

    const isAuthenticated = store.state.isAuthenticated

    if (isAuthenticated) {
        if (to.path === '/login') {
            next({ path: '/' })
        } else {
            if (from.path === '/manage' && to.path === '/home') {
                store.dispatch('setSelectedLocation', [])
                store.dispatch('setSelectedAsset', [])
                store.dispatch('setSelectedJob', [])
            }
            next()
        }
    } else {
        if (['/login', '/signup'].indexOf(to.path) !== -1) {
            next()
        } else {
            next(`/login?redirect=${to.path}`)
        }
    }
})

router.beforeEach((to, from, next) => {
    if (to.path) {
    }
    next()
});

router.afterEach(() => {
});

export default router

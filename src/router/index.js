/* eslint-disable */
import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import Layout from '@/layout'
import HomeView from '@/views/HomeView'
import Synchronize from '@/views/Synchronize'
import ManageView from '@/views/ManageView'
import LoginView from '@/views/LoginView'
import LocationView from '@/views/LocationView'
import AssetView from '@/views/AssetView/Transformer'
import JobView from '@/views/JobView/Transformer'
import ManageUserView from '@/views/ManageUserView'
import DashboardView from '@/views/DashboardView'
import FmecaView from '@/views/FmecaView'
import OnlineMonitoringDataView from '@/views/OnlineMonitoringDataView'
import loader from "@/utils/preload"
import AssetChoosen from "@/views/AssetView/Property/propertyMain"
import circuitBreaker from "@/views/AssetView/CircuitBreaker"
import JobViewCircuitBreaker from '@/views/JobView/CircuitBreaker'
import JobViewCurrentTrans from '@/views/JobView/CurrentTrans'
import currentTransformer from '@/views/AssetView/CurrentTransformer'
import voltageTransformer from '@/views/AssetView/VoltageTransformer'
import JobViewVoltageTrans from '@/views/JobView/VoltageTransformer'
import disconnector from '@/views/AssetView/Disconnector'
import surgeArrester from '@/views/AssetView/SurgeArrester'
import powerCable from '@/views/AssetView/PowerCable'
import JobViewDisconnector from '@/views/JobView/Disconnector'
import JobViewPowerCable from '@/views/JobView/PowerCable'
import JobViewSurgeArrester from '@/views/JobView/SurgeArrester'
import OwnerView from '@/views/OwnerView'
import locationInsertView from '@/views/LocationView'
import TreeNavigation from '@/views/TreeNode/treeNavigation.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        component: Layout,
        redirect: {name: 'home'},
        children: [
            // {
            //     path: '/home',
            //     name: 'home',
            //     meta: {title: 'Home'},
            //     component: HomeView
            // },
            {
                path: '/synchronize',
                name: 'synchronize',
                meta: {title: 'Synchronize'},
                component: Synchronize
            },
            {
                path: '/fmeca',
                name: 'fmeca',
                meta: { title: 'FMECA' },
                component: FmecaView,
            },
            // {
            //     path: '/manage',
            //     name: 'manage',
            //     meta: {title: 'Database manage'},
            //     component: ManageView
            // },
            {
                path: '/home',
                name: 'home',
                meta: {title: 'Home'},
                component: TreeNavigation
            },
            {
                path: '/login',
                name: 'login',
                meta: {title: 'Login'},
                component: LoginView
            },
            {
                path: '/location',
                name: 'location',
                meta: {title: 'Location'},
                component: LocationView
            },
            {
                path: '/property',
                name: 'property',
                meta: {title: 'Asset'},
                component: AssetChoosen
            },
            {
                path: '/circuit',
                name: 'circuit',
                meta: {title: 'Circuit breaker'},
                component: circuitBreaker
            },
            {
                path: '/currentTrans',
                name: 'currentTrans',
                meta: {title: 'Current Transformer'},
                component: currentTransformer
            },
            {
                path: '/voltageTrans',
                name: 'voltageTrans',
                meta: {title: 'Voltage Transformer'},
                component: voltageTransformer
            },
            {
                path: '/disconnector',
                name: 'disconnector',
                meta: {title: 'Disconnector'},
                component: disconnector
            },
            {
                path: '/surgeArrester',
                name: 'surgeArrester',
                meta: {title: 'Surge Arrester'},
                component: surgeArrester
            },
            {
                path: '/powerCable',
                name: 'powerCable',
                meta: {title: 'Power Cable'},
                component: powerCable
            },
            {
                path: '/asset',
                name: 'asset',
                meta: {title: 'Asset'},
                component: AssetView
            },
            {
                path: '/job',
                name: 'job',
                meta: {title: 'Job'},
                component: JobView
            },
            {
                path: '/jobCircuit',
                name: 'jobCircuit',
                meta: {title: 'Job'},
                component: JobViewCircuitBreaker
            },
            {
                path: '/jobCurrent',
                name: 'jobCurrent',
                meta: {title: 'Job'},
                component: JobViewCurrentTrans
            },
            {
                path: '/jobVoltage',
                name: 'jobVoltage',
                meta: {title: 'Job'},
                component: JobViewVoltageTrans
            },
            {
                path: '/jobPower',
                name: 'jobPower',
                meta: {title: 'Job'},
                component: JobViewPowerCable
            },
            {
                path: '/jobDisconnect',
                name: 'jobDisconnect',
                meta: {title: 'Job'},
                component: JobViewDisconnector
            },
            {
                path: '/jobSurgeArrester',
                name: 'jobSurgeArrester',
                meta: {title: 'Job'},
                component: JobViewSurgeArrester
            },
            {
                path: '/manage-user',
                name: 'manage-user',
                meta: {title: 'Manage User'},
                component: ManageUserView
            },
            {
                path: '/dashboard',
                name: 'dashboard',
                meta: {title: 'Dashboard'},
                component: DashboardView
            },
            {
                path: '/online-monitoring-data',
                name: 'online-monitoring-data',
                meta: {title: 'Online Monitoring Data'},
                component: OnlineMonitoringDataView
            },
            {
                path: '/owner',
                name: 'owner',
                meta: {title: 'Owner'},
                component: OwnerView
            },
            {
                path: '/locationInsert',
                name: 'locationInsert',
                meta: {title: 'Location Insert'},
                component: locationInsertView
            }
        ]
    }
]

const router = new VueRouter({
    mode: process.env.IS_ELECTRON ? 'hash' : 'history',
    base: process.env.BASE_URL,
    routes
})

// const devBypass = true

router.beforeEach(async (to, from, next) => {

    // if (devBypass) {
    //     store.commit('setAuth', true)
    //     if (to.path === '/login') {
    //         next('/home')
    //     } else {
    //         next()
    //     }
    //     return
    // }

    const isAuthenticated = store.state.isAuthenticated

    if (isAuthenticated) {
        if (to.path === '/login') {
            next({path: '/'})
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
    if(to.path) {
        loader.loaderStart()
    }
    next()
});

router.afterEach(() => {
    loader.loaderEnd()
});

export default router

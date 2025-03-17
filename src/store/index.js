import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        isAuthenticated: false,
        token: null,
        role: null,
        user: null,
        serverAddr: '',
        selectedLocation: [],
        selectedAsset: [],
        selectedJob: [],
        selectedLocationSync: [],
        selectedAssetSync: [],
        selectedJobSync: []
    },
    getters: {
        getUser(state) {
            return state.user
        },
        getSelectedLocation(state) {
            return state.selectedLocation
        },
        getSelectedAsset(state) {
            return state.selectedAsset
        },
        getSelectedJob(state) {
            return state.selectedJob
        },
        getSelectedLocationSync(state) {
            return state.selectedLocationSync
        },
        getSelectedAssetSync(state) {
            return state.selectedAssetSync
        },
        getSelectedJobSync(state) {
            return state.selectedJobSync
        },
        getIsAuthenticated(state) {
            return state.isAuthenticated
        },
        getToken(state) {
            return state.token
        },
        getRole(state) {
            return state.role
        },
        getServerAddr(state) {
            return state.serverAddr
        },
    },
    mutations: {
        SET_USER(state, user) {
            if (user !== null) {
                state.user = { ...user }
            } else {
                state.user = null
            }
        },
        SET_SELECTED_LOCATION(state, selectedLocation) {
            state.selectedLocation = [...selectedLocation]
        },
        SET_SELECTED_ASSET(state, selectedAsset) {
            state.selectedAsset = [...selectedAsset]
        },
        SET_SELECTED_JOB(state, selectedJob) {
            state.selectedJob = [...selectedJob]
        },
        SET_SELECTED_LOCATION_SYNC(state, selectedLocationSync) {
            state.selectedLocationSync = [...selectedLocationSync]
        },
        SET_SELECTED_ASSET_SYNC(state, selectedAssetSync) {
            state.selectedAssetSync = [...selectedAssetSync]
        },
        SET_SELECTED_JOB_SYNC(state, selectedJobSync) {
            state.selectedJobSync = [...selectedJobSync]
        },
        SET_IS_AUTHENTICATED(state, isAuthenticated) {
            state.isAuthenticated = isAuthenticated
        },
        SET_TOKEN(state, token) {
            state.token = token
        },
        SET_ROLE(state, role) {
            state.role = role
        },
        SET_SERVER_ADDR(state, serverAddr) {
            state.serverAddr = serverAddr
        }
    },
    actions: {
        removeUser({ commit }) {
            commit('SET_USER', null)
        },
        setUser({ commit }, user) {
            commit('SET_USER', user)
        },
        setSelectedLocation({ commit }, selectedLocation) {
            commit('SET_SELECTED_LOCATION', selectedLocation)
        },
        setSelectedAsset({ commit }, selectedAsset) {
            commit('SET_SELECTED_ASSET', selectedAsset)
        },
        setSelectedJob({ commit }, selectedJob) {
            commit('SET_SELECTED_JOB', selectedJob)
        },
        setSelectedLocationSync({ commit }, selectedLocationSync) {
            commit('SET_SELECTED_LOCATION_SYNC', selectedLocationSync)
        },
        setSelectedAssetSync({ commit }, selectedAssetSync) {
            commit('SET_SELECTED_ASSET_SYNC', selectedAssetSync)
        },
        setSelectedJobSync({ commit }, selectedJobSync) {
            commit('SET_SELECTED_JOB_SYNC', selectedJobSync)
        },
        setIsAuthenticated({ commit }, isAuthenticated) {
            commit('SET_IS_AUTHENTICATED', isAuthenticated)
        },
        setToken({ commit }, token) {
            commit('SET_TOKEN', token)
        },
        setRole({ commit }, role) {
            commit('SET_ROLE', role)
        },
        setServerAddr({ commit }, serverAddr) {
            commit('SET_SERVER_ADDR', serverAddr)
        }
    },
    modules: {}
})
